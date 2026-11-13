import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import type { ReactElement } from 'react';
import { renderToString } from 'react-dom/server';
import { insertStartPage } from './prerender-page.ts';

// Built by `vite build --ssr src/entry-server.tsx` (outDir in vite.config.ts).
const entry = pathToFileURL(resolve('dist-ssr/entry-server.js')).href;
const { startPage } = await import(entry) as { startPage: () => Promise<ReactElement> };
const indexPath = resolve('dist/index.html');
const result = insertStartPage(await readFile(indexPath, 'utf8'), renderToString(await startPage()));
if (!result.ok) throw new Error(result.error);
await writeFile(indexPath, result.html);
console.log('Prerendered the start page into dist/index.html.');
