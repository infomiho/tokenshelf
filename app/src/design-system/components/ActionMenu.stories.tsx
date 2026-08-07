import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
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
