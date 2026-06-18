"use client";

interface MetricCardProps {
  label: string;
  value: string | number;
}

export default function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div className="border border-slate-100 bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between">
      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{value}</div>
    </div>
  );
}
