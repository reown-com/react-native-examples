import { amountToCents, CURRENCIES, getCurrency } from "./currency";

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
    });
  });

  it("has correct EUR configuration", () => {
    const eur = CURRENCIES.find((c) => c.code === "EUR");
    expect(eur).toEqual({
      code: "EUR",
      name: "Euro",
      symbol: "€",
      unit: "iso4217/EUR",
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
    // @ts-expect-error - testing invalid code
    const currency = getCurrency("GBP");
    expect(currency.code).toBe("USD");
  });
});
