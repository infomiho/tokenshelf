import { describe, expect, it, vi } from "vitest";
import { retrySerializationConflict } from "./serialization";

describe("retrySerializationConflict", () => {
  it("retries one serialization conflict", async () => {
    const run = vi.fn().mockRejectedValueOnce({ code: "P2034" }).mockResolvedValue("committed");

    await expect(retrySerializationConflict(run)).resolves.toBe("committed");
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("does not retry other failures", async () => {
    const failure = new Error("Database unavailable");
    const run = vi.fn().mockRejectedValue(failure);

    await expect(retrySerializationConflict(run)).rejects.toBe(failure);
    expect(run).toHaveBeenCalledOnce();
  });

  it("does not retry a second serialization conflict", async () => {
    const run = vi.fn().mockRejectedValue({ code: "P2034" });

    await expect(retrySerializationConflict(run)).rejects.toEqual({ code: "P2034" });
    expect(run).toHaveBeenCalledTimes(2);
  });
});
