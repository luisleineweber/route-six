import { readdir } from 'node:fs/promises';

const target = process.argv[2];
if (!target || !target.endsWith('/')) throw new Error('Supply the site URL with a final slash.');
const home = await fetch(target);
if (!home.ok || !(await home.text()).includes('id="root"')) throw new Error('The host did not return the planner page.');
const assets = (await readdir('dist/assets')).filter(name => name.endsWith('.js'));
for (const path of [...assets.map(name => `assets/${name}`), 'types/LICENSE.txt', 'llms.txt', 'sitemap.xml']) {
  const response = await fetch(new URL(path, target));
  if (!response.ok) throw new Error(`Host request failed (${response.status}): ${path}`);
  if (path.endsWith('.js') && !/javascript/.test(response.headers.get('content-type') ?? '')) {
    throw new Error(`The host returned the wrong content type for ${path}`);
  }
  await response.arrayBuffer();
}
console.log(`Host serves the planner, all ${assets.length} JavaScript files (including workers), notices and sitemap.`);
