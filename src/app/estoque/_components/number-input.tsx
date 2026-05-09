interface NumberInputProps {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
}

export function NumberInput({ value, onChange, placeholder }: NumberInputProps) {
  return (
    <input
      type="number"
      inputMode="numeric"
      placeholder={placeholder}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? undefined : Number(v));
      }}
      className="w-full bg-card border border-border px-3 py-2 text-sm"
    />
  );
}
