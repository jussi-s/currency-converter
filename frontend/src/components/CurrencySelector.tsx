import { ChangeEvent } from "react";
import styles from "./CurrencySelector.module.css";
import { CurrencyOption } from "../types/currency";
import { useTranslation } from "react-i18next";

interface Props {
  label: string;
  options: CurrencyOption[];
  selected: string;
  onChange: (currencyCode: string) => void;
}

export default function CurrencySelector({
  label,
  options,
  selected,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={styles.selectorContainer}>
      <label className={styles.label}>{label}</label>
      <select
        className={styles.select}
        value={selected}
        onChange={handleChange}
      >
        <option value="">{t("selectPlaceholder")}</option>
        {options.map((option) => (
          <option key={option.label} value={option.value}>
            {option.value}
          </option>
        ))}
      </select>
    </div>
  );
}
