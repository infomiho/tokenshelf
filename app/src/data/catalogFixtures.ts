import {
  compileRendererIr,
  legacyDesignMdToDocument,
  renderDesignMd,
} from "../domain/design-system";
import type { DesignSystem } from "./catalog";

type CatalogFixture = DesignSystem & { fixtureId: string; slug: string };
type CatalogMetadata = Omit<
  CatalogFixture,
  "id" | "name" | "description" | "document" | "renderer" | "designMd"
>;

function publishCatalogSystem(metadata: CatalogMetadata, designMd: string): CatalogFixture {
  const document = legacyDesignMdToDocument(designMd, metadata.tags);
  document.provenance.inspiration = metadata.inspiration;
  return {
    ...metadata,
    id: metadata.slug,
    name: document.identity.name,
    description: document.identity.summary,
    designMd: renderDesignMd(document),
    document,
    renderer: compileRendererIr(document),
  };
}

const apexVelocityDesignMd = `---
tokenshelf-format: 1
---
# Apex Velocity

A precise, high-contrast system for premium products that balances technical restraint with decisive color.

## Principles
- Use negative space before adding decoration.
- Reserve saturated red for brand emphasis and critical feedback.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #010205;
  --color-surface: #19191a;
  --color-surface-raised: #242426;
  --color-text: #fafbff;
  --color-text-muted: #b5b6bd;
  --color-border: #404044;
  --color-accent: #d5001c;
  --color-accent-hover: #ff1f3a;
  --color-text-on-accent: #ffffff;
  --color-selection: #1a44ea;
  --color-positive: #10c979;
  --color-caution: #f08a2e;
  --color-negative: #fc4040;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: "Roboto Condensed";
  --font-body-size: 16px;
  --font-body-line-height: 1.5;
  --font-body-weight: 400;
  --font-label-size: 13px;
  --font-label-line-height: 1.2;
  --font-label-weight: 600;
  --font-heading-size: 24px;
  --font-heading-line-height: 1.1;
  --font-heading-weight: 700;
  --font-display-size: 42px;
  --font-display-line-height: 1;
  --font-display-weight: 700;
  --font-code-size: 13px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 32px;
  --space-xl: 48px;
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-round: 256px;
  --control-height: 48px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: none;
  --shadow-floating: 0 2px 8px 0 #00000029;
  --shadow-overlay: 0 8px 24px -4px #00000052;
  --shadow-inset: inset 0 1px 2px 0 #00000052;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #f7f7f7;
  --component-action-foreground: #0e0e12;
  --component-action-background-hover: #dedede;
  --component-action-neutral-background: #303034;
  --component-action-neutral-foreground: #f7f7f7;
  --component-action-neutral-background-hover: #404044;
  --component-action-soft-background: #303034;
  --component-action-soft-foreground: #f7f7f7;
  --component-action-soft-background-hover: #404044;
  --component-action-border: #5a5a60;
  --component-action-link-foreground: #f7f7f7;
  --component-action-disabled-background: #303034;
  --component-action-disabled-foreground: #8f8f96;
  --component-focus-ring: #1a44ea;
  --component-selected-background: #303034;
  --component-selected-border: #5a5a60;
  --component-information-background: #19191a;
  --component-information-border: #404044;
  --component-field-background: #19191a;
  --component-field-border: #4a4a4f;
  --component-frame-background: #121214;
  --component-frame-border: #343438;
  --component-field-treatment: outline;
  --component-tabs-treatment: bar;
}
\`\`\`

### Guidance

Use neutral actions, cobalt focus rings, dark selected surfaces, rounded frames, and flat subtle borders. Keep red for brand emphasis rather than routine controls.

## Accessibility

Pair status color with text. Preserve visible focus indicators and meet a 44px minimum touch target.

## Sources

- [Porsche Design System](https://designsystem.porsche.com/)
`;

