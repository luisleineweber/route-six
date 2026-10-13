# Pokémon Ruby source review

Game: international English Pokémon Ruby (original Game Boy Advance release).
The reviewed source revision is `pret/pokeruby`
`5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f` (reviewed 13 October 2026).
All source links below point to that commit. The repository is the primary
source reconstruction. Data records are manually maintained; the app does not
load these files.

The proposed references are game-scoped. The parent has merged these game-specific references into `data/references.json`. Keep this copy as the review record.

```json
[
  {"id":"ruby-game","title":"Pokémon Ruby identity and game version","locator":"config.mk","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/config.mk","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-profiles","title":"Ruby species, types, genders, Egg Groups, and species IDs","locator":"src/data/pokemon/base_stats.h; include/constants/species.h","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/data/pokemon","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-dex","title":"Ruby Hoenn Pokédex order","locator":"include/constants/species.h; src/pokemon_1.c; include/pokedex.h","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/include","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-type-chart","title":"Ruby Generation III type effectiveness","locator":"data/type_effectiveness.inc","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/type_effectiveness.inc","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-progression","title":"Ruby story flags, access events, and ordinary postgame events","locator":"data/maps/*/scripts.inc; data/scripts/; data/event_scripts.s","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-bosses","title":"Ruby Gym, rival, villain, and League parties","locator":"src/data/trainer_parties.h; data/maps/*/scripts.inc","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/data/trainer_parties.h","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-locations","title":"Ruby map identities and region layout","locator":"data/maps/*/map.json; data/maps/map_groups.json","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-capabilities","title":"Ruby field moves and overworld capability scripts","locator":"data/field_move_scripts.inc; data/maps/*/scripts.inc","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-items","title":"Ruby item pickups, key items, and item gates","locator":"data/item_ball_scripts.inc; data/maps/Route111/scripts.inc; data/maps/MauvilleCity/scripts.inc; data/maps/NewMauville_Inside/scripts.inc; data/maps/Route121_SafariZoneEntrance/scripts.inc; data/maps/LilycoveCity_DepartmentStore_5F/scripts.inc; data/maps/SlateportCity_ContestLobby/scripts.inc; data/maps/*/scripts.inc; include/constants/items.h","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/item_ball_scripts.inc","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-choices","title":"Ruby one-time starter, fossil, and story choices","locator":"data/maps/Route111/scripts.inc; data/maps/SlateportCity_Harbor/scripts.inc; data/maps/*/scripts.inc","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-encounters","title":"Ruby wild encounter tables and encounter methods","locator":"src/data/wild_encounters.json; src/wild_encounter.c; src/time_events.c; data/maps/Route130/scripts.inc; data/maps/PacifidlogTown_House5/scripts.inc","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/data","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-gifts-trades","title":"Ruby gift Pokémon, in-game trades, and static encounters","locator":"src/trade.c; data/maps/RustboroCity_House1/scripts.inc; data/maps/FortreeCity_House1/scripts.inc; data/maps/PacifidlogTown_House3/scripts.inc; data/maps/Route111/scripts.inc; data/maps/RustboroCity_DevonCorp_2F/scripts.inc; data/maps/*/scripts.inc; include/trade.h; src/roamer.c; data/scripts/tv.inc; data/maps/LilycoveCity_Harbor/scripts.inc","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/trade.c#L851-L883","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-evolutions","title":"Ruby evolution methods, levels, and conditions","locator":"src/data/pokemon/evolution.h; src/pokemon_1.c; src/evolution_scene.c","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/data/pokemon/evolution.h","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-breeding","title":"Ruby Day Care compatibility, offspring, and hatch level","locator":"src/daycare.c; include/daycare.h; src/data/pokemon/base_stats.h","url":"https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/daycare.c","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"},
  {"id":"ruby-exclusions","title":"Ruby version and distribution availability boundaries","locator":"config.mk; data/maps/*/scripts.inc; src/mystery_event_script.c","url":"https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f","revision":"5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f"}
]
```

## Review status

The revision and source locators are verified against the repository tree.
`include/constants/species.h` defines `ROAMER_SPECIES` as Latias under `SAPPHIRE` and Latios in the `#else` branch (lines 1281-1286). `config.mk` defaults to Ruby, so Ruby uses Latios as its post-League roamer. `src/roamer.c` creates that species at level 40. Lilycove Harbor checks for the Eon Ticket before the Southern Island ferry; that external event path is outside scope. The native Latios result does not require exact roamer-route tracking.

The Latios source is a one-use `roaming` encounter at fixed level 40, located
in Hoenn's roaming routes. Its requirement is the post-League `latios-roams`
event. The player can catch the species after release without tracking its
current route.

The wild encounter file has separate Ruby tables. Regional order is declared
by `HOENN_DEX_*` constants; `HOENN_DEX_COUNT` is 202. Ruby's wild encounter
records, map scripts, species profiles, evolution table, type data, and Day
Care code are version-specific review sources. All thirteen collections use Ruby-specific review IDs and the pinned revision.

