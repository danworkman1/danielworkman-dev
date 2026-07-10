import { describe, it, expect } from 'vitest';
import { cacheControlFor } from '../src/lib/cache-headers';

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