const gridlineDesignMd = `---
tokenshelf-format: 1
---
# Gridline

A modular enterprise system using disciplined geometry and explicit states to organize complex work.

## Principles
- Build every layout from an eight-pixel grid.
- Keep semantic roles stable across product areas.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #f4f4f4;
  --color-surface: #ffffff;
  --color-surface-raised: #ffffff;
  --color-text: #161616;
  --color-text-muted: #525252;
  --color-border: #8d8d8d;
  --color-accent: #0f62fe;
  --color-accent-hover: #0353e9;
  --color-text-on-accent: #ffffff;
  --color-selection: #d0e2ff;
  --color-positive: #198038;
  --color-caution: #8e6a00;
  --color-negative: #da1e28;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: "IBM Plex Sans";
  --font-body-size: 16px;
  --font-body-line-height: 1.5;
  --font-body-weight: 400;
  --font-label-size: 14px;
  --font-label-line-height: 1.3;
  --font-label-weight: 600;
  --font-heading-size: 24px;
  --font-heading-line-height: 1.2;
  --font-heading-weight: 400;
  --font-display-size: 42px;
  --font-display-line-height: 1.1;
  --font-display-weight: 300;
  --font-code-size: 14px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;
  --radius-sm: 0;
  --radius-md: 0;
  --radius-lg: 0;
  --radius-round: 0;
  --control-height: 40px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: none;
  --shadow-floating: 0 2px 6px 0 #0000004d;
  --shadow-overlay: 0 12px 32px -4px #00000052;
  --shadow-inset: inset 0 1px 2px 0 #0000001a;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #0f62fe;
  --component-action-foreground: #ffffff;
  --component-action-background-hover: #0353e9;
  --component-action-neutral-background: #161616;
  --component-action-neutral-foreground: #ffffff;
  --component-action-neutral-background-hover: #353535;
  --component-action-soft-background: #d0e2ff;
  --component-action-soft-foreground: #0043ce;
  --component-action-soft-background-hover: #a6c8ff;
  --component-action-border: #8d8d8d;
  --component-action-link-foreground: #161616;
  --component-action-disabled-background: #c6c6c6;
  --component-action-disabled-foreground: #8d8d8d;
  --component-focus-ring: #0f62fe;
  --component-selected-background: #e0e0e0;
  --component-selected-border: #8d8d8d;
  --component-information-background: #edf5ff;
  --component-information-border: #0f62fe;
  --component-field-background: #f4f4f4;
  --component-field-border: #8d8d8d;
  --component-frame-background: #ffffff;
  --component-frame-border: #8d8d8d;
  --component-field-treatment: underline;
  --component-tabs-treatment: underline;
}
\`\`\`

### Guidance

Use square controls, thin dividers, and compact rows. State changes should remain legible without decoration.

## Accessibility

Never use color as the only status cue. Keep labels visible and focus outlines unobstructed.

## Sources

- [Carbon Design System](https://carbondesignsystem.com/)
`;

const forgeDesignMd = `---
tokenshelf-format: 1
---
# Forge

A compact collaborative system optimized for object-centered technical workflows.

## Principles
- Let the current object anchor each page.
- Prefer functional tokens over component-specific values.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #ffffff;
  --color-surface: #f6f8fa;
  --color-surface-raised: #ffffff;
  --color-text: #1f2328;
  --color-text-muted: #59636e;
  --color-border: #d0d7de;
  --color-accent: #0969da;
  --color-accent-hover: #0550ae;
  --color-text-on-accent: #ffffff;
  --color-selection: #ddf4ff;
  --color-positive: #1a7f37;
  --color-caution: #9a6700;
  --color-negative: #d1242f;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: Inter;
  --font-body-size: 14px;
  --font-body-line-height: 1.5;
  --font-body-weight: 400;
  --font-label-size: 12px;
  --font-label-line-height: 1.3;
  --font-label-weight: 600;
  --font-heading-size: 20px;
  --font-heading-line-height: 1.2;
  --font-heading-weight: 600;
  --font-display-size: 32px;
  --font-display-line-height: 1.1;
  --font-display-weight: 700;
  --font-code-size: 13px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --radius-sm: 3px;
  --radius-md: 6px;
  --radius-lg: 12px;
  --radius-round: 256px;
  --control-height: 32px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: none;
  --shadow-floating: 0 8px 16px -4px #25292e29;
  --shadow-overlay: 0 24px 48px -8px #25292e3d;
  --shadow-inset: inset 0 1px 2px 0 #25292e1a;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #1f883d;
  --component-action-foreground: #ffffff;
  --component-action-background-hover: #1a7f37;
  --component-action-neutral-background: #25292e;
  --component-action-neutral-foreground: #ffffff;
  --component-action-neutral-background-hover: #3d444d;
  --component-action-soft-background: #ddf4ff;
  --component-action-soft-foreground: #0969da;
  --component-action-soft-background-hover: #b6e3ff;
  --component-action-border: #d0d7de;
  --component-action-link-foreground: #0969da;
  --component-action-disabled-background: #eaeef2;
  --component-action-disabled-foreground: #8c959f;
  --component-focus-ring: #0969da;
  --component-selected-background: #eaeef2;
  --component-selected-border: #afb8c1;
  --component-information-background: #ddf4ff;
  --component-information-border: #54aeff;
  --component-field-background: #ffffff;
  --component-field-border: #d0d7de;
  --component-frame-background: #ffffff;
  --component-frame-border: #d0d7de;
  --component-field-treatment: outline;
  --component-tabs-treatment: underline;
}
\`\`\`

### Guidance

Use compact controls, bordered regions, and explicit selected states for dense technical workflows.

## Accessibility

Keep control names visible, preserve keyboard order, and pair every status color with a text label.

## Sources

- [Primer](https://primer.style/product/)
`;