`src/wild_encounter.c:75-108` checks the Route 119 Feebas tile and 50% roll.
`FishingWildEncounter` calls this check before it selects the active rod's
ordinary encounter table (`src/wild_encounter.c:598-613`). Ruby therefore has
the special Feebas path with the Old, Good, and Super Rod. Each path uses the
source's level range 20-25 and 50% tile encounter chance. The planner does not
track the six save-dependent tile coordinates.

Route 130's Ruby encounter table on the Mirage Island map layout contains
Wynaut in its land slots at levels 5-50. `data/maps/Route130/scripts.inc:5-29`
checks whether Mirage Island is present and selects that layout. The source
therefore requires the possible Mirage Island capability. The planner does not
simulate a save's daily personality value; it records that the encounter can
be acquired on a qualifying day.

## NPC trades and fossils

The English `gIngameTrades` table in `src/trade.c:851-883` defines three Ruby
trades. Rustboro City House 1 uses table entry 0: Makuhita for Slakoth, NPC
ELYSSA, OT gender male, fixed personality `0x9C40`, held X Attack. Fortree City
House 1 uses entry 1: Skitty for Pikachu, NPC DARRELL, OT gender female,
personality `0x498A2E17`, held Glitter Mail. Pacifidlog Town House 3 uses entry
2: Corsola for Bellossom, NPC LANE, OT gender female, personality
`0x4C970B7F`, held Tropic Mail. `src/trade.c:4942-4990` creates each received
Pokémon at the level of the offered Pokémon and applies its fixed personality
and held item. The table's `TRUE` / `FALSE` fields select its ability. The
species gender ratio and personality give Makuhita male, Skitty female, and
Corsola male. Each map script selects its table entry and sets a one-time
completion flag after the trade.

Ruby places the Root Fossil and Claw Fossil in the Route 111 desert.
`data/maps/Route111/scripts.inc:55-80` gives the selected fossil and hides both
objects. Lines 163-166 check for Go-Goggles before desert access.
`data/maps/RustboroCity_DevonCorp_2F/scripts.inc:79-112` consumes the fossil;
lines 145 and 165 award Lileep or Anorith at level 20. Ruby has no Mirage Tower.
The Fossil Maniac's Tunnel script directs the player to the Route 111 desert
and does not award a fossil.

Ruby's Solrock can hold a Sun Stone. Ruby has no Lunatone source, so the
Moon Stone must not include a Lunatone-held-item path. The item data keeps
repeatable shard exchanges and held-item paths separate from one-time pickups.
The player receives one of the two Route 111 fossils and one Scanner reward.
The item sources and choice groups record these limits.

The stone sources use native pickups, shard exchanges, and held items.
The data does not track money. The Space Center Sun
Stone and the Route 111 fossils remain one-time pickups. The Pokéblock Case is
given in the Slateport Contest Lobby, not Lilycove. The Scanner reward is
exchanged at Slateport Harbor; the exchange removes the Scanner after either
the Deep Sea Tooth or Deep Sea Scale is given.

After Norman grants Surf, Lilycove's Wailmer blockade still blocks the eastern
sea until the submarine escape event after the Team Magma Hideout. Routes
124-133, Mossdeep, and Pacifidlog require Surf and the Magma Hideout clearance checkpoint. Route 134 connects to Slateport, but Ruby's Route 134
map and westward-current behavior prevent eastward travel into Route 133 from
that western entry. Route 134 remains separately accessible from Slateport. Shoal Cave
encounters require the low-tide capability. Wattson gives the Basement Key
after his Gym event, before Norman; New Mauville still requires both that key
and Surf.
Safari Zone access requires the Pokéblock Case and Devon Scope. The source model
records these item gates instead of making all post-Surf locations immediately
accessible.

The game trade data model stores the offered species, received species,
possible gender, level relation, location, and one-time use. It cannot store an
NPC nickname, Original Trainer ID, IVs, nature, ability, or the mail / X Attack
held by the received Pokémon. These details do not change the reviewed species
access, progress, level, gender, or team availability rules in this planner.

## Evolution stone shop correction: 13 October 2026

The Lilycove fifth-floor clerk uses `pokemartdecoration2`. This command opens
`MART_TYPE_2`. The shop reads the decoration table and calls `AddDecoration`.
The six stone constants have values 93-98. In the decoration table, those values
are Baltoy, Kecleon, Azurill, Skitty, Swablu, and Gulpin dolls. The six false
Lilycove stone sources were removed. Ruby retains one Meteor Falls Moon Stone
and repeatable Sun Stones held by native Solrock. The other stones retain their
pickups and Route 124 shard exchanges. A team regression test checks that
Delcatty and Wigglytuff cannot both use the one Moon Stone.

