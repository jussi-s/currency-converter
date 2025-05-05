import { apiFetch } from "./client";
import { ExchangeRate } from "../types/exchange-rate";
import { CurrencyOption, TargetCurrency } from "../types/currency";

export async function fetchBaseCurrencies(): Promise<CurrencyOption[]> {
  const raw = await apiFetch<string[]>("/currencies");
  return raw.map((c) => ({ label: c, value: c }));
}

export async function fetchTargetCurrencies(
  baseCurrency: string
): Promise<TargetCurrency[]> {
  return apiFetch(`/target-currencies?baseCurrency=${baseCurrency}`);
}

export async function getAllExchangeRates(): Promise<ExchangeRate[]> {
  return apiFetch("/exchange-rates");
}
