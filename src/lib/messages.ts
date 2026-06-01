import { getAllSessions } from "./db";

export type MessageContext =
  | "first-open"
  | "gap-return"
  | "monday"
  | "milestone-10"
  | "returning";

const MESSAGES: Record<MessageContext, string[]> = {
  "first-open": [
    "You don't need to do more. You just need to start.",
    "Every focused person started exactly where you are right now.",
    "The hardest part is opening the door. You just did.",
    "You already know what matters. Let's make time for it.",
  ],

  "gap-return": [
    "You're back. That's the only thing that matters right now.",
    "Returning is the whole practice. Welcome.",
    "You showed up today. That's already a win.",
    "The gap doesn't matter. You're here now.",
    "Focus doesn't require a perfect streak. Just this moment.",
  ],

  monday: [
    "One focused week begins with one focused session.",
    "Monday is just an ordinary day that decided to go first.",
    "What you do in the next 25 minutes shapes the rest of the week.",
    "A quiet start to a full week. Begin here.",
    "New week. Same practice. Let's go.",
  ],

  "milestone-10": [
    "Small sessions, consistently. That's how focus compounds.",
    "You've built something real. Ten sessions of actual work.",
    "The habit is taking root. Keep showing up.",
    "You're becoming the kind of person who does this.",
    "Consistency is the skill. You're practicing it.",
    "Ten sessions in. The garden is growing.",
  ],

  returning: [
    "Every session is a vote for who you're becoming.",
    "You don't have to feel ready. You just have to begin.",
    "The work doesn't get easier. You get better at starting.",
    "One session at a time. That's the whole system.",
    "Showing up is the discipline. The rest follows.",
    "Two-minute rule: just open the task. The rest will come.",
    "Your future self will thank you for this 25 minutes.",
    "Good work doesn't require a perfect day. Just this one session.",
    "The goal isn't to be productive. It's to do what matters.",
    "You've done this before. You can do it again.",
    "Focus is a practice, not a talent. You're practicing.",
    "The most important work is the work you actually do.",
    "Start before you're ready. That's how it always works.",
    "What you repeat, you become. One session at a time.",
    "Small and consistent beats big and occasional. Every time.",
    "Systems beat motivation. You built a system. Use it.",
    "The best time to start was yesterday. The second best is now.",
    "A focused hour is worth more than an anxious day.",
    "Progress compounds quietly. You're adding to it right now.",
    "Do the thing. The feeling comes after.",
    "This is what focused people do: they begin.",
    "The session doesn't have to be perfect. It just has to happen.",
    "One clear task. One block of time. That's all this is.",
  ],
};

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function daysBetween(a: Date, b: Date): number {
  const ms = Math.abs(b.getTime() - a.getTime());
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

// Deterministic pick from an array based on today's date
function pickForToday<T>(arr: T[]): T {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return arr[seed % arr.length];
}

export async function getOpeningMessage(): Promise<string> {
  try {
    const sessions = await getAllSessions();
    const completed = sessions.filter((s) => s.completed);
    const now = new Date();

    // First ever open
    if (completed.length === 0) {
      return pickForToday(MESSAGES["first-open"]);
    }

    // Returning after 3+ day gap
    const lastSession = completed.reduce((latest, s) =>
      s.endTime > latest.endTime ? s : latest
    );
    if (daysBetween(new Date(lastSession.endTime), now) >= 3) {
      return pickForToday(MESSAGES["gap-return"]);
    }

    // 10+ sessions milestone
    if (completed.length >= 10) {
      return pickForToday(MESSAGES["milestone-10"]);
    }

    // Monday
    if (now.getDay() === 1) {
      return pickForToday(MESSAGES["monday"]);
    }

    // Regular returning user
    return pickForToday(MESSAGES["returning"]);
  } catch {
    // IDB unavailable (e.g. private browsing) — default to a returning message
    return pickForToday(MESSAGES["returning"]);
  }
}

export const BUTTON_LABELS = ["Let's begin.", "I'm ready.", "Begin."] as const;

export function getButtonLabel(): string {
  const today = new Date();
  const seed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return BUTTON_LABELS[seed % BUTTON_LABELS.length];
}
