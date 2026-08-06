import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { catalogFixtures } from "../data/catalogFixtures";
import { SystemComponentSpecimen } from "./SystemComponentSpecimen";
import "./SystemPreview.css";

const timberline = catalogFixtures.find(({ fixtureId }) => fixtureId === "timberline")!;
const secondTimberline = { ...timberline.renderer, name: "Timberline Alternate" };

const meta = {
  title: "Product/SystemComponentSpecimen",
  component: SystemComponentSpecimen,
  args: {
    renderer: timberline.renderer,
    projection: "detail",
  },
  decorators: [
    (Story) => (
      <div className="system-preview mx-auto max-w-6xl" data-renderer-preview="system">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SystemComponentSpecimen>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Timberline: Story = {};

export const MultipleInstances: Story = {
  render: (args) => (
    <div className="grid gap-6">
      <SystemComponentSpecimen {...args} />
      <SystemComponentSpecimen {...args} renderer={secondTimberline} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const previews = [
      ...canvasElement.querySelectorAll<HTMLElement>("[data-renderer-root=system]"),
    ];
    const firstPreview = within(previews[0]!);
    const secondPreview = within(previews[1]!);
    const firstField = firstPreview.getByLabelText("Project name");
    const secondField = secondPreview.getByLabelText("Project name");
    const firstRadios = firstPreview.getAllByRole("radio");
    const secondRadios = secondPreview.getAllByRole("radio");

    await expect(firstField.id).not.toBe(secondField.id);
    await expect(firstRadios[0]).toHaveAttribute("name");
    await expect(secondRadios[0]).toHaveAttribute("name");
    await expect(firstRadios[0]!.getAttribute("name")).not.toBe(
      secondRadios[0]!.getAttribute("name"),
    );

    await userEvent.click(secondRadios[1]!);
    await expect(firstRadios[0]).toBeChecked();
    await expect(secondRadios[1]).toBeChecked();

    await userEvent.click(secondPreview.getByRole("button", { name: "Team" }));
    await expect(firstPreview.getByRole("button", { name: "Projects" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(secondPreview.getByRole("button", { name: "Team" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  },
};
