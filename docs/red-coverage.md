# Pokémon Red review coverage

Review scope: international English Pokémon Red. Include ordinary native
captures, gifts, fossils, prizes, NPC trades, evolutions, and normal postgame
access. Exclude player trades and external events. Source revision:
`af519899719f0754965776faac0e836a3b906e6d` of `pret/pokered`, reviewed
2026-10-12. Source locators and proposed reference records are in
[red-sources.md](red-sources.md).

## Required data coverage

| Collection | Review target |
| --- | --- |
| Game | Red, Generation I, Kanto, no breeding |
| Profiles | 151 supported Pokédex species; National Dex order is the Kanto order |
| Type chart | 15 Generation I types; include the documented Generation I chart quirks |
| Progression | Pallet start, eight Gym badges, Elite Four and Champion, Cerulean Cave postgame |
| Bosses | Eight Gym leaders, four Elite Four members, Champion |
| Locations | Routes, cities, caves, buildings, Safari Zone, Seafoam Islands, Victory Road, Indigo Plateau, Cerulean Cave |
| Capabilities | HM access with badge requirements, rods, Poké Flute, Silph Scope, Secret Key, Safari access |
| Items | Evolution stones, fossils, key items, required gates, and reviewed unique Pokémon items |
| Choices | Starter, dojo gift, and fossil; one Eevee gift with competing evolution paths |
| Sources | All 55 Red grass tables, three surf map tables, all rod map groups, all Power Plant static encounters, gifts, fossils, Game Corner prizes, and nine used NPC trades |
| Breeding | Empty rules; no breeding sources; all profile breeding values null |
| Evolutions | Level and item evolutions; player-trade evolutions stay blocked |
| Exclusions | Blue version exclusives and external Mew distribution |

Red profiles include all 151 Kanto species. Blue-exclusive species need
exclusions in Red: Sandshrew, Sandslash, Vulpix, Ninetales, Meowth, Persian,
Bellsprout, Weepinbell, Victreebel, Pinsir, and Magmar. Mew is supported but
requires an external distribution in this scope.

## Mechanics requiring special care

- Red and Blue share a source repository. Apply the Red condition to every
  version-specific encounter, gift, and script.
- The shared catalogue supports 386 identities. Red profiles must contain only
  the 151 species present in its generation and must cover every one exactly
  once.
- All Red profiles use Generation I types. Do not use later Fairy, Dark, or
  Steel types. Ghost attacks have no effect on Psychic Pokémon in Generation I.
- The source trade table has ten rows. One row is unused. Review the nine active
  trades from their map scripts before adding sources.
- Generation I has no gender system. Use the schema's `not-applicable` value in
  profiles and sources. This is a game rule, not a species gender fact.
- The planner does not track coins or money. Game Corner prize sources show
  access after the player reaches the Game Corner; they do not track the coin cost.
- Ordinary item access does not model money costs.
- Old Rod access is available in Vermilion before Misty. Route 6 also opens
  from Cerulean before Misty. Route 9 and Rock Tunnel require Cut, not Lt.
  Surge badge. Flash is an optional visibility aid. The Route 2 aide checks
  for ten caught species. Ten distinct species are catchable by the Viridian
  Forest visit, but the aide is reachable only after the S.S. Anne and the
  Cut path to Route 2. The planner records the reward event without a live
  Pokedex counter.
- Super Rod comes from the Route 12 house. Its reviewed item source records
  the northern Pokémon Tower and Poké Flute path and the southern Fuchsia path.
  Red has five separate finite Moon Stone pickups, so a four-member team can
  support all four Moon Stone evolutions.
- Route 18's Lickitung trade is in its gate. Its access uses the Fuchsia and
  Bicycle paths, rather than an optional Route 18 visit milestone.
- Trainer source tables and event scripts need separate checks for the
  Champion's starter-dependent team and level. A single highest level may
  support the level cap, but the coverage note must not claim the same party in
  all three cases.

## Validation targets

The Red module should load without network access. Tests check exact profile
coverage (151), the 15-type chart, no breeding, Red version exclusions, starter
and fossil limits, pre-Misty Old Rod access, pre-Lt. Surge Route 9 access,
Red Viridian Forest Pikachu and weighted wild tables, the Cut-gated HM05 reward, the northern Super Rod path, all five Moon Stones,
Cerulean Cave access, and blocked player-trade evolutions. Registration
belongs to the parent task after all game data and shared references have been
reviewed.
