"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getTodayDay, getDay, saveDay, Day, DayTask } from "@/lib/db";
import { getSessionCount } from "@/lib/progressive";

function dateKey(daysAgo = 0): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

interface TaskSlot {
  id: string;
  name: string;
  sessionCount: number;
}

function emptySlot(index: number): TaskSlot {
  return { id: `task-${index}-${Date.now()}`, name: "", sessionCount: 0 };
}

const MAX_DOTS = 4;

export default function TodayPage() {
  const router = useRouter();
  const [slots, setSlots] = useState<TaskSlot[]>([
    emptySlot(0),
    emptySlot(1),
    emptySlot(2),
  ]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [sessionCount, setSessionCount] = useState(0);
  const [todayDate, setTodayDate] = useState("");
  const [loaded, setLoaded] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null]);
  const persistRef = useRef(false);

  useEffect(() => {
    const today = dateKey(0);
    setTodayDate(today);

    async function load() {
      const [todayDay, yesterdayDay] = await Promise.all([
        getTodayDay(),
        getDay(dateKey(1)),
      ]);

      setSessionCount(getSessionCount());

      const merged: TaskSlot[] = [0, 1, 2].map((i) => {
        const todayTask = todayDay.tasks[i];
        const yesterdayTask = yesterdayDay?.tasks[i];

        if (todayTask) {
          return { id: todayTask.id, name: todayTask.name, sessionCount: todayTask.sessionCount };
        }
        if (yesterdayTask?.name) {
          return { id: `task-${i}-${Date.now() + i}`, name: yesterdayTask.name, sessionCount: 0 };
        }
        return emptySlot(i);
      });

      setSlots(merged);
      setLoaded(true);
    }

    load();
  }, []);

  // Write-through to IDB on name changes, after initial load
  useEffect(() => {
    if (!loaded) return;
    if (!persistRef.current) {
      persistRef.current = true;
      return;
    }

    const today = dateKey(0);
    getTodayDay().then((todayDay) => {
      const updated: Day = {
        ...todayDay,
        tasks: slots.map((s): DayTask => ({ id: s.id, name: s.name, sessionCount: s.sessionCount })),
      };
      saveDay(updated);
    });
  }, [slots, loaded]);

  function updateSlotName(index: number, name: string) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, name } : s)));
  }

  function handleCardClick(index: number) {
    setSelectedIndex(index);
    inputRefs.current[index]?.focus();
  }

  function handleStartFocusing() {
    let target = selectedIndex;
    if (target === null || !slots[target]?.name.trim()) {
      const firstFilled = slots.findIndex((s) => s.name.trim());
      target = firstFilled >= 0 ? firstFilled : null;
    }

    if (target !== null && slots[target]?.name.trim()) {
      const task = slots[target];
      router.push(
        `/session/${encodeURIComponent(task.id)}?name=${encodeURIComponent(task.name)}&slot=${target}`
      );
    } else {
      router.push("/session/free");
    }
  }

  const showGoodPrompt = sessionCount >= 5 && selectedIndex !== null;
  const todayLabel = todayDate ? formatDate(todayDate) : "";

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        padding: "var(--ff-padding-screen)",
        maxWidth: "480px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Date label */}
      <p
        style={{
          fontFamily: "var(--ff-font-body)",
          fontSize: "11px",
          fontWeight: 500,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "var(--ff-ink-muted)",
          margin: "0 0 var(--ff-space-6) 0",
        }}
      >
        {todayLabel}
      </p>

      {/* Task cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ff-gap-tasks)", flex: 1 }}>
        {slots.map((slot, i) => {
          const isSelected = selectedIndex === i;
          return (
            <div key={slot.id}>
              <div
                onClick={() => handleCardClick(i)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "var(--ff-padding-card)",
                  background: isSelected ? "var(--ff-ocean-50)" : "var(--ff-surface)",
                  border: `0.5px solid ${isSelected ? "var(--ff-ocean-400)" : "var(--ff-ocean-100)"}`,
                  borderRadius: "var(--ff-radius-md)",
                  gap: "var(--ff-space-3)",
                  cursor: "text",
                  transition: "border-color var(--ff-ease-micro), background var(--ff-ease-micro)",
                  minHeight: "52px",
                }}
              >
                <input
                  ref={(el) => { inputRefs.current[i] = el; }}
                  type="text"
                  value={slot.name}
                  onChange={(e) => updateSlotName(i, e.target.value)}
                  onFocus={() => setSelectedIndex(i)}
                  placeholder={i === 0 ? "What's the most important thing today?" : ""}
                  style={{
                    flex: 1,
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    fontFamily: "var(--ff-font-body)",
                    fontSize: "14px",
                    color: "var(--ff-ink)",
                    minWidth: 0,
                    caretColor: "var(--ff-ocean-400)",
                  }}
                />

                {/* Session dots */}
                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                  {Array.from({ length: MAX_DOTS }).map((_, d) => (
                    <div
                      key={d}
                      style={{
                        width: "7px",
                        height: "7px",
                        borderRadius: "50%",
                        background:
                          d < slot.sessionCount
                            ? "var(--ff-ocean-400)"
                            : "var(--ff-ocean-100)",
                        transition: "background var(--ff-ease-micro)",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Progressive disclosure: "What would make finishing this feel good?" */}
              {showGoodPrompt && isSelected && (
                <p
                  style={{
                    fontFamily: "var(--ff-font-body)",
                    fontSize: "11px",
                    color: "var(--ff-ink-muted)",
                    margin: "6px 4px 0",
                    fontStyle: "italic",
                  }}
                >
                  What would make finishing this feel good?
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ height: "var(--ff-space-8)" }} />

      {/* Start Focusing button */}
      <button
        onClick={handleStartFocusing}
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
          letterSpacing: "0.01em",
          cursor: "pointer",
          minHeight: "48px",
        }}
      >
        Start Focusing
      </button>

      {/* Footer row: close the day + garden icon */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "var(--ff-space-4)",
          paddingBottom: "var(--ff-space-2)",
        }}
      >
        <button
          onClick={() => router.push("/close")}
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--ff-font-body)",
            fontSize: "12px",
            color: "var(--ff-ink-muted)",
            cursor: "pointer",
            padding: "8px 0",
            minHeight: "44px",
          }}
        >
          Close the day
        </button>

        <button
          onClick={() => router.push("/garden")}
          aria-label="Focus Garden"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            minHeight: "44px",
            minWidth: "44px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GardenIcon />
        </button>
      </div>

      {/* Rhythm link - progressive disclosure at 10+ sessions */}
      {sessionCount >= 10 && (
        <button
          onClick={() => router.push("/rhythm")}
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--ff-font-body)",
            fontSize: "11px",
            color: "var(--ff-ink-muted)",
            cursor: "pointer",
            padding: "4px 0 var(--ff-space-2)",
            textAlign: "left",
          }}
        >
          Your focus rhythm is starting to show.
        </button>
      )}
    </main>
  );
}

function GardenIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ color: "var(--ff-ink-muted)" }}
    >
      <line x1="10" y1="16" x2="10" y2="9" />
      <path d="M10 13 C8 11 5 11 5 8 C5 8 8 7 10 10" />
      <path d="M10 11 C12 9 15 9 15 6 C15 6 12 5 10 8" />
      <line x1="6" y1="16" x2="14" y2="16" />
    </svg>
  );
}
