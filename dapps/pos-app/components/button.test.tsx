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

jest.mock("expo-image", () => ({ Image: "Image" }));

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
  it("defaults to the design system lg size, fully round and full width", () => {
    const { style } = getButtonStyle("default-button");

    expect(style).toMatchObject({
      height: 54,
      width: "100%",
      borderRadius: 999,
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

  it.each([
    ["lg", 54, 18, 24],
    ["md", 44, 16, 20],
    ["sm", 32, 14, 16],
  ] as const)(
    "uses the design system %s size",
    (size, height, fontSize, lineHeight) => {
      const screen = render(
        <Button
          type="accent"
          variant="primary"
          size={size}
          testID="sized-button"
          onPress={() => {}}
        >
          Charge
        </Button>,
      );

      const button = screen.getByTestId("sized-button");
      const label = screen.getByText("Charge");

      expect(StyleSheet.flatten(button.props.style).height).toBe(height);
      expect(StyleSheet.flatten(label.props.style)).toMatchObject({
        fontSize,
        lineHeight,
      });
    },
  );

  it("supports Primary Neutral and compact width", () => {
    const button = render(
      <Button
        type="neutral"
        variant="primary"
        fullWidth={false}
        testID="neutral-primary-button"
        onPress={() => {}}
      >
        Print
      </Button>,
    ).getByTestId("neutral-primary-button");

    const style = StyleSheet.flatten(button.props.style);
    expect(style.width).toBeUndefined();
    expect(style.backgroundColor).toBe(Colors.light["bg-invert"]);
  });

  it("uses the design system disabled colours, not opacity", () => {
    const screen = render(
      <Button
        type="accent"
        variant="primary"
        disabled
        testID="disabled-button"
        onPress={() => {}}
      >
        Disabled
      </Button>,
    );
    const button = screen.getByTestId("disabled-button");
    const style = StyleSheet.flatten(button.props.style);

    expect(button.props.disabled).toBe(true);
    expect(style.opacity).toBeUndefined();
    expect(style.backgroundColor).toBe(Colors.light["bg-button-disabled"]);
    expect(
      StyleSheet.flatten(screen.getByText("Disabled").props.style).color,
    ).toBe(Colors.light["text-disabled"]);
  });

  it("renders icons in the left and right slots around the label", () => {
    const screen = render(
      <Button
        type="neutral"
        variant="secondary"
        size="md"
        iconLeft={1}
        iconRight={2}
        testID="icon-button"
        onPress={() => {}}
      >
        Print
      </Button>,
    );
    const content = screen.getByTestId("icon-button").props.children;
    const [left, label, right] = content.props.children;

    expect(left.props.source).toBe(1);
    expect(left.props.style).toMatchObject({ width: 20, height: 20 });
    expect(label.props.children).toBe("Print");
    expect(right.props.source).toBe(2);
  });
});
