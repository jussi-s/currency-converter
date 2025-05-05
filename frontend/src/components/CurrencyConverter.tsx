import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  fetchBaseCurrencies,
  fetchTargetCurrencies,
} from "../api/currency-converter-api";
import { CurrencyOption, TargetCurrency } from "../types/currency";
import CurrencyDropdown from "./CurrencyDropdown";
import AmountInput from "./AmountInput";
import styles from "./CurrencyConverter.module.css";
import LanguageSwitcher from "./LanguageSwitcher";
import QuoteDisplay from "./QuoteDisplay";

export default function CurrencyConverter() {
  const { t } = useTranslation();
  const [baseOptions, setBaseOptions] = useState<CurrencyOption[]>([]);
  const [targetOptions, setTargetOptions] = useState<TargetCurrency[]>([]);
  const [baseCurrency, setBaseCurrency] = useState("");
  const [targetCurrency, setTargetCurrency] = useState("");
  const [amount, setAmount] = useState(1);
  const [quote, setQuote] = useState<number | null>(null);
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);
      try {
        const [base, target] = await Promise.all([
          fetchBaseCurrencies(),
          fetchTargetCurrencies("EUR"),
        ]);
        setBaseOptions(base);
        setBaseCurrency("EUR");
        setTargetOptions(target);
        if (target.length > 0) {
          setTargetCurrency(target[0].currency);
          setQuote(target[0].quote);
        }
      } catch (err) {
        console.error("Error fetching currencies:", err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const current = targetOptions.find(
      (item) => item.currency === targetCurrency
    );
    if (current) {
      setQuote(current.quote);
      setConverted(Number((amount * current.quote).toFixed(2)));
    } else {
      setConverted(null);
    }
  }, [amount, targetCurrency, targetOptions]);

  if (loading) {
    return <p>Loading currency data...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>Error: {error}</p>;
  }

  return (
    <div className={styles.container}>
      <LanguageSwitcher />
      <h1>{t("title")}</h1>
      <CurrencyDropdown
        label={t("baseCurrency")}
        value={baseCurrency}
        onChange={setBaseCurrency}
        options={baseOptions.map((code) => ({
          value: code.value,
          label: code.label,
        }))}
      />
      <CurrencyDropdown
        label={t("targetCurrency")}
        value={targetCurrency}
        onChange={setTargetCurrency}
        options={targetOptions.map((o) => ({
          value: o.currency,
          label: o.currency,
        }))}
      />
      <AmountInput
        label={t("amount") + ":"}
        value={amount}
        onChange={setAmount}
      />
      {quote !== null && baseCurrency && targetCurrency && (
        <QuoteDisplay
          baseCurrency={baseCurrency}
          targetCurrency={targetCurrency}
          quote={quote}
        />
      )}
      {converted !== null && (
        <p className={styles.resultText}>
          {t("result")} {converted.toFixed(2)} {targetCurrency}
        </p>
      )}
    </div>
  );
}
