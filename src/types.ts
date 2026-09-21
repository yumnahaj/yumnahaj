export type SkillStatus = 'matched' | 'partial' | 'gap';
export type SkillGroup = 'core' | 'preferred';
export type Priority = 'high' | 'medium';
export type TaskState = 'todo' | 'doing' | 'done';
export type RouteId =
  | 'landing'
  | 'wizard'
  | 'analyzing'
  | 'dashboard'
  | 'report'
  | 'gaps'
  | 'plan'
  | 'resume'
  | 'privacy';

export interface StudentProfile {
  name: string;
  major: string;
  degree: string;
  gradYear: string;
  city: string;
  gpa: string;
  targetField: string;
  /** صيغة المخاطبة: تُضبط للشخصية التجريبية فقط، والافتراضي محايد */
  voice?: 'feminine' | 'neutral';
}

export interface ResumeInput {
  text: string;
  fileName: string;
}

export interface Opportunity {
  title: string;
  org: string;
  city: string;
  url: string;
  description: string;
  isDemo: boolean;
}

export interface AnalysisInput {
  student: StudentProfile;
  resume: ResumeInput;
  opportunity: Opportunity;
}

export interface SkillFinding {
  id: string;
  label: string;
  group: SkillGroup;
  current: number;
  required: number;
  status: SkillStatus;
  statusLabel: string;
  reason: string;
  evidence: string | null;
  recommendation: string;
}

export interface ScoreComponent {
  key: string;
  label: string;
  weight: number;
  achieved: number;
  note: string;
}

export interface AnalysisWarning {
  id: string;
  title: string;
  body: string;
}

export interface ResumeSuggestion {
  id: string;
  title: string;
  target: string;
  before: string;
  after: string;
  why: string;
}

export interface AnalysisResult {
  score: number;
  band: { id: 'strong' | 'good' | 'building'; label: string; message: string };
  skills: SkillFinding[];
  strengths: string[];
  weaknesses: string[];
  components: ScoreComponent[];
  resumeReadiness: number;
  missingKeywords: string[];
  suggestions: ResumeSuggestion[];
  warnings: AnalysisWarning[];
  topGapId: string | null;
  isDemo: boolean;
  generatedAt: string;
}

export interface PlanTask {
  id: string;
  title: string;
  detail: string;
  minutes: number;
  priority: Priority;
  skillId: string | null;
  today: boolean;
}

export interface PlanWeek {
  id: string;
  index: number;
  title: string;
  goal: string;
  tasks: PlanTask[];
}

export type TaskStateMap = Record<string, TaskState>;

export interface SessionState {
  input: AnalysisInput;
  result: AnalysisResult;
  taskStates: TaskStateMap;
  extraTaskIds: string[];
  appliedSuggestionIds: string[];
  resumeDraft: string;
  savedAt: string;
}
