"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { resolveNavMotion } from "@/lib/motion/nav";
import { getPageVariants } from "@/lib/motion/variants";
import { PAGE_TRANSITION } from "@/lib/motion/tokens";
import { useIsDesktop } from "@/hooks/useMediaQuery";

type Props = {
  children: React.ReactNode;
};

/**
 * Wraps routed page content with direction-aware transitions.
 * push: list → detail (slide from right on mobile)
 * pop:  detail → list (slide from left on mobile)
 * fade: tab switches
 */
export default function RouteTransition({ children }: Props) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();

  const [prevPath, setPrevPath] = useState(pathname);
  const [navMotion, setNavMotion] = useState(() =>
    resolveNavMotion(pathname, pathname),
  );

  if (pathname !== prevPath) {
    setNavMotion(resolveNavMotion(prevPath, pathname));
    setPrevPath(pathname);
  }

  const variants = getPageVariants(navMotion, isDesktop);

  if (reducedMotion) {
    return <div className="min-h-full w-full">{children}</div>;
  }

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants}
        transition={PAGE_TRANSITION}
        className="min-h-full w-full will-change-transform"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
