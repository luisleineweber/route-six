# Pokemon Sapphire coverage review

Review date: 13 October 2026. Source revision:
`5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f`.

Sapphire is registered. The reviewed collections include 386 profiles,
the 202-entry Hoenn Dex, the 17-type Generation III chart, 13 Gym and League
caps, 132 milestones, all 34 numbered routes, 81 locations, and 27 capabilities.
Acquisition, breeding, evolution, exclusion, and the local raw game module are
present. The parent task owns registry changes.

At the pinned revision, `include/constants/species.h` defines the National Dex
through Deoxys #386 and the Hoenn Dex through Deoxys #202. Extra form and
extended-dex constants do not create more canonical profiles.
`src/data/pokemon/base_stats.h` supplies types, gender ratios, and Egg Groups.
`data/type_effectiveness.inc` supplies the 17-type chart. Sapphire trainer
parties and Gym scripts supply the 13 boss caps. Tests check these counts and
the exact profile set.

## Acquisition review

The source table `src/data/wild_encounters.json` contains 97 entries labelled
`*_Sapphire`. The dataset records all 1,631 ordinary encounter slots across
these tables. Each wild source keeps its source map label, method, species,
slot number, level range, and slot weight. The map tables use the game's
corresponding Sapphire location record. The coverage test checks all 97 map
labels and the method totals.

Feebas is separate from the ordinary Route 119 table. `src/wild_encounter.c`
checks the six tile values selected from the save. Feebas sources record level
20–25 and the 50% slot for Old, Good, and Super Rod. The planner does not track
the selected tiles.

The 22 direct non-wild records cover the three starters, Wynaut's egg, Castform,
Beldum, both Route 111 fossil revivals, the three in-game trades, the Kecleon
and Electrode/Voltorb statics, all three Regis, Kyogre, Rayquaza, and Latias.
Fossils are found in the Route 111 desert after the Go-Goggles event. They do
not use Mirage Tower, which is Emerald-only. The trades are Slakoth for
Makuhita, Pikachu for Skitty, and Bellossom for Corsola. Their levels match the
offered Pokemon. Sapphire's fixed post-League roamer is Latias. Latios requires
the external Eon Ticket event and is outside this collection.

The item collection has 26 records and 43 source placements. It retains
finite-use limits. The pinned Lilycove Department Store inventory sells all
six evolution stones. Sapphire's Sun Stone also comes from the Mossdeep Space
Center gift. The Moon Stone has a Meteor Falls pickup and a Lunatone held-item
path. Solrock is not a Sapphire acquisition source. The choice collection has
three groups: starter, fossil, and Captain Stern's Scanner reward. Every item,
choice, and source has a Sapphire reference and review date.

## Breeding coverage

The 180 reviewed rules have 182 matching offspring source records. Each source
requires the Route 117 Day Care capability and hatches at level 5. The Azurill
and Wynaut rules keep their Sea Incense and Lax Incense requirements. Their
ordinary parent groups produce Marill and Wobbuffet without those items. The
focused test checks every rule and offspring pair, confirms Ditto is never an
offspring, and solves native late-game access for Azurill and Pichu.

The late-game solve reaches every obtainable species and leaves all 194
reviewed exclusions unreachable. Gift and finite starter sources remain
subject to their real source limits when they serve as breeding parents.

## Story-gated opportunities

| Mechanic | Sapphire source behavior | Dataset treatment |
| --- | --- | --- |
| Mirage Island | `src/time_events.c` and the Route 130/Pacifidlog scripts compare a daily value with a party Pokemon personality value. | Record an optional opportunity after Route 130 access. The planner does not predict the daily match. Wynaut is not marked as excluded. |
| Sealed Chamber | Route 134 and Sealed Chamber scripts require Relicanth and Wailord in order, plus Braille puzzle actions. | Record the Regi opportunities behind the species and puzzle requirements. The planner does not simulate party order or puzzle inputs. |
| Latias roamer | `include/constants/species.h` sets `ROAMER_SPECIES` to Latias under `SAPPHIRE`; `src/roamer.c` moves it between routes. | Record Latias after the Hall of Fame TV report. The planner does not track its current route. |

These conditions depend on save details. The planner asks whether a player
could obtain a species by the selected story point. It does not promise an
exact tile, daily match, puzzle sequence, or roamer location.

Sapphire's Sootopolis Gym leader is Wallace. The pinned
`SootopolisCity_Gym_1F/scripts.inc` starts the Gym battle with
`TRAINER_WALLACE`. The Sapphire checkpoint and Gym cap use Wallace.

