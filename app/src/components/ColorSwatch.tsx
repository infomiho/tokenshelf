import { useClipboard } from "../hooks/useClipboard";
import { useToast } from "../design-system/components";
import { contrastRatio } from "../domain/design-system/color";

export function ColorSwatch({ role, value }: { role: string; value: string }) {
  const { copied, copy } = useClipboard();
  const toast = useToast();

  async function handleCopy(color: string) {
    toast.dismiss("clipboard-error");
    if (!(await copy(color))) toast.error("Unable to copy color. Try again.", "clipboard-error");
  }

  return <ColorSwatchView role={role} value={value} copied={copied} onCopy={handleCopy} />;
}

export function ColorSwatchView({
  role,
  value,
  copied,
  onCopy,
}: {
  role: string;
  value: string;
  copied: boolean;
  onCopy: (value: string) => void;
}) {
  const label = role.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
  const textColor =
    contrastRatio(value, "#ffffff") > contrastRatio(value, "#000000") ? "#ffffff" : "#000000";

  return (
    <button
      type="button"
      className="color-swatch"
      data-copied={copied || undefined}
      aria-label={`Copy ${label} color ${value}`}
      onClick={() => onCopy(value)}
    >
      <span className="color-swatch-sample" style={{ background: value, color: textColor }}>
        <strong>{label}</strong>
        <span className="color-swatch-meta">
          <code>{value}</code>
          <span className="color-swatch-action" aria-live="polite">
            {copied ? "Copied" : "Click to copy"}
          </span>
        </span>
      </span>
    </button>
  );
}
