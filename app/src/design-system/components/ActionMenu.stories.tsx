import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { expect, waitFor, within } from "storybook/test";
import { ActionMenu, ActionMenuItem } from "./ActionMenu";

const meta = {
  title: "Components/ActionMenu",
  component: ActionMenu,
  parameters: { layout: "centered" },
  args: {
    label: "Actions for Gridline",
    children: (
      <>
        <ActionMenuItem>
          <PencilSimpleIcon className="size-4" aria-hidden="true" />
          Edit
        </ActionMenuItem>
        <ActionMenuItem tone="destructive">
          <TrashIcon className="size-4" aria-hidden="true" />
          Delete
        </ActionMenuItem>
      </>
    ),
  },
} satisfies Meta<typeof ActionMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

function BusyTransition(args: ComponentProps<typeof ActionMenu>) {
  const [busy, setBusy] = useState(false);

  return (
    <ActionMenu {...args} busy={busy} busyLabel="Opening Gridline">
      <ActionMenuItem onClick={() => setBusy(true)}>
        <PencilSimpleIcon className="size-4" aria-hidden="true" />
        Edit
      </ActionMenuItem>
    </ActionMenu>
  );
}

export const Busy: Story = {
  render: (args) => <BusyTransition {...args} />,
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions for Gridline" });
    await userEvent.click(trigger);
    const page = within(canvasElement.ownerDocument.body);
    await userEvent.click(await page.findByRole("menuitem", { name: "Edit" }));

    await waitFor(() => expect(trigger).toHaveFocus());
    await expect(trigger).toHaveAttribute("aria-disabled", "true");
    await expect(canvas.getByRole("status")).toHaveTextContent("Opening Gridline");
    await userEvent.click(trigger);
    await expect(page.queryByRole("menu")).not.toBeInTheDocument();
  },
};

export const Default: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const trigger = canvas.getByRole("button", { name: "Actions for Gridline" });
    await userEvent.tab();
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard("{Enter}");

    const page = within(canvasElement.ownerDocument.body);
    await expect(page.getByRole("menu")).toBeVisible();
    await expect(page.getByRole("menuitem", { name: "Edit" })).toHaveFocus();
    await userEvent.keyboard("{ArrowDown}");
    await expect(page.getByRole("menuitem", { name: "Delete" })).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await expect(trigger).toHaveFocus();
  },
};
