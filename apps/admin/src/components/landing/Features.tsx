import {
  Search,
  Zap,
  Database,
  Globe,
  Filter,
  Download,
} from "lucide-react";
import { Section } from "../ui/Section";
import { SectionHeader } from "../ui/SectionHeader";
import { Card } from "../ui/Card";

export const FEATURES = [
  {
    icon: Search,
    title: "Signal-Based Targeting",
    desc: "Find stores missing key tools like email marketing, reviews, or retention systems.",
  },
  {
    icon: Filter,
    title: "Niche + Country Filters",
    desc: "Target specific niches and markets like USA beauty, UK fashion, or fitness stores.",
  },
  {
    icon: Zap,
    title: "Instant Lead Preview",
    desc: "See real sample leads before purchasing so you know exactly what you're getting.",
  },
  {
    icon: Database,
    title: "Structured Lead Data",
    desc: "Get store name, URL, niche, country, and signals in a clean, ready-to-use format.",
  },
  {
    icon: Globe,
    title: "Global Store Coverage",
    desc: "Access Shopify stores across major markets including USA, UK, Canada, and more.",
  },
  {
    icon: Download,
    title: "One-Click CSV Export",
    desc: "Download your lead list instantly and import into your outreach tools.",
  },
];

export function Features() {
  return (
    <Section className="pb-20">
      <SectionHeader
        title="Features"
        subtitle="Everything you need to find high-value Shopify leads"
      />

      <div className="grid md:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;

          return (
            <Card
              key={i}
              className="p-6 space-y-4 hover:border-[#00adb5]/30 transition-colors"
            >
              <Icon className="text-[#00adb5] w-6 h-6" />

              <h3 className="text-[#eeeeee] font-semibold text-lg">
                {f.title}
              </h3>

              <p className="text-[#eeeeee]/50 text-sm leading-relaxed">
                {f.desc}
              </p>
            </Card>
          );
        })}
      </div>
    </Section>
  );
}