"use client";

import { useEffect, useState } from "react";
import { isIdbUnavailable } from "@/lib/db";

export default function IdbBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger a DB access to surface any unavailability, then check flag
    import("@/lib/db").then(({ getDB }) => {
      getDB().catch(() => setShow(true));
    });
  }, []);

  if (!show || isIdbUnavailable() === false) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 999,
        padding: "10px 16px",
        background: "var(--ff-ocean-50)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <p
        style={{
          fontFamily: "var(--ff-font-body)",
          fontSize: "12px",
          color: "var(--ff-ink-muted)",
          margin: 0,
        }}
      >
        Local storage isn't available in private browsing. Your sessions won't be saved.
      </p>
      <button
        onClick={() => setShow(false)}
        style={{
          background: "none",
          border: "none",
          fontFamily: "var(--ff-font-body)",
          fontSize: "12px",
          color: "var(--ff-ink-muted)",
          cursor: "pointer",
          padding: "4px 8px",
          flexShrink: 0,
        }}
      >
        Dismiss
      </button>
    </div>
  );
}
