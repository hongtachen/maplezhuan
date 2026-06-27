export type NavMotion = "push" | "pop" | "fade";

const IMMERSIVE_PREFIXES = [
  "/messages/",
  "/listing/",
  "/sublet/",
  "/profile/",
  "/publish/",
] as const;

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

  const fromDepth = routeDepth(from);
  const toDepth = routeDepth(to);

  if (toDepth > fromDepth && isImmersiveChildRoute(to)) return "push";
  if (toDepth < fromDepth && isImmersiveChildRoute(from)) return "pop";

  return "fade";
}
