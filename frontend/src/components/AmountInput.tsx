import styles from "./AmountInput.module.css";

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
}

export default function AmountInput({ label, value, onChange }: Props) {
  return (
    <label className={styles.label}>
      {label}
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />
    </label>
  );
}
