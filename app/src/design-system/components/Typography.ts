export type TypographyStyle =
  | "eyebrow"
  | "metaLabel"
  | "pageTitle"
  | "pageLede"
  | "sectionTitle"
  | "featureTitle"
  | "cardTitle";

export const typographyClassNames: Record<TypographyStyle, string> = {
  eyebrow: "eyebrow",
  metaLabel: "meta-label",
  pageTitle: "page-title",
  pageLede: "page-lede",
  sectionTitle: "section-title",
  featureTitle: "feature-title",
  cardTitle: "card-title",
};

export function typographyClassName(style: TypographyStyle, className = "") {
  return `${typographyClassNames[style]} ${className}`;
}
