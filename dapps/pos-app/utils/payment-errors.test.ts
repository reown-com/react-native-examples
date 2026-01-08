import { getPaymentErrorMessage } from "./payment-errors";

describe("getPaymentErrorMessage", () => {
  describe("known error statuses", () => {
    it('returns expired message for "expired" status', () => {
      const result = getPaymentErrorMessage("expired");
      expect(result).toBe("The payment has expired.");
    });

    it('returns invalid API key message for "invalid_api_key" status', () => {
      const result = getPaymentErrorMessage("invalid_api_key");
      expect(result).toBe(
        "The API key is invalid. Please check your credentials and try again.",
      );
    });
  });

  describe("unknown error statuses", () => {
    it("returns default message for unknown error status", () => {
      const result = getPaymentErrorMessage("some_unknown_error");
      expect(result).toBe(
        "The payment couldn't be completed due to an error. Please try again or use a different payment method.",
      );
    });

    it("returns default message for empty string status", () => {
      const result = getPaymentErrorMessage("");
      expect(result).toBe(
        "The payment couldn't be completed due to an error. Please try again or use a different payment method.",
      );
    });
  });

  describe("undefined/null status", () => {
    it("returns default message when status is undefined", () => {
      const result = getPaymentErrorMessage(undefined);
      expect(result).toBe(
        "The payment couldn't be completed due to an error. Please try again or use a different payment method.",
      );
    });

    it("returns default message when called without arguments", () => {
      const result = getPaymentErrorMessage();
      expect(result).toBe(
        "The payment couldn't be completed due to an error. Please try again or use a different payment method.",
      );
    });
  });
});
