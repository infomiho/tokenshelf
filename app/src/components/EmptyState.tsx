import { useId, type ReactNode } from "react";
import { Panel, typographyClassName } from "../design-system/components";
import { AgentMarks } from "./AgentMarks";
import { LogoMark } from "../design-system/components";

export function EmptyState({
  title,
  description,
  action,
  headingLevel: Heading = "h2",
  className = "",
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  headingLevel?: "h1" | "h2";
  className?: string;
}) {
  const titleId = useId();
  return (
    <Panel
      tone="feature"
      radius="hero"
      className={`grid min-h-80 overflow-hidden sm:grid-cols-[minmax(0,1fr)_18rem] ${className}`}
      aria-labelledby={titleId}
    >
      <div className="flex flex-col items-start justify-center p-7 sm:p-10">
        <Heading id={titleId} className={typographyClassName("cardTitle", "text-2xl")}>
          {title}
        </Heading>
        {description && (
          <p className="mt-3 max-w-md text-sm leading-6 text-on-feature-muted">{description}</p>
        )}
        {action && <div className="mt-6">{action}</div>}
      </div>
      <div
        className="relative min-h-48 border-t border-feature-line sm:border-s sm:border-t-0"
        aria-hidden="true"
      >
        <AgentMarks className="absolute start-1/2 top-5 block h-14 w-[5.25rem] -translate-x-1/2" />
        <span className="absolute start-1/2 top-[4.75rem] h-12 w-px -translate-x-1/2 bg-brand/60" />
        <span className="absolute start-1/2 top-[7.5rem] size-2 -translate-x-1/2 rounded-full bg-brand" />
        <div className="absolute inset-x-[12%] bottom-8 h-px bg-feature-line shadow-[0_4.5rem_0_var(--feature-line)]" />
        <div className="absolute inset-x-[18%] bottom-8 flex h-24 items-end justify-between">
          <span className="h-14 w-8 rounded-t-sm border border-feature-line bg-white/[0.04]" />
          <span className="grid size-16 place-items-center rounded-t-sm border border-brand/70 bg-brand/10">
            <LogoMark className="size-8 text-brand" />
          </span>
          <span className="h-10 w-10 rounded-t-sm border border-feature-line bg-white/[0.04]" />
        </div>
      </div>
    </Panel>
  );
}
