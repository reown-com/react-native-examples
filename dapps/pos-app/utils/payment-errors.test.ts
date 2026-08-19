import {
  AMOUNT_TOO_LOW,
  getPaymentErrorMessage,
  parseMinAmountCents,
} from "./payment-errors";

describe("parseMinAmountCents", () => {
  it("extracts the minimum in cents from the API validation message", () => {
    expect(
      parseMinAmountCents(
        "Validation error: Amount must be at least 14 to cover fees",
      ),
    ).toBe("14");
  });

  it("returns undefined for other validation messages", () => {
    expect(
      parseMinAmountCents("Validation error: referenceId is required"),
    ).toBeUndefined();
  });

  it("returns undefined when message is undefined", () => {
    expect(parseMinAmountCents(undefined)).toBeUndefined();
  });
});

describe("getPaymentErrorMessage", () => {
  describe("amount below minimum", () => {
    it("formats the minimum in USD", () => {
      const result = getPaymentErrorMessage(AMOUNT_TOO_LOW, {
        minAmountCents: "14",
        currencyCode: "USD",
      });
      expect(result.title).toBe("This amount is too low");
      expect(result.subtitle).toContain("$0.14");
    });

    it("formats the minimum in EUR with the symbol on the right", () => {
      const result = getPaymentErrorMessage(AMOUNT_TOO_LOW, {
        minAmountCents: "14",
        currencyCode: "EUR",
      });
      expect(result.subtitle).toContain("0.14€");
    });

    it("uses the minimum reported by the API rather than a hardcoded one", () => {
      const result = getPaymentErrorMessage(AMOUNT_TOO_LOW, {
        minAmountCents: "250",
        currencyCode: "USD",
      });
      expect(result.subtitle).toContain("$2.50");
    });

    it("defaults to USD when no currency is provided", () => {
      const result = getPaymentErrorMessage(AMOUNT_TOO_LOW, {
        minAmountCents: "14",
      });
      expect(result.subtitle).toContain("$0.14");
    });

    it("returns default message when the minimum is missing", () => {
      const result = getPaymentErrorMessage(AMOUNT_TOO_LOW);
      expect(result.title).toBe("This payment didn't go through");
      expect(result.subtitle).toContain("No funds were moved");
    });
  });

  describe("known error statuses", () => {
    it('returns expired title and subtitle for "expired" status', () => {
      const result = getPaymentErrorMessage("expired");
      expect(result.title).toBe("This payment expired");
      expect(result.subtitle).toContain("No funds were moved");
    });

    it('returns invalid API key message for "invalid_api_key" status', () => {
      const result = getPaymentErrorMessage("invalid_api_key");
      expect(result.title).toBe("This terminal can't take payments");
      expect(result.subtitle).toContain("lost access");
    });

    it('returns cancelled message for "cancelled" status', () => {
      const result = getPaymentErrorMessage("cancelled");
      expect(result.title).toBe("Payment cancelled");
      expect(result.subtitle).toContain("No funds were moved");
    });

    it('returns validation message for "params_validation" status', () => {
      const result = getPaymentErrorMessage("params_validation");
      expect(result.title).toBe("This payment didn't go through");
      expect(result.subtitle).toContain("Something's off with this payment");
      expect(result.subtitle).not.toContain("connection");
    });
  });

  describe("unknown error statuses", () => {
    it("returns default message for unknown error status", () => {
      const result = getPaymentErrorMessage("some_unknown_error");
      expect(result.title).toBe("This payment didn't go through");
      expect(result.subtitle).toContain("No funds were moved");
    });

    it("returns default message for empty string status", () => {
      const result = getPaymentErrorMessage("");
      expect(result.title).toBe("This payment didn't go through");
      expect(result.subtitle).toContain("No funds were moved");
    });
  });

  describe("undefined/null status", () => {
    it("returns default message when status is undefined", () => {
      const result = getPaymentErrorMessage(undefined);
      expect(result.title).toBe("This payment didn't go through");
      expect(result.subtitle).toContain("No funds were moved");
    });

    it("returns default message when called without arguments", () => {
      const result = getPaymentErrorMessage();
      expect(result.title).toBe("This payment didn't go through");
      expect(result.subtitle).toContain("No funds were moved");
    });
  });
});
