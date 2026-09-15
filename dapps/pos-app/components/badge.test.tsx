import { render } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { Badge } from "@/components/badge";
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

describe("Badge", () => {
  it("renders the label and applies the background token", () => {
    const { getByText, getByTestId } = render(
      <Badge
        testID="badge"
        label="Not set"
        backgroundColor="bg-warning"
        color="text-tertiary"
      />,
    );

    expect(getByText("Not set")).toBeTruthy();
    expect(StyleSheet.flatten(getByTestId("badge").props.style)).toMatchObject({
      backgroundColor: Colors.light["bg-warning"],
    });
  });
});
