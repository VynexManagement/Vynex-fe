"use client";

import type { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
}

export default function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="rounded-2xl border border-[#00adb5]/10 bg-[#393e46]/40 p-5">
      <h3 className="text-lg font-semibold text-[#eeeeee]">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}
