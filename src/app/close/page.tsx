"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTodayDay, saveDay } from "@/lib/db";

export default function ClosePage() {
  const router = useRouter();

  const [sessionCount, setSessionCount] = useState(0);
  const [tasksTouched, setTasksTouched] = useState(0);
  const [whatWorked, setWhatWorked] = useState("");
  const [carryForward, setCarryForward] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getTodayDay().then((day) => {
      setSessionCount(day.sessionCount);
      setTasksTouched(day.tasks.filter((t) => t.sessionCount >= 1).length);
      setWhatWorked(day.closingReflection?.whatWorked ?? "");
      setCarryForward(day.closingReflection?.carryForward ?? "");
      setLoaded(true);
    });
  }, []);

  async function handleCloseDay() {
    const day = await getTodayDay();
    await saveDay({
      ...day,
      closingReflection: { whatWorked, carryForward },
    });
    router.push("/close/done");
  }

  if (!loaded) return null;

  const hasSessionsToday = sessionCount >= 1;

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "var(--ff-padding-screen)",
        maxWidth: "480px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Heading */}
      <div style={{ paddingTop: "var(--ff-space-12)", width: "100%", textAlign: "center" }}>
        <p
          style={{
            fontFamily: "var(--ff-font-display)",
            fontSize: "20px",
            fontWeight: 300,
            color: "var(--ff-ink)",
            margin: "0 0 var(--ff-space-4) 0",
          }}
        >
          {hasSessionsToday ? "You showed up today." : "Tomorrow is a fresh start."}
        </p>

        {/* Stats pill — only when sessions > 0 */}
        {hasSessionsToday && (
          <div
            style={{
              display: "inline-block",
              padding: "6px 16px",
              background: "var(--ff-ocean-50)",
              borderRadius: "var(--ff-radius-pill)",
              fontFamily: "var(--ff-font-body)",
              fontSize: "14px",
              color: "var(--ff-ink-soft)",
            }}
          >
            {sessionCount} {sessionCount === 1 ? "session" : "sessions"}
            {tasksTouched > 0 && ` · ${tasksTouched} ${tasksTouched === 1 ? "task" : "tasks"} touched`}
          </div>
        )}
      </div>

      {/* Reflection prompts */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--ff-space-4)",
          width: "100%",
          marginTop: "var(--ff-space-8)",
          flex: 1,
        }}
      >
        <div>
          <label
            style={{
              fontFamily: "var(--ff-font-body)",
              fontSize: "12px",
              color: "var(--ff-ink-muted)",
              display: "block",
              marginBottom: "var(--ff-space-2)",
            }}
          >
            What worked well?
          </label>
          <textarea
            value={whatWorked}
            onChange={(e) => setWhatWorked(e.target.value)}
            rows={3}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "var(--ff-surface)",
              border: "0.5px solid var(--ff-ocean-100)",
              borderRadius: "var(--ff-radius-md)",
              fontFamily: "var(--ff-font-body)",
              fontSize: "14px",
              color: "var(--ff-ink)",
              outline: "none",
              resize: "none",
              boxSizing: "border-box",
              lineHeight: 1.5,
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontFamily: "var(--ff-font-body)",
              fontSize: "12px",
              color: "var(--ff-ink-muted)",
              display: "block",
              marginBottom: "var(--ff-space-2)",
            }}
          >
            One thing to carry forward:
          </label>
          <input
            type="text"
            value={carryForward}
            onChange={(e) => setCarryForward(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "var(--ff-surface)",
              border: "0.5px solid var(--ff-ocean-100)",
              borderRadius: "var(--ff-radius-md)",
              fontFamily: "var(--ff-font-body)",
              fontSize: "14px",
              color: "var(--ff-ink)",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Close the day button */}
      <div
        style={{
          width: "100%",
          paddingTop: "var(--ff-space-6)",
          paddingBottom: "var(--ff-space-6)",
        }}
      >
        <button
          onClick={handleCloseDay}
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
          Close the day
        </button>
      </div>
    </main>
  );
}
