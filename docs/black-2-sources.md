# Pokémon Black 2 source review

Reviewed on 27 October 2026. The active Progress Planner uses these reviewed
records. Sources were checked for this game. A shared region does not prove
a shared encounter or story gate. References in `data/references.json` use
the `black-2-native-` prefix. Each new progress record also has `checkedOn: 2026-10-27`.

## Pinned records

| Source | Revision | Exact selector or locator |
| --- | --- | --- |
| [PKHeX](https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774) | `641c26ba100225f3605e5a44b61b3b16e15a3774` | `PKHeX.Core/Resources/legality/wild/Gen5/encounter_b2.pkl`; `EncounterArea5.cs`; `Encounters5B2W2.cs`, this version’s fixed, gift and trade branches |
| [PokeAPI data](https://github.com/PokeAPI/pokeapi/tree/81d20919845b6a445969b9265aab5cec6b04cece/data/v2/csv) | `81d20919845b6a445969b9265aab5cec6b04cece` | `encounters.csv version_id=21`; slots, condition maps, area joins; version group 14 |
| PKHeX evolution | `641c26ba100225f3605e5a44b61b3b16e15a3774` | `Resources/byte/evolve/evos_g5.pkl`, methods 1–27; `levelup/lvlmove_b2w2.pkl`; `EncounterEgg5.cs` hatch level 1 |
| PKHeX personal data | `641c26ba100225f3605e5a44b61b3b16e15a3774` | `personal_b2w2`, form indexes, type bytes, gender ratios, held-item columns, Egg Groups |
| [Native sequel code](https://github.com/fuddlesworth/pokebw2/tree/a17a9fedc6344da8bc063b0517a755faee137b0b) | `a17a9fedc6344da8bc063b0517a755faee137b0b` | Own version branches, named field scripts and native action code listed below. |

The detailed comparison checks 3720 wild rows in 108
areas for this version. Equal slots are combined only within the same area,
species, form, method, season and level range. Equal seasonal tables can share
a source. Record IDs retain the first encounter ID. Separate methods and
conditions remain separate. Each pinned PKHeX resource was checked byte for byte.

## Access and source joins

- `res/field/scripts/route_5.s`, `Script_18`, plus `scrcmd_hidden_hollow.c`: the male level 20–24 tutorial is a one-time source. Normal contents regenerate separately.
- `src/ov036/scrcmd_hidden_hollow.c`, `HOLLOW_FILE_VERSION`, selects 1. `s0294_HiddenHollowGetParam` uses `min + Random(max - min)`. Own-version PKHeX bounds 40/45 and suloku’s Route 22 table support Mienfoo 40–44, not the conflicting 50–54 summary.
- [Grotto table cross-check](https://github.com/suloku/BW2_grottoswarm/tree/2a68f0cd10cb4e680b9514d4b72f053cbee8a3e3), revision `2a68f0cd10cb4e680b9514d4b72f053cbee8a3e3`, `b2_10.PNG`; native physical-site indexes in `src/ov012/hidden_hollow.c`.
- `src/ov026/fest_mission_hollow.c`: solo mission species and levels at each physical site. Twenty sites can receive one of ten random mission placements. Multiplayer and downloaded missions are not required.
- `res/field/events/route_6.json`, `route_7.json`, `route_11.json`, `route_22.json`, `route_23.json`; `global_10520.s`: twelve fake-item battles. Route 11 Amoonguss is level 43. The CSV candidate’s level 47 is rejected. `src/ov036/fes_gimmick.c`, `ClearFesEventFlags`, restores the twelve event flags for Mushrooms’ Hide-and-Seek.
- `driftveil_city_6.s`: N’s Zorua gift, level 25, after the Driftveil visit. This is not a Memory Link encounter.
- `generated/trades.txt`, `res/field/trades/*.json`, `global_10510.s`: player gender chooses the archive offset. Male player gets Yancy; female player gets Curtis. `scrcmd_pokemon_misc.c`, `s01B5_FieldTradeCheck`, and the caller accept any hatched, unfused Pokémon. The unused Pikachu offer in the trade file is not a restriction for these phone trades.
- `src/ov259/local_tvt_person_secret.c`, `sLocalTvtSecretStages`: return the item after ten calls, then reach the 30th-call wheel ride. A later-day meeting after the Hall of Fame allows a trade. The maximum 51-call counter is not the first-trade requirement. `global_10510.s` cycles twelve outputs and `ev_time.c` resets the daily meeting flag.
- `rock_peak_chamber.s`, `Script_6`: capture Regirock, then unlock own-version key. VM false-branch semantics are defined by `scrcmd_vm.c`, `s001F_VMJumpIf`. Game version 23 gives key 3; the other version gives key 4. [Official Key System](https://www.pokemon.co.jp/ex/b2w2/system/system06.html), Mystery Door, names Black 2’s Iron Key and White 2’s Iceberg Key. The opposite key needs a connection.
- `iceberg_chamber.s`, `Script_6`: level 65 Regice battle. `twist_mountain_8.s`, `Script_1`: checks Regice, Regirock and Registeel in the party before level 68 Regigigas. Native negative key scope blocks the missing partner.
- `src/ov165/plist_demo.c`, `CheckFuse`, `CheckSeparate`, `Fuse`, `Separate`; `plist_sys.c`, `func_ov165_0219becc`: DNA Splicers, eligible Reshiram/Zekrom partner, stored partner and spare party space for separation. One native Kyurem cannot supply two concurrent fusions.
- `src/ov036/enc_pokeset.c`, `SWARM_DATA`, `createSwarm`, and `src/system/gfl_use.c`, `GFL_RandomLCAlt`: the native check accepts 0–40 from 0–99. Thus the sequel rate is 41%, despite secondary tables saying 40%. Level bounds are inclusive 40–55.
- `effect_encount.c`, `DUST_CLOUD_ITEMS_NORMAL` and `DUST_CLOUD_SHARD_ZONES`: Chargestone Cave supplies stones. Relic Passage and Reversal Mountain supply shards instead.
- `src/ov036/sodateya.c`: `getChild`, `nidoranCompute`, `volbeatCompute`, `incenseHandler`, `shellosHandler`, `basculinHandler`; native offspring, incense and inherited forms. `src/system/poke_tool.c`, `setChangedPkmSpecies` and `UpdateGenderOnMonsChange`, recompute gender from species and personality. Azurill can change female to male when it evolves.
- Published game walkthrough stages and the own-game tables retain pre-Clay Chargestone 1F, post-PWT lower floors, Route 15 after the League, Route 11 Surf/Waterfall pockets, Seaside Cave’s separate approaches, and the Wave Badge gate for Route 22 Terrakion. The HM table below supplies each field action’s own story gift.

## Snapshot pins

Published pages have no immutable revision. These SHA-256 pins identify the
reviewed local snapshots from 27 October 2026. The active reference locator
names the table and version. These pages cross-check the pinned data and
native code; a shared page is not permission to substitute a sibling version.

| Published source | SHA-256 |
| --- | --- |
| [black2white2-droppeditem.shtml](https://www.serebii.net/black2white2/droppeditem.shtml) | `29d32a738474a0026ada4fd0bf5b4243e418138420c68b5dfd5cfd4072205d8f` |
| [black2white2-fesmission.shtml](https://www.serebii.net/black2white2/fesmission.shtml) | `1957a62a880b715565d3ba355db5f0edf012c7c466381c50ca3080df025ecb67` |
| [black2white2-forms.shtml](https://www.serebii.net/black2white2/forms.shtml) | `bd5313ff49020872a781e3bec54ffcc536d8b0d450119f18da0b65796777e8da` |
| [black2white2-gift.shtml](https://www.serebii.net/black2white2/gift.shtml) | `a0116ac2271a8871e6bef7517289485c4f1062a595cb5bab534f6358a4b8ef3a` |
| [black2white2-hiddengrotto.shtml](https://www.serebii.net/black2white2/hiddengrotto.shtml) | `d2177375b9186c93d4ae1dbe77dddd2d5cbba13ebb4ddae2853b97a0b4c254f0` |
| [black2white2-interact.shtml](https://www.serebii.net/black2white2/interact.shtml) | `9dd557f7d2d21ab99a32e6e6d671bd9a75429fdb2baa3dbae6f7ef153ce442c4` |
| [black2white2-items.shtml](https://www.serebii.net/black2white2/items.shtml) | `f1e1f4e60598e0fe5a0fab16a73856a4c7b647f41c7ea2507a241e125fbc6e37` |
| [black2white2-legendary.shtml](https://www.serebii.net/black2white2/legendary.shtml) | `d4d963892103f34ed8e7c190af9948f253570db19ff15a410bbfb1d30d9f71b1` |
| [black2white2-swarms.shtml](https://www.serebii.net/black2white2/swarms.shtml) | `cdc7d79bfb0393f1e9365438ec84659007e8941453679a1b8dd86b25bc764793` |
| [black2white2-tmhm.shtml](https://www.serebii.net/black2white2/tmhm.shtml) | `910efd4d07cbde00b79101fa7b2441e5817a7848160b5ed752b72579895580db` |
| [black2white2-unobtainable.shtml](https://www.serebii.net/black2white2/unobtainable.shtml) | `8b2747e89242fa69f6989d23c7c9eb8573c01fb42f50047145e2e41fb4592a64` |
| [unova-chargestonecave.shtml](https://www.serebii.net/pokearth/unova/chargestonecave.shtml) | `00640f04042a9bf409109f451a5a80521c07c7e6d7ffa094a1004de3539e09d1` |
| [unova-dreamyard.shtml](https://www.serebii.net/pokearth/unova/dreamyard.shtml) | `f16f5b87aeefb00e2f572e5bb1cc831739248d7ad6bfb4189ada7e7f90f93c7c` |
| [unova-route4.shtml](https://www.serebii.net/pokearth/unova/route4.shtml) | `a039ea90fac42d1c4d398faf91677c41f4fa436f115e7f2a07ae62397d84484e` |

No local ROM build was run. The reconstruction’s matching-build statement is
not a local verification result. The partial Black reconstruction at
`bbb5cd501426c1ca5f16a9d09c8d91fd03a1c12b` does not supply reviewed map or
item definitions and is not used as evidence for guessed access records.
Source candidates and raw review files stay under ignored `output/`.
Only reviewed local JSON and local images ship with the app.

See [coverage](black-2-coverage.md), [forms](black-2-forms.md), and the [integration review](generation-5-progress-review.md).

## Published access guide pins

Reviewed on 27 October 2026. These pages give the exact access joins noted above.

| Guide | SHA-256 |
| --- | --- |
| [b2w2-chargestone-guide](https://www.gamerguides.com/pokemon-black-white-2/guide/main-walkthrough/to-gym-5/chargestone-cave) | `c37bd7ad3cc92ce0246f5089ed0cb0fbd0d8ac7797c4d1219d5ad79724f6d0be` |
| [b2w2-route15-guide](https://www.gamerguides.com/pokemon-black-white-2/guide/post-game-walkthrough/east-unova/route-15) | `f4c8db2bbb69a77ef5fc313a42f1661f3ae85a546f2536649a685069d93c50e8` |
