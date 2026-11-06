# Pokémon Platinum source review

Current data review: 2026-10-17. Platinum is active in both planners.
See [the progress review](platinum-progress-review.md) for the completed source
joins, native scope, record counts, and checks. The initial source inventory
below dates from 2026-10-13. Its open-state labels are historical.

## Pinned primary source

Use pret/pokeplatinum at revision `fe1ea418a7364c93daf0d07ae55e195452d8803c` (the `main` head observed on 2026-10-13). The source targets Pokémon Platinum. All links below pin this exact commit, not the moving branch.

Base URL: https://github.com/pret/pokeplatinum/tree/fe1ea418a7364c93daf0d07ae55e195452d8803c

The local review checkout is at the same commit. Its Platinum species records include `res/pokemon/turtwig/data.json` and `res/pokemon/giratina/data.json`. Turtwig establishes types, gender ratio, egg groups, hatch cycles, evolution, and offspring fields. Giratina establishes its separate Origin Forme data. Data in `res/prebuilt` is compiled game data, not a readable full source for every record.

## Thirteen collection locators

These are exact source locators at the pinned revision. The broad locator is deliberate where the collection spans many per-map or per-species files. Do not infer completeness from one example.

| Planner collection | Primary source locator | Review state |
| --- | --- | --- |
| game | `res/field/scripts/scripts_twinleaf_town.s`, `scripts_battles.s`, `scripts_battle_frontier.s`, `include/constants/`, and the root `README.md`. The repo has no single game metadata record. | Locator set found; facts not yet fully transcribed. |
| profiles | `res/pokemon/<species>/data.json` (types, gender ratio, Egg Groups, breeding hatch cycles); embedded `pokedex_data` in `res/pokemon/<species>/data.json` (names and form data); `include/constants/species.h` for IDs. | Exact species coverage and Sinnoh order still need full review. |
| type chart | `src/battle/battle_lib.c`, `src/applications/poketch/move_tester/main.c`; type IDs in `include/constants/pokemon.h`. | Verified: the game chart has the 17 pre-Fairy types. |
| progression | `res/field/scripts/*.s`, `res/field/maps/` map script assignments, `include/constants/flags.h`, and `include/constants/vars.h`. | Not yet transcribed. Need mandatory event dependency review. |
| bosses | `res/trainers/data/<trainer>.json` trainer party data and `res/field/scripts/scripts_battles.s` plus Gym scripts. | Not yet transcribed; confirm each leader's Platinum party and badge event. |
| locations | `res/field/maps/data/` map data, `res/field/scripts/scripts.order` and `scripts_*.s`, and `res/field/encounters/encounters.order`. | Not yet transcribed. |
| capabilities | `res/field/scripts/*.s`, `src/field/field_system.c`, and badge/HM constants in `include/constants/`. | Not yet transcribed; HM and field-action gates need route checks. |
| items | `res/items/data/*.json`, item object events in `res/field/scripts/scripts_*.s`, and shop stock in `res/field/scripts/scripts_*_mart.s`. | Not yet transcribed. Need acquisition locations, quantities, and consumed/held distinction. |
| choices | `res/field/scripts/*.s`, `res/field/maps/` scripts, and `res/items/data/*.json`. | Not yet transcribed. Include starter, fossil, one-time gifts, and held-item choices only when source proves them. |
| sources | `res/field/encounters/encounters_*.json`, `res/field/encounters/encdata_ex.order`, `res/field/scripts/*.s`, `res/pokemon/<species>/data.json`, and item/trainer data above. | Not yet transcribed. Encounter tables include method-specific and dynamic pools. |
| breeding rules | `src/overlay005/daycare.c` (compatibility, offspring, Egg_CreateEgg at line 668); species `egg_groups`, `offspring`, and `hatch_cycles` in `res/pokemon/<species>/data.json`; `include/constants/daycare.h` and Egg Group constants. | Verified: special incense offspring and game-specific Day Care rules need complete transcription. Hatch level is level 1: `Egg_CreateEgg` calls `Pokemon_InitWith(..., 1, ...)` at `src/overlay005/daycare.c:668-670`. |
| evolutions | `res/pokemon/<species>/data.json` `evolutions` arrays; trigger definitions in `include/constants/evolution.h` (or matching evolution constants header). | Not yet transcribed. The source table includes EVO_LEVEL_KNOW_MOVE, EVO_LEVEL_SPECIES_IN_PARTY, EVO_LEVEL_ICE_ROCK, EVO_LEVEL_MAGNETIC_FIELD, held-item level-up, and held-item trade triggers. Schema v2 lacks move-known, party-species, location/environment, and held-item level-up behavior. Check whether held-item trade and gendered item evolution map cleanly before use. Friendship, beauty, stats, personality, gender, and day/night conditions already have schema forms. |
| exclusions | The full native species roster from encounter, event, prize, fossil, trade, and postgame sources above, compared with all supported species. | Not yet established. No exclusion records authored. |

The `src/battle/battle_lib.c` type effectiveness entries explicitly include Ghost and Dark as not very effective against Steel (lines 2493 and 2501 at the pinned revision). This supports the pre-Generation VI chart. Platinum has no Fairy type. The chart file records all neutral cells explicitly.

