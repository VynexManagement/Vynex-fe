"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
}

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-[#00adb5]/10 bg-[#393e46]/40 p-5">
      <div className="text-3xl font-bold text-[#eeeeee]">{value}</div>
      <div className="mt-1 text-sm text-[#eeeeee]/60">{label}</div>
    </div>
  );
}
