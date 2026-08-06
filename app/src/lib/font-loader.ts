import type { FontFaceDocument, RendererFont } from "../domain/design-system";

const maxConcurrentLoads = 3;
const loads = new Map<string, Promise<void>>();
const queue: Array<() => void> = [];
let activeLoads = 0;

export function loadRendererFonts(fonts: RendererFont[]) {
  return Promise.all(
    fonts.flatMap((font) =>
      font.source === "fontsource" ? font.faces.map((face) => loadFace(font, face)) : [],
    ),
  ).then(() => undefined);
}

export function rendererFontKey(fonts: RendererFont[]) {
  return fonts.flatMap((font) => font.faces.map((face) => fontFaceKey(font, face))).join(";");
}

function loadFace(font: RendererFont, face: FontFaceDocument) {
  const key = fontFaceKey(font, face);
  const existing = loads.get(key);
  if (existing) return existing;

  const load = new Promise<void>((resolve, reject) => {
    queue.push(() => {
      try {
        const descriptors: FontFaceDescriptors = {
          display: "swap",
          style: face.style,
          weight: face.weight,
          ...(face.stretch ? { stretch: face.stretch } : {}),
          ...(face.unicodeRange ? { unicodeRange: face.unicodeRange } : {}),
        };
        const fontFace = new FontFace(
          font.runtimeName,
          `url("${face.url}") format("woff2")`,
          descriptors,
        );
        fontFace
          .load()
          .then((loadedFace) => {
            document.fonts.add(loadedFace);
            resolve();
          })
          .catch((error) => {
            loads.delete(key);
            reject(error);
          })
          .finally(finishLoad);
      } catch (error) {
        loads.delete(key);
        reject(error);
        finishLoad();
      }
    });
  });
  loads.set(key, load);
  runQueue();
  return load;
}

const fontFaceKey = (font: RendererFont, face: FontFaceDocument) =>
  `${font.runtimeName}|${face.url}|${face.style}|${face.weight}|${face.stretch ?? ""}|${face.unicodeRange ?? ""}`;

function finishLoad() {
  activeLoads -= 1;
  runQueue();
}

function runQueue() {
  while (activeLoads < maxConcurrentLoads && queue.length) {
    activeLoads += 1;
    queue.shift()?.();
  }
}