Pinned locators: [Fifth-floor shop command](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/LilycoveCity_DepartmentStore_5F/scripts.inc#L4-L28),
[shop command handler](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/scrcmd.c#L1773-L1779),
[decoration purchase](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/shop.c#L673-L675),
and [decoration IDs](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/include/constants/decorations.h#L97-L102).

## Evolution and breeding review

The 184 Ruby evolution records were checked against the pinned src/data/pokemon/evolution.h table. They cover level, item, friendship, time, personality, Beauty, party-space, and trade methods. Ruby uses ITEM_UP_GRADE, represented by the local item ID upgrade. The table includes branch methods for Wurmple, Nincada, and Clamperl.

Ruby src/evolution_scene.c lines 458-487 creates Shedinja only when Nincada evolves and the party has a free slot. It does not check for or consume a Poke Ball. The Shedinja rule requires party space only. The 180 breeding rules use Ruby Day Care code and base-stat Egg Groups. The two incense rules produce Azurill with Sea Incense and Wynaut with Lax Incense.


## Lilycove sea access review

The pinned Ruby `LilycoveCity/scripts.inc` lines 1028-1087 call
`LilycoveCity_EventScript_SetWailmerMetatiles` while
`FLAG_EVIL_TEAM_ESCAPED_IN_SUBMARINE` is unset. The called script places
blocking Wailmer metatiles at Lilycove's sea exit. The same file's
`AquaHideout_B2F/scripts.inc` lines 57-68 show the final hideout event and set
that flag. `LilycoveCity/map.json` lines 12-21 connects Lilycove to Routes 121
and 124. `Route124/map.json` lines 12-31 connects Route 124 to Lilycove,
Route 125, and Route 126. This makes the hideout clearance a physical gate for
Routes 124-133, Mossdeep, and Pacifidlog, even when Surf is available.

`Route134/map.json` lines 12-21 connects its left edge to Slateport and its
right edge to Route 133. `layouts.json` defines Route 134 as an 80 by 40 map.
The pinned `Route134/map.bin` and Pacifidlog secondary tileset attributes show
that the connecting ocean tiles on the Route 133 edge are westward-current
tiles. The ordinary-water cells on that edge have no reachable approach from
the Slateport edge through surfable cells. Ruby's movement code forces the
player west upon entering a westward-current tile, so the player cannot cross
eastward from Slateport into Route 133. Routes 132-133 and Pacifidlog therefore
use the Team Magma Hideout gate. They remain reachable from the eastern sea: Route 131
connects to Pacifidlog, which connects through Route 132 to Route 133. Route 134
stays Surf-only for its reachable western encounters.

Pinned locators: [Lilycove scripts](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/LilycoveCity/scripts.inc#L1028-L1087), [Aqua Hideout B2F scripts](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/AquaHideout_B2F/scripts.inc#L57-L68), [Lilycove map connections](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/LilycoveCity/map.json#L12-L21), [Route 124 map connections](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route124/map.json#L12-L31), and [Route 134 map connections](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route134/map.json#L12-L21), [Route 131 connections](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route131/map.json#L12-L21), and [Routes 132-133 connections](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route132/map.json#L12-L21). The 80 by 40 dimensions are in [layouts.json](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/layouts/layouts.json#L490-L503); the tile grid is [Route134/map.bin](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/layouts/Route134/map.bin), and the tile behaviors are in [Pacifidlog metatile attributes](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/tilesets/secondary/pacifidlog/metatile_attributes.bin). Ruby names westward current behavior in [metatile_behaviors.h](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/include/constants/metatile_behaviors.h#L84-L87), and forces movement west when the player enters one in [field_player_avatar.c](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/field_player_avatar.c#L443-L446).


## Ruby story branch review

The pinned Mt. Pyre Summit script gives `ITEM_RED_OR_BLUE_ORB` and sets `FLAG_RECEIVED_RED_OR_BLUE_ORB`; Ruby uses the Red Orb. The Ruby branch does not use Emerald's Magma Emblem event. Ruby's villain text and the hideout access path use the Ruby `EVIL_TEAM` branch. The Ruby record labels this as Team Magma and places the hideout at Lilycove. `FLAG_EVIL_TEAM_ESCAPED_IN_SUBMARINE` controls the Lilycove Wailmer blockade and gates the east sea after the hideout event.

Steven's Mossdeep house script gives HM08 Dive in `MossdeepCity_StevensHouse_EventScript_StevenGivesDive`. This event becomes available after the Tate and Liza badge flag. The Dive capability therefore uses a checkpoint at Steven's house after Tate and Liza.

Sky Pillar opens after game clear. The Route 131 transition script changes
the map layout to 320 only when `FLAG_SYS_GAME_CLEAR` is set. The climb needs
the Mach Bike. The top script creates a level 70 Rayquaza. Its hide flag records
the completed encounter. The data uses the Hall of Fame gate for the location
and the Mach Bike gate for the encounter.

Pinned locators: [Route 131 layout gate](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/Route131/scripts.inc#L5-L10),
[Sky Pillar floor maps](https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/layouts/SkyPillar_2F),
and [Rayquaza event](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/SkyPillar_Top/scripts.inc).

Pinned locators: [Mt. Pyre Summit event](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/MtPyre_Summit/scripts.inc#L22-L72), [Lilycove event and Ruby hideout entrance](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/LilycoveCity/scripts.inc#L20-L42), [Lilycove Wailmer gate](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/LilycoveCity/scripts.inc#L30-L31), [Steven gives Dive](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/MossdeepCity_StevensHouse/scripts.inc#L26-L50), and [Tate and Liza badge flag](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/data/maps/MossdeepCity_Gym/scripts.inc#L45-L62).
