#!/usr/bin/env node

import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import { createApi } from "./api.js";
import { createDraftApi } from "./draft-api.js";
import { run } from "./run.js";

const require = createRequire(import.meta.url);
const { version } = require("../package.json") as { version: string };
const serverUrl = process.env.TOKENSHELF_API_URL ?? "https://api.tokenshelf.dev";
const sessionUrl = process.env.TOKENSHELF_SESSION_URL;

async function readInput(path: string) {
  if (path !== "-") return readFile(path, "utf8");
  process.stdin.setEncoding("utf8");
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  return input;
}

process.exitCode = await run(process.argv.slice(2), {
  api: createApi(serverUrl),
  draftApi: sessionUrl ? createDraftApi(sessionUrl) : undefined,
  stdout: (value) => process.stdout.write(value),
  stderr: (value) => process.stderr.write(value),
  version,
  readInput,
});
