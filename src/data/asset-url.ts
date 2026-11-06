/** Resolve a root-relative public asset path against the deployed base path. */
export function assetUrl(path: string, base: string = import.meta.env.BASE_URL): string {
  if (!path.startsWith('/')) throw new Error(`Public asset path must start with "/": ${path}`);
  return base + path.slice(1);
}
