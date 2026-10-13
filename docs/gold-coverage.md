# Pokémon Gold coverage

Scope: the English original Pokémon Gold version, Johto and Kanto, through
ordinary post-game play. Exclude player trades and external events. The source
review uses `pret/pokegold` commit
`ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8`; see [Gold source review](gold-sources.md)
for pinned source locators and reviewed references.

All thirteen collections have reviewed records. The regular wild layer has
1,911 land slots from 91 maps, 186 Surf slots from 62 maps,
and 793 Old, Good, and Super Rod entries from 61 fishing maps. Each record has
its species, fixed level, conditional slot share, map access, time window where
needed, and pinned review reference. The ten ordinary Bug-Catching Contest
entries and three starters remain in `sources.json`.

`ratePercent` records a species slot's share after the selected encounter table
starts. It does not state the chance of an encounter on each step. Gold grass
starts an encounter at its own per-step rate; Surf uses a separate per-step
rate. The source keeps those values out of `ratePercent`. Fishing percentages
are conditional shares within the selected rod table. The tests pin the exact
map inventories and all species, levels, requirements, and shares for these
records. The terminal Bug Contest Venomoth row remains excluded because its
index is outside the 0 to 99 selection range.

The reviewed encounter layer now includes 252 Headbutt slots across 21 maps,
four grass swarm tables, the Mount Mortar outside Surf swarm table, and three
roaming beasts. Headbutt records keep the map and common or rare table in each
source ID. Their percentages are shares within that named table, not overall
encounter chances. Swarm records keep the source's replacement slots and
shares. The level 40 roaming beasts use the Johto roaming region after the
Burned Tower release event. The source's 16 roaming route entries exclude
Routes 40 and 41. Focused tests pin these records.

The reviewed acquisition layer adds 118 Day Care offspring rules, seven gifts
or eggs, nine static encounters, six NPC trades, and 122 evolution records.
Ditto can serve as a partner but cannot be a breeding offspring.
Gold-specific statics keep Ho-Oh at level 40 and Lapras in Union Cave on
Fridays. Pewter City gives Gold the Silver Wing. It opens the one-use level 70
Lugia encounter in Whirl Islands, with Surf and Whirlpool access.

The twelve tracked items include one-time Bill's Grandpa stones, the repeatable
Bug-Catching Contest Sun Stone, the weekly Mount Moon Square Moon Stone, and
the one-time Tohjo Falls Moon Stone. King’s Rock, Dragon Scale, and Metal Coat
also have repeatable held-item sources on catchable wild species. The Gold
Rainbow Wing gift follows the Lake of Rage event and gates Ho-Oh. Tests check
all 251 profile outcomes as a native source, a reachable evolution or egg, or
a reviewed exclusion. All 34 route locations have first-access milestones.
Full dataset validation passes. Gold is registered.

The target profile set is the 251 species in the Generation II National
Pokédex, including supported species that need a player trade or an external
event. Use the actual Gold regional order from `data/pokemon/dex_order_new.asm`;
do not use National Dex order as the Johto order. Profiles need Gold types,
gender ratios, Egg Groups, and local sprites. Gold uses 17 types and a
Generation II type chart.

The reviewed profile set has 251 species in the exact New Pokédex order from
`data/pokemon/dex_order_new.asm`. Gold `base_stats.asm` records support each
profile's types, gender ratio, and Egg Groups. Local `/pokemon/<National
Dex>.png` images exist for all 251 entries. The type chart comes from
`data/types/type_matchups.asm`; it has 17 types and 110 non-neutral matchup
records. The reviewed boss set has all 16 Gym leaders, the Elite Four, Lance,
and Red. It uses planner ordering 1–16 for the two-region Gym sequence; the
number does not imply that the player must defeat Kanto leaders in that order.
Blue has no single specialty type and is recorded with a null type. Red uses
the general `trainer` boss kind for the postgame final battle.

The source confirms native systems that need coverage: Johto and Kanto land,
water, and fishing encounters; Headbutt trees; weekday Bug-Catching Contest;
weekday/time-based encounters and gifts; swarms and roaming legendaries;
fixed gifts and static encounters; in-game trades; breeding; friendship,
time, item, trade, and Attack/Defense-stat evolutions; Johto and Kanto Gyms;
the Elite Four, Champion, and Red; and the main story plus Kanto post-game.

The planner asks which acquisitions are possible by story progress. It does not
simulate the current clock, weekday, or roaming position. Use reviewed
capabilities and milestones to gate the earliest possible window, as Emerald
does for day/night, Mirage Island, and its roaming choice. Keep each actual
story requirement, finite source, and mutually exclusive choice.

The shared wild source model already supports `headbutt` and `bug-contest`.
Each source requires its matching capability. `headbutt` means a wild encounter
from the reviewed Headbutt table at a named map/tree group. `bug-contest` means
a possible wild encounter during the accessible National Park contest. It does
not mean that the player wins a contest or receives its prize. Do not label
either source as grass or a fixed encounter.

Gold's stat comparison evolution and day/night evolution conditions are
already supported by `EvolutionCondition`. Weekday/time windows, swarms,
roaming legends, and phone rematches need reviewed story capabilities or
milestones for earliest possible access. The shared method tags include
Headbutt and Bug-Catching Contest. Clock-state simulation is outside this
planner's scope.

Do not use `exclusions.json` for species whose data is unfinished. In Gold
scope, reviewed Silver-only species can use `other-version`; external-event
species can use `external-event`; trade evolutions need explicit blocked
player-trade evolution records. Gold-only NPC trades remain native acquisition
paths and must retain their offered Pokémon and one-time resource rules.

The local module loads Gold's reviewed files. See
[game-data-progress.md](game-data-progress.md) for the all-game checks.