const timberlineDesignMd = `---
tokenshelf-format: 1
---
# Timberline

A warm, practical system combining editorial breathing room with dependable utility controls.

## Principles
- Use warm surfaces to separate major regions.
- Keep utility controls conventional and direct.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #f8f6f5;
  --color-surface: #ffffff;
  --color-surface-raised: #ffffff;
  --color-text: #272725;
  --color-text-muted: #605f5d;
  --color-border: #c9c1b3;
  --color-accent: #1f513f;
  --color-accent-hover: #173f31;
  --color-text-on-accent: #ffffff;
  --color-selection: #ffd280;
  --color-positive: #2e6b34;
  --color-caution: #854714;
  --color-negative: #811823;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: "Source Sans 3";
  --font-heading-family: Georgia;
  --font-display-family: Georgia;
  --font-body-size: 16px;
  --font-body-line-height: 1.6;
  --font-body-weight: 400;
  --font-label-size: 13px;
  --font-label-line-height: 1.3;
  --font-label-weight: 600;
  --font-heading-size: 26px;
  --font-heading-line-height: 1.2;
  --font-heading-weight: 700;
  --font-display-size: 44px;
  --font-display-line-height: 1.1;
  --font-display-weight: 700;
  --font-code-size: 14px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 8px;
  --space-sm: 12px;
  --space-md: 24px;
  --space-lg: 32px;
  --space-xl: 64px;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --radius-round: 256px;
  --control-height: 48px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: none;
  --shadow-floating: 0 6px 14px -2px #2e2e2b33;
  --shadow-overlay: 0 20px 40px -8px #2e2e2b52;
  --shadow-inset: inset 0 1px 2px 0 #2e2e2b1a;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #1f513f;
  --component-action-foreground: #ffffff;
  --component-action-background-hover: #173f31;
  --component-action-neutral-background: #2e2e2b;
  --component-action-neutral-foreground: #ffffff;
  --component-action-neutral-background-hover: #454541;
  --component-action-soft-background: #e4ded2;
  --component-action-soft-foreground: #1f513f;
  --component-action-soft-background-hover: #d6d1c8;
  --component-action-border: #8f877a;
  --component-action-link-foreground: #1f513f;
  --component-action-disabled-background: #e4ded2;
  --component-action-disabled-foreground: #8f877a;
  --component-focus-ring: #236b52;
  --component-selected-background: #e4ded2;
  --component-information-background: #f8f6f5;
  --component-information-border: #c9c1b3;
  --component-field-background: #ffffff;
  --component-field-border: #8f877a;
  --component-frame-background: #ffffff;
  --component-frame-border: #d6d1c8;
  --component-selected-border: #8f877a;
}
\`\`\`

### Guidance

Use calm surfaces, sturdy controls, and generous reading space. Keep actions visually conventional.

## Accessibility

Use underlines for links, visible labels for fields, and text alongside every semantic color.

## Sources

- [Cedar](https://cedar.rei.com/)
`;

