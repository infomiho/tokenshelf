import type { ServeDesignMd } from "wasp/server/api";

export const serveDesignMd: ServeDesignMd<{ systemId: string }, string> = async (
  req,
  res,
  context,
) => {
  const systemId = typeof req.params.systemId === "string" ? req.params.systemId : "";
  const system = await context.entities.DesignSystem.findFirst({
    where: { OR: [{ id: systemId }, { slug: systemId }], lifecycle: "PUBLISHED" },
    select: { designMd: true },
  });

  if (!system) {
    res.status(404).type("text/plain").send("Design system not found.");
    return;
  }

  res
    .status(200)
    .set("Cache-Control", "public, max-age=300, s-maxage=3600")
    .set("Content-Disposition", 'inline; filename="DESIGN.md"')
    .type("text/markdown")
    .send(system.designMd);
};
