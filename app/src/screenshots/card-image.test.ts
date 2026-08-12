import { afterEach, describe, expect, it } from "vitest";
import { isCurrentCardImage, rendererCanvas, toCardScreenshot } from "./card-image";

const storedImage = {
  cardImageKey: "public/systems/system-id/cards/r1/card-v2.webp",
  cardImageRenderVersion: "card-v2",
  cardImageCanvas: "#0a0a0b",
};

afterEach(() => delete process.env.SCREENSHOT_PUBLIC_BASE_URL);

describe("card image", () => {
  it("projects current metadata into a catalog image", () => {
    process.env.SCREENSHOT_PUBLIC_BASE_URL = "https://assets.example.com/";

    expect(toCardScreenshot(storedImage)).toEqual({
      url: "https://assets.example.com/public/systems/system-id/cards/r1/card-v2.webp",
      width: 724,
      height: 408,
      canvas: "#0a0a0b",
    });
  });

  it("rejects incomplete or obsolete metadata", () => {
    expect(isCurrentCardImage({ ...storedImage, cardImageCanvas: null })).toBe(false);
    expect(toCardScreenshot({ ...storedImage, cardImageRenderVersion: "card-v1" })).toBeNull();
  });

  it("validates the renderer canvas at the storage seam", () => {
    expect(rendererCanvas({ colors: { canvas: "#fff" } })).toBe("#fff");
    expect(() => rendererCanvas({ colors: {} })).toThrow("Renderer canvas is invalid");
  });
});
