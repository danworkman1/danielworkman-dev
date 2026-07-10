# Daniel Workman Portfolio

Personal portfolio site for Daniel Workman, built with Astro, Tailwind CSS, and the Cloudflare adapter. The site includes a homepage, project case studies, blog routes, profile data, and a contact form endpoint ready to run on Cloudflare.

## Tech Stack

- Astro 7
- Tailwind CSS 4
- Cloudflare Workers/Assets via `@astrojs/cloudflare`
- TypeScript
- pnpm

## Local Development

Use Node.js `22.12.0` or newer.

```sh
pnpm install
pnpm dev
```

Common commands:

```sh
pnpm build
pnpm preview
```

## Testing

```sh
pnpm test        # fast Vitest unit suite
pnpm test:e2e    # builds, boots `wrangler dev`, asserts edge cache headers
```

## Caching model

Content pages are prerendered to static assets and served by Cloudflare Workers
Static Assets — versioned and replaced atomically on deploy, so there is no cache
to purge. Cache headers:

- `/_astro/*` (content-hashed JS/CSS): `public, max-age=31536000, immutable`,
  injected into `_headers` automatically by the `@astrojs/cloudflare` adapter at
  build time.
- Prerendered HTML: platform default (`max-age=0, must-revalidate`) with ETag 304s.
- `POST /api/contact` (the only dynamic route): `no-store`, set in `src/middleware.ts`.

## Deploy

```sh
pnpm build
pnpm exec wrangler deploy          # or: wrangler versions upload  (preview first)
```

Turnstile (secret) and Resend values are Worker secrets, set with
`wrangler secret put <NAME>`. The Turnstile *site* key is public and lives in
`src/config.ts`.

## Project Structure

- `src/pages/` - Astro routes, including home, projects, blog, and API routes.
- `src/data/` - Profile, project, and blog content stored as JSON.
- `src/layouts/` - Shared page layout.
- `src/styles/` - Global Tailwind styles.
- `public/` - Static images and favicon assets.
- `wrangler.jsonc` - Cloudflare deployment config.
