import { getTestTransactions } from "@/services/test-transactions";
import { useSettingsStore } from "@/store/useSettingsStore";

describe("getTestTransactions", () => {
  beforeEach(() => {
    useSettingsStore.setState({ currency: "USD" });
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
