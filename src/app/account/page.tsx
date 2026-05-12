"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface AccountData {
  email: string
  status: string
  tier: string
  next_billing: string | null
  cancel_pending: boolean
  gamma_wall: boolean
}

const TIER_DISPLAY: Record<string, string> = {
  premium: "Premium",
  heatmap: "Heatmap",
  pro_bundle: "Pro Bundle",
  lifetime: "Lifetime",
  beta: "Beta",
}

const TIER_FEATURES: Record<string, string[]> = {
  premium: [
    "Real-time scanner",
    "Conviction grading (A/B)",
    "Accumulation detection",
    "Discord alerts",
    "Telegram alerts",
    "Public methodology",
  ],
  heatmap: [
    "Real-time scanner",
    "Conviction grading (A/B)",
    "Accumulation detection",
    "GEX heatmaps",
    "Gamma walls",
    "Discord alerts",
    "Telegram alerts",
    "Public methodology",
  ],
  pro_bundle: [
    "Real-time scanner",
    "Conviction grading (A/B)",
    "Accumulation detection",
    "GEX heatmaps",
    "Gamma walls",
    "AI chart analyzer",
    "Discord alerts",
    "Telegram alerts",
    "Public methodology",
  ],
  lifetime: [
    "Real-time scanner",
    "Conviction grading (A/B)",
    "Accumulation detection",
    "GEX heatmaps",
    "Gamma walls",
    "AI chart analyzer",
    "Discord alerts",
    "Telegram alerts",
    "Public methodology",
    "Lifetime access",
  ],
  beta: [
    "Real-time scanner",
    "Conviction grading (A/B)",
    "Accumulation detection",
    "GEX heatmaps",
    "Gamma walls",
    "Discord alerts",
    "Telegram alerts",
    "Public methodology",
    "Beta access",
  ],
}

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
)

const JBM = '"IBM Plex Mono", Menlo, monospace'
const BEBAS = '"Bebas Neue", Impact, sans-serif'

