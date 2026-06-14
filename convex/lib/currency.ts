export const isValidCurrency = (code: string): boolean => {
  try {
    new Intl.NumberFormat("en", {
      style: "currency",
      currency: code.toUpperCase(),
    });
    return true;
  } catch {
    return false;
  }
};
