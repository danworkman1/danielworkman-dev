import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  output: 'server',
  redirects: {
    // Old slug from when this post covered Astro 5. Keep the URL alive.
    '/blog/building-with-astro-5': '/blog/building-with-astro-6',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
