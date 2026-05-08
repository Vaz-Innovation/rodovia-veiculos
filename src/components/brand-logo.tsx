import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "sm" | "lg";
}

export function BrandLogo({ className, size = "sm" }: BrandLogoProps) {
  const isLarge = size === "lg";
  return (
    <div className={cn("inline-flex flex-col leading-none", className)}>
      <span
        className={cn(
          "font-sans font-bold uppercase tracking-tight text-black",
          isLarge ? "text-5xl" : "text-3xl",
        )}
      >
        Rodovia
      </span>
      <span
        className={cn(
          "font-sans font-bold uppercase text-black",
          isLarge ? "text-sm tracking-[0.15em]" : "text-xs tracking-[0.12em]",
        )}
      >
        Veículos
      </span>
    </div>
  );
}
