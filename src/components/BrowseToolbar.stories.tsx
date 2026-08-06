import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { fn } from "storybook/test";
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

function InteractiveToolbar() {
  const [query, setQuery] = useState("");
  return <BrowseToolbar query={query} onQueryChange={setQuery} tagSuggestions={tagSuggestions} />;
}

export const Default: Story = { render: () => <InteractiveToolbar /> };
