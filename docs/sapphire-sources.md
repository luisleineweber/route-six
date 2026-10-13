# Pokémon Sapphire source review

Reviewed on 12 and 13 October 2026. The primary source is the `pret/pokeruby`
decompilation at commit `5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f`, the
upstream `master` head checked on the review date. The repository supports the
original English Pokémon Sapphire release. All source links below pin this
revision.

The game-specific reference objects below are in `data/references.json`.

Reviewed data fact checks at this revision:

- `include/constants/species.h`: canonical National Dex numbers end at Deoxys
  #386; the Hoenn Dex numbers end at Deoxys #202. The file also defines extra
  forms and extended-dex entries, so its number of constant lines is not the
  canonical species count.
- `src/data/pokemon/base_stats.h`: species type, gender ratio, and Egg Group
  facts used by the profiles. These facts are shared across Ruby and Sapphire
  in this source tree; Sapphire encounter tables and event scripts are not.
- `data/type_effectiveness.inc`: explicit Generation III type interactions.
  Neutral cells are filled as neutral in the maintained complete matrix.
- `src/data/trainer_parties.h` and Gym map scripts: eight Gym caps, four Elite
  Four caps, and Steven's Champion cap. Sapphire has no postgame rematch data
  in this boss list.
- `data/maps/Route101` through `data/maps/Route134` and their `scripts.inc`
  files: the 34 numbered route records and their story or field access.
- Sapphire's shared map scripts select Team Aqua's orb and submarine scenes.
  `MtPyre_Summit/scripts.inc`, `AquaHideout_B2F/scripts.inc`,
  `MossdeepCity_StevensHouse/scripts.inc`, and the Sootopolis, Seafloor Cavern,
  Cave of Origin, and Sky Pillar scripts review the version story sequence.
- `include/constants/species.h` lines 1282-1286: `ROAMER_SPECIES` is Latias
  when `SAPPHIRE` is defined and Latios otherwise. Sapphire's post-League
  roaming opportunity is therefore Latias only. Latios requires the external
  Eon Ticket event and is outside this planner's scope.
- `data/scripts/hall_of_fame.inc` sets the TV event flag after the Champion.
  The Littleroot house scripts call the TV event, and `data/scripts/tv.inc`
  initializes the roamer when the player watches that report. The postgame
  checkpoint follows this TV event. The Hall of Fame script also enables the
  Beldum gift and S.S. Tidal ticket events.
- `data/maps/SootopolisCity_Gym_1F/scripts.inc` names Wallace as the Sootopolis
  Gym trainer in Ruby and Sapphire. Juan is an Emerald Gym leader, so the
  Sapphire Gym checkpoint remains Wallace.
- `src/field_control_avatar.c` and `src/pokemon_menu.c`: field move use needs
  its matching badge. The records use the badge milestones for Cut, Flash,
  Rock Smash, Strength, Surf, Fly, Dive, and Waterfall. HM receipt events are
  reviewed in the map scripts listed above and the Rustboro, Mauville,
  Petalburg, Route 119, and Mossdeep item scripts.
- `data/maps/DewfordTown/scripts.inc`, `Route118/scripts.inc`,
  `MossdeepCity_House3/scripts.inc`, `Route117_PokemonDayCare/scripts.inc`,
  bike shop, and evolution scripts review rod, Day Care, bike, and evolution
  action capabilities.

The same repository contains Ruby and Sapphire datasets. Profile, chart,
progression, item, choice, acquisition, breeding, evolution, and exclusion
records use Sapphire's records in this pinned tree.

