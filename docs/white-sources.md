# Pokémon White source review

Reviewed on 27 October 2026. The active Progress Planner uses these reviewed
records. Sources were checked for this game. A shared region does not prove
a shared encounter or story gate. References in `data/references.json` use
the `white-native-` prefix. Each new progress record also has `checkedOn: 2026-10-27`.

## Pinned records

| Source | Revision | Exact selector or locator |
| --- | --- | --- |
| [PKHeX](https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774) | `641c26ba100225f3605e5a44b61b3b16e15a3774` | `PKHeX.Core/Resources/legality/wild/Gen5/encounter_w.pkl`; `EncounterArea5.cs`; `Encounters5BW.cs`, this version’s fixed, gift and trade branches |
| [PokeAPI data](https://github.com/PokeAPI/pokeapi/tree/81d20919845b6a445969b9265aab5cec6b04cece/data/v2/csv) | `81d20919845b6a445969b9265aab5cec6b04cece` | `encounters.csv version_id=18`; slots, condition maps, area joins; version group 11 |
| PKHeX evolution | `641c26ba100225f3605e5a44b61b3b16e15a3774` | `Resources/byte/evolve/evos_g5.pkl`, methods 1–27; `levelup/lvlmove_bw.pkl`; `EncounterEgg5.cs` hatch level 1 |
| PKHeX personal data | `641c26ba100225f3605e5a44b61b3b16e15a3774` | `personal_bw`, form indexes, type bytes, gender ratios, held-item columns, Egg Groups |
| [Native sequel code](https://github.com/fuddlesworth/pokebw2/tree/a17a9fedc6344da8bc063b0517a755faee137b0b) | `a17a9fedc6344da8bc063b0517a755faee137b0b` | Gen V mechanics cross-check only. This is not evidence for this game’s story or area gates. |

The detailed comparison checks 2654 wild rows in 80
areas for this version. Equal slots are combined only within the same area,
species, form, method, season and level range. Equal seasonal tables can share
a source. Record IDs retain the first encounter ID. Separate methods and
conditions remain separate. Each pinned PKHeX resource was checked byte for byte.

## Access and source joins

- The own-version detailed Dreamyard rows distinguish area 579’s ordinary Cut grass from its post-game dark grass and area 580’s basement. The opening monkey gift does not grant the later pocket. The published Dreamyard table and the Black/White post-game Dreamyard walkthrough confirm the join.
- Pinwheel outside and inside have separate gates. Inside follows Lenora and the stolen-skull event. Lostlorn uses the Route 16/Nimbasa branch. Its event Zoroark is distribution-gated and excluded.
- Route 4’s first grass can be reached before Burgh. Full northward passage, Desert Resort and fossil access follow the Castelia events. Chargestone opens after Clay. Route 6 is available before Clay.
- The HM gift table places Strength in Nimbasa, Surf after Skyla, Waterfall on Route 18 after Surf, and the Super Rod after game clear. Challenger’s Cave’s deeper sources need Surf and Strength. Dragonspiral interiors follow Brycen.
- `Encounters5BW.cs` fixed/gift/trade branches keep the monkey linked to the selected starter, fossil choice, five consumed RageCandyBars, the level 1 Larvesta Egg, Friday Musharna, and the story dragon/fallback choice. NPC trades consume their named offer and use their documented receiving level.
- This version’s swarm table has seventeen species. The published rate is 40%; the sequel’s separately verified 41% implementation is not applied to this game.
- Own-version personal tables and `lvlmove_bw.pkl` supply breeding families, held items and evolution move levels. Tangela learns Ancient Power at 36, Bonsly learns Mimic at 17, and Mime Jr. learns Mimic at 18. The sequel levels do not apply.
- `sodateya.c` in the pinned sequel is a Gen V mechanics cross-check for incense and inherited forms. Pinned PKHeX `Breeding.cs`, generation checks, and own-version personal tables provide the Generation V family rules. This does not copy the sequel Day Care gate: two-parent Day Care opens after the Nimbasa rescue in Black/White.
- [White Forest mechanics](https://www.smogon.com/ingame/guides/bc_wf_mechanics), How Trainers Are Selected, Why Trainers Leave and Recruitment Restrictions: ten initial overworld residents from thirty possible residents; level 5 grass and water pools; maximum ten selections. PKHeX’s White Forest table confirms positive native species. The broad unobtainable summary incorrectly lists Wooper; this positive native evidence takes priority. No Entralink invitation is assumed.

## Snapshot pins

Published pages have no immutable revision. These SHA-256 pins identify the
reviewed local snapshots from 27 October 2026. The active reference locator
names the table and version. These pages cross-check the pinned data and
native code; a shared page is not permission to substitute a sibling version.

| Published source | SHA-256 |
| --- | --- |
| [blackwhite-formchanges.shtml](https://www.serebii.net/blackwhite/formchanges.shtml) | `dab2b7b183a8a5610d0413fe30145c4489cb982ddf0ee46bea6a46aa5cd08c14` |
| [blackwhite-forms.shtml](https://www.serebii.net/blackwhite/forms.shtml) | `55e5a440edc50bf5bacb209b62023e21088142e1c1e932b947f6a3ee6a33247a` |
| [blackwhite-gift.shtml](https://www.serebii.net/blackwhite/gift.shtml) | `663082bbd2eca148e90835d0bd208226fc3bcedd84d01ad9b9ade5038b8c7df8` |
| [blackwhite-interact.shtml](https://www.serebii.net/blackwhite/interact.shtml) | `a03db325fbbef4763b698f46e51f688761c0dfd457fc4a1ae9f89e7b3e134abd` |
| [blackwhite-items.shtml](https://www.serebii.net/blackwhite/items.shtml) | `c3845084f4779ad366b26fd95feeb9193b2da10241acaf665d1bc1787e3e7b8e` |
| [blackwhite-legendary.shtml](https://www.serebii.net/blackwhite/legendary.shtml) | `8e01ab1bb8ca6f7a5b389142f5e4b1508c71f544a76b5b18beeac13ba497cdff` |
| [blackwhite-swarms.shtml](https://www.serebii.net/blackwhite/swarms.shtml) | `b3416e7f92672644edd61e3e8ad095834ace22821061494ff1a50bdca6a9fd0d` |
| [blackwhite-tmhm.shtml](https://www.serebii.net/blackwhite/tmhm.shtml) | `785d80eb1e0470a84c10db51ff9a3df6f4dec6fbba552d820a73055ba4716589` |
| [blackwhite-trade.shtml](https://www.serebii.net/blackwhite/trade.shtml) | `862c8f451c496e76d2b499d4f348d8711a80b7dee3c121f25809077850f1b6be` |
| [blackwhite-unobtainable.shtml](https://www.serebii.net/blackwhite/unobtainable.shtml) | `39582fdcc9702aed6ad083d910986baab8c27fc09fa2d6693d6f61cc77a554e8` |
| [guides-bc_wf_mechanics.html](https://www.smogon.com/ingame/guides/bc_wf_mechanics) | `27cf452154e93008f46892001a0eeff625113855954e296318df8ae696ef6941` |
| [unova-chargestonecave.shtml](https://www.serebii.net/pokearth/unova/chargestonecave.shtml) | `00640f04042a9bf409109f451a5a80521c07c7e6d7ffa094a1004de3539e09d1` |
| [unova-dreamyard.shtml](https://www.serebii.net/pokearth/unova/dreamyard.shtml) | `f16f5b87aeefb00e2f572e5bb1cc831739248d7ad6bfb4189ada7e7f90f93c7c` |
| [unova-route4.shtml](https://www.serebii.net/pokearth/unova/route4.shtml) | `a039ea90fac42d1c4d398faf91677c41f4fa436f115e7f2a07ae62397d84484e` |

No local ROM build was run. The reconstruction’s matching-build statement is
not a local verification result. The partial Black reconstruction at
`bbb5cd501426c1ca5f16a9d09c8d91fd03a1c12b` does not supply reviewed map or
item definitions and is not used as evidence for guessed access records.
Source candidates and raw review files stay under ignored `output/`.
Only reviewed local JSON and local images ship with the app.

See [coverage](white-coverage.md), [forms](white-forms.md), and the [integration review](generation-5-progress-review.md).

## Published access guide pins

Reviewed on 27 October 2026. These pages give the exact access joins noted above.

| Guide | SHA-256 |
| --- | --- |
| [bw-dreamyard-guide](https://www.gamerguides.com/pokemon-black-white/guide/postgame-walkthrough/new-adventures-part-3/dreamyard-basement) | `325e2753da9fdb22d0d6b77a80bdf18ac21a712e7d83b04ccbfbc7d3c01e9356` |
| [bw-route4-guide](https://www.thonky.com/pokemon-black-white/route-4) | `027257ac123e5e14b3570d25b4ac52eb757781bd7368e6f63107746d7920a70d` |
