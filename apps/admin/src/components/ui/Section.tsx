import { cn } from "@/lib/utils";

export function Section({ children, className }: any) {
  return (
    <section className={cn("w-full max-w-5xl px-6", className)}>
      {children}
    </section>
  );
}