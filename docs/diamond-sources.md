# Pokémon Diamond sources

Reviewed on 2026-10-13. The assigned version is the North American Pokémon Diamond Version ROM. The primary source is the pret Diamond/Pearl decompilation at commit `b623abef1b4dfe204ca50aab42447ac00c134290`. Its README identifies Diamond ROM SHA-1 `a46233d8b79a69ea87aa295a0efad5237d02841e` and calls the decompilation a work in progress. The checkout has the matching commit. This pin is immutable.

Repository: https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290

## Collection locators

The thirteen data collections have these source locators. `files/` records are binary archive members. The source does not expose all records as readable, named tables. A locator identifies the exact repository path; it does not by itself verify every contained record. Do not treat this source audit as complete data review.

| Planner collection | Diamond source locator(s) | Review status |
| --- | --- | --- |
| `game.json` | `README.md`; `include/constants/pokemon.h` | ROM/version confirmed; planner settings need further review. |
| `pokemon.json` profiles | `files/poketool/personal/`; `files/poketool/personal_pearl/`; `files/poketool/pokezukan/`; `include/constants/pokemon.h` | Diamond profile archive and Sinnoh order locator found. Archive records need extraction and manual comparison. Pearl archive is a contrast source only. |
| `type-chart.json` | `include/constants/pokemon.h`; `arm9/src/pokemon.c` | Type identifiers confirm Generation IV's 17 types. A complete damage matrix still needs review from the battle implementation. |
| `progression.json` | `files/fielddata/script/scr_seq_release/`; `files/fielddata/eventdata/zone_event_release/`; `include/constants/maps.h`; `include/constants/map_sections.h` | Story scripts are binary. Exact milestone gates have not been reviewed. |
| `bosses.json` | `files/poketool/trainer/trdata.json`; `arm9/src/trainer_data.c`; `include/constants/trainers.h` | Trainer JSON was read at the pinned commit. It contains all eight Diamond Gym Leader trainer parties, four Elite Four parties and Cynthia. Highest party levels are recorded in `data/games/diamond/bosses.json`. |
| `locations.json` | `include/constants/maps.h`; `include/constants/map_sections.h`; `files/fielddata/maptable/mapname.bin` | Map IDs are sourceable. Human-readable names need review. |
| `capabilities.json` | `include/constants/items.h`; `include/constants/maps.h`; `files/fielddata/script/scr_seq_release/`; `arm9/src/encounter.c`; `arm9/src/scrcmd_items.c` | Candidate action and gate locators found; no capability record is reviewed. |
| `items.json` | `include/constants/items.h`; `files/fielddata/eventdata/zone_event_release/`; `files/fielddata/script/scr_seq_release/` | Item IDs exist. Location, quantity, and event gates need per-record review. |
| `choices.json` | `files/fielddata/eventdata/zone_event_release/`; `files/fielddata/script/scr_seq_release/`; `include/constants/maps.h` | Starter, fossil, and version choices need script review. |
| `sources.json` | `files/fielddata/encountdata/d_enc_data/`; `files/fielddata/encountdata/p_enc_data/`; `files/fielddata/eventdata/zone_event_release/`; `files/fielddata/pokemon_trade/fld_trade/` | Diamond wild archive and event/trade locators found. Pearl encounter archive is a contrast source. Rates, levels, restrictions and gates are not fully transcribed. |
| `breeding-rules.json` | `arm9/src/daycare.c`; `arm9/src/scrcmd_daycare.c`; `include/daycare.h`; `include/constants/pokemon.h`; `files/poketool/personal/` | Day Care implementation and egg-group IDs found. Incense item and species rules need review. |
| `evolutions.json` | `files/poketool/personal/`; `arm9/src/use_item_on_mon.c`; `arm9/src/pokemon.c`; `include/constants/pokemon.h` | Evolution data is embedded in personal records. Full trigger and condition review remains open. |
| `exclusions.json` | `files/poketool/personal/`; `files/fielddata/encountdata/d_enc_data/`; `files/fielddata/eventdata/zone_event_release/`; `files/fielddata/pokemon_trade/fld_trade/` | No species-by-species exclusion review is complete. Missing encounter records are not exclusions. |

All locators use the pinned repository root above. For archive paths, exact member IDs and their decoding are still an open source-review task. The repository README supports the repository identity, ROM hash and work-in-progress status: https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/README.md

## Proposed shared references

These entries need parent integration in `data/references.json`. This agent did not edit that shared file.

