import { renderHook } from "@testing-library/react-native";
import { useLatchedFlag } from "@/hooks/use-latched-flag";

describe("useLatchedFlag", () => {
  it("starts false when the value is false", () => {
    const { result } = renderHook(() => useLatchedFlag(false));

    expect(result.current).toBe(false);
  });

  it("starts true when the value is true", () => {
    const { result } = renderHook(() => useLatchedFlag(true));

    expect(result.current).toBe(true);
  });

  it("turns true on the same render the value becomes true", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: boolean }) => useLatchedFlag(value),
      { initialProps: { value: false } },
    );

    rerender({ value: true });

    expect(result.current).toBe(true);
  });

  it("stays true after the value flips back to false", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: boolean }) => useLatchedFlag(value),
      { initialProps: { value: false } },
    );

    rerender({ value: true });
    rerender({ value: false });
    rerender({ value: false });

    expect(result.current).toBe(true);
  });
});
