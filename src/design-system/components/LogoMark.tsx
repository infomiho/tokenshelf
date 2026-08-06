import type { SVGProps } from "react";

export function LogoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path pathLength="1" d="m4 9 14-6 10 5-14 6L4 9Z" />
      <path pathLength="1" d="M4 9v16l10 5V14M28 8v16l-14 6" />
      <path pathLength="1" d="m14 19 14-6M14 25l14-6" />
    </svg>
  );
}
