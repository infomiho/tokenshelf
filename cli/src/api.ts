import ky from "ky";
import type { CliApi, SearchInput } from "./run.js";

export function createApi(serverUrl: string): CliApi {
  const client = ky.create({ prefix: serverUrl.replace(/\/$/, ""), retry: 0 });

  return {
    search(input: SearchInput) {
      return client
        .get("v1/systems", {
          searchParams: {
            q: input.query,
            sort: input.sort,
            limit: input.limit,
          },
        })
        .json();
    },
    getDesignMd(slug: string) {
      return client.get(`v1/systems/${encodeURIComponent(slug)}/DESIGN.md`).text();
    },
    getSchema() {
      return client.get("v1/schemas/design-system-document/1").json();
    },
  };
}
