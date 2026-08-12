import type { Prisma } from "@prisma/client";
import { systemCardOutputSize, systemCardRenderVersion, type CardScreenshot } from "./contracts";

export const cardImageSelection = {
  cardImageKey: true,
  cardImageRenderVersion: true,
  cardImageCanvas: true,
} as const;

type StoredCardImage = {
  cardImageKey: string | null;
  cardImageRenderVersion: string | null;
  cardImageCanvas: string | null;
};

type CurrentCardImage = {
  cardImageKey: string;
  cardImageRenderVersion: typeof systemCardRenderVersion;
  cardImageCanvas: string;
};

export const staleCardImageWhere: Prisma.DesignSystemWhereInput = {
  OR: [
    { cardImageKey: null },
    { cardImageRenderVersion: null },
    { cardImageRenderVersion: { not: systemCardRenderVersion } },
    { cardImageCanvas: null },
  ],
};

export const invalidateCardImage = {
  cardImageKey: null,
  cardImageRenderVersion: null,
  cardImageCanvas: null,
} satisfies Prisma.DesignSystemUpdateInput;

export function isCurrentCardImage(image: StoredCardImage): image is CurrentCardImage {
  return Boolean(
    image.cardImageKey &&
    image.cardImageRenderVersion === systemCardRenderVersion &&
    image.cardImageCanvas,
  );
}

export function cardImageCommit(key: string, canvas: string) {
  return {
    cardImageKey: key,
    cardImageRenderVersion: systemCardRenderVersion,
    cardImageCanvas: canvas,
  } satisfies Prisma.DesignSystemUpdateInput;
}

export function toCardScreenshot(image: StoredCardImage): CardScreenshot | null {
  if (!isCurrentCardImage(image)) return null;
  const baseUrl = (
    process.env.SCREENSHOT_PUBLIC_BASE_URL ?? "http://localhost:9000/tokenshelf-public"
  ).replace(/\/$/, "");
  return {
    url: `${baseUrl}/${image.cardImageKey}`,
    ...systemCardOutputSize,
    canvas: image.cardImageCanvas,
  };
}

export function rendererCanvas(value: unknown): string {
  const canvas = (value as { colors?: { canvas?: unknown } })?.colors?.canvas;
  if (typeof canvas !== "string" || !canvas) throw new Error("Renderer canvas is invalid.");
  return canvas;
}