```json
[
  {
    "id": "diamond-source",
    "title": "Pokémon Diamond Version source reconstruction",
    "locator": "pret/pokediamond, North American Diamond ROM SHA-1 a46233d8b79a69ea87aa295a0efad5237d02841e",
    "url": "https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290",
    "revision": "b623abef1b4dfe204ca50aab42447ac00c134290"
  },
  {
    "id": "diamond-species",
    "title": "Diamond species, types, egg groups and Sinnoh Pokédex data",
    "locator": "files/poketool/personal/, files/poketool/pokezukan/, include/constants/pokemon.h",
    "url": "https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290",
    "revision": "b623abef1b4dfe204ca50aab42447ac00c134290"
  },
  {
    "id": "diamond-encounters",
    "title": "Diamond wild encounter archive",
    "locator": "files/fielddata/encountdata/d_enc_data/",
    "url": "https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290",
    "revision": "b623abef1b4dfe204ca50aab42447ac00c134290"
  },
  {
    "id": "diamond-events",
    "title": "Diamond field events, scripts and native trades",
    "locator": "files/fielddata/eventdata/zone_event_release/, files/fielddata/script/scr_seq_release/, files/fielddata/pokemon_trade/fld_trade/",
    "url": "https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290",
    "revision": "b623abef1b4dfe204ca50aab42447ac00c134290"
  },
  {
    "id": "diamond-trainers",
    "title": "Diamond trainer parties and trainer identifiers",
    "locator": "files/poketool/trainer/, arm9/src/trainer_data.c, include/constants/trainers.h",
    "url": "https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290",
    "revision": "b623abef1b4dfe204ca50aab42447ac00c134290"
  },
  {
    "id": "diamond-rules",
    "title": "Diamond daycare, evolution and battle type rules",
    "locator": "arm9/src/daycare.c, arm9/src/use_item_on_mon.c, arm9/src/pokemon.c, include/constants/pokemon.h",
    "url": "https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290",
    "revision": "b623abef1b4dfe204ca50aab42447ac00c134290"
  }
]
```

The reference URLs above use the pinned revision.

## Verified facts and model gaps

- Diamond is a Generation IV game. The checked-in constants define 17 active types and reserve `TYPE_MYSTERY` as a separate value. They predate Fairy. Keep Mystery out of the planner chart unless game battle data proves that it participates in type matchups.
- The parent has added shared identities through National Dex 721. Diamond-specific support and regional order still require review.
- The trainer collection includes readable `files/poketool/trainer/trdata.json` records, so the named Gym and League caps are verified. Encounter, story and map archives still need decoding and manual review.
- The current shared model has no species-form identity. Diamond's Unown letters, Burmy/Wormadam cloaks, Shellos/Gastrodon west/east forms, and Cherrim/Sky Forme records need an explicit reviewed representation. The model must state which are relevant to supported profiles and assets. Do not duplicate National Dex identity rows.
- The evolution schema has only level-up, item-use and player-trade triggers. Diamond also needs accurate handling for location/terrain-triggered evolutions (Magnezone, Leafeon, Glaceon, Probopass), move-known evolutions (Mime Jr./Bonsly, Tangela, Aipom, Yanma, Lickitung, Piloswine), gender-conditional branches (Kirlia/Gallade and Snorunt/Froslass), and party/Pokémon-specific conditions (Nincada/Ninjask/Shedinja is older; Mantyke requires Remoraid). Confirm each against the pinned version. Existing condition data cannot represent all these rules.
- Diamond has encounter distinctions beyond the current generic wild method and rate: time of day, dual-slot/Swarm/Poké Radar, Great Marsh binocular rotation, honey trees, fishing, and post-National-Dex upgrades. Confirm which apply to each path. Do not flatten different gates into a generic route source.
- Breeding requires Diamond-specific hatch level and the Gen IV incense rules for baby species. Egg-group data must include the full 493-species roster. Incense may change offspring outcomes for Azurill, Wynaut, Bonsly, Mime Jr., Happiny, Munchlax and Mantyke. The current rule shape can express held items, but the full output rules and item access remain unreviewed.
- Diamond version gates matter. Pearl-only wild exclusives and version-specific encounters must not enter Diamond records. External events remain outside native acquisition. NPC trades are supported by the model only when their received species and offered-species condition are reviewed; player trades remain unavailable.
- The current schema's wild methods do not name honey trees, Poké Radar, Great Marsh daily rotation, or dual-slot encounters. The data must not claim those as ordinary grass encounters without explicit, tested rule support.

