import type { DesignDocument, RendererIR } from "./design-document";

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
  document: DesignDocument;
  renderer: RendererIR;
};

export const vibeOptions = [
  "All",
  "Enterprise",
  "Developer tools",
  "Data",
  "Commerce",
  "Friendly",
  "Minimal",
] as const;
export type Vibe = (typeof vibeOptions)[number];