const signalLoomDesignMd = `---
tokenshelf-format: 1
---
# Signal Loom

An approachable communications system combining operational structure with expressive feedback.

## Principles
- Components consume semantic roles rather than raw palette values.
- Feedback remains explicit in text and color.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #ffffff;
  --color-surface: #f4f4f6;
  --color-surface-raised: #ffffff;
  --color-text: #121c2d;
  --color-text-muted: #606b85;
  --color-border: #8b93aa;
  --color-accent: #0263e0;
  --color-accent-hover: #001489;
  --color-text-on-accent: #ffffff;
  --color-selection: #ebf4ff;
  --color-positive: #0e7c3a;
  --color-caution: #8d3118;
  --color-negative: #db132a;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: Inter;
  --font-body-size: 16px;
  --font-body-line-height: 1.43;
  --font-body-weight: 400;
  --font-label-size: 14px;
  --font-label-line-height: 1.43;
  --font-label-weight: 600;
  --font-heading-size: 24px;
  --font-heading-line-height: 1.33;
  --font-heading-weight: 700;
  --font-display-size: 40px;
  --font-display-line-height: 1.3;
  --font-display-weight: 700;
  --font-code-size: 14px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --radius-round: 256px;
  --control-height: 36px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: none;
  --shadow-floating: 0 2px 8px 0 #0f162129;
  --shadow-overlay: 0 8px 24px -4px #0f16213d;
  --shadow-inset: inset 0 1px 2px 0 #0f16211a;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #0263e0;
  --component-action-foreground: #ffffff;
  --component-action-background-hover: #001489;
  --component-action-neutral-background: #23272a;
  --component-action-neutral-foreground: #ffffff;
  --component-action-neutral-background-hover: #313338;
  --component-action-soft-background: #e6e9ef;
  --component-action-soft-foreground: #0263e0;
  --component-action-soft-background-hover: #d4d8e2;
  --component-action-border: #8b93aa;
  --component-action-link-foreground: #0263e0;
  --component-action-disabled-background: #e6e9ef;
  --component-action-disabled-foreground: #8b93aa;
  --component-focus-ring: #0263e0;
  --component-selected-background: #e6e9ef;
  --component-selected-border: #001489;
  --component-information-background: #ebf4ff;
  --component-information-border: #0263e0;
  --component-field-background: #ffffff;
  --component-field-border: #8b93aa;
  --component-frame-background: #ffffff;
  --component-frame-border: #8b93aa;
}
\`\`\`

### Guidance

Use rounded controls, spacious labels, and direct feedback language for communication workflows.

## Accessibility

Announce asynchronous feedback, retain persistent error text, and never rely on color alone.

## Sources

- [Paste](https://github.com/twilio-labs/paste)
`;

const canopyDataDesignMd = `---
tokenshelf-format: 1
---
# Canopy Data

A clear data-product system that softens technical workflows with organic color and focused guidance.

## Principles
- Use containers to reveal complexity progressively.
- Keep data actions strong and guidance softly chromatic.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #001e2b;
  --color-surface: #112733;
  --color-surface-raised: #173746;
  --color-text: #e8edeb;
  --color-text-muted: #c1c7c6;
  --color-border: #5d6c72;
  --color-accent: #00a86b;
  --color-accent-hover: #18c786;
  --color-text-on-accent: #001e2b;
  --color-selection: #174f68;
  --color-positive: #00a35c;
  --color-caution: #ffc010;
  --color-negative: #ff6960;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: "Noto Sans";
  --font-heading-family: Georgia;
  --font-display-family: Georgia;
  --font-body-size: 15px;
  --font-body-line-height: 1.5;
  --font-body-weight: 400;
  --font-label-size: 13px;
  --font-label-line-height: 1.3;
  --font-label-weight: 600;
  --font-heading-size: 23px;
  --font-heading-line-height: 1.2;
  --font-heading-weight: 600;
  --font-display-size: 38px;
  --font-display-line-height: 1.1;
  --font-display-weight: 600;
  --font-code-size: 13px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 2px;
  --space-sm: 4px;
  --space-md: 8px;
  --space-lg: 16px;
  --space-xl: 32px;
  --radius-sm: 2px;
  --radius-md: 6px;
  --radius-lg: 16px;
  --radius-round: 256px;
  --control-height: 36px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: none;
  --shadow-floating: 0 12px 24px -8px #00000073;
  --shadow-overlay: 0 24px 48px -12px #00000099;
  --shadow-inset: inset 0 1px 2px 0 #00000052;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #3d4f58;
  --component-action-foreground: #ffffff;
  --component-action-background-hover: #4f626b;
  --component-action-neutral-background: #ffffff;
  --component-action-neutral-foreground: #001e2b;
  --component-action-neutral-background-hover: #e8edeb;
  --component-action-soft-background: #174f68;
  --component-action-soft-foreground: #ffffff;
  --component-action-soft-background-hover: #24627c;
  --component-action-border: #5d6c72;
  --component-action-link-foreground: #00a86b;
  --component-action-disabled-background: #3d4f58;
  --component-action-disabled-foreground: #839097;
  --component-focus-ring: #00a86b;
  --component-selected-background: #174f68;
  --component-selected-border: #5d6c72;
  --component-information-background: #083c50;
  --component-information-border: #00a86b;
  --component-field-background: #112733;
  --component-field-border: #5d6c72;
  --component-frame-background: #001e2b;
  --component-frame-border: #5d6c72;
}
\`\`\`

### Guidance

Use dark layered surfaces, compact fields, and green actions to guide technical setup work.

## Accessibility

Keep text contrast high, add labels to all status colors, and preserve visible keyboard focus.

## Sources

- [LeafyGreen](https://www.mongodb.design/)
`;

