export type PersistedAppState = {
  screen?: string;
  mode?: "soft" | "hard";
  selectedPath?: string;
  step?: number;
  answers?: Array<{
    questionId: number;
    text: string;
    tags: string[];
  }>;
  interviews?: Array<{
    aiPrompt: string;
    userText: string;
  }>;
  sessionToken?: string;
  preview?: any;
  email?: string;
  currentAiObservation?: string;
  currentUserText?: string;
  patterns?: string[];
};

const SESSION_ID_KEY = "ctms_id";
const PATTERNS_KEY = "ctms_patterns";
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
  } catch {
    // ignore
  }
}

export function getSessionId() {
  const existing = localStorage.getItem(SESSION_ID_KEY);
  if (existing) return existing;

  const next = `ctms_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  localStorage.setItem(SESSION_ID_KEY, next);
  return next;
}

export function getPatterns(): string[] {
  return safeRead<string[]>(PATTERNS_KEY, []);
}

export function savePatterns(patterns: string[]) {
  safeWrite(PATTERNS_KEY, patterns);
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
  } catch {
    // ignore
  }
}
