import { Toggle, type ToggleProps } from "@base-ui/react/toggle";
import { controlSizeClassName, type ControlSize } from "./controlStyles";

export type ToggleButtonVariant = "default" | "brand";

export type ToggleButtonProps<Value extends string = string> = Omit<
  ToggleProps<Value>,
  "className"
> & {
  variant?: ToggleButtonVariant;
  size?: ControlSize;
  className?: string;
};

export function ToggleButton<Value extends string = string>({
  variant = "default",
  size = "default",
  className = "",
  ...props
}: ToggleButtonProps<Value>) {
  return (
    <Toggle
      className={({ pressed }) => {
        const selectedClassName =
          variant === "brand"
            ? "border-brand bg-brand-soft text-brand"
            : "border-ink bg-ink text-surface";
        const stateClassName = pressed
          ? selectedClassName
          : "border-line bg-surface text-muted hover:border-ink/35 hover:text-ink";
        return `inline-flex ${controlSizeClassName(size)} items-center justify-center gap-2 rounded-[var(--radius-control)] border px-3 text-sm font-semibold transition-colors duration-[var(--duration-fast)] disabled:pointer-events-none disabled:opacity-45 ${stateClassName} ${className}`;
      }}
      {...props}
    />
  );
}
