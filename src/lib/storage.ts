import type { SessionState } from '../types';

const STORAGE_KEY = 'murshid.session.v1';

export function loadSession(): SessionState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SessionState;
    if (!parsed?.result || !parsed?.input) return null;
    return {
      ...parsed,
      taskStates: parsed.taskStates ?? {},
      extraTaskIds: parsed.extraTaskIds ?? [],
      appliedSuggestionIds: parsed.appliedSuggestionIds ?? [],
      resumeDraft: parsed.resumeDraft ?? parsed.input.resume.text,
    };
  } catch {
    return null;
  }
}

export function saveSession(session: SessionState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* قد يكون التخزين ممتلئًا أو محظورًا في وضع التصفح الخاص */
  }
}

export function clearSession(): void {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* لا شيء نفعله إذا مُنع الوصول إلى التخزين */
  }
}
