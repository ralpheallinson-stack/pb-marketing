import Nav from "@/components/Nav"
import Pricing from "@/components/Pricing"
import Footer from "@/components/Footer"

export const metadata = {
  title: "Pricing | Profit Builders — Options Flow Scanner",
  description: "Start with a 7-day free trial. GEX Heatmap from $39/mo. Full options flow scanner from $99/mo. No credit card required.",
  alternates: { canonical: "https://profitbuilders.org/pricing" },
}

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#0E1117]">
      <Nav />
      <div className="pt-20">
        <Pricing />
      </div>
      <Footer />
    </main>
  )
}
