"use client";

interface ProgressBarProps {
  value: number;
}

export default function ProgressBar({ value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full bg-[#6366f1] transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