export default function AccountPage() {
  const router = useRouter()
  const [account, setAccount] = useState<AccountData | null>(null)
  const [loading, setLoading] = useState(true)
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [pwMsg, setPwMsg] = useState("")
  const [pwOk, setPwOk] = useState(false)
  const [billingUrl, setBillingUrl] = useState<string | null>(null)
  const [referral, setReferral] = useState<{
    referral_code: string
    share_link: string
    total_referrals: number
    converted: number
    rewards_earned: number
    total_savings_usd: number
  } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    document.title = "Membership | Profit Builders"
    fetch("/api/me")
      .then(r => { if (r.status === 401 || r.status === 403) { router.push("/login"); return null } return r.json() })
      .then(d => { if (d) setAccount(d) })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
    fetch("/api/account/billing-url")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.url) setBillingUrl(d.url) })
      .catch(() => {})
    fetch("/api/referral-stats")
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d && d.referral_code) setReferral(d) })
      .catch(() => {})
  }, [router])

  const copyReferralLink = () => {
    if (!referral?.share_link) return
    navigator.clipboard.writeText(referral.share_link).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const handleSetPassword = async () => {
    setPwMsg(""); setPwOk(false)
    if (newPw.length < 8) { setPwMsg("Minimum 8 characters"); return }
    if (newPw !== confirmPw) { setPwMsg("Passwords do not match"); return }
    try {
      const r = await fetch("/account/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `password=${encodeURIComponent(newPw)}&confirm_password=${encodeURIComponent(confirmPw)}`,
        redirect: "manual",
      })
      if (r.ok || r.type === "opaqueredirect" || r.status === 302) {
        setPwMsg("Password updated"); setPwOk(true); setNewPw(""); setConfirmPw("")
      } else {
        setPwMsg("Failed to set password")
      }
    } catch { setPwMsg("Network error") }
  }

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0A0E17" }}>
      <div style={{ fontSize: 12, color: "#4A5A72", fontFamily: JBM, letterSpacing: "0.12em" }}>LOADING...</div>
    </div>
  )

  const tier = account?.tier ?? "premium"
  const tierLabel = TIER_DISPLAY[tier] ?? tier.replace(/_/g, " ")
  const features = TIER_FEATURES[tier] ?? TIER_FEATURES.premium
  const isActive = account?.status === "active" || account?.status === "beta"
  const isTrial = account?.status === "trial"
  const isCancelling = account?.cancel_pending

  const statusColor = isActive ? "#22C55E" : isTrial ? "#F97316" : "#6B7280"
  const statusLabel = isCancelling ? "Cancelling" : (account?.status ?? "—").toUpperCase()
  const gradientBar = isActive ? "linear-gradient(180deg, #F97316, #EC4899)" : isTrial ? "linear-gradient(180deg, #F59E0B, #F97316)" : "linear-gradient(180deg, #6B7280, #4B5563)"

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0A0E17",
        backgroundImage: "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(249,115,22,0.06) 0%, transparent 60%)",
        color: "#E8EDF5",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-16">

        {/* Back link — JetBrains Mono inline (Scope A) */}
        <a
          href="/scanner"
          className="inline-flex items-center gap-1.5 text-stone-500 hover:text-stone-200 transition-colors"
          style={{ fontFamily: JBM, fontSize: 11, fontWeight: 500, letterSpacing: "0.12em" }}
        >
          <span style={{ fontSize: 13 }}>&larr;</span> BACK TO SCANNER
        </a>

        {/* Header — pb-monogram + Bebas Neue heading + tagline + tier pill */}
        <div className="mt-8 mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="relative inline-block">
              <div
                aria-hidden
                className="absolute -inset-2 rounded-2xl"
                style={{ background: "radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)" }}
              />
              <img
                src="/images/pb-monogram.png"
                alt="Profit Builders"
                width={56}
                height={56}
                className="relative rounded-xl object-contain"
              />
            </div>
            <h1
              className="mt-4 text-stone-100"
              style={{ fontFamily: BEBAS, fontSize: 36, fontWeight: 400, letterSpacing: "0.06em" }}
            >
              MEMBERSHIP
            </h1>
            <p className="mt-2 max-w-md text-sm text-stone-400">
              Manage your subscription, security, and rewards in one place.
            </p>
          </div>
          {/* Tier pill — top-right */}
          <span
            className="self-start sm:self-end rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-stone-300 uppercase"
            style={{ fontFamily: JBM, letterSpacing: "0.18em" }}
          >
            {tierLabel}
          </span>
        </div>

        {/* Outer glass container */}
        <div className="rounded-3xl border border-white/10 bg-stone-950/85 backdrop-blur-xl p-5 sm:p-10">

          {/* 2-col inner grid: Security (left) + Plan (right) */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6 items-start">

            {/* SECURITY card */}
            <div className="rounded-2xl border border-white/10 bg-stone-900/45 backdrop-blur p-6">
              <h2 className="text-sm font-medium text-stone-100">Security</h2>
              <p className="mt-1 mb-5 text-xs text-stone-400">Control how you access your account.</p>

              {/* Email display */}
              <div className="mb-5">
                <div
                  className="mb-1 text-stone-500 uppercase"
                  style={{ fontFamily: JBM, fontSize: 10, letterSpacing: "0.18em" }}
                >
                  Email
                </div>
                <div className="text-sm text-stone-300">{account?.email}</div>
              </div>

              {/* Password form */}
              <div className="space-y-3">
                <input
                  type="password"
                  placeholder="New password (min 8 chars)"
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-stone-950/60 px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 transition-colors focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPw}
                  onChange={e => setConfirmPw(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-stone-950/60 px-3.5 py-2.5 text-sm text-stone-100 placeholder:text-stone-500 transition-colors focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
                {pwMsg && (
                  <div className={`flex items-center gap-2 text-xs ${pwOk ? "text-green-400" : "text-red-400"}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${pwOk ? "bg-green-400" : "bg-red-400"}`} />
                    {pwMsg}
                  </div>
                )}
                <button
                  onClick={handleSetPassword}
                  className="w-full rounded-full bg-cyan-400 hover:bg-cyan-300 text-stone-950 transition-colors uppercase"
                  style={{ fontFamily: JBM, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", padding: "10px 16px" }}
                >
                  Set password
                </button>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Set a password to log in without your claim code.
                </p>
              </div>
            </div>

            {/* PLAN card */}
            <div className="relative rounded-2xl border border-white/10 bg-stone-900/45 backdrop-blur p-6 overflow-hidden">
              {/* 4px gradient left bar — subscription state signal (preserved) */}
              <div
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-1"
                style={{ background: gradientBar }}
              />

              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-medium text-stone-100">Current plan</h2>
                  <p
                    className="mt-1 text-stone-300"
                    style={{ fontFamily: BEBAS, fontSize: 22, letterSpacing: "0.04em", lineHeight: 1 }}
                  >
                    {tierLabel.toUpperCase()}
                  </p>
                </div>
                {/* Status pill — 4-state color logic preserved */}
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 uppercase flex-shrink-0"
                  style={{
                    background: `${statusColor}15`,
                    border: `1px solid ${statusColor}30`,
                    color: statusColor,
                    fontFamily: JBM,
                    fontSize: 9,
                    fontWeight: 700,
                    letterSpacing: "0.1em",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}60` }}
                  />
                  {statusLabel}
                </span>
              </div>

              {/* Features list — circle-check icons */}
              <div className="mt-5 space-y-2.5">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-2.5 text-sm text-stone-300">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-cyan-400/10 text-cyan-400">
                      <CheckIcon />
                    </span>
                    {f}
                  </div>
                ))}
              </div>

              {/* Manage plan CTA — orange→pink brand gradient preserved */}
              {billingUrl && (
                <a
                  href={billingUrl}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full text-white transition-transform hover:-translate-y-0.5 uppercase"
                  style={{
                    background: "linear-gradient(135deg, #F97316, #EC4899)",
                    fontFamily: JBM,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    padding: "12px 20px",
                    boxShadow: "0 20px 60px -30px rgba(255, 120, 80, 0.4)",
                  }}
                >
                  Manage plan &rarr;
                </a>
              )}

              {/* Billing date — label flips per cancel_pending */}
              {account?.next_billing && (
                <p
                  className="mt-3 text-stone-500"
                  style={{ fontFamily: JBM, fontSize: 11, letterSpacing: "0.04em" }}
                >
                  {isCancelling ? "Access until" : "Next billing"}: {account.next_billing}
                </p>
              )}
            </div>

          </div> {/* end 2-col grid */}

          {/* REFERRAL panel — full-width below grid (128 lines preserved verbatim) */}
          {referral && (
            <div className="mt-6 rounded-2xl border border-white/10 bg-stone-900/45 backdrop-blur" style={{ padding: 22, color: "#D9E2F0" }}>
              <div style={{
                fontSize: 10, fontWeight: 700, color: "#F97316",
                letterSpacing: "0.24em", textTransform: "uppercase", marginBottom: 6,
              }}>
                Refer &amp; Earn
              </div>
              <div style={{
                fontSize: 18, fontWeight: 700, color: "#F8FAFC",
                letterSpacing: "-0.01em", marginBottom: 14, lineHeight: 1.3,
              }}>
                Invite a trader. Earn $99 on every paid referral.
              </div>

              {/* Share link row */}
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input
                  type="text"
                  value={referral.share_link}
                  readOnly
                  onFocus={(e) => (e.target as HTMLInputElement).select()}
                  style={{
                    flex: 1,
                    padding: "11px 12px",
                    background: "rgba(0,0,0,0.35)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8,
                    color: "#F8FAFC",
                    fontSize: 12,
                    fontFamily: JBM,
                    outline: "none",
                    minWidth: 0,
                  }}
                />
                <button
                  onClick={copyReferralLink}
                  style={{
                    padding: "11px 16px",
                    background: copied ? "#10B981" : "#F97316",
                    color: "#0A0E17",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    fontFamily: JBM,
                    flexShrink: 0,
                  }}
                >
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              {/* Stats row */}
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10, marginBottom: 14,
              }}>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, color: "#8494B0", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>Signups</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#F8FAFC", lineHeight: 1 }}>{referral.total_referrals}</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, color: "#8494B0", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>Converted</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#F97316", lineHeight: 1 }}>{referral.converted}</div>
                </div>
                <div style={{ background: "rgba(0,0,0,0.25)", borderRadius: 8, padding: "10px 12px" }}>
                  <div style={{ fontSize: 9, color: "#8494B0", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 4 }}>Earned</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#10B981", lineHeight: 1 }}>${referral.total_savings_usd}</div>
                </div>
              </div>

              {/* Share buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                <a
                  href={`https://x.com/intent/tweet?text=${encodeURIComponent("The flow scanner I actually use. CBOE-compliant sweep detection, OPRA condition codes, real-time institutional flow. 7-day free trial. " + referral.share_link)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1, textAlign: "center", padding: "10px 8px",
                    background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, color: "#D9E2F0", fontSize: 11, fontWeight: 600,
                    textDecoration: "none", letterSpacing: "0.04em",
                  }}
                >
                  Share on X
                </a>
                <a
                  href={`mailto:?subject=${encodeURIComponent("The options flow scanner I'm using")}&body=${encodeURIComponent("The flow scanner I actually use. CBOE-compliant sweep detection, OPRA condition codes, real-time institutional flow. 7-day free trial.\n\n" + referral.share_link)}`}
                  style={{
                    flex: 1, textAlign: "center", padding: "10px 8px",
                    background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, color: "#D9E2F0", fontSize: 11, fontWeight: 600,
                    textDecoration: "none", letterSpacing: "0.04em",
                  }}
                >
                  Email
                </a>
                <a
                  href={`/referral/dashboard?email=${encodeURIComponent(account?.email ?? "")}`}
                  style={{
                    flex: 1, textAlign: "center", padding: "10px 8px",
                    background: "rgba(0,0,0,0.25)", border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 8, color: "#D9E2F0", fontSize: 11, fontWeight: 600,
                    textDecoration: "none", letterSpacing: "0.04em",
                  }}
                >
                  Full dashboard &rarr;
                </a>
              </div>

              <div style={{ fontSize: 11, color: "#8494B0", marginTop: 12, lineHeight: 1.5 }}>
                $99 Stripe credit applies automatically on each converted paid referral. No cap.
              </div>
            </div>
          )}

          {/* DANGER ZONE — full-width below referral */}
          <div className="mt-6 rounded-2xl border border-red-900/40 bg-red-950/20 backdrop-blur p-6">
            <h2 className="text-sm font-medium text-stone-100">Danger zone</h2>
            <p className="mt-1 mb-5 text-xs text-stone-400">Irreversible account actions.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              {!isCancelling && (
                <a
                  href="/account/cancel"
                  className="flex-1 rounded-full border border-white/10 bg-white/5 text-stone-400 hover:bg-white/10 hover:text-stone-200 transition-colors text-center uppercase"
                  style={{ fontFamily: JBM, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", padding: "10px 20px" }}
                >
                  Cancel subscription
                </a>
              )}
              <a
                href="/logout"
                className="flex-1 rounded-full border border-white/10 bg-white/5 text-stone-300 hover:bg-stone-800/60 hover:text-stone-100 transition-colors text-center uppercase"
                style={{ fontFamily: JBM, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", padding: "10px 20px" }}
              >
                Log out
              </a>
            </div>
          </div>

        </div> {/* end outer glass container */}

        {/* Stripe footer — JetBrains Mono inline (Scope A) */}
        <div
          className="mt-12 flex items-center justify-center gap-1.5 text-stone-600"
          style={{ fontFamily: JBM, fontSize: 10, fontWeight: 500, letterSpacing: "0.06em" }}
        >
          <ShieldIcon />
          <span>SECURED VIA STRIPE &middot; PROFITBUILDERS.ORG</span>
        </div>

      </div>

      <style>{`
        input::placeholder { color: #44403c; }
      `}</style>
    </div>
  )
}
