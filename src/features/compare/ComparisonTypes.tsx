import { TypeBadge, TypeIcon, typeName } from '../../components/PokemonIdentity';
import type { compareTeams } from '../../domain/team/compare-teams';
import { useGameData } from '../planner/GameContext';

export type TeamsComparison = ReturnType<typeof compareTeams>;
export type TeamSummary = TeamsComparison['current'];

export const comparedTeams = [
  { key: 'current', name: 'Current team' },
  { key: 'draft', name: 'Second team' },
] as const;

const defenses = [
  { key: 'weaknesses', status: 'weak', label: 'Weak' },
  { key: 'resistances', status: 'resist', label: 'Resist' },
  { key: 'immunities', status: 'immune', label: 'Immune' },
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
            : <p className="muted">None</p>}
        </>}
      </div>;
    })}</div>
    <p className="analysis-note">Types only. Abilities, items, and moves are not included.</p>
  </section>;
}

function DefenseCells({ summary, type }: { summary: TeamSummary; type: string }) {
  const { weaknesses, resistances, immunities } = summary.types;
  const risk = weaknesses[type] >= 2 && weaknesses[type] > resistances[type] + immunities[type];
  return defenses.map(({ key, status }) => {
    const value = summary.types[key][type];
    return summary.memberCount === 0
      ? <td key={key} className="compare-defense-empty"><span aria-hidden="true">–</span><span className="sr-only">No Pokémon</span></td>
      : <td key={key} className={risk ? 'defense-risk' : undefined}>
        <span className="sr-only">{value} of {summary.memberCount}</span>
        <span aria-hidden="true" className={`defense-mark ${value ? `defense-${status}` : 'compare-mark-zero'}`}>{value}</span>
      </td>;
  });
}

export function DefenseComparison({ comparison }: { comparison: TeamsComparison }) {
  const game = useGameData();
  return <section className="compare-block" aria-labelledby="compare-defense-title">
    <h3 id="compare-defense-title">Team defense</h3>
    <div className="compare-table-wrap">
      <table className="compare-defense" aria-labelledby="compare-defense-title">
        <colgroup span={1} />
        {comparedTeams.map(({ key }) => <colgroup key={key} span={defenses.length} />)}
        <thead><tr>
          <th scope="col" rowSpan={2}>Attack</th>
          {comparedTeams.map(({ key, name }) => <th key={key} scope="colgroup" colSpan={defenses.length}>{name}<span className="compare-count">{comparison[key].memberCount} Pokémon</span></th>)}
        </tr><tr className="compare-defense-labels">
          {comparedTeams.flatMap(({ key }) => defenses.map(({ status, label }) => <th key={`${key}-${status}`} scope="col">{label}</th>))}
        </tr></thead>
        <tbody>{game.typeChart.typeIds.map(type => <tr key={type}>
          <th scope="row"><span className="compare-type"><TypeIcon type={type} size={24} /><span>{typeName(type)}</span></span></th>
          <DefenseCells summary={comparison.current} type={type} />
          <DefenseCells summary={comparison.draft} type={type} />
        </tr>)}</tbody>
      </table>
    </div>
  </section>;
}
