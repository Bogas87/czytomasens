export type PersistedAppState = {
  screen?: string;
  mode?: "soft" | "hard";
  path?: string | null;
  selectedPath?: string | null;
  step?: number;
  answers?: Array<{ q: string; a: string }>;
  aiInterview?: Array<{ ai: string; user: string }>;
  probeData?: { observation: string; question: string } | null;
  previewData?: {
    headline?: string;
    subheadline?: string;
    previewLine?: string;
    tensionPercent?: number;
    driftPercent?: number;
    rebuildPercent?: number;
    sections?: Array<{ title: string; text: string; tone?: "normal" | "gold" | "danger" }>;
  } | null;
  email?: string;
  currentUserText?: string;
  acceptedConsents?: boolean[];
  noRefundConsent?: boolean;
  sessionToken?: string;
  paymentStatus?: "idle" | "pending" | "paid" | "failed";
};

const SESSION_ID_KEY = "ctms_id";
const CONSENT_KEY = "ctms_consents";
const APP_STATE_KEY = "ctms_app_state";

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export function getSessionId() {
  const existing = localStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;
  const next = `ctms_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  localStorage.setItem(SESSION_ID_KEY, next);
  return next;
}

export function getConsentState() {
  return safeRead<boolean>(CONSENT_KEY, false);
}

export function saveConsentState(value: boolean) {
  safeWrite(CONSENT_KEY, value);
}

export function getAppState(): PersistedAppState | null {
  return safeRead<PersistedAppState | null>(APP_STATE_KEY, null);
}

export function saveAppState(value: PersistedAppState) {
  safeWrite(APP_STATE_KEY, value);
}

export function clearAppState() {
  try {
    localStorage.removeItem(APP_STATE_KEY);
  } catch {}
}
