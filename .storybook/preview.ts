import type { Preview } from "@storybook/react-vite";
import { MINIMAL_VIEWPORTS } from "storybook/viewport";

import "../src/Main.css";

const preview: Preview = {
  tags: ["autodocs"],
  parameters: {
    a11y: {
      test: "error",
    },
    viewport: {
      options: MINIMAL_VIEWPORTS,
    },
  },
};

export default preview;
