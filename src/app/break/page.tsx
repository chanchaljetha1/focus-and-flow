"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getSessionCount } from "@/lib/progressive";

const SUGGESTIONS = [
  "Stretch",
  "Walk",
  "Water",
  "Breathe",
  "Step outside",
  "Eyes closed",
];

function formatBreakTime(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function BreakPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const taskId = searchParams.get("taskId") ?? "free";
  const taskName = searchParams.get("name") ?? "";
  const slot = searchParams.get("slot") ?? "-1";
  const isFirstSession = searchParams.get("firstSession") === "1";

  const [breakSeconds, setBreakSeconds] = useState(0);
  const [sessionCount, setSessionCount] = useState(0);
  const [resetNote, setResetNote] = useState("");
  const [showFirstMsg, setShowFirstMsg] = useState(isFirstSession);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setSessionCount(getSessionCount());

    intervalRef.current = setInterval(() => {
      setBreakSeconds((s) => s + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isFirstSession) return;
    const t = setTimeout(() => setShowFirstMsg(false), 2000);
    return () => clearTimeout(t);
  }, [isFirstSession]);

  function handleBackToFocus() {
    const params = new URLSearchParams();
    if (taskName) params.set("name", taskName);
    if (slot !== "-1") params.set("slot", slot);
    router.push(`/session/${encodeURIComponent(taskId)}?${params.toString()}`);
  }

  function handleDoneForNow() {
    router.push("/today");
  }

  const showResetField = sessionCount >= 3;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--ff-padding-screen)",
        maxWidth: "480px",
        margin: "0 auto",
        width: "100%",
        position: "relative",
      }}
    >
      {/* First-session special moment — fades out after 2s */}
      {isFirstSession && (
        <p
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontFamily: "var(--ff-font-display)",
            fontSize: "16px",
            fontWeight: 300,
            color: "var(--ff-ink-soft)",
            margin: 0,
            textAlign: "center",
            pointerEvents: "none",
            opacity: showFirstMsg ? 1 : 0,
            transition: "opacity 600ms ease",
            zIndex: 10,
            width: "100%",
            padding: "0 var(--ff-space-6)",
          }}
        >
          Your garden just started growing.
        </p>
      )}

      {/* Top section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--ff-space-6)",
          paddingTop: "var(--ff-space-12)",
          flex: 1,
          width: "100%",
          opacity: isFirstSession ? (showFirstMsg ? 0 : 1) : 1,
          transition: isFirstSession ? "opacity 600ms ease" : "none",
        }}
      >
        {/* Heading */}
        <p
          style={{
            fontFamily: "var(--ff-font-display)",
            fontSize: "20px",
            fontWeight: 300,
            color: "var(--ff-ink)",
            margin: 0,
            textAlign: "center",
          }}
        >
          Session complete.
        </p>

        {/* Breathing animation */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "var(--ff-space-4)",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "50%",
              background: "var(--ff-ocean-200)",
              animation: "breathe 4s ease-in-out infinite",
            }}
          />
          <p
            style={{
              fontFamily: "var(--ff-font-body)",
              fontSize: "14px",
              color: "var(--ff-ink-soft)",
              margin: 0,
              textAlign: "center",
            }}
          >
            Take a real break.
          </p>
        </div>

        {/* Break suggestions */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: "var(--ff-space-2)",
            width: "100%",
            maxWidth: "320px",
          }}
        >
          {SUGGESTIONS.map((s) => (
            <div
              key={s}
              style={{
                padding: "8px 12px",
                borderRadius: "var(--ff-radius-pill)",
                background: "var(--ff-stone-100)",
                color: "var(--ff-ink-muted)",
                fontFamily: "var(--ff-font-body)",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              {s}
            </div>
          ))}
        </div>

        {/* Break timer */}
        <p
          style={{
            fontFamily: "var(--ff-font-body)",
            fontSize: "32px",
            fontWeight: 300,
            color: "var(--ff-ink)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {formatBreakTime(breakSeconds)}
        </p>

        {/* Your reset field — progressive disclosure at 3+ sessions */}
        {showResetField && (
          <div style={{ width: "100%", maxWidth: "320px" }}>
            <input
              type="text"
              value={resetNote}
              onChange={(e) => setResetNote(e.target.value)}
              placeholder="a word or two..."
              style={{
                width: "100%",
                padding: "10px 14px",
                background: "var(--ff-surface)",
                border: "0.5px solid var(--ff-ocean-100)",
                borderRadius: "var(--ff-radius-md)",
                fontFamily: "var(--ff-font-body)",
                fontSize: "12px",
                color: "var(--ff-ink)",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <p
              style={{
                fontFamily: "var(--ff-font-body)",
                fontSize: "11px",
                color: "var(--ff-ink-muted)",
                margin: "4px 0 0 2px",
              }}
            >
              Your reset:
            </p>
          </div>
        )}
      </div>

      {/* Bottom buttons */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--ff-space-3)",
          width: "100%",
          maxWidth: "320px",
          paddingBottom: "var(--ff-space-6)",
          opacity: isFirstSession ? (showFirstMsg ? 0 : 1) : 1,
          transition: isFirstSession ? "opacity 600ms ease" : "none",
        }}
      >
        <button
          onClick={handleBackToFocus}
          style={{
            width: "100%",
            padding: "14px 0",
            background: "var(--ff-ocean-600)",
            color: "var(--ff-white)",
            border: "none",
            borderRadius: "var(--ff-radius-pill)",
            fontFamily: "var(--ff-font-body)",
            fontSize: "15px",
            fontWeight: 500,
            cursor: "pointer",
            minHeight: "48px",
          }}
        >
          Back to focus
        </button>
        <button
          onClick={handleDoneForNow}
          style={{
            width: "100%",
            padding: "14px 0",
            background: "transparent",
            color: "var(--ff-ink-muted)",
            border: "1px solid var(--ff-ocean-100)",
            borderRadius: "var(--ff-radius-pill)",
            fontFamily: "var(--ff-font-body)",
            fontSize: "15px",
            cursor: "pointer",
            minHeight: "48px",
          }}
        >
          Done for now
        </button>
      </div>

      <style>{`
        @keyframes breathe {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50%       { transform: scale(1.33); opacity: 1; }
        }
      `}</style>
    </main>
  );
}
