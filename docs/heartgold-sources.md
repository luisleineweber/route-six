# HeartGold source review

Review date: 2026-10-13. Scope: English Pokémon HeartGold, Johto and Kanto.
Source revision: `53dded53802b237d39fabfd8ee396fe9cdc8aa3e`.
The local read-only checkout is `output/source-review/heartgold/`.

## Reviewed primary source

[PRET HeartGold/SoulSilver](https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e)
is a WIP disassembly. Its README identifies the US HeartGold ROM and checksum.
The paths below are exact repository paths at the pinned revision. The source
contains both HeartGold and SoulSilver material. Records still need version
checks where a path contains both versions.

| Collection | Exact source locators | Finding / status |
| --- | --- | --- |
| Game metadata and scope | `README.md`; `include/constants/species.h`; `files/fielddata/maptable/` | README identifies US HeartGold; separate version scope needs careful review. |
| Profiles | `include/constants/species.h`; `files/poketool/personal/personal.json`; `files/poketool/personal/evo.json` | Species data include types, gender ratios, egg groups, and forms. |
| Type chart | `src/battle/overlay_12_0224E4FC.c`, `sTypeEffectiveness` table | Reviewed sparse chart. The game uses 17 types; neutral cells are implicit. |
| Progression | `files/fielddata/script/`; `files/fielddata/eventdata/`; `files/msgdata/scenario/` | Exact script data locations. Event-to-milestone mapping remains to review. |
| Bosses | `files/poketool/trainer/trainers.json`; `include/constants/trainer_class.h` | First-run parties reviewed for eight leaders and League. Rematches are separate rows. |
| Locations | `files/fielddata/maptable/`; `files/fielddata/mapmatrix/`; `src/data/map_headers.h` | Map records and region mapping. Full location catalogue remains open. |
| Capabilities | `files/fielddata/script/`; `files/fielddata/eventdata/`; `src/field/encounter_check.c` | Source mechanics exist; badge/HM/event access mapping remains open. |
| Items | `files/itemtool/itemdata/`; `include/constants/items.h` | Exact item data and constants paths. Item access records remain open. |
| Choices | `files/application/choose_starter/`; `files/fielddata/script/`; `files/fielddata/eventdata/` | Starter and scripted choices. Full mutually-exclusive choice inventory remains open. |
| Acquisition sources | `files/fielddata/encountdata/`; `files/fielddata/script/`; `files/fielddata/eventdata/` | Wild tables and event paths. Complete version-specific source review remains open. |
| Breeding rules | `src/get_egg.c`; `src/daycare.c`; `files/poketool/personal/personal.json`; `files/poketool/personal/evo.json` | Egg generation creates the offspring at level 1 (`src/get_egg.c`, `CreateMon(..., 1, ...)`). Special offspring and incense rules remain open. |
| Evolutions | `files/poketool/personal/evo.json`; `src/use_item_on_mon.c`; `src/pokemon.c` | Evolution table and engine paths. Unsupported conditions need domain work. |
| Exclusions | `include/constants/species.h`; `files/poketool/personal/personal.json`; `files/fielddata/encountdata/`; scripts and events above | Requires complete supported-species versus native acquisition comparison. No exclusions authored. |

## Proposed shared reference

Parent owns `data/references.json`. Add this reference before validating these
records:

```json
[
  {
    "id": "heartgold-source",
    "title": "Pokémon HeartGold source reconstruction",
    "url": "https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e",
    "revision": "53dded53802b237d39fabfd8ee396fe9cdc8aa3e",
    "locator": "README.md; include/constants/species.h; src/battle/overlay_12_0224E4FC.c; files/poketool/trainer/trainers.json; files/poketool/personal/personal.json; files/poketool/personal/evo.json; src/get_egg.c; files/fielddata/{script,eventdata,encountdata}; files/itemtool/itemdata"
  }
]
```

## Verified findings

### Base profile layer (reviewed 2026-10-13)

The profile list uses indices 1–493 of `files/poketool/personal/personal.json`
(`baseStats` array). `include/constants/species.h` confirms that these indices
are the 493 National Dex identities. Types, gender ratio, and Egg Groups come
from each record. `include/constants/pokemon.h` defines the gender ratio
sentinel (`GENDER_RATIO`) and the Egg Group constants. Duplicate types and
Egg Groups in personal records are collapsed because profile arrays represent
distinct values. A ratio from 0 to 1 permits both sexes except at the endpoints;
values above 1 encode genderless Pokémon. All 493 records reference the local
National Dex numbered sprite.

HeartGold has Johto and Kanto regional Pokédex namespaces. The current profile
schema permits one flat unique sequence, so this draft omits `regionalDex` for
all profiles. It does not flatten the two official number sequences.

Use this proposed shared reference for the profiles:

```json
{
  "id": "heartgold-source",
  "title": "Pokémon HeartGold source reconstruction",
  "url": "https://github.com/pret/pokeheartgold/tree/53dded53802b237d39fabfd8ee396fe9cdc8aa3e",
  "revision": "53dded53802b237d39fabfd8ee396fe9cdc8aa3e",
  "locator": "files/poketool/personal/personal.json:baseStats[1..493]; include/constants/species.h; include/constants/pokemon.h:GENDER_RATIO and Egg Group constants"
}
```

- HeartGold is a Generation IV game in Johto and Kanto. The repository README
  names the US HeartGold build and gives its SHA-1 checksum.
- The battle source has an explicit sparse type-effectiveness table. Its type
  constants cover the 17 types used by the current model. The chart file is
  derived from that table; unspecified pairs are neutral.
- First-run badge levels from the trainer parties are Falkner 13, Bugsy 17,
  Whitney 19, Morty 25, Chuck 31, Jasmine 35, Pryce 34, and Clair 41.
- First-run League caps are Will 42, Koga 44, Bruno 46, Karen 47, and Lance 50.
  The JSON has higher-level rematch teams. This data layer uses the first row.
- `src/get_egg.c` creates daycare eggs at level 1.
- `files/poketool/personal/personal.json` has form-related personal records;
  event scripts also accept form values. Current model has no form identity.

## Open domain and data gaps

1. Add shared species identities and local assets for National Dex 387–493.
   Existing profile IDs stop at 386.
2. Add a shared form model. Assess Unown, Deoxys, Burmy, Wormadam, Mothim,
   Shellos, Gastrodon, Rotom, Giratina, Shaymin, and Arceus. Do not duplicate
   National Dex identities.
3. Extend evolution triggers for location, move-known, time, friendship,
   gender, and held-item trade requirements where HeartGold records require
   them. Check each edge in `evo.json` before authoring.
4. Extend encounter methods for HeartGold mechanisms when needed. Review
   headbutt, radio, swarm, Bug-Catching Contest, Safari Zone, Pokéwalker,
   roaming, and time/day-dependent encounters. Do not encode clock gates as
   generic wild sources.
5. Decide supported scope for daily events, phone gifts, Safari Zone block
   placement/aging, Pokéwalker, roaming, and the full Kanto postgame.
6. Review special breeding outcomes, incense, gender-specific offspring, and
   Ditto behavior before writing breeding rules.
7. Review all thirteen collections against HeartGold-specific evidence. The
   exact paths are listed above; several datasets still need full record review.

The compatible first layer is in `data/games/heartgold/`. It is incomplete and
must remain disabled. No shared files were changed.
