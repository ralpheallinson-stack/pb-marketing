import { Alert, AlertDescription, AlertAction } from "@/components/ui/alert";
import { TriangleAlert, Info } from "lucide-react";

function MockBanner({ days }: { days: number }) {
  const urgent = days <= 2;
  const Icon = urgent ? TriangleAlert : Info;
  const message =
    days === 0
      ? "Your free trial expires today."
      : days === 1
      ? "Only 1 day left on your free trial."
      : `${days} days left on your free trial.`;

  return (
    <div className="px-4 pt-3">
      <Alert
        variant={urgent ? "warning" : "info"}
        className="border-2"
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

export default function TrialBannerPreview() {
  return (
    <div className="min-h-screen bg-[#080C12] py-12">
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40 mb-2 px-4">
            URGENT (≤2 DAYS) — warning variant
          </div>
          <MockBanner days={2} />
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40 mb-2 px-4">
            NORMAL (&gt;2 DAYS) — info variant
          </div>
          <MockBanner days={5} />
        </div>
        <div>
          <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-white/40 mb-2 px-4">
            EXPIRES TODAY (0 days) — warning variant
          </div>
          <MockBanner days={0} />
        </div>
      </div>
    </div>
  );
}
