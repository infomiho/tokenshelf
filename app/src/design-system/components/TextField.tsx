import { Input, type InputProps } from "@base-ui/react/input";
import { useId } from "react";
import { controlSizeClassName, type ControlSize } from "./controlStyles";

export type TextFieldProps = Omit<InputProps, "className" | "id" | "size"> & {
  label: string;
  id?: string;
  description?: string;
  error?: string;
  size?: ControlSize;
  className?: string;
  inputClassName?: string;
};

export function TextField({
  label,
  id,
  description,
  error,
  size = "default",
  className = "",
  inputClassName = "",
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const message = error ?? description;
  const messageId = message ? `${inputId}-message` : undefined;
  const describedBy = [ariaDescribedBy, messageId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`grid gap-1.5 text-sm font-semibold text-ink ${className}`}>
      <label htmlFor={inputId}>{label}</label>
      <Input
        {...props}
        id={inputId}
        aria-describedby={describedBy}
        aria-invalid={error ? true : ariaInvalid}
        className={`${controlSizeClassName(size)} w-full rounded-[var(--radius-control)] border border-line bg-surface px-3 text-base font-normal text-ink placeholder:text-muted/70 focus-visible:border-brand sm:text-sm ${inputClassName}`}
      />
      {message && (
        <span
          id={messageId}
          className={`text-xs font-normal leading-5 ${error ? "text-negative" : "text-muted"}`}
        >
          {message}
        </span>
      )}
    </div>
  );
}
