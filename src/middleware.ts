import { defineMiddleware } from 'astro:middleware';
import { applyCacheHeaders } from './lib/cache-headers';

export const onRequest = defineMiddleware(async (context, next) =>
  applyCacheHeaders(context.url.pathname, await next()),
);
