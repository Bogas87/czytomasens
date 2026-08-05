
import type {
  AnalysisInput,
  BoundaryDraft,
  ReturnCase,
  SessionState,
  V3CaseModel,
  V3FullReport,
  V3Mirror,
  V3Preview,
} from "./types";
import type { EntryKey } from "./data/paths";

function readApiBase(): string {
  try {
    const env = typeof import.meta !== "undefined" ? (import.meta as any)?.env : undefined;
    const value = env?.VITE_API_BASE;
    if (typeof value === "string" && value.startsWith("http")) return value.replace(/\/$/, "");
  } catch {}
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
    return "https://czytomasens-production-47e0.up.railway.app";
  }
  return "http://localhost:8080";
}

export const API_BASE = readApiBase();

async function jsonRequest<T>(url: string, options: RequestInit = {}, timeoutMs = 45000): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(
    () => controller.abort(new DOMException("Przekroczono czas oczekiwania", "TimeoutError")),
    timeoutMs
  );
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
      cache: "no-store",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data?.error || data?.message || `Błąd ${response.status}`);
      (error as any).status = response.status;
      (error as any).payload = data;
      throw error;
    }
    return data as T;
  } catch (error: any) {
    const aborted =
      controller.signal.aborted
      || error?.name === "AbortError"
      || error?.name === "TimeoutError"
      || /aborted|timeout/i.test(String(error?.message || ""));
    if (aborted) {
      throw new Error(
        "Przygotowanie wyniku przekroczyło bezpieczny czas oczekiwania. Twoje odpowiedzi są zapisane — wróć i uruchom analizę ponownie."
      );
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function startV3Session(path: EntryKey): Promise<SessionState> {
  const data = await jsonRequest<{ ok: true; sessionToken: string; recoveryToken: string; caseId: string }>(
    `${API_BASE}/api/v3/session/start`,
    {
      method: "POST",
      body: JSON.stringify({ path }),
    }
  );
  return {
    sessionToken: data.sessionToken,
    recoveryToken: data.recoveryToken,
    caseId: data.caseId,
  };
}

export async function requestMirror(payload: {
  sessionToken: string;
  path: EntryKey;
  answers: Array<{ question: string; answer: string; score: number }>;
}): Promise<V3Mirror> {
  const data = await jsonRequest<{ ok: true; mirror: V3Mirror }>(
    `${API_BASE}/api/v3/mirror`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    30000
  );
  return data.mirror;
}

export async function requestInterviewQuestion(payload: {
  sessionToken: string;
  path: EntryKey;
  step: number;
  answers: Array<{ question: string; answer: string; score: number }>;
  context: Record<string, unknown>;
  history: Array<{ question: string; answer: string; focus: string }>;
}): Promise<{ question: string; focus: string; observation: string; finished: boolean }> {
  const data = await jsonRequest<{
    ok: true;
    question: string;
    focus: string;
    observation: string;
    finished: boolean;
  }>(`${API_BASE}/api/v3/interview/next`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, 35000);
  return data;
}

export async function analyzeV3(payload: {
  sessionToken: string;
  input: AnalysisInput;
}): Promise<{ preview: V3Preview; caseModel: V3CaseModel; caseId: string }> {
  const data = await jsonRequest<{
    ok: true;
    preview: V3Preview;
    caseModel: V3CaseModel;
    caseId: string;
  }>(`${API_BASE}/api/v3/analyze`, {
    method: "POST",
    body: JSON.stringify(payload),
  }, 30000);
  return data;
}

export async function saveBoundaries(payload: {
  sessionToken: string;
  boundaries: BoundaryDraft;
}): Promise<void> {
  await jsonRequest(`${API_BASE}/api/v3/boundaries`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function updateLegacySession(payload: Record<string, unknown>): Promise<void> {
  await jsonRequest(`${API_BASE}/api/session/update`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function createCheckout(
  token: string,
  email: string,
  consentAcceptedAt: string
): Promise<{ url: string }> {
  return jsonRequest(`${API_BASE}/api/create-checkout`, {
    method: "POST",
    body: JSON.stringify({
      token,
      email,
      consentAccepted: true,
      consentAcceptedAt,
      consentVersion: "2026-08-05-v3",
      payload: { analysisVersion: "3.0" },
    }),
  });
}

function temporaryReportStatus(status: number): boolean {
  return [202, 402, 404, 409, 425].includes(status);
}

export async function fetchSignedReport(
  token: string,
  exp: string,
  sig: string
): Promise<V3FullReport | Record<string, unknown>> {
  let lastMessage = "Raport nie jest jeszcze dostępny.";
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(
        `${API_BASE}/api/report/signed?token=${encodeURIComponent(token)}&exp=${encodeURIComponent(exp)}&sig=${encodeURIComponent(sig)}`,
        { headers: { Accept: "application/json" }, cache: "no-store" }
      );
      const data = await response.json().catch(() => ({}));
      if (response.ok && data?.report) return data.report;
      lastMessage = data?.message || data?.error || lastMessage;
      if (!temporaryReportStatus(response.status)) throw new Error(lastMessage);
    } catch (error) {
      if (attempt >= 59) throw error;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 3000));
  }
  throw new Error(lastMessage);
}

export async function startRealityProtocol(payload: {
  sessionToken: string;
  report: V3FullReport;
}): Promise<{ recoveryUrl: string; recoveryToken: string; dueAt: string; protocolId: string }> {
  const data = await jsonRequest<{
    ok: true;
    recoveryUrl: string;
    recoveryToken: string;
    dueAt: string;
    protocolId: string;
  }>(`${API_BASE}/api/v3/protocol/start`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data;
}

export async function recoverV3(token: string): Promise<ReturnCase> {
  const data = await jsonRequest<{ ok: true; case: ReturnCase }>(
    `${API_BASE}/api/v3/return/${encodeURIComponent(token)}`
  );
  return data.case;
}

export async function submitProtocolCheckin(payload: {
  recoveryToken: string;
  protocolId: string;
  result: {
    whatHappened: string;
    initiative: string;
    repeatedPattern: string;
    userCost: string;
    unusualCircumstances: string;
  };
}): Promise<ReturnCase> {
  const data = await jsonRequest<{ ok: true; case: ReturnCase }>(
    `${API_BASE}/api/v3/checkin/protocol`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    90000
  );
  return data.case;
}

export async function submitWeeklyCheckin(payload: {
  recoveryToken: string;
  input: {
    concreteEvent: string;
    repeatedPattern: string;
    realChange: string;
    energyCost: string;
  };
}): Promise<ReturnCase> {
  const data = await jsonRequest<{ ok: true; case: ReturnCase }>(
    `${API_BASE}/api/v3/checkin/weekly`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    90000
  );
  return data.case;
}

export async function deleteV3Case(recoveryToken: string): Promise<void> {
  await jsonRequest(`${API_BASE}/api/v3/case`, {
    method: "DELETE",
    body: JSON.stringify({ recoveryToken }),
  });
}

export async function trackV3Event(payload: {
  caseId?: string | null;
  name: string;
  properties?: Record<string, unknown>;
}): Promise<void> {
  try {
    await fetch(`${API_BASE}/api/v3/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  } catch {
    // Analityka nie może blokować analizy.
  }
}
