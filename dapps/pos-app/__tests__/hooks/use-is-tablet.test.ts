import { isTablet } from "react-native-device-info";

import { getIsTablet } from "@/hooks/use-is-tablet";

const mockIsTablet = jest.mocked(isTablet);

describe("getIsTablet", () => {
  beforeEach(() => {
    mockIsTablet.mockReset();
    mockIsTablet.mockReturnValue(false);
  });

  it("uses the native device classification on iOS and Android", () => {
    mockIsTablet.mockReturnValue(true);

    expect(getIsTablet("ios")).toBe(true);
    expect(getIsTablet("android")).toBe(true);
    expect(mockIsTablet).toHaveBeenCalledTimes(2);
  });

  it("returns false for native handsets", () => {
    expect(getIsTablet("ios")).toBe(false);
  });

  it("always returns false on web without querying device info", () => {
    mockIsTablet.mockReturnValue(true);

    expect(getIsTablet("web")).toBe(false);
    expect(mockIsTablet).not.toHaveBeenCalled();
  });
});
