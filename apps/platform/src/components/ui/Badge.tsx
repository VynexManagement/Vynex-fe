export function Badge({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 bg-[#00adb5]/10 border border-[#00adb5]/20 px-4 py-1.5 rounded-full text-[#00adb5] text-sm font-medium">
      {children}
    </div>
  );
}