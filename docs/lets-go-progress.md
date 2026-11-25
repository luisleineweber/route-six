# Pokémon Let’s Go Progress Planner

Reviewed on 24 November 2026. Each edition has 153 species profiles, 18
Alolan forms, one partner form, 699 acquisition sources, and 80 evolution
rules. The two editions share 655 sources and keep their other sources in
their own game folders.

## Wild encounters

The pinned [PKHeX wild tables](https://github.com/kwsch/PKHeX/tree/a5311f9f55a84376fd2e2499b25d9fb9640d9f2d/PKHeX.Core/Resources/legality/wild/Gen7)
provide the species and base level ranges for 35 named encounter locations per
edition. The [PokéAPI CSV tables](https://github.com/PokeAPI/pokeapi/tree/de6760be38b60a3024f1d9054330ff265f0dc619/data/v2/csv)
provide floor names, habitat groups, and rare-spawn labels for versions 31
and 32. PokéAPI rates include placeholder values. The planner reports the
habitat and rare-spawn label. Catch Combos and Lures affect the chance of an
encounter, so rates and level bonuses from those effects are outside the
current scope.

- Route 20 has separate east and west water ranges. Both are in the
  [Pokéarth Route 20 observations](https://www.serebii.net/pokearth/kanto/route20.shtml).
- Route 6 has five special sky encounters. Pokéarth and the encounter CSV
  list them. The PKHeX file omits these slots at that location.
  [Pokéarth Route 6 observations](https://www.serebii.net/pokearth/kanto/route6.shtml)
- Route 11 and Route 15 use the observed ground levels for Chansey. The
  PKHeX table gives a wider range for Chansey on these two routes.
  [Route 11](https://www.serebii.net/pokearth/kanto/route11.shtml),
  [Route 15](https://www.serebii.net/pokearth/kanto/route15.shtml)
- Water requires Sea Skim. Sky encounters require high flight after the
  League. The three rare sky birds also require catching all three fixed
  birds. This requirement appears as a capability for planning possible
  access. The app does not read the player's save.
  [Let’s Go game changes](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon:_Let%27s_Go,_Pikachu!_and_Let%27s_Go,_Eevee!)

## Progress and Pokémon

The Gym checkpoints follow the recommended game route and use the first-battle
ace levels. The last selectable point includes Victory Road and the Indigo
Plateau trade before the League. Post-game sources appear under Whole Game.
The game permits some badge orders and side trips outside this route. Story
milestones preserve the conditions that matter for acquisition, including
Chop Down from the S.S. Anne captain, the Silph Scope, the Poké Flute, and
Sea Skim before the coastal routes. Sea Skim does not require the Soul Badge.
[Game walkthrough](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon:_Let%27s_Go,_Pikachu!_and_Let%27s_Go,_Eevee!),
[first-battle party levels](https://pokemondb.net/lets-go-pikachu-eevee/gymleaders-elitefour)

The [PKHeX fixed encounter and trade templates](https://github.com/kwsch/PKHeX/blob/a5311f9f55a84376fd2e2499b25d9fb9640d9f2d/PKHeX.Core/Legality/Encounters/Data/Gen7/Encounters7GG.cs)
establish gift and trade levels. Persian in Pikachu and Arcanine in Eevee are
level 16 gifts after five catches of the requested species. Porygon is a level
34 gift after clearing Silph Co. The [gift observations](https://www.serebii.net/letsgopikachueevee/gift.shtml)
explain the story requirements. The Fighting Dojo gifts keep their exclusive
choice. Wild Hitmonlee and Hitmonchan give later alternatives.

The [Alolan NPC trades](https://www.serebii.net/letsgopikachueevee/trade.shtml)
use the matching Kantonian species and fixed received levels. These are
repeatable exchanges. The [pinned evolution table](https://github.com/kwsch/PKHeX/blob/a5311f9f55a84376fd2e2499b25d9fb9640d9f2d/PKHeX.Core/Resources/byte/evolve/evos_gg.pkl)
keeps the partner forms out of the evolution rules and maps the Alolan lines
to their own forms. The Mt. Moon fossils use a single choice until more
fossils can be found in Cerulean Cave. [Fossil locations](https://www.serebii.net/letsgopikachueevee/respawningitems.shtml)

At Cerulean Cave, each edition has 149 native selections, 18 exclusions for
version or external access, and five blocked player-trade evolutions.
Mew through Poké Ball Plus and Meltan and Melmetal through Pokémon GO are
outside the offline scope.
