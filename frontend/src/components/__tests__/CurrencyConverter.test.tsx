import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import CurrencyConverter from "../CurrencyConverter";
import * as api from "../../api/currency-converter-api";

// Mock API responses
const mockBase = [{ value: "EUR", label: "EUR" }];
const mockTarget = [
  { currency: "USD", quote: 1.1, date: "2025-05-05" },
  { currency: "GBP", quote: 0.85, date: "2025-05-05" },
];

jest.mock("../../api/currency-converter-api");

describe("CurrencyConverter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    (api.fetchBaseCurrencies as jest.Mock).mockResolvedValue(mockBase);
    (api.fetchTargetCurrencies as jest.Mock).mockResolvedValue(mockTarget);

    render(<CurrencyConverter />);
    expect(screen.getByText(/Loading currency data/i)).toBeInTheDocument();

    const baseCurrencySelect = await screen.findByLabelText("baseCurrency:");
    expect(baseCurrencySelect).toBeInTheDocument();
  });

  it("renders dropdowns and result correctly", async () => {
    (api.fetchBaseCurrencies as jest.Mock).mockResolvedValue(mockBase);
    (api.fetchTargetCurrencies as jest.Mock).mockResolvedValue(mockTarget);

    render(<CurrencyConverter />);

    await screen.findByLabelText("baseCurrency:");
    expect(screen.getByLabelText("targetCurrency:")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/1\.10\s*USD/)).toBeInTheDocument();
    });
  });

  it("updates conversion when amount is changed", async () => {
    (api.fetchBaseCurrencies as jest.Mock).mockResolvedValue(mockBase);
    (api.fetchTargetCurrencies as jest.Mock).mockResolvedValue(mockTarget);

    render(<CurrencyConverter />);
    await screen.findByLabelText(/amount/i);

    const input = screen.getByLabelText(/amount/i) as HTMLInputElement;
    fireEvent.change(input, { target: { value: "2" } });

    expect(
      screen.getByText(
        (content) => content.includes("2.20") && content.includes("USD")
      )
    ).toBeInTheDocument();
  });

  it("handles fetch error gracefully", async () => {
    (api.fetchBaseCurrencies as jest.Mock).mockRejectedValue(
      new Error("Fetch failed")
    );

    render(<CurrencyConverter />);
    await waitFor(() =>
      expect(screen.getByText(/Error: Fetch failed/i)).toBeInTheDocument()
    );
  });
});
