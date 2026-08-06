import type { Diagnostic } from "@infomiho/agent-work-protocol";
import { contrastRatio } from "./color";

export const colorRoles = [
  "canvas",
  "surface",
  "surface-raised",
  "text",
  "text-muted",
  "border",
  "accent",
  "accent-hover",
  "text-on-accent",
  "selection",
  "positive",
  "caution",
  "negative",
] as const;
export const typographyRoles = ["body", "label", "heading", "display", "code"] as const;
export const spaceRoles = ["xs", "sm", "md", "lg", "xl"] as const;
export const radiusRoles = ["sm", "md", "lg", "round"] as const;
export const elevationRoles = ["resting", "floating", "overlay", "inset"] as const;
export const componentStyleRoles = [
  "focusRing",
  "selectedBackground",
  "selectedBorder",
  "informationBackground",
  "informationBorder",
  "fieldBackground",
  "fieldBorder",
  "frameBackground",
  "frameBorder",
] as const;

export type ColorRole = (typeof colorRoles)[number];
export type TypographyRole = (typeof typographyRoles)[number];
export type SpaceRole = (typeof spaceRoles)[number];
export type RadiusRole = (typeof radiusRoles)[number];
export type ElevationRole = (typeof elevationRoles)[number];
export type ComponentStyleRole = (typeof componentStyleRoles)[number];
export type FieldTreatment = "outline" | "underline";
export type TabsTreatment = "segmented" | "underline" | "bar";

export type ActionStateDocument = {
  background?: string;
  foreground?: string;
  border?: string;
};

export type ActionVariantDocument = ActionStateDocument & {
  key: string;
  appearance: "filled" | "outlined" | "text";
  decoration?: "none" | "underline";
  decorationColor?: string;
  hover: ActionStateDocument;
  disabled: ActionStateDocument;
};

export type ActionSizeDocument = {
  key: string;
  height: number;
  paddingInline: number;
  fontSize: number;
};

export type ActionsDocument = {
  radius: number;
  defaultVariant: string;
  defaultSize: string;
  variants: ActionVariantDocument[];
  sizes: ActionSizeDocument[];
};

export type FontFaceDocument = {
  url: string;
  style: "normal" | "italic" | "oblique";
  weight: string;
  stretch?: string;
  unicodeRange?: string;
};

export type FontDocument = {
  key: string;
  id?: string;
  family: string;
  source: "fontsource" | "system";
  packageVersion?: string;
  fallback: "sans-serif" | "serif" | "monospace";
  faces: FontFaceDocument[];
};

export type TypeStyleDocument = {
  font?: string;
  size?: number;
  lineHeight?: number;
  weight?: number;
  style?: "normal" | "italic" | "oblique";
  stretch?: string;
  axes?: Array<{ tag: string; value: number }>;
};

export type DesignSystemDocument = {
  version: "1";
  identity: {
    name: string;
    summary: string;
    tags: string[];
  };
  principles: string[];
  foundations: {
    colors: Partial<Record<ColorRole, string>>;
    typography: {
      fonts: FontDocument[];
      defaultFont?: string;
      roles: Partial<Record<TypographyRole, TypeStyleDocument>>;
    };
    spacing: Partial<Record<SpaceRole, number>>;
    radii: Partial<Record<RadiusRole, number>>;
    controlHeight?: number;
    elevation: Partial<Record<ElevationRole, string>>;
  };
  components: {
    styles: Partial<Record<ComponentStyleRole, string>>;
    actions: ActionsDocument;
    guidance: string;
    fieldTreatment?: FieldTreatment;
    tabsTreatment?: TabsTreatment;
  };
  accessibility: {
    guidance: string;
  };
  provenance: {
    sources: Array<{ name: string; url?: string }>;
    license?: string;
  };
  notes?: string;
};

export type TypeStyle = {
  fontKey: string;
  size: number;
  lineHeight: number;
  weight: number;
  style: "normal" | "italic" | "oblique";
  stretch: string;
  axes: Array<{ tag: string; value: number }>;
  authoredFamily: string;
  runtimeFamily: string;
};

export type RendererFont = FontDocument & {
  runtimeName: string;
  runtimeFamily: string;
};

export type RendererIR = {
  name: string;
  summary: string;
  principles: string[];
  componentGuidance: string;
  accessibility: string;
  hasSources: boolean;
  colors: Record<ColorRole, string>;
  fonts: RendererFont[];
  typography: Record<TypographyRole, TypeStyle> & { authoredFamily: string; runtimeFamily: string };
  geometry: {
    space: Record<SpaceRole, number>;
    radius: Record<RadiusRole, number>;
    controlHeight: number;
  };
  elevation: Record<ElevationRole, string>;
  componentStyles: Record<ComponentStyleRole, string>;
  actions: ActionsDocument;
  treatments: { field: FieldTreatment; tabs: TabsTreatment };
};

export type DesignArtifacts = { designMd: string; renderer: RendererIR };

type ObjectSchema = {
  type: "object";
  required?: readonly string[];
  properties: Record<string, unknown>;
  additionalProperties: boolean;
};

const boundedString = (maxLength: number) => ({ type: "string", maxLength }) as const;
const numberSchema = { type: "number" } as const;
const roleMapSchema = (roles: readonly string[], value: unknown): ObjectSchema => ({
  type: "object",
  properties: Object.fromEntries(roles.map((role) => [role, value])),
  additionalProperties: false,
});
const objectSchema = (
  required: readonly string[],
  properties: Record<string, unknown>,
): ObjectSchema => ({
  type: "object",
  required,
  properties,
  additionalProperties: false,
});

const typeStyleSchema = objectSchema([], {
  font: boundedString(32),
  size: { type: "number", minimum: 0 },
  lineHeight: { type: "number", minimum: 0 },
  weight: { type: "number", minimum: 1, maximum: 1000 },
  style: { enum: ["normal", "italic", "oblique"] },
  stretch: boundedString(32),
  axes: {
    type: "array",
    maxItems: 8,
    items: objectSchema(["tag", "value"], { tag: boundedString(4), value: numberSchema }),
  },
});

const fontFaceSchema = objectSchema(["url", "style", "weight"], {
  url: boundedString(500),
  style: { enum: ["normal", "italic", "oblique"] },
  weight: boundedString(16),
  stretch: boundedString(32),
  unicodeRange: boundedString(500),
});

const fontSchema = objectSchema(["key", "family", "source", "fallback", "faces"], {
  key: boundedString(32),
  id: boundedString(80),
  family: boundedString(120),
  source: { enum: ["fontsource", "system"] },
  packageVersion: boundedString(32),
  fallback: { enum: ["sans-serif", "serif", "monospace"] },
  faces: { type: "array", maxItems: 16, items: fontFaceSchema },
});

const actionStateSchema = objectSchema([], {
  background: boundedString(32),
  foreground: boundedString(32),
  border: boundedString(32),
});

