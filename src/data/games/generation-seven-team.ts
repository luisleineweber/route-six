export function withRegionalDex<T extends { pokemonId: string }>(profiles: readonly T[], regionalDex: readonly string[]) {
  const numbers = new Map(regionalDex.map((id, index) => [id, index + 1]));
  return profiles.map(profile => ({ ...profile, regionalDex: numbers.get(profile.pokemonId) }));
}
