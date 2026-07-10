/**
 * Decide the Cache-Control for a *server-rendered* response by path.
 *
 * The only dynamic route on this site is POST /api/contact, which must never be
 * cached. Everything else is prerendered and served as a static asset (whose
 * caching the @astrojs/cloudflare adapter handles via dist/client/_headers), so
 * we return null and leave those responses alone.
 */
export function cacheControlFor(pathname: string): string | null {
  if (pathname.startsWith('/api/')) return 'no-store';
  return null;
}
