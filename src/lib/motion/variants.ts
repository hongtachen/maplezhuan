// variants are the different states of the animation for different scenarios

import type { Variants } from "motion/react";
import type { NavMotion } from "./nav";

const SLIDE_OFFSET = 28;

export function getPageVariants(
  navMotion: NavMotion,
  isDesktop: boolean,
): Variants {
  if (isDesktop) {
    return {
      initial: { opacity: 0, scale: 0.985 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.985 },
    };
  }

  switch (navMotion) {
    case "push":
      return {
        initial: { opacity: 0.92, x: SLIDE_OFFSET },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0.88, x: SLIDE_OFFSET },
      };
    case "pop":
      return {
        initial: { opacity: 0.92, x: -SLIDE_OFFSET },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0.88, x: SLIDE_OFFSET },
      };
    default:
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
      };
  }
}

export const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const bottomSheetVariants: Variants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
};

export const sideSheetVariants: Variants = {
  hidden: { x: "100%" },
  visible: { x: 0 },
};

export const fadeModalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 8 },
  visible: { opacity: 1, scale: 1, y: 0 },
};

export const popoverVariants: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1 },
};
