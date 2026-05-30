import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  className?: string;
}

export function SectionHeader({
  title,
  subtitle,
  center = true,
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        center && "text-center",
        "mb-8",
        className
      )}
    >
      <h2 className="text-2xl sm:text-3xl font-bold text-[#eeeeee]">
        {title}
      </h2>

      {subtitle && (
        <p className="text-[#eeeeee]/40 text-sm mt-2 max-w-xl mx-auto">
          {subtitle}
        </p>
      )}
    </div>
  );
}