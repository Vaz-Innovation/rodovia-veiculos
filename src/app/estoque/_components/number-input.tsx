interface NumberInputProps {
  value: number | undefined;
  onChange: (v: number | undefined) => void;
  placeholder?: string;
  currency?: boolean;
}

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function NumberInput({ value, onChange, placeholder, currency }: NumberInputProps) {
  if (currency) {
    return (
      <input
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        value={value != null ? brl.format(value) : ""}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          onChange(digits === "" ? undefined : Number(digits));
        }}
        className="w-full bg-card border border-border px-3 py-2 text-sm"
      />
    );
  }

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
