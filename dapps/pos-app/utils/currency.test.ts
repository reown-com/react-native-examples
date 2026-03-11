import {
  amountToCents,
  CURRENCIES,
  exceedsU64Max,
  formatAmountWithSymbol,
  formatFiatAmount,
  getCurrency,
} from "./currency";

describe("amountToCents", () => {
  it("converts whole amounts", () => {
    expect(amountToCents("10")).toBe(1000);
    expect(amountToCents("1")).toBe(100);
    expect(amountToCents("0")).toBe(0);
  });

  it("converts amounts with cents", () => {
    expect(amountToCents("10.50")).toBe(1050);
    expect(amountToCents("4.75")).toBe(475);
    expect(amountToCents("0.99")).toBe(99);
  });

  it("handles floating-point precision edge cases", () => {
    // These are the problematic cases reported by QA:
    // 9.2 * 100 = 919.9999999999999 in JS (fails without Math.round)
    // 9.3 * 100 = 929.9999999999999 in JS (fails without Math.round)
    // 9.1 * 100 = 910 (works fine)
    expect(amountToCents("9.1")).toBe(910); // works without fix
    expect(amountToCents("9.2")).toBe(920); // FAILS without fix
    expect(amountToCents("9.3")).toBe(930); // FAILS without fix
    expect(amountToCents("9.20")).toBe(920);
    expect(amountToCents("1.1")).toBe(110);
    expect(amountToCents("1.2")).toBe(120);
    expect(amountToCents("0.1")).toBe(10);
    expect(amountToCents("0.2")).toBe(20);
  });

  it("handles coffee shop amounts", () => {
    expect(amountToCents("4.50")).toBe(450);
    expect(amountToCents("5.75")).toBe(575);
    expect(amountToCents("12.00")).toBe(1200);
  });

  it("handles luxury store amounts", () => {
    expect(amountToCents("1299.00")).toBe(129900);
    expect(amountToCents("15500")).toBe(1550000);
    expect(amountToCents("49999.99")).toBe(4999999);
  });
});

describe("exceedsU64Max", () => {
  it("returns false for typical amounts", () => {
    expect(exceedsU64Max("0")).toBe(false);
    expect(exceedsU64Max("10.50")).toBe(false);
    expect(exceedsU64Max("1299.00")).toBe(false);
    expect(exceedsU64Max("49999.99")).toBe(false);
  });

  it("returns false for empty and intermediate input states", () => {
    expect(exceedsU64Max("")).toBe(false);
    expect(exceedsU64Max(".")).toBe(false);
    expect(exceedsU64Max("0.")).toBe(false);
  });

  it("returns false for the exact u64 max in cents", () => {
    expect(exceedsU64Max("184467440737095516.15")).toBe(false);
  });

  it("returns true when cents value exceeds u64 max", () => {
    expect(exceedsU64Max("184467440737095516.16")).toBe(true);
  });

  it("returns true for clearly excessive amounts", () => {
    expect(exceedsU64Max("999999999999999999.99")).toBe(true);
  });

  it("returns false for large amounts still within u64 range", () => {
    expect(exceedsU64Max("184467440737095516.00")).toBe(false);
    expect(exceedsU64Max("184467440737095516")).toBe(false);
  });

  it("handles whole numbers without decimal point", () => {
    expect(exceedsU64Max("184467440737095517")).toBe(true);
    expect(exceedsU64Max("184467440737095516")).toBe(false);
  });

  it("handles single decimal digit input", () => {
    expect(exceedsU64Max("184467440737095516.1")).toBe(false);
    expect(exceedsU64Max("184467440737095516.2")).toBe(true);
  });

  it("handles trailing decimal", () => {
    expect(exceedsU64Max("184467440737095516.")).toBe(false);
  });
});

describe("CURRENCIES", () => {
  it("contains USD and EUR", () => {
    expect(CURRENCIES).toHaveLength(2);
    expect(CURRENCIES.map((c) => c.code)).toEqual(["USD", "EUR"]);
  });

  it("has correct USD configuration", () => {
    const usd = CURRENCIES.find((c) => c.code === "USD");
    expect(usd).toEqual({
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      unit: "iso4217/USD",
      symbolPosition: "left",
    });
  });

  it("has correct EUR configuration", () => {
    const eur = CURRENCIES.find((c) => c.code === "EUR");
    expect(eur).toEqual({
      code: "EUR",
      name: "Euro",
      symbol: "€",
      unit: "iso4217/EUR",
      symbolPosition: "right",
    });
  });
});

describe("getCurrency", () => {
  it("returns USD for USD code", () => {
    const currency = getCurrency("USD");
    expect(currency.code).toBe("USD");
    expect(currency.symbol).toBe("$");
    expect(currency.unit).toBe("iso4217/USD");
  });

  it("returns EUR for EUR code", () => {
    const currency = getCurrency("EUR");
    expect(currency.code).toBe("EUR");
    expect(currency.symbol).toBe("€");
    expect(currency.unit).toBe("iso4217/EUR");
  });

  it("returns USD as fallback for unknown code", () => {
    const currency = getCurrency("GBP");
    expect(currency.code).toBe("USD");
  });
});

describe("formatAmountWithSymbol", () => {
  it("formats USD with symbol on the left", () => {
    const usd = getCurrency("USD");
    expect(formatAmountWithSymbol("10.00", usd)).toBe("$10.00");
    expect(formatAmountWithSymbol("0.00", usd)).toBe("$0.00");
    expect(formatAmountWithSymbol("1234.56", usd)).toBe("$1234.56");
  });

  it("formats EUR with symbol on the right", () => {
    const eur = getCurrency("EUR");
    expect(formatAmountWithSymbol("10.00", eur)).toBe("10.00€");
    expect(formatAmountWithSymbol("0.00", eur)).toBe("0.00€");
    expect(formatAmountWithSymbol("1234.56", eur)).toBe("1234.56€");
  });
});

describe("formatFiatAmount", () => {
  it("returns dash for undefined amount", () => {
    expect(formatFiatAmount(undefined)).toBe("-");
  });

  it("returns dash for non-numeric string", () => {
    expect(formatFiatAmount("abc")).toBe("-");
  });

  it("formats USD amounts with symbol on the left", () => {
    expect(formatFiatAmount("1000", "iso4217/USD")).toBe("$10.00");
    expect(formatFiatAmount("99", "iso4217/USD")).toBe("$0.99");
    expect(formatFiatAmount("123456", "iso4217/USD")).toBe("$1,234.56");
  });

  it("formats EUR amounts with symbol on the right", () => {
    expect(formatFiatAmount("1000", "iso4217/EUR")).toBe("10.00€");
    expect(formatFiatAmount("99", "iso4217/EUR")).toBe("0.99€");
    expect(formatFiatAmount("123456", "iso4217/EUR")).toBe("1,234.56€");
  });

  it("defaults to USD for missing currency", () => {
    expect(formatFiatAmount("1000")).toBe("$10.00");
    expect(formatFiatAmount("1000", undefined)).toBe("$10.00");
  });
});
