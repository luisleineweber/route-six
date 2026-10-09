import { dataset } from '../../data/dataset';
import { getAvailability } from '../../domain/availability';
import type { AvailabilityQuery } from '../../domain/types';

self.onmessage = (event: MessageEvent<{ id: number; query: AvailabilityQuery }>) => {
  try {
    const result = getAvailability(dataset, event.data.query);
    self.postMessage({ id: event.data.id, result });
  } catch (error) {
    self.postMessage({ id: event.data.id, error: error instanceof Error ? error.message : String(error) });
  }
};
