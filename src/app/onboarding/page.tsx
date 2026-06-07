"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getTodayDay, saveDay } from "@/lib/db";

type Step = 1 | 2 | 3;

const IDENTITY_OPTIONS = [
  "Someone who finishes what matters",
  "Someone who works without burning out",
  "Someone who stops putting things off",
];

const TIME_OPTIONS = [
  { label: "Morning", value: "morning" },
  { label: "After lunch", value: "after-lunch" },
  { label: "Afternoon", value: "afternoon" },
  { label: "Evening", value: "evening" },
  { label: "It varies", value: "varies" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [fading, setFading] = useState(false);

  // Step 1
  const [selectedIdentity, setSelectedIdentity] = useState<number | null>(null);

  // Step 2
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  // Step 3
  const [taskName, setTaskName] = useState("");
  const [saving, setSaving] = useState(false);

  function advanceTo(next: Step) {
    setFading(true);
    setTimeout(() => {
      setStep(next);
      setFading(false);
    }, 160);
  }

  function handleStep2Continue() {
    if (selectedTime) {
      localStorage.setItem("ff_preferred_time", selectedTime);
    }
    advanceTo(3);
  }

  async function handleStart() {
    const name = taskName.trim();
    if (!name || saving) return;
    setSaving(true);

    const day = await getTodayDay();
    const taskId = crypto.randomUUID();
    day.tasks = [{ id: taskId, name, sessionCount: 0 }, ...day.tasks.slice(0, 2)];
    await saveDay(day);

    localStorage.setItem("ff_onboarded", "1");
    router.replace("/today");
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--ff-bg)",
        padding: "var(--ff-padding-screen)",
      }}
    >
      <div
        style={{
          maxWidth: "380px",
          width: "100%",
          opacity: fading ? 0 : 1,
          transition: "opacity 160ms ease-in-out",
        }}
      >
        {step === 1 && (
          <Step1
            selected={selectedIdentity}
            onSelect={setSelectedIdentity}
            onContinue={() => advanceTo(2)}
          />
        )}
        {step === 2 && (
          <Step2
            selected={selectedTime}
            onSelect={setSelectedTime}
            onContinue={handleStep2Continue}
          />
        )}
        {step === 3 && (
          <Step3
            value={taskName}
            onChange={setTaskName}
            onStart={handleStart}
            saving={saving}
          />
        )}
      </div>
    </main>
  );
}

// --- Step 1 ---

function Step1({
  selected,
  onSelect,
  onContinue,
}: {
  selected: number | null;
  onSelect: (i: number) => void;
  onContinue: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ff-space-8)" }}>
      <h1
        style={{
          fontFamily: "var(--ff-font-display)",
          fontSize: "24px",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.4,
          color: "var(--ff-ink)",
          margin: 0,
          textAlign: "center",
        }}
      >
        What kind of person do you want to be at work?
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--ff-space-2)" }}>
        {IDENTITY_OPTIONS.map((label, i) => (
          <button
            key={i}
            onClick={() => onSelect(i)}
            style={{
              textAlign: "left",
              padding: "var(--ff-space-4) var(--ff-space-6)",
              background: selected === i ? "var(--ff-ocean-50)" : "var(--ff-surface)",
              border: `0.5px solid ${selected === i ? "var(--ff-ocean-400)" : "var(--ff-ocean-100)"}`,
              borderRadius: "var(--ff-radius-md)",
              fontFamily: "var(--ff-font-body)",
              fontSize: "14px",
              color: "var(--ff-ink-soft)",
              cursor: "pointer",
              minHeight: "52px",
              transition: "background 160ms ease, border-color 160ms ease",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={selected === null}
        style={{
          padding: "13px 0",
          background: selected !== null ? "var(--ff-ocean-600)" : "var(--ff-stone-200)",
          color: selected !== null ? "var(--ff-white)" : "var(--ff-ink-muted)",
          border: "none",
          borderRadius: "var(--ff-radius-pill)",
          fontFamily: "var(--ff-font-body)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: selected !== null ? "pointer" : "default",
          transition: "background 160ms ease",
        }}
      >
        Continue
      </button>
    </div>
  );
}

// --- Step 2 ---

function Step2({
  selected,
  onSelect,
  onContinue,
}: {
  selected: string | null;
  onSelect: (v: string) => void;
  onContinue: () => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ff-space-8)" }}>
      <h2
        style={{
          fontFamily: "var(--ff-font-display)",
          fontSize: "20px",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.4,
          color: "var(--ff-ink)",
          margin: 0,
          textAlign: "center",
        }}
      >
        When is your usual quiet moment?
      </h2>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "var(--ff-space-2)",
          justifyContent: "center",
        }}
      >
        {TIME_OPTIONS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => onSelect(value)}
            style={{
              padding: "10px 20px",
              background: selected === value ? "var(--ff-ocean-50)" : "var(--ff-surface)",
              border: `0.5px solid ${selected === value ? "var(--ff-ocean-400)" : "var(--ff-ocean-100)"}`,
              borderRadius: "var(--ff-radius-pill)",
              fontFamily: "var(--ff-font-body)",
              fontSize: "13px",
              color: selected === value ? "var(--ff-ocean-600)" : "var(--ff-ink-soft)",
              cursor: "pointer",
              minHeight: "44px",
              transition: "background 160ms ease, border-color 160ms ease",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <button
        onClick={onContinue}
        disabled={selected === null}
        style={{
          padding: "13px 0",
          background: selected !== null ? "var(--ff-ocean-600)" : "var(--ff-stone-200)",
          color: selected !== null ? "var(--ff-white)" : "var(--ff-ink-muted)",
          border: "none",
          borderRadius: "var(--ff-radius-pill)",
          fontFamily: "var(--ff-font-body)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: selected !== null ? "pointer" : "default",
          transition: "background 160ms ease",
        }}
      >
        Continue
      </button>
    </div>
  );
}

// --- Step 3 ---

function Step3({
  value,
  onChange,
  onStart,
  saving,
}: {
  value: string;
  onChange: (v: string) => void;
  onStart: () => void;
  saving: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--ff-space-8)" }}>
      <h2
        style={{
          fontFamily: "var(--ff-font-display)",
          fontSize: "20px",
          fontWeight: 400,
          letterSpacing: "-0.02em",
          lineHeight: 1.4,
          color: "var(--ff-ink)",
          margin: 0,
          textAlign: "center",
        }}
      >
        What is one thing you want to focus on today?
      </h2>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && value.trim()) onStart(); }}
        placeholder="Write something specific..."
        autoFocus
        style={{
          padding: "var(--ff-space-4) var(--ff-space-6)",
          background: "var(--ff-surface)",
          border: "0.5px solid var(--ff-ocean-100)",
          borderRadius: "var(--ff-radius-md)",
          fontFamily: "var(--ff-font-body)",
          fontSize: "16px",
          color: "var(--ff-ink)",
          outline: "none",
          minHeight: "56px",
        }}
      />

      <button
        onClick={onStart}
        disabled={!value.trim() || saving}
        style={{
          padding: "13px 0",
          background: value.trim() && !saving ? "var(--ff-ocean-600)" : "var(--ff-stone-200)",
          color: value.trim() && !saving ? "var(--ff-white)" : "var(--ff-ink-muted)",
          border: "none",
          borderRadius: "var(--ff-radius-pill)",
          fontFamily: "var(--ff-font-body)",
          fontSize: "14px",
          fontWeight: 500,
          cursor: value.trim() && !saving ? "pointer" : "default",
          transition: "background 160ms ease",
        }}
      >
        Start my first session.
      </button>
    </div>
  );
}
