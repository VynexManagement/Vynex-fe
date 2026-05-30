"use client";

interface ProgressBarProps {
  value: number;
}

export default function ProgressBar({ value }: ProgressBarProps) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div className="h-3 w-full rounded-full bg-[#222831]">
      <div
        className="h-3 rounded-full bg-[#00adb5] transition-all"
        style={{ width: `${safeValue}%` }}
      />
    </div>
  );
}
