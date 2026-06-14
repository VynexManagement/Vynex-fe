'use client'

import React from "react";
import { 
  Store, 
  ShoppingCart, 
  Truck, 
  Package, 
  CreditCard,
  Target, 
  Filter, 
  Eye, 
  Code, 
  Globe, 
  Download,
  ArrowRight,
  Check
} from "lucide-react";
import { Button, ContactForm } from "@leadflow/ui";

export default function LandingPage() {
  const sampleLeads = [
    {
      name: "Trendsetter Threads",
      platform: "Shopify Plus",
      tool: "Klaviyo",
      toolBg: "bg-red-50 text-red-500",
    },
    {
      name: "Eco Living Essentials",
      platform: "Shopify",
      tool: "LoyaltyLion",
      toolBg: "bg-blue-50 text-blue-500",
    },
    {
      name: "Tech Gadgets Co.",
      platform: "Shopify",
      tool: "Gorgias",
      toolBg: "bg-purple-50 text-purple-500",
    },
  ];

  const features = [
    {
      icon: <Target className="w-5 h-5 text-indigo-500" />,
      title: "Signal-Based Targeting",
      desc: "Find stores actively installing or removing competitor apps. Timing is everything.",
    },
    {
      icon: <Filter className="w-5 h-5 text-indigo-500" />,
      title: "Niche Filters",
      desc: "Filter by revenue estimates, traffic, tech stack, and industry to build hyper-targeted lists.",
    },
    {
      icon: <Eye className="w-5 h-5 text-indigo-500" />,
      title: "Instant Preview",
      desc: "Get a deep dive into any store's anatomy before you even draft an email.",
    },
    {
      icon: <Code className="w-5 h-5 text-indigo-500" />,
      title: "Structured Data",
      desc: "Clean, enriched data ready to feed directly into your sales workflows.",
    },
    {
      icon: <Globe className="w-5 h-5 text-indigo-500" />,
      title: "Global Coverage",
      desc: "Track ecommerce stores across the globe, not just North America.",
    },
    {
      icon: <Download className="w-5 h-5 text-indigo-500" />,
      title: "One-Click Export",
      desc: "Export to CSV or excel sheet conveniently",
    },
  ];

  return (
    <div className="flex flex-col items-center w-full bg-white select-none">
      
      {/* HERO SECTION */}
      <section className="w-full pt-28 pb-16 text-center flex flex-col items-center px-6 max-w-6xl">
        <h1 className="text-[2.75rem] md:text-[4rem] font-bold tracking-tight text-slate-900 leading-[1.15] max-w-4xl">
          Find High-Converting Shopify Leads Before Your Competitors Do
        </h1>
        <p className="mt-6 text-lg text-slate-500 max-w-2xl leading-relaxed">
          Discover stores missing key growth tools and reach out with the perfect pitch.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Button variant="primary" size="lg" className="bg-[#6366f1] hover:bg-[#4f46e5]" onClick={() => window.location.href = "http://localhost:3001/signup"}>
            Start Free Trial
          </Button>
          <Button variant="outline" size="lg" className="border-indigo-600 text-[#6366f1] hover:bg-indigo-50" onClick={() => window.location.href = "#contact"}>
            Book a demo
          </Button>
        </div>
      </section>

      {/* LIVE LEAD PREVIEW TABLE CARD */}
      <section className="w-full max-w-4xl px-6 pb-24">
        <div className="premium-shadow-card border border-slate-100/80 bg-white overflow-hidden">
          {/* Browser header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-50">
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-400"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
              <span className="w-3 h-3 rounded-full bg-green-400"></span>
            </div>
            <div className="text-[10px] font-semibold text-slate-400 tracking-widest uppercase">
              Live Lead Preview
            </div>
            <div className="flex gap-1 text-slate-300">
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
              <span className="w-1 h-1 rounded-full bg-slate-300"></span>
            </div>
          </div>
          {/* Table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[600px]">
              <thead>
                <tr className="bg-white text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-50">
                  <th className="px-8 py-5">Store Name</th>
                  <th className="px-8 py-5">Platform</th>
                  <th className="px-8 py-5">Missing Tools</th>
                  <th className="px-8 py-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 font-medium">
                {sampleLeads.map((lead, i) => (
                  <tr key={i} className="hover:bg-slate-50/20 transition-colors">
                    <td className="px-8 py-5 text-slate-800 font-semibold">{lead.name}</td>
                    <td className="px-8 py-5 text-slate-500">{lead.platform}</td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${lead.toolBg}`}>
                        {lead.tool}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <a href="http://localhost:3001/login" className="text-[#6366f1] hover:text-[#4f46e5] text-sm font-semibold transition-colors">
                        Reveal
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* BRAND TRUST ICONS BAR */}
      <section className="w-full bg-slate-50/50 py-14 border-y border-slate-100 flex flex-col items-center px-6">
        <div className="text-[10px] font-bold text-slate-400 tracking-[0.2em] text-center uppercase mb-8">
          Powering the next generation of Shopify agencies
        </div>
        <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 text-slate-300">
          <Store className="w-9 h-9" />
          <ShoppingCart className="w-9 h-9" />
          <Truck className="w-9 h-9" />
          <Package className="w-9 h-9" />
          <CreditCard className="w-9 h-9" />
        </div>
      </section>

      {/* INTELLIGENCE AT SCALE SECTION */}
      <section className="w-full py-28 relative overflow-hidden flex flex-col items-center px-6">
        {/* Glow Blur Effect in Background */}
        <div className="absolute right-0 top-1/4 w-96 h-96 rounded-full bg-gradient-to-tr from-yellow-100 via-pink-100 to-indigo-100 opacity-40 blur-3xl pointer-events-none -mr-48"></div>
        <div className="absolute left-0 bottom-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 opacity-40 blur-3xl pointer-events-none -ml-48"></div>

        <div className="max-w-3xl text-center relative z-10">
          <h2 className="text-[2.25rem] md:text-[3rem] font-bold tracking-tight text-slate-900 leading-tight">
            Intelligence at Scale
          </h2>
          <p className="mt-6 text-slate-500 text-lg leading-relaxed">
            Stop guessing. Start knowing. Our platform processes millions of data points to deliver actionable insights directly to your CRM.
          </p>
        </div>
      </section>

      {/* GRID FEATURES SECTION */}
      <section id="features" className="w-full py-24 bg-slate-50/30 border-y border-slate-100 flex flex-col items-center px-6">
        <div className="max-w-4xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Everything you need to close more deals.
          </h2>
          <p className="mt-3 text-slate-500">
            Built for speed, accuracy, and scale.
          </p>
        </div>

        <div className="max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {features.map((feat, i) => (
            <div key={i} className="premium-shadow-card p-6 bg-white border border-slate-100/60 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                {feat.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-950 mb-2">{feat.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING GRID */}
      <section id="pricing" className="w-full py-28 flex flex-col items-center px-6 bg-white">
        <div className="max-w-4xl text-center mb-20">
          <h2 className="text-[2.25rem] font-bold text-slate-900 tracking-tight">
            Simple, transparent pricing.
          </h2>
          <p className="mt-3 text-slate-500">
            Start for free, upgrade when you need more.
          </p>
        </div>

        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Card 1: Starter */}
          <div className="premium-shadow-card p-8 bg-white border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900">Starter</h3>
            <p className="text-slate-400 text-sm mt-1">For individuals starting out.</p>
            <div className="my-8 flex items-baseline">
              <span className="text-4xl font-extrabold text-slate-900">$0</span>
              <span className="text-slate-400 text-sm ml-2">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-600 mb-8 flex-grow">
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> 100 Leads / month</li>
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> Basic Filtering</li>
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> CSV Export</li>
            </ul>
            <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => window.location.href = "http://localhost:3001/signup"}>
              Get Started
            </Button>
          </div>

          {/* Card 2: Pro */}
          <div className="premium-shadow-card p-8 bg-white border-2 border-[#6366f1] relative flex flex-col shadow-lg shadow-indigo-500/5">
            <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/2 bg-[#6366f1] text-white text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-slate-900">Pro</h3>
            <p className="text-slate-400 text-sm mt-1">For growing agencies.</p>
            <div className="my-8 flex items-baseline">
              <span className="text-4xl font-extrabold text-slate-900">$49</span>
              <span className="text-slate-400 text-sm ml-2">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-600 mb-8 flex-grow">
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> 5,000 Leads / month</li>
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> Advanced Niche Filters</li>
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> CRM Integrations</li>
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> Priority Support</li>
            </ul>
            <Button variant="primary" className="w-full bg-[#6366f1] hover:bg-[#4f46e5]" onClick={() => window.location.href = "http://localhost:3001/signup"}>
              Start Free Trial
            </Button>
          </div>

          {/* Card 3: Scale */}
          <div className="premium-shadow-card p-8 bg-white border border-slate-100 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900">Scale</h3>
            <p className="text-slate-400 text-sm mt-1">For large sales teams.</p>
            <div className="my-8 flex items-baseline">
              <span className="text-4xl font-extrabold text-slate-900">$199</span>
              <span className="text-slate-400 text-sm ml-2">/mo</span>
            </div>
            <ul className="space-y-4 text-sm text-slate-600 mb-8 flex-grow">
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> Unlimited Leads</li>
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> API Access</li>
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> Custom Data Enrichment</li>
              <li className="flex items-center gap-2"><Check className="text-indigo-500 w-4 h-4" /> Dedicated Account Manager</li>
            </ul>
            <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50" onClick={() => window.location.href = "#contact"}>
              Contact Sales
            </Button>
          </div>

        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="w-full py-28 bg-indigo-50/40 border-t border-slate-100 flex flex-col items-center text-center px-6">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 leading-tight">
          Ready to scale your outreach?
        </h2>
        <p className="mt-4 text-slate-500 max-w-lg">
          Join thousands of sales teams who are already closing more deals with LeadFlow.
        </p>
        <Button variant="primary" className="mt-8 bg-[#6366f1] hover:bg-[#4f46e5]" size="lg" onClick={() => window.location.href = "http://localhost:3001/signup"}>
          Get Started Now
        </Button>
      </section>

      {/* CONTACT FORM */}
      <ContactForm />

    </div>
  );
}
