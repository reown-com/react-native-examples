import { getSandboxTransactions } from "@/services/sandbox-transactions";
import { useSettingsStore } from "@/store/useSettingsStore";

describe("getSandboxTransactions", () => {
  beforeEach(() => {
    useSettingsStore.setState({ currency: "USD" });
  });

  it("returns one local record for every payment status", () => {
    const response = getSandboxTransactions();

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
    const response = getSandboxTransactions({
      status: ["succeeded", "failed"],
      limit: 1,
      cursor: "ignored",
    });

    expect(response.data).toHaveLength(1);
    expect(response.data[0].status).toBe("succeeded");
  });
});
