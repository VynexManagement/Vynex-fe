import { cn } from "@/lib/utils";

export function Card({ children, className }: any) {
  return (
    <div
      className={cn(
        "bg-[#393e46]/40 backdrop-blur border border-[#00adb5]/10 rounded-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}