const actionVariantSchema = objectSchema(["key", "appearance", "hover", "disabled"], {
  key: boundedString(32),
  appearance: { enum: ["filled", "outlined", "text"] },
  decoration: { enum: ["none", "underline"] },
  decorationColor: boundedString(32),
  background: boundedString(32),
  foreground: boundedString(32),
  border: boundedString(32),
  hover: actionStateSchema,
  disabled: actionStateSchema,
});

const actionSizeSchema = objectSchema(["key", "height", "paddingInline", "fontSize"], {
  key: boundedString(32),
  height: { type: "number", minimum: 0 },
  paddingInline: { type: "number", minimum: 0 },
  fontSize: { type: "number", minimum: 0 },
});

const actionsSchema = objectSchema(
  ["radius", "defaultVariant", "defaultSize", "variants", "sizes"],
  {
    radius: { type: "number", minimum: 0 },
    defaultVariant: boundedString(32),
    defaultSize: boundedString(32),
    variants: { type: "array", maxItems: 12, items: actionVariantSchema },
    sizes: { type: "array", maxItems: 8, items: actionSizeSchema },
  },
);

export const designSystemDocumentSchema = objectSchema(
  ["version", "identity", "principles", "foundations", "components", "accessibility", "provenance"],
  {
    version: { const: "1" },
    identity: objectSchema(["name", "summary", "tags"], {
      name: boundedString(60),
      summary: boundedString(280),
      tags: { type: "array", maxItems: 5, items: boundedString(40) },
    }),
    principles: { type: "array", maxItems: 8, items: boundedString(240) },
    foundations: objectSchema(["colors", "typography", "spacing", "radii", "elevation"], {
      colors: roleMapSchema(colorRoles, boundedString(32)),
      typography: objectSchema(["fonts", "roles"], {
        fonts: { type: "array", maxItems: 8, items: fontSchema },
        defaultFont: boundedString(32),
        roles: roleMapSchema(typographyRoles, typeStyleSchema),
      }),
      spacing: roleMapSchema(spaceRoles, numberSchema),
      radii: roleMapSchema(radiusRoles, numberSchema),
      controlHeight: { type: "number", minimum: 0 },
      elevation: roleMapSchema(elevationRoles, boundedString(256)),
    }),
    components: objectSchema(["styles", "actions", "guidance"], {
      styles: roleMapSchema(componentStyleRoles, boundedString(32)),
      actions: actionsSchema,
      guidance: boundedString(2_000),
      fieldTreatment: { enum: ["outline", "underline"] },
      tabsTreatment: { enum: ["segmented", "underline", "bar"] },
    }),
    accessibility: objectSchema(["guidance"], { guidance: boundedString(2_000) }),
    provenance: objectSchema(["sources"], {
      sources: {
        type: "array",
        maxItems: 20,
        items: objectSchema(["name"], { name: boundedString(120), url: boundedString(2_000) }),
      },
      license: boundedString(120),
    }),
    notes: boundedString(4_000),
  },
);

export const designSystemDocumentJsonSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://tokenshelf.dev/schemas/design-system-document/1",
  title: "Tokenshelf DesignSystemDocument",
  ...designSystemDocumentSchema,
};

export const designSystemDiagnosticDefinitions = [
  { code: "identity.name.required", title: "Name required", description: "Add a system name." },
  {
    code: "identity.summary.required",
    title: "Summary required",
    description: "Add a short system summary.",
  },
  {
    code: "principles.required",
    title: "Principles required",
    description: "Add at least one design principle.",
  },
  {
    code: "foundation.role.missing",
    title: "Foundation role missing",
    description: "Complete every required foundation role before publishing.",
  },
  {
    code: "foundation.value.invalid",
    title: "Foundation value invalid",
    description: "Use a supported literal value.",
  },
  {
    code: "font.reference.invalid",
    title: "Font reference invalid",
    description: "Use a declared font and complete, versioned Fontsource face descriptors.",
  },
  {
    code: "components.guidance.required",
    title: "Component guidance required",
    description: "Describe how components should use the foundations.",
  },
  {
    code: "accessibility.guidance.required",
    title: "Accessibility guidance required",
    description: "Describe accessible use of the system.",
  },
  {
    code: "accessibility.contrast.insufficient",
    title: "Text contrast insufficient",
    description: "Use foreground and background colors with at least 4.5:1 contrast.",
  },
  {
    code: "accessibility.focus-contrast.insufficient",
    title: "Focus contrast insufficient",
    description: "Use a focus indicator with at least 3:1 contrast against the canvas.",
  },
  {
    code: "provenance.source.recommended",
    title: "Source recommended",
    description: "Add a source when the work is derived.",
  },
  {
    code: "content.unsafe",
    title: "Unsafe content",
    description: "Remove control characters and Markdown or CSS fence delimiters.",
  },
  {
    code: "content.prompt-injection",
    title: "Prompt injection detected",
    description: "Remove instructions that attempt to override or redirect the consuming agent.",
  },
] as const;

export function createMinimalDesignSystemDocument(): DesignSystemDocument {
  return {
    version: "1",
    identity: { name: "Untitled system", summary: "", tags: [] },
    principles: [],
    foundations: {
      colors: {},
      typography: { fonts: [], roles: {} },
      spacing: {},
      radii: {},
      elevation: {},
    },
    components: {
      styles: {},
      actions: {
        radius: 0,
        defaultVariant: "",
        defaultSize: "",
        variants: [],
        sizes: [],
      },
      guidance: "",
    },
    accessibility: { guidance: "" },
    provenance: { sources: [] },
  };
}

