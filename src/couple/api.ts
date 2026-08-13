import type { CoupleState, ShareSummary, TurnCoach } from "./types";

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

const API_BASE = readApiBase();

async function requestJson<T>(url: string, options: RequestInit = {}, timeoutMs = 60000): Promise<T> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {}),
      },
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data?.error || data?.message || `Błąd ${response.status}`);
    return data as T;
  } finally {
    window.clearTimeout(timer);
  }
}

function request<T>(path: string, options: RequestInit = {}, timeoutMs = 60000): Promise<T> {
  return requestJson<T>(`${API_BASE}/api/couple${path}`, options, timeoutMs);
}

export async function createCouple(displayName: string, consentAcceptedAt: string) {
  return request<{ ok: true; pairId: string; participantToken: string; inviteCode: string; state: CoupleState }>("/create", {
    method: "POST",
    body: JSON.stringify({
      displayName,
      consentAcceptedAt,
      consentVersion: "2026-08-12-couple-v2",
      analysisConsent: true,
      sensitiveDataConsent: true,
    }),
  });
}

export async function joinCouple(inviteCode: string, displayName: string, consentAcceptedAt: string) {
  return request<{ ok: true; pairId: string; participantToken: string; state: CoupleState }>("/join", {
    method: "POST",
    body: JSON.stringify({
      inviteCode,
      displayName,
      consentAcceptedAt,
      consentVersion: "2026-08-12-couple-v2",
      analysisConsent: true,
      sensitiveDataConsent: true,
    }),
  });
}

export async function fetchCoupleState(participantToken: string) {
  const data = await request<{ ok: true; state: CoupleState }>(`/state/${encodeURIComponent(participantToken)}`);
  return data.state;
}

export async function submitCoupleAnswer(payload: {
  participantToken: string;
  questionId: string;
  question: string;
  answer: unknown;
  phase?: string;
}): Promise<{ state: CoupleState; coach: TurnCoach | null }> {
  return request("/answer", { method: "POST", body: JSON.stringify(payload) }, 30000);
}

export async function completeCoupleIntake(participantToken: string) {
  const data = await request<{ ok: true; state: CoupleState }>("/intake/complete", {
    method: "POST",
    body: JSON.stringify({ participantToken }),
  }, 90000);
  return data.state;
}

export async function approveCoupleShare(participantToken: string, share: ShareSummary) {
  const data = await request<{ ok: true; state: CoupleState }>("/share/approve", {
    method: "POST",
    body: JSON.stringify({ participantToken, share }),
  }, 90000);
  return data.state;
}

export async function submitCrossReflection(participantToken: string, input: Record<string, string>) {
  const data = await request<{ ok: true; state: CoupleState }>("/reflection", {
    method: "POST",
    body: JSON.stringify({ participantToken, input }),
  }, 90000);
  return data.state;
}

export async function acceptCoupleExperiment(participantToken: string, experimentId: string, accepted: boolean) {
  const data = await request<{ ok: true; state: CoupleState }>("/experiment/accept", {
    method: "POST",
    body: JSON.stringify({ participantToken, experimentId, accepted }),
  });
  return data.state;
}

export async function submitExperimentCheckin(participantToken: string, experimentId: string, input: Record<string, string>) {
  const data = await request<{ ok: true; state: CoupleState }>("/experiment/checkin", {
    method: "POST",
    body: JSON.stringify({ participantToken, experimentId, input }),
  }, 90000);
  return data.state;
}

export async function createCoupleCheckout(payload: {
  billingSessionId: string;
  email: string;
  consentAcceptedAt: string;
}) {
  return requestJson<{ ok: true; checkoutUrl?: string; url?: string; amountGr: number }>(`${API_BASE}/api/create-checkout`, {
    method: "POST",
    body: JSON.stringify({
      token: payload.billingSessionId,
      email: payload.email,
      consentAccepted: true,
      consentAcceptedAt: payload.consentAcceptedAt,
      consentVersion: "2026-07-31",
    }),
  }, 30000);
}
