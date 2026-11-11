import { renderHook } from "@testing-library/react-native";

import { getCharactersArray } from "../utils/getCharactersArray";
import { useAnimatedNumberLayout } from "./useAnimatedNumberLayout";

describe("useAnimatedNumberLayout", () => {
  it("preserves the existing medium metrics", async () => {
    const parsed = getCharactersArray("$123.45");
    const { result } = await renderHook(() =>
      useAnimatedNumberLayout({ ...parsed, size: "md" }),
    );

    expect(result.current.fontSize).toBe(64);
    expect(result.current.itemHeight).toBe(60);
    expect(result.current.scale).toBe(1);
  });

  it("scales every layout metric proportionally for tablets", async () => {
    const parsed = getCharactersArray("$123.45");
    const medium = (
      await renderHook(() => useAnimatedNumberLayout({ ...parsed, size: "md" }))
    ).result.current;
    const large = (
      await renderHook(() => useAnimatedNumberLayout({ ...parsed, size: "lg" }))
    ).result.current;

    expect(large.fontSize).toBe(80);
    expect(large.itemHeight).toBe(75);
    expect(large.totalContentWidth).toBeCloseTo(
      medium.totalContentWidth * 1.25,
    );
  });

  it("retains digit-count compression for long tablet amounts", async () => {
    const parsed = getCharactersArray("$123,456.78");
    const { result } = await renderHook(() =>
      useAnimatedNumberLayout({ ...parsed, size: "lg" }),
    );

    expect(result.current.scale).toBe(0.85);
    expect(result.current.totalContentWidth).toBeGreaterThan(0);
  });
});