const mercantileDesignMd = `---
tokenshelf-format: 1
---
# Mercantile

A calm commerce system that gives actions, statuses, and exceptions unmistakable emphasis.

## Principles
- Keep routine work quiet and monochromatic.
- Use color only for action, state, and urgency.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #f7f7f5;
  --color-surface: #ffffff;
  --color-surface-raised: #ffffff;
  --color-text: #202220;
  --color-text-muted: #61675f;
  --color-border: #c9cec7;
  --color-accent: #276749;
  --color-accent-hover: #1f513b;
  --color-text-on-accent: #ffffff;
  --color-selection: #d9f2e3;
  --color-positive: #238636;
  --color-caution: #8a5b00;
  --color-negative: #b42318;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: "Public Sans";
  --font-body-size: 16px;
  --font-body-line-height: 1.5;
  --font-body-weight: 400;
  --font-label-size: 13px;
  --font-label-line-height: 1.3;
  --font-label-weight: 600;
  --font-heading-size: 25px;
  --font-heading-line-height: 1.2;
  --font-heading-weight: 700;
  --font-display-size: 42px;
  --font-display-line-height: 1.1;
  --font-display-weight: 700;
  --font-code-size: 13px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 20px;
  --space-xl: 32px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-round: 256px;
  --control-height: 40px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: 0 1px 2px 0 #20222014;
  --shadow-floating: 0 6px 16px -4px #20222029;
  --shadow-overlay: 0 18px 36px -8px #2022203d;
  --shadow-inset: inset 0 1px 2px 0 #2022201a;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #276749;
  --component-action-foreground: #ffffff;
  --component-action-background-hover: #1f513b;
  --component-action-neutral-background: #202220;
  --component-action-neutral-foreground: #ffffff;
  --component-action-neutral-background-hover: #303330;
  --component-action-soft-background: #e5ebe6;
  --component-action-soft-foreground: #276749;
  --component-action-soft-background-hover: #d7e0d9;
  --component-action-border: #c9cec7;
  --component-action-link-foreground: #276749;
  --component-action-disabled-background: #e5ebe6;
  --component-action-disabled-foreground: #86948b;
  --component-focus-ring: #276749;
  --component-selected-background: #e5ebe6;
  --component-selected-border: #c9cec7;
  --component-information-background: #edf3ee;
  --component-information-border: #276749;
  --component-field-background: #ffffff;
  --component-field-border: #c9cec7;
  --component-frame-background: #ffffff;
  --component-frame-border: #c9cec7;
}
\`\`\`

### Guidance

Keep the shell calm, forms familiar, and primary actions easy to identify in operational work.

## Accessibility

Use persistent labels, descriptive errors, and redundant status text. Maintain visible focus rings.

## Sources

- [Shopify Polaris web components](https://shopify.dev/docs/api/app-home/polaris-web-components)
- [Shopify Polaris React](https://github.com/Shopify/polaris-react)
`;

