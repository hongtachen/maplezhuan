export type NavMotion = "push" | "pop" | "fade";

const IMMERSIVE_PREFIXES = [
  "/messages/",
  "/listing/",
  "/sublet/",
  "/profile/",
  "/publish/",
] as const;

const SUBLET_STEP_RE = /^\/publish\/sublet\/step(\d+)$/;

function getSubletStep(path: string): number | null {
  const match = path.match(SUBLET_STEP_RE);
  return match ? Number(match[1]) : null;
}

function routeDepth(path: string): number {
  if (path === "/") return 0;
  return path.split("/").filter(Boolean).length;
}

function isImmersiveChildRoute(path: string): boolean {
  return IMMERSIVE_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** Infer navigation direction from path change (list→detail = push, back = pop). */
export function resolveNavMotion(from: string, to: string): NavMotion {
  if (from === to) return "fade";

  const fromStep = getSubletStep(from);
  const toStep = getSubletStep(to);
  if (fromStep !== null && toStep !== null) {
    if (toStep > fromStep) return "push";
    if (toStep < fromStep) return "pop";
    return "fade";
  }

  const fromDepth = routeDepth(from);
  const toDepth = routeDepth(to);

  if (toDepth > fromDepth && isImmersiveChildRoute(to)) return "push";
  if (toDepth < fromDepth && isImmersiveChildRoute(from)) return "pop";

  return "fade";
}
