import { describe, expect, it } from "vitest";
import { passedPublicationChecks } from "../data/submissions";
import {
  formatValidationLocation,
  formatValidationMessage,
  groupValidationChecks,
} from "./validation-checks";

describe("validation checks", () => {
  it("names each publication gate that passed", () => {
    expect(groupValidationChecks(passedPublicationChecks).map(({ label }) => label)).toEqual([
      "Document structure",
      "Color contrast",
      "Typography and fonts",
      "Components and actions",
      "Content safety",
      "Source details",
    ]);
  });

  it("groups diagnostics by the correction people need to make", () => {
    const groups = groupValidationChecks([
      {
        id: "font:0",
        label: "font.reference.invalid",
        detail: "Fontsource ID required.",
        pointer: "/fonts/0/id",
        status: "fail",
      },
      {
        id: "font:1",
        label: "font.reference.invalid",
        detail: "Fontsource URL invalid.",
        pointer: "/fonts/0/faces/0/url",
        status: "fail",
      },
    ]);

    expect(groups).toHaveLength(2);
    expect(groups.map(({ label }) => label)).toEqual(["Add Fontsource ID", "Fix Fontsource URLs"]);
    expect(groups.flatMap(({ checks }) => checks.map(({ pointer }) => pointer))).toEqual([
      "/fonts/0/id",
      "/fonts/0/faces/0/url",
    ]);
    expect(groups.map(({ checks }) => formatValidationMessage(checks[0]))).toEqual([
      "Identify the matching Fontsource family.",
      "Use files from the selected Fontsource package and version.",
    ]);
  });

  it("formats JSON pointers for people", () => {
    expect(formatValidationLocation("/foundations/radii/round")).toBe("Round radius");
    expect(formatValidationLocation("/foundations/typography/fonts/0/id")).toBe("Font 1 ID");
    expect(formatValidationLocation("/foundations/typography/fonts/0/faces/1/url")).toBe(
      "Font 1 · Face 2 URL",
    );
  });

  it("turns generic validation output into an instruction", () => {
    const check = {
      id: "radius",
      label: "foundation.value.invalid",
      detail: "Role round has an unsupported value.",
      pointer: "/foundations/radii/round",
      status: "fail" as const,
    };

    expect(groupValidationChecks([check])[0].label).toBe("Fix round radius");
    expect(formatValidationMessage(check)).toBe("Use a radius from 0 to 256 px.");
  });
});
