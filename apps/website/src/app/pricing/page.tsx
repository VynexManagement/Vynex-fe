import React from "react";
import { PricingGrid } from "../../features/landing/_components/PricingGrid";

export default function PricingPage() {
  return (
    <div className="w-full bg-white min-h-[70vh] flex flex-col items-center justify-center">
      <div className="w-full py-12">
        <PricingGrid />
      </div>
    </div>
  );
}
