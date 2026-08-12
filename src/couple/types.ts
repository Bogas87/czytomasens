export type CoupleSlot = "A" | "B";
export type CoupleStatus =
  | "WAITING_PARTNER"
  | "INTAKE"
  | "REVIEW_SHARE"
  | "WAITING_SHARE"
  | "CROSS_REFLECTION"
  | "JOINT_REPORT"
  | "EXPERIMENT_PROPOSED"
  | "EXPERIMENT_ACTIVE"
  | "FOLLOWUP_COMPLETE"
  | "SAFETY_STOP";

export type NarrativeFlag = {
  type: string;
  level: "low" | "medium" | "high";
  observation: string;
  question: string;
};

export type ShareSummary = {
  summary: string;
  whatISee: string;
  whatMatters: string;
  whatINeed: string;
  whatIDontKnow: string;
};

export type TurnCoach = {
  accepted: boolean;
  neutralReflection: string;
  groundingIssue: string;
  followUpQuestion: string;
  shouldFollowUp: boolean;
  flags: NarrativeFlag[];
  safety: {
    level: "clear" | "elevated" | "high";
    signals: string[];
    protocolAllowed: boolean;
  };
};

export type PerspectivePrivate = {
  summary: string;
  narrativeFlags: NarrativeFlag[];
  safety: {
    level: "clear" | "elevated" | "high";
    signals: string[];
    protocolAllowed: boolean;
  };
};

export type ComparisonPublic = {
  sharedReality: Array<{ topic: string; agreement: string }>;
  perceptionGaps: Array<{ topic: string; aView: string; bView: string; neutralFrame: string }>;
  disputedClaims: Array<{ claim: string; status: string; question: string }>;
  predictionChecks: Array<{ slot: CoupleSlot; predicted: string; actual: string; accuracy: string; comment: string }>;
  cycleHypothesis: {
    label: string;
    sequence: Array<{ actor: CoupleSlot | "BOTH"; trigger: string; reaction: string; effect: string }>;
    confidence: "low" | "medium" | "high";
    question: string;
  };
  resources: string[];
  unknowns: string[];
  crossQuestions: string[];
};

export type FinalSynthesis = {
  commonGround: string[];
  updatedUnderstandingA: string;
  updatedUnderstandingB: string;
  remainingDisagreements: string[];
  sharedReality: string[];
  cycle: string;
  nextConversationQuestion: string;
  humanSupport: { recommended: boolean; reason: string };
  experiment: {
    title: string;
    hypothesis: string;
    behaviorA: string;
    behaviorB: string;
    durationDays: number;
    successCriteria: string[];
  };
  safety: { level: "clear" | "elevated" | "high"; protocolAllowed: boolean; note: string };
};

export type CoupleExperiment = {
  id: string;
  status: "PROPOSED" | "ACTIVE" | "DECLINED" | "COMPLETED";
  title: string;
  plan: FinalSynthesis["experiment"];
  acceptances: Record<string, boolean>;
  dueAt: string;
  myCheckin: Record<string, unknown> | null;
  partnerCheckedIn: boolean;
  result: Record<string, unknown> | null;
};

export type CoupleState = {
  pairId: string;
  pairStatus: CoupleStatus;
  participant: {
    id: string;
    slot: CoupleSlot;
    status: CoupleStatus;
    displayName: string;
    answers: Record<string, unknown>;
    shareDraft: ShareSummary | null;
    shareApproved: ShareSummary | null;
    privatePerspective: PerspectivePrivate | null;
    reflectionSubmitted: boolean;
  };
  partner: {
    joined: boolean;
    status: CoupleStatus | "NOT_JOINED";
    displayName: string;
    shareApproved: ShareSummary | null;
  };
  comparison: ComparisonPublic | null;
  finalSynthesis: FinalSynthesis | null;
  experiment: CoupleExperiment | null;
  safetyStopped: boolean;
};
