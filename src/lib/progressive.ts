const STORAGE_KEY = "ff_session_count";

export const MILESTONES = {
  GARDEN_ICON: 1,
  RESET_FIELD: 3,
  FINISHING_PROMPT: 5,
  RHYTHM_LINK: 10,
  PATTERN_INSIGHT: 20,
} as const;

export function getSessionCount(): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
}

export function incrementSessionCount(): number {
  const next = getSessionCount() + 1;
  localStorage.setItem(STORAGE_KEY, String(next));
  return next;
}

export function hasUnlocked(milestone: number): boolean {
  return getSessionCount() >= milestone;
}