export function assessDesignSystemDocument(document: DesignSystemDocument) {
  const diagnostics: Diagnostic[] = [];
  requiredText(
    document.identity.name,
    "/identity/name",
    "identity.name.required",
    "Add a system name.",
    diagnostics,
    60,
  );
  requiredText(
    document.identity.summary,
    "/identity/summary",
    "identity.summary.required",
    "Add a summary of at most 280 characters.",
    diagnostics,
    280,
  );
  if (document.principles.length === 0)
    diagnostics.push(
      error("principles.required", "Add at least one design principle.", "/principles"),
    );
  if (document.principles.length > 8)
    diagnostics.push(
      error("principles.required", "Use at most eight design principles.", "/principles"),
    );

  assessRoles(
    document.foundations.colors,
    colorRoles,
    "/foundations/colors",
    diagnostics,
    isHexColor,
  );
  assessRoles(
    document.foundations.spacing,
    spaceRoles,
    "/foundations/spacing",
    diagnostics,
    isBoundedLength,
  );
  assessRoles(
    document.foundations.radii,
    radiusRoles,
    "/foundations/radii",
    diagnostics,
    isBoundedLength,
  );
  if (document.foundations.controlHeight === undefined)
    diagnostics.push(
      error("foundation.role.missing", "Control height is required.", "/foundations/controlHeight"),
    );
  else if (!isBoundedLength(document.foundations.controlHeight))
    diagnostics.push(
      error(
        "foundation.value.invalid",
        "Control height must be between 0 and 256.",
        "/foundations/controlHeight",
      ),
    );
  assessRoles(
    document.foundations.elevation,
    elevationRoles,
    "/foundations/elevation",
    diagnostics,
    isShadow,
  );
  const fonts = document.foundations.typography.fonts;
  const fontsByKey = new Map(fonts.map((font) => [font.key, font]));
  if (!document.foundations.typography.defaultFont?.trim())
    diagnostics.push(
      error(
        "foundation.role.missing",
        "A default font is required.",
        "/foundations/typography/defaultFont",
      ),
    );
  else if (!fontsByKey.has(document.foundations.typography.defaultFont))
    diagnostics.push(
      error(
        "font.reference.invalid",
        "The default font must reference a declared font key.",
        "/foundations/typography/defaultFont",
      ),
    );
  const duplicateFontKeys = fonts.filter(
    (font, index) => fonts.findIndex(({ key }) => key === font.key) !== index,
  );
  duplicateFontKeys.forEach((font) =>
    diagnostics.push(
      error(
        "font.reference.invalid",
        `Font key ${font.key} is duplicated.`,
        "/foundations/typography/fonts",
      ),
    ),
  );
  fonts.forEach((font, fontIndex) => assessFont(font, fontIndex, diagnostics));
  for (const role of typographyRoles) {
    const style = document.foundations.typography.roles[role];
    const pointer = `/foundations/typography/roles/${role}`;
    if (!style) {
      diagnostics.push(
        error("foundation.role.missing", `Typography role ${role} is required.`, pointer),
      );
      continue;
    }
    if (
      style.size === undefined ||
      !isBoundedLength(style.size) ||
      !style.lineHeight ||
      style.lineHeight < 0.8 ||
      style.lineHeight > 2.5 ||
      !style.weight ||
      style.weight < 100 ||
      style.weight > 900
    ) {
      diagnostics.push(
        error(
          "foundation.value.invalid",
          `Typography role ${role} has unsupported values.`,
          pointer,
        ),
      );
    }
    if (style.font && !fontsByKey.has(style.font))
      diagnostics.push(
        error(
          "font.reference.invalid",
          `Typography role ${role} references an undeclared font.`,
          `${pointer}/font`,
        ),
      );
    if (style.stretch && !isFontStretch(style.stretch))
      diagnostics.push(
        error(
          "font.reference.invalid",
          "Font stretch must be a keyword or percentage.",
          `${pointer}/stretch`,
        ),
      );
    style.axes?.forEach((axis, axisIndex) => {
      if (!/^[A-Za-z0-9]{4}$/.test(axis.tag) || !Number.isFinite(axis.value))
        diagnostics.push(
          error(
            "font.reference.invalid",
            "Font axes need a four-character tag and finite value.",
            `${pointer}/axes/${axisIndex}`,
          ),
        );
      if (axis.tag.toLowerCase() === "wght")
        diagnostics.push(
          error(
            "font.reference.invalid",
            "Use the role weight field instead of a wght axis.",
            `${pointer}/axes/${axisIndex}/tag`,
          ),
        );
    });
    const roleFont = fontsByKey.get(
      style.font ?? document.foundations.typography.defaultFont ?? "",
    );
    if (
      roleFont?.source === "fontsource" &&
      !roleFont.faces.some((face) => faceSupportsStyle(face, style))
    )
      diagnostics.push(
        error(
          "font.reference.invalid",
          `Typography role ${role} is not supported by any declared face.`,
          pointer,
        ),
      );
  }
  assessRoles(
    document.components.styles,
    componentStyleRoles,
    "/components/styles",
    diagnostics,
    isHexColor,
  );
  assessActions(document.components.actions, diagnostics);
  assessContrast(document, diagnostics);
  requiredText(
    document.components.guidance,
    "/components/guidance",
    "components.guidance.required",
    "Add component guidance.",
    diagnostics,
    2_000,
  );
  requiredText(
    document.accessibility.guidance,
    "/accessibility/guidance",
    "accessibility.guidance.required",
    "Add accessibility guidance.",
    diagnostics,
    2_000,
  );
  if (document.provenance.sources.length === 0) {
    diagnostics.push({
      severity: "warning",
      code: "provenance.source.recommended",
      message: "Add a source when this work is derived.",
      pointer: "/provenance/sources",
    });
  }
  document.provenance.sources.forEach((source, index) => {
    if (source.url && !isHttpUrl(source.url))
      diagnostics.push(
        error(
          "foundation.value.invalid",
          "Source URL must use http or https.",
          `/provenance/sources/${index}/url`,
        ),
      );
  });
  for (const [pointer, value] of markdownTextFields(document)) {
    if (containsControlCharacters(value))
      diagnostics.push(
        error("content.unsafe", "Text must not contain control characters.", pointer),
      );
    if (containsPromptInjection(value))
      diagnostics.push(
        error(
          "content.prompt-injection",
          "Remove instructions that attempt to override or redirect the consuming agent.",
          pointer,
        ),
      );
  }
  for (const [pointer, value] of cssTextFields(document)) {
    if (!isSafeCssValue(value))
      diagnostics.push(
        error(
          "content.unsafe",
          "CSS values must not contain declarations, control characters, or code fences.",
          pointer,
        ),
      );
  }
  return {
    diagnostics,
    artifacts: { designMd: renderDesignMd(document), renderer: compileRendererIr(document) },
  };
}