```json
[
  {"id":"sapphire-species","title":"Sapphire species types, genders and Egg Groups","locator":"src/data/pokemon/base_stats.h and include/constants/species.h","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/data/pokemon","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-dex","title":"Sapphire Hoenn and National Pokédex species order","locator":"include/constants/species.h; Hoenn dex constants and national dex constants","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/include/constants/species.h","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-type-chart","title":"Generation III type effectiveness","locator":"src/battle_util.c and battle damage type-effectiveness handling","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/battle_util.c","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-encounters","title":"Sapphire wild encounter tables","locator":"src/data/wild_encounters.json and src/wild_encounter.c","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/data","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-progression","title":"Sapphire route, story and event scripts","locator":"data/maps/Route101 through Route134 scripts and map files; story map scripts; data/scripts/hall_of_fame.inc; data/scripts/tv.inc; data/event_scripts.s; src/field_control_avatar.c; src/pokemon_menu.c","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-bosses","title":"Sapphire Gym, Aqua, Elite Four and Champion parties","locator":"src/data/trainer_parties.h and trainer constants","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/data/trainer_parties.h","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-evolutions","title":"Sapphire evolution triggers and conditions","locator":"src/data/pokemon/evolution.h; src/pokemon_3.c","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/data/pokemon","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-breeding","title":"Sapphire breeding compatibility and offspring rules","locator":"src/daycare.c and src/data/pokemon/base_stats.h","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/daycare.c","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-hatch","title":"Sapphire egg hatch level","locator":"include/daycare.h (EGG_HATCH_LEVEL)","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/include/daycare.h","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-items","title":"Sapphire item identities and placements","locator":"include/constants/items.h; data/item_ball_scripts.inc; data/maps/*/scripts.inc; shop inventories","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-trades","title":"Sapphire NPC trade offers and requirements","locator":"data/maps/*/scripts.inc; src/trader.c","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-choices","title":"Sapphire starters, fossils, one-time gifts and version choice","locator":"data/maps/LittlerootTown_ProfessorBirchsLab/scripts.inc; Route111 desert scripts; Route114 Fossil Maniac scripts; postgame scripts","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-postgame","title":"Sapphire postgame access, roamer and ordinary legendary events","locator":"data/scripts/hall_of_fame.inc; data/scripts/tv.inc; data/maps/*/scripts.inc; src/time_events.c; src/roamer.c","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-feebas","title":"Feebas fishing checks and Route 119 fishing spot rules","locator":"src/wild_encounter.c (CheckFeebas and FishingWildEncounter); data/maps/Route119","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/wild_encounter.c","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-mirage-island","title":"Mirage Island daily personality check and encounter access","locator":"src/time_events.c; data/maps/Route130/scripts.inc; data/maps/PacifidlogTown_House5/scripts.inc","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"sapphire-regi-puzzle","title":"Sealed Chamber and Regi unlock party requirements","locator":"data/maps/Underwater_Route134/scripts.inc; data/maps/SealedChamber_OuterRoom/scripts.inc; data/maps/SealedChamber_InnerRoom/scripts.inc","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"}
]
```

## Collection source map

| Sapphire collection | Review references |
| --- | --- |
| `game.json` | `sapphire-progression`, `sapphire-hatch` |
| `pokemon.json` (profiles) | `sapphire-species`, `sapphire-dex` |
| `type-chart.json` | `sapphire-type-chart` |
| `progression.json` | `sapphire-progression`, `sapphire-postgame` |
| `bosses.json` | `sapphire-bosses`, `sapphire-progression` |
| `locations.json` | `sapphire-progression`, `sapphire-encounters` |
| `capabilities.json` | `sapphire-progression`, `sapphire-items` |
| `items.json` | `sapphire-items`, `sapphire-progression` |
| `choices.json` | `sapphire-choices`, `sapphire-trades` |
| `sources.json` | `sapphire-encounters`, `sapphire-progression`, `sapphire-trades`, `sapphire-choices`, `sapphire-feebas`, `sapphire-postgame`, `sapphire-breeding`, `sapphire-hatch` |
| `breeding-rules.json` | `sapphire-breeding` |
| `evolutions.json` | `sapphire-evolutions`, `sapphire-items`, `sapphire-progression` |
| `exclusions.json` | `sapphire-encounters`, `sapphire-choices`, `sapphire-postgame` |

The Sapphire foundation is kept in `data/games/sapphire/`. It has a 132-node
story graph, all 34 numbered routes, 81 locations, and 27 capabilities. It
uses Sapphire's Blue Orb, Team Aqua, and Kyogre story events, keeps Wallace as
the eighth Gym leader, and records Latias as the fixed Sapphire roamer. The
Emerald-only Mirage Tower milestone and location were removed. The fossils are
found directly in the Route 111 desert after the Go-Goggles event.

The acquisition layer reads the pinned Sapphire-labelled entries in
`src/data/wild_encounters.json`. It records 97 map tables and all 1,631 ordinary
encounter slots. A source ID retains the source map label, method, species, and
slot number. It keeps the slot level range and encounter weight. The fishing
slots are split by Old, Good, and Super Rod. The separate Feebas check is
recorded for all three rods at levels 20–25 and 50% on a selected tile. The
planner does not predict the save's selected tile.

