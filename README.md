# Tokenshelf

![Tokenshelf](app/public/og-image.png)

[Tokenshelf](https://tokenshelf.dev) is a library of hand-picked design systems for coding agents. Browse community picks, copy a system's `DESIGN.md` prompt, or submit your own.

## Run locally

Requirements:

- Node.js 24.14.1 or newer
- Docker
- [Wasp 0.25](https://wasp.sh/docs/quick-start)
- A GitHub OAuth app with `http://localhost:3001/auth/github/callback` as a callback URL

Install the Wasp CLI:

```sh
npm install --global @wasp.sh/wasp-cli@0.25
```

Create `app/.env.server`:

```sh
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

Apply the database migration and start the app:

```sh
cd app
wasp db migrate-dev
wasp start
```

Tokenshelf will be available at [http://localhost:3000](http://localhost:3000).

Start the local screenshot worker and object storage separately:

```sh
docker compose -f compose.screenshots.yml up -d --build
```

## Seed data

Seed the shared catalog systems plus local demo picks:

```sh
cd app
wasp db seed seedDevelopmentCatalog
```

Seed only the shared Tokenshelf-authored systems in production:

```sh
cd app
DATABASE_URL=your-production-database-url wasp db seed seedProductionCatalog
```

## Deploy screenshots

Production uses three Coolify resources:

- The existing Tokenshelf server and client.
- A Docker Image application running `ghcr.io/<owner>/tokenshelf-screenshot-service:main` at `https://screenshots.tokenshelf.dev:4100`.
- A Docker Compose resource using `compose.rustfs.yml`, with the `rustfs` service exposed at `https://assets.tokenshelf.dev:9000` and a persistent `rustfs-data` volume.

Configure the RustFS Compose resource with unique `RUSTFS_ACCESS_KEY` and `RUSTFS_SECRET_KEY` values. Keep the console private. The bootstrap service creates the `tokenshelf-public` bucket and grants public read access only under `public/`.

Configure the screenshot application:

```sh
PORT=4100
SCREENSHOT_SERVICE_TOKEN=<shared-worker-token>
CAPTURE_ORIGIN=https://tokenshelf.dev
CAPTURE_CONCURRENCY=2
CAPTURE_TIMEOUT_MS=15000
S3_ENDPOINT=https://assets.tokenshelf.dev
S3_REGION=us-east-1
S3_BUCKET=tokenshelf-public
S3_ACCESS_KEY_ID=<RUSTFS_ACCESS_KEY>
S3_SECRET_ACCESS_KEY=<RUSTFS_SECRET_KEY>
S3_UPLOAD_TIMEOUT_MS=15000
```

Configure the Wasp server:

```sh
SCREENSHOT_CAPTURE_SECRET=<capture-signing-secret>
SCREENSHOT_SERVICE_TOKEN=<shared-worker-token>
SCREENSHOT_SERVICE_URL=https://screenshots.tokenshelf.dev
SCREENSHOT_CAPTURE_ORIGIN=https://tokenshelf.dev
SCREENSHOT_PUBLIC_BASE_URL=https://assets.tokenshelf.dev/tokenshelf-public
```

Add `COOLIFY_SCREENSHOT_WEBHOOK` to GitHub Actions secrets. Deploy RustFS first, then the screenshot application, then run the normal deployment workflow. Verify `https://screenshots.tokenshelf.dev/health/ready` before relying on backfill jobs.
