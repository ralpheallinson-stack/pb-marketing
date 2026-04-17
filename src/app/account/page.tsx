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
    "Public track record",
  ],
  heatmap: [
    "Real-time scanner",
    "Conviction grading (A/B)",
    "Accumulation detection",
    "GEX heatmaps",
    "Gamma walls",
    "Discord alerts",
    "Telegram alerts",
    "Public track record",
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
    "Public track record",
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
    "Public track record",
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
    "Public track record",
    "Beta access",
  ],
}

const CheckIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const ShieldIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    <path d="m9 12 2 2 4-4" />
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
  }, [router])

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
      <div style={{ fontSize: 12, color: "#4A5A72", fontFamily: "JetBrains Mono, monospace", letterSpacing: "0.12em" }}>LOADING...</div>
    </div>
  )

  const tier = account?.tier ?? "premium"
  const tierLabel = TIER_DISPLAY[tier] ?? tier.replace(/_/g, " ")
  const features = TIER_FEATURES[tier] ?? TIER_FEATURES.premium
  const isActive = account?.status === "active" || account?.status === "beta"
  const isTrial = account?.status === "trial"
  const isCancelling = account?.cancel_pending

  const statusColor = isActive ? "#22C55E" : isTrial ? "#F97316" : "#6B7280"
  const statusLabel = isCancelling ? "Cancelling" : account?.status ?? "—"
  const gradientBar = isActive ? "linear-gradient(180deg, #F97316, #EC4899)" : isTrial ? "linear-gradient(180deg, #F59E0B, #F97316)" : "linear-gradient(180deg, #6B7280, #4B5563)"

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0A0E17",
      backgroundImage: "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(249,115,22,0.06) 0%, transparent 60%)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "48px 16px 64px",
      fontFamily: '"Bricolage Grotesque", "Inter", system-ui, sans-serif',
      color: "#E8EDF5",
    }}>

      {/* Back link */}
      <div style={{ width: "100%", maxWidth: 480, marginBottom: 32 }}>
        <a
          href="/scanner"
          style={{
            fontSize: 11, fontWeight: 500, letterSpacing: "0.08em",
            color: "#4A5A72", textDecoration: "none",
            fontFamily: "JetBrains Mono, monospace",
            display: "inline-flex", alignItems: "center", gap: 6,
          }}
        >
          <span style={{ fontSize: 14 }}>&larr;</span> BACK TO SCANNER
        </a>
      </div>

      {/* Logo + title */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ position: "relative", display: "inline-block", marginBottom: 16 }}>
          <div style={{
            position: "absolute", inset: -8, borderRadius: 16,
            background: "radial-gradient(circle, rgba(249,115,22,0.12), transparent 70%)",
          }} />
          <img
            src="/images/pb-monogram.png"
            alt="Profit Builders"
            width={64}
            height={64}
            style={{
              position: "relative",
              borderRadius: 12,
              objectFit: "contain",
            }}
          />
        </div>
        <h1 style={{
          fontFamily: '"Bebas Neue", Impact, sans-serif',
          fontSize: 28, fontWeight: 400, letterSpacing: "0.06em",
          color: "#E8EDF5", margin: 0,
        }}>
          MEMBERSHIP
        </h1>
      </div>

      {/* Plan card */}
      <div style={{
        width: "100%", maxWidth: 480,
        background: "#0F1520",
        border: "1px solid #1E2A3A",
        borderRadius: 14,
        overflow: "hidden",
        marginBottom: 24,
        position: "relative",
      }}>
        {/* Gradient left bar */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0,
          width: 4, background: gradientBar,
        }} />

        {/* Plan header */}
        <div style={{ padding: "20px 24px 16px 28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <div style={{
                fontSize: 11, fontWeight: 700, letterSpacing: "0.14em",
                color: "#4A5A72", marginBottom: 4,
                fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase",
              }}>
                YOUR PLAN
              </div>
              <div style={{
                fontFamily: '"Bebas Neue", Impact, sans-serif',
                fontSize: 32, fontWeight: 400, letterSpacing: "0.02em",
                color: "#E8EDF5", lineHeight: 0.9,
                textTransform: "uppercase",
              }}>
                {tierLabel}
              </div>
            </div>
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "4px 10px", borderRadius: 999,
              background: `${statusColor}15`,
              border: `1px solid ${statusColor}30`,
            }}>
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: statusColor,
                boxShadow: `0 0 8px ${statusColor}60`,
              }} />
              <span style={{
                fontSize: 10, fontWeight: 700, letterSpacing: "0.1em",
                color: statusColor, textTransform: "uppercase",
                fontFamily: "JetBrains Mono, monospace",
              }}>
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Email + billing */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: "#7A8BA8" }}>{account?.email}</span>
            {account?.next_billing && (
              <span style={{ fontSize: 11, color: "#4A5A72", fontFamily: "JetBrains Mono, monospace" }}>
                {isCancelling ? "Access until" : "Next billing"}: {account.next_billing}
              </span>
            )}
          </div>

          {/* Features grid */}
          <div style={{
            borderTop: "1px solid #1E2A3A",
            paddingTop: 14,
          }}>
            <div style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.12em",
              color: "#4A5A72", marginBottom: 10,
              fontFamily: "JetBrains Mono, monospace",
            }}>
              INCLUDED
            </div>
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: "6px 16px",
            }}>
              {features.map((f) => (
                <div key={f} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: "#22C55E", flexShrink: 0 }}><CheckIcon /></span>
                  <span style={{ fontSize: 12, color: "#9CA8BE" }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Security section */}
      <div style={{
        width: "100%", maxWidth: 480,
        background: "#0F1520",
        border: "1px solid #1E2A3A",
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 24,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          color: "#4A5A72", marginBottom: 14,
          fontFamily: "JetBrains Mono, monospace",
        }}>
          SECURITY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <input
            type="password"
            placeholder="New password (min 8 chars)"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px",
              fontSize: 13, color: "#E8EDF5",
              background: "#080C14",
              border: "1px solid #1E2A3A",
              borderRadius: 8, outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPw}
            onChange={e => setConfirmPw(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px",
              fontSize: 13, color: "#E8EDF5",
              background: "#080C14",
              border: "1px solid #1E2A3A",
              borderRadius: 8, outline: "none",
              fontFamily: "inherit",
              boxSizing: "border-box",
            }}
          />
          {pwMsg && (
            <div style={{
              fontSize: 12,
              color: pwOk ? "#22C55E" : "#EF4444",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <span style={{ width: 4, height: 4, borderRadius: "50%", background: pwOk ? "#22C55E" : "#EF4444" }} />
              {pwMsg}
            </div>
          )}
          <button
            onClick={handleSetPassword}
            style={{
              width: "100%", padding: "10px",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
              color: "#E8EDF5",
              background: "#1E2530",
              border: "1px solid #2E3A4D",
              borderRadius: 8, cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
              textTransform: "uppercase",
            }}
          >
            SET PASSWORD
          </button>
          <div style={{ fontSize: 10, color: "#3D4D63", lineHeight: 1.5 }}>
            Set a password to log in without your claim code.
          </div>
        </div>
      </div>

      {/* Billing section */}
      {billingUrl && (
        <div style={{
          width: "100%", maxWidth: 480,
          marginBottom: 24,
        }}>
          <a
            href={billingUrl}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: "14px",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.06em",
              color: "#0A0E17",
              background: "linear-gradient(135deg, #F97316, #EC4899)",
              border: "none", borderRadius: 10,
              textDecoration: "none", cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
              textTransform: "uppercase",
              boxSizing: "border-box",
            }}
          >
            MANAGE BILLING &rarr;
          </a>
        </div>
      )}

      {/* Danger zone */}
      <div style={{
        width: "100%", maxWidth: 480,
        background: "#0F1520",
        border: "1px solid #1E2A3A",
        borderRadius: 14,
        padding: "20px 24px",
        marginBottom: 32,
      }}>
        <div style={{
          fontSize: 10, fontWeight: 700, letterSpacing: "0.14em",
          color: "#EF4444", marginBottom: 14,
          fontFamily: "JetBrains Mono, monospace",
          opacity: 0.7,
        }}>
          DANGER ZONE
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {!isCancelling && (
            <a
              href="/account/cancel"
              style={{
                flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
                padding: "10px",
                fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                color: "#EF4444",
                background: "rgba(239,68,68,0.08)",
                border: "1px solid rgba(239,68,68,0.2)",
                borderRadius: 8, textDecoration: "none", cursor: "pointer",
                fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase",
              }}
            >
              CANCEL SUBSCRIPTION
            </a>
          )}
          <a
            href="/logout"
            style={{
              flex: isCancelling ? 1 : undefined,
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "10px 20px",
              fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
              color: "#4A5A72",
              background: "transparent",
              border: "1px solid #1E2A3A",
              borderRadius: 8, textDecoration: "none", cursor: "pointer",
              fontFamily: "JetBrains Mono, monospace",
              textTransform: "uppercase",
            }}
          >
            LOG OUT
          </a>
        </div>
      </div>

      {/* Footer trust signal */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        fontSize: 10, fontWeight: 500, letterSpacing: "0.06em",
        color: "#2A3444",
        fontFamily: "JetBrains Mono, monospace",
      }}>
        <ShieldIcon />
        <span>SECURED VIA STRIPE &middot; PROFITBUILDERS.ORG</span>
      </div>

      <style>{`
        input:focus {
          border-color: rgba(249, 115, 22, 0.5) !important;
          box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.08);
        }
        input::placeholder { color: #3D4D63; }
        button:hover { background: #252E3D !important; }
        a[href="/account/cancel"]:hover { background: rgba(239,68,68,0.15) !important; }
        a[href="/logout"]:hover { color: #7A8BA8 !important; background: #1E2530 !important; }
      `}</style>
    </div>
  )
}
