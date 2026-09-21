import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { analyzeProfile } from '../lib/analyze';
import { useHashRoute } from '../lib/router';
import { clearSession, loadSession, saveSession } from '../lib/storage';
import { buildExtraTask, buildPlan } from '../data/plan';
import { DEMO_INPUT, DEMO_SKILL_LEVELS } from '../data/demo';
import type {
  AnalysisInput,
  AnalysisResult,
  PlanTask,
  PlanWeek,
  RouteId,
  SessionState,
  SkillFinding,
  TaskState,
} from '../types';

interface PlanStats {
  totalTasks: number;
  doneTasks: number;
  totalMinutes: number;
  doneMinutes: number;
  remainingMinutes: number;
  progress: number;
}

interface AppContextValue {
  route: RouteId;
  navigate: (route: RouteId) => void;
  session: SessionState | null;
  result: AnalysisResult | null;
  input: AnalysisInput | null;
  weeks: PlanWeek[];
  allTasks: PlanTask[];
  todayTasks: PlanTask[];
  stats: PlanStats;
  toast: string | null;
  showToast: (message: string) => void;
  runAnalysis: (input: AnalysisInput, demo?: boolean) => void;
  finishAnalysis: () => void;
  startDemo: () => void;
  taskState: (taskId: string) => TaskState;
  setTaskState: (taskId: string, state: TaskState) => void;
  cycleTask: (taskId: string) => void;
  addSkillToPlan: (skill: SkillFinding) => void;
  isSkillInPlan: (skillId: string) => boolean;
  applySuggestion: (suggestionId: string) => void;
  isSuggestionApplied: (suggestionId: string) => boolean;
  resumeDraft: string;
  resetAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

const EMPTY_STATS: PlanStats = {
  totalTasks: 0,
  doneTasks: 0,
  totalMinutes: 0,
  doneMinutes: 0,
  remainingMinutes: 0,
  progress: 0,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [route, navigate] = useHashRoute();
  const [session, setSession] = useState<SessionState | null>(() => loadSession());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);
  const pendingInput = useRef<{ input: AnalysisInput; demo: boolean } | null>(null);

  useEffect(() => {
    if (session) saveSession(session);
  }, [session]);

  // منع الوصول إلى صفحات النتائج قبل وجود تحليل
  useEffect(() => {
    const guarded: RouteId[] = ['dashboard', 'report', 'gaps', 'plan', 'resume'];
    if (!session && guarded.includes(route)) navigate('landing');
  }, [route, session, navigate]);

  const showToast = useCallback((message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  }, []);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const commit = useCallback((input: AnalysisInput, demo: boolean) => {
    const result = analyzeProfile(input, demo ? { levelOverrides: DEMO_SKILL_LEVELS } : {});
    setSession({
      input,
      result,
      taskStates: {},
      extraTaskIds: [],
      appliedSuggestionIds: [],
      resumeDraft: input.resume.text,
      savedAt: new Date().toISOString(),
    });
  }, []);

  const runAnalysis = useCallback(
    (input: AnalysisInput, demo = false) => {
      pendingInput.current = { input, demo };
      navigate('analyzing');
    },
    [navigate],
  );

  // تُستدعى من شاشة التحليل بعد انتهاء المراحل الأربع
  const finishAnalysis = useCallback(() => {
    const pending = pendingInput.current;
    if (!pending) {
      navigate(session ? 'dashboard' : 'landing');
      return;
    }
    pendingInput.current = null;
    commit(pending.input, pending.demo);
    navigate('dashboard');
  }, [commit, navigate, session]);

  const startDemo = useCallback(() => {
    runAnalysis(DEMO_INPUT, true);
  }, [runAnalysis]);

  const weeks = useMemo<PlanWeek[]>(() => {
    if (!session) return [];
    const base = buildPlan(session.result);
    if (session.extraTaskIds.length === 0) return base;

    const extras = session.extraTaskIds
      .map((id) => session.result.skills.find((skill) => `extra-${skill.id}` === id))
      .filter((skill): skill is SkillFinding => Boolean(skill))
      .map(buildExtraTask);

    if (extras.length === 0) return base;
    return base.map((week) => (week.index === 1 ? { ...week, tasks: [...week.tasks, ...extras] } : week));
  }, [session]);

