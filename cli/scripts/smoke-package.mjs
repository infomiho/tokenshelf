import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const temporaryDirectory = await mkdtemp(join(tmpdir(), "tokenshelf-package-"));

try {
  const pack = run("npm", ["pack", "--json", "--pack-destination", temporaryDirectory]);
  const [{ filename }] = JSON.parse(pack.stdout);
  const installDirectory = join(temporaryDirectory, "install");
  run("npm", [
    "install",
    "--ignore-scripts",
    "--prefix",
    installDirectory,
    join(temporaryDirectory, filename),
  ]);

  const packageDirectory = join(installDirectory, "node_modules", "tokenshelf");
  const packageJson = JSON.parse(await readFile(join(packageDirectory, "package.json"), "utf8"));
  const result = run(process.execPath, [
    join(packageDirectory, packageJson.bin.tokenshelf),
    "--version",
  ]);
  if (result.stdout.trim() !== packageJson.version)
    throw new Error(`Expected version ${packageJson.version}, received ${result.stdout.trim()}.`);
  const validation = run(
    process.execPath,
    [join(packageDirectory, packageJson.bin.tokenshelf), "validate", "-"],
    { input: "{}", expectedStatus: 3 },
  );
  if (!validation.stdout.includes('"code": "schema.invalid"'))
    throw new Error("Expected the installed package to report structural validation errors.");
} finally {
  await rm(temporaryDirectory, { recursive: true, force: true });
}

function run(command, args, { input, expectedStatus = 0 } = {}) {
  const result = spawnSync(command, args, { encoding: "utf8", input });
  if (result.status !== expectedStatus)
    throw new Error(`${command} ${args.join(" ")} failed:\n${result.stderr || result.stdout}`);
  return result;
}
