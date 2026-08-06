import type { ComponentPropsWithoutRef } from "react";
import { statusToneClassNames, type StatusBadgeTone } from "./StatusBadge";

type StatusIconProps = Omit<ComponentPropsWithoutRef<"span">, "aria-label"> & {
  label: string;
  tone?: StatusBadgeTone;
};

export function StatusIcon({ label, tone = "neutral", className = "", ...props }: StatusIconProps) {
  return (
    <span
      className={`inline-flex size-6 items-center justify-center rounded-full ${statusToneClassNames[tone]} ${className}`}
      role="img"
      {...props}
      aria-label={label}
    />
  );
}
