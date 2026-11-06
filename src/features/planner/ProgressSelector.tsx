import * as Select from '@radix-ui/react-select';
import { Check, ChevronDown, ChevronUp, Route } from 'lucide-react';
import { TypeIcon } from '../../components/PokemonIdentity';
import type { ProgressCheckpointOption } from './progress-checkpoints';

function ProgressIdentity({ point }: { point: ProgressCheckpointOption }) {
  return <span className="progress-identity" aria-hidden="true">
    <span className="progress-symbol">{point.typeId ? <TypeIcon type={point.typeId} size={32} />
      : <Route size={22} className="progress-road-icon" />}</span>
    <span className="progress-copy"><strong>{point.title}</strong><span>{point.detail}</span></span>
  </span>;
}

export function ProgressSelector({ value, options, onChange }: {
  value: string; options: ProgressCheckpointOption[]; onChange: (id: string) => void;
}) {
  const selected = options.find(point => point.id === value);
  if (!selected) throw new Error(`Unknown progress selection: ${value}`);
  return <Select.Root value={value} onValueChange={onChange}>
    <Select.Trigger id="milestone" className="progress-trigger" aria-labelledby="milestone-label" aria-describedby="milestone-hint">
      <Select.Value><ProgressIdentity point={selected} /><span className="sr-only">{selected.label}</span></Select.Value>
      <Select.Icon className="progress-chevron"><ChevronDown size={18} aria-hidden="true" /></Select.Icon>
    </Select.Trigger>
    <Select.Portal>
      <Select.Content className="progress-dropdown" aria-labelledby="milestone-label" position="popper" align="start" sideOffset={8} collisionPadding={12}>
        <Select.ScrollUpButton className="progress-scroll"><ChevronUp size={16} aria-hidden="true" /></Select.ScrollUpButton>
        <Select.Viewport className="progress-viewport">
          {options.map(point => <Select.Item key={point.id} value={point.id} textValue={point.label} className="progress-option">
            <ProgressIdentity point={point} />
            <Select.ItemText asChild><span className="sr-only">{point.label}</span></Select.ItemText>
            <Select.ItemIndicator className="progress-selected"><Check size={18} aria-hidden="true" /></Select.ItemIndicator>
          </Select.Item>)}
        </Select.Viewport>
        <Select.ScrollDownButton className="progress-scroll"><ChevronDown size={16} aria-hidden="true" /></Select.ScrollDownButton>
      </Select.Content>
    </Select.Portal>
  </Select.Root>;
}
