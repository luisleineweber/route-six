# Pokémon FireRed source review

Scope: native FireRed acquisition in Kanto and the ordinary Sevii Islands. Player trades and external events are excluded. Review date: 2026-10-12.

Pinned source: [pret/pokefirered at 037335f4c725d7c9aecdac87066f2002b4bd7e14](https://github.com/pret/pokefirered/tree/037335f4c725d7c9aecdac87066f2002b4bd7e14). The checkout in `.firered-source-review` matches the pin. FireRed version branches and actual scripts were checked before records were authored.

## Source locators

- Profiles and Kanto order: `src/data/pokemon/species_info.h`, `src/data/pokemon/pokedex_orders.h`.
- Evolution transitions: `src/data/pokemon/evolution.h`; FireRed time-evolution handling: `src/pokemon.c:GetEvolutionTargetSpecies`; National Dex lock: `src/evolution_scene.c:Task_EvolutionScene`.
- Shedinja creation: `src/evolution_scene.c:CreateShedinja`.
- Day Care offspring: `src/daycare.c:GetEggSpecies`, `DetermineEggSpeciesAndParentSlots`, `AlterEggSpeciesWithIncenseItem`, and `SetInitialEggData`.
- Encounters and map access: `src/data/wild_encounters.json`, `data/maps/*/map.json`, and the relevant `scripts.inc`.
- Incense item balls: `data/scripts/item_ball_scripts.inc` lines 650 and 654 (Lost Cave).
- National Dex reward: `data/maps/PalletTown_ProfessorOaksLab/scripts.inc`.

## Reviewed records

The maintained dataset has 1,881 grouped wild records, 35 non-wild Pokémon sources, and 182 Day Care source records. Those breeding sources represent all 180 breeding rules and 181 distinct offspring species. The wild table set excludes the eight numbered wireless Altering Cave alternatives and retains the ordinary Zubat encounter.

The data has 42 item records and 168 locations. It covers story items, rods, HMs, evolution stones, fossils, the four trade-evolution items with physical sources, and the Lax and Sea Incenses. The Deep Sea Tooth and Scale are supported trade-evolution items, but have no native item sources because Clamperl has no FireRed native source.

The pinned evolution table has 184 transitions. FireRed records 181: all transitions except Eevee's day and night friendship evolutions and Feebas to Milotic. The source code disables time evolutions in FireRed and LeafGreen because neither game has an RTC. FireRed has no native Feebas source, and the game has no Beauty-raising feature. All 12 player-trade edges remain explicit and blocked by the planner's no-player-trade scope. Non-Kanto evolution targets require the National Dex.

Day Care rules cover every supported offspring family. Ditto is a parent only. Incense can produce Wynaut and Azurill; without the matching incense, the eggs are Wobbuffet and Marill. Both incense items have ordinary Lost Cave item-ball scripts. Eggs hatch at level 5 in FireRed. Togepi is also available through the separate optional Five Island egg reward.

The FireRed outcome partition is 180 species with a native source, evolution, or breeding path; 12 terminal player-trade targets; and 194 base-family exclusions. These groups are disjoint and cover all 386 supported profiles. The Kanto story chain requires the Rocket Hideout and Fuji rescue before Koga. This models the actual Poké Flute chain needed to pass Snorlax and reach Fuchsia. The postgame chain also requires the Icefall Cave Rocket encounter before Sapphire can return to Celio. The National Dex milestone follows Champion victory and One Island access, then models the 60-caught reward opportunity without tracking collection progress.

The source-derived route inventory and the domain solver's route checks serve different purposes. Source closure counts reviewed ways to produce species. Solver checks confirm concrete access under modeled milestone, item, choice, and capability gates. The exact solver checkpoints are covered by `tests/firered.test.ts`.

`CreateShedinja` requires one free party slot. It does not check for a Poké Ball. The Nincada evolution edges remain in the complete rule inventory even though Nincada has no native FireRed source; they do not create a native acquisition path by themselves.

HM05 is an optional reward after 10 seen species and access to the Route 2 Cut route. The Togepi egg opportunity follows National Dex and Five Island access and needs a high-friendship lead. The planner records these as optional milestones; it does not track seen counts or current friendship.