The pinned version branches also confirm Sapphire's story sequence. Team Aqua
takes the Meteorite at Meteor Falls. Archie leads the battle at Mt. Chimney.
The player receives the Blue Orb at Mt. Pyre, then sees Aqua take the
submarine at Slateport before entering the Aqua Hideout in Lilycove. Steven's
Mossdeep house gives Dive without an Emerald Space Center battle. The planner
records that item event at Mossdeep; Dive use still requires the Tate & Liza
badge. The Seafloor Cavern event awakens Kyogre, then Cave of Origin follows.

## Thirteen collection status

| Collection | Status |
| --- | --- |
| `game.json` | Reviewed: Sapphire identity and progress checkpoints |
| `pokemon.json` | Reviewed: 386 profiles and exact 202-entry Hoenn order |
| `type-chart.json` | Reviewed: complete 17 by 17 Generation III chart |
| `progression.json` | Reviewed foundation: 132 milestones, all 34 routes, story and postgame |
| `bosses.json` | Reviewed: eight Gyms, Elite Four, and Steven's cap |
| `locations.json` | Reviewed foundation: 81 route, story, and optional locations |
| `capabilities.json` | Reviewed foundation: 27 HM, rod, Day Care, field, and evolution gates |
| `items.json` | Reviewed: 26 item records and 43 item-source placements |
| `choices.json` | Reviewed: starter, fossil, and Scanner reward choices |
| `sources.json` | Reviewed: 97 maps, 1,631 ordinary wild slots, three Feebas sources, 22 direct native sources, and 182 breeding sources |
| `breeding-rules.json` | Reviewed: 180 native offspring rules, including Sea Incense and Lax Incense baby exceptions |
| `evolutions.json` | Reviewed: 184 level, item, friendship, beauty, personality, stats, time, and player-trade rules |
| `exclusions.json` | Reviewed: 194 species with proven other-version or external-event absence |

Reference IDs and source locators are in [Sapphire source review](sapphire-sources.md).
That file lists the game-specific records in `data/references.json`. Focused
Sapphire tests validate the local module and check early and postgame access,
trade blockers, excluded Latios, and finite roamer and item sources. Complete
the parent task's shared integration and planner checks before enabling Sapphire.


## Sea access correction

The `aqua-hideout` milestone records reaching the hideout. It does not record
clearing it. Lilycove's pinned scripts keep the sea exit blocked while
`FLAG_EVIL_TEAM_ESCAPED_IN_SUBMARINE` is unset; the final hideout scene sets
that flag. The dataset now records `aqua-hideout-cleared` as a separate story
milestone. Mossdeep and Routes 124-131 require that milestone. This includes
the Shoal Cave approach on Route 125 and the Super Rod at Mossdeep. Underwater
Routes 124, 126, 127, and 128 keep their Dive gate and also require hideout
clearance.

Route 134 has a separate direct connection from Slateport and remains open
after Norman. Its western encounters are reachable with Surf. The east edge
does not provide an eastward route into Route 133: the connecting water tiles
are westward currents, and the game forces movement west when the player enters
one. Routes 132 and 133 and Pacifidlog are reached from Route 131 on the eastern
sea. They require `aqua-hideout-cleared`. Regression coverage checks a specific
Route 133 encounter source before and after that checkpoint, as well as the
Route 128 Luvdisc gate.

## Sky Pillar access review

Sapphire's Route 131 transition script calls `setmaplayoutindex 320` only when
`FLAG_SYS_GAME_CLEAR` is set. The Route 131 warp at x=36, y=6 exists in the
base map, but the game-clear layout change opens the approach to Sky Pillar.
Sky Pillar's upper floors use cracked floors that require the Mach Bike. The
location therefore requires game clear, and the Rayquaza source requires the
Mach Bike to reach the summit. Rayquaza is at the summit at level 70; its
encounter is not blocked by a separate story flag. The planner's level-cap
setting handles that level requirement.

Source proof: pinned `data/maps/Route131/scripts.inc` lines 5-10,
`data/maps/Route131/map.json` warp event, `data/maps/SkyPillar_Entrance/map.json`
and `data/maps/SkyPillar_Outside/map.json` warps, and
`data/maps/SkyPillar_Top/scripts.inc` lines 13-24 for the Rayquaza battle and
`FLAG_HIDE_RAYQUAZA` set after the encounter. The flag is absent from new-game
initial flags and has no plot-gate use. The static stays at level 70.

The pinned `src/evolution_scene.c` `CreateShedinja` routine creates Shedinja
when the party has fewer than six members. It does not check or consume a
Poké Ball. Sapphire keeps this rule as a free party slot requirement only.
