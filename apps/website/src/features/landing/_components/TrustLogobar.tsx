"use client";

import React from "react";
import { Store, ShoppingCart, Truck, Package, CreditCard } from "lucide-react";

export function TrustLogobar() {
  const icons = [
    { Icon: Store, label: "Store" },
    { Icon: ShoppingCart, label: "Cart" },
    { Icon: Truck, label: "Shipping" },
    { Icon: Package, label: "Package" },
    { Icon: CreditCard, label: "Payment" },
  ];

  return (
    <section className="w-full bg-slate-50/40 py-12 md:py-16 border-y border-slate-100 flex flex-col items-center px-6">
      <div className="text-[10px] font-bold text-slate-400 tracking-[0.22em] text-center uppercase mb-8 select-none">
        POWERING THE NEXT GENERATION OF SHOPIFY AGENCIES
      </div>
      <div className="flex flex-wrap justify-center items-center gap-12 sm:gap-20 text-slate-300 select-none">
        {icons.map(({ Icon, label }, idx) => (
          <div key={idx} className="group flex flex-col items-center">
            <Icon 
              className="w-9 h-9 transition-colors duration-200 group-hover:text-slate-400" 
              strokeWidth={1.5}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
