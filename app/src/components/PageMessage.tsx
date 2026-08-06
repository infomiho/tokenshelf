import { useEffect, useRef, type ReactNode } from "react";
import { typographyClassName } from "../design-system/components";

type PageMessageProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  action: ReactNode;
  tall?: boolean;
  focusHeading?: boolean;
};

export function PageMessage({
  eyebrow,
  title,
  description,
  icon,
  action,
  tall = false,
  focusHeading = false,
}: PageMessageProps) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (focusHeading) headingRef.current?.focus();
  }, [focusHeading]);

  return (
    <section
      className={`mx-auto grid max-w-2xl place-items-center px-5 text-center ${tall ? "min-h-[70vh]" : "min-h-[60vh]"}`}
    >
      <div>
        {icon}
        {eyebrow && <p className={typographyClassName("eyebrow", icon ? "mt-6" : "")}>{eyebrow}</p>}
        <h1
          ref={headingRef}
          tabIndex={focusHeading ? -1 : undefined}
          className={typographyClassName(
            "pageTitle",
            `${eyebrow ? "mt-3" : icon ? "mt-6" : ""} outline-none`,
          )}
        >
          {title}
        </h1>
        {description && (
          <p className={typographyClassName("pageLede", "mx-auto mt-4 max-w-lg text-muted")}>
            {description}
          </p>
        )}
        <div className="mt-7">{action}</div>
      </div>
    </section>
  );
}
