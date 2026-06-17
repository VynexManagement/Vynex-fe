import React from "react";
import { HeroSection } from "../features/landing/_components/HeroSection";
import { TrustLogobar } from "../features/landing/_components/TrustLogobar";
import { IntelligenceScale } from "../features/landing/_components/IntelligenceScale";
import { FeatureGrid } from "../features/landing/_components/FeatureGrid";
import { PricingGrid } from "../features/landing/_components/PricingGrid";
import { CTASection } from "../features/landing/_components/CTASection";
import { ContactForm } from "../features/landing/_components/ContactForm";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center w-full bg-white select-none overflow-x-hidden">
      <HeroSection />
      <TrustLogobar />
      <IntelligenceScale />
      <FeatureGrid />
      <PricingGrid />
      <CTASection />
      <ContactForm />
    </div>
  );
}
