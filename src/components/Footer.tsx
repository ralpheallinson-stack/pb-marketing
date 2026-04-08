export default function Footer() {
  return (
    <footer className="bg-pb-navy border-t border-pb-border-dk py-12">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-2">
              <img src="/images/pb-logo.png" alt="Profit Builders" width={28} height={28} className="w-7 h-7 object-contain" />
            </div>
            <p className="text-xs text-pb-dim">Every signal tracked.</p>
          </div>
          <div>
            <h4 className="text-xs font-bold text-pb-dim uppercase tracking-widest mb-3 font-mono">Product</h4>
            {[["Features","/#features"],["Results","/results"],["AI Analyzer","/ai-analyzer"],["Pricing","/#pricing"]].map(([l,h])=>(
              <a key={l} href={h} className="block text-sm text-pb-dim hover:text-white transition-colors py-1">{l}</a>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-bold text-pb-dim uppercase tracking-widest mb-3 font-mono">Company</h4>
            {[["About","/about"],["FAQ","/#faq"],["Blog","/blog"],["Community","/community"]].map(([l,h])=>(
              <a key={l} href={h} className="block text-sm text-pb-dim hover:text-white transition-colors py-1">{l}</a>
            ))}
          </div>
          <div>
            <h4 className="text-xs font-bold text-pb-dim uppercase tracking-widest mb-3 font-mono">Subscribers</h4>
            {[["Scanner Login","/login"],["Refer & Earn","/referral/dashboard"],["Free Scanner","/free-scanner"]].map(([l,h])=>(
              <a key={l} href={h} className="block text-sm text-pb-dim hover:text-white transition-colors py-1">{l}</a>
            ))}
          </div>
        </div>
        <div className="border-t border-pb-border-dk pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-pb-dim">© 2026 Profit Builders LLC</p>
          <div className="flex gap-4">
            {[["Terms","/terms"],["Privacy","/privacy"],["Refunds","/refund"]].map(([l,h])=>(
              <a key={l} href={h} className="text-xs text-pb-dim hover:text-white transition-colors">{l}</a>
            ))}
            <a href="https://x.com/ProfitBldrs" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-pb-dim hover:text-white transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              @ProfitBldrs
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
