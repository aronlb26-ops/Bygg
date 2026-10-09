// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Sätt SITE_URL till den riktiga domänen (t.ex. https://arerekond.se)
// i Netlify/Vercel eller i .env – används för sitemap, canonical och OG.
const site = process.env.SITE_URL || 'https://example.com';

export default defineConfig({
  site,
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: (page) => !page.includes('/tack') })],
});
