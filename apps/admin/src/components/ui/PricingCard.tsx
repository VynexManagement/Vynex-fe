import { Card } from "./Card";
import { Button } from "./Button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface PricingCardProps {
  title: string;
  price?: string;
  leads?: string;
  features: string[];
  cta?: string;
  href?: string;
  popular?: boolean;
  variant?: "default" | "custom";
}

export function PricingCard({
  title,
  price,
  leads,
  features,
  cta,
  href,
  popular,
  variant = "default",
}: PricingCardProps) {
  return (
    <Card
      className={cn(
        "p-8 flex flex-col justify-between h-full relative transition-all",
        popular && "border-[#00adb5]/40 scale-[1.03]",
        variant === "custom" &&
        "border-[#ffd6ba]/30 bg-[#393e46]/30"
      )}
    >
      {/* TOP */}
      <div className="space-y-6">

        {popular && (
          <span className="absolute top-4 right-4 bg-[#00adb5]/15 text-[#00adb5] px-3 py-1 rounded-full text-xs font-semibold">
            Most Popular
          </span>
        )}

        {/* TITLE + PRICE */}
        <div>
          <h3 className="text-[#eeeeee] font-semibold text-lg">
            {title}
          </h3>

          {price && (
            <div className="mt-2">
              <div className="text-4xl font-extrabold text-[#eeeeee]">
                {price}
              </div>

              <p className="text-xs text-[#eeeeee]/30 mt-1">
                One-time download fee
              </p>
            </div>
          )}
        </div>

        {/* FEATURES */}
        <ul className="space-y-3 text-sm text-[#eeeeee]/60">
          {leads && (
            <li className="flex gap-2">
              <CheckCircle2 className="text-[#00adb5]" size={16} />
              {leads}
            </li>
          )}

          {features.map((f, i) => (
            <li key={i} className="flex gap-2">
              <CheckCircle2
                className={
                  variant === "custom"
                    ? "text-[#ffd6ba]"
                    : "text-[#00adb5]"
                }
                size={16}
              />
              {f}
            </li>
          ))}
        </ul>
      </div>

      {/* BOTTOM */}
      <div className="mt-8">

        {/* ONLY show button for custom */}
        {variant === "custom" && cta && href ? (
          <Link href={href}>
            <Button variant="glass" className="w-full">
              {cta}
            </Button>
          </Link>
        ) : (
          <p className="text-center text-xs text-[#eeeeee]">
            Click on Find leads to get started
          </p>
        )}

      </div>
    </Card>
  );
}