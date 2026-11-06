# Pokémon Y coverage status

## Current integration: 21 October 2026

Team Planner and Progress Planner are enabled. The active data has 721 base profiles, 457 regional entries, 76 milestones, and 1,091 sources. Complete game checks resolve 435 native species and 13 alternate forms. Fifteen species need player trade. The 271 exclusions have a full source comparison.

See [the X and Y Progress Planner review](xy-progress-review.md) for the active scope, source conflicts, and checks. The dated notes below are source history. Earlier pending states and model gaps are superseded by this integration.

## Earlier review history

## Current app status: 14 October 2026

Team Planner is enabled with 721 reviewed base profiles and 457 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Review date: 2026-10-13. Status: draft, incomplete, disabled.

## Reviewed layers

- `pokemon.json` has base profiles for all 721 National Dex identities. Types, gender ratios, and Egg Groups for all 721 profiles were compared record by record against PKHeX `personal_xy` at pinned revision `641c26ba100225f3605e5a44b61b3b16e15a3774`. The file has 799 records of 64 bytes. All three fields match for every base species. Local National Dex sprites use `/pokemon/<number>.png`.
- Kalos uses Central, Coastal, and Mountain regional Pokédex numbering. The current schema permits one unique sequence only. These profiles omit `regionalDex`; do not infer or flatten Kalos sections. The regional sections need a named-section model.
- `docs/y-forms.md` lists known native forms and the form model gap. Base profiles do not cover alternate forms.
- Gym leaders: Viola, Grant, Korrina, Ramos, Clemont, Valerie, Olympia, Wulfric.
- League: Malva, Siebold, Wikstrom, Drasna, Champion Diantha.
- `bosses.json` stores first-clear maximum levels only. It does not store parties.
- `type-chart.json` contains the Generation VI chart with 18 types.
- Generation VI egg hatch level is 1. No `game.json` is authored because no reviewed progress checkpoint is authored yet.

## Still open

The base-profile source and exact record locators are now checked. The other twelve collection locators are not complete. Progression, maps, capabilities, items, choices, encounters, breeding, evolutions, exclusions, story and postgame gates, and Friend Safari scope need source review. Special evolution rules and battle/form changes need model support. The pinned PKHeX personal table does not establish Y acquisition or progression facts.

## Data coverage

The current reviewed files are partial layers. They do not establish a complete game dataset. Keep Y disabled until form handling, regional numbering, every collection, source references, and coverage checks are complete.


## Record comparison result

A temporary read-only comparison decoded `personal_xy[1..721]` using the pinned PKHeX record definitions. Result: 721 identities matched; zero type, gender-category, or Egg Group differences. The current `pokemon.json` is the reviewed base-profile layer. Keep profiles limited to base species until the shared form model exists.
