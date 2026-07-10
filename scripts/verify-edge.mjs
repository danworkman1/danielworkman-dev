// E2E: build the site, boot `wrangler dev`, and assert edge behaviour end-to-end.
//   - content-hashed /_astro/* assets are immutable (the adapter injects this into
//     dist/client/_headers; we verify it survives to the served response)
//   - POST /api/contact is never cached (the src/middleware.ts no-store rule)
//   - content pages are prerendered to static HTML and served 200 text/html
// Run with: pnpm test:e2e  (must run from the repo root — paths are cwd-relative)
import { spawn, execSync } from 'node:child_process';
import { existsSync, readdirSync } from 'node:fs';
import { setTimeout as sleep } from 'node:timers/promises';

const PORT = 8799;
const BASE = `http://127.0.0.1:${PORT}`;
const ORIGIN = BASE; // Astro's CSRF check rejects cross-origin POSTs with 403

let failures = 0;
function assert(cond, msg) {
  if (cond) {
    console.log(`  ok: ${msg}`);
  } else {
    console.error(`  FAIL: ${msg}`);
    failures++;
  }
}

console.log('› building…');
execSync('pnpm build', { stdio: 'inherit' });

// Prerender output must exist on disk (proves the pages are static, not SSR).
for (const f of ['index.html', 'blog/index.html', 'projects/index.html']) {
  assert(existsSync(`dist/client/${f}`), `prerendered dist/client/${f} exists`);
}

const astroDir = readdirSync('dist/client/_astro');
const assetName = astroDir.find((f) => f.endsWith('.css') || f.endsWith('.js'));
if (!assetName) {
  console.error('no hashed asset in dist/client/_astro — build produced nothing to check');
  process.exit(1);
}

console.log('› starting wrangler dev…');
// detached so we can kill the whole process group (pnpm -> wrangler -> workerd)
// on exit — SIGTERM to the pnpm wrapper alone leaves workerd holding the port.
const dev = spawn('pnpm', ['exec', 'wrangler', 'dev', '--port', String(PORT)], {
  stdio: ['ignore', 'ignore', 'inherit'],
  detached: true,
});

try {
  // Wait for readiness.
  let ready = false;
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`${BASE}/blog`);
      if (r.ok) { ready = true; break; }
    } catch {}
    await sleep(500);
  }
  if (!ready) throw new Error('wrangler dev did not become ready');

  // 1. Hashed asset is immutable.
  const asset = await fetch(`${BASE}/_astro/${assetName}`);
  assert(
    asset.headers.get('cache-control') === 'public, max-age=31536000, immutable',
    `/_astro/${assetName} is immutable (got: ${asset.headers.get('cache-control')})`,
  );

  // 2. API route is never cached (send Origin to pass the CSRF check and reach the handler).
  const api = await fetch(`${BASE}/api/contact`, {
    method: 'POST',
    headers: { accept: 'application/json', origin: ORIGIN },
    body: new URLSearchParams({ name: 'x', email: 'x@y.z', message: 'hi' }),
  });
  assert(api.headers.get('cache-control') === 'no-store', `POST /api/contact is no-store (got: ${api.headers.get('cache-control')})`);

  // 3. Prerendered page serves HTML.
  const page = await fetch(`${BASE}/blog`);
  assert(page.status === 200, `/blog returns 200 (got: ${page.status})`);
  assert((page.headers.get('content-type') || '').includes('text/html'), `/blog is text/html`);
} finally {
  try {
    process.kill(-dev.pid, 'SIGTERM'); // negative pid = kill the whole group
  } catch {
    dev.kill('SIGTERM');
  }
}

if (failures > 0) {
  console.error(`\n${failures} edge check(s) failed`);
  process.exit(1);
}
console.log('\nall edge checks passed');
process.exit(0);
