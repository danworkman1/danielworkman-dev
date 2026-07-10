import { describe, it, expect } from 'vitest';
import { cacheControlFor, applyCacheHeaders } from '../src/lib/cache-headers';

describe('cacheControlFor', () => {
  it('marks API routes no-store', () => {
    expect(cacheControlFor('/api/contact')).toBe('no-store');
    expect(cacheControlFor('/api/anything/else')).toBe('no-store');
  });

  it('returns null for non-API paths (leave asset/platform default)', () => {
    expect(cacheControlFor('/')).toBeNull();
    expect(cacheControlFor('/blog')).toBeNull();
    expect(cacheControlFor('/_astro/index.abc123.css')).toBeNull();
  });
});

describe('applyCacheHeaders', () => {
  it('sets no-store on an API JSON response', () => {
    const res = applyCacheHeaders(
      '/api/contact',
      new Response('{}', { status: 400, headers: { 'content-type': 'application/json' } }),
    );
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.status).toBe(400);
    expect(res.headers.get('content-type')).toContain('application/json');
  });

  it('rebuilds an immutable redirect response, keeping Location and status', () => {
    // Response.redirect() responses have an immutable headers guard — a direct
    // .set() would throw, so this proves the rebuild path works.
    const res = applyCacheHeaders('/api/contact', Response.redirect('https://example.com/thanks', 303));
    expect(res.headers.get('cache-control')).toBe('no-store');
    expect(res.headers.get('location')).toBe('https://example.com/thanks');
    expect(res.status).toBe(303);
  });

  it('leaves non-API responses untouched (same object, no header added)', () => {
    const original = new Response('<html>', { status: 200, headers: { 'content-type': 'text/html' } });
    const res = applyCacheHeaders('/blog', original);
    expect(res).toBe(original);
    expect(res.headers.get('cache-control')).toBeNull();
  });
});
