"use client";

import { useRouter } from "next/navigation";

export default function RestWellPage() {
  const router = useRouter();

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
        animation: "fadeToBlack 2.5s ease-in 1s forwards",
      }}
    >
      <p
        style={{
          fontFamily: "var(--ff-font-display)",
          fontSize: "28px",
          fontWeight: 300,
          color: "var(--ff-ink)",
          margin: 0,
          textAlign: "center",
          letterSpacing: "-0.01em",
        }}
      >
        Rest well.
      </p>

      {/* Return link — visible briefly before fade, stays as escape hatch */}
      <button
        onClick={() => router.push("/")}
        style={{
          position: "absolute",
          bottom: "var(--ff-space-8)",
          background: "none",
          border: "none",
          fontFamily: "var(--ff-font-body)",
          fontSize: "11px",
          color: "var(--ff-ink-muted)",
          cursor: "pointer",
          padding: "8px",
          opacity: 0.6,
        }}
      >
        return tomorrow
      </button>

      <style>{`
        @keyframes fadeToBlack {
          0%   { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </main>
  );
}
