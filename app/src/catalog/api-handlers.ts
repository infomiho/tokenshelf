import type {
  SearchSystemsApi,
  ServeDesignDocumentApi,
  ServeDesignMdApi,
  ServeDesignSystemSchemaApi,
} from "wasp/server/api";
import { createCatalogApiHandlers } from "./api";
import { catalogService } from "./persistence";

const handlers = createCatalogApiHandlers(catalogService);

export const searchSystemsApi: SearchSystemsApi = (req, res) => handlers.search(req, res);
export const serveDesignMdApi: ServeDesignMdApi = (req, res) => handlers.designMd(req, res);
export const serveDesignDocumentApi: ServeDesignDocumentApi = (req, res) =>
  handlers.document(req, res);
export const serveDesignSystemSchemaApi: ServeDesignSystemSchemaApi = (req, res) =>
  handlers.schema(req, res);
