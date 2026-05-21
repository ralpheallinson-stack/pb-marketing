"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tremor/Tabs"
import { Input } from "@/components/tremor/Input"
import { Divider } from "@/components/tremor/Divider"
import { Button, buttonVariants } from "@/components/tremor/Button"
import { cn } from "@/lib/utils"

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
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

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
    document.title = "Account | Profit Builders"
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

  // Set/update password — backend takes new + confirm (no current-password
  // check; /api/me exposes no has_password flag), POST /account/set-password.
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0a0a0a" }}>
      <div className="text-[12px] tracking-[0.12em] text-stone-500 font-mono">LOADING...</div>
    </div>
  )

  const tier = account?.tier ?? "premium"
  const tierLabel = TIER_DISPLAY[tier] ?? tier.replace(/_/g, " ")
  const features = TIER_FEATURES[tier] ?? TIER_FEATURES.premium
  const isCancelling = account?.cancel_pending
  const statusLabel = (account?.status ?? "active").toUpperCase()

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0a" }}>
      <div className="mx-auto" style={{ maxWidth: 760, padding: "40px 32px 80px" }}>
        {/* Back link */}
        <a href="/scanner" className="text-[11px] uppercase tracking-[0.10em] text-stone-400 hover:text-stone-200 transition-colors">
          &larr; Back to scanner
        </a>

        {/* Page header */}
        <h1 className="mt-5 font-bold text-stone-50" style={{ fontSize: 28, letterSpacing: "-0.02em" }}>Account</h1>
        <p className="mt-2 text-[14px] text-stone-400" style={{ maxWidth: 540 }}>
          Manage your account, security, and subscription.
        </p>

        <Tabs defaultValue="account" className="mt-7">
          <TabsList>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="billing">Billing &amp; Plan</TabsTrigger>
          </TabsList>

          {/* ── TAB 1 — Account ── */}
          <TabsContent value="account" className="pt-7">
            {/* Email */}
            <h4 className="text-[15px] font-semibold text-stone-100">Email</h4>
            <p className="mt-1 text-[13px] text-stone-400">Update the email address associated with your account.</p>
            <div className="mt-3 max-w-sm">
              <Input type="email" defaultValue={account?.email ?? ""} placeholder={account?.email ?? "you@example.com"} disabled />
            </div>
            <p className="mt-2 text-[11px] text-stone-500">Email changes aren&apos;t available yet — contact support to update it.</p>

            <Divider />

            {/* Password */}
            <h4 className="text-[15px] font-semibold text-stone-100">Password</h4>
            <p className="mt-1 text-[13px] text-stone-400">Set a password to log in without your claim code, or update an existing one.</p>
            <div className="mt-3 flex max-w-sm flex-col gap-2.5">
              <Input type="password" placeholder="New password (min 8 chars)" value={newPw} onChange={e => setNewPw(e.target.value)} autoComplete="new-password" />
              <Input type="password" placeholder="Confirm password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} autoComplete="new-password" />
            </div>
            <div className="mt-3 flex items-center gap-3">
              <Button variant="primary" onClick={handleSetPassword} disabled={!newPw || !confirmPw}>Save password</Button>
              {pwMsg && <span className={cn("text-[12px]", pwOk ? "text-[#22c55e]" : "text-red-500")}>{pwMsg}</span>}
            </div>
          </TabsContent>

          {/* ── TAB 2 — Billing & Plan ── */}
          <TabsContent value="billing" className="pt-7">
            {/* Current plan */}
            <h4 className="text-[15px] font-semibold text-stone-100">Current plan</h4>
            <p className="mt-1 text-[13px] text-stone-400">Your active subscription and what&apos;s included.</p>

            <div className="mt-4 overflow-hidden rounded-[10px] border border-white/[0.08] bg-white/[0.025]" style={{ padding: 20 }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[20px] font-bold text-stone-50">{tierLabel}</div>
                  <span className="mt-1.5 inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.08em]"
                    style={{ background: "rgba(34,197,94,0.12)", borderColor: "rgba(34,197,94,0.30)", color: "#22c55e" }}>
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: "#22c55e" }} />
                    {statusLabel}
                  </span>
                  {account?.next_billing && (
                    <div className="mt-2 text-[12px] text-stone-500">
                      {isCancelling ? "Access until" : "Next billing"} &middot; {account.next_billing}
                    </div>
                  )}
                </div>
                {billingUrl && (
                  <a href={billingUrl} className={buttonVariants({ variant: "primary" })}>Manage plan &rarr;</a>
                )}
              </div>

              {/* full-bleed divider */}
              <div className="h-px bg-white/[0.08]" style={{ margin: "20px -20px" }} />

              <div className="text-[10px] uppercase tracking-[0.12em] text-stone-500">Included in your plan</div>
              <div className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-[13px] text-stone-300">
                    <CheckIcon />{f}
                  </div>
                ))}
              </div>
            </div>

            {/* Referral (kept — tucked into Billing tab) */}
            {referral && (
              <>
                <Divider />
                <h4 className="text-[15px] font-semibold text-stone-100">Refer &amp; earn</h4>
                <p className="mt-1 text-[13px] text-stone-400">Invite a trader — earn a $99 Stripe credit on every converted paid referral. No cap.</p>
                <div className="mt-3 flex max-w-md gap-2">
                  <Input type="text" value={referral.share_link} readOnly onFocus={e => e.currentTarget.select()} className="font-mono text-[12px]" />
                  <Button variant={copied ? "ghost" : "primary"} onClick={copyReferralLink} className="flex-shrink-0">{copied ? "Copied" : "Copy"}</Button>
                </div>
                <div className="mt-3 grid max-w-md grid-cols-3 gap-2">
                  {[
                    { label: "Signups", value: referral.total_referrals, color: "#fafafa" },
                    { label: "Converted", value: referral.converted, color: "#22d3ee" },
                    { label: "Earned", value: `$${referral.total_savings_usd}`, color: "#22c55e" },
                  ].map(s => (
                    <div key={s.label} className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-2">
                      <div className="text-[9px] uppercase tracking-[0.14em] text-stone-500">{s.label}</div>
                      <div className="mt-1 text-[18px] font-bold leading-none" style={{ color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <a href={`/referral/dashboard?email=${encodeURIComponent(account?.email ?? "")}`} className="mt-3 inline-block text-[12px] font-semibold text-[#22d3ee] hover:text-[#22d3ee]/80 transition-colors">
                  Full referral dashboard &rarr;
                </a>
              </>
            )}

            <Divider />

            {/* Cancel */}
            <h4 className="text-[15px] font-semibold" style={{ color: "#ef4444" }}>Cancel subscription</h4>
            {isCancelling ? (
              <p className="mt-1 text-[13px] text-stone-400">
                Cancellation scheduled — you&apos;ll keep access until {account?.next_billing ?? "the end of the billing cycle"}.
              </p>
            ) : (
              <>
                <p className="mt-1 text-[13px] text-stone-400">
                  End your subscription at the next billing cycle. You&apos;ll keep access until {account?.next_billing ?? "the end of the current cycle"}.
                </p>
                <a href="/account/cancel" className={cn(buttonVariants({ variant: "danger" }), "mt-3")}>Cancel subscription</a>
              </>
            )}

            <Divider />

            {/* Log out */}
            <h4 className="text-[15px] font-semibold text-stone-100">Log out</h4>
            <p className="mt-1 text-[13px] text-stone-400">Sign out of your account on this device.</p>
            <a href="/logout" className={cn(buttonVariants({ variant: "ghost" }), "mt-3")}>Log out</a>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
