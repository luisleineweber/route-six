import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useGameData } from '../features/planner/GameContext';
import type { AvailabilitySnapshot } from '../domain/types';
import { AcquisitionPathBody } from './AcquisitionPathBody';
import { distinctPathOptions, groupAcquisitionPaths, pathOptionName, breedingParentName } from './acquisition-presentation';

type PathGroup = ReturnType<typeof groupAcquisitionPaths>[number];

export function AcquisitionPathGroup({ group, snapshot }: { group: PathGroup; snapshot: AvailabilitySnapshot }) {
  const game = useGameData();
  const [count, setCount] = useState(6);
  const options = distinctPathOptions(group.paths, snapshot);
  const minimumLevel = Math.min(...group.paths.map(path => path.minimumLevel));
  return <details className="path-details">
    <summary>
      <span className="path-title">{group.title}<span className="path-subtitle path-method">{group.rodIcon && <img className="rod-icon" src={group.rodIcon} alt="" width={24} height={24} />}<span>{group.method}{options.length > 1 && ` · ${options.length} options`}</span></span></span>
      <span className="path-meta">From Lv. {minimumLevel}</span>
      <ChevronDown className="chevron" size={18} aria-hidden="true" />
    </summary>
    {options.length === 1 ? <AcquisitionPathBody path={options[0]} snapshot={snapshot} /> : <div className="path-options">
      {options.slice(0, count).map((path, index) => <details className="path-option" key={path.id} open={index === 0}>
        <summary><span>{!path.evolutionIds.length && path.breedingSteps.length
          ? path.breedingSteps[0].parents.map(parent => breedingParentName(parent,snapshot)).join(' + ')
          : pathOptionName(game, path)}<span className="path-subtitle">Option {index + 1} · From Lv. {path.minimumLevel}</span></span><ChevronDown className="chevron" size={16} aria-hidden="true" /></summary>
        <AcquisitionPathBody path={path} snapshot={snapshot} />
      </details>)}
      {options.length > count && <button className="secondary-button" onClick={() => setCount(count + 6)}>Show more options ({options.length - count} remaining)</button>}
    </div>}
  </details>;
}
