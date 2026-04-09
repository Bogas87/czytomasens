export const getSessionId = (): string => {
  let id = localStorage.getItem("ctms_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("ctms_id", id);
  }
  return id;
};

export const savePatterns = (patterns: string[]): void => {
  localStorage.setItem("ctms_patterns", JSON.stringify(patterns));
};

export const getPatterns = (): string[] => {
  const data = localStorage.getItem("ctms_patterns");
  if (!data) return [];

  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveConsentState = (accepted: boolean): void => {
  localStorage.setItem("ctms_consents", accepted ? "1" : "0");
};

export const getConsentState = (): boolean => {
  return localStorage.getItem("ctms_consents") === "1";
};
