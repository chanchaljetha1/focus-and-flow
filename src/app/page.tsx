"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getOpeningMessage, getButtonLabel } from "@/lib/messages";

export default function OpeningScreen() {
  const router = useRouter();
  const [message, setMessage] = useState<string>("");
  const [messageReady, setMessageReady] = useState(false);
  const buttonLabel = getButtonLabel();

  useEffect(() => {
    getOpeningMessage().then((msg) => {
      setMessage(msg);
      setMessageReady(true);
    });
  }, []);

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "var(--ff-padding-screen)",
        background: [
          "radial-gradient(ellipse at 30% 20%, rgba(108, 184, 166, 0.13), transparent 55%)",
          "radial-gradient(ellipse at 72% 78%, rgba(91, 170, 180, 0.09), transparent 50%)",
          "var(--ff-bg)",
        ].join(", "),
      }}
    >
      <div
        style={{
          maxWidth: "340px",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "var(--ff-space-12)",
        }}
      >
        {/* Message */}
        <p
          style={{
            fontFamily: "var(--ff-font-display)",
            fontSize: "28px",
            fontWeight: 300,
            letterSpacing: "-0.02em",
            lineHeight: 1.45,
            color: "var(--ff-ink)",
            textAlign: "center",
            margin: 0,
            opacity: messageReady ? 1 : 0,
            transition: "opacity 400ms ease",
          }}
        >
          {message}
        </p>

        {/* Button — fades in 300ms after message */}
        <button
          onClick={() => router.push("/today")}
          style={{
            maxWidth: "280px",
            width: "100%",
            padding: "13px 0",
            background: "var(--ff-ocean-600)",
            color: "var(--ff-white)",
            border: "none",
            borderRadius: "var(--ff-radius-pill)",
            fontFamily: "var(--ff-font-body)",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.01em",
            cursor: "pointer",
            opacity: 0,
            animation: messageReady
              ? "ff-fade-in 400ms ease 300ms forwards"
              : "none",
          }}
        >
          {buttonLabel}
        </button>
      </div>

      <style>{`
        @keyframes ff-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
