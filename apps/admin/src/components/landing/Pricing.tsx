import { Section } from "../ui/Section";
import { PricingCard } from "../ui/PricingCard";
import { SectionHeader } from "../ui/SectionHeader";

export function Pricing() {
  return (
    <Section className="pb-24 text-center" id="pricing">

      <SectionHeader
        title="Simple, Transparent Pricing"
        subtitle="One-time fee to download lead sheets. No subscriptions."
      />

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">

        <PricingCard
          title="Starter"
          price="$35"
          leads="Up to 200 leads"
          features={[
            "Downloadable lead sheet (CSV)",
            "Includes niche, country & signals",
          ]}
        />

        <PricingCard
          title="Pro"
          price="$49"
          leads="Up to 500 leads"
          features={[
            "Downloadable lead sheet (CSV)",
            "Includes niche, country & signals",
          ]}
          popular
        />

        <PricingCard
          title="Custom Leads"
          features={[
            "Custom niche & signal targeting",
            "Flexible lead volume",
            "Built based on your requirements",
          ]}
          cta="Book a Call"
          href="/contact"
          variant="custom"
        />
      </div>
    </Section>
  );
}