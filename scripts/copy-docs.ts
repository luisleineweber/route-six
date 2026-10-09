import { cp } from 'node:fs/promises';

await cp(new URL('../docs/', import.meta.url), new URL('../dist/docs/', import.meta.url), { recursive: true });
console.log('Copied project documents to dist/docs.');
