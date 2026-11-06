# Pokémon Blue coverage

Review date: 12 October 2026. The source is `pret/pokered` at commit
`af519899719f0754965776faac0e836a3b906e6d`. See
[blue-sources.md](blue-sources.md) for the source locators and proposed shared
reference records.

## Reviewed local dataset

Blue has all thirteen local data files. It covers the original international
English release. It includes native encounters, gifts, fossils, Game Corner
prizes, in-game trades, and normal postgame access. It excludes player trades,
glitches, and external events.

| Collection | Records |
| --- | ---: |
| Game rules | 1 |
| Kanto species profiles | 151 |
| Generation I type matchups | 15 types, 15 by 15 matrix |
| Story and route milestones | 51 |
| Kanto locations | 53 |
| Gym, Elite Four, and Champion | 13 |
| Field and encounter capabilities | 20 |
| Items | 29 |
| Finite choices | 3 |
| Native acquisition sources | 654 |
| Breeding rules | 0 |
| Evolution rules | 72 |
| Exclusions | 12 |

Every profile is in Kanto Pokédex order and has an explicit local sprite path.
Every record has a review date and Blue reference ID. All image paths exist in
`public/pokemon/`.

The 654 acquisition records include 460 exact species-level records from 58
physical grass and water map tables: 439 grass records and 21 Surf records.
Those records cover 290 map-table/species pairs. They keep separated encounter levels in separate records. The shared
SeaRoutes table supplies Routes 19 and 20; Route 21 has its own table. The data
also has 155 fishing records, 3 starters, 10 gifts, 14 static encounters, 3 fossil
revivals, and 9 NPC trades.
The 72 evolution records cover 52 level-up evolutions, 16 stone evolutions,
and 4 player-trade evolutions. Player-trade evolution remains blocked by the
domain rules.
The three one-use choices are the starter, dojo, and Mt. Moon fossil choices.

## Access and outcome coverage

The planner starts at `champion-defeated` and offers eight Gym checkpoints,
the Champion, and Cerulean Cave. The route graph includes all 25 numbered
routes. Location and source requirements represent HMs, badges, key items,
version gates, and postgame access. Fishing sources require the matching rod
capability. Surf sources require Surf access.

At Cerulean Cave progress, the reviewed integration test resolves all 151
profiles. It expects 135 species available, four species blocked by player-trade
evolution, and 12 unavailable species. The unavailable species are the eleven
Red exclusives and Mew. The test checks Route 5/6 access before Misty, Route 9 and Rock Tunnel before
Lt. Surge, HM02 collection before Lt. Surge with Fly's separate badge gate, Super Rod access before Fuchsia,
the Route 18 Bicycle and Poké Flute gates and Lickitung trade before Fuchsia,
the Blue Sandshrew source, both finite choices, all nine NPC trade offers and
level rules, the five Moon Stones, the four-stone team feasibility, the
independent Soul and Rainbow Badge gates, and Mewtwo in Cerulean Cave.

Blue is not enabled in the shared game registry. The local module and coverage
tests assemble all thirteen records and validate the full dataset with the
proposed Blue references. The parent task must merge the reference records and
register Blue after its own two-game isolation checks.
