const emptyRoot = '<div id="root"></div>';

export type InsertResult = { ok: true; html: string } | { ok: false; error: string };

/** Places the prerendered start page in the single empty root of the built index. */
export function insertStartPage(html: string, appHtml: string): InsertResult {
  const count = html.split(emptyRoot).length - 1;
  if (count !== 1) return { ok: false, error: `Expected one empty ${emptyRoot} in index.html, found ${count}.` };
  if (!appHtml.trim()) return { ok: false, error: 'The start page rendered no HTML.' };
  return { ok: true, html: html.replace(emptyRoot, () => `<div id="root">${appHtml}</div>`) };
}
