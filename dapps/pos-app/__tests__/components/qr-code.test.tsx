/**
 * QrCode Component Tests
 *
 * Tests for the QR code display component
 */

import { render, fireEvent } from "@testing-library/react-native";
import QrCode from "@/components/qr-code";
import { Text, View } from "react-native";

describe("QrCode", () => {
  const defaultProps = {
    size: 200,
  };

  describe("rendering without URI (loading state)", () => {
    it("renders shimmer loading state when uri is undefined", () => {
      const { queryByTestId } = render(
        <QrCode {...defaultProps} testID="qr-container" />,
      );

      // Should not render the QR container when no URI (renders Shimmer instead)
      expect(queryByTestId("qr-container")).toBeNull();
    });

    it("renders shimmer loading state when uri is empty string", () => {
      const { queryByTestId } = render(
        <QrCode {...defaultProps} uri="" testID="qr-container" />,
      );

      // Empty string is falsy, so should show shimmer
      expect(queryByTestId("qr-container")).toBeNull();
    });

    it("renders something when uri is not provided", () => {
      const { toJSON } = render(<QrCode {...defaultProps} />);

      // Should render shimmer component
      expect(toJSON()).toBeTruthy();
    });
  });

  describe("rendering with URI", () => {
    it("renders QR code container when uri is provided", () => {
      const { getByTestId } = render(
        <QrCode {...defaultProps} uri="https://example.com" testID="qr-code" />,
      );

      expect(getByTestId("qr-code")).toBeTruthy();
    });

    it("renders with correct size dimensions in style", () => {
      const size = 250;
      const { getByTestId } = render(
        <QrCode size={size} uri="https://example.com" testID="qr-code" />,
      );

      const container = getByTestId("qr-code");
      // Style is an array in the component
      const styles = Array.isArray(container.props.style)
        ? container.props.style
        : [container.props.style];
      const hasCorrectSize = styles.some(
        (s: any) => s?.height === size && s?.width === size,
      );
      expect(hasCorrectSize).toBe(true);
    });

    it("applies custom style", () => {
      const customStyle = { margin: 10 };
      const { getByTestId } = render(
        <QrCode
          {...defaultProps}
          uri="https://example.com"
          testID="qr-code"
          style={customStyle}
        />,
      );

      const container = getByTestId("qr-code");
      const styles = Array.isArray(container.props.style)
        ? container.props.style
        : [container.props.style];
      const hasCustomStyle = styles.some((s: any) => s?.margin === 10);
      expect(hasCustomStyle).toBe(true);
    });
  });

  describe("children (logo)", () => {
    it("renders children inside QR code", () => {
      const { getByTestId } = render(
        <QrCode {...defaultProps} uri="https://example.com" testID="qr-code">
          <View testID="logo-content">
            <Text>Logo</Text>
          </View>
        </QrCode>,
      );

      expect(getByTestId("logo-content")).toBeTruthy();
    });

    it("renders with arenaClear prop", () => {
      const { getByTestId } = render(
        <QrCode
          {...defaultProps}
          uri="https://example.com"
          testID="qr-code"
          arenaClear
        >
          <View testID="logo-content">
            <Text>Logo</Text>
          </View>
        </QrCode>,
      );

      // Component should render without crashing
      expect(getByTestId("qr-code")).toBeTruthy();
    });
  });

  describe("press interactions", () => {
    it("calls onPress when pressed", () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <QrCode
          {...defaultProps}
          uri="https://example.com"
          testID="qr-code"
          onPress={onPressMock}
        />,
      );

      fireEvent.press(getByTestId("qr-code"));
      expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    it("does not crash when pressed without onPress handler", () => {
      const { getByTestId } = render(
        <QrCode {...defaultProps} uri="https://example.com" testID="qr-code" />,
      );

      // Should not throw
      expect(() => fireEvent.press(getByTestId("qr-code"))).not.toThrow();
    });

    it("is disabled when onPress is not provided", () => {
      const { getByTestId } = render(
        <QrCode {...defaultProps} uri="https://example.com" testID="qr-code" />,
      );

      const container = getByTestId("qr-code");
      // Pressable should be disabled when no onPress
      expect(container.props.accessibilityState?.disabled).toBe(true);
    });

    it("is enabled when onPress is provided", () => {
      const onPressMock = jest.fn();
      const { getByTestId } = render(
        <QrCode
          {...defaultProps}
          uri="https://example.com"
          testID="qr-code"
          onPress={onPressMock}
        />,
      );

      const container = getByTestId("qr-code");
      // Pressable should not be disabled when onPress is provided
      expect(container.props.accessibilityState?.disabled).toBeFalsy();
    });
  });

  describe("memoization", () => {
    it("should render correctly on initial render", () => {
      const onPressMock = jest.fn();

      const { getByTestId } = render(
        <QrCode
          size={200}
          uri="https://example.com"
          testID="qr-code"
          onPress={onPressMock}
        />,
      );

      expect(getByTestId("qr-code")).toBeTruthy();
    });

    it("should handle rerender with same props", () => {
      const { rerender, getByTestId } = render(
        <QrCode size={200} uri="https://example.com" testID="qr-code" />,
      );

      expect(getByTestId("qr-code")).toBeTruthy();

      // Re-render with same props
      rerender(
        <QrCode size={200} uri="https://example.com" testID="qr-code" />,
      );

      expect(getByTestId("qr-code")).toBeTruthy();
    });

    it("should handle rerender when uri changes", () => {
      const { rerender, getByTestId } = render(
        <QrCode size={200} uri="https://example1.com" testID="qr-code" />,
      );

      expect(getByTestId("qr-code")).toBeTruthy();

      // Change URI
      rerender(
        <QrCode size={200} uri="https://example2.com" testID="qr-code" />,
      );

      expect(getByTestId("qr-code")).toBeTruthy();
    });

    it("should update size when size prop changes", () => {
      const { rerender, getByTestId } = render(
        <QrCode size={200} uri="https://example.com" testID="qr-code" />,
      );

      // Change size
      rerender(
        <QrCode size={300} uri="https://example.com" testID="qr-code" />,
      );

      const container = getByTestId("qr-code");
      const styles = Array.isArray(container.props.style)
        ? container.props.style
        : [container.props.style];
      const hasNewSize = styles.some(
        (s: any) => s?.height === 300 && s?.width === 300,
      );
      expect(hasNewSize).toBe(true);
    });
  });

  describe("logo configuration", () => {
    it("renders with custom logoSize", () => {
      const { getByTestId } = render(
        <QrCode
          {...defaultProps}
          uri="https://example.com"
          testID="qr-code"
          logoSize={50}
        >
          <View testID="logo">
            <Text>Logo</Text>
          </View>
        </QrCode>,
      );

      expect(getByTestId("qr-code")).toBeTruthy();
    });

    it("renders with custom logoBorderRadius", () => {
      const { getByTestId } = render(
        <QrCode
          {...defaultProps}
          uri="https://example.com"
          testID="qr-code"
          logoBorderRadius={10}
        >
          <View testID="logo">
            <Text>Logo</Text>
          </View>
        </QrCode>,
      );

      expect(getByTestId("qr-code")).toBeTruthy();
    });
  });
});
