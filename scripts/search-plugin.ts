import { loadEnv, type Plugin } from 'vite';
import { crawlFiles, missingReleaseUrls, publicSiteUrl, searchTags, searchVerification } from './search-assets.ts';

export function searchPlugin(): Plugin {
  let siteUrl: string | null = null;
  let verification: string | null = null;
  // The client build owns the HTML, warnings, and crawl files. The SSR build
  // for the prerendered start page only needs the shared base path.
  let clientBuild = false;
  let missingUrls: string[] = [];
  return {
    name: 'route-six-search',
    config(_, environment) {
      clientBuild = environment.command === 'build' && !environment.isSsrBuild;
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
      if (clientBuild) for (const warning of missingUrls) this.warn(warning);
    },
    transformIndexHtml(html, context) {
      if (context.path !== '/' && context.path !== '/index.html') return html;
      return { html, tags: searchTags(siteUrl, verification) };
    },
    generateBundle() {
      if (!clientBuild) return;
      const files = crawlFiles(siteUrl);
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: files.robots });
      if (files.sitemap) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: files.sitemap });
    },
  };
}