const tactileDesignMd = `---
tokenshelf-format: 1
---
# Tactile

A polished product system built from quiet zinc surfaces, vivid orange actions, and compact physical feedback.

## Principles
- Keep structure neutral so the primary action and current state are immediately clear.
- Use short, physical microinteractions only when they confirm an action or reveal hierarchy.
- Prefer layered surfaces and deliberate spacing over decorative borders.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #ffffff;
  --color-surface: #fafafa;
  --color-surface-raised: #f4f4f5;
  --color-text: #09090b;
  --color-text-muted: #52525b;
  --color-border: #e4e4e7;
  --color-accent: #f05023;
  --color-accent-hover: #d9441a;
  --color-text-on-accent: #ffffff;
  --color-selection: #ffe6d5;
  --color-positive: #16a34a;
  --color-caution: #f05023;
  --color-negative: #b83616;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: Manrope;
  --font-code-family: "Geist Mono";
  --font-body-size: 16px;
  --font-body-line-height: 1.625;
  --font-body-weight: 420;
  --font-label-size: 14px;
  --font-label-line-height: 1.25;
  --font-label-weight: 540;
  --font-heading-size: 24px;
  --font-heading-line-height: 1.18;
  --font-heading-weight: 600;
  --font-display-size: 40px;
  --font-display-line-height: 1.12;
  --font-display-weight: 600;
  --font-code-size: 13px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 48px;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 16px;
  --radius-round: 256px;
  --control-height: 44px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: 0 1px 2px 0 #2929290a;
  --shadow-floating: 0 4px 8px #2929290f, 0 2px 4px #2929290a, 0 1px 2px #2929290a, 0 0 0 1px #2929290f, inset 0 -0.5px 0.5px #2929291a, inset 0 -1px 0.5px #0000001a;
  --shadow-overlay: 0 12px 32px -8px #0a0c1424, 0 48px 96px -24px #0a0c1429;
  --shadow-inset: inset 0 -1px 1px #0000001a;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #f05023;
  --component-action-foreground: #ffffff;
  --component-action-background-hover: #d9441a;
  --component-action-neutral-background: #09090b;
  --component-action-neutral-foreground: #ffffff;
  --component-action-neutral-background-hover: #27272a;
  --component-action-soft-background: #fce7e2;
  --component-action-soft-foreground: #b83616;
  --component-action-soft-background-hover: #f9d7cf;
  --component-action-border: #d4d4d8;
  --component-action-link-foreground: #09090b;
  --component-action-disabled-background: #f7a58f;
  --component-action-disabled-foreground: #ffffff;
  --component-focus-ring: #f05023;
  --component-selected-background: #f4f4f5;
  --component-selected-border: #d4d4d8;
  --component-information-background: #fafafa;
  --component-information-border: #e4e4e7;
  --component-field-background: #ffffff;
  --component-field-border: #d4d4d8;
  --component-frame-background: #ffffff;
  --component-frame-border: #e4e4e7;
  --component-action-treatment: pill;
  --component-field-treatment: outline;
  --component-tabs-treatment: segmented;
}
\`\`\`

### Guidance

Use pill-shaped primary actions, quiet bordered fields, soft status fills, and raised cards with low-contrast layered shadows. Keep hover and press feedback near 150ms with ease-out timing. Nudge directional icons by 2px on hover, use a 0.96 press scale for buttons, and reserve card lift for clickable surfaces. Stagger one-time list entrances by 80ms; never stagger routine updates.

## Accessibility

Keep focus visible, pair every status color with text, preserve 44px controls, and disable transforms and staged motion when reduced motion is requested.

## Sources

- [Fountible](https://fountible.com/)

## Notes

Microinteraction guidance is derived from the published hover, press, copy confirmation, stagger, and reduced-motion specimens.
`;

