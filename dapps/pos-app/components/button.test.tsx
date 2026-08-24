import React from "react";
import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Button } from "@/components/button";
import { Colors } from "@/constants/theme";

const mockColors = Colors;

jest.mock("react-native", () => ({
  StyleSheet: {
    create: (styles: Record<string, unknown>) => styles,
    flatten: (style: unknown) =>
      Array.isArray(style) ? Object.assign({}, ...style) : style,
  },
  Platform: {
    OS: "ios",
    select: (options: Record<string, unknown>) =>
      options.ios ?? options.default,
  },
  Text: "Text",
  View: "View",
}));

jest.mock("@/hooks/use-theme-color", () => ({
  useTheme: () => mockColors.light,
  useThemeColor: (colorName: keyof typeof mockColors.light) =>
    mockColors.light[colorName],
}));

jest.mock("./pressable", () => {
  const mockReact = jest.requireActual("react");

  return {
    Pressable: ({ children, ...props }: React.PropsWithChildren<any>) =>
      mockReact.createElement("View", props, children),
  };
});

function getButtonStyle(testID: string) {
  const button = render(
    <Button type="accent" variant="primary" testID={testID} onPress={() => {}}>
      CTA
    </Button>,
  ).getByTestId(testID);

  return { button, style: StyleSheet.flatten(button.props.style) };
}

describe("Button", () => {
  it("applies shared dimensions and full width by default", () => {
    const { style } = getButtonStyle("default-button");

    expect(style).toMatchObject({
      height: 54,
      width: "100%",
      borderRadius: 16,
      backgroundColor: Colors.light["bg-accent-primary"],
    });
  });

  it("supports the neutral secondary variant", () => {
    const button = render(
      <Button
        type="neutral"
        variant="secondary"
        testID="secondary-button"
        onPress={() => {}}
      >
        Cancel
      </Button>,
    ).getByTestId("secondary-button");

    const flattenedStyle = StyleSheet.flatten(button.props.style);
    expect(flattenedStyle.backgroundColor).toBeUndefined();
    expect(flattenedStyle.borderColor).toBe(Colors.light["border-secondary"]);
    expect(flattenedStyle.borderWidth).toBe(1);
  });

  it("supports the large tablet size", () => {
    const screen = render(
      <Button
        type="accent"
        variant="primary"
        size="lg"
        testID="large-button"
        onPress={() => {}}
      >
        Charge
      </Button>,
    );

    const button = screen.getByTestId("large-button");
    const label = screen.getByText("Charge");

    expect(StyleSheet.flatten(button.props.style).height).toBe(64);
    expect(StyleSheet.flatten(label.props.style)).toMatchObject({
      fontSize: 22,
      lineHeight: 24,
    });
  });

  it("supports the neutral tertiary variant and compact width", () => {
    const button = render(
      <Button
        type="neutral"
        variant="tertiary"
        fullWidth={false}
        testID="tertiary-button"
        onPress={() => {}}
      >
        Print
      </Button>,
    ).getByTestId("tertiary-button");

    const style = StyleSheet.flatten(button.props.style);
    expect(style.width).toBeUndefined();
    expect(style.backgroundColor).toBe(Colors.light["bg-invert"]);
  });

  it("passes disabled state through and applies the disabled treatment", () => {
    const button = render(
      <Button
        type="accent"
        variant="primary"
        disabled
        testID="disabled-button"
        onPress={() => {}}
      >
        Disabled
      </Button>,
    ).getByTestId("disabled-button");

    expect(button.props.disabled).toBe(true);
    expect(StyleSheet.flatten(button.props.style).opacity).toBe(0.6);
  });
});
