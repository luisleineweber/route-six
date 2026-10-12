import type { Dataset, Requirement, Review, ValidationIssue } from '../domain/types';
import { validateAcquisition } from './validate-acquisition';
import { leaves } from '../domain/requirements';

export function validateSemantics(data: Dataset): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const issue = (recordId: string | null, fieldPath: string, message: string) => issues.push({ recordId, fieldPath, message });
  const unique = <T>(rows: T[], key: (r: T) => string | number, file: string) => {
    const seen = new Set<string | number>();
    for (const row of rows) {
      const value = key(row);
      if (seen.has(value)) issue(String(value), file, `Duplicate ID or value: ${value}`);
      seen.add(value);
    }
  };
  unique(data.references, r => r.id, 'data/references.json');
  unique(data.pokemon, p => p.id, 'data/pokemon.json');
  unique(data.pokemon, p => p.nationalDex, 'data/pokemon.json');
  unique(data.games, g => g.game.id, 'data/games');
  const references = new Set(data.references.map(r => r.id));
  const review = (r: Review, id: string, file: string) => {
    for (const ref of r.referenceIds) if (!references.has(ref)) issue(id, file, `Unknown review reference: ${ref}`);
  };
  const pokemon = new Map(data.pokemon.map(p => [p.id, p]));
  for (const p of data.pokemon) review(p.review, p.id, 'data/pokemon.json');
  for (const g of data.games) {
    const base = `data/games/${g.game.id}/`;
    const collections = { pokemon: g.profiles, progression: g.milestones, bosses: g.bosses,
      locations: g.locations, capabilities: g.capabilities, items: g.items, choices: g.choices,
      sources: g.sources, 'breeding-rules': g.breedingRules, evolutions: g.evolutions, exclusions: g.exclusions };
    for (const [file, rows] of Object.entries(collections)) {
      unique(rows as { id?: string; pokemonId?: string }[], r => r.id ?? r.pokemonId!, base + file + '.json');
      for (const row of rows) review(row.review, 'id' in row ? row.id : row.pokemonId, base + file + '.json');
    }
    review(g.game.review, g.game.id, base + 'game.json');
    review(g.typeChart.review, g.game.id, base + 'type-chart.json');
    const milestones = new Map(g.milestones.map(m => [m.id, m]));
    const locations = new Set(g.locations.map(l => l.id));
    const bosses = new Set(g.bosses.map(b => b.id));
    const types = new Set(g.typeChart.typeIds);
    const gyms = g.bosses.filter(boss => boss.kind === 'gym');
    unique(gyms, gym => gym.badgeNumber, base+'bosses.json/badgeNumber');
    if (gyms.some(gym => gym.badgeNumber > gyms.length)) {
      issue(g.game.id, base+'bosses.json/badgeNumber', 'Gym badge numbers must be contiguous from 1.');
    }
    for (const gym of gyms) {
      if (!types.has(gym.specialtyTypeId)) issue(gym.id, base+'bosses.json/specialtyTypeId', `Unknown Gym type: ${gym.specialtyTypeId}`);
    }
    const count = types.size;
    if (g.typeChart.matrix.length !== count || g.typeChart.matrix.some(row => row.length !== count)) issue(g.game.id, base+'type-chart.json', 'Type chart must be square and complete.');
    for (const profile of g.profiles) {
      const p = pokemon.get(profile.pokemonId);
      if (!p || p.introducedGeneration > g.game.generation) issue(profile.pokemonId, base+'pokemon.json', 'Species is missing or does not exist in this generation.');
      for (const t of profile.types) if (!types.has(t)) issue(profile.pokemonId, base+'pokemon.json', `Unknown game type: ${t}`);
    }
    for (const p of data.pokemon.filter(p => p.introducedGeneration <= g.game.generation)) {
      if (!g.profiles.some(profile => profile.pokemonId === p.id)) issue(p.id, base+'pokemon.json', 'Missing game profile.');
    }
    unique(g.milestones, m => m.displayOrder, base+'progression.json');
    const regionalDex = g.profiles.flatMap(profile => profile.regionalDex === undefined ? [] : [profile.regionalDex]);
    unique(regionalDex, dex => dex, base+'pokemon.json/regionalDex');
    if (regionalDex.length && (Math.min(...regionalDex) !== 1 || Math.max(...regionalDex) !== regionalDex.length)) {
      issue(g.game.id, base+'pokemon.json/regionalDex', 'Regional Pokédex numbers must be contiguous from 1.');
    }
    if (!milestones.has(g.game.firstMilestoneId)) issue(g.game.id, base+'game.json', 'Unknown first milestone.');
    const visiting = new Set<string>(); const visited = new Set<string>();
    const walk = (id: string): boolean => {
      if (visiting.has(id)) { issue(id, base+'progression.json', 'Milestone dependency cycle.'); return false; }
      if (visited.has(id)) return true;
      const m = milestones.get(id);
      if (!m) { issue(id, base+'progression.json', 'Unknown previous milestone.'); return false; }
      visiting.add(id);
      if (id !== g.game.firstMilestoneId && !m.previousIds.length) issue(id, base+'progression.json', 'Milestone is not rooted at game start.');
      for (const parent of m.previousIds) walk(parent);
      visiting.delete(id); visited.add(id); return true;
    };
    for (const m of g.milestones) {
      walk(m.id);
      if (m.locationId && !locations.has(m.locationId)) issue(m.id, base+'progression.json', 'Unknown location.');
      if (m.nextBossId && !bosses.has(m.nextBossId)) issue(m.id, base+'progression.json', 'Unknown next boss.');
    }
    for (const location of g.locations.filter(l => /^route-\d+$/.test(l.id))) {
      if (!g.milestones.some(m => m.locationId === location.id && m.kind === 'route')) issue(location.id, base+'progression.json', 'Route has no initial-access milestone.');
    }
    const sets = { milestone: new Set(milestones.keys()), capability: new Set(g.capabilities.map(c => c.id)), item: new Set(g.items.map(i => i.id)), pokemon: new Set(g.profiles.map(p => p.pokemonId)) };
    const checkRequirements = (requirements: Requirement, id: string, file: string) => {
      for (const leaf of leaves(requirements)) if (!sets[leaf.kind].has(leaf.id)) issue(id, base+file+'.json', `Unknown ${leaf.kind}: ${leaf.id}`);
    };
    for (const l of g.locations) checkRequirements(l.requirements, l.id, 'locations');
    for (const c of g.capabilities) checkRequirements(c.requirements, c.id, 'capabilities');
    for (const item of g.items) for (const source of item.sources) {
      checkRequirements(source.requirements, source.id, 'items');
      if (!locations.has(source.locationId)) issue(source.id, base+'items.json', 'Unknown item source location.');
      review(source.review, source.id, base+'items.json');
    }
    for (const s of g.sources) checkRequirements(s.requirements, s.id, 'sources');
    for (const e of g.evolutions) checkRequirements(e.requirements, e.id, 'evolutions');
    issues.push(...validateAcquisition(g, base));
  }
  return issues;
}
