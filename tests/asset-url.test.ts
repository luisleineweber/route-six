import { describe, expect, it } from 'vitest';
import { assetUrl } from '../src/data/asset-url';

describe('assetUrl', () => {
  it('resolves public asset paths against the configured base', () => {
    expect(assetUrl('/types/fire.svg', '/route-six/')).toBe('/route-six/types/fire.svg');
    expect(assetUrl('/pokemon/1.png', '/')).toBe('/pokemon/1.png');
  });

  it('rejects paths that are not public asset paths', () => {
    expect(() => assetUrl('types/fire.svg', '/')).toThrow('Public asset path must start with "/": types/fire.svg');
  });
});
