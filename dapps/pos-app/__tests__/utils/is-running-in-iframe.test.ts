import { isRunningInIframe } from "@/utils/is-running-in-iframe";
import { Platform } from "react-native";

describe("isRunningInIframe", () => {
  const originalWindow = global.window;
  const originalPlatform = Platform.OS;

  afterEach(() => {
    (global as any).window = originalWindow;
    (Platform as any).OS = originalPlatform;
  });

  it("returns false when web rendering has no window", () => {
    (Platform as any).OS = "web";
    delete (global as any).window;

    expect(isRunningInIframe()).toBe(false);
  });

  it("returns true for an iframe window", () => {
    (Platform as any).OS = "web";
    (global as any).window = { self: {}, top: {} };

    expect(isRunningInIframe()).toBe(true);
  });
});
