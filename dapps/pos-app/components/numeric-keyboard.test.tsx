import { fireEvent, render } from "@testing-library/react-native";
import React from "react";
import { StyleSheet } from "react-native";

import { Colors } from "@/constants/theme";

import { NumericKeyboard } from "./numeric-keyboard";

let mockTablet = false;
const mockColors = Colors;

jest.mock("react-native", () => ({
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
    flatten: (style: unknown) => {
      const flattened: Record<string, unknown> = {};
      const applyStyle = (value: unknown) => {
        if (Array.isArray(value)) {
          value.forEach(applyStyle);
        } else if (value && typeof value === "object") {
          Object.assign(flattened, value);
        }
      };
      applyStyle(style);
      return flattened;
    },
  },
  Platform: {
    OS: "ios",
    select: (options: Record<string, unknown>) =>
      options.ios ?? options.default,
  },
  Text: "Text",
  View: "View",
}));

jest.mock("@/hooks/use-is-tablet", () => ({
  useIsTablet: () => mockTablet,
}));

jest.mock("@/hooks/use-theme-color", () => ({
  useTheme: () => mockColors.light,
  useThemeColor: (colorName: keyof typeof mockColors.light) =>
    mockColors.light[colorName],
}));

jest.mock("expo-asset", () => ({
  useAssets: () => [["backspace"]],
}));

jest.mock("expo-image", () => {
  const mockReact = jest.requireActual("react");

  return {
    Image: (props: unknown) => mockReact.createElement("Image", props),
  };
});

jest.mock("./pressable", () => {
  const mockReact = jest.requireActual("react");

  return {
    Pressable: ({ children, ...props }: React.PropsWithChildren<any>) =>
      mockReact.createElement("View", props, children),
  };
});

describe("NumericKeyboard", () => {
  beforeEach(() => {
    mockTablet = false;
  });

  it("keeps the existing phone metrics", () => {
    const screen = render(<NumericKeyboard onKeyPress={() => {}} />);

    expect(
      StyleSheet.flatten(screen.getByTestId("key-1").props.style),
    ).toMatchObject({ height: 64 });
    expect(StyleSheet.flatten(screen.getByText("1").props.style)).toMatchObject(
      {
        fontSize: 22,
        lineHeight: 26,
      },
    );
  });

  it("uses larger keys, labels, and backspace icon on tablets", () => {
    mockTablet = true;
    const screen = render(<NumericKeyboard onKeyPress={() => {}} />);

    expect(
      StyleSheet.flatten(screen.getByTestId("key-1").props.style),
    ).toMatchObject({ height: 96 });
    expect(StyleSheet.flatten(screen.getByText("1").props.style)).toMatchObject(
      {
        fontSize: 28,
        lineHeight: 32,
      },
    );

    const backspaceIcon = screen
      .getByLabelText("Backspace")
      .findByType("Image");
    expect(StyleSheet.flatten(backspaceIcon.props.style)).toMatchObject({
      width: 28,
      height: 28,
    });
  });

  it("emits decimal and backspace input", () => {
    const onKeyPress = jest.fn();
    const screen = render(<NumericKeyboard onKeyPress={onKeyPress} />);

    fireEvent.press(screen.getByTestId("key-decimal"));
    fireEvent.press(screen.getByTestId("key-erase"));

    expect(onKeyPress).toHaveBeenNthCalledWith(1, ".");
    expect(onKeyPress).toHaveBeenNthCalledWith(2, "erase");
  });
});
