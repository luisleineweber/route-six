import { analyzeTypes } from '../../domain/team/analyze-types';
import { emerald } from '../../data/dataset';
import { TypeBadge, TypeIcon, typeName } from '../../components/PokemonIdentity';

function TypeCounts({ counts, empty }: { counts: Record<string, number>; empty: string }) {
  const types = emerald.typeChart.typeIds.filter(type => counts[type]).sort((a, b) => counts[b] - counts[a]);
  if (!types.length) return <span className="muted">{empty}</span>;
  return <ul className="type-counts">{types.map(type => <li key={type}><TypeBadge type={type} /><span className="type-count">×{counts[type]}</span></li>)}</ul>;
}

export function TypeAnalysis({ team }: { team: string[] }) {
  const analysis = analyzeTypes(emerald, team);
  const covered = new Set(analysis.coveredTypes);
  return <section className="analysis" aria-labelledby="analysis-title">
    <h2 id="analysis-title">Type analysis</h2>
    {!team.length ? <p className="muted">Add a Pokémon to see weaknesses and attack coverage.</p> : <>
      <p className="muted">Types only. Abilities, items, and learned moves are not included.</p>
      <dl className="analysis-rows">
        <div>
          <dt>Attack coverage</dt>
          <dd>
            <p><strong className="coverage-number">{covered.size} of {analysis.totalTypes}</strong> types can be hit super effectively by your team’s types.</p>
            <ul className="coverage-strip">{emerald.typeChart.typeIds.map(type => <li key={type} className={covered.has(type) ? 'covered' : 'uncovered'} title={`${typeName(type)}: ${covered.has(type) ? 'covered' : 'not covered'}`}>
              <TypeIcon type={type} size={28} /><span className="sr-only">{typeName(type)}: {covered.has(type) ? 'covered' : 'not covered'}</span></li>)}</ul>
          </dd>
        </div>
        <div><dt>Weak to</dt><dd><TypeCounts counts={analysis.weaknesses} empty="No weaknesses." /></dd></div>
        <div><dt>Resists</dt><dd><TypeCounts counts={analysis.resistances} empty="No resistances." /></dd></div>
        <div><dt>Immune to</dt><dd><TypeCounts counts={analysis.immunities} empty="No immunities." /></dd></div>
        <div><dt>Repeated types</dt><dd><TypeCounts counts={analysis.repeatedTypes} empty="No repeated types." /></dd></div>
      </dl>
      <p className="muted">×2 means two team members.</p>
    </>}
  </section>;
}