export function renderDesignMd(document: DesignSystemDocument): string {
  const renderer = compileRendererIr(document);
  const lines = [
    "---",
    "version: alpha",
    `name: ${yamlString(document.identity.name)}`,
    "colors:",
    ...yamlEntries(
      [
        ["primary", renderer.colors.accent],
        ["primary-hover", renderer.colors["accent-hover"]],
        ["on-primary", renderer.colors["text-on-accent"]],
        ["background", renderer.colors.canvas],
        ["surface", renderer.colors.surface],
        ["surface-raised", renderer.colors["surface-raised"]],
        ["on-surface", renderer.colors.text],
        ["on-surface-muted", renderer.colors["text-muted"]],
        ["outline", renderer.colors.border],
        ["selection", renderer.colors.selection],
        ["success", renderer.colors.positive],
        ["warning", renderer.colors.caution],
        ["error", renderer.colors.negative],
      ],
      2,
    ),
    "typography:",
    ...typographyRoles.flatMap((role) => {
      const style = renderer.typography[role];
      return [
        `  ${role}:`,
        `    fontFamily: ${yamlString(style.authoredFamily)}`,
        `    fontSource: ${yamlString(fontSource(renderer.fonts.find(({ key }) => key === style.fontKey)))}`,
        `    fontSize: ${style.size}px`,
        `    fontWeight: ${style.weight}`,
        `    fontStyle: ${style.style}`,
        `    fontStretch: ${style.stretch}`,
        `    lineHeight: ${style.lineHeight}`,
        ...(style.axes.length
          ? [
              `    fontVariationSettings: ${yamlString(style.axes.map(({ tag, value }) => `"${tag}" ${value}`).join(", "))}`,
            ]
          : []),
      ];
    }),
    "rounded:",
    ...yamlEntries(
      [
        ["sm", dimension(renderer.geometry.radius.sm)],
        ["md", dimension(renderer.geometry.radius.md)],
        ["lg", dimension(renderer.geometry.radius.lg)],
        ["full", dimension(renderer.geometry.radius.round)],
      ],
      2,
      false,
    ),
    "spacing:",
    ...spaceRoles.map((role) => `  ${role}: ${dimension(renderer.geometry.space[role])}`),
    "components:",
    ...renderer.actions.variants.flatMap((variant) => renderActionVariantYaml(variant)),
    ...renderer.actions.sizes.flatMap((size) => [
      `  button-size-${size.key}:`,
      `    height: ${dimension(size.height)}`,
      `    paddingInline: ${dimension(size.paddingInline)}`,
      `    fontSize: ${dimension(size.fontSize)}`,
    ]),
    "  input:",
    `    backgroundColor: ${yamlString(renderer.componentStyles.fieldBackground)}`,
    `    textColor: ${yamlString(renderer.colors.text)}`,
    '    rounded: "{rounded.md}"',
    `    height: ${dimension(renderer.geometry.controlHeight)}`,
    "  card:",
    `    backgroundColor: ${yamlString(renderer.componentStyles.frameBackground)}`,
    `    textColor: ${yamlString(renderer.colors.text)}`,
    '    rounded: "{rounded.lg}"',
    "---",
    `# ${markdownText(document.identity.name)}`,
    "",
    "## Elevation & Depth",
    "",
    ...elevationRoles.map((role) => `- **${titleCase(role)}:** \`${renderer.elevation[role]}\``),
    "",
    "## Components",
    "",
    markdownText(document.components.guidance),
    "",
    "## Do's and Don'ts",
    "",
    ...document.principles.map((principle) => `- ${markdownText(principle)}`),
    `- ${markdownText(document.accessibility.guidance)}`,
  ];
  if (document.provenance.sources.length || document.provenance.license) {
    lines.push("", "## Provenance", "");
    document.provenance.sources.forEach((source) =>
      lines.push(
        source.url
          ? `- [${markdownText(source.name)}](${markdownLinkDestination(source.url)})`
          : `- ${markdownText(source.name)}`,
      ),
    );
    if (document.provenance.license)
      lines.push(`- License: ${markdownText(document.provenance.license)}`);
  }
  if (document.notes) lines.push("", "## Notes", "", markdownText(document.notes));
  return `${lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trimEnd()}\n`;
}

function renderActionVariantYaml(variant: ActionVariantDocument): string[] {
  return [
    `  button-${variant.key}:`,
    `    appearance: ${variant.appearance}`,
    ...(variant.decoration ? [`    textDecoration: ${variant.decoration}`] : []),
    ...(variant.decorationColor
      ? [`    textDecorationColor: ${yamlString(variant.decorationColor)}`]
      : []),
    ...renderActionStateYaml(variant),
    `  button-${variant.key}-hover:`,
    ...renderActionStateYaml(variant.hover),
    `  button-${variant.key}-disabled:`,
    ...renderActionStateYaml(variant.disabled),
  ];
}

function renderActionStateYaml(state: ActionStateDocument): string[] {
  return [
    ...(state.background ? [`    backgroundColor: ${yamlString(state.background)}`] : []),
    ...(state.foreground ? [`    textColor: ${yamlString(state.foreground)}`] : []),
    ...(state.border ? [`    borderColor: ${yamlString(state.border)}`] : []),
  ];
}

const rendererDefaults = {
  colors: Object.fromEntries(
    colorRoles.map((role) => [role, role.includes("text") ? "#171717" : "#ffffff"]),
  ) as Record<ColorRole, string>,
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 } as Record<SpaceRole, number>,
  radii: { sm: 4, md: 8, lg: 16, round: 256 } as Record<RadiusRole, number>,
  elevation: { resting: "none", floating: "none", overlay: "none", inset: "none" } as Record<
    ElevationRole,
    string
  >,
};

export function compileRendererIr(document: DesignSystemDocument): RendererIR {
  const fallbackFont: FontDocument = {
    key: "fallback",
    family: "Inter",
    source: "system",
    fallback: "sans-serif",
    faces: [],
  };
  const fonts = document.foundations.typography.fonts.length
    ? document.foundations.typography.fonts
    : [fallbackFont];
  const rendererFonts = fonts.map((font) => {
    const runtimeName = runtimeFontName(font);
    return { ...font, runtimeName, runtimeFamily: `"${runtimeName}", ${font.fallback}` };
  });
  const fontsByKey = new Map(rendererFonts.map((font) => [font.key, font]));
  const defaultFont =
    fontsByKey.get(document.foundations.typography.defaultFont ?? "") ?? rendererFonts[0];
  const typography = {} as Record<TypographyRole, TypeStyle>;
  for (const role of typographyRoles) {
    const source = document.foundations.typography.roles[role] ?? {};
    const roleFont = fontsByKey.get(source.font ?? "") ?? defaultFont;
    typography[role] = {
      fontKey: roleFont.key,
      size: source.size ?? (role === "display" ? 40 : role === "heading" ? 24 : 16),
      lineHeight: source.lineHeight ?? 1.4,
      weight: source.weight ?? (role === "heading" || role === "display" ? 700 : 400),
      style: source.style ?? "normal",
      stretch: source.stretch ?? "normal",
      axes: source.axes ?? [],
      authoredFamily: roleFont.family,
      runtimeFamily: roleFont.runtimeFamily,
    };
  }
  const colors = { ...rendererDefaults.colors, ...document.foundations.colors };
  const styles = document.components.styles;
  return {
    name: document.identity.name,
    summary: document.identity.summary,
    principles: document.principles,
    componentGuidance: document.components.guidance,
    accessibility: document.accessibility.guidance,
    hasSources: document.provenance.sources.length > 0,
    colors,
    fonts: rendererFonts,
    typography: {
      ...typography,
      authoredFamily: defaultFont.family,
      runtimeFamily: defaultFont.runtimeFamily,
    },
    geometry: {
      space: { ...rendererDefaults.spacing, ...document.foundations.spacing },
      radius: { ...rendererDefaults.radii, ...document.foundations.radii },
      controlHeight:
        document.foundations.controlHeight ?? Math.max(32, document.foundations.spacing.xl ?? 40),
    },
    elevation: { ...rendererDefaults.elevation, ...document.foundations.elevation },
    actions: structuredClone(document.components.actions),
    componentStyles: {
      focusRing: styles.focusRing ?? colors.accent,
      selectedBackground: styles.selectedBackground ?? colors.surface,
      selectedBorder: styles.selectedBorder ?? colors.border,
      informationBackground: styles.informationBackground ?? colors.surface,
      informationBorder: styles.informationBorder ?? colors.border,
      fieldBackground: styles.fieldBackground ?? colors.surface,
      fieldBorder: styles.fieldBorder ?? colors.border,
      frameBackground: styles.frameBackground ?? colors.surface,
      frameBorder: styles.frameBorder ?? colors.border,
    },
    treatments: {
      field: document.components.fieldTreatment ?? "outline",
      tabs: document.components.tabsTreatment ?? "segmented",
    },
  };
}

