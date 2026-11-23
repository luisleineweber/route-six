import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { pokemonIdentity } from '../../data/dataset';
import { PokemonSprite } from '../../components/PokemonIdentity';

/** Asks which team member leaves when the team is full and a new Pokémon joins. */
export function SwapTeamDialog({ pokemonId, team, onSwap, onClose }: {
  pokemonId: string | null; team: (string | null)[]; onSwap: (slot: number) => void; onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (pokemonId && !dialog.current?.open) {
      dialog.current?.showModal();
      // showModal() moves focus to the first focusable element, the Cancel button.
      // Focus the first replacement choice after it; with no choice, Cancel keeps focus.
      dialog.current?.querySelector<HTMLButtonElement>('.swap-option:not(:disabled)')?.focus();
    } else if (!pokemonId) dialog.current?.close();
  }, [pokemonId]);
  const incoming = pokemonId ? pokemonIdentity(pokemonId) : null;
  const hasChoice = team.some(memberId => memberId !== null && memberId !== pokemonId);
  return <dialog ref={dialog} className="swap-dialog" aria-labelledby="swap-title" aria-describedby="swap-hint" onCancel={onClose} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    {incoming && <>
      <div className="swap-head">
        <PokemonSprite id={pokemonId!} />
        <div><h2 id="swap-title">Swap in {incoming.name}</h2><p id="swap-hint">{hasChoice ? 'Select the team member to replace.' : `Every slot already has ${incoming.name}.`}</p></div>
        <button type="button" className="icon-button" onClick={onClose} aria-label="Cancel swap"><X size={20} aria-hidden="true" /></button>
      </div>
      <ul className="swap-options">{team.map((memberId, slot) => memberId && <li key={slot}>
        {/* A slot that already holds the incoming Pokémon would not change the team. */}
        <button type="button" className="swap-option" disabled={memberId === pokemonId} onClick={() => onSwap(slot)}
          aria-label={memberId === pokemonId ? `${incoming.name} is already in slot ${slot + 1}` : `Replace ${pokemonIdentity(memberId).name} in slot ${slot + 1}`}>
          <span className="slot-number" aria-hidden="true">{slot + 1}</span>
          <PokemonSprite id={memberId} />
          <span className="swap-option-name">{pokemonIdentity(memberId).name}</span>
        </button>
      </li>)}</ul>
    </>}
  </dialog>;
}
