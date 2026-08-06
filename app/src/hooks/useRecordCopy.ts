import { useQueryClient } from "@tanstack/react-query";
import { api } from "wasp/client/api";
import { getCatalogHome, getSystem, getUserProfile, listSystems } from "wasp/client/operations";

type RecordCopyResponse = {
  counted: boolean;
};

const queriesWithCopyCounts = [getCatalogHome, listSystems, getSystem, getUserProfile] as const;

export function useRecordCopy() {
  const queryClient = useQueryClient();

  return async function recordCopy(slug: string): Promise<void> {
    try {
      const { counted } = await api
        .post("/api/systems/copy", { json: { slug } })
        .json<RecordCopyResponse>();

      if (!counted) return;

      await Promise.all(
        queriesWithCopyCounts.map((query) =>
          queryClient.invalidateQueries({ queryKey: query.queryCacheKey }),
        ),
      );
    } catch (error) {
      // Clipboard success must not depend on analytics availability.
      console.warn("Copy analytics failed.", error);
    }
  };
}
