import { router } from "expo-router";

import { resetNavigation } from "./navigation";

jest.mock("expo-router", () => ({
  router: {
    dismissAll: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
  },
}));

describe("resetNavigation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("clears the current stack before opening the requested route", () => {
    resetNavigation("/amount");

    expect(router.dismissAll).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/");
    expect(router.navigate).toHaveBeenCalledWith("/amount");
  });

  it("returns to the home route when no destination is provided", () => {
    resetNavigation();

    expect(router.dismissAll).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith("/");
    expect(router.navigate).not.toHaveBeenCalled();
  });
});
