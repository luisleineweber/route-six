import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { analyzeTypes, damageMultiplier } from '../../domain/team/analyze-types';
import { pokemonIdentity } from '../../data/dataset';
import { useGameData } from '../planner/GameContext';
import { TypeIcon, typeName } from '../../components/PokemonIdentity';

const markSymbols: Record<number, string> = { 0: '0', 0.25: '¼', 0.5: '½', 1: '', 2: '2', 4: '4' };
const markSymbol = (multiplier: number) => markSymbols[multiplier] ?? `${multiplier}`;

export function TypeAnalysis({ team }: { team: (string | null)[] }) {
  const [initiallyOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth > 480);
  const game = useGameData();
  const members = team.filter((id): id is string => id !== null);
  const analysis = analyzeTypes(game, members);
  const covered = new Set(analysis.coveredTypes);
  return <details className="analysis" open={initiallyOpen}>
    <summary><h2>Type analysis</h2><ChevronDown size={20} aria-hidden="true" /></summary>
    {!members.length ? <p className="muted">Add a Pokémon to see weaknesses and attack coverage.</p> : <>
      <div className="defense-chart">
        <h3>Team defense</h3>
        <ul className="defense-grid" aria-label="Defense against each attack type">{game.typeChart.typeIds.map(type => {
          const summary = `${typeName(type)}: ${analysis.weaknesses[type]} weak, ${analysis.resistances[type]} resist, ${analysis.immunities[type]} immune`;
          const risk = analysis.weaknesses[type] >= 2 && analysis.weaknesses[type] > analysis.resistances[type] + analysis.immunities[type];
          return <li key={type} className={`defense-type${risk ? ' defense-risk' : ''}`}>
            <TypeIcon type={type} size={28} />
            <span className="sr-only">{summary}.</span>
            <span className="sr-only">{team.map((id, index) => id ? `Slot ${index + 1}, ${pokemonIdentity(id).name}: ${damageMultiplier(game, type, id)} times damage. ` : `Slot ${index + 1}: empty. `).join('')}</span>
            <span className="defense-marks" aria-hidden="true" title={summary}>{Array.from({length:6}, (_, index) => {
              const id = team[index];
              const multiplier = id ? damageMultiplier(game, type, id) : 1;
              const status = !id ? 'empty' : multiplier === 0 ? 'immune' : multiplier < 1 ? 'resist' : multiplier > 1 ? 'weak' : 'neutral';
              return <span key={index} className={`defense-mark defense-${status}`} title={id ? `${pokemonIdentity(id).name}: ${multiplier}× ${typeName(type)} damage` : 'Empty slot'}>{id ? markSymbol(multiplier) : ''}</span>;
            })}</span>
          </li>;
        })}</ul>
        <ul className="defense-legend" aria-hidden="true">
          <li><span className="defense-mark defense-weak">2</span>Weak</li>
          <li><span className="defense-mark defense-resist">½</span>Resists</li>
          <li><span className="defense-mark defense-immune">0</span>Immune</li>
          <li><span className="defense-mark defense-neutral" />Neutral</li>
          <li className="defense-hint">Slots 1–6, left to right</li>
        </ul>
      </div>
      <div className="attack-chart"><h3>Attack coverage <span className="count">{covered.size} / {analysis.totalTypes}</span></h3>
        <ul className="coverage-strip">{game.typeChart.typeIds.map(type => <li key={type} className={covered.has(type) ? 'covered' : 'uncovered'} title={`${typeName(type)}: ${covered.has(type) ? 'covered' : 'not covered'}`}>
          <TypeIcon type={type} size={28} /><span className="sr-only">{typeName(type)}: {covered.has(type) ? 'covered' : 'not covered'}</span></li>)}</ul>
        {covered.size < analysis.totalTypes && <p className="coverage-gaps" aria-hidden="true">Not covered: {game.typeChart.typeIds.filter(type => !covered.has(type)).map(typeName).join(', ')}</p>}
      </div>
      <p className="analysis-note">Types only. Abilities, items, and moves are not included.</p>
    </>}
  </details>;
}
