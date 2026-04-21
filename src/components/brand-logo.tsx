interface BrandLogoProps {
  className?: string;
}

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 200 70"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Rodovia Veículos"
      role="img"
    >
      <text
        x="0"
        y="42"
        fill="currentColor"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="400"
        fontSize="44"
        letterSpacing="-1"
      >
        Rodovia
      </text>
      <text
        x="2"
        y="62"
        fill="currentColor"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontWeight="300"
        fontSize="10"
        letterSpacing="11.5"
      >
        VEÍCULOS
      </text>
    </svg>
  );
}
