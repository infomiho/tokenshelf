import { Checkbox as BaseCheckbox, type CheckboxRootProps } from "@base-ui/react/checkbox";
import { useId, type ReactNode } from "react";
import { controlSizeClassName, type ControlSize } from "./controlStyles";

export type CheckboxProps = Omit<CheckboxRootProps, "className"> & {
  label: ReactNode;
  description?: ReactNode;
  size?: ControlSize;
  className?: string;
};

export function Checkbox({
  label,
  description,
  size = "default",
  className = "",
  "aria-describedby": ariaDescribedBy,
  ...props
}: CheckboxProps) {
  const generatedId = useId();
  const descriptionId = description ? `${generatedId}-description` : undefined;
  const describedBy = [ariaDescribedBy, descriptionId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={className}>
      <label
        className={`flex ${controlSizeClassName(size)} cursor-pointer items-start gap-3 text-sm leading-6 has-[:disabled]:cursor-default has-[:disabled]:opacity-45`}
      >
        <BaseCheckbox.Root
          aria-describedby={describedBy}
          className="mt-1 grid size-[var(--control-check-size)] shrink-0 place-items-center rounded-[var(--radius-inset)] border border-muted bg-surface data-[checked]:border-ink data-[checked]:bg-ink data-[indeterminate]:border-ink data-[indeterminate]:bg-ink"
          {...props}
        >
          <BaseCheckbox.Indicator className="group grid place-items-center">
            <svg
              viewBox="0 0 16 16"
              className="size-3.5 text-surface group-data-[indeterminate]:hidden"
              aria-hidden="true"
            >
              <path
                d="m3.25 8.25 3 3 6.5-6.5"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
            </svg>
            <span
              className="hidden h-0.5 w-2.5 rounded-[var(--radius-round)] bg-surface group-data-[indeterminate]:block"
              aria-hidden="true"
            />
          </BaseCheckbox.Indicator>
        </BaseCheckbox.Root>
        <span className="font-medium text-ink">{label}</span>
      </label>
      {description && (
        <p id={descriptionId} className="ms-8 text-xs leading-5 text-muted">
          {description}
        </p>
      )}
    </div>
  );
}
