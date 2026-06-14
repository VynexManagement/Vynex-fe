'use client'

import { Section } from "../ui/Section";
import { Button } from "../ui/Button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <Section className="pt-28 pb-24 text-center flex flex-col items-center">

      {/* HEADLINE */}
      <h1 className="text-4xl sm:text-6xl font-semibold leading-tight text-[#eeeeee] max-w-5xl">
        Find High-Converting Shopify Leads
        <span className=" text-[#00adb5] m-2">
          Before Your Competitors Do
        </span>
      </h1>

      {/* SUBTEXT */}
      <p className="mt-6 text-lg text-[#eeeeee]/60 max-w-2xl leading-relaxed">
        Discover stores missing key growth tools like email marketing,
        reviews, and retention systems — and reach out with a perfect pitch.
      </p>

      {/* CTA */}
      <div className="mt-8 flex flex-col sm:flex-row gap-4">
        <Link href="/query">
          <Button className="px-8 py-3 text-base">
            Find Leads <ArrowRight size={18} />
          </Button>
        </Link>

        <Link href="#pricing">
          <Button variant="glass" className="px-8 py-3 text-base">
            View Pricing
          </Button>
        </Link>
      </div>

      {/* TRUST LINE */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-[#eeeeee]">
        <span>✔ Signal-verified data</span>
        <span>✔ No subscription</span>
        <span>✔ Instant CSV download</span>
      </div>

    </Section>
  );
}