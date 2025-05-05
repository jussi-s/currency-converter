import { ChangeEvent } from "react";
import styles from "./CurrencyDropdown.module.css";

interface Props {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export default function CurrencyDropdown({
  label,
  value,
  onChange,
  options,
}: Props) {
  return (
    <label className={styles.label}>
      {label}:
      <select
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
          onChange(e.target.value)
        }
      >
        <option value="">--</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
