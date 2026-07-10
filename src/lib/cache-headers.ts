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

/**
 * Apply the path-based Cache-Control to a server-rendered response.
 *
 * Rebuilds the response with a fresh (mutable) Headers because responses from
 * Response.redirect() — the contact form's no-JS fallback path — carry an
 * immutable headers guard that would throw on .set(). Returns the original
 * response object unchanged when no rule applies.
 */
export function applyCacheHeaders(pathname: string, response: Response): Response {
  const cacheControl = cacheControlFor(pathname);
  if (!cacheControl) return response;

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', cacheControl);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