export function legacyDesignMdToDocument(
  source: string,
  tags: string[] = [],
  license?: string,
): DesignSystemDocument {
  const declarationEntries = [...source.matchAll(/^\s*(--[a-z0-9-]+):\s*(.+);$/gm)].map(
    (match) => [match[1], match[2]] as const,
  );
  const declarations = Object.fromEntries(declarationEntries);
  const name = /^# (.+)$/m.exec(source)?.[1]?.trim() ?? "Untitled system";
  const summary = source
    .slice(source.indexOf(`# ${name}`) + name.length + 2, source.indexOf("## Principles"))
    .trim();
  const section = (heading: string, next?: string) => {
    const start = source.indexOf(`## ${heading}`);
    if (start < 0) return "";
    const bodyStart = source.indexOf("\n", start) + 1;
    const end = next ? source.indexOf(`## ${next}`, bodyStart) : source.length;
    return source.slice(bodyStart, end < 0 ? source.length : end).trim();
  };
  const principles = section("Principles", "Foundations")
    .split("\n")
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);
  const guidanceBlock = section("Components", "Accessibility");
  const guidance = guidanceBlock
    .slice(guidanceBlock.indexOf("### Guidance") + "### Guidance".length)
    .trim();
  const sourceBlock = section("Sources", "Notes");
  const sources = [...sourceBlock.matchAll(/^- \[([^\]]+)]\((https?:\/\/[^)]+)\)$/gm)].map(
    (match) => ({ name: match[1], url: match[2] }),
  );
  const family = stripQuotes(declarations["--font-family"] ?? "Inter");
  const roleFamilies = Object.fromEntries(
    typographyRoles.map((role) => [
      role,
      declarations[`--font-${role}-family`]
        ? stripQuotes(declarations[`--font-${role}-family`])
        : family,
    ]),
  ) as Record<TypographyRole, string>;
  const families = [...new Set(Object.values(roleFamilies))];
  const fonts = families.map((fontFamily) => legacyFont(fontFamily));
  const fontKeyByFamily = new Map(fonts.map((font) => [font.family, font.key]));
  return {
    version: "1",
    identity: { name, summary, tags },
    principles,
    foundations: {
      colors: Object.fromEntries(
        colorRoles
          .map((role) => [role, declarations[`--color-${role}`]])
          .filter(([, value]) => value),
      ) as Partial<Record<ColorRole, string>>,
      typography: {
        fonts,
        defaultFont: fontKeyByFamily.get(family),
        roles: Object.fromEntries(
          typographyRoles.map((role) => [
            role,
            {
              ...(roleFamilies[role] !== family
                ? { font: fontKeyByFamily.get(roleFamilies[role]) }
                : {}),
              size: Number.parseFloat(declarations[`--font-${role}-size`]),
              lineHeight: Number.parseFloat(declarations[`--font-${role}-line-height`]),
              weight: Number.parseFloat(declarations[`--font-${role}-weight`]),
            },
          ]),
        ) as Record<TypographyRole, TypeStyleDocument>,
      },
      spacing: numericRoleMap(spaceRoles, declarations, "--space-"),
      radii: numericRoleMap(radiusRoles, declarations, "--radius-"),
      controlHeight: Number.parseFloat(declarations["--control-height"]),
      elevation: Object.fromEntries(
        elevationRoles
          .map((role) => [role, declarations[`--shadow-${role}`]])
          .filter(([, value]) => value),
      ) as Partial<Record<ElevationRole, string>>,
    },
    components: {
      styles: Object.fromEntries(
        componentStyleRoles
          .map((role) => [role, declarations[`--component-${camelToKebab(role)}`]])
          .filter(([, value]) => value),
      ) as Partial<Record<ComponentStyleRole, string>>,
      actions: legacyActions(declarations),
      guidance,
      ...(declarations["--component-field-treatment"]
        ? { fieldTreatment: declarations["--component-field-treatment"] as FieldTreatment }
        : {}),
      ...(declarations["--component-tabs-treatment"]
        ? { tabsTreatment: declarations["--component-tabs-treatment"] as TabsTreatment }
        : {}),
    },
    accessibility: {
      guidance: section(
        "Accessibility",
        source.includes("## Sources")
          ? "Sources"
          : source.includes("## Notes")
            ? "Notes"
            : undefined,
      ),
    },
    provenance: { sources, ...(license ? { license } : {}) },
    ...(section("Notes") ? { notes: section("Notes") } : {}),
  };
}

function legacyActions(declarations: Record<string, string>): ActionsDocument {
  const value = (name: string) => declarations[`--component-action-${name}`];
  const disabled = {
    background: value("disabled-background"),
    foreground: value("disabled-foreground"),
  };
  const controlHeight = Number.parseFloat(declarations["--control-height"]);
  const space = (role: SpaceRole) => Number.parseFloat(declarations[`--space-${role}`]);
  const typeSize = (role: TypographyRole) => Number.parseFloat(declarations[`--font-${role}-size`]);

  return {
    radius: Number.parseFloat(
      declarations[
        declarations["--component-action-treatment"] === "pill" ? "--radius-round" : "--radius-md"
      ],
    ),
    defaultVariant: "primary",
    defaultSize: "md",
    variants: [
      {
        key: "primary",
        appearance: "filled",
        background: value("background"),
        foreground: value("foreground"),
        hover: { background: value("background-hover") },
        disabled,
      },
      {
        key: "neutral",
        appearance: "filled",
        background: value("neutral-background"),
        foreground: value("neutral-foreground"),
        hover: { background: value("neutral-background-hover") },
        disabled,
      },
      {
        key: "ghost",
        appearance: "outlined",
        background: declarations["--component-frame-background"],
        foreground: declarations["--color-text"],
        border: value("border"),
        hover: { background: declarations["--component-selected-background"] },
        disabled,
      },
      {
        key: "soft",
        appearance: "filled",
        background: value("soft-background"),
        foreground: value("soft-foreground"),
        hover: { background: value("soft-background-hover") },
        disabled,
      },
      {
        key: "link",
        appearance: "text",
        decoration: "underline",
        decorationColor: value("border"),
        foreground: value("link-foreground"),
        hover: { foreground: value("link-foreground") },
        disabled: { foreground: value("disabled-foreground") },
      },
    ],
    sizes: [
      {
        key: "sm",
        height: Math.max(32, controlHeight - space("sm")),
        paddingInline: space("md"),
        fontSize: typeSize("label"),
      },
      {
        key: "md",
        height: controlHeight,
        paddingInline: space("md") + space("xs"),
        fontSize: Math.max(typeSize("label"), typeSize("body") - 1),
      },
      {
        key: "lg",
        height: controlHeight + space("md") - space("xs"),
        paddingInline: space("lg") + space("xs"),
        fontSize: typeSize("body"),
      },
    ],
  };
}

