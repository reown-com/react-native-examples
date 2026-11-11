import { renderHook } from "@testing-library/react-native";
import { useLatchedFlag } from "@/hooks/use-latched-flag";

describe("useLatchedFlag", () => {
  it("starts false when the value is false", async () => {
    const { result } = await renderHook(() => useLatchedFlag(false));

    expect(result.current).toBe(false);
  });

  it("starts true when the value is true", async () => {
    const { result } = await renderHook(() => useLatchedFlag(true));

    expect(result.current).toBe(true);
  });

  it("turns true on the same render the value becomes true", async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: boolean }) => useLatchedFlag(value),
      { initialProps: { value: false } },
    );

    await rerender({ value: true });

    expect(result.current).toBe(true);
  });

  it("stays true after the value flips back to false", async () => {
    const { result, rerender } = await renderHook(
      ({ value }: { value: boolean }) => useLatchedFlag(value),
      { initialProps: { value: false } },
    );

    await rerender({ value: true });
    await rerender({ value: false });
    await rerender({ value: false });

    expect(result.current).toBe(true);
  });
});