export const catalogFixtures: CatalogFixture[] = [
  publishCatalogSystem(
    {
      fixtureId: "apex-velocity",
      slug: "apex-velocity-d7fcaeb79d3b",
      tags: ["Premium", "Minimal", "Product"],
      copies: 2840,
      todayCopies: 412,
      votes: 486,
      pickedOn: "Jul 31",
      inspiration: {
        company: "Porsche",
        system: "Porsche Design System",
        docsUrl: "https://designsystem.porsche.com/",
        sourceUrl: "https://github.com/porsche-design-system/porsche-design-system",
        license: "Apache-2.0 code; Porsche assets restricted",
        licenseUrl: "https://designsystem.porsche.com/v4/license/",
      },
    },
    apexVelocityDesignMd,
  ),
  publishCatalogSystem(
    {
      fixtureId: "gridline",
      slug: "gridline-98b125b27c18",
      tags: ["Enterprise", "Data", "Accessible"],
      copies: 3210,
      todayCopies: 331,
      votes: 612,
      pickedOn: "Jul 30",
      inspiration: {
        company: "IBM",
        system: "Carbon Design System",
        docsUrl: "https://carbondesignsystem.com/",
        sourceUrl: "https://github.com/carbon-design-system/carbon",
        license: "Apache-2.0",
        licenseUrl: "https://github.com/carbon-design-system/carbon/blob/main/LICENSE",
      },
    },
    gridlineDesignMd,
  ),
  publishCatalogSystem(
    {
      fixtureId: "forge",
      slug: "forge-58ddfd1c97f6",
      tags: ["Developer tools", "Collaboration", "Compact"],
      copies: 2690,
      todayCopies: 255,
      votes: 504,
      pickedOn: "Jul 29",
      inspiration: {
        company: "GitHub",
        system: "Primer",
        docsUrl: "https://primer.style/product/",
        sourceUrl: "https://github.com/primer/primitives",
        license: "MIT",
        licenseUrl: "https://github.com/primer/primitives/blob/main/LICENSE",
      },
    },
    forgeDesignMd,
  ),
  publishCatalogSystem(
    {
      fixtureId: "timberline",
      slug: "timberline-2b76388a3bf2",
      tags: ["Editorial", "Commerce", "Friendly"],
      copies: 1120,
      todayCopies: 184,
      votes: 204,
      pickedOn: "Jul 28",
      inspiration: {
        company: "REI",
        system: "Cedar",
        docsUrl: "https://cedar.rei.com/",
        sourceUrl: "https://github.com/rei/rei-cedar",
        license: "MIT code; commercial font rights separate",
        licenseUrl: "https://github.com/rei/rei-cedar/blob/main/LICENSE",
      },
    },
    timberlineDesignMd,
  ),
  publishCatalogSystem(
    {
      fixtureId: "signal-loom",
      slug: "signal-loom-3438e2380ecb",
      tags: ["Communications", "Accessible", "Friendly"],
      copies: 1380,
      todayCopies: 207,
      votes: 238,
      inspiration: {
        company: "Twilio",
        system: "Paste",
        docsUrl: "https://github.com/twilio-labs/paste",
        sourceUrl: "https://github.com/twilio-labs/paste",
        license: "MIT",
        licenseUrl: "https://github.com/twilio-labs/paste/blob/main/LICENSE",
      },
    },
    signalLoomDesignMd,
  ),
  publishCatalogSystem(
    {
      fixtureId: "canopy-data",
      slug: "canopy-data-07971f8a4b5f",
      tags: ["Data", "Developer tools", "Friendly"],
      copies: 980,
      todayCopies: 169,
      votes: 192,
      inspiration: {
        company: "MongoDB",
        system: "LeafyGreen UI",
        docsUrl: "https://www.mongodb.design/",
        sourceUrl: "https://github.com/mongodb/leafygreen-ui",
        license: "Apache-2.0 code; MongoDB assets separate",
        licenseUrl: "https://github.com/mongodb/leafygreen-ui/blob/main/LICENSE",
      },
    },
    canopyDataDesignMd,
  ),
  publishCatalogSystem(
    {
      fixtureId: "mercantile",
      slug: "mercantile-04c122afb203",
      tags: ["Commerce", "Workflow", "Friendly"],
      copies: 2410,
      todayCopies: 298,
      votes: 418,
      inspiration: {
        company: "Shopify",
        system: "Polaris",
        docsUrl: "https://shopify.dev/docs/api/app-home/polaris-web-components",
        sourceUrl: "https://github.com/Shopify/polaris-react",
        license: "Shopify Polaris license",
        licenseUrl: "https://github.com/Shopify/polaris-react/blob/main/LICENSE.md",
      },
    },
    mercantileDesignMd,
  ),
  publishCatalogSystem(
    {
      fixtureId: "tactile",
      slug: "tactile-9b29e5eae4b4",
      tags: ["Developer tools", "Motion", "Polished"],
      copies: 0,
      todayCopies: 0,
      votes: 0,
      inspiration: {
        company: "Fountible",
        system: "Fountible Design System",
        docsUrl: "https://fountible.com/",
        sourceUrl: "https://fountible.com/",
        license: "Reference implementation; license not specified",
        licenseUrl: "https://fountible.com/",
      },
    },
    tactileDesignMd,
  ),
];

