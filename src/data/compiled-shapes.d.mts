import type { ValidateFunction } from 'ajv';
import type { Dataset, SharedData } from '../domain/types';
export const checkShape: ValidateFunction<Dataset>;
export const checkSharedShape: ValidateFunction<SharedData>;