## Verified facts and open questions

### Verified

- The pinned repository is `pret/pokeplatinum`; observed revision: `fe1ea418a7364c93daf0d07ae55e195452d8803c`.
- `res/pokemon/turtwig/data.json` contains game species details, Egg Groups, its level evolution, and its offspring species.
- `res/pokemon/giratina/data.json` includes distinct Origin Forme data, while the species identity remains Giratina.
- Platinum has the 17-type chart. Ghost and Dark attacks do half damage to Steel in this game.
- The repo's readable species records combine several fields needed for profiles, breeding, and evolution. Profile `types`/genders/Egg Groups cannot be safely populated from shared Gen III profiles.

### Open; do not publish as reviewed game data yet

- Exact native supported species list and the Sinnoh regional number sequence (Platinum's expanded Sinnoh Dex differs from Diamond/Pearl).
- Full route/event dependency graph, including optional branches, one-way story changes, postgame, and Battle Zone access.
- Complete Platinum encounter coverage: regular methods, time-of-day tables, swarms, Poké Radar, Honey Trees, Great Marsh daily rotations, Trophy Garden daily species, dual-slot GBA encounters, fishing rods, gifts, static encounters, in-game trades, roaming Mesprit, and event-only Pokémon.
- Item and stone counts and source methods; possible finite-use special objects.
- Exact boss levels/parties and Gym specialty fields.
- National Dex content gate and postgame access; battle facility rental Pokémon are not player sources.
- All version-exclusive or externally distributed species. Do not author exclusions until the scope and each species are checked.

## Required shared model work

This agent cannot edit shared schema, identities, references, domain code, registry, or assets. Parent must resolve these before registration.

1. Add shared identities through National Dex #493, including introduced-generation metadata and reviewed names. Platinum profiles need Gen I-IV species identities. Current shared catalogue stops at #386.
2. Add a species form model and explicit form IDs to profiles, sources, evolution rules, team identity, and sprite selection. Do not duplicate National Dex identities. Platinum has form-dependent data, including Giratina Altered/Origin and additional form families. Audit `res/pokemon/*/data.json` form data before final scope.
3. Add evolution trigger values and domain rules for move-known, party-species present, location/environment, held-item level-up, and trade while holding an item. The source data also has species/gender-specific item evolutions. Existing schema already represents friendship, beauty, stats, personality, gender, day/night, and co-products.
4. Add explicit encounter method support and validation for Poké Radar, Honey Trees, Great Marsh rotation, Trophy Garden daily species, dual-slot GBA insertion, swarm, and roaming. The current wild method enum has only grass, surf, rods, Rock Smash, Headbutt, and Bug Contest; it has no time-pool, daily-rotation, or GBA insertion conditions.
5. Add incense breeding semantics and precise held-item offspring rules for baby species. Do not emit ordinary offspring rules that ignore required incense. The current breedingRule has a single requiredHeldItemId and may need offspring-specific alternatives where one family has several incense outcomes.
6. Model story/content gates that depend on National Dex, event flags, branching choices, one-time gifts, and postgame island/story state. Verify the current milestone/capability/choice requirements can preserve them without implying access from ordering.
7. Platinum itself needs no Fairy type. For later Generation VI games, add Fairy to those game-specific charts only; do not alter Platinum's 17-type chart.

### Proposed shared references

Insert these references into `data/references.json` only after parent review. IDs are proposed and are already used by the draft records where applicable.

```json
[
  {"id":"platinum-game","title":"Pokémon Platinum game and story data","url":"https://github.com/pret/pokeplatinum/tree/fe1ea418a7364c93daf0d07ae55e195452d8803c/res/field/scripts","revision":"fe1ea418a7364c93daf0d07ae55e195452d8803c","locator":"Pinned Platinum field scripts and map script assignments; game identity, story flags, gifts, and postgame events."},
  {"id":"platinum-profiles","title":"Pokémon Platinum species data","url":"https://github.com/pret/pokeplatinum/tree/fe1ea418a7364c93daf0d07ae55e195452d8803c/res/pokemon","revision":"fe1ea418a7364c93daf0d07ae55e195452d8803c","locator":"Per-species data.json and Pokédex data; types, gender ratio, Egg Groups, offspring, evolution, and forms."},
  {"id":"platinum-type-chart","title":"Pokémon Platinum type effectiveness","url":"https://github.com/pret/pokeplatinum/blob/fe1ea418a7364c93daf0d07ae55e195452d8803c/src/battle/battle_lib.c","revision":"fe1ea418a7364c93daf0d07ae55e195452d8803c","locator":"Type effectiveness table near lines 2380-2510; verify every pair and type order."},
  {"id":"platinum-encounters","title":"Pokémon Platinum wild encounter data","url":"https://github.com/pret/pokeplatinum/tree/fe1ea418a7364c93daf0d07ae55e195452d8803c/res/field/encounters","revision":"fe1ea418a7364c93daf0d07ae55e195452d8803c","locator":"Per-map encounters_*.json and encdata_ex.order; review each method and dynamic pool."},
  {"id":"platinum-bosses","title":"Pokémon Platinum trainer data","url":"https://github.com/pret/pokeplatinum/tree/fe1ea418a7364c93daf0d07ae55e195452d8803c/res/trainers","revision":"fe1ea418a7364c93daf0d07ae55e195452d8803c","locator":"Gym leader, Elite Four, Champion and rival party data; cross-check story scripts for battle versions."},
  {"id":"platinum-breeding","title":"Pokémon Platinum breeding and Day Care rules","url":"https://github.com/pret/pokeplatinum/blob/fe1ea418a7364c93daf0d07ae55e195452d8803c/src/overlay005/daycare.c","revision":"fe1ea418a7364c93daf0d07ae55e195452d8803c","locator":"Day Care compatibility and offspring selection; cross-check species data and hatch code for incense and hatch level."}
]
```

## Continuation round 3: base profiles and native forms

Reviewed 2026-10-13 against the pinned checkout at
`output/source-review/platinum` (HEAD
`fe1ea418a7364c93daf0d07ae55e195452d8803c`). The web page for the pinned
Turtwig species record was also opened. Its `data.json` has the Platinum types,
gender ratio, Egg Groups, evolution and offspring fields. The same per-species
record format is used for each base profile.

`data/games/platinum/pokemon.json` now has 493 base species records. It maps
source type IDs, gender ratios and Egg Groups to planner values. Every profile
uses its local National Dex sprite. This is a base-profile layer only. It does
not establish acquisition coverage or enable the game.

The source `res/pokemon/sinnoh_pokedex.json` lists Platinum's regional roster,
but its order starts with Arceus and does not match the numbered Sinnoh Dex.
Therefore these profiles omit `regionalDex`. Review `res/pokemon` and the
compiled Pokédex order data to establish exact Platinum regional numbers before
adding them. Do not use the inclusion-list order as the regional sequence.

The complete form inventory is in `docs/platinum-forms.md`. It includes
type-changing forms, gendered Burmy evolution outcomes, appearance-only forms,
and battle-only forms. A shared explicit form model remains necessary before
registration.

Proposed profile reference for parent review:

```json
{"id":"platinum-profiles","title":"Pokémon Platinum species records","url":"https://github.com/pret/pokeplatinum/tree/fe1ea418a7364c93daf0d07ae55e195452d8803c/res/pokemon","revision":"fe1ea418a7364c93daf0d07ae55e195452d8803c","locator":"Per-species data.json records for types, gender ratios and Egg Groups; cross-check form data and evolution fields."}
```


## Continuation round 2: battle caps and type chart

The pinned checkout is available at `output/source-review/platinum` and `git rev-parse HEAD` returned `fe1ea418a7364c93daf0d07ae55e195452d8803c`. The checkout is a source review copy only.

### Verified and authored

- `bosses.json` now records all eight Platinum Gym leaders, the four Elite Four members, and Champion Cynthia. The `highestLevel` values come from each version-specific party in `res/trainers/data/{leader_roark,leader_gardenia,leader_fantina,leader_maylene,leader_wake,leader_byron,leader_candice,leader_volkner,elite_four_aaron,elite_four_bertha,elite_four_flint,elite_four_lucian,champion_cynthia}.json`. The leader specialty and badge order use the leader identity and Gym script; the Oreburgh script confirms Roark's badge flag and badge award.
- Platinum's existing 17-type matrix stays intact. `src/battle/battle_lib.c` contains the type chart; Steel resists Ghost and Dark in the pinned version.
- Web check: pinned GitHub pages for Roark's party JSON, Cynthia's party JSON, Oreburgh Gym script, and battle chart were opened on 2026-10-13.

### Unresolved

- Full route and event progression is not authored. Gym scripts alone do not prove the complete mandatory access graph.
- Boss detail parties cannot be represented in the current boss schema; only highest level, boss kind, and Gym specialty are recorded.
- Remaining collection and model gaps from the first review still apply. No exclusions or unsupported mechanics are inferred.

Precise source locators for this round:
- `res/trainers/data/leader_roark.json` through `leader_volkner.json` (eight separate party files).
- `res/trainers/data/elite_four_aaron.json`, `elite_four_bertha.json`, `elite_four_flint.json`, `elite_four_lucian.json`, and `champion_cynthia.json`.
- `res/field/scripts/scripts_oreburgh_city_gym.s` (Roark battle and Coal Badge award); review each remaining Gym script before treating corresponding badge events as verified.
- `src/battle/battle_lib.c` (17-type effectiveness chart).

Proposed shared reference addition for the parent to review:
```json
{"id":"platinum-bosses","title":"Pokémon Platinum trainer parties and Gym events","url":"https://github.com/pret/pokeplatinum/tree/fe1ea418a7364c93daf0d07ae55e195452d8803c/res/trainers/data","revision":"fe1ea418a7364c93daf0d07ae55e195452d8803c","locator":"Version-specific leader, Elite Four, and Champion party JSON; cross-check Gym scripts for badge events."}
```