function assessContrast(document: DesignSystemDocument, diagnostics: Diagnostic[]) {
  const colors = document.foundations.colors;
  const styles = document.components.styles;
  const textPairs = [
    [colors.text, colors.canvas, "/foundations/colors/text", "Text on canvas"],
    [colors.text, colors.surface, "/foundations/colors/text", "Text on surface"],
    [colors["text-muted"], colors.canvas, "/foundations/colors/text-muted", "Muted text on canvas"],
    [
      colors["text-muted"],
      colors.surface,
      "/foundations/colors/text-muted",
      "Muted text on surface",
    ],
    [
      colors["text-on-accent"],
      colors.accent,
      "/foundations/colors/text-on-accent",
      "Text on accent",
    ],
    [
      colors["text-on-accent"],
      colors["accent-hover"],
      "/foundations/colors/text-on-accent",
      "Text on accent hover",
    ],
    [colors.text, styles.fieldBackground, "/components/styles/fieldBackground", "Text in fields"],
    [
      colors.text,
      styles.selectedBackground,
      "/components/styles/selectedBackground",
      "Text on selected surfaces",
    ],
  ] as const;

  textPairs.forEach(([foreground, background, pointer, label]) =>
    assessContrastPair(foreground, background, 4.5, pointer, label, diagnostics),
  );
  assessContrastPair(
    styles.focusRing,
    colors.canvas,
    3,
    "/components/styles/focusRing",
    "Focus ring on canvas",
    diagnostics,
    "accessibility.focus-contrast.insufficient",
  );

  document.components.actions.variants.forEach((variant, index) => {
    const backgrounds: ReadonlyArray<readonly [string | undefined, string]> =
      variant.appearance === "text"
        ? [
            [colors.canvas, "on canvas"],
            [colors.surface, "on surface"],
          ]
        : [[variant.background, ""]];
    backgrounds.forEach(([background, context]) => {
      const contextLabel = context ? ` ${context}` : "";
      assessContrastPair(
        variant.foreground,
        background,
        4.5,
        `/components/actions/variants/${index}`,
        `${titleCase(variant.key)} action text${contextLabel}`,
        diagnostics,
      );
      assessContrastPair(
        variant.hover.foreground ?? variant.foreground,
        variant.appearance === "text"
          ? background
          : (variant.hover.background ?? variant.background),
        4.5,
        `/components/actions/variants/${index}/hover`,
        `${titleCase(variant.key)} action hover text${contextLabel}`,
        diagnostics,
      );
    });
  });
}

function assessContrastPair(
  foreground: string | undefined,
  background: string | undefined,
  minimum: number,
  pointer: string,
  label: string,
  diagnostics: Diagnostic[],
  code = "accessibility.contrast.insufficient",
) {
  if (!foreground || !background || !isHexColor(foreground) || !isHexColor(background)) return;
  const ratio = contrastRatio(foreground, background);
  if (ratio >= minimum) return;
  const message = `${label} is ${ratio.toFixed(2)}:1. Use at least ${minimum.toFixed(1)}:1.`;
  if (minimum === 4.5 && ratio >= 3)
    diagnostics.push({ severity: "warning", code, message, pointer });
  else diagnostics.push(error(code, message, pointer));
}

function assessActions(actions: ActionsDocument, diagnostics: Diagnostic[]) {
  const variantKeys = new Set<string>();
  const sizeKeys = new Set<string>();

  if (!isBoundedLength(actions.radius))
    diagnostics.push(
      error(
        "foundation.value.invalid",
        "Action radius must be between 0 and 256.",
        "/components/actions/radius",
      ),
    );
  if (!actions.variants.length)
    diagnostics.push(
      error(
        "foundation.role.missing",
        "Add at least one action variant.",
        "/components/actions/variants",
      ),
    );
  actions.variants.forEach((variant, index) => {
    const pointer = `/components/actions/variants/${index}`;
    if (!/^[a-z][a-z0-9-]{0,31}$/.test(variant.key) || variantKeys.has(variant.key))
      diagnostics.push(
        error(
          "foundation.value.invalid",
          "Action variant keys must be unique lowercase slugs.",
          `${pointer}/key`,
        ),
      );
    variantKeys.add(variant.key);
    if (!variant.foreground)
      diagnostics.push(
        error(
          "foundation.role.missing",
          "Action variants require a foreground color.",
          `${pointer}/foreground`,
        ),
      );
    for (const [stateName, state] of [
      ["default", variant],
      ["hover", variant.hover],
      ["disabled", variant.disabled],
    ] as const)
      for (const [property, color] of Object.entries(state))
        if (
          ["background", "foreground", "border", "decorationColor"].includes(property) &&
          (typeof color !== "string" || !isHexColor(color))
        )
          diagnostics.push(
            error(
              "foundation.value.invalid",
              "Action colors must use six-digit hex values.",
              `${pointer}/${stateName}/${property}`,
            ),
          );
  });
  if (!variantKeys.has(actions.defaultVariant))
    diagnostics.push(
      error(
        "foundation.value.invalid",
        "The default action variant must reference a declared variant.",
        "/components/actions/defaultVariant",
      ),
    );

  if (!actions.sizes.length)
    diagnostics.push(
      error(
        "foundation.role.missing",
        "Add at least one action size.",
        "/components/actions/sizes",
      ),
    );
  actions.sizes.forEach((size, index) => {
    const pointer = `/components/actions/sizes/${index}`;
    if (!/^[a-z][a-z0-9-]{0,31}$/.test(size.key) || sizeKeys.has(size.key))
      diagnostics.push(
        error(
          "foundation.value.invalid",
          "Action size keys must be unique lowercase slugs.",
          `${pointer}/key`,
        ),
      );
    sizeKeys.add(size.key);
    for (const property of ["height", "paddingInline", "fontSize"] as const)
      if (!isBoundedLength(size[property]))
        diagnostics.push(
          error(
            "foundation.value.invalid",
            "Action dimensions must be between 0 and 256.",
            `${pointer}/${property}`,
          ),
        );
  });
  if (!sizeKeys.has(actions.defaultSize))
    diagnostics.push(
      error(
        "foundation.value.invalid",
        "The default action size must reference a declared size.",
        "/components/actions/defaultSize",
      ),
    );
}

