import type { Requirement } from './types';

export function leaves(requirement: Requirement): Exclude<Requirement, { requirements: Requirement[] }>[] {
  return 'requirements' in requirement ? requirement.requirements.flatMap(leaves) : [requirement];
}
