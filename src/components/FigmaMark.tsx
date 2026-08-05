import type { SVGProps } from "react";

export function FigmaMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 38 57" aria-hidden="true" {...props}>
      <path fill="#f24e1e" d="M9.5 0H19v19H9.5a9.5 9.5 0 1 1 0-19Z" />
      <path fill="#ff7262" d="M19 0h9.5a9.5 9.5 0 1 1 0 19H19V0Z" />
      <path fill="#a259ff" d="M9.5 19H19v19H9.5a9.5 9.5 0 1 1 0-19Z" />
      <path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0Z" />
      <path fill="#0acf83" d="M9.5 38H19v9.5A9.5 9.5 0 1 1 9.5 38Z" />
    </svg>
  );
}
