import { Animated, Dimensions } from "react-native";

const { height: screenHeight } = Dimensions.get("window");

export const animationConfigs = {
  icon: {
    spring: {
      tension: 100,
      friction: 8,
    },
    timing: {
      duration: 300,
    },
    initialScale: 1.2, // Start bigger
    finalScale: 1.0, // Then scale down to normal
    initialTranslateY: screenHeight * 0.3, // Start at 30% from top of screen (more centered)
    finalTranslateY: 0, // Move to final position (normal layout)
  },
  pulse: {
    duration: 1000,
    scale: 1.1,
  },
  card: {
    duration: 600,
    translateY: 50,
  },
  buttons: {
    duration: 600,
    translateY: 30,
  },
  delays: {
    pulse: 500,
    card: 800, // Delay card animation so icon appears first
    buttons: 1000, // Delay buttons even more
  },
};

export const createIconAnimation = (
  iconScale: Animated.Value,
  iconOpacity: Animated.Value,
  iconTranslateY: Animated.Value,
) => {
  return Animated.sequence([
    // First, scale up and fade in at center
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: animationConfigs.icon.initialScale,
        tension: animationConfigs.icon.spring.tension,
        friction: animationConfigs.icon.spring.friction,
        useNativeDriver: true,
      }),
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: animationConfigs.icon.timing.duration,
        useNativeDriver: true,
      }),
    ]),
    // Then scale down and move to final position
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: animationConfigs.icon.finalScale,
        tension: animationConfigs.icon.spring.tension,
        friction: animationConfigs.icon.spring.friction,
        useNativeDriver: true,
      }),
      Animated.timing(iconTranslateY, {
        toValue: animationConfigs.icon.finalTranslateY,
        duration: 400,
        useNativeDriver: true,
      }),
    ]),
  ]);
};

export const createPulseAnimation = (pulseScale: Animated.Value) => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(pulseScale, {
        toValue: animationConfigs.pulse.scale,
        duration: animationConfigs.pulse.duration,
        useNativeDriver: true,
      }),
      Animated.timing(pulseScale, {
        toValue: 1,
        duration: animationConfigs.pulse.duration,
        useNativeDriver: true,
      }),
    ]),
  );
};

export const createCardAnimation = (
  cardTranslateY: Animated.Value,
  cardOpacity: Animated.Value,
) => {
  return Animated.parallel([
    Animated.timing(cardTranslateY, {
      toValue: 0,
      duration: animationConfigs.card.duration,
      useNativeDriver: true,
    }),
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: animationConfigs.card.duration,
      useNativeDriver: true,
    }),
  ]);
};

export const createButtonsAnimation = (
  buttonsTranslateY: Animated.Value,
  buttonsOpacity: Animated.Value,
) => {
  return Animated.parallel([
    Animated.timing(buttonsTranslateY, {
      toValue: 0,
      duration: animationConfigs.buttons.duration,
      useNativeDriver: true,
    }),
    Animated.timing(buttonsOpacity, {
      toValue: 1,
      duration: animationConfigs.buttons.duration,
      useNativeDriver: true,
    }),
  ]);
};
