"use client"

export default function CheatSheetView() {
  return (
    <>
      <style>{`
        @media print {
          @page { size: letter; margin: 0.4in; }
          .no-print { display: none !important; }
          body { background: white !important; }
        }
        .cheat-body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          color: #0a0a0a;
          background: white;
          min-height: 100vh;
        }
        .cheat-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }
        @media (max-width: 600px) {
          .cheat-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="cheat-body">
        {/* Print / Back bar (hidden in print) */}
        <div className="no-print" style={{ background: "#0a0a0a", color: "white", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <a href="/cheat-sheet" style={{ color: "#F97316", textDecoration: "none", fontSize: 13, fontWeight: 600 }}>&larr; Back to overview</a>
          <button
            onClick={() => window.print()}
            style={{ background: "#F97316", color: "white", border: "none", padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}
          >
            Print / Save as PDF
          </button>
        </div>

        <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px 40px" }}>
          {/* ── HEADER ── */}
          <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "2px solid #0a0a0a", paddingBottom: 14, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/pb-monogram.png"
                alt="Profit Builders"
                width={42}
                height={42}
                style={{ objectFit: "contain", borderRadius: 4 }}
              />
              <div>
                <div style={{ fontSize: 9, letterSpacing: 3, textTransform: "uppercase", color: "#F97316", fontWeight: 700, marginBottom: 3 }}>
                  PROFIT BUILDERS · OPTIONS FLOW
                </div>
                <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
                  The Options Flow Cheat Sheet
                </h1>
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: 10, color: "#6B7280", lineHeight: 1.5 }}>
              <strong style={{ color: "#0a0a0a" }}>profitbuilders.io</strong><br/>
              Live OPRA tape · CBOE Rule 6.11 sweeps
            </div>
          </header>

          {/* ── 9-FILTER ENGINE ── */}
          <section style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#F97316", fontWeight: 700, marginBottom: 6 }}>
              1 · The Institutional-Flow Filter Pipeline
            </div>
            <div style={{ fontSize: 11, color: "#374151", lineHeight: 1.5, marginBottom: 8 }}>
              Every signal must pass ALL nine to earn Grade A. Fails are filtered before reaching your screen.
            </div>
            <ol style={{ fontSize: 11, color: "#0a0a0a", paddingLeft: 18, margin: 0, lineHeight: 1.7 }}>
              <li><strong>Premium floor</strong> — $500K+ (Grade A) · $175K+ (Grade B)</li>
              <li><strong>Aggressive fill</strong> — at or above the ask (not passive bid)</li>
              <li><strong>Opening position</strong> — Vol/OI confirms new money, not a roll</li>
              <li><strong>Not market maker</strong> — MM activity filtered at the database layer</li>
              <li><strong>Favorable Vol/OI ratio</strong> — 5x+ for Grade B, 20x+ for Grade A</li>
              <li><strong>Single-leg</strong> — not the long leg of a hedged spread</li>
              <li><strong>Not deep ITM</strong> — not a stock replacement</li>
              <li><strong>Not a closing LEAP</strong> — excludes long-dated unwinds</li>
              <li><strong>Regime-aware threshold</strong> — adjusts with VIX volatility</li>
            </ol>
          </section>

          {/* ── GRADE THRESHOLDS + FLOW TYPES (two col) ── */}
          <div className="cheat-grid" style={{ marginBottom: 18 }}>
            <section>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#F97316", fontWeight: 700, marginBottom: 6 }}>
                2 · Grade Thresholds
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Grade</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Premium</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Vol/OI</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "6px 8px", color: "#F97316", fontWeight: 700 }}>A</td>
                    <td style={{ padding: "6px 8px" }}>$500K+</td>
                    <td style={{ padding: "6px 8px" }}>20x+</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "6px 8px", fontWeight: 700 }}>B</td>
                    <td style={{ padding: "6px 8px" }}>$175K+</td>
                    <td style={{ padding: "6px 8px" }}>5x+</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 8px", color: "#9CA3AF" }}>Below</td>
                    <td style={{ padding: "6px 8px", color: "#9CA3AF" }}>Filtered</td>
                    <td style={{ padding: "6px 8px", color: "#9CA3AF" }}>Filtered</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#F97316", fontWeight: 700, marginBottom: 6 }}>
                3 · Sweep vs Block
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.6 }}>
                <div style={{ marginBottom: 6 }}>
                  <strong>Sweep</strong> — hits multiple exchanges.<br/>
                  <span style={{ color: "#6B7280" }}>Says: &ldquo;I need this NOW.&rdquo;</span>
                </div>
                <div style={{ marginBottom: 6 }}>
                  <strong>Block</strong> — single large off-exchange fill.<br/>
                  <span style={{ color: "#6B7280" }}>Says: &ldquo;I&rsquo;ve been planning this.&rdquo;</span>
                </div>
                <div>
                  <strong>At ask</strong> = aggressive buy.<br/>
                  <strong>At bid</strong> = aggressive sell.<br/>
                  <strong>Mid</strong> = passive, lower signal.
                </div>
              </div>
            </section>
          </div>

          {/* ── VOL/OI + ACCUMULATION (two col) ── */}
          <div className="cheat-grid" style={{ marginBottom: 18 }}>
            <section>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#F97316", fontWeight: 700, marginBottom: 6 }}>
                4 · Vol/OI Reference
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                <thead>
                  <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E5E7EB" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Ratio</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontWeight: 700 }}>Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "6px 8px" }}>&lt; 2x</td>
                    <td style={{ padding: "6px 8px", color: "#6B7280" }}>Roll / adjustment &mdash; ignore</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                    <td style={{ padding: "6px 8px" }}>5x+</td>
                    <td style={{ padding: "6px 8px" }}>New money entering (Grade B)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "6px 8px", color: "#F97316", fontWeight: 700 }}>20x+</td>
                    <td style={{ padding: "6px 8px", fontWeight: 600 }}>Fresh conviction (Grade A)</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section>
              <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#F97316", fontWeight: 700, marginBottom: 6 }}>
                5 · Accumulation Checklist
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.65 }}>
                Confirm ALL four:
                <ul style={{ paddingLeft: 16, margin: "4px 0" }}>
                  <li>Same ticker, same strike, same expiry</li>
                  <li>Multiple prints in a tight window</li>
                  <li>Aggressive fills (at / above ask)</li>
                  <li>Elevated Vol/OI (fresh positioning)</li>
                </ul>
                <span style={{ color: "#6B7280" }}>
                  <em>5+ repeat hits = institutional accumulation.</em>
                </span>
              </div>
            </section>
          </div>

          {/* ── MORNING EDGE ── */}
          <section style={{ marginBottom: 14, padding: "12px 14px", background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 6 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#F97316", fontWeight: 700, marginBottom: 4 }}>
              6 · The Morning Edge Routine
            </div>
            <div style={{ fontSize: 11, color: "#0a0a0a", lineHeight: 1.6 }}>
              The first 30 minutes after the open is when the most actionable flow hits the tape. <strong>If you only have 30 minutes a day to scan, make it 9:30-10:00 AM ET.</strong> After the first hour, market maker hedging and spread activity increase — signal-to-noise ratio degrades.
            </div>
          </section>

          {/* ── FOOTER ── */}
          <footer style={{ borderTop: "1px solid #E5E7EB", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "baseline", fontSize: 10, color: "#6B7280" }}>
            <div>
              Real-time scanner + documented methodology: <strong style={{ color: "#F97316" }}>profitbuilders.io</strong>
            </div>
            <div>
              Free 7-day trial at /free-scanner
            </div>
          </footer>
        </div>
      </div>
    </>
  )
}
