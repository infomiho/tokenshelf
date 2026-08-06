import type { ComponentPropsWithoutRef } from "react";
import { LogoMark } from "./LogoMark";

type LoadingIndicatorProps = Omit<ComponentPropsWithoutRef<"span">, "children"> & {
  label: string;
  size?: "compact" | "default";
};

export function LoadingIndicator({
  label,
  size = "default",
  className = "",
  ...props
}: LoadingIndicatorProps) {
  return (
    <span className={`inline-flex items-center ${className}`} role="status" {...props}>
      <LogoMark
        className={`waiting-logo text-brand ${size === "compact" ? "size-5" : "size-10"}`}
        aria-hidden="true"
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
