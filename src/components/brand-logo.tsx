import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "lg";
}

export function BrandLogo({ className, size = "sm" }: BrandLogoProps) {
  const isLarge = size === "lg";
  return (
    <div className={cn("flex flex-col leading-none text-foreground", className)}>
      <span
        className={cn(
          "font-serif font-normal tracking-tight text-foreground",
          isLarge ? "text-4xl" : "text-[28px]",
        )}
      >
        Rodovia
      </span>
      <span
        className={cn(
          "uppercase font-light text-foreground/95 mt-1.5",
          isLarge ? "text-[11px] tracking-[0.78em] pl-[2px]" : "text-[9px] tracking-[0.72em] pl-[2px]",
        )}
      >
        Veículos
      </span>
    </div>
  );
}
