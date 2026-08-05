import { beforeEach, describe, expect, it, vi } from "vitest";
import type { RendererFont } from "../data/design-document";
import { loadRendererFonts } from "./font-loader";

const add = vi.fn();
const construct = vi.fn();

class MockFontFace {
  constructor(
    public family: string,
    public source: string,
    public descriptors: FontFaceDescriptors,
  ) {
    construct(family, source, descriptors);
  }

  load() {
    return Promise.resolve(this);
  }
}

describe("font loader", () => {
  beforeEach(() => {
    add.mockClear();
    construct.mockClear();
    vi.stubGlobal("FontFace", MockFontFace);
    vi.stubGlobal("document", { fonts: { add } });
  });

  it("deduplicates exact faces and keeps their loading descriptors", async () => {
    const font = testFont("deduplicated");

    await Promise.all([loadRendererFonts([font]), loadRendererFonts([font])]);

    expect(construct).toHaveBeenCalledOnce();
    expect(construct).toHaveBeenCalledWith(
      font.runtimeName,
      `url("${font.faces[0].url}") format("woff2")`,
      expect.objectContaining({
        style: "italic",
        weight: "100 900",
        stretch: "75% 125%",
        unicodeRange: "U+0000-00FF",
      }),
    );
    expect(add).toHaveBeenCalledOnce();
  });

  it("allows a failed face to be retried", async () => {
    let attempts = 0;
    class FailOnceFontFace extends MockFontFace {
      override load() {
        attempts += 1;
        return attempts === 1 ? Promise.reject(new Error("network")) : Promise.resolve(this);
      }
    }
    vi.stubGlobal("FontFace", FailOnceFontFace);
    const font = testFont("retry");

    await expect(loadRendererFonts([font])).rejects.toThrow("network");
    await expect(loadRendererFonts([font])).resolves.toBeUndefined();
    expect(construct).toHaveBeenCalledTimes(2);
  });

  it("releases the queue when FontFace construction fails", async () => {
    let attempts = 0;
    class ThrowOnceFontFace {
      constructor() {
        attempts += 1;
        if (attempts === 1) throw new Error("descriptor");
      }

      load() {
        return Promise.resolve(this);
      }
    }
    vi.stubGlobal("FontFace", ThrowOnceFontFace);
    const font = testFont("constructor-retry");

    await expect(loadRendererFonts([font])).rejects.toThrow("descriptor");
    await expect(loadRendererFonts([font])).resolves.toBeUndefined();
    expect(attempts).toBe(2);
  });
});

function testFont(suffix: string): RendererFont {
  return {
    key: `test-${suffix}`,
    family: "Test Font",
    source: "fontsource",
    packageVersion: "5.3.0",
    fallback: "sans-serif",
    runtimeName: `Tokenshelf_test_font_${suffix}`,
    runtimeFamily: `"Tokenshelf_test_font_${suffix}", sans-serif`,
    faces: [
      {
        url: `https://cdn.jsdelivr.net/fontsource/fonts/test-${suffix}:vf@5.3.0/latin-wght-italic.woff2`,
        style: "italic",
        weight: "100 900",
        stretch: "75% 125%",
        unicodeRange: "U+0000-00FF",
      },
    ],
  };
}
