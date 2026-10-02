/**
 * getBuildVariant reads __DEV__ and the runtime applicationId, so each case
 * re-requires the module with a fresh expo-application mock.
 */
const globalWithDev = global as typeof globalThis & { __DEV__: boolean };

describe("getBuildVariant", () => {
  const originalDev = globalWithDev.__DEV__;

  afterEach(() => {
    globalWithDev.__DEV__ = originalDev;
    jest.resetModules();
  });

  function load(applicationId: string | null, dev: boolean) {
    globalWithDev.__DEV__ = dev;
    let variant: string;
    jest.isolateModules(() => {
      jest.doMock("expo-application", () => ({ applicationId }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      variant = require("@/utils/build-variant").getBuildVariant();
    });
    // @ts-expect-error assigned inside isolateModules
    return variant;
  }

  it("returns 'development' when __DEV__ is true", () => {
    expect(load("com.reown.mobilepos", true)).toBe("development");
  });

  it("returns 'internal' for a .internal applicationId", () => {
    expect(load("com.reown.mobilepos.internal", false)).toBe("internal");
  });

  it("returns 'production' for the shipped applicationId", () => {
    expect(load("com.reown.mobilepos", false)).toBe("production");
  });

  it("defaults to 'production' when applicationId is null", () => {
    expect(load(null, false)).toBe("production");
  });
});
