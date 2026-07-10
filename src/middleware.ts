import { defineMiddleware } from 'astro:middleware';
import { cacheControlFor } from './lib/cache-headers';

export const onRequest = defineMiddleware(async (context, next) => {
  const response = await next();
  const cacheControl = cacheControlFor(context.url.pathname);
  if (!cacheControl) return response;

  // Rebuild with a fresh (mutable) Headers: responses from Response.redirect()
  // — the contact form's no-JS fallback path — have an immutable headers guard,
  // so a direct response.headers.set(...) would throw.
  const headers = new Headers(response.headers);
  headers.set('Cache-Control', cacheControl);
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
});
