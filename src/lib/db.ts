import { openDB, DBSchema, IDBPDatabase } from "idb";

// --- Types ---

export interface Interruption {
  leftAt: number;
  returnedAt: number;
}

export interface Session {
  id: string;
  taskName: string;
  taskId: string;
  startTime: number;
  endTime: number;
  plannedDuration: number;
  actualFocusTime: number;
  interruptions: Interruption[];
  soundUsed: string;
  completed: boolean;
}

export interface DayTask {
  id: string;
  name: string;
  sessionCount: number;
}

export interface ClosingReflection {
  whatWorked: string;
  carryForward: string;
}

export interface Day {
  date: string; // YYYY-MM-DD
  tasks: DayTask[];
  closingReflection: ClosingReflection;
  sessionCount: number;
}

export interface GardenState {
  totalSessions: number;
  allThreeTaskDays: number;
  weeksWith1PlusSession: number;
  firstSessionDate: Date | null;
}

// --- Schema ---

interface FocusFlowDB extends DBSchema {
  sessions: {
    key: string;
    value: Session;
  };
  days: {
    key: string;
    value: Day;
  };
}

// --- DB singleton ---

let dbPromise: Promise<IDBPDatabase<FocusFlowDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<FocusFlowDB>> {
  if (!dbPromise) {
    dbPromise = openDB<FocusFlowDB>("focus-flow", 1, {
      upgrade(db) {
        db.createObjectStore("sessions", { keyPath: "id" });
        db.createObjectStore("days", { keyPath: "date" });
      },
    });
  }
  return dbPromise;
}

// --- Session CRUD ---

export async function addSession(
  data: Omit<Session, "id">
): Promise<Session> {
  const db = await getDB();
  const session: Session = { id: crypto.randomUUID(), ...data };
  await db.put("sessions", session);
  return session;
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDB();
  return db.get("sessions", id);
}

export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB();
  return db.getAll("sessions");
}

export async function updateSession(session: Session): Promise<void> {
  const db = await getDB();
  await db.put("sessions", session);
}

// --- Day CRUD ---

function todayKey(): string {
  return new Date().toISOString().split("T")[0];
}

function emptyDay(date: string): Day {
  return {
    date,
    tasks: [],
    closingReflection: { whatWorked: "", carryForward: "" },
    sessionCount: 0,
  };
}

export async function saveDay(day: Day): Promise<void> {
  const db = await getDB();
  await db.put("days", day);
}

export async function getDay(date: string): Promise<Day | undefined> {
  const db = await getDB();
  return db.get("days", date);
}

export async function getTodayDay(): Promise<Day> {
  const date = todayKey();
  return (await getDay(date)) ?? emptyDay(date);
}

// --- Garden State ---

function getWeekMonday(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

export async function getGardenState(): Promise<GardenState> {
  const [sessions, db] = await Promise.all([getAllSessions(), getDB()]);

  const completed = sessions.filter((s) => s.completed);

  if (completed.length === 0) {
    return {
      totalSessions: 0,
      allThreeTaskDays: 0,
      weeksWith1PlusSession: 0,
      firstSessionDate: null,
    };
  }

  // firstSessionDate — earliest completed session
  const firstSessionDate = new Date(
    Math.min(...completed.map((s) => s.startTime))
  );

  // weeksWith1PlusSession — distinct ISO weeks with at least one completed session
  const weekSet = new Set(
    completed.map((s) => getWeekMonday(new Date(s.startTime)))
  );

  // allThreeTaskDays — days where all 3 tasks each have sessionCount >= 1
  const allDays = await db.getAll("days");
  const allThreeTaskDays = allDays.filter(
    (d) =>
      d.tasks.length === 3 && d.tasks.every((t) => t.sessionCount >= 1)
  ).length;

  return {
    totalSessions: completed.length,
    allThreeTaskDays,
    weeksWith1PlusSession: weekSet.size,
    firstSessionDate,
  };
}

/*
 * Usage example (round-trip):
 *
 * const session = await addSession({
 *   taskName: 'Write report', taskId: 'task-abc',
 *   startTime: Date.now(), endTime: Date.now() + 25 * 60 * 1000,
 *   plannedDuration: 25, actualFocusTime: 25,
 *   interruptions: [], soundUsed: 'rain', completed: true,
 * });
 * const retrieved = await getSession(session.id);
 * // retrieved.taskName === 'Write report'  => true
 */
