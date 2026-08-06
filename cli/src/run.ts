import { Command, CommanderError, InvalidArgumentError, Option } from "commander";
import { validateDocumentJson } from "./validation.js";

export type SearchInput = {
  query: string;
  sort: "hot" | "new";
  limit: number;
};

export type CliApi = {
  search(input: SearchInput): Promise<unknown>;
  getDesignMd(slug: string): Promise<string>;
  getSchema(): Promise<unknown>;
};

export type DraftApi = {
  pull(): Promise<{ revision: number; document: unknown }>;
  push(document: unknown, revision: number): Promise<unknown>;
};

export type CliDependencies = {
  api: CliApi;
  draftApi?: DraftApi;
  stdout(value: string): void;
  stderr(value: string): void;
  version: string;
  readInput?(path: string): Promise<string>;
};

function parseLimit(value: string) {
  const limit = Number(value);
  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 50) {
    throw new InvalidArgumentError("must be an integer from 1 to 50");
  }
  return limit;
}

function parseRevision(value: string) {
  const revision = Number(value);
  if (!Number.isSafeInteger(revision) || revision < 0) {
    throw new InvalidArgumentError("must be a non-negative integer");
  }
  return revision;
}

export async function run(args: string[], dependencies: CliDependencies): Promise<number> {
  let commandExitCode = 0;
  const program = new Command()
    .name("tokenshelf")
    .description("Discover and work with Tokenshelf design systems")
    .version(dependencies.version)
    .exitOverride()
    .configureOutput({ writeOut: dependencies.stdout, writeErr: dependencies.stderr });

  program
    .command("search")
    .description("Search published design systems")
    .argument("<query>", "search text")
    .addOption(new Option("--sort <sort>", "catalog order").choices(["hot", "new"]).default("hot"))
    .option("--limit <number>", "maximum results", parseLimit, 10)
    .action(async (query: string, options: { sort: "hot" | "new"; limit: number }) => {
      const result = await dependencies.api.search({ query, ...options });
      dependencies.stdout(`${JSON.stringify(result, null, 2)}\n`);
    });

  program
    .command("get")
    .description("Get a design system's DESIGN.md")
    .argument("<slug>", "design system slug")
    .action(async (slug: string) => dependencies.stdout(await dependencies.api.getDesignMd(slug)));

  program
    .command("schema")
    .description("Get the canonical design-system JSON Schema")
    .action(async () => {
      const schema = await dependencies.api.getSchema();
      dependencies.stdout(`${JSON.stringify(schema, null, 2)}\n`);
    });

  program
    .command("validate")
    .description("Validate a local design-system document")
    .argument("<file>", "JSON file or - for stdin")
    .action(async (path: string) => {
      if (!dependencies.readInput) throw new Error("Input reading is unavailable.");
      const result = await validateDocumentJson(await dependencies.readInput(path));
      dependencies.stdout(`${JSON.stringify(result, null, 2)}\n`);
      if (result.outcome === "fail") commandExitCode = 3;
    });

  const draft = program.command("draft").description("Work with a capability-scoped draft");
  draft
    .command("pull")
    .description("Get the current canonical draft document")
    .action(async () => {
      if (!dependencies.draftApi) throw new Error("TOKENSHELF_SESSION_URL is required.");
      const { document, revision } = await dependencies.draftApi.pull();
      dependencies.stdout(`${JSON.stringify(document, null, 2)}\n`);
      dependencies.stderr(`Revision: ${revision}\n`);
    });
  draft
    .command("push")
    .description("Replace the current canonical draft document")
    .argument("<file>", "JSON file or - for stdin")
    .requiredOption("--revision <number>", "current draft revision", parseRevision)
    .action(async (path: string, options: { revision: number }) => {
      if (!dependencies.draftApi) throw new Error("TOKENSHELF_SESSION_URL is required.");
      if (!dependencies.readInput) throw new Error("Input reading is unavailable.");
      const document = JSON.parse(await dependencies.readInput(path)) as unknown;
      const result = await dependencies.draftApi.push(document, options.revision);
      dependencies.stdout(`${JSON.stringify(result, null, 2)}\n`);
    });

  try {
    await program.parseAsync(args, { from: "user" });
    return commandExitCode;
  } catch (error) {
    if (error instanceof CommanderError) {
      return error.exitCode;
    }
    dependencies.stderr(`${error instanceof Error ? error.message : "Unknown error."}\n`);
    return 1;
  }
}
