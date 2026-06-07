"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getOpeningMessage, getButtonLabel } from "@/lib/messages";
import { getSharedAudioCtx } from "@/lib/audio";

function playKeyClick(ctx: AudioContext, isSpace: boolean) {
  if (ctx.state !== "running") return;

  const bufferSize = Math.floor(ctx.sampleRate * 0.016);
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 900 + Math.random() * 500;
  filter.Q.value = 1.2;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(isSpace ? 0.03 : 0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.016);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start();
}

export default function OpeningScreen() {
  const router = useRouter();
  const buttonLabel = getButtonLabel();

  const [displayedText, setDisplayedText] = useState("");
  const [showCursor, setShowCursor] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("ff_onboarded")) {
      router.replace("/onboarding");
      return;
    }

    // Use shared singleton — already "running" if user came from session page
    try {
      audioCtxRef.current = getSharedAudioCtx();
      audioCtxRef.current.resume().catch(() => {});
    } catch { /* no audio — animation continues */ }

    // Resume on first gesture so chars typed after interaction get sound
    const resumeOnGesture = () => {
      audioCtxRef.current?.resume().catch(() => {});
      document.removeEventListener("pointerdown", resumeOnGesture);
      document.removeEventListener("keydown", resumeOnGesture);
    };
    document.addEventListener("pointerdown", resumeOnGesture);
    document.addEventListener("keydown", resumeOnGesture);

    getOpeningMessage().then((msg) => {
      setShowCursor(true);
      let i = 0;

      const typeNext = () => {
        if (i >= msg.length) {
          // Cursor blinks for 500ms then button appears
          setTimeout(() => {
            setShowCursor(false);
            setTimeout(() => setShowButton(true), 150);
          }, 500);
          return;
        }

        const char = msg[i];
        i++;
        setDisplayedText(msg.slice(0, i));

        if (audioCtxRef.current) {
          playKeyClick(audioCtxRef.current, char === " ");
        }

        // Vary speed: spaces slightly longer, punctuation longer still
        const isPunct = ".,:;!?".includes(char);
        const delay = isPunct ? 140 : char === " " ? 65 : 38 + Math.random() * 22;
        setTimeout(typeNext, delay);
      };

      setTimeout(typeNext, 250);
    });

    return () => {
      document.removeEventListener("pointerdown", resumeOnGesture);
      document.removeEventListener("keydown", resumeOnGesture);
    };
  }, [router]);

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
        {/* Message — types in character by character */}
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
            minHeight: "3em",
          }}
        >
          {displayedText}
          {showCursor && (
            <span
              style={{
                display: "inline-block",
                width: "2px",
                height: "1em",
                background: "var(--ff-ocean-400)",
                marginLeft: "3px",
                verticalAlign: "middle",
                borderRadius: "1px",
                animation: "ff-cursor-blink 0.65s step-end infinite",
              }}
            />
          )}
        </p>

        {/* Button — slides in after typing is done */}
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
            cursor: showButton ? "pointer" : "default",
            opacity: showButton ? 1 : 0,
            transform: showButton ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 400ms ease, transform 400ms ease",
            pointerEvents: showButton ? "auto" : "none",
          }}
        >
          {buttonLabel}
        </button>
      </div>

      <style>{`
        @keyframes ff-cursor-blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
      `}</style>
    </main>
  );
}
