import React from "react";
import { fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

import { Pressable } from "@/components/pressable";

jest.mock("react-native", () => ({
  StyleSheet: {
    flatten: (style: unknown) =>
      Array.isArray(style) ? Object.assign({}, ...style) : style,
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
  it("delegates press behavior, disabled state, styles, and test IDs", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Pressable
        onPress={onPress}
        disabled
        testID="generic-pressable"
        style={{ opacity: 0.4 }}
      >
        <Text>Press</Text>
      </Pressable>,
    );

    const pressable = getByTestId("generic-pressable");
    expect(pressable.props.enabled).toBe(false);
    expect(pressable.props.style).toEqual({ opacity: 0.4 });

    fireEvent.press(pressable);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
