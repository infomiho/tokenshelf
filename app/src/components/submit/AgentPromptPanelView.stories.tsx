import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { AgentPromptPanelView } from "./AgentPromptPanelView";

const sessionUrl = "https://tokenshelf.example/api/agent/session/capability-example-token";

const meta = {
  title: "Product/Submit/AgentPromptPanelView",
  component: AgentPromptPanelView,
  args: {
    agentSessionUrl: sessionUrl,
    capabilityStatus: "active",
    editingPublishedSystem: false,
    copied: false,
    open: true,
    onCopy: fn(),
    onOpenChange: fn(),
    onRotateCapability: fn(),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-xl">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AgentPromptPanelView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Active: Story = {
  play: async ({ canvas, canvasElement, userEvent }) => {
    const link = canvas.getByRole("link", { name: /tokenshelf\.example\/api\/agent\/session/ });
    await expect(link).toHaveAttribute("href", sessionUrl);

    await userEvent.hover(canvas.getByRole("button", { name: "About temporary agent access" }));

    const page = within(canvasElement.ownerDocument.body);
    const popover = await page.findByRole("dialog", { name: "What's in the link?" });
    await expect(within(popover).getAllByRole("listitem")).toHaveLength(3);
    await expect(popover).toHaveTextContent("Markdown docs on how to submit");
    await expect(popover).toHaveTextContent("It expires after 24 hours.");
    await expect(popover).toHaveTextContent("Nothing needs to be installed or run");
  },
};

export const EditingPublishedSystem: Story = {
  args: { editingPublishedSystem: true },
  play: async ({ args, canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Copy update prompt" }));
    await expect(args.onCopy).toHaveBeenCalledWith(
      `We are updating a design system we submitted to Tokenshelf.

To learn how to fetch the current version and how to submit updates, open this temporary Tokenshelf access link with an HTTP or web-fetch tool:
${sessionUrl}

Ask me what I want to update, make those changes, and submit them.`,
    );
  },
};

export const Expired: Story = {
  args: {
    capabilityStatus: "expired",
  },
};
