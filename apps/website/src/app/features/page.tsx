import React from "react";
import { FeatureGrid } from "../../features/landing/_components/FeatureGrid";

export default function FeaturesPage() {
  return (
    <div className="w-full bg-white min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-full py-12">
        <FeatureGrid />
      </div>
    </div>
  );
}
