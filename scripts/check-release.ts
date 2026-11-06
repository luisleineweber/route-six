import { readFile, stat } from 'node:fs/promises';
import { resolve, sep } from 'node:path';

const site = process.env.SITE_URL;
if (!site || process.env.VITE_SITE_URL !== site) throw new Error('Set both release URLs to the same public site URL.');
const base = new URL(site).pathname;
const root = resolve('dist');
const html = await readFile(resolve(root, 'index.html'), 'utf8');
if (!html.includes(`href="${site}"`)) throw new Error('The release has no matching canonical URL.');
const sitemap = await readFile(resolve(root, 'sitemap.xml'), 'utf8');
if (!sitemap.includes(`<loc>${site}</loc>`)) throw new Error('The sitemap has the wrong site URL.');
const links = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map(match => match[1]);
for (const link of links.filter(link => link.startsWith('/') && !link.startsWith('//'))) {
  if (!link.startsWith(base)) throw new Error(`Asset is outside the site path: ${link}`);
  const path = resolve(root, decodeURIComponent(link.slice(base.length).split(/[?#]/)[0]));
  if (!path.startsWith(root + sep)) throw new Error('Asset leaves the release directory.');
  if (!(await stat(path)).isFile()) throw new Error(`Asset is missing: ${link}`);
}
for (const name of ['llms.txt', 'robots.txt', 'types/LICENSE.txt']) await stat(resolve(root, name));
console.log(`Release metadata and entry assets pass for ${site}`);
