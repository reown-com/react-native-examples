/**
 * Button Component Tests
 *
 * Tests for the Button component that wraps PressableScale
 */

import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "@/components/button";
import { Text, View } from "react-native";

describe("Button", () => {
  describe("rendering", () => {
    it("renders children correctly", () => {
      const { toJSON } = render(
        <Button onPress={() => {}}>
          <Text testID="button-text">Click me</Text>
        </Button>,
      );

      // Verify component renders
      expect(toJSON()).toBeTruthy();
    });

    it("renders with custom style", () => {
      const customStyle = { backgroundColor: "red", padding: 10 };
      const { toJSON } = render(
        <Button onPress={() => {}} style={customStyle}>
          <Text>Styled Button</Text>
        </Button>,
      );

      const tree = toJSON();
      expect(tree).toBeTruthy();
      // The style should be applied to the root element
      expect(tree.props.style).toEqual(customStyle);
    });

    it("renders multiple children", () => {
      const { toJSON } = render(
        <Button onPress={() => {}}>
          <Text>First</Text>
          <Text>Second</Text>
        </Button>,
      );

      const tree = toJSON();
      expect(tree).toBeTruthy();
      // Should have 2 children
      expect(tree.children).toHaveLength(2);
    });
  });

  describe("interactions", () => {
    it("calls onPress when pressed", () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <Button onPress={onPressMock}>
          <View testID="button-content">
            <Text>Press me</Text>
          </View>
        </Button>,
      );

      // The button itself wraps the content
      const buttonContent = getByTestId("button-content");
      // Fire press on the parent (the button)
      fireEvent.press(buttonContent.parent!);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it("calls onPress multiple times on multiple presses", () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <Button onPress={onPressMock}>
          <View testID="button-content">
            <Text>Press me</Text>
          </View>
        </Button>,
      );

      const button = getByTestId("button-content").parent!;
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(3);
    });
  });

  describe("disabled state", () => {
    it("sets onPress to undefined when disabled", () => {
      const { toJSON } = render(
        <Button onPress={() => {}} disabled>
          <Text>Disabled Button</Text>
        </Button>,
      );

      const tree = toJSON();
      expect(tree.props.onPress).toBeUndefined();
    });

    it("has correct accessibility state when disabled", () => {
      const { toJSON } = render(
        <Button onPress={() => {}} disabled>
          <Text>Disabled Button</Text>
        </Button>,
      );

      const tree = toJSON();
      expect(tree.props.accessibilityState?.disabled).toBe(true);
    });

    it("has correct accessibility state when enabled", () => {
      const { toJSON } = render(
        <Button onPress={() => {}} disabled={false}>
          <Text>Enabled Button</Text>
        </Button>,
      );

      const tree = toJSON();
      expect(tree.props.accessibilityState?.disabled).toBe(false);
    });

    it("passes enabled={false} to PressableScale when disabled", () => {
      const { toJSON } = render(
        <Button onPress={() => {}} disabled>
          <Text>Disabled Button</Text>
        </Button>,
      );

      const tree = toJSON();
      expect(tree.props.accessibilityRole).toBe("button");
      expect(tree.props.accessibilityState?.disabled).toBe(true);
    });

    it("calls onPress when disabled is false", () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <Button onPress={onPressMock} disabled={false}>
          <View testID="button-content">
            <Text>Enabled Button</Text>
          </View>
        </Button>,
      );

      const button = getByTestId("button-content").parent!;
      fireEvent.press(button);

      expect(onPressMock).toHaveBeenCalledTimes(1);
    });
  });
});