function assessRoles<T extends string>(
  values: Partial<Record<T, string | number>>,
  roles: readonly T[],
  pointer: string,
  diagnostics: Diagnostic[],
  validate: (value: never) => boolean,
) {
  for (const role of roles) {
    const value = values[role];
    if (value === undefined)
      diagnostics.push(
        error("foundation.role.missing", `Role ${role} is required.`, `${pointer}/${role}`),
      );
    else if (!validate(value as never))
      diagnostics.push(
        error(
          "foundation.value.invalid",
          `Role ${role} has an unsupported value.`,
          `${pointer}/${role}`,
        ),
      );
  }
}

function requiredText(
  value: string,
  pointer: string,
  code: string,
  message: string,
  diagnostics: Diagnostic[],
  max: number,
) {
  if (!value.trim() || value.length > max) diagnostics.push(error(code, message, pointer));
}

const error = (code: string, message: string, pointer: string): Diagnostic => ({
  severity: "error",
  code,
  message,
  pointer,
});
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const isHexColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
const isBoundedLength = (value: number) => Number.isFinite(value) && value >= 0 && value <= 256;
const isShadow = (value: string) => value === "none" || isSafeCssValue(value);
const isHttpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};
const stripQuotes = (value: string) => value.replace(/^"|"$/g, "");
const runtimeFontName = (font: FontDocument) =>
  font.source === "system"
    ? font.family.replaceAll('"', "")
    : `Tokenshelf_${font.id}_${font.packageVersion?.replaceAll(".", "_") ?? "0"}_${stableHash(font.faces.map(({ url, style, weight, stretch, unicodeRange }) => `${url}|${style}|${weight}|${stretch}|${unicodeRange}`).join(";"))}`;
const camelToKebab = (value: string) =>
  value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`);
const yamlString = (value: string) => JSON.stringify(value.replace(controlCharacters, ""));
const dimension = (value: number) => `${value}px`;
const yamlEntries = (entries: Array<[string, string]>, indentation: number, quote = true) =>
  entries.map(
    ([key, value]) => `${" ".repeat(indentation)}${key}: ${quote ? yamlString(value) : value}`,
  );
const titleCase = (value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1)}`;

