import { dollarsToCents } from "./currency";

describe("dollarsToCents", () => {
  it("converts whole dollars", () => {
    expect(dollarsToCents("10")).toBe(1000);
    expect(dollarsToCents("1")).toBe(100);
    expect(dollarsToCents("0")).toBe(0);
  });

  it("converts dollars with cents", () => {
    expect(dollarsToCents("10.50")).toBe(1050);
    expect(dollarsToCents("4.75")).toBe(475);
    expect(dollarsToCents("0.99")).toBe(99);
  });

  it("handles floating-point precision edge cases", () => {
    // These are the problematic cases reported by QA:
    // 9.2 * 100 = 919.9999999999999 in JS (fails without Math.round)
    // 9.3 * 100 = 929.9999999999999 in JS (fails without Math.round)
    // 9.1 * 100 = 910 (works fine)
    expect(dollarsToCents("9.1")).toBe(910); // works without fix
    expect(dollarsToCents("9.2")).toBe(920); // FAILS without fix
    expect(dollarsToCents("9.3")).toBe(930); // FAILS without fix
    expect(dollarsToCents("9.20")).toBe(920);
    expect(dollarsToCents("1.1")).toBe(110);
    expect(dollarsToCents("1.2")).toBe(120);
    expect(dollarsToCents("0.1")).toBe(10);
    expect(dollarsToCents("0.2")).toBe(20);
  });

  it("handles coffee shop amounts", () => {
    expect(dollarsToCents("4.50")).toBe(450);
    expect(dollarsToCents("5.75")).toBe(575);
    expect(dollarsToCents("12.00")).toBe(1200);
  });

  it("handles luxury store amounts", () => {
    expect(dollarsToCents("1299.00")).toBe(129900);
    expect(dollarsToCents("15500")).toBe(1550000);
    expect(dollarsToCents("49999.99")).toBe(4999999);
  });
});
