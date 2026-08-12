import type { PreviewRenderer } from "../data/catalog";

export const systemCardProfile = {
  id: "card-v2",
  capturePath: "/internal/system-card-capture/",
  dataPath: "/internal/system-card-capture/data",
  width: 362,
  height: 204,
  scale: 2,
} as const;

export const systemCardRenderVersion = systemCardProfile.id;
export const systemCardOutputSize = {
  width: systemCardProfile.width * systemCardProfile.scale,
  height: systemCardProfile.height * systemCardProfile.scale,
} as const;

export type CaptureTokenPayload = {
  designSystemId: string;
  sourceRevision: number;
  expiresAt: number;
};

export type CaptureData = {
  renderer: PreviewRenderer;
};

export type CardScreenshot = {
  url: string;
  width: typeof systemCardOutputSize.width;
  height: typeof systemCardOutputSize.height;
  canvas: string;
};
