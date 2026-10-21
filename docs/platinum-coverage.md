# Pokémon Platinum coverage

## Active data: 17 October 2026

Platinum now supports both planners. The active data has 84 milestones,
201 locations, 2,201 acquisition sources, 250 evolution edges, 222 breeding
rules, and 97 exclusions. All 493 species have a reviewed outcome. The solver
finds native paths for 382 species and seven alternate forms. Fourteen species
need player trade. The full suite passes 412 tests in 43 files.

See [the active progress review](platinum-progress-review.md) for scope,
source locators, gates, finite resources, and checks. The sections below are
review history. Their earlier open issues do not describe the active data.

## Integration update: 16 October 2026

The joined review draft contains 7,802 wild candidate rows across 154 native
map headers, 250 evolution edges, and 222 breeding rules. Rows can describe
different times, levels, or daily pools. They are not distinct species counts.
The draft uses the app schema. Location gates and exclusions still prevent
activation. None of these draft access records is active product data.

Native flags put Route 209 after Fantina and the Route 212 north gate after
Pastoria arrival. Swarms need both National Dex and Hall of Fame. Snowpoint
Temple also needs both. The two Giratina battle sites share one capture.
The fossil records retain Trainer ID parity and National Dex mining weights.

The shared item model now checks Pickup levels and exact capture records.
Wild held-item rules retain the captured animal and share its finite loot
limit. Native Pickup review adds twenty level windows for King's Rock,
Dusk Stone, Shiny Stone, and Dawn Stone. King's Rock starts at holder level
11, rather than 21. The first stone levels are 31, 41, and 51 respectively.
The table includes the ten percent Pickup activation chance.

The draft check still finds unresolved map locations and species paths.
The missing species list is a review list, not an exclusion list. Five late
route obstacle checks and the Route 206 cave bypass review remain open.
One source review stopped at the provider usage limit. It produced no result
for the late route checks.

## Implementation update: 15 October 2026

The shared rules now support form changes, form-specific evolution and
breeding, held-item copies, known-move teaching, evolution locations, and
party species. Seven reviewed alternate Platinum profiles have local images.
Honey Trees, Radar, time, weekday, swarms, daily rotations, and Feebas tiles
have explicit source types. These rules do not complete the access records.

The checked source proposals include the native wild tables, all 246 native
evolution tuples, form-specific edges, 222 breeding candidates, nine Incense
branches, fixed encounters, and a repaired story graph. The first graph had
the wrong Gym order. The current proposal puts Fantina third and separates
early warehouse access from late Galactic HQ.

Native script review also proves that Looker opens the late warehouse door
without a Storage Key inventory check. The unused key-pickup script has no
event caller. Do not add a native key grant from that unused script.

Remaining integration work includes local encounter pockets, item and action
sources, complete species outcomes, and final progress checks. Source
proposals in `output/game-proposals/` are not active game records. The older
review below records the starting state.

## Historical app status: 14 October 2026

Team Planner is enabled with 493 reviewed base profiles and 210 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Review date: 2026-10-13. Status: incomplete and disabled.

No native acquisition coverage, encounter, evolution, exclusion, progression, item, or choice coverage is complete. Boss records and the reviewed 17-type chart exist. Several collection files remain empty drafts. Do not register or enable this game.

## Confirmed reviewed layers

- Game identity: Pokémon Platinum, Generation IV, Sinnoh.
- Type chart: 17 types. Fairy is not present in Platinum. The chart uses the pinned Platinum battle table. Ghost and Dark are resisted by Steel.
- Breeding exists. `Egg_CreateEgg` initializes eggs at level 1 in the pinned Day Care code.
- `pokemon.json` contains reviewed base profiles for all 493 species through National Dex #493. Types, gender outcomes, and Egg Groups match each pinned per-species record. The game remains incomplete and disabled.
- Regional numbers are omitted. `res/pokemon/sinnoh_pokedex.json` is a roster, not the numbered regional sequence. Do not infer numbers from its order.
- The native form inventory is in `docs/platinum-forms.md`. Profile form support is still missing.
- The existing data model cannot represent all Platinum form distinctions or all evolution and encounter rules.

## Next reviewed-data work

1. Add the proposed `platinum-profiles` reference to shared references after review.
2. Establish the exact 210-entry Platinum Sinnoh numbering from the pinned source. Add numbers only after this review.
3. Implement form-aware identity and image selection before using profiles whose form changes type, appearance, or eligibility.
4. Add tested evolution trigger support for move-known, party-species present, location/environment, held-item level-up, held-item trade, and species/gender-specific item evolution. Friendship, beauty, stats, personality, gender, day/night, and co-products already exist in schema v2.
5. Add tested encounter support for the methods listed in `platinum-sources.md`.
6. Review the full route graph, bosses, item sources, gifts, choices, native encounters, breeding, postgame, and species exclusions at the pinned source revision.
7. Populate all thirteen collections and exact coverage tests. Only then can the parent consider registration.

## Known scope questions

- Confirm whether the planner's acquisition scope includes Platinum's Battle Zone and postgame facilities. Keep facility rentals out of native player sources.
- Confirm the treatment of one-time distributions and events. External events must not be silently treated as native.
- Confirm a user-facing policy for conditional day/time and daily rotations. Preserve exact conditions even if the current planner cannot evaluate the current clock.
