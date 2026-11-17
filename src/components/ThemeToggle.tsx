import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../theme/use-theme';

/**
 * Icon-only square button. It shows the theme that a press selects: a moon in
 * the light theme and a sun in the dark theme. CSS picks the icon from
 * data-theme, so the prerendered page shows the right one before hydration.
 */
export function ThemeToggle() {
  const [theme, toggle] = useTheme();
  return <button type="button" className="theme-toggle" aria-label="Dark theme"
    aria-pressed={theme === 'dark'} title={theme === 'dark' ? 'Use light theme' : 'Use dark theme'} onClick={toggle}>
    <Moon className="theme-toggle-moon" size={22} aria-hidden="true" />
    <Sun className="theme-toggle-sun" size={22} aria-hidden="true" />
  </button>;
}