const switchyardDesignMd = `---
tokenshelf-format: 1
---
# Switchyard

A modular workflow system that makes routing, ownership, and handoffs visible without turning every screen into a dashboard.

## Principles
- Organize work around routes, stages, and clear handoff points.
- Use signal color to show movement while keeping stationary structure neutral.

## Foundations
### Color

\`\`\`css
:root {
  --color-canvas: #f2f1ed;
  --color-surface: #fbfaf7;
  --color-surface-raised: #ffffff;
  --color-text: #202522;
  --color-text-muted: #626a65;
  --color-border: #b9beb9;
  --color-accent: #d84a1b;
  --color-accent-hover: #b63a12;
  --color-text-on-accent: #ffffff;
  --color-selection: #dce8e2;
  --color-positive: #237a4b;
  --color-caution: #9b6500;
  --color-negative: #b72f35;
}
\`\`\`

### Typography

\`\`\`css
:root {
  --font-family: "Space Grotesk";
  --font-code-family: "IBM Plex Sans";
  --font-body-size: 15px;
  --font-body-line-height: 1.5;
  --font-body-weight: 400;
  --font-label-size: 12px;
  --font-label-line-height: 1.3;
  --font-label-weight: 600;
  --font-heading-size: 24px;
  --font-heading-line-height: 1.2;
  --font-heading-weight: 600;
  --font-display-size: 40px;
  --font-display-line-height: 1.05;
  --font-display-weight: 600;
  --font-code-size: 13px;
  --font-code-line-height: 1.4;
  --font-code-weight: 400;
}
\`\`\`

### Geometry

\`\`\`css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 12px;
  --space-lg: 24px;
  --space-xl: 40px;
  --radius-sm: 2px;
  --radius-md: 6px;
  --radius-lg: 10px;
  --radius-round: 256px;
  --control-height: 36px;
}
\`\`\`

### Elevation

\`\`\`css
:root {
  --shadow-resting: none;
  --shadow-floating: 0 4px 12px -4px #20252233;
  --shadow-overlay: 0 16px 32px -8px #20252247;
  --shadow-inset: inset 0 1px 2px 0 #2025221a;
}
\`\`\`

## Components

### Styles

\`\`\`css
:root {
  --component-action-background: #d84a1b;
  --component-action-foreground: #ffffff;
  --component-action-background-hover: #b63a12;
  --component-action-neutral-background: #202522;
  --component-action-neutral-foreground: #ffffff;
  --component-action-neutral-background-hover: #343a36;
  --component-action-soft-background: #f6e1d8;
  --component-action-soft-foreground: #d84a1b;
  --component-action-soft-background-hover: #f0d1c4;
  --component-action-border: #929a94;
  --component-action-link-foreground: #202522;
  --component-action-disabled-background: #ead4ca;
  --component-action-disabled-foreground: #927b72;
  --component-focus-ring: #256b9b;
  --component-selected-background: #dce8e2;
  --component-selected-border: #658477;
  --component-information-background: #e5edf2;
  --component-information-border: #6e94ac;
  --component-field-background: #ffffff;
  --component-field-border: #929a94;
  --component-frame-background: #fbfaf7;
  --component-frame-border: #b9beb9;
  --component-field-treatment: outline;
  --component-tabs-treatment: segmented;
}
\`\`\`

### Guidance

Build workflows from compact stage groups, route labels, and explicit handoff actions. Use orange for forward movement, blue for focus, and green-gray selection for the current route. Keep frames flat so nested modules remain readable.

## Accessibility

Name every stage and route in text, preserve visible keyboard focus, and announce ownership or status changes. Do not encode workflow direction through position or color alone.

## Notes

Switchyard is an original Tokenshelf system for modular setup, routing, and review workflows.
`;

const draftSystem = publishCatalogSystem(
  {
    fixtureId: "switchyard",
    slug: "switchyard-af41026047c8",
    tags: ["Workflow", "Modular", "Original"],
    copies: 0,
    todayCopies: 0,
    votes: 0,
  },
  switchyardDesignMd,
);

export const submissionFixture = {
  id: "draft-switchyard",
  system: draftSystem,
  submittedAt: "2 minutes ago",
};
