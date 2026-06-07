/// <reference lib="webworker" />

type WorkerIncoming =
  | { type: "START"; duration: number }
  | { type: "PAUSE" }
  | { type: "RESUME" };

type WorkerOutgoing =
  | { type: "TICK"; elapsed: number; remaining: number }
  | { type: "COMPLETE" };

let intervalId: ReturnType<typeof setInterval> | null = null;
let totalDurationMs = 0;
let startTime = 0;
let totalPausedMs = 0;
let pausedAt: number | null = null;

function tick() {
  const now = performance.now();
  const elapsed = now - startTime - totalPausedMs;
  const remaining = totalDurationMs - elapsed;

  if (remaining <= 0) {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    self.postMessage({ type: "COMPLETE" } satisfies WorkerOutgoing);
    return;
  }

  self.postMessage({ type: "TICK", elapsed, remaining } satisfies WorkerOutgoing);
}

function startInterval() {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(tick, 1000);
}

self.onmessage = (e: MessageEvent<WorkerIncoming>) => {
  const msg = e.data;

  if (msg.type === "START") {
    totalDurationMs = msg.duration * 60 * 1000;
    startTime = performance.now();
    totalPausedMs = 0;
    pausedAt = null;
    startInterval();
    tick(); // immediate first tick
  }

  if (msg.type === "PAUSE") {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    pausedAt = performance.now();
  }

  if (msg.type === "RESUME") {
    if (pausedAt !== null) {
      totalPausedMs += performance.now() - pausedAt;
      pausedAt = null;
    }
    startInterval();
  }
};
