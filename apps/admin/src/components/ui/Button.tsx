import { cn } from "@/lib/utils";

export function Button({
  children,
  variant = "primary",
  className,
  ...props
}: any) {
  const base =
    "px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2 transition-all";

  const variants: any = {
    primary: "bg-[#00adb5] text-black hover:opacity-90",
    glass:
      "bg-[#393e46]/40 backdrop-blur border border-[#00adb5]/10 text-[#eeeeee] hover:bg-[#393e46]/70",
    ghost:
      "border border-[#393e46] text-[#eeeeee]/80 hover:bg-[#393e46]/50",
  };

  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}