# Team PNG base stats

Reviewed on 28 October 2026. This design applies to the Team Planner PNG.
The Progress Planner keeps its existing coloured posters, sources and evolution
details. It does not load round type icons or draw base stat charts.

The Team PNG uses neutral cards with a faint dot pattern. It puts the sprite
and chart in separate areas. Highest values, including ties, use red text
without a badge. Small type icons retain their names. Long form names wrap.
All six cards use the same height. Empty slots remain visible.

## Maintained facts

The seven JSON record files in `data/base-stats/` contain 721 species and
28 selectable forms. Each record keeps its reference IDs and review date.
Identical stat sets share a row with explicit native table IDs. The table
map in `src/data/base-stats.ts` names all 24 supported games. Missing facts
produce a visible export error. There is no runtime service or data importer.

Keep these files maintained by hand. Add new facts with the source table,
native form index and review date. Do not replace an older game's stats with
current values. `references.json` pins PKHeX revision
`641c26ba100225f3605e5a44b61b3b16e15a3774` and Emerald revision
`731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`.

The record order is HP, Attack, Defense, Speed, Special Attack, Special Defense.
Generation I has five values: HP, Attack, Defense, Speed, Special. The chart
uses one Special axis in Generation I. Later charts put Special Defense and
Special Attack on the left side. All charts use a fixed 0–255 range without
printed scale values.

The native personal tables cover 11,194 species and form selections across the
24 games. All 386 Emerald species were checked against the pinned species
table. The 385 non-Deoxys entries match. The shared Deoxys entry contains its
Normal Forme; Emerald uses Speed Forme. The native Emerald, FireRed and
LeafGreen stat sets remain separate. Other checks cover the Generation VI
Raichu change, Kyurem fusion forms and Pumpkaboo/Gourgeist sizes.
Emerald's native Speed Forme also matches `sDeoxysBaseStats` in the pinned
[Pokémon stat calculation source](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/pokemon.c#L1866).

## Checks

`npm run data:check` checks stat coverage with the other local data checks.
Focused tests check native values, invalid records, form differences, tied
highest values, sprite bounds and long names. The renderer samples are in
`output/stat-chart-implementation/`. The before and after Progress PNGs have
the same SHA-256 hash. This comparison uses the same model and current source
renderer in both captures.
