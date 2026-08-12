import type { SystemCardCaptureDataApi } from "wasp/server/api";
import type { PreviewRenderer } from "../data/catalog";
import { verifyCaptureToken } from "./capture-token";

export const systemCardCaptureDataApi: SystemCardCaptureDataApi = async (req, res, context) => {
  const token = typeof req.query.token === "string" ? req.query.token : "";
  const payload = verifyCaptureToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid or expired capture token." });

  const system = await context.entities.DesignSystem.findFirst({
    where: {
      id: payload.designSystemId,
      sourceRevision: payload.sourceRevision,
      lifecycle: "PUBLISHED",
    },
    select: { renderer: true },
  });
  if (!system) return res.status(404).json({ error: "Published system revision not found." });

  res.set("Cache-Control", "no-store");
  res.set("Referrer-Policy", "no-referrer");
  return res.json({ renderer: system.renderer as PreviewRenderer });
};
