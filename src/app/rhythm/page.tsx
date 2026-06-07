"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllSessions } from "@/lib/db";
import type { Session } from "@/lib/db";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getLastNDates(n: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

function sessionCountToColor(count: number): string {
  if (count === 0) return "var(--ff-stone-200)";
  if (count === 1) return "var(--ff-ocean-100)";
  if (count === 2) return "var(--ff-ocean-200)";
  return "var(--ff-ocean-400)";
}

function getTimeOfDayInsight(sessions: Session[]): string | null {
  const completed = sessions.filter((s) => s.completed);
  if (completed.length < 10) return null;

  // Only show if the user gets frequently interrupted (avg > 1 per session)
  const totalInterruptions = completed.reduce(
    (acc, s) => acc + s.interruptions.length,
    0
  );
  if (totalInterruptions / completed.length <= 1) return null;

  // Group by time of day: morning (5-12), afternoon (12-17), evening (17-24/0-5)
  const buckets: Record<string, { totalFocusMin: number; count: number }> = {
    morning: { totalFocusMin: 0, count: 0 },
    afternoon: { totalFocusMin: 0, count: 0 },
    evening: { totalFocusMin: 0, count: 0 },
  };

  for (const s of completed) {
    const hour = new Date(s.startTime).getHours();
    const bucket = hour >= 5 && hour < 12 ? "morning"
      : hour >= 12 && hour < 17 ? "afternoon"
      : "evening";
    buckets[bucket].totalFocusMin += s.actualFocusTime;
    buckets[bucket].count++;
  }

  // Find the bucket with the highest average focus time (at least 3 sessions)
  let bestBucket: string | null = null;
  let bestAvg = 0;
  for (const [name, { totalFocusMin, count }] of Object.entries(buckets)) {
    if (count < 3) continue;
    const avg = totalFocusMin / count;
    if (avg > bestAvg) {
      bestAvg = avg;
      bestBucket = name;
    }
  }

  return bestBucket;
}

function getBestFocusDay(sessions: Session[]): string | null {
  const completed = sessions.filter((s) => s.completed);
  if (completed.length === 0) return null;

  // Only use sessions from the last 30 days for recency
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const recent = completed.filter((s) => s.startTime >= cutoff);

  // Need at least 14 days of data (heuristic: 14+ sessions spread across days)
  const uniqueDays = new Set(
    recent.map((s) => new Date(s.startTime).toISOString().split("T")[0])
  );
  if (uniqueDays.size < 14) return null;

  // Sum sessions per day-of-week
  const dayCounts: number[] = Array(7).fill(0);
  const dayOccurrences: number[] = Array(7).fill(0);

  for (const s of recent) {
    const dow = new Date(s.startTime).getDay();
    dayCounts[dow]++;
  }

  // Count how many times each weekday appeared in the 30-day window
  const dates = getLastNDates(30);
  for (const d of dates) {
    const dow = new Date(d).getDay();
    dayOccurrences[dow]++;
  }

  const avgByDay = dayCounts.map((count, i) =>
    dayOccurrences[i] > 0 ? count / dayOccurrences[i] : 0
  );

  const maxAvg = Math.max(...avgByDay);
  if (maxAvg === 0) return null;

  const bestDow = avgByDay.indexOf(maxAvg);
  return DAY_NAMES[bestDow];
}

export default function RhythmPage() {
  const router = useRouter();
  const [sessionsByDate, setSessionsByDate] = useState<Record<string, number>>({});
  const [bestDay, setBestDay] = useState<string | null>(null);
  const [timeOfDayInsight, setTimeOfDayInsight] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getAllSessions().then((sessions) => {
      const map: Record<string, number> = {};
      for (const s of sessions) {
        if (!s.completed) continue;
        const date = new Date(s.startTime).toISOString().split("T")[0];
        map[date] = (map[date] ?? 0) + 1;
      }
      setSessionsByDate(map);
      setBestDay(getBestFocusDay(sessions));
      setTimeOfDayInsight(getTimeOfDayInsight(sessions));
      setLoaded(true);
    });
  }, []);

  const dates = getLastNDates(30);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--ff-bg)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "var(--ff-space-4) var(--ff-space-6)",
          maxWidth: "480px",
          margin: "0 auto",
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "var(--ff-space-3)",
        }}
      >
        <button
          onClick={() => router.push("/today")}
          aria-label="Back to today"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            minHeight: "44px",
            minWidth: "44px",
            display: "flex",
            alignItems: "center",
            color: "var(--ff-ink-muted)",
            flexShrink: 0,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="13 4 7 10 13 16" />
          </svg>
        </button>
        <span
          style={{
            fontFamily: "var(--ff-font-body)",
            fontSize: "14px",
            fontWeight: 500,
            color: "var(--ff-ink-soft)",
            letterSpacing: "0.01em",
          }}
        >
          Your focus rhythm
        </span>
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 var(--ff-space-6) var(--ff-space-12)",
        }}
      >
        <div style={{ width: "100%", maxWidth: "480px" }}>
          {/* Heatmap grid */}
          {loaded && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(10, 24px)",
                gap: "4px",
                justifyContent: "center",
              }}
            >
              {dates.map((date) => (
                <div
                  key={date}
                  title={date}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "6px",
                    background: sessionCountToColor(sessionsByDate[date] ?? 0),
                    transition: "background 0.2s ease",
                  }}
                />
              ))}
            </div>
          )}

          {/* Day-of-week insight */}
          {loaded && bestDay && (
            <p
              style={{
                marginTop: "var(--ff-space-8)",
                fontFamily: "var(--ff-font-body)",
                fontSize: "14px",
                color: "var(--ff-ink-muted)",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              You tend to focus best on {bestDay}s.
            </p>
          )}

          {/* Time-of-day insight — only when avg interruptions > 1 and 10+ sessions */}
          {loaded && timeOfDayInsight && (
            <p
              style={{
                marginTop: bestDay ? "var(--ff-space-2)" : "var(--ff-space-8)",
                fontFamily: "var(--ff-font-body)",
                fontSize: "12px",
                color: "var(--ff-ink-muted)",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              You tend to focus longer in the {timeOfDayInsight}.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
