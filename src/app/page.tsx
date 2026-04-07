import Nav from "@/components/Nav"
import Hero from "@/components/Hero"
import AlertCards from "@/components/AlertCards"
import WhyDifferent from "@/components/WhyDifferent"
import TrackRecord from "@/components/TrackRecord"
import Pricing from "@/components/Pricing"
import GexSection from "@/components/GexSection"
import EmailCapture from "@/components/EmailCapture"
import SocialProof from "@/components/SocialProof"
import FAQ from "@/components/FAQ"
import Footer from "@/components/Footer"

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <AlertCards />
      <WhyDifferent />
      <TrackRecord />
      <Pricing />
      <GexSection />
      <EmailCapture />
      <SocialProof />
      <FAQ />
      <Footer />
    </>
  )
}
