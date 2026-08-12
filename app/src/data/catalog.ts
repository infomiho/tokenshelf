import type { DesignSystemDocument, RendererIR } from "../domain/design-system";
import type { CardScreenshot } from "../screenshots/contracts";

export type PreviewRenderer = Pick<
  RendererIR,
  | "name"
  | "colors"
  | "fonts"
  | "typography"
  | "geometry"
  | "elevation"
  | "componentStyles"
  | "actions"
  | "treatments"
>;

export type Inspiration = {
  company: string;
  system: string;
  docsUrl: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
};

export type SystemAuthor = {
  name: string;
  username?: string;
  avatarUrl?: string;
};

export type DesignSystem = {
  id: string;
  databaseId?: string;
  name: string;
  description: string;
  tags: string[];
  copies: number;
  todayCopies: number;
  votes: number;
  voted?: boolean;
  pickedOn?: string;
  publishedAt?: Date | string;
  author?: SystemAuthor;
  inspiration?: Inspiration;
  designMd: string;
  document: DesignSystemDocument;
  renderer: RendererIR;
};

export type SystemCardData = Pick<
  DesignSystem,
  | "id"
  | "databaseId"
  | "name"
  | "description"
  | "tags"
  | "copies"
  | "todayCopies"
  | "votes"
  | "pickedOn"
  | "publishedAt"
> & {
  databaseId: string;
  screenshot: CardScreenshot | null;
};

export type FeaturedSystemData = SystemCardData & {
  renderer: PreviewRenderer;
};

export type TagSuggestion = { label: string; count: number };
