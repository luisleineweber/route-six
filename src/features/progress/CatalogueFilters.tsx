import { useLayoutEffect, useRef, type ReactNode } from 'react';

/** One set of controls, with a placeholder only as tall as the controls. */
export function CatalogueFilters({ resetKey, statusFilters, children }: { resetKey: string; statusFilters?: ReactNode; children: ReactNode }) {
  const anchor = useRef<HTMLDivElement>(null);
  const filters = useRef<HTMLDivElement>(null);
  const previousKey = useRef(resetKey);

  useLayoutEffect(() => {
    const element = anchor.current!;
    const controls = filters.current!;
    const desktop = window.matchMedia('(min-width: 40.001rem)');
    let frame = 0;
    const update = () => {
      frame = 0;
      const teamBar = document.querySelector('.team-bar.visible');
      const top = teamBar?.getBoundingClientRect().bottom ?? 0;
      const rect = element.getBoundingClientRect();
      const pinned = desktop.matches && teamBar !== null && rect.top <= top;
      element.toggleAttribute('data-pinned', pinned);
      element.style.height = pinned ? `${controls.getBoundingClientRect().height}px` : '';
      element.style.setProperty('--filter-left', `${rect.left}px`);
      element.style.setProperty('--filter-width', `${rect.width}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(controls);
    observer.observe(element);
    // TeamBar sets its visible class after each scroll update.
    const teamBar = document.querySelector('.team-bar');
    const visibility = new MutationObserver(schedule);
    if (teamBar) visibility.observe(teamBar, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    update();
    return () => {
      observer.disconnect();
      visibility.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  useLayoutEffect(() => {
    const changed = previousKey.current !== resetKey;
    previousKey.current = resetKey;
    if (!changed || !window.matchMedia('(min-width: 40.001rem)').matches) return;
    const element = anchor.current!;
    const teamHeight = document.querySelector('.team-bar.visible')?.getBoundingClientRect().height ?? 0;
    const top = element.getBoundingClientRect().top;
    if (top < teamHeight) {
      window.scrollTo({ top: window.scrollY + top - teamHeight, behavior: 'instant' });
    }
  }, [resetKey]);

  return <div className="catalogue-filter-group">
    <div ref={anchor} className="catalogue-filter-anchor">
      <div ref={filters} className="filters">{children}</div>
    </div>
    {statusFilters}
  </div>;
}