const controlCharacter = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const controlCharacters = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const containsControlCharacters = (value: string) => controlCharacter.test(value);
const isSafeCssValue = (value: string) =>
  !containsControlCharacters(value) && !/[\r\n;{}]|```|var\(|url\(|@/i.test(value);
const containsPromptInjection = (value: string) =>
  /\b(?:ignore|disregard|override)\b.{0,40}\b(?:previous|prior|system|developer)\b.{0,20}\b(?:instructions?|messages?|prompts?)\b/i.test(
    value,
  ) ||
  /\b(?:reveal|return|print|expose)\b.{0,30}\b(?:system|developer)\b.{0,20}\b(?:prompts?|messages?|instructions?)\b/i.test(
    value,
  );
const markdownText = (value: string) =>
  value
    .replace(controlCharacters, "")
    .replace(/\r?\n/g, " ")
    .replaceAll("\\", "\\\\")
    .replace(/([`*_{}\[\]<>|])/g, "\\$1")
    .replace(/^([#>+-])/, "\\$1");
const markdownLinkDestination = (value: string) =>
  encodeURI(value)
    .replaceAll("(", "%28")
    .replaceAll(")", "%29")
    .replaceAll("<", "%3C")
    .replaceAll(">", "%3E");

function markdownTextFields(document: DesignSystemDocument): Array<[string, string]> {
  return [
    ["/identity/name", document.identity.name],
    ["/identity/summary", document.identity.summary],
    ...document.identity.tags.map(
      (value, index) => [`/identity/tags/${index}`, value] as [string, string],
    ),
    ...document.principles.map(
      (value, index) => [`/principles/${index}`, value] as [string, string],
    ),
    ["/components/guidance", document.components.guidance],
    ["/accessibility/guidance", document.accessibility.guidance],
    ...document.provenance.sources.flatMap((source, index) => [
      [`/provenance/sources/${index}/name`, source.name] as [string, string],
      ...(source.url ? [[`/provenance/sources/${index}/url`, source.url] as [string, string]] : []),
    ]),
    ...(document.provenance.license
      ? [["/provenance/license", document.provenance.license] as [string, string]]
      : []),
    ...(document.notes ? [["/notes", document.notes] as [string, string]] : []),
  ];
}

function cssTextFields(document: DesignSystemDocument): Array<[string, string]> {
  return [
    ...document.foundations.typography.fonts.map(
      (font, index) =>
        [`/foundations/typography/fonts/${index}/family`, font.family] as [string, string],
    ),
    ...document.foundations.typography.fonts.flatMap((font, fontIndex) =>
      font.faces.flatMap((face, faceIndex) => [
        [`/foundations/typography/fonts/${fontIndex}/faces/${faceIndex}/weight`, face.weight] as [
          string,
          string,
        ],
        ...(face.stretch
          ? [
              [
                `/foundations/typography/fonts/${fontIndex}/faces/${faceIndex}/stretch`,
                face.stretch,
              ] as [string, string],
            ]
          : []),
        ...(face.unicodeRange
          ? [
              [
                `/foundations/typography/fonts/${fontIndex}/faces/${faceIndex}/unicodeRange`,
                face.unicodeRange,
              ] as [string, string],
            ]
          : []),
      ]),
    ),
    ...elevationRoles.flatMap((role) =>
      document.foundations.elevation[role]
        ? [
            [`/foundations/elevation/${role}`, document.foundations.elevation[role]!] as [
              string,
              string,
            ],
          ]
        : [],
    ),
  ];
}

function numericRoleMap<T extends string>(
  roles: readonly T[],
  declarations: Record<string, string>,
  prefix: string,
): Partial<Record<T, number>> {
  return Object.fromEntries(
    roles
      .map((role) => [role, Number.parseFloat(declarations[`${prefix}${role}`])])
      .filter(([, value]) => Number.isFinite(value)),
  ) as Partial<Record<T, number>>;
}

const legacyFontsourceIds: Record<string, string> = {
  Archivo: "archivo",
  Inter: "inter",
  "IBM Plex Sans": "ibm-plex-sans",
  "Noto Sans": "noto-sans",
  "Public Sans": "public-sans",
  "Roboto Condensed": "roboto-condensed",
  "Source Sans 3": "source-sans-3",
  "Space Grotesk": "space-grotesk",
  Manrope: "manrope",
  "Geist Mono": "geist-mono",
};

function legacyFont(family: string): FontDocument {
  const key =
    family
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "font";
  const id = legacyFontsourceIds[family];
  if (!id)
    return {
      key,
      family,
      source: "system",
      fallback: family === "Georgia" ? "serif" : "sans-serif",
      faces: [],
    };
  return {
    key,
    id,
    family,
    source: "fontsource",
    packageVersion: "5.3.0",
    fallback: family.includes("Mono") ? "monospace" : "sans-serif",
    faces: [
      {
        url: `https://cdn.jsdelivr.net/fontsource/fonts/${id}:vf@5.3.0/latin-wght-normal.woff2`,
        style: "normal",
        weight: "100 900",
      },
    ],
  };
}

function assessFont(font: FontDocument, index: number, diagnostics: Diagnostic[]) {
  const pointer = `/foundations/typography/fonts/${index}`;
  if (!/^[a-z][a-z0-9-]{0,31}$/.test(font.key))
    diagnostics.push(
      error("font.reference.invalid", "Font keys must be lowercase slugs.", `${pointer}/key`),
    );
  if (!/^[\p{L}\p{N} .'-]+$/u.test(font.family))
    diagnostics.push(
      error(
        "font.reference.invalid",
        "Font family names may contain letters, numbers, spaces, periods, apostrophes, and hyphens.",
        `${pointer}/family`,
      ),
    );
  if (font.source === "system") {
    if (font.faces.length)
      diagnostics.push(
        error(
          "font.reference.invalid",
          "System fonts cannot include remote faces.",
          `${pointer}/faces`,
        ),
      );
    return;
  }
  if (!font.id || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(font.id))
    diagnostics.push(
      error(
        "font.reference.invalid",
        "Fontsource fonts require their Fontsource ID.",
        `${pointer}/id`,
      ),
    );
  if (!font.packageVersion || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(font.packageVersion))
    diagnostics.push(
      error(
        "font.reference.invalid",
        "Fontsource fonts require an exact package version.",
        `${pointer}/packageVersion`,
      ),
    );
  if (!font.faces.length)
    diagnostics.push(
      error(
        "font.reference.invalid",
        "Fontsource fonts require at least one WOFF2 face.",
        `${pointer}/faces`,
      ),
    );
  font.faces.forEach((face, faceIndex) => {
    const facePointer = `${pointer}/faces/${faceIndex}`;
    if (!isFontsourceFace(face, font))
      diagnostics.push(
        error(
          "font.reference.invalid",
          "The Fontsource URL must match the declared ID, version, style, and weight profile.",
          `${facePointer}/url`,
        ),
      );
    if (!isFontWeight(face.weight))
      diagnostics.push(
        error(
          "font.reference.invalid",
          "Font weight must be one number or an ascending range from 1 to 1000.",
          `${facePointer}/weight`,
        ),
      );
    if (face.stretch && !isFontStretch(face.stretch, true))
      diagnostics.push(
        error(
          "font.reference.invalid",
          "Font stretch must be a keyword, percentage, or ascending percentage range.",
          `${facePointer}/stretch`,
        ),
      );
    if (face.unicodeRange && !isUnicodeRange(face.unicodeRange))
      diagnostics.push(
        error(
          "font.reference.invalid",
          "Unicode range must contain only U+ ranges.",
          `${facePointer}/unicodeRange`,
        ),
      );
  });
}

function isFontsourceFace(face: FontFaceDocument, font: FontDocument) {
  try {
    const url = new URL(face.url);
    const path =
      /^\/fontsource\/fonts\/([a-z0-9-]+)(?::([a-z0-9-]+))?@([^/]+)\/([a-z0-9-]+)\.woff2$/.exec(
        url.pathname,
      );
    if (
      !path ||
      path[1] !== font.id ||
      path[3] !== font.packageVersion ||
      !path[4].endsWith(`-${face.style}`)
    )
      return false;
    const profile = path[2];
    const filename = path[4];
    const weights = fontWeights(face.weight);
    const weightMatches =
      weights.length === 1
        ? filename.endsWith(`-${weights[0]}-${face.style}`) || Boolean(profile)
        : Boolean(profile) && (filename.includes("-wght-") || filename.includes("-full-"));
    return (
      url.origin === "https://cdn.jsdelivr.net" &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash &&
      weightMatches
    );
  } catch {
    return false;
  }
}

function isFontWeight(value: string) {
  const weights = fontWeights(value);
  return (
    weights.length >= 1 &&
    weights.length <= 2 &&
    weights.every((weight) => Number.isInteger(weight) && weight >= 1 && weight <= 1000) &&
    (weights.length === 1 || weights[0] <= weights[1])
  );
}

const fontWeights = (value: string) => value.trim().split(/\s+/).map(Number);
const isUnicodeRange = (value: string) =>
  value.split(",").every((range) => {
    const match = /^\s*U\+([0-9A-F?]{1,6})(?:-([0-9A-F]{1,6}))?\s*$/i.exec(range);
    if (!match || (match[1].includes("?") && (!/^([0-9A-F]+)?\?+$/i.test(match[1]) || match[2])))
      return false;
    const start = Number.parseInt(match[1].replaceAll("?", "0"), 16);
    const end = Number.parseInt((match[2] ?? match[1]).replaceAll("?", "F"), 16);
    return start <= end && end <= 0x10ffff;
  });
const isFontStretch = (value: string, allowRange = false) => {
  if (
    /^(normal|ultra-condensed|extra-condensed|condensed|semi-condensed|semi-expanded|expanded|extra-expanded|ultra-expanded)$/.test(
      value,
    )
  )
    return true;
  const percentages = value
    .trim()
    .split(/\s+/)
    .map((entry) => (/^\d+(?:\.\d+)?%$/.test(entry) ? Number.parseFloat(entry) : Number.NaN));
  return (
    percentages.length >= 1 &&
    percentages.length <= (allowRange ? 2 : 1) &&
    percentages.every((entry) => Number.isFinite(entry) && entry > 0) &&
    (percentages.length === 1 || percentages[0] <= percentages[1])
  );
};
const fontSource = (font?: RendererFont) =>
  font?.source === "fontsource" ? `fontsource:${font.id}@${font.packageVersion}` : "system";
const stableHash = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1)
    hash = Math.imul(hash ^ value.charCodeAt(index), 16777619);
  return (hash >>> 0).toString(36);
};

function faceSupportsStyle(face: FontFaceDocument, style: TypeStyleDocument) {
  if ((style.style ?? "normal") !== face.style) return false;
  const [minimumWeight, maximumWeight = minimumWeight] = fontWeights(face.weight);
  const weight = style.weight ?? 400;
  if (weight < minimumWeight || weight > maximumWeight) return false;
  if (style.stretch && !stretchContains(face.stretch ?? "normal", style.stretch)) return false;
  if (!style.axes?.length) return true;
  const filename = new URL(face.url).pathname.split("/").at(-1) ?? "";
  return style.axes.every(
    ({ tag }) => filename.includes("-full-") || filename.includes(`-${tag.toLowerCase()}-`),
  );
}

function stretchContains(faceStretch: string, roleStretch: string) {
  if (faceStretch === roleStretch || faceStretch === "normal") return faceStretch === roleStretch;
  const [minimum, maximum = minimum] = faceStretch.split(/\s+/).map(Number.parseFloat);
  const requested = Number.parseFloat(roleStretch);
  return Number.isFinite(requested) && requested >= minimum && requested <= maximum;
}
