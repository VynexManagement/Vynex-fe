'use client'
import { Hero } from "@/components/landing/Hero";
import { LeadsPreview } from "@/components/landing/LeadsPreview";
import { Features } from "@/components/landing/Features";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

export const SAMPLE_LEADS = [
  {
    name: "Glow Beauty Co",
    url: "glowbeautyco.myshopify.com",
    niche: "Beauty",
    country: "USA",
    signal: "No Email Marketing",
  },
  {
    name: "Nova Skin Studio",
    url: "novaskin-studio.myshopify.com",
    niche: "Beauty",
    country: "UK",
    signal: "No Email Marketing",
  },
  {
    name: "Pure Glow Labs",
    url: "pureglowlabs.myshopify.com",
    niche: "Beauty",
    country: "Canada",
    signal: "No Email Marketing",
  },
  {
    name: "Urban Fit Gear",
    url: "urbanfitgear.myshopify.com",
    niche: "Fitness",
    country: "USA",
    signal: "No Reviews",
  },
  {
    name: "Pet Haven Store",
    url: "pethaven-store.myshopify.com",
    niche: "Pets",
    country: "Australia",
    signal: "No Email Marketing",
  },
  {
    name: "Minimal Home Co",
    url: "minimalhomeco.myshopify.com",
    niche: "Home Decor",
    country: "USA",
    signal: "No Social Links",
  },
  {
    name: "Trendy Gadgets Hub",
    url: "trendygadgetshub.myshopify.com",
    niche: "Electronics",
    country: "India",
    signal: "Low Product Count",
  },
  {
    name: "Velvet Fashion",
    url: "velvetfashion.myshopify.com",
    niche: "Fashion",
    country: "UK",
    signal: "No Reviews",
  },
  {
    name: "Eco Living Store",
    url: "ecolivingstore.myshopify.com",
    niche: "Sustainability",
    country: "Canada",
    signal: "No Email Marketing",
  },
  {
    name: "Kids Joy Market",
    url: "kidsjoymarket.myshopify.com",
    niche: "Kids",
    country: "USA",
    signal: "No Social Links",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <Hero />
      <LeadsPreview leads={SAMPLE_LEADS} />
      <Features />
      <Pricing />
      <Footer />
    </main>
  );
}
