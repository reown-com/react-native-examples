import { formatCountdown, formatCountdownSpoken, getDate } from "./misc";

describe("getDate", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns date in YYYY-MM-DD format", () => {
    jest.setSystemTime(new Date("2024-06-15T12:00:00"));
    expect(getDate()).toBe("2024-06-15");
  });

  it("pads single digit month with leading zero", () => {
    jest.setSystemTime(new Date("2024-01-20T12:00:00"));
    expect(getDate()).toBe("2024-01-20");
  });

  it("pads single digit day with leading zero", () => {
    jest.setSystemTime(new Date("2024-12-05T12:00:00"));
    expect(getDate()).toBe("2024-12-05");
  });

  it("handles end of year date", () => {
    jest.setSystemTime(new Date("2024-12-31T12:00:00"));
    expect(getDate()).toBe("2024-12-31");
  });

  it("handles start of year date", () => {
    // Use midday to avoid timezone boundary issues
    jest.setSystemTime(new Date("2024-01-01T12:00:00"));
    expect(getDate()).toBe("2024-01-01");
  });

  it("handles different years", () => {
    jest.setSystemTime(new Date("2030-07-22T12:00:00"));
    expect(getDate()).toBe("2030-07-22");
  });
});

describe("formatCountdown", () => {
  it("formats minutes and seconds with M:SS colon notation and no suffix", () => {
    expect(formatCountdown(312)).toBe("5:12");
    expect(formatCountdown(65)).toBe("1:05");
    expect(formatCountdown(45)).toBe("0:45");
    expect(formatCountdown(0)).toBe("0:00");
    expect(formatCountdown(9)).toBe("0:09");
    expect(formatCountdown(60)).toBe("1:00");
    expect(formatCountdown(599)).toBe("9:59");
  });

  it("clamps negative values to 0:00", () => {
    expect(formatCountdown(-5)).toBe("0:00");
  });

  it("floors fractional seconds", () => {
    expect(formatCountdown(65.8)).toBe("1:05");
  });
});

describe("formatCountdownSpoken", () => {
  it("spells out minutes and seconds for screen readers", () => {
    expect(formatCountdownSpoken(312)).toBe("5 minutes 12 seconds");
    expect(formatCountdownSpoken(65)).toBe("1 minute 5 seconds");
  });

  it("singularizes and omits zero units", () => {
    expect(formatCountdownSpoken(60)).toBe("1 minute");
    expect(formatCountdownSpoken(61)).toBe("1 minute 1 second");
    expect(formatCountdownSpoken(45)).toBe("45 seconds");
    expect(formatCountdownSpoken(1)).toBe("1 second");
  });

  it("reads zero (and negatives) as 0 seconds", () => {
    expect(formatCountdownSpoken(0)).toBe("0 seconds");
    expect(formatCountdownSpoken(-5)).toBe("0 seconds");
  });
});
