import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const sourceRoot = join(process.cwd(), "src");
const ignoredFiles = new Set(["SystemComponentSpecimen.tsx", "SystemPreview.css"]);
const forbiddenPatterns = [
  /\b(?:text|bg)-red-\d+\b/,
  /\bmin-h-(?:9|10|11|12)\b/,
  /\bh-\[var\(--control-height\)\]/,
  /\brounded-\[3px\]/,
  /\bmax-w-\[1440px\]/,
  /components\/ui\//,
];

function sourceFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory() && entry.name === "design-system") return [];
    if (entry.isDirectory()) return sourceFiles(path);
    if (![".ts", ".tsx", ".css"].includes(extname(entry.name))) return [];
    if (entry.name.includes(".stories.") || entry.name.includes(".test.")) return [];
    if (ignoredFiles.has(entry.name)) return [];
    return [path];
  });
}

describe("design-system boundaries", () => {
  it("keeps reusable visual contracts out of feature code", () => {
    const violations = sourceFiles(sourceRoot).flatMap((path) => {
      const source = readFileSync(path, "utf8");
      return forbiddenPatterns
        .filter((pattern) => pattern.test(source))
        .map((pattern) => `${relative(process.cwd(), path)}: ${pattern.source}`);
    });

    expect(violations).toEqual([]);
  });
});
