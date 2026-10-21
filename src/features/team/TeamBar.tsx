import { useEffect, useRef, useState, type RefObject } from 'react';
import { Plus, X } from 'lucide-react';
import { pokemonIdentity } from '../../data/dataset';
import { PokemonSprite, PokemonTypes } from '../../components/PokemonIdentity';

type TeamBarActions = {
  activeSlot: number | null;
  onChoose: (slot: number) => void;
  onDetails: (id: string) => void;
  onRemove: (slot: number) => void;
};

function TeamBarCard({ id, index, activeSlot, onChoose, onDetails, onRemove }: TeamBarActions & {
  id: string | null;
  index: number;
}) {
  const name = id ? pokemonIdentity(id).name : null;
  const control = useRef<HTMLButtonElement>(null);
  return <article className={`team-bar-card ${id ? 'filled' : 'empty'} ${activeSlot === index ? 'active-slot' : ''}`} aria-label={`Team slot ${index + 1}${name ? ': ' + name : ': empty'}`}>
    <span className="team-bar-number" aria-hidden="true">{index + 1}</span>
    <div className="team-bar-identity">
      {id ? <><PokemonSprite id={id} /><PokemonTypes id={id} compact /></> : <>
        <span className="team-bar-question" aria-hidden="true">?</span>
        <Plus className="team-bar-plus" size={20} aria-hidden="true" />
      </>}
    </div>
    <button ref={control} className="card-link team-bar-name" aria-label={name ? `View ${name} details from team slot ${index + 1}` : `Add Pokémon to slot ${index + 1}`} onClick={() => id ? onDetails(id) : onChoose(index)}>
      {name ?? 'Add'}
    </button>
    {id && <button className="icon-button team-bar-remove" title={`Remove ${name}`} aria-label={`Remove ${name} from slot ${index + 1}`} onClick={() => {
      onRemove(index);
      control.current?.focus({ preventScroll: true });
    }}><X size={16} aria-hidden="true" /></button>}
  </article>;
}

export function TeamBar({ team, teamRef, ...actions }: TeamBarActions & {
  team: (string | null)[];
  teamRef: RefObject<HTMLDivElement | null>;
}) {
  const bar = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const teamElement = teamRef.current!;
    let frame = 0;
    const update = () => {
      frame = 0;
      setVisible(teamElement.getBoundingClientRect().bottom <= 0);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(teamElement);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [teamRef]);
  useEffect(() => {
    const root = document.documentElement;
    const barElement = bar.current!;
    const observer = new ResizeObserver(() => {
      root.style.setProperty('--team-bar-height', `${barElement.getBoundingClientRect().height}px`);
    });
    observer.observe(barElement);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--team-bar-height');
    };
  }, []);
  return <section ref={bar} className={`team-bar${visible ? ' visible' : ''}`} aria-label="Team overview" aria-hidden={!visible} inert={!visible}>
    <div className="team-bar-slots">{team.map((id, index) => <TeamBarCard key={index} id={id} index={index} {...actions} />)}</div>
  </section>;
}