  const allTasks = useMemo(() => weeks.flatMap((week) => week.tasks), [weeks]);
  const todayTasks = useMemo(() => allTasks.filter((task) => task.today), [allTasks]);

  const stats = useMemo<PlanStats>(() => {
    if (!session || allTasks.length === 0) return EMPTY_STATS;
    const states = session.taskStates;
    const totalMinutes = allTasks.reduce((sum, task) => sum + task.minutes, 0);
    const doneTasks = allTasks.filter((task) => states[task.id] === 'done');
    const doneMinutes = doneTasks.reduce((sum, task) => sum + task.minutes, 0);
    return {
      totalTasks: allTasks.length,
      doneTasks: doneTasks.length,
      totalMinutes,
      doneMinutes,
      remainingMinutes: totalMinutes - doneMinutes,
      progress: totalMinutes === 0 ? 0 : Math.round((doneMinutes / totalMinutes) * 100),
    };
  }, [allTasks, session]);

  const taskState = useCallback(
    (taskId: string): TaskState => session?.taskStates[taskId] ?? 'todo',
    [session],
  );

  const setTaskState = useCallback((taskId: string, state: TaskState) => {
    setSession((current) =>
      current ? { ...current, taskStates: { ...current.taskStates, [taskId]: state } } : current,
    );
  }, []);

  const cycleTask = useCallback((taskId: string) => {
    setSession((current) => {
      if (!current) return current;
      const order: TaskState[] = ['todo', 'doing', 'done'];
      const now = current.taskStates[taskId] ?? 'todo';
      const next = order[(order.indexOf(now) + 1) % order.length];
      return { ...current, taskStates: { ...current.taskStates, [taskId]: next } };
    });
  }, []);

  const addSkillToPlan = useCallback(
    (skill: SkillFinding) => {
      const id = `extra-${skill.id}`;
      setSession((current) => {
        if (!current || current.extraTaskIds.includes(id)) return current;
        return { ...current, extraTaskIds: [...current.extraTaskIds, id] };
      });
      showToast(`أُضيفت ${skill.label} إلى خطتك`);
    },
    [showToast],
  );

  const isSkillInPlan = useCallback(
    (skillId: string) => Boolean(session?.extraTaskIds.includes(`extra-${skillId}`)),
    [session],
  );

  const applySuggestion = useCallback(
    (suggestionId: string) => {
      setSession((current) => {
        if (!current || current.appliedSuggestionIds.includes(suggestionId)) return current;
        const suggestion = current.result.suggestions.find((item) => item.id === suggestionId);
        if (!suggestion) return current;
        const draft = current.resumeDraft.includes(suggestion.before)
          ? current.resumeDraft.replace(suggestion.before, suggestion.after)
          : `${current.resumeDraft.trimEnd()}\n\n${suggestion.after}`;
        return {
          ...current,
          resumeDraft: draft,
          appliedSuggestionIds: [...current.appliedSuggestionIds, suggestionId],
        };
      });
      showToast('طُبِّق الاقتراح على المعاينة');
    },
    [showToast],
  );

  const isSuggestionApplied = useCallback(
    (suggestionId: string) => Boolean(session?.appliedSuggestionIds.includes(suggestionId)),
    [session],
  );

  const resetAll = useCallback(() => {
    clearSession();
    setSession(null);
    pendingInput.current = null;
    navigate('landing');
    showToast('حُذفت بياناتك من هذا المتصفح');
  }, [navigate, showToast]);

  const value = useMemo<AppContextValue>(
    () => ({
      route,
      navigate,
      session,
      result: session?.result ?? null,
      input: session?.input ?? null,
      weeks,
      allTasks,
      todayTasks,
      stats,
      toast,
      showToast,
      runAnalysis,
      finishAnalysis,
      startDemo,
      taskState,
      setTaskState,
      cycleTask,
      addSkillToPlan,
      isSkillInPlan,
      applySuggestion,
      isSuggestionApplied,
      resumeDraft: session?.resumeDraft ?? '',
      resetAll,
    }),
    [
      route,
      navigate,
      session,
      weeks,
      allTasks,
      todayTasks,
      stats,
      toast,
      showToast,
      runAnalysis,
      finishAnalysis,
      startDemo,
      taskState,
      setTaskState,
      cycleTask,
      addSkillToPlan,
      isSkillInPlan,
      applySuggestion,
      isSuggestionApplied,
      resetAll,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside AppProvider');
  return context;
}
