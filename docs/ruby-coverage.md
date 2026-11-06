# Pokemon Ruby coverage

Scope: international English Pokemon Ruby for Game Boy Advance. Include native encounters, one-time gifts, in-game trades, game evolutions, breeding, and ordinary story and postgame access. Exclude player trades and external events. Review date: 13 October 2026.

Pinned source: [pret/pokeruby](https://github.com/pret/pokeruby/tree/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f), revision `5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f`. The maintained files are local JSON. The game module only assembles those files.

## Coverage

Ruby has 386 supported species profiles. All 386 have an acquisition path or a reviewed exclusion. The Hoenn Dex order has 202 entries. The full 17-type Generation III chart is checked against Ruby's type data. The boss list has eight Gym leaders, four Elite Four members, and Champion Steven.

The dataset has 131 milestones, 83 locations, 28 capabilities, 27 items, 3 choice groups, 944 acquisition sources, 180 breeding rules, 184 evolution rules, and reviewed exclusions. The sources include 740 Ruby wild encounters, static encounters, gifts, fossils, eggs, trades, and breeding access. `CheckFeebas` runs before rod-specific encounter selection, so the three rods all have the special 50% Feebas path on one of the six valid tiles. The six tile identities do not need save-specific tracking.

| Collection | Ruby evidence and review |
| --- | --- |
| `game.json` | Ruby build identity in `config.mk`; Hoenn Gym and League scripts; story dependencies in Ruby map scripts. |
| `pokemon.json` | `base_stats.h`, species constants, Hoenn Dex mappings, and local sprite checks. |
| `type-chart.json` | Ruby `data/type_effectiveness.inc`; complete 17 x 17 matrix checked. |
| `progression.json` | Ruby map scripts for the eight Gyms, villain events, Seafloor Cavern, Groudon, Wallace, Steven, and postgame areas. |
| `bosses.json` | Ruby party data in `src/data/trainer_parties.h` and matching trainer scripts. |
| `locations.json` | Ruby map data and Ruby-specific access requirements. |
| `capabilities.json` | Ruby rod, field move, bike, Day Care, puzzle, low-tide, and Mirage Island requirements. |
| `items.json` | Ruby item-ball, map, shop, held-item, and exchange sources; Ruby item constants. Repeatable Lilycove stone purchases and the finite Scanner/fossil choices are recorded. |
| `choices.json` | Birch starter, Route 111 desert fossil, and Scanner reward choices. |
| `sources.json` | Ruby-only encounter tables, special Feebas and Mirage Island cases, static battles, gifts, the three Ruby NPC trades, fossils, eggs, and breeding paths. |
| `breeding-rules.json` | Ruby Day Care offspring, incense rules, and hatch level 5. |
| `evolutions.json` | Ruby evolution table and in-game requirements. Player-trade evolutions remain blocked by project scope. |
| `exclusions.json` | Ruby version-specific sources and external distribution boundaries. |

## Version-specific findings

Ruby's source defines `ROAMER_SPECIES` as Latias only under `SAPPHIRE`; the other branch selects Latios. `config.mk` defaults to Ruby. Ruby therefore has the level-40 Latios roamer. Its source uses the roaming encounter kind and the Hoenn roaming routes location after the League event. Latias is excluded from ordinary Ruby acquisition. The Eon Ticket ferry to Southern Island is outside scope. Source locators and line evidence are in [ruby-sources.md](ruby-sources.md).

Ruby uses Wallace as Gym 8 and Steven as Champion. Groudon is the Cave of Origin static encounter. Rayquaza is a level-70 Sky Pillar encounter after game clear and the Mach Bike climb. Ruby has a Battle Tower, not Emerald's Battle Frontier. Its ordinary Safari Zone sources remain available after the Pokéblock Case and Devon Scope gates. The optional Mirage Island source is represented as possible access after its party-personality check; the planner does not model a particular save's daily value. Wynaut's Route 130 land table is available only on the Mirage Island map layout and uses the table's level range, 5-50.

Ruby's Mt. Pyre event gives the player the Red Orb. Ruby has no Magma Emblem event. Team Magma steals the submarine and uses the Lilycove hideout. After Tate and Liza, Steven gives Dive in his Mossdeep house. These version-specific labels, locations, and gates are checked separately from Emerald.

Ruby's fossils are picked up in the Route 111 desert. The player can take the Root Fossil or the Claw Fossil; the chosen fossil is revived at Devon Corporation. Mirage Tower is not part of Ruby. The `fossil-choice` group and its one-use item sources model this one-fossil limit.

Ruby's three NPC trades are Makuhita for Slakoth in Rustboro, Skitty for Pikachu in Fortree, and Corsola for Bellossom in Pacifidlog. The game creates each received Pokémon at the level of the offered Pokémon. The trade's fixed personality gives Makuhita male, Skitty female, and Corsola male. Each map script records a one-time completion flag.

After Norman grants Surf, the Lilycove exit remains blocked until the player clears Team Magma Hideout and the submarine escapes. Routes 124-133, Mossdeep, and Pacifidlog therefore require Surf and the Team Magma Hideout clearance checkpoint. Route 134 has a separate direct connection from Slateport, but its westward currents block eastward travel to Route 133. Shoal Cave encounter sources also require low tide. Super Rod access is in Mossdeep and uses its Surf and Team Magma Hideout gates. New Mauville requires both Surf and Wattson's one-use Basement Key. Evolution stones use native pickups, Route 124 shard exchanges, and held items. Ruby has one Meteor Falls Moon Stone and repeatable Solrock-held Sun Stones. The fifth-floor shop constants identify dolls. The Pokéblock Case is a one-time gift in the Slateport Contest Lobby. The Scanner is removed when Captain Stern exchanges it for one of the two held items.

The starter and fossil choices are limited to one option. Ruby's one-version sources are reviewed against Ruby's own encounter and event tables. In-game trades do not enable the player-trade evolution paths.

Ruby was registered as the second complete game before the group was enabled. Its two-game tests, build, game switching, planners, exports, and 320px browser checks passed. See [ruby-sources.md](ruby-sources.md) for the pinned source list and shared reference records.
