import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { expect, fireEvent } from "storybook/test";
import { catalogFixtures } from "../data/catalogFixtures";
import { formatCount } from "../lib/counts";
import { SystemCard } from "./SystemCard";

const meta = {
  title: "Product/SystemCard",
  component: SystemCard,
  parameters: { layout: "padded" },
  args: {
    system: {
      ...catalogFixtures[0]!,
      databaseId: catalogFixtures[0]!.databaseId ?? catalogFixtures[0]!.id,
      name: "Wasp",
      tags: ["wasp", "brutalist", "monospace", "yellow", "developer-tools"],
      screenshot: null,
    },
  },
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div data-testid="card-grid" className="grid w-[22.625rem] max-w-full">
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof SystemCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const MobileWidth: Story = {
  args: {
    system: {
      ...meta.args.system,
      copies: 2_147_483_647,
      votes: 2_147_483_647,
    },
  },
  render: (args) => (
    <div data-testid="narrow-card" className="w-72 max-w-full">
      <SystemCard {...args} />
    </div>
  ),
  play: async ({ args, canvas }) => {
    const grid = canvas.getByTestId("narrow-card").getBoundingClientRect();
    const card = canvas.getByRole("article").getBoundingClientRect();
    const labels = [
      formatCount(args.system.copies, "copy", "copies"),
      formatCount(args.system.votes, "like"),
    ];

    await expect(card.right).toBeLessThanOrEqual(grid.right + 0.5);
    for (const label of labels) {
      const badge = canvas.getByText(label).getBoundingClientRect();
      await expect(badge.left).toBeGreaterThanOrEqual(card.left - 0.5);
      await expect(badge.right).toBeLessThanOrEqual(card.right + 0.5);
      await expect(badge.height).toBeLessThanOrEqual(24.5);
    }
  },
};

export const PartialActivity: Story = {
  args: {
    system: {
      ...meta.args.system,
      copies: 0,
      votes: 4,
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("0 copies")).toBeVisible();
    await expect(canvas.getByText("4 likes")).toBeVisible();
    await expect(canvas.queryByText("New")).not.toBeInTheDocument();
  },
};

export const PartialCopies: Story = {
  args: {
    system: {
      ...meta.args.system,
      copies: 4,
      votes: 0,
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("4 copies")).toBeVisible();
    await expect(canvas.getByText("0 likes")).toBeVisible();
    await expect(canvas.queryByText("New")).not.toBeInTheDocument();
  },
};

export const New: Story = {
  args: {
    system: {
      ...meta.args.system,
      copies: 0,
      votes: 0,
    },
  },
  play: async ({ canvas }) => {
    await expect(canvas.getByText("New")).toBeVisible();
    await expect(
      canvas.getByTestId("card-grid").querySelector('[data-renderer-preview="system"]'),
    ).toBeTruthy();
    await expect(canvas.queryByText(/copies$/)).not.toBeInTheDocument();
    await expect(canvas.queryByText(/likes$/)).not.toBeInTheDocument();
  },
};

export const Screenshot: Story = {
  args: {
    system: {
      ...meta.args.system,
      screenshot: {
        url: "https://placehold.co/724x408/webp",
        width: 724,
        height: 408,
        canvas: "#0a0a0b",
      },
    },
  },
  play: async ({ canvas }) => {
    const image = canvas.getByRole("presentation");
    await fireEvent.error(image);
    await expect(canvas.queryByRole("presentation")).not.toBeInTheDocument();
    await expect(
      canvas.getByTestId("card-grid").querySelector('[data-renderer-preview="system"]'),
    ).toBeTruthy();
  },
};
