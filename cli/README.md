# Tokenshelf CLI

Tokenshelf is a library of original design systems for coding agents. Use the CLI to discover published systems, fetch their agent-ready `DESIGN.md`, validate structured documents, and work with submission drafts.

## Find and get design systems

```sh
# Search published systems. Sort by hot or new; limit defaults to 10.
npx tokenshelf search <query> [--sort hot|new] [--limit 1-50]

# Write a system's agent-ready guide to stdout.
npx tokenshelf get <slug> > DESIGN.md
```

## Contributing design systems

```sh
# Write the canonical design-system JSON Schema to stdout.
npx tokenshelf schema > schema.json

# Validate a JSON document from a file or stdin.
npx tokenshelf validate <file>
npx tokenshelf validate -

# Read the current document from a submission draft.
npx tokenshelf draft pull

# Replace a draft document using its current revision.
npx tokenshelf draft push <file> --revision <number>
```

`validate` exits with status `3` when the document does not match the schema.

## Draft Sessions

Draft commands require a short-lived capability URL supplied by Tokenshelf:

```sh
export TOKENSHELF_SESSION_URL="https://..."
npx tokenshelf draft pull > draft.json
npx tokenshelf draft push draft.json --revision 1
```

Treat `TOKENSHELF_SESSION_URL` as a secret. The CLI prints the current revision to stderr when pulling a draft.

Set `TOKENSHELF_API_URL` to override the default public API at `https://api.tokenshelf.dev`.
