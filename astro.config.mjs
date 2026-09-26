import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';

// https://astro.build/config
export default defineConfig({
  adapter: cloudflare(),
  output: 'server',
  compressHTML: true, // pin old behaviour; Astro 7 default flips true -> 'jsx'
  redirects: {
    // Old slug from when this post covered Astro 5. Keep the URL alive.
    '/blog/building-with-astro-5': '/blog/building-with-astro-6',
  },
  vite: {
    plugins: [
      tailwindcss(),
      // Uploads source maps so Sentry stack traces are readable (#17). Only
      // active where SENTRY_AUTH_TOKEN is set — Workers Builds on pushes to
      // main — so CI and everyday local builds skip the upload entirely.
      sentryVitePlugin({
        org: 'daniel-workman',
        project: 'danielworkmandev',
        authToken: process.env.SENTRY_AUTH_TOKEN,
        disable: !process.env.SENTRY_AUTH_TOKEN,
        telemetry: false,
        // Workers Builds sets WORKERS_CI_COMMIT_SHA. The plugin injects the
        // release into the bundle, so the browser SDK tags events with it
        // without init() naming one.
        release: { name: process.env.WORKERS_CI_COMMIT_SHA },
        sourcemaps: {
          filesToDeleteAfterUpload: ['dist/**/*.map'],
        },
      }),
    ],
    build: {
      // 'hidden' emits maps for the Sentry upload without a sourceMappingURL
      // comment in the served files. Builds without SENTRY_AUTH_TOKEN leave
      // the .map files in dist — .assetsignore keeps them off the CDN.
      sourcemap: 'hidden',
    },
  },
});
