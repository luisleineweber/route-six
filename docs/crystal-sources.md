# Pokemon Crystal source review

Reviewed on 2026-10-12 against the pret `pokecrystal` source at commit
`3bc8daa4173e96a7f4011dad3922eb6fa5dad5c6`. The local checkout is
`.crystal-source-review`. Runtime data is static and hand-maintained.

## Primary source locators

| Records | Pinned source locators |
| --- | --- |
| Species, order, types, genders, Egg Groups | `data/pokemon/dex_order_new.asm`; `data/pokemon/base_stats/`; `data/pokemon/names.asm` |
| Type matchups | `data/types/type_matchups.asm`; `engine/pokemon/types.asm` |
| Story and map gates | `maps/*.asm`; `data/maps/maps.asm`; `data/maps/map_data.asm`; `constants/event_flags.asm` |
| Wild and roaming encounters | `data/wild/johto_grass.asm`; `kanto_grass.asm`; `johto_water.asm`; `kanto_water.asm`; `fish.asm`; `treemons.asm`; `treemon_maps.asm`; `swarm_grass.asm`; `swarm_water.asm`; `roammon_maps.asm`; `bug_contest_mons.asm` |
| Gifts, eggs, trades and static events | `maps/*.asm`; `data/events/npc_trades.asm`; `data/events/odd_eggs.asm`; `engine/events/` |
| Item sources | `data/items/marts.asm`; `data/items/fruit_trees.asm`; `maps/*.asm`; `data/maps/scripts.asm`; `data/pokemon/base_stats/` |
| Breeding and evolution | `engine/pokemon/breeding.asm`; `engine/pokemon/evolve.asm`; `data/pokemon/evos_attacks.asm`; `data/pokemon/base_stats/` |

The reference IDs in the records point to `data/references.json`. Every Crystal
record has a review date of `2026-10-12` and a pinned source reference.

## Findings

The local profile order, regional numbers, types, genders and Egg Groups match
all 251 entries in the Crystal source. The type chart matches all 110 explicit
matchups; the other 179 cells are neutral. The boss records cover all 22 Gym,
Elite Four, Champion, Blue and Red parties, with the source party caps.

Encounter review retains the map, method, level, time table and conditional
weight from the source tables. The 2,560 wild records cover grass, Surf,
fishing, Headbutt, Rock Smash, Bug-Catching Contest and swarm tables. The
remaining 159 sources are static encounters, roaming encounters, gifts, eggs,
starters, NPC trades and breeding outcomes. Rates are conditional table
weights. They are not encounter-per-step odds.

Raikou and Entei each have one fixed-level, one-use roaming source after the
Burned Tower release. The planner does not track current routes. Suicune is a
level 40 Tin Tower battle after Radio Tower clearance and Clear Bell access.
Eusine's Tin Tower scene follows the battle and is not a predecessor. Union
Cave Lapras is a recurring Friday catch opportunity, so it has no one-use cap.

The seven Odd Egg species are Pichu, Cleffa, Igglybuff, Smoochum, Magby,
Elekid and Tyrogue. Each is represented as a one-of-seven outcome. The current
choice schema does not store the source probabilities or the two gender/DV
variants for each species. Those details do not create extra species outcomes.
The Violet City Togepi Egg is a separate one-time gift, not normal breeding.

Breeding rules follow the Crystal Day-Care compatibility and offspring logic.
Ditto is a valid parent for other compatible species, but it cannot produce a
Ditto egg; no Ditto offspring rule or source is present. Evolution records use
Crystal's level, stone, trade, friendship, time and Tyrogue stat conditions.
Item sources retain finite event flags or renewable sources where the game
allows them. NPC phone gifts of stones are one-use rewards.

The 16 exclusions are source-checked no-native paths: four Kanto legendary
birds/Mewtwo; version or otherwise unavailable native bases (Mareep, Vulpix,
Mankey, Girafarig, Remoraid and the two Kanto fossils); the three Kanto starter
lines' base species; Mew; and Celebi. The source contains no native gift or
wild table for these bases. Celebi requires the external GS Ball distribution.
The exact exclusion list is tested. Exclusions do not stand in for a missing
route or a missing evolution record.

## Corrections made during review

- Consolidated the route-specific Raikou and Entei drafts into one roaming
  source per beast.
- Corrected the Tin Tower predecessor to Radio Tower clearance. The entrance
  checks `EVENT_GOT_CLEAR_BELL` and the Tin Tower passage event in
  `maps/EcruteakTinTowerEntrance.asm`; Eusine's event is in
  `maps/TinTower1F.asm` after the Suicune battle.
- Kept Union Cave Lapras renewable each Friday until captured.
- Removed an unsupported Game Corner Porygon level 20 record. Crystal's
  Celadon prize script gives Porygon at level 15.
- Removed the invalid Ditto-to-Ditto breeding result and corrected the
  source-backed gender restrictions for Odd Egg outcomes and trades.
- Added Elm's one-time Everstone after the Togepi event, alongside Bill's
  Grandfather's one-time Everstone.
- Added the native gift, item, route-access, choice, breeding, evolution and
  exclusion records required by the Crystal source layer.
