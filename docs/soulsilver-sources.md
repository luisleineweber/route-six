# SoulSilver source review

Checked on 13 October 2026. This review uses the `pret/pokeheartgold` source tree. The tree covers the shared HeartGold/SoulSilver engine and data. Treat it as a source reconstruction, not an independently verified SoulSilver-only dump. Keep version-specific records separate and confirm every difference before authoring it.

Pinned revision: `53dded53802b237d39fabfd8ee396fe9cdc8aa3e` (`master` at review time).

Repository: [pret/pokeheartgold](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e)

## Source locators by project collection

All links below pin the same revision. The source tree establishes data ownership and implementation locations. Some collections require joining multiple game files and event scripts. Review the SoulSilver branch and scripts before converting any row into a planner record.

| Planner collection | Primary source locator | Review use |
| --- | --- | --- |
| `game.json` | [`include/constants`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/include/constants) and version checks in [`src`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src) | Confirm version ID, region scope, and SoulSilver-specific behavior. |
| Game `pokemon.json` profiles | [`files/poketool/personal/personal.json`](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/personal/personal.json), [`files/poketool/personal/personal.json.txt`](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/personal/personal.json.txt), and [`include/constants/pokemon.h`](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/include/constants/pokemon.h) | Types, gender ratios, egg groups, regional species data. Also requires new shared identities and local image assets. |
| `type-chart.json` | [`src/battle/battle_script.c`](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src/battle/battle_script.c) and battle type-effectiveness tables under [`src/data`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src/data) | Verify the complete Gen IV chart and exact type ordering. No Fairy type exists in Gen IV. |
| `progression.json` | [`fielddata/script/scr_seq`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/fielddata/script/scr_seq) | Join map events, flags, and prerequisite events for Johto and Kanto access. |
| `bosses.json` | [`files/poketool/trainer/trainers.json`](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/trainer/trainers.json), trainer name/data text files in [`files/poketool/trainer`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/trainer) | Trainer parties must be joined to story events and Gym/League order. |
| `locations.json` | [`files/fielddata/maptable/mapname.bin`](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/fielddata/maptable/mapname.bin) and [`files/fielddata`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/fielddata) | Review map IDs/names, including routes, buildings, dungeons, and Kanto. |
| `capabilities.json` | [`fielddata/script/scr_seq`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/fielddata/script/scr_seq) plus field move/HM logic under [`src/field`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src/field) | Derive HMs, fishing/headbutt, Bug-Catching Contest, Pokéathlon, and story actions from gates. |
| `items.json` | Item constants and item data under [`include/constants`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/include/constants) and [`files/itemtool`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/itemtool) | Identify evolution items and access requirements. |
| `choices.json` | Version and player-choice event branches in [`fielddata/script/scr_seq`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/fielddata/script/scr_seq) | Starter choice and mutually exclusive gifts must be explicit. |
| `sources.json` | Wild encounter data in [`fielddata/encountdata`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/fielddata), event scripts above, and fishing/headbutt/contest systems in [`src`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src) | Source tables require encounter method, time, radio/swarm, safari/contest, and event gates. Confirm SoulSilver version for each row. |
| `breeding-rules.json` | Day-Care and egg code under [`src/pokemon`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src/pokemon) and [`poketool/personal`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/personal) | Review egg groups, offspring exceptions, incense, and Manaphy. |
| `evolutions.json` | [`files/poketool/personal/evo.json`](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/personal/evo.json) and [`files/poketool/personal/evo.json.txt`](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/personal/evo.json.txt) | Gen IV adds location, move-known, time, gender, and item evolution conditions beyond the current trigger set. |
| `exclusions.json` | SoulSilver version branches and event/encounter scripts in [`fielddata/script/scr_seq`](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/fielddata/script/scr_seq) | Only reviewed native-scope exclusions. External trades and distributions remain outside scope. |

## Verified findings

- The pinned repository identifies itself as the HeartGold/SoulSilver decompilation. Its data is shared across versions in many places. Version-specific differences need explicit review.
- The source has personal species records and a separate evolution table. It also has trainer data and field script sources. The thirteen planner collections therefore need different source joins; no single table establishes game access.
- The current project has only 386 shared identities through Generation III. SoulSilver needs identities for later species, including cross-generation evolutions. Those identities and local sprites are owned by shared files that this task may not edit.
- SoulSilver needs the National Dex species through #493. The current profile/type model can express ordinary species, but it cannot represent alternate forms as distinct game-profile variants. Forms include Unown, Deoxys, Burmy/Wormadam, Shellos/Gastrodon, Rotom, Giratina, Shaymin, Arceus, and other form-capable species where the game exposes forms. Assess whether the planner needs each form before adding form support.
- The current evolution schema does not express friendship, time of day, location, learned move, party species, gender-specific branch, or trade while holding an item as complete trigger logic. These are used by Generation IV evolution rules. Do not encode these as generic level-ups or exclusions.
- The current source model does not express time-of-day encounter pools, radio, swarms, Pokéwalker, Pokéwalker-exclusive transfer, Safari Zone block placement/time, Bug-Catching Contest selection, or Pokéathlon prizes. Confirm which are in scope and add tested source kinds/capabilities before recording them.
- Gen IV has no Fairy type. It uses the 17 types already present in Emerald, but its chart must be checked against Gen IV rules because Steel and Dark defenses differ from Generation VI onward.
- The current breeding rule shape may not represent special offspring constraints, including Manaphy producing Phione and incense-dependent baby species. Verify the full list in the pinned data before authoring offspring rules.
- Story access spans Johto and post-League Kanto. The current milestone/capability model can represent story gates in principle, but a complete route/event dependency graph needs review before creating milestones.

