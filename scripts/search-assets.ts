import type { HtmlTagDescriptor } from 'vite';
import { siteDescription, siteTitle } from '../src/content/site-copy.ts';

export function publicSiteUrl(value: string | undefined):
  { ok: true; url: string | null } | { ok: false; error: string } {
  if (!value?.trim()) return { ok: true, url: null };
  const error = 'SITE_URL must be the public HTTPS origin, without a path, query, fragment, or credentials.';
  if (!URL.canParse(value.trim())) return { ok: false, error };
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.href !== `${url.origin}/`) {
    return { ok: false, error };
  }
  return { ok: true, url: url.href };
}

export function searchTags(siteUrl: string | null): HtmlTagDescriptor[] {
  const meta = (name: string, content: string): HtmlTagDescriptor => ({ tag: 'meta', attrs: { name, content } });
  const og = (property: string, content: string): HtmlTagDescriptor => ({ tag: 'meta', attrs: { property, content } });
  const tags: HtmlTagDescriptor[] = [
    { tag: 'title', children: siteTitle },
    meta('description', siteDescription),
    og('og:title', siteTitle), og('og:description', siteDescription),
    og('og:site_name', 'Route Six'), og('og:type', 'website'), og('og:locale', 'en_US'),
    meta('twitter:card', 'summary'), meta('twitter:title', siteTitle), meta('twitter:description', siteDescription),
    { tag: 'link', attrs: { rel: 'help', type: 'text/plain', href: '/llms.txt', title: 'Route Six features and game support' } },
  ];
  if (siteUrl) {
    tags.push(
      { tag: 'link', attrs: { rel: 'canonical', href: siteUrl } },
      og('og:url', siteUrl),
      { tag: 'script', attrs: { type: 'application/ld+json' }, children: JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          { '@type': 'WebSite', '@id': `${siteUrl}#website`, name: 'Route Six', url: siteUrl, inLanguage: 'en' },
          { '@type': 'WebApplication', '@id': `${siteUrl}#planner`, name: 'Route Six Pokémon Team Planner',
            url: siteUrl, description: siteDescription, applicationCategory: 'GameApplication',
            operatingSystem: 'Any', isAccessibleForFree: true,
            browserRequirements: 'Requires JavaScript for the interactive planner.',
            featureList: ['Six Pokémon team slots', 'Game-specific type analysis', 'PNG team export',
              'Encounter locations and evolution requirements in 16 supported games'],
          },
        ],
      }).replaceAll('<', '\\u003c') },
    );
  }
  return tags.map(tag => ({ ...tag, injectTo: 'head' }));
}

export function crawlFiles(siteUrl: string | null) {
  const xmlUrl = siteUrl?.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  return {
    robots: `User-agent: *\nAllow: /\n${siteUrl ? `\nSitemap: ${siteUrl}sitemap.xml\n` : ''}`,
    sitemap: siteUrl ? `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${xmlUrl}</loc></url></urlset>\n` : null,
  };
}
