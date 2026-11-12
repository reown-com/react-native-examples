import { renderHook, act } from "@testing-library/react-native";
import { useCountdown } from "@/hooks/use-countdown";

describe("useCountdown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns inactive state when expiresAt is null", async () => {
    const { result } = await renderHook(() =>
      useCountdown({ expiresAt: null }),
    );

    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isExpired).toBe(false);
    expect(result.current.isActive).toBe(false);
  });

  it("calculates remaining seconds from expiresAt", async () => {
    const now = Date.now() / 1000;
    const expiresAt = now + 120; // 2 minutes from now

    const { result } = await renderHook(() => useCountdown({ expiresAt }));

    expect(result.current.remainingSeconds).toBe(120);
    expect(result.current.isActive).toBe(true);
    expect(result.current.isExpired).toBe(false);
  });

  it("counts down every second", async () => {
    const now = Date.now() / 1000;
    const expiresAt = now + 10;

    const { result } = await renderHook(() => useCountdown({ expiresAt }));

    expect(result.current.remainingSeconds).toBe(10);

    await act(() => {
      jest.advanceTimersByTime(1000);
    });
    expect(result.current.remainingSeconds).toBe(9);

    await act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.remainingSeconds).toBe(6);
  });

  it("calls onExpired exactly once when timer reaches zero", async () => {
    const onExpired = jest.fn();
    const now = Date.now() / 1000;
    const expiresAt = now + 3;

    await renderHook(() => useCountdown({ expiresAt, onExpired }));

    await act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(onExpired).toHaveBeenCalledTimes(1);

    // Advancing further should not call again
    await act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("does not call onExpired when expiresAt is null", async () => {
    const onExpired = jest.fn();

    await renderHook(() => useCountdown({ expiresAt: null, onExpired }));

    await act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(onExpired).not.toHaveBeenCalled();
  });

  it("returns isExpired true when expiresAt is in the past", async () => {
    const now = Date.now() / 1000;
    const expiresAt = now - 10; // 10 seconds ago

    const { result } = await renderHook(() => useCountdown({ expiresAt }));

    expect(result.current.remainingSeconds).toBe(0);
    expect(result.current.isExpired).toBe(true);
    expect(result.current.isActive).toBe(false);
  });

  it("fires onExpired when expiresAt is already in the past", async () => {
    const onExpired = jest.fn();
    const now = Date.now() / 1000;
    const expiresAt = now - 5;

    await renderHook(() => useCountdown({ expiresAt, onExpired }));

    await act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onExpired).toHaveBeenCalledTimes(1);
  });

  it("resets when expiresAt changes", async () => {
    const now = Date.now() / 1000;
    let expiresAt: number | null = now + 10;

    const { result, rerender } = await renderHook(() =>
      useCountdown({ expiresAt }),
    );

    expect(result.current.remainingSeconds).toBe(10);

    await act(() => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.remainingSeconds).toBe(5);

    // Change expiresAt to a new value
    expiresAt = now + 60;
    await rerender({});

    expect(result.current.remainingSeconds).toBe(55); // 60 - 5 seconds elapsed
    expect(result.current.isActive).toBe(true);
  });
});
