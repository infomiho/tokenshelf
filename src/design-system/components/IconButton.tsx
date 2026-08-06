import type { ReactNode } from "react";
import { Button, type ButtonProps } from "./Button";
import { squareControlSizeClassName } from "./controlStyles";

export type IconButtonProps = Omit<ButtonProps, "aria-label" | "children"> & {
  label: string;
  children: ReactNode;
};

export function IconButton({
  label,
  size = "default",
  className = "",
  children,
  ...props
}: IconButtonProps) {
  return (
    <Button
      aria-label={label}
      size={size}
      className={`${squareControlSizeClassName(size)} shrink-0 !px-0 ${className}`}
      {...props}
    >
      {children}
    </Button>
  );
}
