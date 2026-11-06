# Pokemon LeafGreen review coverage

## Target

Original English Pokemon LeafGreen. Include ordinary postgame and native
acquisition, including Sevii Islands content unlocked by ordinary play. Exclude
player trades and external event distributions. Review against the pinned
`pret/pokefirered` revision and the locators in
[`leafgreen-sources.md`](leafgreen-sources.md).

## Current status

The LeafGreen data layer has 386 profiles, 1,948 native source records, 181
applicable evolution rules, 180 breeding rules, and 193 reviewed exclusions.
The profile outcome test partitions all 386 records into 181 native
source/evolution/breeding paths, 12 player-trade evolution targets, and 193
exclusions. No exclusion overlaps a native path. Six exclusions are external
event species; the other 187 require another game or a player trade. LeafGreen
is registered.

The profile set matches the 386 shared identities. Kanto regional order is 1 to
151. The progress graph separates the pre-League Tri-Pass visit from the
post-League National Pokedex check, Ruby return, Rainbow Pass, and Sapphire/
network-machine event. Oak checks for 60 caught species; the planner does not
count catches. Fuchsia and the Snorlax-blocked routes require the Poke Flute.
Wild records cover 124 map/table labels and 2,080 encounter slots. The 221
non-wild records cover starters, gifts, prizes, fossils, NPC trades, static
encounters, Togepi, the roamer, and 182 repeatable Four Island breeding paths.

| Collection | Review result |
| --- | --- |
| `game.json` | Story and postgame checkpoints; hatch level 5 |
| `pokemon.json` | All 386 identities; Kanto regional order; types, genders, Egg Groups, and local images |
| `type-chart.json` | Complete Generation III matrix from pinned battle rules |
| `progression.json` | Rooted Kanto, postgame, Sevii Island, and route access milestones |
| `bosses.json` | Gym, Elite Four, and Champion first-clear caps |
| `locations.json` | 164 locations; Tea, Bicycle, Waterfall, and Poke Flute gates checked |
| `capabilities.json` | HM, rod, pass, ferry, and supported evolution actions |
| `items.json` | 23 tracked items; native placements checked; trade-held items have no source because their evolutions require excluded player trades |
| `choices.json` | Starter, Dojo, and Mt. Moon fossil choices |
| `sources.json` | 1,727 wild and 221 non-wild records |
| `breeding-rules.json` | 180 offspring rules checked against LeafGreen profiles |
| `evolutions.json` | 181 applicable pinned transitions, including all 12 player-trade transitions |
| `exclusions.json` | 193 reviewed outcomes, with no overlap with native paths |

## Review checks

- The test checks exact profile identity coverage and gives every profile one
  native, trade-blocked, or excluded outcome. A Network Machine solve with the
  optional Seven Island visit proves all
  181 native outcomes in the real availability graph and excludes all 193
  reviewed exclusions and 12 blocked trade targets from that path set. The shared 386-species identity
  catalogue alone does not prove native acquisition.
- Review version-specific wild encounter groups. Do not treat the FireRed side
  of a shared encounter table as a LeafGreen encounter.
- Review Kanto progression and the National Pokedex gate separately from the
  postgame Sevii Island chain. Include only ordinary in-game access; event-only
  islands and event Pokemon need explicit out-of-scope outcomes.
- Check every profile sprite path under `public/`. Shared existing artwork is
  allowed, but each profile needs an explicit path.
- Give every data record a LeafGreen-specific reference ID and the review date.
  The reference objects from `leafgreen-sources.md` are in shared
  `data/references.json`.
- The focused LeafGreen tests cover profile outcomes, early and late access,
  postgame availability, exclusions, LeafGreen encounters, and default progress.
- See [game-data-progress.md](game-data-progress.md) for the all-game checks.

## Model review

The scripts confirm a National Pokedex check of 60 caught species after League
clear and a One Island visit. The current planner cannot count distinct caught
species. The checkpoint describes this optional unlock; it does not claim that
the planner enforces the count. The pinned LeafGreen encounter tables list 82 distinct wild species across
70 Kanto maps after removing Cerulean Cave and Sevii-only maps. This exceeds 60
without starter choices. The planner records Oak's unlock opportunity. It does
not simulate the player's capture count.

The records prove ordinary wild encounter table coverage and its method, level,
weight, and map references. The encounter rate is the species share within its
selected table, not an encounter-step chance.

The source layer contains 1,948 records: 1,727 wild table records and 221
non-wild sources. The 182 breeding sources cover every offspring outcome from all 180 rules. Each is repeatable at the Four Island Day Care, uses hatch level 5 and the offspring profile genders, and requires any incense held item. Roamer activation requires the Sapphire network machine.
Roaming records use fixed level 50, one use, and the starter pairing from
`src/roamer.c`: Bulbasaur/Entei, Charmander/Suicune, and Squirtle/Raikou.
Focused team checks cover matching and conflicting starter/roamer pairs. The
planner does not model coins, cash, the 60-caught Pokedex count, or Togepi's
friendship check. NPC trades remain native sources and require their offered
Pokemon. Player-trade evolutions remain blocked by the availability layer.

Evolution review on 2026-10-12 used the pinned `src/data/pokemon/evolution.h`
and `src/evolution_scene.c`. The pinned table has 184 transitions. The data
contains 181 applicable rules. The three absent transitions are Eevee to Espeon,
Eevee to Umbreon, and Feebas to Milotic. The first two need a day/night clock,
which FireRed and LeafGreen lack. Milotic needs Beauty and Pokeblocks, which
LeafGreen lacks. The related species receive reviewed exclusions if they have no
other native path.

All twelve `EVO_TRADE` and `EVO_TRADE_ITEM` transitions are explicit
`player-trade` rules. The availability layer blocks them. NPC trades are
separate native sources; each consumes its offered species. Gloom to Bellossom
and Sunkern to Sunflora use the Sun Stone. Sevault Canyon on Seven Island gives
a Sun Stone, and its item path and both rules are present.

`src/evolution_scene.c` confirms that Nincada creates Shedinja only when the
party has a free slot. The game does not check for a Poke Ball. The rule records
Shedinja as its result and Ninjask as its co-product. Breeding rules cover the
ordinary egg outcomes and required hatch level. Lost Cave rooms 11 and 12 give
one Lax Incense and one Sea Incense after Five Island access. Along with the
  ordinary egg sources cover all 180 breeding rules and their 182 rule/offspring
outcomes. The two incense sources keep their held-item and pickup gates. A
regression check confirms that the finite Eevee gift can produce repeatable
Eevee eggs after Four Island access.


The profile outcome check includes native breeding proof paths. Marill and Wobbuffet are native, and the Lost Cave incense pickups unlock Azurill and Wynaut breeding. Every rule outcome has a source. The finite Eevee gift can start a repeatable sibling egg path. These two incense offspring are not exclusions. Eevee night evolutions and Feebas beauty evolution remain outside the applicable evolution table because the required clock and Beauty systems do not exist in LeafGreen.
