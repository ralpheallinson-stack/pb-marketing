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
    document.title = "Account | Profit Builders"
    fetch("/api/me")
      .then(r => { if (r.status === 401 || r.status === 403) { router.push("/login"); return null } return r.json() })
      .then(d => { if (d) setAccount(d) })
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false))
    // Fetch billing URL separately — only needed on this page
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
        setPwMsg("Password set successfully"); setPwOk(true); setNewPw(""); setConfirmPw("")
      } else {
        setPwMsg("Failed to set password")
      }
    } catch { setPwMsg("Network error") }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#0B0F1A" }}>
      <div className="text-[#4A5A72] text-sm">Loading...</div>
    </div>
  )

  const tierDisplay = account?.tier?.replace(/_/g, " ") || "—"
  const statusColor = account?.status === "active" || account?.status === "beta"
    ? "bg-[#22C55E]/15 text-[#22C55E] border-[#22C55E]/25"
    : account?.status === "trial"
    ? "bg-[#F5820A]/15 text-[#F5820A] border-[#F5820A]/25"
    : "bg-[#1E2530] text-[#7A8BA8] border-[#252E3D]"

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: "#0B0F1A" }}>

      <div className="w-full max-w-md rounded-2xl border border-[#1E2A3A] overflow-hidden" style={{ background: "#0F1520" }}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6 border-b border-[#1E2A3A]">
          <a href="/scanner" className="text-[10px] text-[#4A5A72] hover:text-[#7A8BA8] transition-colors">&larr; Back to Scanner</a>
          <h1 className="text-xl font-bold text-white mt-3">Account</h1>
        </div>

        {/* Info */}
        <div className="px-8 py-5 space-y-3.5 border-b border-[#1E2A3A]">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#7A8BA8]">Email</span>
            <span className="text-sm font-medium text-white">{account?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#7A8BA8]">Status</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${statusColor}`}>
              {account?.cancel_pending ? "Cancelling" : account?.status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#7A8BA8]">Plan</span>
            <span className="text-sm font-medium text-white capitalize">{tierDisplay}</span>
          </div>
          {account?.next_billing && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#7A8BA8]">{account.cancel_pending ? "Access until" : "Next billing"}</span>
              <span className="text-sm font-medium text-white">{account.next_billing}</span>
            </div>
          )}
        </div>

        {/* Password */}
        <div className="px-8 py-5 border-b border-[#1E2A3A]">
          <div className="text-sm font-semibold text-white mb-3">Password</div>
          <div className="space-y-2.5">
            <input type="password" placeholder="New password (min 8 chars)" value={newPw} onChange={e => setNewPw(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1E2A3A] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#3D4D63] focus:outline-none focus:border-[#F5820A]/50" />
            <input type="password" placeholder="Confirm password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              className="w-full bg-[#080C14] border border-[#1E2A3A] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#3D4D63] focus:outline-none focus:border-[#F5820A]/50" />
            {pwMsg && <p className={`text-xs ${pwOk ? "text-[#22C55E]" : "text-[#EF4444]"}`}>{pwMsg}</p>}
            <button onClick={handleSetPassword}
              className="w-full bg-[#1E2530] hover:bg-[#252E3D] border border-[#2E3A4D] text-white text-sm font-medium py-2.5 rounded-lg transition-colors">
              Set Password
            </button>
            <p className="text-[10px] text-[#3D4D63] leading-relaxed">Set a password so you can log in without your claim code.</p>
          </div>
        </div>

        {/* Actions */}
        <div className="px-8 py-5 space-y-2.5">
          {billingUrl && (
            <a href={billingUrl}
              className="block w-full text-center bg-[#F5820A] hover:bg-[#e57309] text-black font-bold text-sm py-3 rounded-lg transition-colors">
              Manage Billing
            </a>
          )}
          {!account?.cancel_pending && (
            <a href="/account/cancel"
              className="block w-full text-center bg-transparent hover:bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20 font-medium text-sm py-3 rounded-lg transition-colors">
              Cancel Subscription
            </a>
          )}
          <a href="/logout"
            className="block w-full text-center bg-transparent hover:bg-[#1E2530] text-[#7A8BA8] hover:text-[#E8EDF5] font-medium text-sm py-3 rounded-lg transition-colors">
            Log Out
          </a>
        </div>
      </div>
    </div>
  )
}
