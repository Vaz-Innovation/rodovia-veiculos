export function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-1">{label}</dt>
      <dd className="text-base font-medium text-foreground">{value}</dd>
    </div>
  );
}
