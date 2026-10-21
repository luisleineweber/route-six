# Pokémon White 2 coverage

## Current app status: 14 October 2026

Team Planner is enabled with 649 reviewed base profiles and 301 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Status: partial, incomplete, and not registered. Review date: 2026-10-13.

## Reviewed layer

- `data/games/white-2/bosses.json` records first-run Gym, Elite Four,
  Champion Iris, and final story trainer Ghetsis highest levels. Source tables
  cross-check the listed levels. The data schema stores level caps, not party
  rosters. Challenge Mode and rematches are outside this record layer.
- `data/games/white-2/type-chart.json` stores the 17-type Generation V chart.
  Bulbapedia's Generations II-V chart and Smogon's BW type chart independently
  support its generation and type set. See [sources](white-2-sources.md).

## Not reviewed or not representable yet

- No reviewed hatch level. The available White 2 breeding reference establishes
  the Day Care story unlock, but not the level when an egg hatches. No valid
  `game.json` can be written without reviewed checkpoints.
- No verified source reconstruction revision or full thirteen-collection
  locator set. Earlier `FieryMewtwo/pokeblack2` provenance remains conflicted.
- Base profile data for National Dex 1-649 is now reviewed from the pinned PKHeX
  Black 2/White 2 personal table. `pokemon.json` has 649 profiles. The exact
  byte comparison agrees with all Black 2 base-profile types, gender categories,
  and Egg Groups. Profiles have no regional number until White 2 ordering is
  reviewed. Form-aware profiles and sources are not supported by the current model.
- Encounter, evolution, breeding, capability, choice, and story access records
  remain open. No generic or empty placeholders were added.

The game must remain disabled. No dataset-wide check applies to this partial
layer because required game collections and reference registration are absent.
The focused file checks cover JSON parsing, chart dimensions, and Gym badge
sequence only.


## Round 5 profile result

`data/games/white-2/pokemon.json` contains all 649 base species profiles and uses
`white-2-pkhex-personal`. The table has 709 records, so records after the 649
base species include form data. This profile layer does not represent those
forms. It also does not establish which species White 2 can acquire.

## Remaining review and model gaps

The following mechanics need source review before data can be declared complete:

- White 2 form availability and form-specific type, source, evolution, and image
  selection. The shared model has no form identities or references.
- Exact White 2 regional Dex numbers. The profile schema permits one contiguous
  sequence only and cannot represent multi-section regional Dex order.
- All thirteen collection records: game and checkpoint data; type chart and
  bosses; milestones; locations; capabilities; items; choices; encounter and
  other acquisition sources; breeding rules; evolutions; and exclusions.
- Native acquisition mechanics must be classified against the current source
  kinds and requirements. Review Hidden Grotto, fishing/surf/walking encounter
  tables, NPC trades, gifts, static encounters, fossils, and any other source
  types before writing source records. Do not infer them from Black 2 or generic
  encounter methods.
- Review White 2 evolution triggers and conditions, including move-known,
  party-species, location/environment, and held-item level-up rules. Add tested
  domain support for any trigger the current model cannot represent.
- Review breeding availability, Day Care gates, hatch level, and species-specific
  offspring requirements. Keep unavailable inheritance effects out of profile
  fields unless the acquisition planner models them.
- Review story/content gates for postgame and optional areas, event gifts, and
  version-specific gates. Add domain support where access needs a rule the current
  requirement model cannot express.
- Add the Fairy type to game profiles only after the White 2 type source is
  pinned and checked. Shared chart/icon preparation does not establish game
  profile membership or a chart record.

No empty collection means that a mechanic is absent. The game remains disabled.
