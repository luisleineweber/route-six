# Omega Ruby and Alpha Sapphire Progress Planner review

Reviewed on 1 November 2026. Both games now load in Progress Planner.
All data stays in local JSON. The app makes no data request at runtime.

| Collection | Omega Ruby | Alpha Sapphire |
| --- | ---: | ---: |
| Base profiles | 721 | 721 |
| Alternate form profiles | 0 | 2 |
| Milestones | 80 | 80 |
| Locations | 120 | 120 |
| Capabilities | 34 | 34 |
| Items | 58 | 58 |
| Sources | 1,491 | 1,492 |
| Evolution rules | 357 | 358 |
| Breeding rules | 318 | 319 |
| Choices | 5 | 5 |
| Exclusions | 265 | 265 |

The complete game check resolves 436 native species in each game. Seventeen
more species need a player trade. Giratina, Kyurem and Landorus keep their
real portal sources. Each needs a legend from the other version in the party,
so the solver blocks them on that partner.

## Source evidence

There is no ORAS decompilation. The review follows the X and Y method.
PKHeX revision `641c26ba100225f3605e5a44b61b3b16e15a3774` gives the encounter
tables, fixed encounters, trades and the Generation VI evolution table. It is
legality evidence, not game script. Saved Bulbapedia wikitext (31 October
2026) gives story order, location gates, item locations and special conditions.
Serebii and PokémonDB give the second source for badges, HMs and native scope.
The staging scripts and checks are in `output/oras-review/`.

- Wild tables: PKHeX stores each standard area as 41 slots: 12 grass, 12 long
  grass, 3 DexNav, 5 Surf and 3 for each rod. Rock Smash and Horde areas are
  separate. The Generation VI slot rates give equal pools for 170 of 172
  Bulbapedia ORAS catch tables. Route 110 and the Route 118 Horde differ by a
  few percent; the PKHeX slot rates stay. See
  `output/game-proposals/oras-staging/slot-rate-check.json`.
- DexNav-only Pokémon have no reviewed rate. Bulbapedia lists every such group
  after Groudon or Kyogre is defeated or caught. Each source needs that event.
- Mirage spots are daily. Each PKHeX Mirage table matches one Bulbapedia spot.
- Scope: the unavailable and version-exclusive Serebii lists agree with the
  native closure. Hoopa and Volcanion are event-only and absent from that list.

## Story and resources

The Mind Badge enables Dive. Steven gives HM07 after the Mossdeep Gym. Dive
opens Seafloor Cavern. The Primal event follows, then the Cave of Origin, the
Eon Flute and Wallace. Serebii's Gym badge list and the Bulbapedia walkthrough
agree. The staged proposal that put the Primal event before badge 7 is wrong.

Every location has a checked gate. Side branches, such as Route 117, the
Route 111 desert and the Safari Zone, are visit bookmarks. Their access uses the
story unlock on the main line, so later checkpoints keep them open.

Bike pockets need the Mach Bike or the Acro Bike. Rydel swaps Bikes at any time
before the Delta Episode. Portal legends keep their party conditions. Their
clock rotations are not modeled, because the planner does not set the clock.

## Forms

Alpha Sapphire has East Sea Shellos in its DexNav slots; Omega Ruby has West
Sea. Bulbapedia Route 103 and Route 110 confirm both. Alpha Sapphire therefore
has the East Sea Shellos and Gastrodon forms, and its West Sea base form stays
blocked. Cosplay Pikachu and Deoxys forms are not modeled. Their species stay
available as base profiles.

## Open items

- Cosplay Pikachu and Deoxys form profiles need reviewed images.
- Some trade-evolution items have no recorded source. Player trades are
  blocked, so these rules stay blocked either way.
- Fossils outside the Route 111 choice come only from daily Mirage spot rocks.
