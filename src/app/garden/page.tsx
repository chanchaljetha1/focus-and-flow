"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getGardenState } from "@/lib/db";
import { renderGarden, PlantLabel } from "@/lib/garden";

export default function GardenPage() {
  const router = useRouter();
  const [svgContent, setSvgContent] = useState("");
  const [plantLabels, setPlantLabels] = useState<PlantLabel[]>([]);
  const [activeLabel, setActiveLabel] = useState<PlantLabel | null>(null);
  const labelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getGardenState().then((state) => {
      const { svg, plantLabels: labels } = renderGarden(state);
      setSvgContent(svg);
      setPlantLabels(labels);
    });
  }, []);

  function handlePlantTap(label: PlantLabel) {
    setActiveLabel(label);
    if (labelTimerRef.current) clearTimeout(labelTimerRef.current);
    labelTimerRef.current = setTimeout(() => setActiveLabel(null), 3000);
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--ff-bg)",
      }}
    >
      {/* Back arrow */}
      <div
        style={{
          padding: "var(--ff-space-4) var(--ff-space-6)",
          maxWidth: "480px",
          margin: "0 auto",
          width: "100%",
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
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="13 4 7 10 13 16"/>
          </svg>
        </button>
      </div>

      {/* Garden container */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 var(--ff-space-4) var(--ff-space-8)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "480px",
          }}
        >
          {/* SVG garden */}
          {svgContent && (
            <div
              dangerouslySetInnerHTML={{ __html: svgContent }}
              style={{ width: "100%", borderRadius: "var(--ff-radius-lg)", overflow: "hidden" }}
            />
          )}

          {/* Invisible tap targets over each plant */}
          {plantLabels.map((label) => (
            <button
              key={label.id}
              onClick={() => handlePlantTap(label)}
              aria-label={`Plant: ${label.sessionRange}`}
              style={{
                position: "absolute",
                left: `${(label.cx / 480) * 100}%`,
                top: `${(label.cy / 320) * 100}%`,
                transform: "translate(-50%, -50%)",
                width: "60px",
                height: "60px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                borderRadius: "50%",
              }}
            />
          ))}

          {/* Active plant label */}
          {activeLabel && (
            <div
              style={{
                position: "absolute",
                left: `${(activeLabel.cx / 480) * 100}%`,
                top: `${(activeLabel.cy / 320) * 100}%`,
                transform: "translate(-50%, -120%)",
                background: "var(--ff-surface)",
                border: "0.5px solid var(--ff-ocean-100)",
                borderRadius: "var(--ff-radius-sm)",
                padding: "6px 12px",
                fontFamily: "var(--ff-font-body)",
                fontSize: "11px",
                color: "var(--ff-ink-muted)",
                whiteSpace: "nowrap",
                pointerEvents: "none",
                animation: "labelFadeIn 0.2s ease",
              }}
            >
              Grown from {activeLabel.sessionRange}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .garden-sway {
          animation-name: gardenSway;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }
        @keyframes gardenSway {
          from { transform: translateX(-2px); }
          to   { transform: translateX(2px); }
        }
        @keyframes labelFadeIn {
          from { opacity: 0; transform: translate(-50%, -110%); }
          to   { opacity: 1; transform: translate(-50%, -120%); }
        }
      `}</style>
    </main>
  );
}
