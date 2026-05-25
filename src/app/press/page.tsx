import type { Metadata } from "next"
import Link from "next/link"
import Nav from "@/components/Nav"
import Footer from "@/components/Footer"

const CANON = "https://profitbuilders.io/press"
const BOOKING_EMAIL = "profitbuildersllc@rmoneycloud.com"

// HEADSHOT — placeholder (PB logo mark, circular). Swap this single line with
// Ralph's real headshot URL when available; no other change needed.
const HEADSHOT_SRC = "/images/pb-logo.png"

export const metadata: Metadata = {
  title: { absolute: "Profit Builders — Press & Media Kit" },
  description:
    "Founder Ralph Linson available for interviews on options flow analytics, institutional smart money, and methodology transparency. Booking and topic list.",
  alternates: { canonical: CANON },
  openGraph: {
    title: "Profit Builders — Press & Media Kit",
    description:
      "Founder Ralph Linson available for interviews on options flow analytics, institutional smart money, and methodology transparency.",
    url: CANON,
    type: "profile",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Profit Builders Press & Media Kit" }],
  },
  twitter: { card: "summary_large_image", images: ["/opengraph-image"] },
}

const STATS = [
  ["17", "US options exchanges, OPRA-direct"],
  ["~$8–10B", "daily surfaced premium"],
  ["~21,000", "institutional prints / day"],
  ["~4%", "clear the Grade A conviction bar"],
]

const TOPICS = [
  ["Reading institutional flow in real time", "How to tell smart-money positioning from retail noise as it crosses the tape."],
  ["Why most “unusual options activity” is junk", "The metrics aggregators get wrong — contract count over premium size, and ignoring fill side."],
  ["The 0DTE boom and retail traders", "What the explosion in same-day options actually means for individual traders."],
  ["Methodology transparency in a black-box industry", "Building and publishing a public signal-outcomes log when competitors hide theirs."],
  ["The OPRA data pipeline", "Where retail tools cut corners on options data — and what direct, all-17-exchange ingestion changes."],
]

