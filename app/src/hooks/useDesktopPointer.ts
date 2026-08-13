import { useSyncExternalStore } from "react";

const desktopPointerQuery = "(min-width: 64rem) and (pointer: fine)";
const mediaQueryStore = (query: string) => ({
  getServerSnapshot: () => false,
  getSnapshot: () => window.matchMedia(query).matches,
  subscribe(onChange: () => void) {
    const mediaQuery = window.matchMedia(query);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  },
});

const desktopPointer = mediaQueryStore(desktopPointerQuery);
const motionAllowed = mediaQueryStore("(prefers-reduced-motion: no-preference)");

export function useDesktopPointer() {
  return useSyncExternalStore(
    desktopPointer.subscribe,
    desktopPointer.getSnapshot,
    desktopPointer.getServerSnapshot,
  );
}

export function useMotionAllowed() {
  return useSyncExternalStore(
    motionAllowed.subscribe,
    motionAllowed.getSnapshot,
    motionAllowed.getServerSnapshot,
  );
}
