import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type ComponentProps } from "react";
import { expect, fn } from "storybook/test";
import { BrowseToolbar } from "./BrowseToolbar";

const tagSuggestions = [
  { label: "Developer tools", count: 18 },
  { label: "Minimal", count: 14 },
  { label: "Data", count: 11 },
  { label: "Editorial", count: 9 },
  { label: "Commerce", count: 8 },
  { label: "Motion", count: 6 },
];

const meta = {
  title: "Product/BrowseToolbar",
  component: BrowseToolbar,
  args: { query: "", onQueryChange: fn(), tagSuggestions },
  parameters: { layout: "padded" },
} satisfies Meta<typeof BrowseToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

function InteractiveToolbar(args: ComponentProps<typeof BrowseToolbar>) {
  const [localQuery, setLocalQuery] = useState<string>();

  return (
    <BrowseToolbar
      {...args}
      query={localQuery ?? args.query}
      onQueryChange={(query) => {
        setLocalQuery(query);
        args.onQueryChange(query);
      }}
    />
  );
}

export const Default: Story = {
  render: (args) => <InteractiveToolbar {...args} />,
  play: async ({ canvas, userEvent }) => {
    const input = canvas.getByRole("textbox", { name: "Search systems" });
    await userEvent.type(input, "Developer tools");
    await userEvent.click(canvas.getByRole("button", { name: "Clear search" }));
    await expect(input).toHaveValue("");
    await expect(input).toHaveFocus();
  },
};