The 22 direct non-wild source records cover the three starters, Wynaut's egg, Castform,
Beldum, both Route 111 fossil revivals, all three Sapphire NPC trades, the
Kecleon and Electrode/Voltorb statics, the Regi trio, Kyogre, Rayquaza, and
Latias. NPC trade levels match the offered Pokémon. Items include 26 records
and 43 local item-source records; choices include the starter, fossil, and
Scanner rewards. Each item and acquisition record has a Sapphire reference and
review date. The 182 breeding source records cover every offspring outcome in
the 180 reviewed rules. Each source requires Route 117 Day Care access and sets
the reviewed level 5 hatch. Wynaut and Azurill also require their held incense.

The 184 evolution records were checked against Sapphire's pinned
`src/data/pokemon/evolution.h` and its item, time, and stat checks in
`src/pokemon_3.c`. They include friendship level 0 (the source's internal
threshold), day/night Eevee branches, Beauty, Tyrogue's three stat comparisons,
Wurmple's personality split, Nincada's party-space Shedinja, and all twelve
player-trade evolutions. Trade evolutions stay explicit blocked rules.

The 180 breeding rules and their 182 offspring sources use the pinned
`src/daycare.c`, `include/daycare.h`, and `src/data/pokemon/base_stats.h`.
The Day Care returns level 5 eggs. It requires Lax Incense for Wynaut and Sea
Incense for Azurill; without those items, the matching parent groups produce
Wobbuffet and Marill. No additional incense offspring exceptions apply in
this generation. The Route 117 source requires the Day Care capability, so
eggs become available after Mauville access.

The 194 exclusions were checked against Sapphire encounter tables and regular
event scripts. Latios is external-event-only through Eon Ticket. Jirachi and
Deoxys are external distribution events. Other exclusions need another
version or an excluded player trade. Latias remains native through the Sapphire
postgame roamer. All reference IDs used by these records already exist in
`data/references.json`; no new reference IDs are needed.

## Evolution stone shop correction: 13 October 2026

The Lilycove fifth-floor clerk opens a decoration shop with
`pokemartdecoration2`. The six stone constants have values 93-98. Those values
refer to dolls in the decoration table. The six false stone shop sources were
removed. Sapphire retains its native pickups and Route 124 shard exchanges.
Native Lunatone can hold repeatable Moon Stones. The Mossdeep Space Center
gives one Sun Stone.

Pinned locators: [Fifth-floor shop command](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/LilycoveCity_DepartmentStore_5F/scripts.inc#L4-L28),
[shop command handler](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/scrcmd.c#L1773-L1779),
[decoration purchase](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/shop.c#L673-L675),
and [decoration IDs](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/include/constants/decorations.h#L97-L102).

## Route 133 current direction review

The pinned source commit is `5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f`.
`config.mk` supports both Ruby and Sapphire at this revision. Sapphire's
Route 134 uses the 80 by 40 `Route134` layout. On its east edge, rows 5 through
25 use metatile `0x263`. The low ten-bit metatile number is `0x263`, which maps
to Pacifidlog secondary metatile 99 after the `0x200` secondary-set offset.
Attribute 99 in `data/tilesets/secondary/pacifidlog/metatile_attributes.bin`
is `0x1051`; its behavior byte is `0x51` (`MB_WESTWARD_CURRENT`). The map
connection at this edge leads to Route 133. `MB_WESTWARD_CURRENT` is defined
in `include/constants/metatile_behaviors.h`. `ForcedMovement_RideCurrentWest`
in `src/field_player_avatar.c` calls forced west movement. This blocks an
eastward route from Slateport. Route 134 remains Surf-accessible for its
western encounters. Routes 132 and 133 and Pacifidlog are reached from the
eastern sea through Route 131 and require `aqua-hideout-cleared`.

Pinned locators: [Route 134 map connection](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route134/map.json#L12-L21), [Route 134 layout dimensions](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/layouts/layouts.json#L490-L503), [Route 134 tile grid](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/layouts/Route134/map.bin), [Pacifidlog secondary tile attributes](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/tilesets/secondary/pacifidlog/metatile_attributes.bin), [westward current behavior](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/include/constants/metatile_behaviors.h#L84-L87), and [forced west movement](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/field_player_avatar.c#L443-L446).
