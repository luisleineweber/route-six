import type { HtmlTagDescriptor } from 'vite';
import { siteDescription, siteTitle } from '../src/content/site-copy.ts';

export function publicSiteUrl(value: string | undefined):
  { ok: true; url: string | null } | { ok: false; error: string } {
  if (!value?.trim()) return { ok: true, url: null };
  const error = 'SITE_URL must be the public HTTPS site URL. A path must end with "/". Do not add a query, fragment, or credentials.';
  if (!URL.canParse(value.trim())) return { ok: false, error };
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || !url.pathname.endsWith('/') || url.href !== `${url.origin}${url.pathname}`) {
    return { ok: false, error };
  }
  return { ok: true, url: url.href };
}

export function searchVerification(value: string | undefined):
  { ok: true; token: string | null } | { ok: false; error: string } {
  if (!value?.trim()) return { ok: true, token: null };
  // Search Console shows a meta tag. Only its content value belongs here.
  if (!/^[A-Za-z0-9_-]{20,128}$/.test(value.trim())) {
    return { ok: false, error: 'GOOGLE_SITE_VERIFICATION must be only the content value of the Search Console meta tag.' };
  }
  return { ok: true, token: value.trim() };
}

const releaseUrls = [
  ['SITE_URL', 'Canonical URL, site structured data, and sitemap are omitted.'],
  ['VITE_SITE_URL', 'The footer site link and PNG site address are omitted.'],
] as const;

export function missingReleaseUrls(env: Record<string, string | undefined>) {
  return releaseUrls.filter(([name]) => !env[name]?.trim())
    .map(([name, effect]) => `${name} is not set. ${effect} Set it before publication.`);
}

export function searchTags(siteUrl: string | null, verification: string | null = null): HtmlTagDescriptor[] {
  const meta = (name: string, content: string): HtmlTagDescriptor => ({ tag: 'meta', attrs: { name, content } });
  const og = (property: string, content: string): HtmlTagDescriptor => ({ tag: 'meta', attrs: { property, content } });
  const tags: HtmlTagDescriptor[] = [
    { tag: 'title', children: siteTitle },
    meta('description', siteDescription),
    og('og:title', siteTitle), og('og:description', siteDescription),
    og('og:site_name', 'Route Six'), og('og:type', 'website'), og('og:locale', 'en_US'),
    meta('twitter:card', 'summary'), meta('twitter:title', siteTitle), meta('twitter:description', siteDescription),
    { tag: 'link', attrs: { rel: 'help', type: 'text/plain', href: siteUrl ? `${new URL(siteUrl).pathname}llms.txt` : '/llms.txt', title: 'Route Six features and game support' } },
  ];
  if (verification) tags.push(meta('google-site-verification', verification));
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
              'Encounter locations and evolution requirements in 24 supported games'],
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
