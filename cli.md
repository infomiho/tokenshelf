## Revised Final Plan

### Repository

```text
/
├── app/                           # Complete Wasp application
├── cli/                           # Published npm CLI
├── design/
├── .github/workflows/
│   ├── deploy.yml
│   └── release-please.yml
├── release-please-config.json
├── .release-please-manifest.json
└── package.json                   # Private orchestration and release version
```

`app/` and `cli/` remain independent npm projects with separate lockfiles. No root workspaces.
The private root package owns the release version because the CLI bundles design-system domain code
from `app/`; Release Please mirrors that version into `cli/package.json`.

The npm package will be named `tokenshelf` because that is required for:

```bash
npx tokenshelf
```

A package named `@infomiho/tokenshelf-cli` would require `npx @infomiho/tokenshelf-cli` or an additional unscoped shim.

## CLI Foundation

- Node `>=24`
- ESM-only
- `tsdown`
- `ky` for HTTP
- Commander
- Vitest
- No interactive framework, colors, spinners, or configuration files

Server configuration:

```text
TOKENSHELF_API_URL=https://api.tokenshelf.dev
```

The production URL is the default. Local testing can override it:

```bash
TOKENSHELF_API_URL=http://localhost:3001 npx tokenshelf search "editorial"
```

The API client should be injected into commands for tests rather than reading environment variables throughout the codebase.

## Base Commands

```bash
npx tokenshelf search "developer tools"
npx tokenshelf search "developer tools" --sort new --limit 5
npx tokenshelf get tactile
npx tokenshelf schema
npx tokenshelf --version
```

No initial `--format`, `--json`, `--output`, or `-o`.

Output is fixed by command:

- `search`: bounded JSON
- `get`: raw `DESIGN.md`
- `schema`: raw JSON Schema
- Errors: stderr
- Successful payloads: stdout

Agents can redirect output naturally:

```bash
npx tokenshelf get tactile > DESIGN.md
npx tokenshelf schema > design-system.schema.json
```

## Unified Public API

Greenfield versioned endpoints only:

```text
GET /v1/systems?q=&sort=&limit=
GET /v1/systems/:slug/DESIGN.md
GET /v1/systems/:slug/document.json
GET /v1/schemas/design-system-document/1
```

Remove or replace the existing unversioned DESIGN.md route. Update all internal callers to use the unified endpoint.

### Shared Application Services

REST APIs and Wasp operations become thin adapters:

```text
Wasp operations ─┐
                 ├── catalog application services ── Prisma
REST endpoints ──┘
```

Shared services own:

- Search normalization
- Filtering
- Sorting
- Limits and pagination
- Catalog projections
- System lookup
- `DESIGN.md` retrieval
- Canonical document retrieval
- Not-found results

Adapters own:

- HTTP/Wasp argument decoding
- Authentication context where applicable
- Status codes
- Headers
- Serialization

REST handlers must not call Wasp operations, and operations must not call HTTP handlers.

The schema endpoint returns the same schema constant used by server validation.

## Local Validation Phase

After the read-only CLI works, extract portable logic into:

```text
app/src/domain/design-system/
```

This includes:

- Canonical types
- Schema and decoder
- Tag normalization
- Semantic assessment
- Diagnostics
- `DESIGN.md` generation
- Renderer generation
- Schema and ruleset identifiers

The CLI bundles this source through tsdown. Nothing imports `app/` at runtime after publication.

Then add:

```bash
npx tokenshelf validate design-system.json
cat design-system.json | npx tokenshelf validate -
```

No output options. Diagnostics go to stdout, with exit code `3` when validation fails.

## Draft Phase

Later:

```bash
TOKENSHELF_SESSION_URL="$URL" \
  npx tokenshelf draft pull > design-system.json

TOKENSHELF_SESSION_URL="$URL" \
  npx tokenshelf draft push design-system.json --revision 3
```

`draft pull` writes the canonical document to stdout and reports its current revision on stderr.

The CLI remains an agent helper, not a full site interface:

- No login
- No publishing
- No rights attestation
- No voting
- No deletion
- No published-system updates
- No interactive browser or TUI

Server validation always has final authority.

## Release Please

Copy Buzz’s manifest-based release process.

`release-please-config.json`:

```json
{
  "$schema": "https://raw.githubusercontent.com/googleapis/release-please/main/schemas/config.json",
  "bump-minor-pre-major": true,
  "packages": {
    ".": {
      "release-type": "node",
      "extra-files": [
        {
          "type": "json",
          "path": "cli/package.json",
          "jsonpath": "$.version"
        }
      ]
    }
  }
}
```

Initial `.release-please-manifest.json`:

```json
{
  ".": "0.0.0"
}
```

Workflow behavior:

1. Pushes to `main` update a CLI release PR.
2. Conventional `feat:` and `fix:` commits determine the next version.
3. Merging the release PR creates the GitHub release and tag.
4. The root `release_created` output triggers npm publication from `cli/`.
5. Publication uses npm trusted publishing with GitHub OIDC.

Adapted Buzz publishing job:

```yaml
publish-cli:
  needs: release-please
  if: ${{ needs.release-please.outputs.cli_released == 'true' }}
  runs-on: ubuntu-latest
  defaults:
    run:
      working-directory: cli
  permissions:
    contents: read
    id-token: write
  steps:
    - uses: actions/checkout@v7

    - uses: actions/setup-node@v6
      with:
        node-version: "24.x"
        registry-url: "https://registry.npmjs.org"

    - run: npm ci
    - run: npm test
    - run: npm run build
    - run: npm run check:package
    - run: npm publish --provenance --access public
```

`prepublishOnly` still builds defensively, matching Buzz’s approach.

## Delivery Order

1. Move the Wasp project into `app/`.
2. Repair deployment and development paths.
3. Verify app tests, Storybook, Wasp build, and generated Docker builds.
4. Extract shared catalog application services.
5. Add unified `/v1` endpoints.
6. Create the Node 24 CLI using ky and tsdown.
7. Implement `search`, `get`, and `schema`.
8. Add package smoke tests and release-please publishing.
9. Extract portable validation.
10. Add `validate`.
11. Add capability-scoped `draft pull` and `draft push`.

## Implementation Note

Implement the CLI using the `/tdd` skill and its red-green-refactor workflow.
