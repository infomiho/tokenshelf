import type { ComponentPropsWithoutRef, ReactNode, Ref } from "react";
import { typographyClassName } from "./Typography";

export type NoticeTone = "neutral" | "positive" | "caution" | "negative";

const toneClassNames: Record<NoticeTone, string> = {
  neutral: "border-line bg-surface-subtle",
  positive: "border-positive/30 bg-positive-soft",
  caution: "border-caution/30 bg-caution-soft",
  negative: "border-negative/30 bg-negative-soft",
};

export type NoticeProps = Omit<ComponentPropsWithoutRef<"div">, "title"> & {
  title: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  tone?: NoticeTone;
  ref?: Ref<HTMLDivElement>;
};

export function Notice({
  title,
  description,
  icon,
  tone = "neutral",
  ref,
  className = "",
  ...props
}: NoticeProps) {
  return (
    <div
      ref={ref}
      className={`flex items-start gap-3 rounded-[var(--radius-control)] border p-4 ${toneClassNames[tone]} ${className}`}
      {...props}
    >
      {icon && (
        <span className="mt-0.5 shrink-0" aria-hidden="true">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className={typographyClassName("cardTitle", "text-sm")}>{title}</p>
        {description && <p className="mt-1 text-sm leading-5 text-muted">{description}</p>}
      </div>
    </div>
  );
}
