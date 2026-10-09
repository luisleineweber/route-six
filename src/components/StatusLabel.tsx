import { Check, Clock3, LockKeyhole, CircleMinus } from 'lucide-react';
import type { AvailabilityEntry } from '../domain/types';

export const statusNames = { available: 'Available now', later: 'Available later', blocked: 'Condition blocked', unavailable: 'Unavailable in Emerald' };
export const statusIcons = { available: Check, later: Clock3, blocked: LockKeyhole, unavailable: CircleMinus };
export function StatusLabel({ status }: { status: AvailabilityEntry['status'] }) {
  const Icon = statusIcons[status];
  return <span className={`status-label status-${status}`}><Icon size={15} aria-hidden="true" />{statusNames[status]}</span>;
}
