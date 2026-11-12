import { render } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { Pressable } from "./pressable";

jest.mock("react-native", () => ({
  StyleSheet: {
    flatten: (style: unknown) => style,
  },
  Text: "Text",
  View: "View",
}));

jest.mock("pressto", () => {
  const mockReact = jest.requireActual("react");

  return {
    PressableScale: ({ children, ...props }: React.PropsWithChildren<any>) =>
      mockReact.createElement("View", props, children),
  };
});

describe("Pressable", () => {
  it("defaults to the button accessibility role", async () => {
    const pressable = (
      await render(
        <Pressable testID="pressable" onPress={() => {}}>
          <Text>Content</Text>
        </Pressable>,
      )
    ).getByTestId("pressable");

    expect(pressable.props.accessibilityRole).toBe("button");
  });

  it("preserves an explicit accessibility role", async () => {
    const pressable = (
      await render(
        <Pressable
          testID="pressable"
          accessibilityRole="link"
          onPress={() => {}}
        >
          <Text>Content</Text>
        </Pressable>,
      )
    ).getByTestId("pressable");

    expect(pressable.props.accessibilityRole).toBe("link");
  });

  it("maps disabled state to Pressto and accessibility props", async () => {
    const pressable = (
      await render(
        <Pressable testID="pressable" disabled onPress={() => {}}>
          <Text>Content</Text>
        </Pressable>,
      )
    ).getByTestId("pressable");

    expect(pressable.props.enabled).toBe(false);
    expect(pressable.props.accessibilityState).toEqual({ disabled: true });
  });
});
