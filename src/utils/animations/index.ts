/**
 * Animation Utilities Index
 *
 * This file provides clean exports for all animation utilities,
 * making it easy to import and use throughout the application.
 */

// Export all constants
export {
  ANIMATION_DURATIONS,
  SPRING_CONFIGS,
  TIMING_CONFIGS,
  WELCOME_ANIMATIONS,
  DEMO_ANIMATIONS,
  COMMON_ANIMATIONS,
  ANIMATION_VALUES,
  PERFORMANCE_CONSTANTS,
} from './constants';

// Import constants for internal use
import {
  ANIMATION_DURATIONS,
  SPRING_CONFIGS,
  TIMING_CONFIGS,
  WELCOME_ANIMATIONS,
  DEMO_ANIMATIONS,
  COMMON_ANIMATIONS,
  ANIMATION_VALUES,
  PERFORMANCE_CONSTANTS,
} from './constants';

// Import animation functions for internal use
import {
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  scaleIn,
  scaleOut,
  scaleTo,
  pulse,
  shake,
  presetAnimations,
  createTimingAnimation,
  createSpringAnimation,
  createStaggerAnimation,
  createSequence,
  createLoop,
  cancelAnimation,
  resetToInitialValue,
  rotateInfinite,
} from './commonAnimations';

// Import animation hooks for internal use
import {
  useFadeAnimation,
  useSlideAnimation,
  useScaleAnimation,
  useRotationAnimation,
  useCombinedAnimation,
  useScrollAnimation,
  useShakeAnimation,
  useStaggerAnimation,
  useAnimationPerformance,
  useLifecycleAnimation,
} from './animationHooks';

// Export all types
export type {
  TimingConfig,
  SpringConfig,
  FadeAnimationHook,
  SlideAnimationHook,
  ScaleAnimationHook,
  RotationAnimationHook,
  CombinedAnimationHook,
  ScrollAnimationHook,
  ScrollAnimationConfig,
  AnimationPerformanceMetrics,
  PerformanceMeasurement,
  AnimationState,
  AnimationStateHook,
  GestureAnimationConfig,
  GestureAnimationHook,
  StaggerAnimationConfig,
  StaggerAnimationItem,
  LoopAnimationConfig,
  AnimationPreset,
  AnimationPresetConfig,
  AnimationTestConfig,
  AnimationTestResult,
  ToastAnimationConfig,
  ModalAnimationConfig,
  LayoutAnimationConfig,
  AnimationCallback,
  AnimationCallbackWithValue,
  AnimationCallbacks,
  SharedValue,
  AnimatedStyle,
  ViewStyle,
  TextStyle,
} from './types';

// Export all common animation functions
export {
  fadeIn,
  fadeOut,
  slideUp,
  slideDown,
  slideToPosition,
  scaleIn,
  scaleOut,
  scaleTo,
  rotateTo,
  rotateInfinite,
  pulse,
  shake,
  bounceIn,
  fadeInWithSlide,
  fadeInWithScale,
  createStaggerAnimation,
  createSequence,
  createLoop,
  presetAnimations,
  createTimingAnimation,
  createSpringAnimation,
  cancelAnimation,
  resetToInitialValue,
} from './commonAnimations';

// Export all animation hooks
export {
  useFadeAnimation,
  useSlideAnimation,
  useScaleAnimation,
  useRotationAnimation,
  useCombinedAnimation,
  useScrollAnimation,
  useShakeAnimation,
  useStaggerAnimation,
  useAnimationPerformance,
  useLifecycleAnimation,
} from './animationHooks';

// Re-export commonly used Reanimated functions for convenience
export {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  useAnimatedGestureHandler,
  useAnimatedReaction,
  useAnimatedProps,
  withTiming,
  withSpring,
  withSequence,
  withRepeat,
  withDelay,
  withDecay,
  interpolate,
  Extrapolate,
  Easing,
  runOnJS,
  runOnUI,
  cancelAnimation as reanimatedCancelAnimation,
} from 'react-native-reanimated';

