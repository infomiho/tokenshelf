import type { ToggleButtonProps } from "./ToggleButton";
import { ToggleButton } from "./ToggleButton";

export type ChipProps<Value extends string = string> = Omit<
  ToggleButtonProps<Value>,
  "size" | "variant"
>;

export function Chip<Value extends string = string>({
  className = "",
  ...props
}: ChipProps<Value>) {
  return (
    <ToggleButton
      size="compact"
      className={`whitespace-nowrap rounded-[var(--radius-round)] px-3.5 font-medium ${className}`}
      {...props}
    />
  );
}
