import type { Request, Response } from "express";
import { designSystemDocumentJsonSchema } from "../domain/design-system";
import type { CatalogService, CatalogSort } from "./service";

const routeParameter = (value: string | string[] | undefined) =>
  Array.isArray(value) ? (value[0] ?? "") : (value ?? "");

export function createCatalogApiHandlers(catalog: CatalogService) {
  const search = async (req: Request, res: Response) => {
    const query = typeof req.query.q === "string" ? req.query.q : undefined;
    const sort: CatalogSort = req.query.sort === "new" ? "new" : "hot";
    const parsedLimit = typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;
    const limit = Number.isSafeInteger(parsedLimit) ? parsedLimit : undefined;
    const result = await catalog.search({ query, sort, limit });
    res.set("Cache-Control", "no-store").status(200).json(result);
  };

  const designMd = async (req: Request, res: Response) => {
    const system = await catalog.get(routeParameter(req.params.slug));
    if (!system) {
      res.status(404).type("text/plain").send("Design system not found.");
      return;
    }
    res
      .set("Cache-Control", "no-store")
      .set("Content-Disposition", 'inline; filename="DESIGN.md"')
      .status(200)
      .type("text/markdown")
      .send(system.designMd);
  };

  const document = async (req: Request, res: Response) => {
    const system = await catalog.get(routeParameter(req.params.slug));
    if (!system) {
      res.status(404).json({ error: "Design system not found." });
      return;
    }
    res.set("Cache-Control", "no-store").status(200).json(system.document);
  };

  const schema = (_req: Request, res: Response) => {
    res
      .set("Cache-Control", "public, max-age=300, s-maxage=3600")
      .status(200)
      .json(designSystemDocumentJsonSchema);
  };

  return { search, designMd, document, schema };
}
