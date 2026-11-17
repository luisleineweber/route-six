import { Monitor, Moon, Sun } from 'lucide-react';
import { useThemePreference } from '../theme/use-theme-preference';
import type { ThemePreference } from '../theme/theme';

const options = [
  { id: 'system', name: 'Match system', Icon: Monitor },
  { id: 'light', name: 'Light', Icon: Sun },
  { id: 'dark', name: 'Dark', Icon: Moon },
] as const satisfies readonly { id: ThemePreference; name: string; Icon: unknown }[];

/** Icon-only theme control. Native radios give arrow-key selection and the checked state. */
export function ThemeSwitch() {
  const [choice, select] = useThemePreference();
  return <div className="theme-switch" role="radiogroup" aria-label="Colour theme">
    {options.map(({ id, name, Icon }) => <label key={id} title={name}>
      <input type="radio" name="colour-theme" value={id} className="sr-only"
        checked={choice === id} onChange={() => select(id)} />
      <Icon size={20} aria-hidden="true" />
      <span className="sr-only">{name}</span>
    </label>)}
  </div>;
}
