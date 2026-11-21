import { TypeBadge, TypeIcon, typeName } from '../../components/PokemonIdentity';
import type { compareTeams } from '../../domain/team/compare-teams';
import { useGameData } from '../planner/GameContext';

export type TeamsComparison = ReturnType<typeof compareTeams>;
export type TeamSummary = TeamsComparison['current'];

export const comparedTeams = [
  { key: 'current', name: 'Current team' },
  { key: 'draft', name: 'Second team' },
] as const;

export function CoverageComparison({ comparison }: { comparison: TeamsComparison }) {
  const only = { current: comparison.currentOnlyCoverage, draft: comparison.draftOnlyCoverage };
  return <section className="compare-block" aria-labelledby="compare-coverage-title">
    <h3 id="compare-coverage-title">Attack coverage</h3>
    <div className="compare-pair">{comparedTeams.map(({ key, name }) => {
      const summary = comparison[key];
      return <div key={key} className="compare-card">
        <h4>{name}</h4>
        {summary.memberCount === 0 ? <p className="muted">Add a Pokémon to see coverage.</p> : <>
          <p className="compare-figure"><strong>{summary.types.coveredTypes.length}</strong> of {summary.types.totalTypes} types covered</p>
          <p className="compare-label">Only this team covers</p>
          {only[key].length
            ? <ul className="type-counts compare-types">{only[key].map(type => <li key={type}><TypeBadge type={type} /></li>)}</ul>
            : <p className="muted">No types. The other team covers each of these types.</p>}
        </>}
      </div>;
    })}</div>
    <p className="analysis-note">Types only. Abilities, items, and moves are not included.</p>
  </section>;
}

function DefenseCell({ summary, type }: { summary: TeamSummary; type: string }) {
  if (summary.memberCount === 0) return <td className="compare-defense-empty"><span aria-hidden="true">–</span><span className="sr-only">No Pokémon</span></td>;
  const { weaknesses, resistances, immunities } = summary.types;
  const counts = [
    { status: 'weak', value: weaknesses[type] },
    { status: 'resist', value: resistances[type] },
    { status: 'immune', value: immunities[type] },
  ];
  const risk = weaknesses[type] >= 2 && weaknesses[type] > resistances[type] + immunities[type];
  const of = summary.memberCount;
  return <td className={risk ? 'defense-risk' : undefined}>
    <span className="sr-only">{counts.map(({ status, value }) => `${value} of ${of} ${status}`).join(', ')}.</span>
    <span className="defense-marks" aria-hidden="true">{counts.map(({ status, value }) =>
      <span key={status} className={`defense-mark ${value ? `defense-${status}` : 'compare-mark-zero'}`}>{value}</span>)}</span>
  </td>;
}

export function DefenseComparison({ comparison }: { comparison: TeamsComparison }) {
  const game = useGameData();
  return <section className="compare-block" aria-labelledby="compare-defense-title">
    <h3 id="compare-defense-title">Team defense</h3>
    <p className="compare-label" id="compare-defense-hint">Members that are weak, resist, or are immune to each attack type.</p>
    <div className="compare-table-wrap">
      <table className="compare-defense" aria-labelledby="compare-defense-title" aria-describedby="compare-defense-hint">
        <thead><tr>
          <th scope="col">Attack</th>
          {comparedTeams.map(({ key, name }) => <th key={key} scope="col">{name}<span className="compare-count">{comparison[key].memberCount} Pokémon</span></th>)}
        </tr></thead>
        <tbody>{game.typeChart.typeIds.map(type => <tr key={type}>
          <th scope="row"><span className="compare-type"><TypeIcon type={type} size={24} /><span>{typeName(type)}</span></span></th>
          <DefenseCell summary={comparison.current} type={type} />
          <DefenseCell summary={comparison.draft} type={type} />
        </tr>)}</tbody>
      </table>
    </div>
    <ul className="defense-legend" aria-hidden="true">
      <li><span className="defense-mark defense-weak">2</span>Weak</li>
      <li><span className="defense-mark defense-resist">1</span>Resist</li>
      <li><span className="defense-mark defense-immune">1</span>Immune</li>
      <li className="defense-hint">Counts in this order for each team</li>
    </ul>
  </section>;
}
