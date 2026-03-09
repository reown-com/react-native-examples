import { getPaymentErrorMessage } from "./payment-errors";

describe("getPaymentErrorMessage", () => {
  describe("known error statuses", () => {
    it('returns expired title and subtitle for "expired" status', () => {
      const result = getPaymentErrorMessage("expired");
      expect(result.title).toBe("Your payment has expired");
      expect(result.subtitle).toContain("expired");
    });

    it('returns invalid API key message for "invalid_api_key" status', () => {
      const result = getPaymentErrorMessage("invalid_api_key");
      expect(result.title).toBe("Payment can't be completed");
      expect(result.subtitle).toContain("API key is invalid");
    });

    it('returns cancelled message for "cancelled" status', () => {
      const result = getPaymentErrorMessage("cancelled");
      expect(result.title).toBe("Payment was cancelled");
      expect(result.subtitle).toContain("cancelled");
    });
  });

  describe("unknown error statuses", () => {
    it("returns default message for unknown error status", () => {
      const result = getPaymentErrorMessage("some_unknown_error");
      expect(result.title).toBe("Payment can't be completed");
      expect(result.subtitle).toContain("unable to complete");
    });

    it("returns default message for empty string status", () => {
      const result = getPaymentErrorMessage("");
      expect(result.title).toBe("Payment can't be completed");
      expect(result.subtitle).toContain("unable to complete");
    });
  });

  describe("undefined/null status", () => {
    it("returns default message when status is undefined", () => {
      const result = getPaymentErrorMessage(undefined);
      expect(result.title).toBe("Payment can't be completed");
      expect(result.subtitle).toContain("unable to complete");
    });

    it("returns default message when called without arguments", () => {
      const result = getPaymentErrorMessage();
      expect(result.title).toBe("Payment can't be completed");
      expect(result.subtitle).toContain("unable to complete");
    });
  });
});
