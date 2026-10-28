# Pokémon Black Progress Planner coverage

Reviewed on 27 October 2026. Team Planner and Progress Planner are enabled.
The native offline access layers are active. Every record has references and a review date.

| Layer | Active records |
| --- | ---: |
| Base profiles | 649 |
| Regional entries | 156 |
| Alternate form profiles | 12 |
| Milestones | 56 |
| Pokémon sources | 1220 |
| Evolutions, including form edges | 323 |
| Breeding rules | 289 |
| Explicit native-scope exclusions | 308 |

The catalogue uses Unova order first, then National Dex order. This game uses
17 types and hatch level 1. The default checkpoint is Victory Road.

## Native access

The data includes the starter-linked Dreamyard monkey, one fossil choice, five Darmanitan statues, Larvesta’s Egg, the story dragon, its fallback encounter, the roaming Pokémon and Friday Musharna. Dark grass in the Dreamyard and the basement require post-game access. White Forest does not exist in this version. Black City supplies no native Pokémon capture.

Landorus has a reviewed source. It stays blocked because it needs both Tornadus and Thundurus. This version supplies only Tornadus.

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
| Gym 1: Chili / Cilan / Cress (starter-dependent) | 14 |
| Gym 2: Lenora — Normal | 20 |
| Gym 3: Burgh — Bug | 23 |
| Gym 4: Elesa — Electric | 27 |
| Gym 5: Clay — Ground | 31 |
| Gym 6: Skyla — Flying | 35 |
| Gym 7: Brycen — Ice | 39 |
| Gym 8: Drayden — Dragon | 43 |
| Victory Road | 50 |

`tests/gen5-acceptance-checks.ts` checks all nine points, early and later route
gates, version choices, finite resources, native forms and final access.
`tests/generation-v-progress.test.ts` also checks the public query and shared
six-slot state. See [implementation checks](implementation-checks.md).

## Final native access

At final native progress, 340 base species and 12 alternate forms
have positive acquisition proofs. One further base species has a reviewed
source that needs an external partner and stays blocked. Every other base
species has a reviewed native-scope exclusion. No species lacks a reviewed
outcome.

## Reviewed exclusion inventory

These are negative results from the complete reviewed native inventory, not
unreviewed species. The record in `exclusions.json` names the scope reason.
The source review cross-checks negative lists against positive wild, gift,
static, trade, swarm, special-area, evolution and breeding records.

external-connection: bulbasaur, ivysaur, venusaur, charmander, charmeleon, charizard, squirtle, wartortle, blastoise, caterpie, metapod, butterfree, pidgey, pidgeotto, pidgeot, ekans, arbok, pikachu, raichu, nidoran-f, nidorina, nidoqueen, nidoran-m, nidorino, nidoking, oddish, gloom, vileplume, paras, parasect, diglett, dugtrio, meowth, persian, growlithe, arcanine, abra, kadabra, alakazam, machop, machoke, machamp, bellsprout, weepinbell, victreebel, tentacool, tentacruel, golem, magnemite, magneton, grimer, muk, gastly, haunter, gengar, drowzee, hypno, voltorb, electrode, koffing, weezing, rhyhorn, rhydon, chansey, mr-mime, scyther, electabuzz, magmar, tauros, eevee, vaporeon, jolteon, flareon, porygon, articuno, zapdos, moltres, mewtwo, chikorita, bayleef, meganium, cyndaquil, quilava, typhlosion, totodile, croconaw, feraligatr, pichu, togepi, togetic, natu, xatu, mareep, flaaffy, ampharos, bellossom, marill, azumarill, sudowoodo, hoppip, skiploom, jumpluff, aipom, wooper, quagsire, espeon, umbreon, misdreavus, unown, girafarig, steelix, snubbull, granbull, scizor, teddiursa, ursaring, slugma, magcargo, skarmory, phanpy, donphan, porygon2, elekid, magby, miltank, blissey, raikou, entei, suicune, lugia, ho-oh, treecko, grovyle, sceptile, torchic, combusken, blaziken, mudkip, marshtomp, swampert, poochyena, mightyena, zigzagoon, linoone, wurmple, silcoon, beautifly, cascoon, dustox, lotad, lombre, ludicolo, seedot, nuzleaf, shiftry, ralts, kirlia, gardevoir, surskit, masquerain, slakoth, vigoroth, slaking, nincada, ninjask, shedinja, whismur, loudred, exploud, makuhita, hariyama, azurill, nosepass, skitty, delcatty, aron, lairon, aggron, meditite, medicham, electrike, manectric, minun, roselia, gulpin, swalot, numel, camerupt, torkoal, spoink, grumpig, spinda, trapinch, vibrava, flygon, cacnea, cacturne, corphish, crawdaunt, castform, kecleon, duskull, dusclops, snorunt, glalie, gorebyss, bagon, shelgon, salamence, regirock, regice, registeel, latias, latios, kyogre, groudon, rayquaza, turtwig, grotle, torterra, chimchar, monferno, infernape, piplup, prinplup, empoleon, starly, staravia, staraptor, shinx, luxio, luxray, budew, roserade, burmy, wormadam, mothim, pachirisu, shellos, gastrodon, ambipom, buneary, lopunny, mismagius, glameow, purugly, stunky, skuntank, bonsly, mime-jr, happiny, chatot, spiritomb, gible, gabite, garchomp, skorupi, drapion, carnivine, snover, abomasnow, magnezone, rhyperior, electivire, magmortar, togekiss, leafeon, glaceon, porygon-z, gallade, probopass, dusknoir, froslass, uxie, mesprit, azelf, dialga, palkia, heatran, regigigas, giratina, cresselia, gigalith, conkeldurr, solosis, duosion, reuniclus, escavalier, accelgor, rufflet, braviary, thundurus, zekrom.

external-event: mew, celebi, jirachi, deoxys, phione, manaphy, darkrai, shaymin, arceus, victini, zorua, zoroark, keldeo, meloetta, genesect.

## Declared limits

External distributions, transfers, Dream World, Dream Radar, Memory Link,
Entralink recruitment, Unova Link keys and player trades are outside scope.
The planner checks possible access. It does not track a save file, the current
season, day, resident loss, random rolls, mission results or call history.
Conditions and required actions stay visible in details and exports.
Battle-only transformations are outside the persistent form catalogue.

See the [source review](black-sources.md) and [form review](black-forms.md).
