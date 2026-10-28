# Pokémon Black 2 Progress Planner coverage

Reviewed on 27 October 2026. Team Planner and Progress Planner are enabled.
The native offline access layers are active. Every record has references and a review date.

| Layer | Active records |
| --- | ---: |
| Base profiles | 649 |
| Regional entries | 301 |
| Alternate form profiles | 16 |
| Milestones | 64 |
| Pokémon sources | 1834 |
| Evolutions, including form edges | 324 |
| Breeding rules | 290 |
| Explicit native-scope exclusions | 199 |

The catalogue uses Unova order first, then National Dex order. This game uses
17 types and hatch level 1. The default checkpoint is Victory Road.

## Native access

The data includes the one-time male Minccino introduction, ordinary Hidden Grotto regeneration, and all 20 possible solo mission sites. Noisy Hidden Grottoes gives Stunky. The 12 fake-item Foongus and Amoonguss sources have separate repeatable Mushrooms’ Hide-and-Seek sources. N’s level 25 Zorua needs no Memory Link. The two phone branches use 12 daily trades each, fixed level 50, an actual offered Pokémon, and the player-character choice. Benga gives Gible.

The native Iron Key opens Registeel. Regice needs the external Iceberg Key. Regigigas has a reviewed source. It stays blocked because the party needs all three Regis.

The wild layer retains seasons, dark grass, shaking grass, dust clouds,
bridge shadows and rippling water. Sources require the matching action and
Surf or the Super Rod where needed. Daily swarms require the National Dex.
The data keeps each version’s own species and encounter levels.

Items include native evolution stones, incense, held evolution items, fossil
revival, Heart Scales, key items and their access requirements. Stone dust
clouds do not use the sequel shard-only cave tables. Breeding keeps native
parents, incense, inherited forms, and distinct individual requirements.
Player-trade evolutions remain blocked. No native Beauty increase is assumed.

## Checkpoints

| Checkpoint | Level cap |
| --- | ---: |
| Gym 1: Cheren — Normal | 13 |
| Gym 2: Roxie — Poison | 18 |
| Gym 3: Burgh — Bug | 24 |
| Gym 4: Elesa — Electric | 30 |
| Gym 5: Clay — Ground | 33 |
| Gym 6: Skyla — Flying | 39 |
| Gym 7: Drayden — Dragon | 48 |
| Gym 8: Marlon — Water | 51 |
| Victory Road | 58 |

`tests/gen5-acceptance-checks.ts` checks all nine points, early and later route
gates, version choices, finite resources, native forms and final access.
`tests/generation-v-progress.test.ts` also checks the public query and shared
six-slot state. See [implementation checks](implementation-checks.md).

## Final native access

At final native progress, 449 base species and 15 alternate forms
have positive acquisition proofs. One further base species has a reviewed
source that needs an external partner and stays blocked. Every other base
species has a reviewed native-scope exclusion. No species lacks a reviewed
outcome.

## Reviewed exclusion inventory

These are negative results from the complete reviewed native inventory, not
unreviewed species. The record in `exclusions.json` names the scope reason.
The source review cross-checks negative lists against positive wild, gift,
static, trade, swarm, special-area, evolution and breeding records.

external-connection: bulbasaur, ivysaur, venusaur, charmander, charmeleon, charizard, squirtle, wartortle, blastoise, caterpie, metapod, butterfree, pidgey, pidgeotto, pidgeot, ekans, arbok, pikachu, raichu, oddish, gloom, vileplume, paras, parasect, diglett, dugtrio, machop, machoke, machamp, bellsprout, weepinbell, victreebel, tentacool, tentacruel, geodude, graveler, golem, ponyta, rapidash, gastly, haunter, gengar, voltorb, electrode, exeggcute, exeggutor, cubone, marowak, hitmonlee, hitmonchan, kangaskhan, mr-mime, scyther, jynx, electabuzz, tauros, porygon, articuno, zapdos, moltres, mewtwo, chikorita, bayleef, meganium, cyndaquil, quilava, typhlosion, totodile, croconaw, feraligatr, ledyba, ledian, pichu, bellossom, slowking, misdreavus, unown, scizor, slugma, magcargo, houndour, houndoom, porygon2, stantler, smeargle, tyrogue, hitmontop, smoochum, elekid, miltank, raikou, entei, suicune, lugia, ho-oh, treecko, grovyle, sceptile, torchic, combusken, blaziken, mudkip, marshtomp, swampert, poochyena, mightyena, zigzagoon, linoone, wurmple, silcoon, beautifly, cascoon, dustox, nincada, ninjask, shedinja, whismur, loudred, exploud, skitty, delcatty, minun, numel, camerupt, torkoal, duskull, dusclops, chimecho, snorunt, glalie, gorebyss, regice, latias, kyogre, groudon, rayquaza, turtwig, grotle, torterra, chimchar, monferno, infernape, piplup, prinplup, empoleon, starly, staravia, staraptor, kricketot, kricketune, shinx, luxio, luxray, burmy, wormadam, mothim, cherubi, cherrim, mismagius, glameow, purugly, chingling, mime-jr, snover, abomasnow, rhyperior, electivire, magmortar, porygon-z, dusknoir, froslass, dialga, palkia, giratina, conkeldurr, solosis, duosion, reuniclus, escavalier, accelgor, rufflet, braviary, tornadus, thundurus, reshiram, landorus.

external-event: mew, celebi, jirachi, deoxys, phione, manaphy, darkrai, shaymin, arceus, victini, keldeo, meloetta, genesect.

## Declared limits

External distributions, transfers, Dream World, Dream Radar, Memory Link,
Entralink recruitment, Unova Link keys and player trades are outside scope.
The planner checks possible access. It does not track a save file, the current
season, day, resident loss, random rolls, mission results or call history.
Conditions and required actions stay visible in details and exports.
Battle-only transformations are outside the persistent form catalogue.

See the [source review](black-2-sources.md) and [form review](black-2-forms.md).
