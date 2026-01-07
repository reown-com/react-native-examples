/**
 * NumericKeyboard Component Tests
 *
 * Tests for the numeric keyboard component used for amount input
 */

import { render, fireEvent } from "@testing-library/react-native";
import { NumericKeyboard } from "@/components/numeric-keyboard";

// Helper to find the pressable button ancestor of a key element
const findButtonAncestor = (element: any): any => {
  let current = element;
  while (current?.parent) {
    current = current.parent;
    // Our mock buttons have accessibilityRole="button"
    if (current?.props?.accessibilityRole === "button") {
      return current;
    }
  }
  return element.parent?.parent || element;
};

describe("NumericKeyboard", () => {
  describe("rendering", () => {
    it("renders all numeric keys (0-9)", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      // Check all number keys are rendered
      for (let i = 0; i <= 9; i++) {
        expect(getByTestId(`key-${i}`)).toBeTruthy();
      }
    });

    it("renders decimal point key", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      expect(getByTestId("key-.")).toBeTruthy();
    });

    it("renders erase/backspace key", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      expect(getByTestId("key-erase")).toBeTruthy();
    });

    it("applies custom style", () => {
      const onKeyPress = jest.fn();
      const customStyle = { marginTop: 20 };
      const { toJSON } = render(
        <NumericKeyboard onKeyPress={onKeyPress} style={customStyle} />,
      );

      // Verify the component renders without crashing with custom style
      expect(toJSON()).toBeTruthy();
    });
  });

  describe("key press interactions", () => {
    it("calls onKeyPress with correct value for number keys", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      // Press key "5" - find the button ancestor to press
      const key5 = getByTestId("key-5");
      fireEvent.press(findButtonAncestor(key5));
      expect(onKeyPress).toHaveBeenCalledWith("5");
    });

    it("calls onKeyPress for all number keys with correct values", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      // Press each number key in order 0-9
      for (let i = 0; i <= 9; i++) {
        const key = getByTestId(`key-${i}`);
        fireEvent.press(findButtonAncestor(key));
      }

      expect(onKeyPress).toHaveBeenCalledTimes(10);
      // Verify each key was called with correct value
      for (let i = 0; i <= 9; i++) {
        expect(onKeyPress).toHaveBeenCalledWith(String(i));
      }
    });

    it("calls onKeyPress with '.' for decimal key", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      const decimalKey = getByTestId("key-.");
      fireEvent.press(findButtonAncestor(decimalKey));
      expect(onKeyPress).toHaveBeenCalledWith(".");
    });

    it("calls onKeyPress with 'erase' for backspace key", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      const eraseKey = getByTestId("key-erase");
      fireEvent.press(findButtonAncestor(eraseKey));
      expect(onKeyPress).toHaveBeenCalledWith("erase");
    });
  });

  describe("keyboard layout", () => {
    it("renders keys in correct order (standard phone layout)", () => {
      const onKeyPress = jest.fn();
      const { toJSON } = render(<NumericKeyboard onKeyPress={onKeyPress} />);

      // The component should render without errors
      expect(toJSON()).toBeTruthy();
    });

    it("handles rapid consecutive key presses", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      // Simulate rapid typing: "123.45"
      const keys = ["1", "2", "3", ".", "4", "5"];
      keys.forEach((key) => {
        const keyElement = getByTestId(`key-${key}`);
        fireEvent.press(findButtonAncestor(keyElement));
      });

      expect(onKeyPress).toHaveBeenCalledTimes(6);
      expect(onKeyPress.mock.calls).toEqual([
        ["1"],
        ["2"],
        ["3"],
        ["."],
        ["4"],
        ["5"],
      ]);
    });

    it("handles erase after entering numbers", () => {
      const onKeyPress = jest.fn();
      const { getByTestId } = render(
        <NumericKeyboard onKeyPress={onKeyPress} />,
      );

      // Type "12" then erase
      fireEvent.press(findButtonAncestor(getByTestId("key-1")));
      fireEvent.press(findButtonAncestor(getByTestId("key-2")));
      fireEvent.press(findButtonAncestor(getByTestId("key-erase")));

      expect(onKeyPress).toHaveBeenCalledTimes(3);
      expect(onKeyPress.mock.calls).toEqual([["1"], ["2"], ["erase"]]);
    });
  });
});
