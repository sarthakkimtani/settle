export type Currency = {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
};

export const CURRENCIES: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar", decimals: 2 },
  { code: "EUR", symbol: "€", name: "Euro", decimals: 2 },
  { code: "GBP", symbol: "£", name: "British Pound", decimals: 2 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", decimals: 2 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", decimals: 0 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", decimals: 2 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", decimals: 2 },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar", decimals: 2 },
  { code: "AED", symbol: "AED", name: "UAE Dirham", decimals: 2 },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc", decimals: 2 },
];

export const DEFAULT_CURRENCY_CODE = "USD";

export const getCurrency = (code: string): Currency => {
  const normalized = code.toUpperCase();
  return (
    CURRENCIES.find((currency) => currency.code === normalized) ?? {
      code: normalized,
      symbol: normalized,
      name: normalized,
      decimals: 2,
    }
  );
};

export const minorToMajor = (amountMinor: number, code: string) =>
  amountMinor / 10 ** getCurrency(code).decimals;

export const majorToMinor = (amount: number, code: string) =>
  Math.round(amount * 10 ** getCurrency(code).decimals);

type FormatMoneyOptions = {
  /** Drop trailing ".00" for whole amounts, e.g. "$72" instead of "$72.00". */
  trimWhole?: boolean;
};

export const formatMoney = (
  amountMinor: number,
  code: string,
  options: FormatMoneyOptions = {},
): string => {
  const currency = getCurrency(code);
  const value = minorToMajor(amountMinor, code);
  const wholeOnly = options.trimWhole === true && Number.isInteger(value);

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.code,
      ...(wholeOnly ? { minimumFractionDigits: 0, maximumFractionDigits: 0 } : {}),
    }).format(value);
  } catch {
    return `${currency.symbol}${value.toFixed(wholeOnly ? 0 : currency.decimals)}`;
  }
};
