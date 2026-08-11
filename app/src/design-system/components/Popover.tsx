import { Popover as BasePopover } from "@base-ui/react/popover";
import type { ComponentProps, ReactElement, ReactNode } from "react";

export type PopoverProps = {
  trigger: ReactElement;
  title: string;
  children: ReactNode;
  side?: ComponentProps<typeof BasePopover.Positioner>["side"];
  align?: ComponentProps<typeof BasePopover.Positioner>["align"];
};

export function Popover({
  trigger,
  title,
  children,
  side = "top",
  align = "center",
}: PopoverProps) {
  return (
    <BasePopover.Root>
      <BasePopover.Trigger render={trigger} openOnHover delay={300} closeDelay={100} />
      <BasePopover.Portal>
        <BasePopover.Positioner
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={16}
          className="z-[var(--z-overlay)] outline-none"
        >
          <BasePopover.Popup
            initialFocus={false}
            className="w-[min(20rem,calc(100vw-2rem))] rounded-[var(--radius-control)] border border-line bg-surface px-4 py-3 text-ink shadow-[var(--shadow-overlay)] outline-none transition-[opacity,translate] duration-[var(--duration-fast)] data-[ending-style]:translate-y-1 data-[ending-style]:opacity-0 data-[starting-style]:translate-y-1 data-[starting-style]:opacity-0 motion-reduce:transition-none"
          >
            <BasePopover.Title className="text-sm font-semibold">{title}</BasePopover.Title>
            <BasePopover.Description render={<div />} className="mt-1 text-sm leading-6 text-muted">
              {children}
            </BasePopover.Description>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
