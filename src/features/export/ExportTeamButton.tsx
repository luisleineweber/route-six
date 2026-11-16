import { useEffect, useState } from 'react';
import { Check, Download } from 'lucide-react';
import type { AvailabilitySnapshot } from '../../domain/types';
import { useGameData } from '../planner/GameContext';
import type { PlannerState } from '../planner/state';

const successMs = 2000;

export function ExportTeamButton({ state, progressPage, snapshot }: {
  state: PlannerState; progressPage: boolean; snapshot: AvailabilitySnapshot | null;
}) {
  const game = useGameData();
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const disabled = busy || state.team.every(id => id === null) || (progressPage && !snapshot);
  useEffect(() => {
    if (!saved) return;
    const timer = window.setTimeout(() => setSaved(false), successMs);
    return () => window.clearTimeout(timer);
  }, [saved]);
  async function exportTeam() {
    setBusy(true); setSaved(false); setError('');
    try {
      const [{ buildTeamExport }, { downloadPng, renderTeamPng }] = await Promise.all([
        import('./export-model'), import('./render-png'),
      ]);
      const model = buildTeamExport(game, state, progressPage, snapshot);
      const blob = await renderTeamPng(model);
      downloadPng(blob, model.filename);
      setSaved(true);
    } catch (cause) {
      console.error('Team PNG export failed:', cause);
      setError('Could not export the team. Try again.');
    } finally { setBusy(false); }
  }
  return <div className="team-export">
    <button className={`secondary-button export-button${saved ? ' export-saved' : ''}`} disabled={disabled} onClick={exportTeam}>
      <span className="export-icons" aria-hidden="true"><Download size={18} className="export-icon" /><Check size={18} className="export-done-icon" /></span>
      <span className="export-label">{busy ? 'Creating PNG...' : 'Export team as PNG'}</span><span className="export-label-short">{busy ? 'Creating...' : 'Export PNG'}</span>
    </button>
    <p className="sr-only" role="status">{saved ? 'Team PNG saved.' : ''}</p>
    {error && <p className="small" role="alert">{error}</p>}
  </div>;
}
