import { loadEnv, type Plugin } from 'vite';
import { crawlFiles, publicSiteUrl, searchTags } from './search-assets.ts';

export function searchPlugin(): Plugin {
  let siteUrl: string | null = null;
  let building = false;
  return {
    name: 'route-six-search',
    config(_, environment) {
      building = environment.command === 'build';
      const result = publicSiteUrl(loadEnv(environment.mode, process.cwd(), 'SITE_').SITE_URL);
      if (!result.ok) throw new Error(result.error);
      siteUrl = result.url;
    },
    buildStart() {
      if (building && !siteUrl) this.warn('SITE_URL is not set. Canonical URL, site structured data, and sitemap are omitted. Set it before publication.');
    },
    transformIndexHtml(html, context) {
      if (context.path !== '/' && context.path !== '/index.html') return html;
      return { html, tags: searchTags(siteUrl) };
    },
    generateBundle() {
      const files = crawlFiles(siteUrl);
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: files.robots });
      if (files.sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: files.sitemap });
    },
  };
}
