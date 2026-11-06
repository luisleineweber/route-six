import { useEffect, useLayoutEffect, useRef, type ReactNode } from 'react';

/** Catalogue controls that stay below the team overview on wide screens. */
export function CatalogueFilters({ resetKey, statusFilters, children }: { resetKey: string; statusFilters?: ReactNode; children: ReactNode }) {
  // The marker keeps the natural position of the sticky controls.
  const marker = useRef<HTMLDivElement>(null);
  const anchor = useRef<HTMLDivElement>(null);
  const previousKey = useRef(resetKey);

  // Sticky positioning stays in CSS; this only marks the pinned state for styling.
  useEffect(() => {
    const start = marker.current!;
    const element = anchor.current!;
    let frame = 0;
    const update = () => {
      frame = 0;
      element.toggleAttribute('data-stuck', element.getBoundingClientRect().top - start.getBoundingClientRect().top > 0.5);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  useLayoutEffect(() => {
    const changed = previousKey.current !== resetKey;
    previousKey.current = resetKey;
    if (!changed || !window.matchMedia('(min-width: 40.001rem)').matches) return;
    const teamHeight = document.querySelector('.team-bar.visible')?.getBoundingClientRect().height ?? 0;
    const top = marker.current!.getBoundingClientRect().top;
    if (top < teamHeight) {
      window.scrollTo({ top: window.scrollY + top - teamHeight, behavior: 'instant' });
    }
  }, [resetKey]);

  return <div className="catalogue-filter-group">
    <div ref={marker} className="catalogue-filter-marker" aria-hidden="true" />
    <div ref={anchor} className="catalogue-filter-anchor">
      <div className="filters">{children}</div>
    </div>
    {statusFilters}
  </div>;
}
