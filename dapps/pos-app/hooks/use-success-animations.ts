import {
  animationConfigs,
  createButtonsAnimation,
  createCardAnimation,
  createIconAnimation,
  createPulseAnimation,
} from "@/utils/animations";
import * as Haptics from "expo-haptics";
import { useEffect, useRef } from "react";
import { Animated } from "react-native";

export const useSuccessAnimations = () => {
  // Animation values
  const iconScale = useRef(new Animated.Value(0)).current;
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconTranslateY = useRef(
    new Animated.Value(animationConfigs.icon.initialTranslateY),
  ).current;
  const pulseScale = useRef(new Animated.Value(1)).current;
  const cardTranslateY = useRef(
    new Animated.Value(animationConfigs.card.translateY),
  ).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const buttonsTranslateY = useRef(
    new Animated.Value(animationConfigs.buttons.translateY),
  ).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Initial haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Create animations
    const iconAnimation = createIconAnimation(
      iconScale,
      iconOpacity,
      iconTranslateY,
    );
    const pulseAnimation = createPulseAnimation(pulseScale);
    const cardAnimation = createCardAnimation(cardTranslateY, cardOpacity);
    const buttonsAnimation = createButtonsAnimation(
      buttonsTranslateY,
      buttonsOpacity,
    );

    // Start icon animation immediately
    iconAnimation.start();

    // Start pulse after icon animation
    setTimeout(() => {
      pulseAnimation.start();
    }, animationConfigs.delays.pulse);

    // Start card animation after icon has appeared
    setTimeout(() => {
      cardAnimation.start();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, animationConfigs.delays.card);

    // Start buttons animation last
    setTimeout(() => {
      buttonsAnimation.start();
    }, animationConfigs.delays.buttons);
  }, [
    iconScale,
    iconOpacity,
    iconTranslateY,
    pulseScale,
    cardTranslateY,
    cardOpacity,
    buttonsTranslateY,
    buttonsOpacity,
  ]);

  return {
    iconScale,
    iconOpacity,
    iconTranslateY,
    pulseScale,
    cardTranslateY,
    cardOpacity,
    buttonsTranslateY,
    buttonsOpacity,
  };
};
