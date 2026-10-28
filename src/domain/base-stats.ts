/** Native game values. Generation I has one Special stat. */
export type BaseStats = readonly [number, number, number, number, number]
  | readonly [number, number, number, number, number, number];

export interface StatAxis { label: string; value: number }

export function statAxes(values: BaseStats): StatAxis[] {
  const indices = values.length === 5 ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 5, 4];
  const labels = values.length === 5 ? ['HP', 'Atk', 'Def', 'Spe', 'Spc'] : ['HP', 'Atk', 'Def', 'Spe', 'SpD', 'SpA'];
  return indices.map((index, i) => ({ label: labels[i], value: values[index] }));
}
