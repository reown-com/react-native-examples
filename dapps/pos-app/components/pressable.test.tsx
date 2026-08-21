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

  // Mirror the real PressableScale: when `enabled` is false, a press is a
  // no-op, so the provided onPress is never invoked.
  return {
    PressableScale: ({
      children,
      onPress,
      enabled,
      ...props
    }: React.PropsWithChildren<any>) =>
      mockReact.createElement(
        "View",
        {
          ...props,
          enabled,
          onPress: (...args: unknown[]) => {
            if (enabled !== false) {
              onPress?.(...args);
            }
          },
        },
        children,
      ),
  };
});

describe("Pressable", () => {
  it("delegates press behavior, styles, and test IDs when enabled", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Pressable
        onPress={onPress}
        testID="generic-pressable"
        style={{ opacity: 1 }}
      >
        <Text>Press</Text>
      </Pressable>,
    );

    const pressable = getByTestId("generic-pressable");
    expect(pressable.props.enabled).toBe(true);
    expect(pressable.props.style).toEqual({ opacity: 1 });

    fireEvent.press(pressable);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not fire onPress when disabled", () => {
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
    expect(onPress).not.toHaveBeenCalled();
  });
});
