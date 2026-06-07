"use client";

import { useEffect, useState } from "react";

export default function PwaInit() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .catch(() => {
          // SW registration failed — app still works, just no offline support
        });
    }

    // Offline detection
    setOffline(!navigator.onLine);
    const handleOffline = () => setOffline(true);
    const handleOnline = () => setOffline(false);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: "var(--ff-ocean-50)",
        borderBottom: "0.5px solid var(--ff-ocean-100)",
        padding: "10px 20px",
        fontFamily: "var(--ff-font-body)",
        fontSize: "12px",
        color: "var(--ff-ink-muted)",
        textAlign: "center",
      }}
    >
      You are offline. Your sessions are saved locally.
    </div>
  );
}
