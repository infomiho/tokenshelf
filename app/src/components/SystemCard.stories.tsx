import type { Meta, StoryObj } from "@storybook/react-vite";
import { MemoryRouter } from "react-router";
import { expect } from "storybook/test";
import { catalogFixtures } from "../data/catalogFixtures";
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
  play: async ({ canvas }) => {
    const grid = canvas.getByTestId("card-grid").getBoundingClientRect();
    const card = canvas.getByRole("article").getBoundingClientRect();

    await expect(card.right).toBeLessThanOrEqual(grid.right + 0.5);
  },
};
