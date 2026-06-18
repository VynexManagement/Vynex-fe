"use client";

import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 tracking-tight">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}
