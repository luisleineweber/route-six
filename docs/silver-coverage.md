# Pokémon Silver coverage

Scope: the original English Pokémon Silver version, with Johto and Kanto
through ordinary post-game play. Exclude player trades and external events.
Review the pinned `pret/pokegold` commit
`ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8`; see [Silver source review](silver-sources.md)
for the source locators and proposed game-specific references.

All thirteen local collections have reviewed outcomes. `src/data/games/silver.ts` assembles them without conversion or network access. Silver is registered.

The profile set has all 251 Generation II species in exact Silver New Pokédex
order. The pinned `data/pokemon/base_stats/*.asm` files give the same types,
gender ratios, and Egg Groups in the Gold and Silver branches. Their version
branches select sprite dimensions and held items, not these profile fields.
Each profile uses the matching local `/pokemon/<national-dex>.png` asset.

Silver uses 17 types. Gold and Silver share this table. Its full matrix also
matches Emerald's Generation III chart. The Silver test compares every cell.

The reviewed boss set has all 8 Johto Gyms, 4 Elite Four members, Lance, all 8
Kanto Gyms, and Red. The pinned `data/trainers/parties.asm` lists the shared
Silver and Gold trainer parties. `data/trainers/leaders.asm` confirms the
leader set. Kanto Gym order in planner display does not assert a required
challenge order. Red is recorded as a post-game trainer.

The progression adds a separate Radio Tower event before Clair. In the Silver
branch, `RadioTower5F.asm` gives the Silver Wing after the Rocket executive and
sets `EVENT_CLEARED_RADIO_TOWER`. The Kanto Pewter gift is the Rainbow Wing in
Silver. The `checkver` code reads `GS_VERSION` (`1` for Silver), which confirms
the branch outcomes. The two wing capabilities keep access to Lugia and Ho-Oh
separate.

## Source systems to cover

- Johto and Kanto land, water, and fishing encounters.
- Silver-specific version encounters and exclusions.
- Headbutt tree encounters.
- The weekday Bug-Catching Contest.
- Weekday and time-dependent gifts or encounters.
- Swarms and roaming legendary encounters.
- Fixed gifts, static encounters, and native NPC trades.
- Day Care access, compatible breeding, offspring and hatch level.
- Friendship, time, item, player-trade, and Attack/Defense-stat evolutions.
- Eight Johto Gyms, four Elite Four members, Champion, eight Kanto Gyms, and
  Red, with the Kanto post-game opening after the Johto League.

## Reviewed wild-source layer

`sources.json` has 2,460 reviewed wild-table entries, 29 reviewed non-wild sources, and 119 breeding sources.
Ditto can serve as a partner but cannot be a breeding offspring.
The wild rows cover 1,663 grass entries, 189 Surf entries, 338 fishing entries,
252 Headbutt entries, 8 Rock Smash entries, and all 10 selectable
Bug-Catching Contest entries. These rows
cover 91 grass maps, 62 Surf maps, and 25 fishing maps. Source IDs retain the
map, method, table or time window, level, and slot. Rates follow each method's
source table. Fishing rows use cumulative threshold differences from `fish.asm`.

The grass and water files were read from the Silver build branch. This keeps
Silver's Weedle-family Headbutt tables and Route 38 Meowth swarm separate from
Gold's records. The source list includes the four swarm tables. Entei, Raikou, and Suicune
use roaming sources at level 40, with one use per individual. The Burned Tower
release event follows Ecruteak access and does not require Morty. The planner does not track later roamer movement or assign
a fixed route or encounter rate.

Headbutt entries use the active Forest, Canyon, and Rock tables and their map
assignments. The Contest source stops at the `-1` table sentinel. The following
Venomoth bytes are a sentinel payload, not a selectable Contest encounter.
Contest sources require the contest and a matching weekday window. Grass rows
retain separate morning, day, and night records. Fishing time groups require
the matching day or night capability. Swarm rows require the swarm report.

The locations file has 161 reviewed records. The source locators and access gates are listed in [Silver source
review](silver-sources.md).
The focused Silver test checks source IDs, dates, references, methods, exact
per-method totals, cross-references, and the JSON Schema shape for sources and
locations. Non-wild sources cover the three one-of-three starters, one Togepi egg, seven gifts including Porygon, nine one-time static encounters, all six NPC trades, and 119 reusable breeding sources. See [Silver source
review](silver-sources.md) for the item and acquisition locators.

## Remaining review

The planner records whether a player could obtain a species by story progress.
It does not simulate exact weekdays, clock values, random outcomes, or current
roamer routes. Use source-backed capabilities and choices to represent the
earliest reachable opportunity, while keeping actual story, item, and finite
source requirements. Inspect Emerald's matching abstractions before adding
data. Review every Silver version difference against Silver conditionals.

The 251 profiles are grounded by native sources, reviewed evolution and breeding paths, or one of 29 reviewed exclusions. Exclusions cover Gold-only encounter species, species unavailable through ordinary Generation II game play, and event-only Mew and Celebi. Player trade remains outside acquisition scope. The three roaming records use the actual Burned Tower release event as their gate.
