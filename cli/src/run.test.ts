import { describe, expect, it, vi } from "vitest";
import { run, type CliApi, type DraftApi } from "./run.js";

const searchResult = {
  items: [{ slug: "tactile", name: "Tactile" }],
  query: "developer tools",
  sort: "new" as const,
  limit: 5,
  total: 1,
};

describe("tokenshelf CLI", () => {
  it("searches systems and writes bounded JSON to stdout", async () => {
    const api: CliApi = {
      search: vi.fn().mockResolvedValue(searchResult),
      getDesignMd: vi.fn(),
      getSchema: vi.fn(),
    };
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await run(["search", "developer tools", "--sort", "new", "--limit", "5"], {
      api,
      stdout,
      stderr,
      version: "0.0.0",
    });

    expect(api.search).toHaveBeenCalledWith({ query: "developer tools", sort: "new", limit: 5 });
    expect(stdout).toHaveBeenCalledWith(`${JSON.stringify(searchResult, null, 2)}\n`);
    expect(stderr).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
  });

  it("writes a system DESIGN.md without a JSON envelope", async () => {
    const api: CliApi = {
      search: vi.fn(),
      getDesignMd: vi.fn().mockResolvedValue("# Tactile\n"),
      getSchema: vi.fn(),
    };
    const stdout = vi.fn();

    const exitCode = await run(["get", "tactile"], {
      api,
      stdout,
      stderr: vi.fn(),
      version: "0.0.0",
    });

    expect(api.getDesignMd).toHaveBeenCalledWith("tactile");
    expect(stdout).toHaveBeenCalledWith("# Tactile\n");
    expect(exitCode).toBe(0);
  });

  it("writes the canonical JSON Schema", async () => {
    const schema = { type: "object", properties: { version: { const: "1" } } };
    const api: CliApi = {
      search: vi.fn(),
      getDesignMd: vi.fn(),
      getSchema: vi.fn().mockResolvedValue(schema),
    };
    const stdout = vi.fn();

    const exitCode = await run(["schema"], {
      api,
      stdout,
      stderr: vi.fn(),
      version: "0.0.0",
    });

    expect(stdout).toHaveBeenCalledWith(`${JSON.stringify(schema, null, 2)}\n`);
    expect(exitCode).toBe(0);
  });

  it("prints the package version without making a request", async () => {
    const api: CliApi = {
      search: vi.fn(),
      getDesignMd: vi.fn(),
      getSchema: vi.fn(),
    };
    const stdout = vi.fn();

    const exitCode = await run(["--version"], {
      api,
      stdout,
      stderr: vi.fn(),
      version: "1.2.3",
    });

    expect(stdout).toHaveBeenCalledWith("1.2.3\n");
    expect(api.search).not.toHaveBeenCalled();
    expect(exitCode).toBe(0);
  });

  it("writes command failures to stderr", async () => {
    const api: CliApi = {
      search: vi.fn().mockRejectedValue(new Error("Tokenshelf is unavailable.")),
      getDesignMd: vi.fn(),
      getSchema: vi.fn(),
    };
    const stderr = vi.fn();

    const exitCode = await run(["search", "editorial"], {
      api,
      stdout: vi.fn(),
      stderr,
      version: "0.0.0",
    });

    expect(stderr).toHaveBeenCalledWith("Tokenshelf is unavailable.\n");
    expect(exitCode).toBe(1);
  });

  it("exits with code 3 and diagnostics when local validation fails", async () => {
    const api: CliApi = {
      search: vi.fn(),
      getDesignMd: vi.fn(),
      getSchema: vi.fn(),
    };
    const stdout = vi.fn();

    const exitCode = await run(["validate", "design-system.json"], {
      api,
      stdout,
      stderr: vi.fn(),
      version: "0.0.0",
      readInput: vi.fn().mockResolvedValue("{}"),
    });

    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('"outcome": "fail"'));
    expect(stdout).toHaveBeenCalledWith(expect.stringContaining('"code": "schema.invalid"'));
    expect(exitCode).toBe(3);
  });

  it("pulls only the canonical draft document", async () => {
    const api: CliApi = {
      search: vi.fn(),
      getDesignMd: vi.fn(),
      getSchema: vi.fn(),
    };
    const draftApi: DraftApi = {
      pull: vi.fn().mockResolvedValue({ revision: 3, document: { version: "1" } }),
      push: vi.fn(),
    };
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await run(["draft", "pull"], {
      api,
      draftApi,
      stdout,
      stderr,
      version: "0.0.0",
    });

    expect(stdout).toHaveBeenCalledWith(`${JSON.stringify({ version: "1" }, null, 2)}\n`);
    expect(stderr).toHaveBeenCalledWith("Revision: 3\n");
    expect(exitCode).toBe(0);
  });

  it("pushes a complete document against an explicit revision", async () => {
    const api: CliApi = {
      search: vi.fn(),
      getDesignMd: vi.fn(),
      getSchema: vi.fn(),
    };
    const draftApi: DraftApi = {
      pull: vi.fn(),
      push: vi.fn().mockResolvedValue({ revision: 4, assessment: { outcome: "pass" } }),
    };
    const stdout = vi.fn();

    const exitCode = await run(["draft", "push", "design-system.json", "--revision", "3"], {
      api,
      draftApi,
      stdout,
      stderr: vi.fn(),
      version: "0.0.0",
      readInput: vi.fn().mockResolvedValue('{"version":"1"}'),
    });

    expect(draftApi.push).toHaveBeenCalledWith({ version: "1" }, 3);
    expect(stdout).toHaveBeenCalledWith(
      `${JSON.stringify({ revision: 4, assessment: { outcome: "pass" } }, null, 2)}\n`,
    );
    expect(exitCode).toBe(0);
  });
});
