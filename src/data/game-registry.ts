/** Register a game only after its local data and rules have been reviewed. */
export const progressGameLoaders: Readonly<Record<string, () => Promise<unknown>>> = {
  emerald: () => import('./games/emerald').then(module => module.rawGame),
  ruby: () => import('./games/ruby').then(module => module.rawGame),
  red: () => import('./games/red').then(module => module.rawGame),
  blue: () => import('./games/blue').then(module => module.rawGame),
  yellow: () => import('./games/yellow').then(module => module.rawGame),
  gold: () => import('./games/gold').then(module => module.rawGame),
  silver: () => import('./games/silver').then(module => module.rawGame),
  crystal: () => import('./games/crystal').then(module => module.rawGame),
  sapphire: () => import('./games/sapphire').then(module => module.rawGame),
  firered: () => import('./games/firered').then(module => module.rawGame),
  leafgreen: () => import('./games/leafgreen').then(module => module.rawGame),
  platinum: () => import('./games/platinum').then(module => module.rawGame),
  diamond: () => import('./games/diamond').then(module => module.rawGame),
  pearl: () => import('./games/pearl').then(module => module.rawGame),
  black: () => import('./games/black').then(module => module.rawGame),
  white: () => import('./games/white').then(module => module.rawGame),
  'black-2': () => import('./games/black-2').then(module => module.rawGame),
  'white-2': () => import('./games/white-2').then(module => module.rawGame),
  x: () => import('./games/x').then(module => module.rawGame),
  y: () => import('./games/y').then(module => module.rawGame),
  'omega-ruby': () => import('./games/omega-ruby').then(module => module.rawGame),
  'alpha-sapphire': () => import('./games/alpha-sapphire').then(module => module.rawGame),
  heartgold: () => import('./games/heartgold').then(module => module.rawGame),
  soulsilver: () => import('./games/soulsilver').then(module => module.rawGame),
};

export const gameLoaders = progressGameLoaders;

export const defaultGameId = 'emerald';
