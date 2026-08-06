import { Button as BaseButton, type ButtonProps as BaseButtonProps } from "@base-ui/react/button";
import { controlSizeClassName, type ControlSize } from "./controlStyles";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "onDark" | "onDarkSecondary";

export type ButtonClassNameOptions = {
  pressScale?: boolean;
  size?: ControlSize;
};

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-ink text-surface hover:bg-ink/85",
  secondary: "border border-line bg-surface text-ink hover:border-ink/35",
  quiet: "text-muted hover:bg-ink/5 hover:text-ink",
  onDark:
    "border border-transparent bg-on-feature text-feature hover:border-feature-line hover:bg-on-feature-hover",
  onDarkSecondary: "border border-feature-line text-on-feature hover:bg-on-feature/8",
};

export function buttonClassName(
  variant: ButtonVariant = "primary",
  className = "",
  { pressScale = true, size = "default" }: ButtonClassNameOptions = {},
) {
  const pressClassName = pressScale ? "active:scale-[0.96]" : "";
  return `inline-flex ${controlSizeClassName(size)} items-center justify-center gap-2 rounded-[var(--radius-control)] px-4 text-sm font-semibold no-underline transition-[background-color,border-color,color,scale] duration-[var(--duration-fast)] disabled:pointer-events-none disabled:opacity-45 ${pressClassName} ${variantClassNames[variant]} ${className}`;
}

export type ButtonProps = Omit<BaseButtonProps, "className"> & {
  variant?: ButtonVariant;
  pressScale?: boolean;
  size?: ControlSize;
  className?: string;
};

export function Button({
  variant = "primary",
  pressScale = true,
  size = "default",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <BaseButton
      type={type}
      className={buttonClassName(variant, className, { pressScale, size })}
      {...props}
    />
  );
}