// Utility functions for easy access
export const AnimationUtils = {
  // Quick access to common animations
  animations: {
    fadeIn,
    fadeOut,
    slideUp,
    slideDown,
    scaleIn,
    scaleOut,
    pulse,
    shake,
  },

  // Quick access to animation presets
  presets: presetAnimations,

  // Quick access to constants
  durations: ANIMATION_DURATIONS,
  values: ANIMATION_VALUES,

  // Quick access to configs
  timing: TIMING_CONFIGS,
  spring: SPRING_CONFIGS,

  // Utility functions
  createTiming: createTimingAnimation,
  createSpring: createSpringAnimation,
  createStagger: createStaggerAnimation,
  createSequence,
  createLoop,

  // State management
  cancel: cancelAnimation,
  reset: resetToInitialValue,
};

// Hook collections for easy access
export const AnimationHooks = {
  fade: useFadeAnimation,
  slide: useSlideAnimation,
  scale: useScaleAnimation,
  rotation: useRotationAnimation,
  combined: useCombinedAnimation,
  scroll: useScrollAnimation,
  shake: useShakeAnimation,
  stagger: useStaggerAnimation,
  performance: useAnimationPerformance,
  lifecycle: useLifecycleAnimation,
};

// Component-specific animation configurations
export const ComponentAnimations = {
  toast: {
    fadeIn: () => fadeIn(COMMON_ANIMATIONS.TOAST.FADE_DURATION),
    fadeOut: () => fadeOut(COMMON_ANIMATIONS.TOAST.FADE_DURATION),
    slideUp: () => slideUp(COMMON_ANIMATIONS.TOAST.SLIDE_DISTANCE),
    slideDown: () => slideDown(COMMON_ANIMATIONS.TOAST.SLIDE_DISTANCE),
  },

  modal: {
    fadeIn: () => fadeIn(COMMON_ANIMATIONS.MODAL.FADE_DURATION),
    fadeOut: () => fadeOut(COMMON_ANIMATIONS.MODAL.FADE_DURATION),
    backdropFade: () => fadeIn(COMMON_ANIMATIONS.MODAL.FADE_DURATION),
  },

  welcome: {
    fadeIn: () => fadeIn(WELCOME_ANIMATIONS.FADE_IN.duration, WELCOME_ANIMATIONS.FADE_IN.easing),
    slideUp: () => slideUp(50, WELCOME_ANIMATIONS.SLIDE_UP.duration, WELCOME_ANIMATIONS.SLIDE_UP.easing),
    staggerDelay: WELCOME_ANIMATIONS.STAGGER_DELAY,
  },

  demo: {
    scaleIn: () => scaleIn(SPRING_CONFIGS.DEFAULT),
    interactionScale: () => scaleTo(DEMO_ANIMATIONS.INTERACTION_SCALE),
    pulse: () => pulse(ANIMATION_VALUES.SCALE.EXPANDED, DEMO_ANIMATIONS.PULSE_DURATION),
    rotate: () => rotateInfinite(DEMO_ANIMATIONS.LOADING_ROTATION_DURATION),
  },
};

// Performance utilities
export const PerformanceUtils = {
  measure: (name: string) => {
    const startTime = Date.now();
    return {
      end: () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`[ANIMATION_PERFORMANCE] ${name}: ${duration}ms`);
        return duration;
      },
    };
  },

  logFrameRate: (fps: number) => {
    if (fps < PERFORMANCE_CONSTANTS.TARGET_FPS * 0.9) {
      console.warn(`[ANIMATION_PERFORMANCE] Low frame rate detected: ${fps}fps`);
    }
  },

  isPerformanceGood: (duration: number) => {
    return duration <= PERFORMANCE_CONSTANTS.PERFORMANCE_THRESHOLD_MS;
  },
};

// Default export for convenience
export default {
  ...AnimationUtils,
  hooks: AnimationHooks,
  components: ComponentAnimations,
  performance: PerformanceUtils,
};
