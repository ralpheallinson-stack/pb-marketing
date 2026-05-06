import Link from "next/link"

/**
 * Sticky right-rail conversion card for blog posts. Lives below the TOC
 * in the desktop sidebar. The single highest-ROI surface on the marketing
 * blog — visible the entire time the reader is on the page, where the
 * inline mid-article CTAs only fire for readers who scroll past them.
 *
 * Optional `ticker` prop lets recap-style posts deep-link straight to the
 * relevant per-ticker scanner page; falls back to /scanner.
 */
export default function BlogPromoCTA({ ticker }: { ticker?: string }) {
  const scannerHref = ticker ? `/options-flow/${ticker}` : "/scanner"

  return (
    <aside
      aria-label="Try the scanner"
      className="rounded-xl border border-gray-200 bg-gradient-to-br from-orange-50/60 via-white to-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F97316]" />
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#F97316]">
          Live scanner
        </span>
      </div>

      <h3 className="text-[15px] font-bold text-gray-950 leading-snug tracking-tight mb-2">
        Watch institutional flow in real time
      </h3>

      <p className="text-[12.5px] text-gray-600 leading-relaxed mb-4">
        OPRA tape, conviction grading, and gamma walls across 220+ tickers.
        Same engine that powers the recaps in this blog.
      </p>

      <Link
        href="/pricing"
        className="block w-full text-center text-[12.5px] font-semibold text-white bg-[#F97316] hover:bg-[#EA580C] rounded-lg px-4 py-2.5 transition-colors mb-2"
      >
        Start 7-day free trial
      </Link>

      <Link
        href={scannerHref}
        className="block w-full text-center text-[12.5px] font-semibold text-gray-700 hover:text-[#F97316] transition-colors"
      >
        {ticker ? `See ${ticker} flow →` : "Open the free scanner →"}
      </Link>

      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[10.5px] text-gray-400">
        <span className="font-mono uppercase tracking-wider">$99/mo</span>
        <span>Card req · cancel anytime</span>
      </div>
    </aside>
  )
}
