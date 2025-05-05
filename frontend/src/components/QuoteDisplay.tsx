import styles from "./QuoteDisplay.module.css";
import { useTranslation } from "react-i18next";

interface QuoteDisplayProps {
  baseCurrency: string;
  targetCurrency: string;
  quote?: number;
}

export default function QuoteDisplay({
  baseCurrency,
  targetCurrency,
  quote,
}: QuoteDisplayProps) {
  const { t } = useTranslation();

  if (!quote) return null;

  return (
    <div className={styles.quote}>
      {t("exchangeRateLabel", {
        base: baseCurrency,
        target: targetCurrency,
        quote: quote.toFixed(4),
      })}
    </div>
  );
}
