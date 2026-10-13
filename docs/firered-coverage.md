# Pokémon FireRed review coverage

Review date: 2026-10-12. Scope: Generation III FireRed, native Kanto and ordinary Sevii access. Source pin: pret/pokefirered commit `037335f4c725d7c9aecdac87066f2002b4bd7e14`. See [source locators and findings](firered-sources.md).

| Data | Reviewed coverage |
| --- | --- |
| Game and profiles | FireRed; all 386 catalogue species have a reviewed outcome; Kanto Dex order 1–151. |
| Type chart and bosses | All 17 Generation III types; eight Gyms, four Elite Four members, and Champion. First-clear caps checked against trainer parties. |
| Progression | 35 milestones cover the Kanto story and League, Fuji before Koga, early Tri-Pass trip, National Dex, Icefall Cave before Sapphire return, Sevii access, and optional HM05/Togepi rewards. |
| Locations and capabilities | 168 physical locations; rods, HMs, ferry access, Day Care, bicycle, and method gates. |
| Items and choices | 42 items, including both incenses, physical keys, evolution items, fossils, and finite prize choices. |
| Sources | 1,881 wild records, 35 other Pokémon sources, and 182 repeatable Day Care source records. Eight wireless Altering Cave alternatives are excluded. |
| Evolution and breeding | 181 of 184 pinned evolution transitions; all 12 player-trade edges are blocked. All 180 offspring rules cover 181 distinct offspring; hatch level 5; Ditto is not an offspring. |
| Exclusions | 194 base-family exclusions. The source-derived partition is 180 native paths, 12 player-trade targets, and 194 exclusions. |

The source-derived species partition is disjoint and covers all 386 profiles. A source path may depend on another source, evolution, or breeding rule. A real Network Machine availability solve must prove every member of the 180-species native partition. Focused tests also check early access, item and choice gates, and the starter-linked roamer release conditions.

The data does not track coin totals, exact capture totals, friendship values, or a roaming Pokémon's current route. It retains actual story, item, starter, and source gates. It excludes wireless Altering Cave alternatives, player trades, time-based Eevee evolutions (FireRed has no RTC), and Beauty evolution. Shedinja has the pinned free-party-space condition and no Poké Ball requirement. Its evolution rule is recorded, but Nincada has no native source.

Run `npx vitest run tests/firered.test.ts` for focused schema, source, access, transition-inventory, and species-outcome checks. FireRed is registered. See [game-data-progress.md](game-data-progress.md) for the all-game checks.

The Water Labyrinth egg is a possible gift after Five Island access, with the friendship opportunity retained. It does not require a later story event. The summit boulders require Strength before Moltres. The parent verified both facts against the pinned map and scripts.
