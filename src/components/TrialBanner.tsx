"use client";
import { useEffect, useState } from "react";

interface SubStatus {
  is_trial: boolean;
  days_remaining: number;
  tier: string;
}

export default function TrialBanner() {
  const [status, setStatus] = useState<SubStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/subscription/status", { credentials: "include" })
      .then((r) => r.json())
      .then(setStatus)
      .catch(() => {});
  }, []);

  if (!status?.is_trial || dismissed) return null;

  const { days_remaining } = status;
  const urgent = days_remaining <= 2;

  return (
    <div
      className="w-full flex items-center justify-between px-5 py-2.5 text-sm"
      style={{
        background: urgent
          ? "linear-gradient(90deg, #7c2d12, #9a3412)"
          : "linear-gradient(90deg, #4c1d95, #6d28d9)",
      }}
    >
      <div className="flex items-center gap-2.5 text-white">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          {days_remaining === 0
            ? "Your free trial expires today."
            : "You have "}
          {days_remaining > 0 && (
            <strong>
              {days_remaining} day{days_remaining !== 1 ? "s" : ""} left
            </strong>
          )}
          {days_remaining > 0 && " on your free trial."}{" "}
          Upgrade to keep full access.
        </span>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <a
          href="/pricing"
          className="bg-white font-semibold rounded-md px-3 py-1 text-xs no-underline"
          style={{ color: urgent ? "#9a3412" : "#6d28d9" }}
        >
          Upgrade Now
        </a>
        <button
          onClick={() => setDismissed(true)}
          className="text-white/50 hover:text-white text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  );
}
