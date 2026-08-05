
import type { EntryKey } from "./data/paths";

export type Stage =
  | "landing"
  | "paths"
  | "questions"
  | "mirror"
  | "context"
  | "interview"
  | "final-context"
  | "analyzing"
  | "preview"
  | "checkout"
  | "report"
  | "return"
  | "crisis"
  | "error";

export type AnswerMap = Record<string, string>;
export type ForceValue = "definitely_me" | "mostly_me" | "balanced" | "mostly_other" | "definitely_other";
export type ForceMap = Record<string, ForceValue | undefined>;

export type RelationshipContext = {
  forceMap: ForceMap;
  burdens: string[];
  emotions: string[];
  truth: string;
};

export type InterviewExchange = {
  question: string;
  answer: string;
  focus: string;
  observation?: string;
};

export type V3Mirror = {
  headline: string;
  observation: string;
  unknown: string;
  nextFocus: string;
};

export type ClassificationCategory =
  | "event"
  | "interpretation"
  | "emotion"
  | "prediction"
  | "assumption"
  | "justification"
  | "need"
  | "mixed"
  | "unknown";

export type StatementSegment = {
  text: string;
  category: ClassificationCategory;
  cameraObservable: boolean;
  confidence: "low" | "medium" | "high";
  note: string;
};

export type DiscrepancyRow = {
  userMeaning: string;
  observedMaterial: string;
  unknown: string;
  importance: "supporting" | "important" | "critical";
};

export type Hypothesis = {
  title: string;
  explanation: string;
  evidence: string[];
  limits: string[];
  confidence: "low" | "medium" | "high";
};

export type BurdenProfile = {
  level: "low" | "moderate" | "high" | "overloading";
  mainSource: string;
  processes: string[];
  spillover: string;
  evidence: string[];
};

export type SafetyState = {
  level: "clear" | "caution" | "high-risk";
  signals: string[];
  protocolAllowed: boolean;
  message: string;
};

export type RecommendedProtocol = {
  key: string;
  title: string;
  reason: string;
};

export type V3CaseModel = {
  version: "3.0";
  safety: SafetyState;
  statements: Array<{
    sourceText: string;
    segments: StatementSegment[];
  }>;
  events: Array<{
    what: string;
    when: string;
    frequency: string;
    actor: "user" | "other" | "both" | "unknown";
    evidence: string;
    confidence: "low" | "medium" | "high";
  }>;
  discrepancies: DiscrepancyRow[];
  unknowns: string[];
  mainHypothesis: Hypothesis;
  counterHypothesis: Hypothesis;
  burden: BurdenProfile;
  mirror: V3Mirror;
  preview: V3Preview;
  recommendedProtocol: RecommendedProtocol;
};

export type V3Preview = {
  version: "3.0";
  headline: string;
  essence: string;
  observedSignal: string;
  unknown: string;
  verify: string;
  premiumPromise: string;
  discrepancySample: DiscrepancyRow[];
  confidence: "low" | "medium" | "high";
  safety?: SafetyState;
};

export type BoundaryDraft = {
  improvementProof: string;
  unacceptableBehavior: string;
  observationWindow: string;
  userCommitment: string;
};

export type RealityProtocol = {
  key: string;
  title: string;
  hypothesis: string;
  action: string;
  dontDo: string[];
  observe: string[];
  durationDays: number;
  outcomes: string[];
  safetyNote: string;
};

export type V3FullReport = {
  version: "3.0";
  safety: SafetyState;
  headline: string;
  subheadline: string;
  confidence: "low" | "medium" | "high";
  essence: string;
  whatWeKnow: string[];
  unknowns: string[];
  discrepancyMap: DiscrepancyRow[];
  mainHypothesis: Hypothesis;
  counterHypothesis: Hypothesis;
  evidenceFor: string[];
  evidenceAgainst: string[];
  blindSpot: string;
  burdenProfile: BurdenProfile;
  boundaries: Array<{
    label: string;
    value: string;
    status: "declared" | "unclear" | "not-set";
  }>;
  changeConditions: string[];
  recommendedProtocol: RealityProtocol;
  nextMove: string;
  reviewAt: string;
  closing: string;
};

export type SessionState = {
  sessionToken: string;
  recoveryToken: string;
  caseId: string;
};

export type AnalysisInput = {
  path: EntryKey;
  answers: Array<{ question: string; answer: string; score: number }>;
  context: RelationshipContext;
  interview: InterviewExchange[];
  finalContext: string;
};

export type ReturnCase = {
  caseId: string;
  path: EntryKey;
  createdAt: string;
  updatedAt: string;
  currentState: V3CaseModel | null;
  boundaries: BoundaryDraft | null;
  analyses: Array<{
    id: string;
    createdAt: string;
    preview: V3Preview | null;
    report: V3FullReport | null;
  }>;
  activeProtocol: {
    id: string;
    title: string;
    dueAt: string;
    status: "ACTIVE" | "COMPLETED" | "CANCELLED";
    protocol: RealityProtocol;
  } | null;
  checkins: Array<{
    id: string;
    createdAt: string;
    kind: "protocol" | "weekly";
    input: Record<string, unknown>;
    result: Record<string, unknown> | null;
  }>;
  earlyWarning: {
    level: "none" | "watch" | "important";
    message: string;
    evidence: string[];
  } | null;
};

export type AppError = {
  title: string;
  message: string;
};
