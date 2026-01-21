import { StyleSheet } from 'react-native';

/**
 * Shared styles for PaymentOptionsModal components.
 * These styles are used across multiple views to maintain consistency.
 */
export const sharedStyles = StyleSheet.create({
  // Footer container for action buttons
  footerContainer: {
    paddingTop: 16,
    alignItems: 'center',
  },

  // Button container with gap between buttons
  buttonContainer: {
    paddingTop: 16,
    gap: 8,
  },
});

// Common dimensions
export const DIMENSIONS = {
  buttonHeight: 48,
  buttonBorderRadius: 100,
  rowHeight: 64,
  rowBorderRadius: 20,
  iconSize: 24,
  chainLogoSize: 16,
};
