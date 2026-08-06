import { controlSizeClassName, type ControlSize } from "./controlStyles";

export function menuItemClassName(className = "", size: ControlSize = "compact") {
  return `flex ${controlSizeClassName(size)} items-center gap-2 rounded-[var(--radius-inset)] px-3 text-sm font-semibold text-ink no-underline outline-none data-[highlighted]:bg-ink/5 data-[disabled]:opacity-45 ${className}`;
}
