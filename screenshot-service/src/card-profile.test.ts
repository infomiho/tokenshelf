import { describe, expect, it } from "vitest";
import { systemCardProfile as appProfile } from "../../app/src/screenshots/contracts.ts";
import { systemCardProfile as workerProfile } from "./card-profile.js";

describe("system card profile", () => {
  it("matches the app capture contract", () => {
    expect({
      id: workerProfile.id,
      capturePath: workerProfile.capturePath,
      width: workerProfile.viewport.width,
      height: workerProfile.viewport.height,
      scale: workerProfile.deviceScaleFactor,
    }).toEqual({
      id: appProfile.id,
      capturePath: appProfile.capturePath,
      width: appProfile.width,
      height: appProfile.height,
      scale: appProfile.scale,
    });
  });
});
