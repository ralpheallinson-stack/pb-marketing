'use client'

import { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import DynamicBadgeText from './DynamicBadgeText'
import SoftAurora from './SoftAurora'

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full blur-[120px]"
        style={{ width: 650, height: 650, background: '#2563eb', opacity: 0.15, top: '-15%', left: '5%' }}
        animate={{ x: [0, 70, -30, 0], y: [0, -50, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full blur-[140px]"
        style={{ width: 500, height: 500, background: '#4f46e5', opacity: 0.12, top: '25%', right: '0%' }}
        animate={{ x: [0, -50, 20, 0], y: [0, 70, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{ width: 400, height: 400, background: '#0e7490', opacity: 0.10, bottom: '5%', left: '35%' }}
        animate={{ x: [0, 50, -50, 0], y: [0, -30, 50, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 6 }}
      />
      <motion.div
        className="absolute rounded-full blur-[180px]"
        style={{ width: 800, height: 250, background: '#94a3b8', opacity: 0.07, top: '35%', left: '15%' }}
        animate={{ scaleX: [1, 1.15, 0.9, 1], opacity: [0.07, 0.11, 0.05, 0.07] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />
    </div>
  )
}

function Particles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    let animId: number
    let particles: Array<{x:number;y:number;r:number;dx:number;dy:number;op:number}> = []

    const init = () => {
      canvas.width = canvas.offsetWidth || window.innerWidth
      canvas.height = canvas.offsetHeight || window.innerHeight
      particles = Array.from({ length: 120 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.8 + 0.5,
        dx: (Math.random() - 0.5) * 0.2,
        dy: -(Math.random() * 0.25 + 0.07),
        op: Math.random() * 0.5 + 0.15,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${p.op})`
        ctx.fill()
        p.x += p.dx
        p.y += p.dy
        if (p.y < 0) p.y = canvas.height
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
      })
      animId = requestAnimationFrame(draw)
    }

    const handleResize = () => {
      canvas.width = canvas.offsetWidth || window.innerWidth
      canvas.height = canvas.offsetHeight || window.innerHeight
    }

    const timeout = setTimeout(() => {
      init()
      draw()
    }, 100)

    window.addEventListener('resize', handleResize)
    return () => {
      clearTimeout(timeout)
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.7, zIndex: 1 }}
    />
  )
}


const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: 'easeOut' as const },
})

export default function HeroSection() {

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#060810]">
      <div className="absolute inset-0 z-0">
        <SoftAurora
          color1="#ffffff"
          color2="#1e3a5f"
          speed={0.3}
          scale={1.2}
          brightness={0.6}
          bandHeight={0.75}
          bandSpread={1.0}
          noiseFrequency={2.5}
          noiseAmplitude={1.0}
          octaveDecay={0.1}
          layerOffset={0}
          colorSpeed={0.3}
          enableMouseInteraction={false}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-24 md:pt-32 pb-12 text-center">

        {/* Eyebrow */}
        <motion.div {...fadeUp(0)} className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.03] px-4 py-1 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
          </span>
          <DynamicBadgeText />
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.1)}
          className="font-extrabold leading-[1.05] tracking-tight mb-6"
          style={{ fontSize: 'clamp(52px, 8vw, 92px)' }}
        >
          <span className="text-white">Options Flow Scanner,</span>
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 30%, #94a3b8 60%, #e2e8f0 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 6s ease infinite',
          }}>
            Before the Move.
          </span>
        </motion.h1>

        {/* Subhead */}
        <motion.p {...fadeUp(0.2)} className="text-white/45 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
          Real-time institutional sweeps, blocks, and unusual prints — filtered by data, graded by conviction, delivered in seconds.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.3)} className="flex items-center justify-center gap-4 mb-4 flex-wrap">
          <Link
            href="/pricing"
            className="relative inline-flex items-center gap-2 rounded-full bg-[#F97316] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-[#F97316]/90 transition-all overflow-hidden"
          >
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-orange-400/40"
              animate={{ scale: [1, 1.14], opacity: [0.5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
            />
            Start Free 7 Day Trial
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-8 py-3.5 text-sm font-semibold text-white/60 hover:bg-white/[0.08] hover:text-white transition-all"
          >
            See pricing →
          </Link>
        </motion.div>

        <motion.p {...fadeUp(0.35)} className="text-white/20 text-xs font-mono mb-16">
          Free 7-day trial · Then $99/mo · Cancel anytime
        </motion.p>
      </div>

      {/* Scanner image */}
      <motion.div
        {...fadeUp(0.55)}
        className="relative z-10 max-w-[1120px] mx-auto px-4 pb-0"
      >
        <div className="relative rounded-xl overflow-hidden ring-1 ring-white/10 shadow-[0_32px_80px_rgba(0,0,0,0.7)]">
          <Image
            src="/images/scanner-preview.png"
            alt="Profit Builders Live Options Flow Scanner"
            width={1920}
            height={1440}
            className="w-full"
            priority
          />
          <div
            className="absolute top-0 left-0 right-0 h-32 pointer-events-none z-10"
            style={{ background: 'linear-gradient(to bottom, #080c10 0%, transparent 100%)' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
            style={{ background: 'linear-gradient(to top, #080c10 0%, transparent 100%)' }}
          />
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </section>
  )
}
