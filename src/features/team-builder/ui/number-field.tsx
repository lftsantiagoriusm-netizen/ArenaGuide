import type { ChangeEvent } from "react";

interface NumberFieldProps {
  readonly label: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly onChange: (value: number) => void;
}

export function NumberField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: NumberFieldProps) {
  return (
    <label className="grid gap-2 text-sm font-medium">
      {label}
      <input
        type="number"
        inputMode="decimal"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(Number(event.target.value))
        }
        className="border-border bg-background focus:border-primary/50 focus:ring-primary/15 h-11 w-full rounded-xl border px-3 text-sm tabular-nums transition outline-none focus:ring-2"
      />
    </label>
  );
}
