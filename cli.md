# Tokenshelf CLI

## Repository

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
└── package.json                   # Private orchestration package
```

`app/` and `cli/` are independent npm projects. Only the CLI is versioned.

The CLI bundles validation code from `app/src/domain/design-system/`. Behavior changes there must update a CLI adapter or test under `cli/`.

The npm package is `tokenshelf`, invoked with `npx tokenshelf`.

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

There are no output-format flags.

Output is fixed by command:

- `search`: bounded JSON
- `get`: raw `DESIGN.md`
- `schema`: raw JSON Schema
- Errors: stderr
- Successful payloads: stdout

Examples:

```bash
npx tokenshelf get tactile > DESIGN.md
npx tokenshelf schema > design-system.schema.json
```

## Public API

Endpoints:

```text
GET /v1/systems?q=&sort=&limit=
GET /v1/systems/:slug/DESIGN.md
GET /v1/systems/:slug/document.json
GET /v1/schemas/design-system-document/1
```

### Shared Application Services

REST APIs and Wasp operations are thin adapters:

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

## Validation

Portable logic lives in:

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

The CLI bundles this source through tsdown, with no runtime import from `app/`.

```bash
npx tokenshelf validate design-system.json
cat design-system.json | npx tokenshelf validate -
```

No output options. Diagnostics go to stdout, with exit code `3` when validation fails.

## Drafts

```bash
TOKENSHELF_SESSION_URL="$URL" \
  npx tokenshelf draft pull > design-system.json

TOKENSHELF_SESSION_URL="$URL" \
  npx tokenshelf draft push design-system.json --revision 3
```

`draft pull` writes the canonical document to stdout and reports its current revision on stderr.

The CLI excludes:

- No login
- No publishing
- No rights attestation
- No voting
- No deletion
- No published-system updates
- No interactive browser or TUI

Server validation always has final authority.

## CLI releases

- Release Please tracks `cli/`; app-only commits do not change the CLI version.
- `feat:` and `fix:` commits touching `cli/` update the release PR.
- Merging the PR creates `tokenshelf-vX.Y.Z` and publishes with npm trusted publishing.
- Publication runs only when `cli--release_created` is true and all CLI package checks pass.
