import type { CSSProperties, ReactNode } from 'react';

// The Route Six route, in the order a player walks it. The six points are the six team slots.
const route = 'M46 10H30C18 10 12 20 12 32V38C12 48 20 54 32 54S52 48 52 38 44 24 34 24H14';
// Each point has its approximate place on the route (0 to 1), so it lights when the runner arrives.
const points = [[46, 10, 0], [24, 11, 0.15], [12, 32, 0.29], [23, 53, 0.45], [49, 48, 0.64], [34, 24, 0.86]] as const;

export type LoadingMarkSize = 'sm' | 'md' | 'lg';

/** The Route Six mark as a loader: a runner walks the route and lights the six team points in turn. */
export function LoadingMark({ size = 'md' }: { size?: LoadingMarkSize }) {
  return <svg className={`loading-mark loading-mark-${size}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
    <path className="loading-mark-track" d={route} />
    <path className="loading-mark-runner" d={route} pathLength={100} />
    {points.map(([cx, cy, at]) => <circle key={`${cx}-${cy}`} className="loading-mark-point" cx={cx} cy={cy} r={5} style={{ '--at': at } as CSSProperties} />)}
  </svg>;
}

/** A status line for a wait inside the page. It appears after a short delay, so fast checks do not flash. */
export function LoadingNote({ title, detail, className = '' }: { title: string; detail?: ReactNode; className?: string }) {
  return <div className={`loading-note ${className}`} role="status">
    <LoadingMark size="md" />
    <p className="loading-note-copy"><strong>{title}</strong>{detail && <span>{detail}</span>}</p>
  </div>;
}

/** A placeholder bar that shows where content will appear. */
export function SkeletonLine({ width }: { width?: string }) {
  return <span className="skeleton-line" style={width ? { inlineSize: width } : undefined} aria-hidden="true" />;
}
