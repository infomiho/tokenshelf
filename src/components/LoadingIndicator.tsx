import { LogoMark } from "./LogoMark";

export function LoadingIndicator({ label }: { label: string }) {
  return (
    <div role="status">
      <LogoMark className="waiting-logo size-10 text-brand" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
