# Pokémon Blue source review

Scope: the original international English Pokémon Blue release. Include native
captures, gifts, in-game trades, and normal postgame access. Exclude player
trades and external events. Exclude glitch-based acquisition.

Pinned source: [`pret/pokered`](https://github.com/pret/pokered), commit
[`af519899719f0754965776faac0e836a3b906e6d`](https://github.com/pret/pokered/commit/af519899719f0754965776faac0e836a3b906e6d),
reviewed 12 October 2026. GitHub reports this exact commit and its source tree.
The repository disassembles both Red and Blue. Review Blue conditional paths;
do not apply Red-only encounters or events to this game.

These source locators cover each of the thirteen maintained game collections.
They are review references only. The app must load local reviewed JSON.

```json
[
  {"id":"blue-species","title":"Pokémon Blue species, types, and Pokédex order","locator":"data/pokemon/base_stats.asm; data/pokemon/dex_order.asm; constants/pokemon_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-game","title":"Pokémon Blue version scope and game rules","locator":"README.md; constants/pokemon_constants.asm; constants/type_constants.asm; data/maps/headers","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-type-chart","title":"Generation I type IDs and effectiveness rules","locator":"constants/type_constants.asm; data/types/type_matchups.asm; engine/battle/core.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/types","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-progression","title":"Kanto story events, badges, and map progression","locator":"scripts; data/maps/objects; constants/event_constants.asm; constants/map_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-bosses","title":"Blue Gym, Elite Four, and Champion parties","locator":"data/trainers/parties.asm; data/trainers/names.asm; data/trainers/special_moves.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/trainers","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-locations","title":"Kanto map identities and access scripts","locator":"data/maps/headers; data/maps/objects; scripts; data/maps/dungeon_maps.asm; data/maps/force_bike_surf.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-capabilities","title":"Field moves, badges, and overworld access checks","locator":"scripts; data/maps/badge_maps.asm; data/maps/force_bike_surf.asm; data/items/use_overworld.asm; constants/event_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-items","title":"Blue item pickups, marts, key items, and fossils","locator":"data/items; data/events/hidden_item_coords.asm; data/maps/objects; constants/item_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/items","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-choices","title":"Starter, Eevee, dojo, fossil, and Game Corner choices","locator":"scripts; data/events/prizes.asm; data/events/prize_mon_levels.asm; data/events/trades.asm; data/maps/objects/*Trade*.asm; data/maps/objects/PowerPlant.asm; scripts/PowerPlant.asm; data/maps/toggleable_objects.asm; constants/event_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/events","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-encounters","title":"Pokémon Blue wild encounter tables and methods","locator":"data/wild/probabilities.asm; data/wild/grass_water.asm; data/wild/good_rod.asm; data/wild/super_rod.asm; data/wild/maps; Blue/Red version conditionals in encounter files","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/wild","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-breeding","title":"Pokémon Blue breeding support check","locator":"No breeding system exists in Generation I; reviewed against the pinned Red/Blue game source","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-evolutions","title":"Blue level, stone, and trade evolution data","locator":"data/pokemon/evos_moves.asm; constants/item_constants.asm; scripts","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-exclusions","title":"Blue version exclusives and external Mew distribution","locator":"data/wild/maps; scripts; data/pokemon/mew.asm; Blue/Red version conditionals","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data","revision":"af519899719f0754965776faac0e836a3b906e6d"}
]
```

## Review findings

- Blue supports all 151 National Dex species. Profile types and Kanto Pokédex
  order were reviewed against the pinned `base_stats.asm` and `dex_order.asm`.
  Each profile uses its explicit local `/pokemon/<number>.png` image path.
- The shared profile model now accepts `not-applicable` for games without a
  gender system. Blue profiles use that value; breeding is null and there are
  no breeding rules or egg sources.
- Generation I has 15 types. The chart expands the pinned type matchup table.
  It records Ghost's immunity against Psychic and the mutual Bug/Poison
  effectiveness. Dark and Steel are absent. Battle behavior outside this table
  is not represented.
- Player trades remain outside the acquisition scope. The nine NPC trade
  records are native Blue sources. Each requires and consumes the offered
  species once. Player-trade evolutions remain blocked.
- The nine active entries in `data/events/trades.asm` were checked against
  the Blue source records: Abra→Mr. Mime, Spearow→Farfetch'd,
  Nidorino→Nidorina, Nidoran♂→Nidoran♀, Ponyta→Seel, Slowbro→Lickitung,
  Poliwhirl→Jynx, Raichu→Electrode, and Venonat→Tangela. Each offered species
  is consumed once. The received level matches the offered Pokémon. The
  unused trade-table record is excluded.
- The Old Rod NPC is in `VermilionOldRodHouse.asm`. Vermilion is reached from
  the Cerulean side before Misty through Route 5/6 and the Underground Path.
  Its access does not require Route 11, Diglett's Cave, or defeating Misty.
- `data/maps/objects/Route2.asm` places the Diglett Cave warp and the two
  Viridian Forest gate warps at separate points on Route 2. The Diglett Cave
  location remains gated by Cut; the data does not assume that either forest
  exit reaches the eastern lane. HM05 is in `Route2Gate.asm`; its Flash field
  capability remains gated by Brock's Boulder Badge.
- Blue gives the Super Rod in `scripts/Route12SuperRodHouse.asm`; the Good Rod
  is in `scripts/FuchsiaGoodRodHouse.asm`. The Route 12 house is south of its
  Snorlax and is reachable after the Tower rescue, before Fuchsia. The
  Celadon-to-Fuchsia route crosses the
  Route 16 Snorlax: `Route16.asm` connects east to Celadon and south to Route
  17, while `Route16Gate1F.asm` checks the Bicycle. `Route16.asm` places
  Snorlax at (26, 10), and `Route12.asm` places the second Snorlax at (10, 62)
  north of the Super Rod house warp at (11, 77). Route 18 connects north to
  Route 17 and east to Fuchsia; Route 15 connects to Fuchsia, Route 14, then
  Route 13 and Route 12. These are connected only after moving the blocking
  Snorlax. The route gate needs Celadon, the Bicycle, and Poké Flute.
- `data/maps/badge_maps.asm` maps Celadon Gym to `BIT_RAINBOWBADGE` and
  Fuchsia Gym to `BIT_SOULBADGE`. `data/items/use_overworld.asm` checks
  `BIT_RAINBOWBADGE` for Strength and `BIT_SOULBADGE` for Surf. Strength needs
  Erika's Rainbow Badge; Surf needs Koga's Soul Badge. Victory Road needs all
  eight Gym badges. The graph keeps Erika and Lt. Surge as separate gates.
- `data/maps/objects/PowerPlant.asm` defines six Poké Ball objects as level 40 Voltorb, two as level 43 Electrode, and a separate level 50 Zapdos bird. `scripts/PowerPlant.asm` maps each object to its battle text; `data/maps/toggleable_objects.asm` gives each a one-time object state. Blue records all eight ball encounters separately, each with one use. The Power Plant location requires Surf outside, so the encounter sources do not add a false Lt. Surge gate.
- Blue prize tables in `data/events/prizes.asm` list Abra, Clefairy, Nidorino, Pinsir, Dratini, and Porygon. `data/events/prize_mon_levels.asm` gives their Blue levels as 6, 12, 17, 20, 24, and 18. All six purchases are represented; they have no planner purchase cap because the planner does not model coin or money totals.
- Five native Moon Stones are represented: the Route 2 and Mt. Moon 1F visible
  pickups, hidden Mt. Moon B2F and Pokémon Mansion 1F pickups, and the Rocket
  Hideout B2F pickup. All five pickups are distinct, one-use map objects. The two Mt. Moon pickups share one source with a use
  limit of two. Route 2, Rocket Hideout B2F, and Pokémon Mansion 1F each have one use. Fire, Water, Thunder, and
  Leaf Stones come from Celadon Department Store and have unlimited stock.
- Blue wild records use the Blue branches in the pinned map encounter files.
  The ten weights in `data/wild/probabilities.asm` are
  `51, 51, 39, 25, 25, 25, 13, 13, 11, 3` (256 total). For each physical
  map table, same-species slots with the same level are summed first. Adjacent
  levels combine into ranges; separated levels stay separate. Percentages are
  exact to six decimal places. Each source ID names its map table and level.
- The pinned wild directory has 57 populated table files. `SeaRoutesWildMons`
  serves both Route 19 and Route 20; Route 21 has its own table. The reviewed
  data covers 58 physical map tables, 290 map-table/species records, and 460
  exact level groups. Route 19 Surf records are included. Surf uses the same
  ten-slot wild distribution. Rod encounter rates use separate fishing code.
  The full Blue dataset has 654 acquisition records, including 155 fishing
  records, three starters, ten gifts, fourteen static encounters, three fossils,
  and nine NPC trades. The planner checks story access, not money or save state.
- Blue supports Red-exclusive species in its profiles so the catalogue remains
  complete. Eleven Red-exclusive species have explicit `other-version`
  exclusions. Mew has an `external-event` exclusion. Glitches and external
  events are outside this scope.
- All thirteen proposed Blue references use the exact pinned revision and
  review date 12 October 2026. Merge these records into shared
  `data/references.json` before registering Blue. This task does not edit that
  shared file.

## Proposed shared reference records

```json
[
  {"id":"blue-species","title":"Pokémon Blue species, types, and Pokédex order","locator":"data/pokemon/base_stats.asm; data/pokemon/dex_order.asm; constants/pokemon_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-game","title":"Pokémon Blue version scope and game rules","locator":"README.md; constants/pokemon_constants.asm; constants/type_constants.asm; data/maps/headers","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-type-chart","title":"Generation I type IDs and effectiveness rules","locator":"constants/type_constants.asm; data/types/type_matchups.asm; engine/battle/core.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/types","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-progression","title":"Kanto story events, badges, and map progression","locator":"scripts; data/maps/objects; constants/event_constants.asm; constants/map_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-bosses","title":"Blue Gym, Elite Four, and Champion parties","locator":"data/trainers/parties.asm; data/trainers/names.asm; data/trainers/special_moves.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/trainers","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-locations","title":"Kanto map identities and access scripts","locator":"data/maps/headers; data/maps/objects; scripts; data/maps/dungeon_maps.asm; data/maps/force_bike_surf.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-capabilities","title":"Field moves, badges, and overworld access checks","locator":"scripts; data/maps/badge_maps.asm; data/maps/force_bike_surf.asm; data/items/use_overworld.asm; constants/event_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-items","title":"Blue item pickups, marts, key items, and fossils","locator":"data/items; data/events/hidden_item_coords.asm; data/maps/objects; constants/item_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/items","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-choices","title":"Starter, Eevee, dojo, fossil, and Game Corner choices","locator":"scripts; data/events/prizes.asm; data/events/prize_mon_levels.asm; data/events/trades.asm; data/maps/objects/*Trade*.asm; data/maps/objects/PowerPlant.asm; scripts/PowerPlant.asm; data/maps/toggleable_objects.asm; constants/event_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/events","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-encounters","title":"Pokémon Blue wild encounter tables and methods","locator":"data/wild/probabilities.asm; data/wild/grass_water.asm; data/wild/good_rod.asm; data/wild/super_rod.asm; data/wild/maps; Blue/Red version conditionals in encounter files","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/wild","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-breeding","title":"Pokémon Blue breeding support check","locator":"No breeding system exists in Generation I; reviewed against the pinned Red/Blue game source","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-evolutions","title":"Blue level, stone, and trade evolution data","locator":"data/pokemon/evos_moves.asm; constants/item_constants.asm; scripts","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-exclusions","title":"Blue version exclusives and external Mew distribution","locator":"data/wild/maps; scripts; data/pokemon/mew.asm; Blue/Red version conditionals","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data","revision":"af519899719f0754965776faac0e836a3b906e6d"}
]
```
- Blue supports Red-exclusive species in its profiles so the catalogue remains
  complete. Eleven Red-exclusive species have explicit `other-version`
  exclusions. Mew has an `external-event` exclusion. Glitches and external
  events are outside this scope.
- All thirteen proposed Blue references use the exact pinned revision and
  review date 12 October 2026. Merge these records into shared
  `data/references.json` before registering Blue. This task does not edit that
  shared file.

## Proposed shared reference records

```json
[
  {"id":"blue-species","title":"Pokémon Blue species, types, and Pokédex order","locator":"data/pokemon/base_stats.asm; data/pokemon/dex_order.asm; constants/pokemon_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-game","title":"Pokémon Blue version scope and game rules","locator":"README.md; constants/pokemon_constants.asm; constants/type_constants.asm; data/maps/headers","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-type-chart","title":"Generation I type IDs and effectiveness rules","locator":"constants/type_constants.asm; data/types/type_matchups.asm; engine/battle/core.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/types","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-progression","title":"Kanto story events, badges, and map progression","locator":"scripts; data/maps/objects; constants/event_constants.asm; constants/map_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-bosses","title":"Blue Gym, Elite Four, and Champion parties","locator":"data/trainers/parties.asm; data/trainers/names.asm; data/trainers/special_moves.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/trainers","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-locations","title":"Kanto map identities and access scripts","locator":"data/maps/headers; data/maps/objects; scripts; data/maps/dungeon_maps.asm; data/maps/force_bike_surf.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-capabilities","title":"Field moves, badges, and overworld access checks","locator":"scripts; data/maps/badge_maps.asm; data/maps/force_bike_surf.asm; data/items/use_overworld.asm; constants/event_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/maps","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-items","title":"Blue item pickups, marts, key items, and fossils","locator":"data/items; data/events/hidden_item_coords.asm; data/maps/objects; constants/item_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/items","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-choices","title":"Starter, Eevee, dojo, fossil, and Game Corner choices","locator":"scripts; data/events/prizes.asm; data/events/prize_mon_levels.asm; data/events/trades.asm; data/maps/objects/*Trade*.asm; data/maps/objects/PowerPlant.asm; scripts/PowerPlant.asm; data/maps/toggleable_objects.asm; constants/event_constants.asm","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/events","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-encounters","title":"Pokémon Blue wild encounter tables and methods","locator":"data/wild/probabilities.asm; data/wild/grass_water.asm; data/wild/good_rod.asm; data/wild/super_rod.asm; data/wild/maps; Blue/Red version conditionals in encounter files","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/wild","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-breeding","title":"Pokémon Blue breeding support check","locator":"No breeding system exists in Generation I; reviewed against the pinned Red/Blue game source","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-evolutions","title":"Blue level, stone, and trade evolution data","locator":"data/pokemon/evos_moves.asm; constants/item_constants.asm; scripts","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data/pokemon","revision":"af519899719f0754965776faac0e836a3b906e6d"},
  {"id":"blue-exclusions","title":"Blue version exclusives and external Mew distribution","locator":"data/wild/maps; scripts; data/pokemon/mew.asm; Blue/Red version conditionals","url":"https://github.com/pret/pokered/tree/af519899719f0754965776faac0e836a3b906e6d/data","revision":"af519899719f0754965776faac0e836a3b906e6d"}
]
```
