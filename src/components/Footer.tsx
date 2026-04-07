export default function Footer() {
  return (
    <footer className="bg-pb-navy border-t border-pb-border-dk py-12">
      <div className="max-w-[980px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="mb-2">
              <svg width="22" height="22" viewBox="0 0 24 28" fill="#F0F2F5" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 0h4v28H0z"/>
                <path d="M4 0h8a8 8 0 010 16H4z"/>
                <path d="M4 14h9a7 7 0 010 14H4z"/>
              </svg>
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
            <a href="https://x.com/ProfitBldrs" className="text-xs text-pb-dim hover:text-white transition-colors">@ProfitBldrs</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