export default function PressPage() {
  return (
    <>
      <style>{`
        .pb-grain {
          background-image:
            radial-gradient(ellipse at 20% 10%, rgba(37,99,235,0.10), transparent 50%),
            radial-gradient(ellipse at 85% 40%, rgba(22,163,74,0.06), transparent 45%),
            linear-gradient(180deg, #0E1117 0%, #0B0E13 100%);
        }
        .pb-rule { background: linear-gradient(90deg, transparent, rgba(122,139,168,0.22) 8%, rgba(122,139,168,0.22) 92%, transparent); }
        .pb-hairline { border-color: rgba(122,139,168,0.14); }
        .pb-mono { font-family: "IBM Plex Mono", "Menlo", monospace; letter-spacing: -0.01em; }
        .pb-editorial { font-family: Georgia, "Times New Roman", serif; }
        .pb-section-num { font-family: "IBM Plex Mono", monospace; font-size: 10px; letter-spacing: 0.2em; color: #3D4D63; text-transform: uppercase; }
      `}</style>

      <Nav />

      <main className="pb-grain text-[#E8EDF5] min-h-screen">
        {/* Header */}
        <section className="pt-32 pb-14 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-10">
              <span className="pb-section-num">Press &amp; Media Kit</span>
              <span className="pb-rule h-px flex-1" />
              <span className="pb-mono text-[11px] text-[#3D4D63]">Updated May 2026</span>
            </div>

            <div className="flex items-center gap-6 max-md:flex-col max-md:items-start max-md:gap-5">
              <div className="shrink-0 w-[92px] h-[92px] rounded-full border border-[rgba(122,139,168,0.25)] bg-[#11161F] flex items-center justify-center overflow-hidden">
                <img src={HEADSHOT_SRC} alt="Ralph Linson — Profit Builders" width={56} height={56} className="w-14 h-14 object-contain opacity-90" />
              </div>
              <div>
                <h1 className="pb-editorial text-[40px] sm:text-[52px] leading-[1.05] tracking-[-0.025em] text-white">Ralph Linson</h1>
                <div className="pb-mono text-[13px] text-[#60a5fa] tracking-[0.04em] mt-2">Founder, Profit Builders</div>
                <div className="pb-mono text-[12px] text-white/40 tracking-[0.04em] mt-1">Cleveland, OH</div>
              </div>
            </div>

            <p className="pb-editorial text-[19px] md:text-[21px] leading-[1.55] text-white/70 max-w-[760px] mt-10">
              Ralph Linson is the founder of Profit Builders, an institutional options flow analytics platform built on OPRA-direct data from all 17 US options exchanges. He built it after finding that off-the-shelf flow scanners surfaced thousands of prints a day without grading any of them for conviction. Profit Builders does the analytical work instead: of the roughly 21,000 institutional prints it surfaces on a typical day — about $8–10 billion in premium — only ~4% clear its Grade A conviction bar. Its grading methodology and every signal&apos;s win/loss outcome are published publicly at <Link href="/methodology" className="text-[#60a5fa] hover:text-white transition-colors">profitbuilders.io/methodology</Link> — a transparency standard Ralph argues the industry should hold itself to.
            </p>
          </div>
        </section>

        {/* By the numbers */}
        <section className="px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto py-10 grid grid-cols-4 gap-6 max-md:grid-cols-2 max-md:gap-8">
            {STATS.map(([n, label]) => (
              <div key={label} className="text-center max-md:text-left">
                <div className="pb-editorial text-[30px] md:text-[34px] text-white font-normal tracking-[-0.01em]">{n}</div>
                <div className="pb-mono text-[11px] tracking-[0.04em] text-white/45 uppercase mt-2 leading-[1.4]">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Talking points */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">I.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Talking points.</h2>
            </div>
            <div className="border-t pb-hairline">
              <div className="py-6 border-b pb-hairline">
                <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-2 leading-[1.3]">Most &ldquo;unusual options activity&rdquo; is noise.</h3>
                <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Real institutional signal comes from premium size and fill aggression (above-ask / ask / mid / bid), not raw contract count — the metric most aggregator feeds weight, and the reason their direction labels are so often wrong.</p>
              </div>
              <div className="py-6 border-b pb-hairline">
                <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-2 leading-[1.3]">Methodology transparency should be the standard.</h3>
                <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Profit Builders publishes its grading logic and every signal&apos;s win/loss outcome; most scanners publish neither. The bar should be simple — if a tool won&apos;t show you its results, that&apos;s a no.</p>
              </div>
              <div className="py-6 border-b pb-hairline">
                <h3 className="pb-editorial text-[20px] md:text-[22px] text-white mb-2 leading-[1.3]">The 0DTE shift changes how to read flow.</h3>
                <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 max-w-[760px]">Same-day options are increasingly an institutional hedging tool, not just retail speculation — which changes what a given print is actually telling you.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Topics */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">II.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Topics I can speak to.</h2>
            </div>
            <div className="border-t pb-hairline">
              {TOPICS.map(([t, d]) => (
                <div key={t} className="grid grid-cols-[1fr_1.4fr] gap-6 py-5 border-b pb-hairline items-baseline max-md:grid-cols-1 max-md:gap-1">
                  <h3 className="pb-editorial text-[18px] md:text-[19px] text-white leading-[1.3]">{t}</h3>
                  <p className="pb-editorial text-[15px] leading-[1.55] text-white/55">{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recording + Booking */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">III.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Booking &amp; recording.</h2>
            </div>
            <div className="grid grid-cols-2 gap-10 max-md:grid-cols-1 max-md:gap-6">
              <div>
                <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-3">Recording</div>
                <p className="pb-editorial text-[16px] leading-[1.6] text-white/65">Mic + Zoom available; specifics on request. Available for recording most weekdays.</p>
              </div>
              <div>
                <div className="pb-mono text-[10px] tracking-[0.22em] text-white/40 uppercase mb-3">Booking</div>
                <p className="pb-editorial text-[16px] leading-[1.6] text-white/65 mb-3">For interviews, expert quotes, or podcast bookings:</p>
                <a href={`mailto:${BOOKING_EMAIL}`} className="pb-mono text-[15px] md:text-[17px] text-[#60a5fa] hover:text-white transition-colors break-all border-b border-[#60a5fa]/40 pb-0.5">{BOOKING_EMAIL}</a>
              </div>
            </div>
          </div>
        </section>

        {/* Recent appearances */}
        <section className="py-16 px-6 border-b pb-hairline">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-baseline gap-3 mb-8">
              <span className="pb-editorial italic text-[#60a5fa] text-[36px] leading-none">IV.</span>
              <h2 className="pb-editorial text-[28px] md:text-[34px] font-normal tracking-[-0.015em] text-white">Recent appearances.</h2>
            </div>
            <p className="pb-editorial italic text-[16px] leading-[1.6] text-white/45 max-w-[760px]">Appearances and press mentions will be listed here as they publish.</p>
          </div>
        </section>

        {/* Verification note */}
        <section className="py-10 px-6">
          <div className="max-w-5xl mx-auto">
            <p className="pb-mono text-[11px] leading-[1.7] text-white/35 tracking-[0.02em]">
              Quotes and stats on this page are verified against Profit Builders&apos; live pipeline. Methodology documented at <Link href="/methodology" className="text-white/55 hover:text-white transition-colors">/methodology</Link>.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