Two Diamond data layers are now written: `bosses.json` records the eight Gym Leaders, four Elite Four members, and Champion; `pokemon.json` records all 493 base profiles. The type-effectiveness matrix and all other game collections remain open.


## Round 3 profile source review (2026-10-13)

The pinned PKHeX source at `641c26ba100225f3605e5a44b61b3b16e15a3774` exposes `PersonalTable.DP` and `PersonalInfo4.cs`. The latter defines a 0x2C-byte personal record, with types at 0x06/0x07, gender ratio at 0x10, Egg Groups at 0x14/0x15, and form metadata at 0x29/0x2A. These source files and all 493 individual entries were reviewed and cross-checked in Round 4. The profile list is in `data/games/diamond/pokemon.json`. See [Diamond form inventory](diamond-forms.md).

Add this reference to shared `data/references.json`:

```json
{
  "id": "diamond-pkhex-personal",
  "title": "PKHeX Generation IV personal data reference",
  "locator": "PKHeX.Core/PersonalInfo/PersonalTable.cs; PKHeX.Core/PersonalInfo/Info/PersonalInfo4.cs; embedded personal_dp table",
  "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
  "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774"
}
```

## Round 4: reviewed base profile fields (2026-10-13)

The profile review used the pinned Diamond reconstruction commit
`b623abef1b4dfe204ca50aab42447ac00c134290` and PKHeX commit
`641c26ba100225f3605e5a44b61b3b16e15a3774`. The reconstruction's
`files/poketool/personal/personal.json` has 501 `baseStats` records. Records
1–493 follow the shared National Dex identity order. PKHeX's
`PersonalTable.DP` binds to `personal_dp`; its 22,044 bytes contain 501 records
of 44 bytes. `PersonalInfo4.cs` defines types at 0x06/0x07, gender ratio at
0x10, and Egg Groups at 0x14/0x15.

A temporary read-only checker compared every one of the 493 species' type IDs,
gender ratio byte, and both Egg Group IDs between these sources. All matched.
The checker wrote explicit profile records after these matches. It normalizes
duplicate type and Egg Group values. The 493 profile records use no regional
Dex numbers because Diamond's Sinnoh order remains unverified.

Exact reviewed locators:

- Diamond: `files/poketool/personal/personal.json`, `baseStats[1..493]`;
  `include/constants/pokemon.h`, type and Egg Group ID constants.
- PKHeX: `PKHeX.Core/PersonalInfo/PersonalTable.cs`, `PersonalTable.DP` and
  `GetTable("dp")`; `PKHeX.Core/Resources/byte/personal/personal_dp`;
  `PKHeX.Core/PersonalInfo/Info/PersonalInfo4.cs`, `SIZE = 0x2C` and field
  offsets above.

The review checker is in the ignored source-review workspace at
`output/source-review/diamond/review_profiles.py`. It is not shipped or used at
runtime. The PKHeX source clone and raw table are also under
`output/source-review/`.

Proposed shared references for parent integration:

```json
[
  {
    "id": "diamond-species",
    "title": "Pokémon Diamond species personal records",
    "locator": "files/poketool/personal/personal.json baseStats[1..493]; include/constants/pokemon.h type and Egg Group IDs",
    "url": "https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290",
    "revision": "b623abef1b4dfe204ca50aab42447ac00c134290"
  },
  {
    "id": "diamond-pkhex-personal",
    "title": "PKHeX Generation IV Diamond/Pearl personal table",
    "locator": "PKHeX.Core/PersonalInfo/PersonalTable.cs PersonalTable.DP; PKHeX.Core/Resources/byte/personal/personal_dp; PKHeX.Core/PersonalInfo/Info/PersonalInfo4.cs",
    "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774"
  }
]
```
## Parent chart review, 13 October 2026

The base profile collection now passes the separate source comparison. The
17-type chart passes all 289 interactions against two pinned Generation IV
battle tables. These are the Platinum and HeartGold/SoulSilver implementations.
The chart keeps Steel resistance to Ghost and Dark. This check does not review
Diamond encounter or story data.

```json
{"id":"diamond-type-chart-code-review","title":"Generation IV battle type chart source review","locator":"src/battle/overlay_12_0224E4FC.c, sTypeEffectiveness; compare all 289 pairs with pret/pokeplatinum fe1ea418a7364c93daf0d07ae55e195452d8803c src/battle/battle_lib.c; unspecified pairs are neutral","url":"https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src/battle/overlay_12_0224E4FC.c","revision":"53dded53802b237d39fabfd8ee396fe9cdc8aa3e"}
```
