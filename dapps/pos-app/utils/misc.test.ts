import { formatCountdown, getDate, getDeviceIdentifier } from "./misc";

// Mock react-native-device-info
const mockGetUniqueId = jest.fn();
jest.mock("react-native-device-info", () => ({
  getUniqueId: () => mockGetUniqueId(),
}));

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

describe("getDeviceIdentifier", () => {
  beforeEach(() => {
    mockGetUniqueId.mockReset();
  });

  it("returns device id as string when successful", async () => {
    mockGetUniqueId.mockResolvedValue("device-123-abc");
    const result = await getDeviceIdentifier();
    expect(result).toBe("device-123-abc");
  });

  it("converts numeric device id to string", async () => {
    mockGetUniqueId.mockResolvedValue(123456);
    const result = await getDeviceIdentifier();
    expect(result).toBe("123456");
  });

  it('returns "unknown" when getUniqueId throws an error', async () => {
    mockGetUniqueId.mockRejectedValue(new Error("Device not available"));
    const result = await getDeviceIdentifier();
    expect(result).toBe("unknown");
  });

  it('returns "unknown" when getUniqueId rejects with non-Error', async () => {
    mockGetUniqueId.mockRejectedValue("Some string error");
    const result = await getDeviceIdentifier();
    expect(result).toBe("unknown");
  });
});

describe("formatCountdown", () => {
  it("formats minutes and seconds with M:SSs format", () => {
    expect(formatCountdown(312)).toBe("5:12s");
    expect(formatCountdown(65)).toBe("1:05s");
    expect(formatCountdown(0)).toBe("0:00s");
    expect(formatCountdown(9)).toBe("0:09s");
    expect(formatCountdown(60)).toBe("1:00s");
    expect(formatCountdown(599)).toBe("9:59s");
  });

  it("clamps negative values to 0:00s", () => {
    expect(formatCountdown(-5)).toBe("0:00s");
  });

  it("floors fractional seconds", () => {
    expect(formatCountdown(65.8)).toBe("1:05s");
  });
});
