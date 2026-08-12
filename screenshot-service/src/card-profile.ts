export const systemCardProfile = {
  id: "card-v2",
  capturePath: "/internal/system-card-capture/",
  viewport: { width: 362, height: 204 },
  deviceScaleFactor: 2,
  targetSelector: "[data-screenshot-target]",
  readySelector: '.system-preview:is([data-font-status="loaded"], [data-font-status="failed"])',
} as const;
