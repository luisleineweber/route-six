# Pokemon LeafGreen sources

## Scope and revision

Review target: original English-language Pokemon LeafGreen for Game Boy Advance,
including ordinary postgame content. Native encounters, gifts, starters, and
gameplay item sources are in scope. Player trades and external distributions are
out of scope.

Primary source: [`pret/pokefirered`](https://github.com/pret/pokefirered), pinned
to commit `037335f4c725d7c9aecdac87066f2002b4bd7e14` (2026-09-26, “Audio
improvements”). This is the source reconstruction for English FireRed and
LeafGreen. Review LeafGreen constants, scripts, and data at that revision.

## Proposed shared reference records

Add these records to `data/references.json` during parent integration. This
subtask does not edit that shared file.

```json
[
  {"id":"leafgreen-overview","title":"pret/pokefirered LeafGreen source reconstruction","locator":"Repository identity, supported ROM targets, and project scope","url":"https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-species","title":"pret/pokefirered species data","locator":"src/data/pokemon/species_info.h; LeafGreen species type, gender ratio, egg groups, and species data","url":"https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/data/pokemon/species_info.h","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-dex","title":"pret/pokefirered Pokédex ordering","locator":"src/data/pokemon/pokedex_orders.h and src/data/pokemon/pokedex_entries.h; regional and National Pokedex orders and availability","url":"https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/data/pokemon","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-evolution","title":"pret/pokefirered evolution data","locator":"src/data/pokemon/evolution.h; level, item, friendship, and trade evolution rules","url":"https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/data/pokemon/evolution.h","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-encounters","title":"pret/pokefirered wild encounters","locator":"src/data/wild_encounters.json; LeafGreen version encounter tables and encounter levels by map","url":"https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/data/wild_encounters.json","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-scripts","title":"pret/pokefirered LeafGreen map scripts and events","locator":"data/maps/*/scripts.inc and data/maps/*/map.json; inspect each Kanto and Sevii map for progression flags, gifts, static encounters, item access, and version checks","url":"https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/data/maps","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-bosses","title":"pret/pokefirered trainer parties","locator":"src/data/trainer_parties.h and data/maps/*/scripts.inc; Gym, rival, and League parties and levels","url":"https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/data/trainer_parties.h","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-items","title":"pret/pokefirered item definitions and item placements","locator":"src/data/items.json; data/maps/*/scripts.inc; item definitions, field items, shop rewards, and key item events","url":"https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/data/items.json","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-type-chart","title":"pret/pokefirered battle type rules","locator":"src/battle_util.c and include/constants/battle.h; Generation III type effectiveness values","url":"https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/src","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-version","title":"pret/pokefirered version-specific rules","locator":"include/constants/flags.h; include/constants/species.h; data/maps/*/scripts.inc; LeafGreen version flags and version-exclusive gifts/encounters","url":"https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14/include/constants","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-daycare","title":"pret/pokefirered breeding rules","locator":"src/daycare.c and include/constants/daycare.h; breeding, egg creation, compatibility, and hatch rules","url":"https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/daycare.c","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"}
]
```

## Review notes

The source reconstruction contains shared FireRed/LeafGreen code. Every use of
a shared source must be checked against LeafGreen-specific compile-time
constants or the LeafGreen branch in the map script. `wild_encounters.json`
includes version-tagged encounter groups; FireRed entries are not LeafGreen
records. The Sevii Islands require their own access and encounter review.

The source references below still need to be added to the shared reference
list during parent integration. Complete records in this game folder do not
make the game ready for registration while other collections remain unfinished.


## Source-checked first layer

Checked on 2026-10-12 at the pinned revision:

- `src/data/pokemon/species_info.h` contains the 386 standard species records.
  The profile list matches the shared 386 species identities. Types, gender
  possibilities, and Egg Groups come from the LeafGreen source fields. The
  profile files use shared local numbered sprites, and all 386 paths exist.
- The first 151 National Dex identities are given Kanto regional order 1 to 151.
  Species beyond that list have no Kanto regional number.
- `include/constants/daycare.h` sets `EGG_HATCH_LEVEL` to 5.
- `src/battle_main.c` defines the 336-byte `gTypeEffectiveness` table as
  attack type, defending type, and multiplier triples. `type-chart.json`
  expands its explicit type matchups to the required 17 by 17 matrix; omitted
  type pairs have neutral effectiveness.
- `src/data/trainer_parties.h` gives the first-clear team levels for Gym leaders
  and League opponents. The boss records use the highest level on each team.
  The Champion's starter-dependent teams top out at level 63.

The profile, type chart, boss, progress, location, capability, and ordinary wild
encounter records now have source evidence. The local source, evolution, breeding, and exclusion review now assigns an
outcome to all 386 profiles. LeafGreen is registered. Its game-specific source
references are in shared `data/references.json`.

## Kanto count check completed on 2026-10-12

I parsed the pinned src/data/wild_encounters.json LeafGreen records. The Kanto
map entries include 82 distinct wild species across 70 map records after I
excluded Sevii Island maps, Altering Cave, Trainer Tower, and Cerulean Cave.
These Kanto encounter areas are available before the League. This supports the
existence of a single-playthrough route to at least 60 caught species without
counting postgame or external-event species. The planner records this unlock
opportunity; it does not simulate a player's capture count.

## Progression checks completed on 2026-10-12

The pinned `data/maps/PalletTown/scripts.inc` checks `FLAG_SYS_GAME_CLEAR`,
whether `FLAG_WORLD_MAP_ONE_ISLAND` is set, and `GetPokedexCount`. Oak does not
start the National Pokedex scene when fewer than 60 species are caught. This is
an optional progress point after the League and a One Island visit. The planner
does not count distinct catches, so the checkpoint says that Oak checks for 60
caught species. It must not appear as an automatic effect of winning the League.

The pinned `data/maps/OneIsland_PokemonCenter_1F/scripts.inc` awards the
Meteorite and Tri-Pass on the first meeting with Celio. The script only changes
the introduction text when the player has cleared the League. It sets the
One-to-Three Island map flag. After the National Pokedex scene, Celio can request
the Ruby. Returning the Ruby exchanges the Tri-Pass for the Rainbow Pass and
sets the Four-to-Seven Island map flag. A later script path accepts the
Sapphire and enables the Kanto-Hoenn network machine.

The pinned `data/maps/FourIsland_PokemonDayCare/scripts.inc` confirms the Day
Care interaction on Four Island. The general breeding rules and hatch level
remain tied to `src/daycare.c` and `include/constants/daycare.h`.

The rebuilt progress graph separates the pre-League Tri-Pass visit, the
post-League 60-caught National Pokedex check, Ruby return and Rainbow Pass, and
the later Sapphire return and network machine. It includes separate access
points for Islands One through Seven. The current model stores the 60-caught
rule in the checkpoint detail. It does not enforce a save's Pokédex count.

The later acquisition review below covers non-wild paths, item placements, and
finite choices. The local files pass full dataset validation.

## Ordinary encounter coverage checked on 2026-10-12

The hand-maintained `data/games/leafgreen/sources.json` contains 1,727 wild
source records. They cover 124 LeafGreen map/table labels and 319 map/method
tables. I checked 2,080 encounter slots against the pinned
`src/data/wild_encounters.json`. Slots with the same map table, method, species,
and exact level range are combined; their conditional table weights are summed.
The table/method weights sum to 100 percent. Each source ID retains a
normalized source table label, method, species, and level range.
`ratePercent` means the
species' share inside that selected table. It is not the chance of an encounter
step.

The table review filters to `LeafGreen` labels. It includes the default
Altering Cave table, which contains Zubat. It omits the eight alternate
Altering Cave tables that require wireless distributions. Event islands and
event-sourced captures remain out of scope.

Examples checked: Route 1's Pidgey appears at levels 2 and 3 with separate
table weights. Four Island's Icefall Cave back area includes level 49 Dewgong.
The reviewed map set also includes the Kanto routes, caves and Safari Zone, and
ordinary Sevii maps such as Icefall Cave, Lost Cave, Ruin Valley, and Tanoby
Ruins.

The table IDs also identify the exact source table when several maps share a
name or table shape. Every source points to a map-level location record.
Encounter methods other than grass require their matching fishing, Surf, or
Rock Smash capability. The Rock Smash tutor is on One Island, so its capability
starts at the Tri-Pass visit.

## Gate review notes

The progress graph keeps the first One Island Tri-Pass visit after Blaine and
before the League. Oak's 60-caught check remains after the League and that
visit. Ruby return grants the Rainbow Pass. Sapphire return now depends on the
Rainbow Pass and access to Islands Five and Six. The graph does not count
caught species.

Fuchsia City now depends on the Poke Flute. Routes 12 to 15 and 17 to 18 also
require the flute because Snorlax blocks their normal access. Safari Zone
access depends on Fuchsia. HM and rod capabilities use their reviewed badges
or story locations.

The later item and gate review below records Bicycle, Tea, Waterfall, and their
physical access gates. The 60-caught checkpoint states the opportunity because
the planner does not track a Pokédex count.


## Gifts, trades, fossils, and roamer checked on 2026-10-12

The pinned revision was checked at these exact locators:

- `data/maps/PalletTown_ProfessorOaksLab/scripts.inc`, `PalletTown_ProfessorOaksLab_EventScript_GiveStarter`: Bulbasaur, Charmander, or Squirtle, level 5; one starter choice.
- `data/maps/CeladonCity_Condominiums_RoofRoom/scripts.inc`, `CeladonCity_Condominiums_RoofRoom_EventScript_Eevee`: Eevee, level 25.
- `data/maps/CeladonCity_GameCorner_PrizeRoom/scripts.inc`, `EventScript_ChoosePrizeMon` and the `EventScript_Give*` handlers: LeafGreen offers Abra level 7, Clefairy 12, Pinsir 18, Dratini 24, and Porygon 18. Coin cost is not modeled. Scyther is FireRed-only and is not included.
- `data/maps/SaffronCity_Dojo/scripts.inc`, `EventScript_GiveHitmon`: Hitmonlee or Hitmonchan, level 25; one reward choice.
- `data/maps/Route4_PokemonCenter_1F/scripts.inc`, `EventScript_BuyMagikarp`: Magikarp, level 5. Money is not modeled.
- `data/maps/SilphCo_7F/scripts.inc`, `EventScript_GiveLapras`: Lapras, level 25.
- `data/maps/MtMoon_B2F/scripts.inc`, `EventScript_HelixFossil` and the Dome fossil event: one of Helix Fossil or Dome Fossil. `data/maps/PewterCity_Museum_1F/scripts.inc`, `EventScript_GiveOldAmber`: Old Amber is separate. Revivals are in `data/maps/CinnabarIsland_PokemonLab_ExperimentRoom/scripts.inc`; Omanyte, Kabuto, and Aerodactyl are level 5.
- `src/data/ingame_trades.h` and the nine matching `INGAME_TRADE_*` map scripts: Mr. Mime for Abra; Jynx for Poliwhirl; Nidoran♂ for Nidoran♀; Farfetch'd for Spearow; Nidorino for Nidorina; Lickitung for Slowbro; Electrode for Raichu; Tangela for Venonat; Seel for Ponyta. Trade level matches the offered Pokémon. The required species remains a source condition.
- `data/maps/Route12/scripts.inc` and `Route16/scripts.inc`: both Snorlax encounters are level 30 and require the Poké Flute. The Marowak in Pokémon Tower is a forced battle and cannot be caught.
- `data/maps/SeafoamIslands_B4F/scripts.inc`, `PowerPlant/scripts.inc`, and `MtEmber_Summit/scripts.inc`: Articuno, Zapdos, and Moltres are catchable at level 50. `data/maps/CeruleanCave_B1F/scripts.inc` has Mewtwo at level 70.
- `data/maps/FiveIsland_WaterLabyrinth/scripts.inc`, `EventScript_TryGiveEgg`: Togepi egg after National Pokédex and Five Island access. It requires a high-friendship lead Pokémon, which the current model cannot express.
- `data/maps/OneIsland_PokemonCenter_1F/scripts.inc` calls `InitRoamer` only after Celio activates the network machine. `src/roamer.c` sets level 50 and maps Bulbasaur to Entei, Charmander to Suicune, and Squirtle to Raikou. Each source is one-use and uses a Kanto roaming location, not the release town or one fixed route.

The checked gates include Tea at Saffron, Bicycle access to Cycling Road (Route 17), Poké Flute checks at both Snorlax, and Waterfall for the back map of Icefall Cave. HM07 is found in Icefall Cave before the waterfall ascent. Route 16 and Route 18 remain reachable from their other entrances, so the Bicycle does not gate those full maps.

The shared reference proposals should add `leafgreen-trades` with locator `src/data/ingame_trades.h and data/maps/*/scripts.inc; LeafGreen requested and received species for all nine NPC trades`, and `leafgreen-roamers` with locator `src/roamer.c; data/maps/OneIsland_PokemonCenter_1F/scripts.inc; level, starter mapping, roaming region, and Sapphire-return release event`. Use pinned revision `037335f4c725d7c9aecdac87066f2002b4bd7e14` for both.

## Evolution and breeding follow-up checked on 2026-10-12

The pinned `src/data/pokemon/evolution.h` supplies the level, item, and
friendship evolution thresholds. `src/evolution_scene.c` confirms that Nincada
creates Shedinja only when the party has a free slot. LeafGreen does not check
for a Poké Ball: `CreateShedinja` copies Nincada and checks only
`gPlayerPartyCount < PARTY_SIZE`. The data records Shedinja as the Nincada evolution result, Ninjask as the
co-product, and the free-slot condition. It has no Poké Ball requirement. All
twelve player-trade evolution transitions are recorded explicitly. The
availability layer blocks them because player trades remain outside the
acquisition scope.

`src/daycare.c`, `include/constants/daycare.h`, and LeafGreen's profile Egg
Groups support the ordinary breeding rules and hatch level. The source also
places Lax Incense in `FiveIsland_LostCave_Room11_EventScript_ItemLaxIncense`
and Sea Incense in `FiveIsland_LostCave_Room12_EventScript_ItemSeaIncense`
(`data/scripts/item_ball_scripts.inc`, `finditem ITEM_LAX_INCENSE` and
`finditem ITEM_SEA_INCENSE`). Both one-use pickups are in rooms gated by Five
Island access. Marill and Azumarill can produce Azurill while holding Sea
Incense. Wobbuffet can produce Wynaut while holding Lax Incense. The item
sources, held-item rules, and offspring sources are recorded separately from
the ordinary Marill and Wobbuffet eggs. The full offspring outcome audit is
recorded in the LeafGreen coverage test.


## Key items and physical map gates checked on 2026-10-12

- `data/maps/CeladonCity_Condominiums_1F/scripts.inc`, `EventScript_TeaWoman` gives Tea. The Route 5, 6, 7, and 8 entrance scripts check the persistent `FLAG_GOT_TEA`, remove the item on entry, then allow passage. The Saffron location uses the Tea-unlocked `saffron-access` capability to model the persistent flag after the item is removed.
- `data/maps/VermilionCity_PokemonFanClub/scripts.inc`, `EventScript_ChairmanStory` gives one Bike Voucher. `data/maps/CeruleanCity_BikeShop/scripts.inc`, `EventScript_ExchangeBikeVoucher` exchanges it for the Bicycle. Route 17 is the cycling-road map and requires the Bicycle. Route 16 and Route 18 have other map entrances, so those full maps do not require the Bicycle.
- `data/maps/CeladonCity_Restaurant/scripts.inc`, `EventScript_CoinCaseMan` gives the Coin Case. LeafGreen's Game Corner prize clerk checks for it before offering Pokémon. Coin balances are outside the planner's model.
- `data/maps/LavenderTown_VolunteerPokemonHouse/scripts.inc` gives the Poké Flute after the Pokémon Tower event. `data/maps/Route12/scripts.inc` and `data/maps/Route16/scripts.inc` check for the flute before starting the Snorlax battles.
- The Four Island Icefall Cave data places HM07 before the waterfall ascent. The back-map records require the Waterfall capability after the player obtains that HM.
- `data/maps/MtMoon_B2F/scripts.inc` gives one Dome or Helix Fossil. `data/maps/PewterCity_Museum_1F/scripts.inc` gives Old Amber separately. The revival script removes the fossil, so those Pokémon sources consume one matching fossil item. The Bike Shop also removes the Bike Voucher when it gives the Bicycle.


## Complete outcome and evolution audit (2026-10-12)

The pinned revision is `037335f4c725d7c9aecdac87066f2002b4bd7e14`; the local
`.firered-source-review` checkout HEAD matches it. The complete profile audit
assigns 181 species to native source/evolution/breeding paths, 12 to explicit
player-trade evolution rules blocked by the planner, and 193 to reviewed
exclusions. A Network Machine solve with the optional Seven Island visit proves
the same 181 native species. No
excluded species overlaps a native source/evolution/breeding path. The six external-event exclusions are Mew, Celebi, Jirachi, Deoxys, Ho-Oh,
and Lugia; 187 other exclusions need another game or player trade.

`src/data/pokemon/evolution.h` contains 184 transitions. The 181 LeafGreen
rules include every enabled transition and all 12 trade transitions. Exact
differences: Eevee to Espeon and Umbreon need the absent day/night clock; Feebas
to Milotic needs unavailable Beauty/Pokeblocks. These three transitions have no
LeafGreen outcome. The omitted Gloom-to-Bellossom and Sunkern-to-Sunflora rules
were restored with the native Seven Island Sun Stone source.

NPC trades use a separate source kind. Each of the nine records consumes its
offered Pokemon. The Nincada rule produces Shedinja and Ninjask when a party
slot is free; LeafGreen does not require a Poké Ball. All thirteen local JSON
files are UTF-8 without BOM and pass strict `JSON.parse`.

The parent owns the shared reference list. These records support the reviewed
trade and roaming source records:

```json
[
  {"id":"leafgreen-trades","title":"LeafGreen in-game trades","locator":"src/data/ingame_trades.h; data/maps/*/scripts.inc; requested and received species for all nine NPC trades","url":"https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/data/ingame_trades.h","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"},
  {"id":"leafgreen-roamers","title":"LeafGreen roaming beasts","locator":"src/roamer.c; data/maps/OneIsland_PokemonCenter_1F/scripts.inc; level, starter mapping, roaming region, and Sapphire-return release event","url":"https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/roamer.c","revision":"037335f4c725d7c9aecdac87066f2002b4bd7e14"}
]
```



## Complete breeding source coverage checked on 2026-10-13

The pinned review checkout still has HEAD 037335f4c725d7c9aecdac87066f2002b4bd7e14. Its src/daycare.c, include/constants/daycare.h, and map data place the breeding Day Care on Four Island and set hatched eggs to level 5. LeafGreen uses the same shared Day Care implementation as FireRed. The data now has 182 source records for all 182 rule/offspring pairs in its 180 breeding rules. These sources require the Four Island Day Care capability, allow repeated eggs, and use each offspring profile's possible genders. The Azurill and Wynaut records also require the respective held incense as a non-consumed item. Their physical pickups remain one-use sources in Lost Cave rooms 12 and 11.

The single Eevee gift remains finite. Eevee can pair with native Ditto after Four Island access, and its repeatable egg source gives a second Eevee for a sibling team path. LeafGreen coverage tests check this path and each rule/offspring source pair.
