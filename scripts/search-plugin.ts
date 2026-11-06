import { loadEnv, type Plugin } from 'vite';
import { crawlFiles, missingReleaseUrls, publicSiteUrl, searchTags, searchVerification } from './search-assets.ts';

export function searchPlugin(): Plugin {
  let siteUrl: string | null = null;
  let verification: string | null = null;
  let building = false;
  let missingUrls: string[] = [];
  return {
    name: 'route-six-search',
    config(_, environment) {
      building = environment.command === 'build';
      const env = loadEnv(environment.mode, process.cwd(), ['SITE_', 'VITE_SITE_', 'GOOGLE_SITE_']);
      const result = publicSiteUrl(env.SITE_URL);
      if (!result.ok) throw new Error(result.error);
      siteUrl = result.url;
      const token = searchVerification(env.GOOGLE_SITE_VERIFICATION);
      if (!token.ok) throw new Error(token.error);
      verification = token.token;
      missingUrls = missingReleaseUrls(env);
      // A project site such as GitHub Pages serves the app below a path.
      return siteUrl ? { base: new URL(siteUrl).pathname } : undefined;
    },
    buildStart() {
      if (building) for (const warning of missingUrls) this.warn(warning);
    },
    transformIndexHtml(html, context) {
      if (context.path !== '/' && context.path !== '/index.html') return html;
      return { html, tags: searchTags(siteUrl, verification) };
    },
    generateBundle() {
      const files = crawlFiles(siteUrl);
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: files.robots });
      if (files.sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: files.sitemap });
    },
  };
}
