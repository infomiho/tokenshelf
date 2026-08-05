export type ControlSize = "compact" | "default" | "touch";

const controlSizeClassNames: Record<ControlSize, string> = {
  compact: "min-h-[var(--control-height-compact)]",
  default: "min-h-[var(--control-height-default)]",
  touch: "min-h-[var(--control-height-touch)]",
};

export function controlSizeClassName(size: ControlSize) {
  return controlSizeClassNames[size];
}

const squareControlSizeClassNames: Record<ControlSize, string> = {
  compact: "size-[var(--control-height-compact)]",
  default: "size-[var(--control-height-default)]",
  touch: "size-[var(--control-height-touch)]",
};

export function squareControlSizeClassName(size: ControlSize) {
  return squareControlSizeClassNames[size];
}
