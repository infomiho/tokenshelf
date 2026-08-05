import type { ComponentPropsWithoutRef } from "react";
import { buttonClassName, type ButtonClassNameOptions, type ButtonVariant } from "./Button";

export function actionLinkClassName(
  variant: ButtonVariant = "primary",
  className = "",
  options?: ButtonClassNameOptions,
) {
  return buttonClassName(variant, className, options);
}

export type ActionLinkProps = Omit<ComponentPropsWithoutRef<"a">, "className"> & {
  variant?: ButtonVariant;
  size?: ButtonClassNameOptions["size"];
  pressScale?: boolean;
  className?: string;
};

export function ActionLink({
  variant = "primary",
  size = "default",
  pressScale = true,
  className = "",
  ...props
}: ActionLinkProps) {
  return <a className={actionLinkClassName(variant, className, { pressScale, size })} {...props} />;
}
