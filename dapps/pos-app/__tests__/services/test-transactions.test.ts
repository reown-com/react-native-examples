import { getTestTransactions } from "@/services/test-transactions";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTestPaymentsStore } from "@/store/useTestPaymentsStore";

describe("getTestTransactions", () => {
  beforeEach(() => {
    useSettingsStore.setState({ currency: "USD" });
    useTestPaymentsStore.getState().clear();
  });

  it("lists payments taken in Test Mode first, newest first", () => {
    const { addTestPayment } = useTestPaymentsStore.getState();
    addTestPayment({ paymentId: "test_1", amount: "15.50", status: "failed" });
    addTestPayment({
      paymentId: "test_2",
      amount: "3",
      status: "succeeded",
    });

    const response = getTestTransactions();

    expect(response.data).toHaveLength(8);
    expect(response.data[0]).toMatchObject({
      paymentId: "test_2",
      status: "succeeded",
      fiatAmount: { value: "300" },
      tokenAmount: { display: { formatted: "3.00", assetSymbol: "USDC" } },
    });
    expect(response.data[1]).toMatchObject({
      paymentId: "test_1",
      status: "failed",
      fiatAmount: { value: "1550" },
    });
  });

  it("records a payment once even if its outcome is reported twice", () => {
    const { addTestPayment } = useTestPaymentsStore.getState();
    addTestPayment({ paymentId: "test_1", amount: "1", status: "cancelled" });
    addTestPayment({ paymentId: "test_1", amount: "1", status: "cancelled" });

    expect(useTestPaymentsStore.getState().payments).toHaveLength(1);
  });

  it("applies status filters to Test Mode payments too", () => {
    useTestPaymentsStore
      .getState()
      .addTestPayment({ paymentId: "test_1", amount: "1", status: "failed" });

    const response = getTestTransactions({ status: "failed" });

    expect(response.data.map((payment) => payment.paymentId)).toEqual([
      "test_1",
      "test_failed",
    ]);
  });

  it("returns one local record for every payment status", () => {
    const response = getTestTransactions();

    expect(response.data).toHaveLength(6);
    expect(response.data.map((payment) => payment.status)).toEqual([
      "requires_action",
      "processing",
      "succeeded",
      "failed",
      "expired",
      "cancelled",
    ]);
    expect(response.nextCursor).toBeNull();
  });

  it("applies status filters and never needs a cursor", () => {
    const response = getTestTransactions({
      status: ["succeeded", "failed"],
      limit: 1,
      cursor: "ignored",
    });

    expect(response.data).toHaveLength(1);
    expect(response.data[0].status).toBe("succeeded");
  });
});
