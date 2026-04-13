"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import Nav from "@/components/Nav"

function LoginForm() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  return (
    <div className="bg-[#161B24] border border-[#252E3D] rounded-2xl p-10 w-full max-w-md mx-auto mt-32">
      {/* Logo */}
      <div className="text-center mb-8 flex justify-center">
        <img src="/images/pb-logo.png" alt="Profit Builders" width={40} height={40} className="w-10 h-10 object-contain" />
      </div>

      {/* Headline */}
      <h1 className="text-xl font-bold text-white mb-2 text-center">Welcome back.</h1>
      <p className="text-white/50 text-sm mb-8 text-center">
        Enter your email and claim code to access your scanner.
      </p>

      {/* Error */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 text-red-400 text-sm rounded-xl px-4 py-3 mb-6 text-center">
          {error === "locked"
            ? "Too many attempts. Try again in 15 minutes."
            : "Invalid email or claim code."}
        </div>
      )}

      {/* Form */}
      <form action="/login" method="POST">
        <input
          type="email"
          name="email"
          placeholder="your@email.com"
          required
          autoFocus
          className="w-full bg-[#1E2530] border border-[#252E3D] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50 mb-4"
        />
        <input
          type="password"
          name="password"
          placeholder="Your password"
          className="w-full bg-[#1E2530] border border-[#252E3D] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50 mb-4"
        />

        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/30 text-xs">or use claim code</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <input
          type="text"
          name="code"
          placeholder="PB-XXXXXXXX"
          className="w-full bg-[#1E2530] border border-[#252E3D] rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#60a5fa]/50 mb-4 font-mono uppercase tracking-wider"
        />

        <button
          type="submit"
          className="w-full bg-[#60a5fa] hover:bg-[#3b82f6] text-white font-semibold py-3 rounded-xl text-sm transition-colors mt-2"
        >
          Sign In
        </button>
      </form>

      <a href="/forgot-password" className="text-sm text-white/40 hover:text-white/70 transition-colors mt-3 block text-center">
        Forgot your password?
      </a>

      <p className="text-white/30 text-[11px] text-center mt-3">
        Set a password on your{" "}
        <a href="/account" className="text-[#60a5fa] hover:text-white">
          account page
        </a>{" "}
        after first login.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="min-h-screen" style={{ background: "#0E1117" }}>
      <Nav />
      <div className="px-6 pb-24">
        <Suspense fallback={
          <div className="bg-[#161B24] border border-[#252E3D] rounded-2xl p-10 w-full max-w-md mx-auto mt-32 text-center text-[#7A8BA8] text-sm">
            Loading...
          </div>
        }>
          <LoginForm />
        </Suspense>

        {/* Below card links */}
        <p className="text-white/30 text-xs text-center mt-6">
          Don&apos;t have an account?{" "}
          <a href="/checkout" className="text-[#60a5fa] hover:text-white">
            Start your free trial
          </a>
        </p>
        <p className="text-white/30 text-xs text-center mt-2">
          <a href="mailto:profitbuildersllc@rmoneycloud.com" className="text-white/30 hover:text-white">
            Need help? Contact Support
          </a>
        </p>
      </div>
    </div>
  )
}