## Proposed shared references

Add these proposed entries to `data/references.json` in a parent-owned change after review:

```json
[
  {
    "id": "soulsilver-pret-2026-10-13",
    "title": "pret/pokeheartgold: HeartGold and SoulSilver decompilation",
    "url": "https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e",
    "revision": "53dded53802b237d39fabfd8ee396fe9cdc8aa3e",
    "locator": "src/battle/overlay_12_0224E4FC.c sTypeEffectiveness; include/constants/pokemon.h type IDs; files/poketool/personal/personal.json records 1–493; include/struct_defs/personal_narc_structs.h struct BaseStats; files/application/zukanlist/zkn_data/zukan_data.json sorting/dex_order/johto species order; species forms reviewed against constants and form handling"
  }
]
```

The existing reference schema may require field changes. The parent must merge and validate this entry.





## SoulSilver records authored in round 2

Reviewed the complete Gen IV type effectiveness table in `src/battle/overlay_12_0224E4FC.c` at the pinned revision. The table lists every non-neutral type pair, including immunities. The type IDs follow `include/constants/pokemon.h`; convert those IDs to the planner's canonical order in `type-chart.json`. The chart has 17 types and no Fairy type. SoulSilver's chart differs from Generation VI's chart because Steel still resists Ghost and Dark, and Water and Electric attacks deal neutral damage to Steel.

Authored `data/games/soulsilver/type-chart.json` only. It uses a complete 17×17 matrix, the game's pinned review reference ID, and review date 2026-10-13. This record does not claim species or acquisition coverage.

Not yet authored: game metadata, hatch level, milestones, bosses, or other game collections. The source file `include/constants/daycare.h` defines compatibility and daycare values, but does not establish hatch level. Trainer data provides large indexed tables, but linking trainer IDs to SoulSilver-specific Gym and story events needs an event review. Do not treat those as covered.

## Round 3 base profile review

Checked the pinned local source checkout at revision `53dded53802b237d39fabfd8ee396fe9cdc8aa3e`. The profile fields come from `files/poketool/personal/personal.json` records 1–493. `include/struct_defs/personal_narc_structs.h` defines the type, gender ratio, and Egg Group fields. The matching renderer is `files/poketool/personal/personal.json.txt`. `include/constants/species.h` aligns these records with National Dex identities and places form records after Arceus.

The source maps gender ratio 0 to male-only, 1 to female-only, 2 to genderless, and intermediate ratios to both genders. Duplicate type and Egg Group values are collapsed because planner profiles use unique value lists. The local image path is `/pokemon/<National Dex>.png`.

`include/constants/johto_dex.h` sets `J_NUM_SPECIES` to 256. The exact species order is in `files/application/zukanlist/zkn_data/zukan_data.json`, under `sorting` → `dex_order` → `johto` → `mons`. The 256-entry list maps directly to regional numbers 1–256. See [the SoulSilver form review](soulsilver-forms.md) for native forms and the shared form model gap.

Proposed shared reference ID remains `soulsilver-pret-2026-10-13`. The parent must add it to `data/references.json` before registering or assembling SoulSilver. The proposed reference and pinned revision are in the JSON block above.
## Parent first-League boss review, 13 October 2026

The base profile collection now passes the separate source comparison.
`bosses.json` contains the eight Johto Gym Leaders and the first League caps.
The reviewed trainer indexes are Falkner 20, Bugsy 21, Whitney 30, Morty 31,
Chuck 34, Jasmine 33, Pryce 32, Clair 35, Will 245, Koga 247, Bruno 418,
Karen 246, and Lance 244. Each cap matches the maximum party level at that
index. Kanto, Red, rematches, and other story fights remain open.

```json
{"id":"soulsilver-bosses","title":"SoulSilver first Johto Gym and League trainer parties","locator":"files/poketool/trainer/trainers.json trainers[20,21,30,31,34,33,32,35,245,247,418,246,244].party[].level; first Johto Gym and League battles; badge order and trainer class identify the leaders","url":"https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/trainer/trainers.json","revision":"53dded53802b237d39fabfd8ee396fe9cdc8aa3e"}
```
