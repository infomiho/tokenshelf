import { Menu } from "@base-ui/react/menu";
import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { SpinnerGapIcon } from "@phosphor-icons/react/dist/csr/SpinnerGap";
import type { ComponentProps, ReactNode, RefObject } from "react";
import { IconButton } from "./IconButton";
import { menuItemClassName } from "./MenuItem";

export function ActionMenu({
  label,
  children,
  triggerRef,
  disabled = false,
  busy = false,
}: {
  label: string;
  children: ReactNode;
  triggerRef?: RefObject<HTMLButtonElement | null>;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <Menu.Root>
      <Menu.Trigger
        disabled={disabled}
        render={
          <IconButton ref={triggerRef} label={label} variant="quiet" aria-busy={busy}>
            {busy ? (
              <SpinnerGapIcon className="size-5 animate-spin" weight="bold" aria-hidden="true" />
            ) : (
              <DotsThreeVerticalIcon className="size-5" weight="bold" aria-hidden="true" />
            )}
          </IconButton>
        }
      />
      <Menu.Portal>
        <Menu.Positioner align="end" sideOffset={8} className="z-[var(--z-overlay)] outline-none">
          <Menu.Popup className="min-w-48 rounded-[var(--radius-control)] border border-line bg-surface p-1 shadow-[var(--shadow-overlay)] outline-none">
            {children}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}

type ActionMenuItemProps = Omit<ComponentProps<typeof Menu.Item>, "className"> & {
  className?: string;
  tone?: "default" | "destructive";
};

export function ActionMenuItem({
  className = "",
  tone = "default",
  ...props
}: ActionMenuItemProps) {
  const toneClassName =
    tone === "destructive"
      ? "text-negative data-[highlighted]:bg-negative-soft"
      : "data-[highlighted]:bg-ink/5";

  return (
    <Menu.Item
      className={menuItemClassName(`w-full text-start ${toneClassName} ${className}`)}
      {...props}
    />
  );
}
