"use client";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertAction } from "@/components/ui/alert";
import { TriangleAlert, Info } from "lucide-react";

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
  const Icon = urgent ? TriangleAlert : Info;

  const message =
    days_remaining === 0
      ? "Your free trial expires today."
      : days_remaining === 1
      ? "Only 1 day left on your free trial."
      : `${days_remaining} days left on your free trial.`;

  return (
    <div className="px-4 pt-3">
      <Alert
        variant={urgent ? "warning" : "info"}
        className="border-2 bg-[var(--warning)]/15 [&]:bg-opacity-100 [&>svg]:size-4"
        style={{
          backgroundColor: urgent
            ? "color-mix(in oklch, var(--warning) 15%, transparent)"
            : "color-mix(in oklch, var(--info) 15%, transparent)",
          borderColor: urgent
            ? "color-mix(in oklch, var(--warning) 60%, transparent)"
            : "color-mix(in oklch, var(--info) 60%, transparent)",
        }}
      >
        <Icon />
        <AlertDescription className="text-white/90">
          <span>{message} Upgrade to keep full access.</span>
        </AlertDescription>
        <AlertAction>
          <a
            href="/pricing"
            className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-md bg-white text-[#0a0d12] hover:bg-white/90 transition-colors no-underline"
          >
            Upgrade Now
          </a>
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss"
            className="ml-1 text-white/40 hover:text-white text-lg leading-none w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </AlertAction>
      </Alert>
    </div>
  );
}
