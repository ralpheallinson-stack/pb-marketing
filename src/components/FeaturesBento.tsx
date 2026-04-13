"use client";

import { Activity, Shield, Bell, Grid3x3, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";

/* ── Types ───────────────────────────────────────────────── */

interface FeatureCardProps {
  name: string;
  description: string;
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  iconColor: string;
  className?: string;
  light?: boolean;
  children?: React.ReactNode;
}

/* ── Card shell ──────────────────────────────────────────── */

function FeatureCard({
  name,
  description,
  Icon,
  iconColor,
  className,
  light = false,
  children,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-6 transition-all",
        light
          ? "bg-white border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
          : "bg-[#1E2535] border-white/[0.08] hover:border-white/[0.15]",
        className
      )}
    >
      {children && <div className="flex-1 overflow-hidden">{children}</div>}
      <div className={cn("relative z-10", children ? "mt-4" : "")}>
        <Icon
          className="h-7 w-7 mb-3 transition-transform group-hover:scale-110"
          style={{ color: iconColor }}
        />
        <h3
          className={cn(
            "font-bold text-lg leading-tight mb-2",
            light ? "text-gray-900" : "text-white"
          )}
        >
          {name}
        </h3>
        <p
          className={cn(
            "text-sm leading-relaxed",
            light ? "text-gray-600" : "text-white/50"
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}

/* ── Signal row (used in center card) ────────────────────── */

interface SignalRowProps {
  ticker: string;
  premium: string;
  tag: string;
  tagColor: string;
  bg: string;
}

function SignalRow({ ticker, premium, tag, tagColor, bg }: SignalRowProps) {
  return (
    <div
      className="flex items-center justify-between rounded-xl border border-gray-200 bg-white/90 px-4 py-3 shadow-sm"
      style={{ borderLeft: `3px solid ${bg}` }}
    >
      <div className="flex items-center gap-3">
        <span className="font-mono font-bold text-sm text-gray-900">{ticker}</span>
        <span className="font-mono text-sm text-gray-700">{premium}</span>
      </div>
      <span
        className="text-[10px] font-bold font-mono tracking-wider px-2 py-0.5 rounded"
        style={{ background: `${tagColor}15`, color: tagColor }}
      >
        {tag}
      </span>
    </div>
  );
}

/* ── Grade row (used in right-bottom card) ───────────────── */

function GradeRow({
  grade,
  wr,
  color,
}: {
  grade: string;
  wr: string;
  color: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
      <div className="flex items-center gap-2">
        <span
          className="font-mono font-bold text-xs px-2 py-0.5 rounded"
          style={{ background: `${color}20`, color }}
        >
          {grade}
        </span>
        <span className="text-xs text-white/60">Win Rate</span>
      </div>
      <span className="font-mono font-bold text-sm" style={{ color }}>
        {wr}
      </span>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────── */

export default function FeaturesBento() {
  return (
    <section
      className="bg-[#0E1117] py-20 w-full"
      id="features"
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-mono uppercase tracking-[0.18em] text-white/40 mb-3 block">
            What You Get
          </span>
          <h2
            className="font-bold text-white"
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              letterSpacing: "-0.02em",
            }}
          >
            Alerts That Actually Matter.
          </h2>
          <p className="text-white/40 mt-3 text-base max-w-lg mx-auto">
            Premium, contracts, Greeks, and AI analysis — via web scanner,
            Discord, or Telegram. Under 8 seconds from exchange to screen.
          </p>
        </div>

        {/* Bento grid — 3 cols x 3 rows on lg */}
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:grid-rows-3 gap-4 auto-rows-[minmax(200px,auto)]">
          {/* Card 2 — top-left tall */}
          <FeatureCard
            className="lg:col-start-1 lg:col-end-2 lg:row-start-1 lg:row-end-3"
            Icon={Shield}
            iconColor="#22c55e"
            name="MM filtering"
            description="9 smart filters remove market maker hedges before delivery."
          />

          {/* Card 1 — center tall (light) */}
          <FeatureCard
            className="lg:col-start-2 lg:col-end-3 lg:row-start-1 lg:row-end-4"
            Icon={Activity}
            iconColor="#2563eb"
            light
            name="Real-time sweeps & blocks"
            description="Institutional flow delivered in under 8 seconds from exchange to screen."
          >
            <div className="h-full min-h-[220px] flex items-center justify-center overflow-hidden">
              <AnimatedList className="w-full" delay={1800}>
                <SignalRow
                  key="nvda"
                  ticker="NVDA"
                  premium="$2.1M"
                  tag="GRADE A"
                  tagColor="#22c55e"
                  bg="#22c55e"
                />
                <SignalRow
                  key="tsla"
                  ticker="TSLA"
                  premium="$4.1M"
                  tag="ACCUM"
                  tagColor="#2563eb"
                  bg="#2563eb"
                />
                <SignalRow
                  key="meta"
                  ticker="META"
                  premium="$1.8M"
                  tag="BLOCK"
                  tagColor="#a855f7"
                  bg="#a855f7"
                />
                <SignalRow
                  key="spx"
                  ticker="SPX"
                  premium="$890K"
                  tag="NOT DELIVERED"
                  tagColor="#ef4444"
                  bg="#ef4444"
                />
              </AnimatedList>
            </div>
          </FeatureCard>

          {/* Card 4 — top-right */}
          <FeatureCard
            className="lg:col-start-3 lg:col-end-4 lg:row-start-1 lg:row-end-2"
            Icon={Grid3x3}
            iconColor="#f97316"
            name="GEX heatmap"
            description="Gamma walls and regime flips mapped live."
          />

          {/* Card 3 — bottom-left */}
          <FeatureCard
            className="lg:col-start-1 lg:col-end-2 lg:row-start-3 lg:row-end-4"
            Icon={Bell}
            iconColor="#a855f7"
            name="Discord & Telegram"
            description="Formatted alerts with Greeks, IV, and AI analysis."
          />

          {/* Card 5 — bottom-right tall */}
          <FeatureCard
            className="lg:col-start-3 lg:col-end-4 lg:row-start-2 lg:row-end-4"
            Icon={Zap}
            iconColor="#f97316"
            name="AI conviction grading"
            description="Every signal graded A–C on premium, Vol/OI, and spread detection."
          >
            <div className="flex flex-col gap-2 mt-1">
              <GradeRow grade="A" wr="39.7%" color="#22c55e" />
              <GradeRow grade="B" wr="31.2%" color="#2563eb" />
              <GradeRow grade="C" wr="18.9%" color="#a855f7" />
            </div>
          </FeatureCard>
        </div>
      </div>
    </section>
  );
}
