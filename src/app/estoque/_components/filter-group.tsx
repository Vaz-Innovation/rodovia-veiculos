export function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 pb-6 border-b border-border last:border-0">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">{label}</p>
      {children}
    </div>
  );
}
