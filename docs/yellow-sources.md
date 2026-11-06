# Pokémon Yellow source review

Scope: the international English Pokémon Yellow version. Include Pokémon caught,
received, and traded with in-game characters, including ordinary post-game
access. Exclude link trades and external distributions.

Pinned source: [`pret/pokeyellow`](https://github.com/pret/pokeyellow), commit
`e89ead154b9968aa50eed9328ff2b38b6c194382` (reviewed 2026-10-12). The source is
a disassembly. Review Yellow-specific scripts and tables; do not assume Red or
Blue encounter data applies.

The following locators define the manual review source for all thirteen game
collections. They are source locators, not data imports.

```json
[
  {"id":"yellow-species","title":"Pokémon Yellow species stats, types, and Pokédex order","locator":"data/pokemon/base_stats/*.asm; constants/pokemon_constants.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/pokemon","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-game","title":"Pokémon Yellow version identity and rules","locator":"README.md; constants/pokemon_constants.asm; data/maps/headers","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-type-chart","title":"Generation I type IDs and effectiveness rules","locator":"constants/type_constants.asm; data/types/type_matchups.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/types","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-progression","title":"Story events, badge flags, and map progression","locator":"data/maps/objects; scripts; constants/event_constants.asm; data/maps/badge_maps.asm; maps.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-bosses","title":"Gym, Elite Four, and Champion parties","locator":"data/trainers/parties.asm; data/trainers/names.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/trainers","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-locations","title":"Map identities and map access scripts","locator":"data/maps/headers; data/maps/objects; scripts; maps.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-capabilities","title":"Field moves, badges, and overworld access checks","locator":"scripts; engine/items/item_effects.asm; data/items/use_overworld.asm; data/maps/badge_maps.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-items","title":"Item pickups, marts, key items, and fossils","locator":"data/items; data/events/hidden_item_coords.asm; data/maps/objects; constants/item_constants.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/items","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-choices","title":"Pikachu starter and one-time gifts, fossils, dojo, and Eevee choices","locator":"scripts; data/events/prizes.asm; data/events/prize_mon_levels.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/events","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-encounters","title":"Pokémon Yellow wild encounter tables and methods","locator":"data/wild/maps/*.asm; data/wild/probabilities.asm; data/wild/good_rod.asm; data/wild/super_rod.asm; engine/items/item_effects.asm; engine/items/super_rod.asm; constants/pokemon_data_constants.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/wild","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-breeding","title":"Breeding support check","locator":"Pokémon Yellow has no breeding system; reviewed against the pinned game source","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-evolutions","title":"Level, stone, and trade evolution data, including the starter Pikachu exception","locator":"data/pokemon/evos_moves.asm; constants/item_constants.asm; engine/items/item_effects.asm; engine/pikachu/pikachu_status.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/pokemon","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-exclusions","title":"Native-access exclusions and external Mew distribution","locator":"data/wild/maps; scripts; data/pokemon/base_stats/mew.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"}
]
```

## Proposed shared reference records

The parent agent can merge this array into `data/references.json`. This task
does not edit that shared file.

```json
[
  {"id":"yellow-species","title":"Pokémon Yellow species stats, types, and Pokédex order","locator":"data/pokemon/base_stats/*.asm; constants/pokemon_constants.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/pokemon","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-game","title":"Pokémon Yellow version identity and rules","locator":"README.md; constants/pokemon_constants.asm; data/maps/headers","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-type-chart","title":"Generation I type IDs and effectiveness rules","locator":"constants/type_constants.asm; data/types/type_matchups.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/types","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-progression","title":"Story events, badge flags, and map progression","locator":"data/maps/objects; scripts; constants/event_constants.asm; data/maps/badge_maps.asm; maps.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-bosses","title":"Gym, Elite Four, and Champion parties","locator":"data/trainers/parties.asm; data/trainers/names.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/trainers","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-locations","title":"Map identities and map access scripts","locator":"data/maps/headers; data/maps/objects; scripts; maps.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-capabilities","title":"Field moves, badges, and overworld access checks","locator":"scripts; engine/items/item_effects.asm; data/items/use_overworld.asm; data/maps/badge_maps.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-items","title":"Item pickups, marts, key items, and fossils","locator":"data/items; data/events/hidden_item_coords.asm; data/maps/objects; constants/item_constants.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/items","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-choices","title":"Pikachu starter and one-time gifts, fossils, dojo, and Eevee choices","locator":"scripts; data/events/prizes.asm; data/events/prize_mon_levels.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/events","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-encounters","title":"Pokémon Yellow wild encounter tables and methods","locator":"data/wild/maps/*.asm; data/wild/probabilities.asm; data/wild/good_rod.asm; data/wild/super_rod.asm; engine/items/item_effects.asm; engine/items/super_rod.asm; constants/pokemon_data_constants.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/wild","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-breeding","title":"Breeding support check","locator":"Pokémon Yellow has no breeding system; reviewed against the pinned game source","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-evolutions","title":"Level, stone, and trade evolution data, including the starter Pikachu exception","locator":"data/pokemon/evos_moves.asm; constants/item_constants.asm; engine/items/item_effects.asm; engine/pikachu/pikachu_status.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data/pokemon","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"},
  {"id":"yellow-exclusions","title":"Native-access exclusions and external Mew distribution","locator":"data/wild/maps; scripts; data/pokemon/base_stats/mew.asm","url":"https://github.com/pret/pokeyellow/tree/e89ead154b9968aa50eed9328ff2b38b6c194382/data","revision":"e89ead154b9968aa50eed9328ff2b38b6c194382"}
]
```

## Source review progress

I checked the pinned source checkout at `e89ead154b9968aa50eed9328ff2b38b6c194382`.
The `data/pokemon/base_stats/*.asm` directory has one base-stat record for each
of the 151 shared Generation I identities. I checked each `; type` line and
stored its two Generation I types in the Yellow profiles. Yellow's national
Pokédex order is the Kanto order; profile `regionalDex` values run from 1 to
151. Each profile uses its local `/pokemon/<national-dex>.png` artwork.

I converted each explicit row in `data/types/type_matchups.asm` to a complete
15-by-15 matrix. The matrix keeps the Generation I immunities, including Ghost
attacks against Psychic, Normal and Fighting attacks against Ghost, Ground
attacks against Flying, and Electric attacks against Ground. Unlisted pairs
remain neutral.

I checked the Gym and League party blocks in `data/trainers/parties.asm`.
The records store each boss's highest party level, including Brock 12,
Lt. Surge 28, Giovanni 55, and Champion 65. The Champion is the Yellow Rival
team with Jolteon, Flareon, or Vaporeon determined by the starter choice; the
stored level 65 is common to all three.

## Reviewed access graph

I checked the pinned `maps.asm`, `data/maps/headers/`, `data/maps/objects/`, `scripts/`, `constants/event_constants.asm`, `data/maps/badge_maps.asm`, `data/items/use_overworld.asm`, and `engine/items/item_effects.asm`. Yellow map scripts are in the repository root `scripts/` directory. The former `data/maps/scripts` locator did not exist.

The access layer records 34 story milestones, including all eight badge victories, League progress, and Cerulean Cave post-game access. The location layer records 83 routes, towns, caves, story buildings, gyms, and gated subareas. The capability layer records five badge-checked HMs, three rods, the Silph Scope, Poké Flute, Lift Key, Card Key, Secret Key, and Safari Zone access. Field move item IDs use the source HM names (`HM_CUT` through `HM_FLASH`); key item and rod IDs follow `constants/item_constants.asm`. The location catalog also includes the NPC trade, fossil, rod, shop, Game Corner, and gift areas that the acquisition layer will need.

The milestone graph models the Yellow route through Mt. Moon, the S.S. Anne, Celadon, the Rocket Hideout, Pokémon Tower, Saffron, the southern routes, Silph Co., Cinnabar, Viridian Gym, and Victory Road. The player can reach each Rocket Hideout floor by its stairs; the separate elevator access needs the Lift Key. The player can enter Silph Co. before getting the Card Key. Yellow accepts Fresh Water, Soda Pop, or Lemonade at the Saffron guards. The guard consumes one drink and opens all four gates. Optional Power Plant, Seafoam Islands, Safari Zone, and Cerulean Cave access has separate requirements. The game does not require a player to visit every optional area before the League.

## Wild encounter review

I checked all 60 files in `data/wild/maps/*.asm` at the pinned revision. Fifty-five map tables have grass encounters. Eight tables have Surf encounters. Every active grass or water table has ten slots. The 15 other map files have no grass or water encounters.

The map tables are Route 1-25, Viridian Forest, Diglett's Cave, Mt. Moon 1F/B1F/B2F, Rock Tunnel 1F/B1F, Pokémon Tower 3F-7F, Pokémon Mansion 1F-3F/B1F, Power Plant, Seafoam Islands 1F/B1F-B4F, Victory Road 1F-3F, Cerulean Cave 1F/2F/B1F, and Safari Zone Center/East/North/West. Surf tables are on Routes 6, 12, 13, 19, 20, 21, and Seafoam Islands B3F/B4F.

I used `data/wild/probabilities.asm` for the ten grass and Surf slot weights: 51, 51, 39, 25, 25, 25, 13, 13, 11, and 3 out of 256. I grouped slots by map table, method, species, and exact level. I summed integer weights before rounding the table share to two decimal places. `ratePercent` records a species' share within the chosen table. It does not record the chance of a wild encounter on a step. Rounded table shares can total 100.01%.

I checked all 31 map records in `data/wild/super_rod.asm`. Yellow selects among four slots with random thresholds at 102, 178, and 229; the four weights are 102, 76, 51, and 27 out of 256. I checked `data/wild/good_rod.asm`: its two level-10 entries are equally likely. `engine/items/item_effects.asm` sets Old Rod to a level-5 Magikarp. I recorded those rod tables at each map listed by the Super Rod map table. Floor names remain in source IDs. The current location model combines floors into one location record.

The resulting collection has 800 wild sources: 542 grass, 42 Surf, 31 Old Rod, 62 Good Rod, and 123 Super Rod records. It includes 85 species. It has no wild Pikachu source. Route 1 and Cerulean Cave checks cover early and post-game tables. The source schema tests check every record.

The story graph now allows the player to reach Bill's house, Vermilion, and the Old Rod before Misty. Rocket Hideout does not require Erika's badge. Route 12 is open from Lavender Town. Route 12's Super Rod house is south of the Snorlax (`data/maps/objects/Route12.asm`: Snorlax at y 62, house warp at y 77), so it requires the Poké Flute. Route 16 and Route 17 still require the Flute to pass Snorlax. Rock Tunnel does not require Flash; Flash's use still has the Boulder Badge requirement. Surf needs the Soul Badge, and Strength needs the Rainbow Badge.

## Yellow acquisition and evolution source details

The pinned `data/pokemon/evos_moves.asm` defines level, item, and trade
evolutions. The reviewed list contains 72 transitions. The starter Pikachu
uses the normal Thunder Stone rule, but that one source is excluded through
`excludedSourceIds`: `yellow-starter-pikachu`. The Yellow starter is assigned in
`scripts/OaksLab.asm` (`OaksLabPlayerReceivesPikachuScript` and the Oak's Lab
object table); `data/pokemon/evos_moves.asm` still defines Pikachu to Raichu.

Yellow has five finite Moon Stone pickups. The Poké Ball on Mt. Moon 1F is in
`data/maps/objects/MtMoon1F.asm`; the hidden pickup on Mt. Moon B2F is in
`data/events/hidden_events.asm` under `MT_MOON_B2F`; Route 2 and Rocket Hideout
B2F Poké Balls are in `data/maps/objects/Route2.asm` and
`RocketHideoutB2F.asm`; and Pokémon Mansion 1F has a hidden pickup in
`data/events/hidden_events.asm` under `POKEMON_MANSION_1F`. Each is a finite,
one-use source. The mansion pickup is reachable from Cinnabar on foot, so its
location has no Surf requirement. The Moon Stone is absent from all active
mart inventories. `data/items/marts.asm` lists Fire, Thunder, Water, and Leaf
Stones in Celadon Department Store 4F; those are repeatable stock and each has
an unbounded source record. Stone evolution rules are in
`data/pokemon/evos_moves.asm`.

The Dojo scripts `scripts/FightingDojo.asm` set either
`EVENT_GOT_HITMONLEE` or `EVENT_GOT_HITMONCHAN`, and prevent taking both. The
fossil choice is set in `scripts/MtMoonB2F.asm` by accepting either Dome or
Helix Fossil. The Yellow Game Corner prize tables are in
`data/events/prizes.asm`: Abra, Vulpix, Wigglytuff, Scyther, Pinsir, and Porygon.
The maintained acquisition records include Bulbasaur (`scripts/CeruleanMelaniesHouse.asm`), Charmander (`scripts/Route24.asm`), Squirtle (`scripts/VermilionCity_2.asm`), Eevee (`scripts/CeladonMansionRoofHouse.asm`), Lapras (`scripts/SilphCo7F.asm`), the Dojo gifts (`scripts/FightingDojo.asm`), the six prize species (`data/events/prizes.asm`), the seven active trades (`data/events/trades.asm` and their map scripts), fossil revival (`scripts/CinnabarLabFossilRoom.asm`), and static Snorlax, Power Plant, and Zapdos objects (`data/maps/objects/Route12.asm`, `Route16.asm`, and `PowerPlant.asm`).

NPC trade definitions are in `data/events/trades.asm`; active trade scripts
include `scripts/Route11Gate2F.asm`, `scripts/Route2TradeHouse.asm`,
`scripts/CinnabarLabFossilRoom.asm`, `scripts/CinnabarLabTradeRoom.asm`,
`scripts/Route18Gate2F.asm`, and `scripts/UndergroundPathRoute5.asm`. Their
offered and received species have reviewed source records. Static encounters,
gifts, fossil revival, and tracked item sources are recorded in the Yellow
collections.
