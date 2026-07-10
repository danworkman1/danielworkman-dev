// Cloudflare Turnstile *site* key. Public by design — it is rendered into client
// HTML — so it lives in source. The Turnstile *secret* key stays a Worker secret.
// Read at build time so the home page can be prerendered.
export const TURNSTILE_SITE_KEY = '0x4AAAAAADJxsSLnDyrnFSRN';
