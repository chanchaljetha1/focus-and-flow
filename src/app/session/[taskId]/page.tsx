"use client";

import { Suspense, useEffect, useRef, useState, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { addSession, getTodayDay, saveDay, Interruption } from "@/lib/db";
import { incrementSessionCount, getSessionCount } from "@/lib/progressive";
import {
  playLoop,
  stopLoop,
  playCompletionSound,
  initAudio,
  getLastSound,
  SoundName,
} from "@/lib/audio";

const CIRCUMFERENCE = 2 * Math.PI * 90; // 565.49

const SOUND_OPTIONS: { id: SoundName; label: string }[] = [
  { id: "rain", label: "Rain" },
  { id: "lofi", label: "Lo-fi" },
  { id: "brown-noise", label: "Brown noise" },
  { id: "cafe", label: "Café" },
  { id: "forest", label: "Forest" },
  { id: "silence", label: "Silence" },
];

function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}


function SessionContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const taskId = typeof params.taskId === "string" ? params.taskId : "free";
  const taskName = searchParams.get("name") ?? "";
  const slotIndex = parseInt(searchParams.get("slot") ?? "-1", 10);
  const isLight = searchParams.get("light") === "1";
  const totalDuration = isLight ? 15 : 25; // minutes
  const totalDurationMs = totalDuration * 60 * 1000;

  const workerRef = useRef<Worker | null>(null);
  const startWallTime = useRef<number>(Date.now());
  const interruptionsRef = useRef<Interruption[]>([]);
  const leftAtRef = useRef<number | null>(null);
  const sessionSavedRef = useRef(false);

  const [remaining, setRemaining] = useState(totalDurationMs);
  const [elapsed, setElapsed] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [sound, setSound] = useState<SoundName>("rain");
  const [focusSummary, setFocusSummary] = useState<string | null>(null);

  // Derived arc value
  const dashOffset = isComplete ? 0 : CIRCUMFERENCE * (remaining / totalDurationMs);

  const saveSessionAndAdvance = useCallback(
    async (finalElapsed: number) => {
      if (sessionSavedRef.current) return;
      sessionSavedRef.current = true;

      const interruptions = interruptionsRef.current;
      const interruptedMs = interruptions.reduce(
        (acc, i) => acc + (i.returnedAt - i.leftAt),
        0
      );
      const actualFocusTime = Math.round((finalElapsed - interruptedMs) / 1000 / 60);

      await addSession({
        taskName,
        taskId,
        startTime: startWallTime.current,
        endTime: Date.now(),
        plannedDuration: totalDuration,
        actualFocusTime,
        interruptions,
        soundUsed: sound,
        completed: true,
      });

      incrementSessionCount();

      // Update today's session dot for this task slot
      if (slotIndex >= 0) {
        const today = await getTodayDay();
        const updatedTasks = today.tasks.map((t, i) =>
          i === slotIndex ? { ...t, sessionCount: t.sessionCount + 1 } : t
        );
        await saveDay({ ...today, tasks: updatedTasks, sessionCount: today.sessionCount + 1 });
      }
    },
    [taskId, taskName, totalDuration, slotIndex, sound]
  );

  // Boot: init worker + audio
  useEffect(() => {
    initAudio(); // ensure AudioContext exists for completion chime even if Silence selected
    const initialSound = getLastSound();
    setSound(initialSound);
    playLoop(initialSound);

    startWallTime.current = Date.now();

    function handleTimerMessage(msg: { type: string; remaining?: number; elapsed?: number }) {
      if (msg.type === "TICK") {
        setRemaining(msg.remaining!);
        setElapsed(msg.elapsed!);
      }
      if (msg.type === "COMPLETE") {
        const interruptions = interruptionsRef.current;
        const interruptedMs = interruptions.reduce(
          (acc, i) => acc + (i.returnedAt - i.leftAt),
          0
        );
        const actualMin = Math.round((totalDurationMs - interruptedMs) / 1000 / 60);

        if (interruptions.length > 0) {
          setFocusSummary(`${actualMin} of ${totalDuration} minutes in focus.`);
        }

        setIsComplete(true);
        setElapsed(totalDurationMs);
        setRemaining(0);
        stopLoop();
        playCompletionSound();

        setTimeout(async () => {
          await saveSessionAndAdvance(totalDurationMs);
          setShowGarden(true);
          const isFirstSession = getSessionCount() === 1;
          const gardenDelay = isFirstSession ? 2000 : 1500;

          // Build break URL with focus integrity data if there were interruptions
          let breakUrl = `/break?taskId=${encodeURIComponent(taskId)}&name=${encodeURIComponent(taskName)}&slot=${slotIndex}`;
          if (isFirstSession) breakUrl += "&firstSession=1";
          if (interruptions.length > 0) {
            breakUrl += `&focusMin=${actualMin}&totalMin=${totalDuration}`;
          }

          setTimeout(() => router.push(breakUrl), gardenDelay);
        }, 600);
      }
    }

    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    let fallbackStart = performance.now();
    let fallbackPausedMs = 0;
    let fallbackPausedAt: number | null = null;

    if (typeof Worker !== "undefined") {
      const worker = new Worker(
        new URL("../../../workers/timer.worker.ts", import.meta.url)
      );
      workerRef.current = worker;
      worker.onmessage = (e: MessageEvent) => handleTimerMessage(e.data);
      worker.postMessage({ type: "START", duration: totalDuration });
    } else {
      // Fallback: setInterval with wall-clock tracking
      fallbackStart = performance.now();
      fallbackInterval = setInterval(() => {
        const now = performance.now();
        const elapsed = now - fallbackStart - fallbackPausedMs;
        const remaining = totalDurationMs - elapsed;
        if (remaining <= 0) {
          if (fallbackInterval) { clearInterval(fallbackInterval); fallbackInterval = null; }
          handleTimerMessage({ type: "COMPLETE" });
        } else {
          handleTimerMessage({ type: "TICK", elapsed, remaining });
        }
      }, 1000);

      workerRef.current = {
        postMessage: (msg: { type: string }) => {
          if (msg.type === "PAUSE") { fallbackPausedAt = performance.now(); if (fallbackInterval) { clearInterval(fallbackInterval); fallbackInterval = null; } }
          if (msg.type === "RESUME") { if (fallbackPausedAt !== null) { fallbackPausedMs += performance.now() - fallbackPausedAt; fallbackPausedAt = null; } fallbackInterval = setInterval(() => { const now = performance.now(); const elapsed = now - fallbackStart - fallbackPausedMs; const remaining = totalDurationMs - elapsed; if (remaining <= 0) { if (fallbackInterval) { clearInterval(fallbackInterval); fallbackInterval = null; } handleTimerMessage({ type: "COMPLETE" }); } else { handleTimerMessage({ type: "TICK", elapsed, remaining }); } }, 1000); }
        },
        terminate: () => { if (fallbackInterval) { clearInterval(fallbackInterval); fallbackInterval = null; } },
      } as unknown as Worker;
    }

    return () => {
      workerRef.current?.terminate();
      if (fallbackInterval) clearInterval(fallbackInterval);
      stopLoop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Focus integrity: passively log tab-switch times (no pause, no overlay)
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        leftAtRef.current = Date.now();
      } else if (leftAtRef.current !== null && !isComplete) {
        interruptionsRef.current = [
          ...interruptionsRef.current,
          { leftAt: leftAtRef.current, returnedAt: Date.now() },
        ];
        leftAtRef.current = null;
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isComplete]);

  function handlePause() {
    if (isPaused) {
      workerRef.current?.postMessage({ type: "RESUME" });
      playLoop(sound);
      setIsPaused(false);
    } else {
      workerRef.current?.postMessage({ type: "PAUSE" });
      stopLoop();
      setIsPaused(true);
    }
  }

  function handleSoundChange(newSound: SoundName) {
    setSound(newSound);
    playLoop(newSound);
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--ff-padding-screen)",
        background: "var(--ff-bg)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Task name */}
      <p
        style={{
          fontFamily: "var(--ff-font-body)",
          fontSize: "14px",
          color: "var(--ff-ink-soft)",
          margin: "var(--ff-space-6) 0 0",
          textAlign: "center",
          maxWidth: "320px",
        }}
      >
        {taskName || "Free focus"}
      </p>

      {/* SVG Arc + Timer */}
      <div style={{ position: "relative", width: 200, height: 200 }}>
        <svg width="200" height="200" viewBox="0 0 200 200">
          <g transform="rotate(-90 100 100)">
            {/* Track */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="var(--ff-ocean-100)"
              strokeWidth="5"
            />
            {/* Progress arc */}
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="var(--ff-ocean-600)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{
                transition: isComplete
                  ? "stroke-dashoffset var(--ff-ease-complete)"
                  : "stroke-dashoffset 1s linear",
              }}
            />
          </g>
        </svg>

        {/* Timer text centred inside arc */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--ff-font-body)",
              fontSize: "32px",
              fontWeight: 300,
              color: "var(--ff-ink)",
              letterSpacing: "-0.02em",
            }}
          >
            {isComplete ? "Done" : formatTime(remaining)}
          </span>
        </div>
      </div>

      {/* Focus integrity summary — only when complete and there were interruptions */}
      {isComplete && focusSummary && (
        <p
          style={{
            fontFamily: "var(--ff-font-body)",
            fontSize: "12px",
            color: "var(--ff-ink-muted)",
            textAlign: "center",
            margin: 0,
            animation: "ff-fade-in 400ms ease 700ms both",
          }}
        >
          {focusSummary}
        </p>
      )}

      {/* Bottom controls */}
      <div
        style={{
          width: "100%",
          maxWidth: "440px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--ff-space-4)",
          paddingBottom: "var(--ff-space-6)",
        }}
      >
        {/* Sound pills */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "var(--ff-space-2)",
            justifyContent: "center",
          }}
        >
          {SOUND_OPTIONS.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => handleSoundChange(id)}
              style={{
                padding: "10px 14px",
                borderRadius: "var(--ff-radius-pill)",
                border: "1px solid var(--ff-ocean-100)",
                background: sound === id ? "var(--ff-ocean-100)" : "transparent",
                color: sound === id ? "var(--ff-ocean-600)" : "var(--ff-ink-muted)",
                fontFamily: "var(--ff-font-body)",
                fontSize: "13px",
                cursor: "pointer",
                minHeight: "44px",
                transition: "background var(--ff-ease-micro), color var(--ff-ease-micro)",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Pause button */}
        {!isComplete && (
          <button
            onClick={handlePause}
            style={{
              background: "none",
              border: "none",
              fontFamily: "var(--ff-font-body)",
              fontSize: "14px",
              color: "var(--ff-ink-muted)",
              cursor: "pointer",
              padding: "8px 16px",
              minHeight: "44px",
            }}
          >
            {isPaused ? "Resume" : "Pause"}
          </button>
        )}
      </div>

      {/* Garden growth moment */}
      {showGarden && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              animation: "gardenGrow 1.5s var(--ff-ease-garden) forwards",
            }}
          >
            <LeafSVG />
          </div>
        </div>
      )}

      <style>{`
        @keyframes gardenGrow {
          0%   { opacity: 0; transform: scale(0.3) translateY(20px); }
          60%  { opacity: 1; transform: scale(1.1) translateY(-4px); }
          100% { opacity: 0; transform: scale(1) translateY(-12px); }
        }
        @keyframes ff-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense>
      <SessionContent />
    </Suspense>
  );
}

function LeafSVG() {
  return (
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      style={{ color: "var(--ff-mist-400)" }}
    >
      <path
        d="M40 70 C40 70 15 55 15 35 C15 20 27 10 40 10 C53 10 65 20 65 35 C65 55 40 70 40 70Z"
        fill="currentColor"
        opacity="0.6"
      />
      <line
        x1="40"
        y1="70"
        x2="40"
        y2="20"
        stroke="var(--ff-mist-600)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
