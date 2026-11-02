import { useState } from 'react';
import { Download } from 'lucide-react';
import type { AvailabilitySnapshot } from '../../domain/types';
import { useGameData } from '../planner/GameContext';
import type { PlannerState } from '../planner/state';

export function ExportTeamButton({ state, progressPage, snapshot }: {
  state: PlannerState; progressPage: boolean; snapshot: AvailabilitySnapshot | null;
}) {
  const game = useGameData();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState(false);
  const disabled = busy || state.team.every(id => id === null) || (progressPage && !snapshot);
  async function exportTeam() {
    setBusy(true); setMessage(''); setError(false);
    try {
      const [{ buildTeamExport }, { downloadPng, renderTeamPng }] = await Promise.all([
        import('./export-model'), import('./render-png'),
      ]);
      const model = buildTeamExport(game, state, progressPage, snapshot);
      const blob = await renderTeamPng(model);
      downloadPng(blob, model.filename);
      setMessage('Team PNG is ready.');
    } catch (cause) {
      console.error('Team PNG export failed:', cause);
      setError(true); setMessage('Could not export the team. Try again.');
    } finally { setBusy(false); }
  }
  return <div className="team-export">
    <button className="secondary-button" disabled={disabled} onClick={exportTeam}>
      <Download size={18} aria-hidden="true" /><span className="export-label">{busy ? 'Creating PNG...' : 'Export team as PNG'}</span><span className="export-label-short">{busy ? 'Creating...' : 'Export PNG'}</span>
    </button>
    <p className="small muted" role={error ? 'alert' : 'status'}>{message}</p>
  </div>;
}
