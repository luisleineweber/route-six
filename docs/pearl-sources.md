# Pokémon Pearl source review

Game: English Pokémon Pearl, Nintendo DS. Review date: 13 October 2026.

The primary source reconstruction is `pret/pokediamond`, pinned to
`b623abef1b4dfe204ca50aab42447ac00c134290`. Its README says it builds both
Diamond and Pearl. Its INSTALL.md gives a separate `make pearl` target. The
repository tree was checked at the pinned revision. The source contains binary
NARC archives under `files/` and executable code under `arm9/src/`. Do not
infer archive member IDs or table contents from archive directory names.

The repository identity and Pearl build target were checked in the
[primary repository README](https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/README.md)
and [build instructions](https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/INSTALL.md).

## Proposed shared references

```json
[
  {"id":"pearl-game","title":"Pokémon Diamond/Pearl source reconstruction and Pearl target","locator":"README.md; INSTALL.md; config.mk","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-profiles","title":"Pearl species parameters and Pokédex ordering","locator":"files/application/zukanlist/zkn_data/zukan_data/narc_0000.bin through narc_0057.bin; arm9/src/pokedex.c; exact species-parameter archive remains to be identified","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-type-chart","title":"Pearl battle type effectiveness","locator":"arm9 overlays and files/battle contain battle code and binary battle scripts; the effectiveness table and its encoded values are not identified in this checkout","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290/arm9","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-progression","title":"Pearl story flags and event gates","locator":"files/fielddata/script/; arm9/src/script.c; exact event files remain to be mapped","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-bosses","title":"Pearl Gym and League trainer parties","locator":"files/poketool/trainer/trdata.json, entries #246, #315-320, #250, #261-264, and #267; include/constants/badge.h assigns Gym badge order; arm9/src/trainer_data.c reads NARC_POKETOOL_TRAINER_TRDATA (NARC 57) and TRPOKE (NARC 58), while include/filesystem.h assigns these archive IDs","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290/files/poketool/trainer","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-locations","title":"Pearl maps and region access","locator":"files/fielddata/maptable/; files/fielddata/mapmatrix/; files/fielddata/areadata/; arm9/src/map_header.c; arm9/src/map_matrix.c","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-capabilities","title":"Pearl field moves, badges, and overworld gates","locator":"arm9/src/field_move.c; arm9/src/field_move_environment.c; files/fielddata/script/; exact scripts and badge checks remain to be identified","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-items","title":"Pearl items, shops, fossils, and item gates","locator":"arm9/src/itemtool.c; arm9/src/scrcmd_items.c; files/fielddata/script/; item and mart archive members remain to be identified","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-choices","title":"Pearl starter, fossil, gift, and one-time choices","locator":"files/fielddata/script/; arm9/src/scrcmd_fossils.c; event script paths remain to be identified","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-encounters","title":"Pearl wild encounter tables and methods","locator":"files/fielddata/encountdata/; arm9/src/encounter.c; identify Pearl-specific NARC and method data","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290/files/fielddata/encountdata","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-evolutions","title":"Pearl evolution triggers and conditions","locator":"arm9/src/use_item_on_mon.c; arm9/src/pokemon.c; exact evolution-parameter archive remains to be identified","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-breeding","title":"Pearl Day Care compatibility, offspring, and hatch rules","locator":"arm9/src/daycare.c; arm9/src/scrcmd_daycare.c; inspect Pearl egg data and rules","url":"https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/arm9/src/daycare.c","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-exclusions","title":"Pearl version, National Dex, and external event boundaries","locator":"config.mk; README.md; files/fielddata/encountdata/d_enc_data/; Pearl event scripts and version checks","url":"https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"}
]
```

## Verified first data layer

`data/games/pearl/bosses.json` records all eight Sinnoh Gym Leaders and the
Elite Four and Champion. The source reconstruction stores trainer records as
`files/poketool/trainer/trdata.json`. Its entries identify trainer index,
class, party species, and party levels. `arm9/src/trainer_data.c` reads the
matching trainer party from NARC `TRDATA` and `TRPOKE`; the IDs are 57 and 58
in `include/filesystem.h`. These entries establish each listed highest level.
The trainer-class names establish each Gym Leader specialty. The order in
`include/constants/badge.h` establishes badge order. Trainer indices 261-264
and 267 establish the Elite Four and Champion parties. Review event scripts
before authoring progression gates.

## Review status

The revision and repository identity are verified. Boss party records now have
exact source entries. This source map still does not establish all thirteen
collections. Resolve all remaining archive locators before authoring those
records.

## Verified model gaps

- Pearl includes 493 species. The shared catalogue has 386 identities. Add
  stable identities with National Dex numbers 387–493 before profile or
  evolution records can refer to those species.
- Pearl has form-specific species, including East and West Sea Shellos and
  Gastrodon. The current model cannot represent forms in profiles, sources,
  evolutions, team slots, or images. Add a shared form collection and explicit
  form references. Do not duplicate a National Dex identity.
- Gen IV adds evolution triggers or conditions beyond the current model,
  including a move known, a location, or a party species. Add tested explicit
  trigger and condition tags before authoring those rules.
- Review Poké Radar, Honey Trees, dual-slot encounters, swarms, fishing, Surf,
  and roaming Mesprit as separate encounter rules where applicable. Do not
  convert them to ordinary wild encounters without source evidence.
- Pearl predates Fairy and uses the 17 types available in Pearl. Its chart must
  preserve Gen IV damage-chart changes from Gen III.
- Incense breeding can produce baby species. Review parent and held-item
  requirements for each such offspring.
- Review National Pokédex unlocks, post-League access, roaming Mesprit release,
  legendary events, version limits, and external distribution limits as actual
  gates. Do not use exclusions to hide unfinished records.

These gaps block a complete Pearl dataset under the current shared model. The
parent should add identities and tested form, evolution, and encounter support.
Then continue Pearl review and authoring. Keep Pearl disabled.


## Profile source follow-up

The Pearl profile collection is not authored. The reconstruction keeps the Pearl personal records in a selected binary NARC. This checkout and the online source view do not expose reviewed plain-text values. Identify the exact Pearl archive selection and record ordering before profile work. The pinned PKHeX layout below can decode values, but it is not itself a source for Pearl's profile values.

Proposed shared reference:

```json
{"id":"pearl-personal-record-layout","title":"PKHeX Generation IV personal record layout","locator":"PKHeX.Core/PersonalInfo/Info/PersonalInfo4.cs: record size 0x2C; types 0x06-0x07; gender 0x10; Egg Groups 0x14-0x15; form metadata 0x29-0x2A. Decoder definition only; Pearl values must come from the pinned Pearl personal NARC.","url":"https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Info/PersonalInfo4.cs","revision":"641c26ba100225f3605e5a44b61b3b16e15a3774"}
```
## Archive selection resolved (13 October 2026)

The pinned reconstruction's `filesystem.mk` selects `poketool/personal_pearl/personal.narc` when `GAME_VERSION=PEARL`. This resolves the archive selection. The repository stores this as a binary NARC, not as reviewed per-species text. This review did not obtain or decode the archive members. It did not verify the member count or the mapping from member index to National Dex species. No profile values are written.

Do not use Platinum's profiles until each type, gender ratio, and Egg Group has been compared with decoded Pearl records. The PKHeX Gen IV record layout is a decoder reference. It does not prove Pearl values.

Verified locator: `filesystem.mk`, `NITROFS_FILES` Pearl substitution and `O2NARC_TARGETS`. Pinned URL: https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/filesystem.mk .

Proposed shared reference update:

```json
{"id":"pearl-game","locator":"filesystem.mk: NITROFS_FILES maps poketool/personal/personal.narc to poketool/personal_pearl/personal.narc when GAME_VERSION=PEARL; O2NARC_TARGETS names both source archives"}
```

## Corrected profile and type-chart review (13 October 2026)

The earlier binary-only conclusion was wrong. The pinned repository has the complete plain-text Pearl source at `files/poketool/personal_pearl/personal.json`. Its `baseStats` array has 501 rows: row 0 is `NONE`; rows 1 through 493 map in order to National Dex numbers 1 through 493. The reviewed local mirror is `output/source-review/pearl/files/poketool/personal_pearl/personal.json`. Its record fields `types`, `genderRatio`, and `eggGroups` establish the profile values. The source enum uses `genderRatio` 2.0 for genderless, 0.0 for male-only, 1.0 for female-only, and intermediate values for both sexes.

A direct comparison checked all 493 records against Pearl's shared identity list and Diamond's reviewed profile collection. Every Pearl source type, gender result, and Egg Group matches Diamond. This comparison confirms the same base profile layer for Pearl. It does not establish forms, encounter availability, or Pearl acquisition paths. The generated records use only Pearl reference IDs and omit regional Dex numbers while the local-number model cannot represent Pearl's split Sinnoh and National Dex scopes.

The type chart has 17 types and follows the Generation II–V chart. This chart applies to Diamond and Pearl. It retains Steel resistance to Ghost and Dark. The complete 17-by-17 matrix is in `data/games/pearl/type-chart.json` and must use the proposed `pearl-type-chart` reference below.

## Exact source locators for the thirteen collections

These locators identify source evidence. They do not mean all records in the collection are reviewed.

| Collection | Exact pinned locator | Review state |
| --- | --- | --- |
| Game settings | `filesystem.mk` (Pearl archive selection); `INSTALL.md` (`make pearl`) | Game identity verified; settings still open |
| Profiles | `files/poketool/personal_pearl/personal.json: baseStats[1..493]` | All base profiles reviewed |
| Type chart | Generation II–V chart, full 17-type matrix | Reviewed; first-party encoded table not isolated |
| Progression | `files/fielddata/script/` and map script assignments; `arm9/src/script.c` | Exact event-to-milestone map pending |
| Bosses | `files/poketool/trainer/trdata.json`; badge order `include/constants/badge.h` | Gym/League party caps reviewed |
| Locations | `files/fielddata/maptable/`, `mapmatrix/`, `areadata/`; map loading `arm9/src/map_header.c`, `map_matrix.c` | Route coverage pending |
| Capabilities | `arm9/src/field_move.c`, `field_move_environment.c`; event scripts for badge gates | Field-move implementation located; gate review pending |
| Items | `arm9/src/itemtool.c`, `scrcmd_items.c`; item records under `files/itemtool/` | Item source paths pending |
| Choices | Event scripts under `files/fielddata/script/`; fossil handling `arm9/src/scrcmd_fossils.c` | Starter/fossil/gift choice review pending |
| Sources | `files/fielddata/encountdata/`; encounter reader `arm9/src/encounter.c` | Individual Pearl encounter tables and methods pending |
| Breeding rules | `arm9/src/daycare.c`, `scrcmd_daycare.c`; personal Egg Groups in Pearl table | Compatibility and incense offspring pending |
| Evolutions | `arm9/src/use_item_on_mon.c`, `pokemon.c`; Pearl evolution parameter archive | Archive mapping and new trigger rules pending |
| Exclusions | `filesystem.mk`, Pearl encounter tables, event scripts and version checks | Native availability and event boundaries pending |

## Proposed shared references

```json
[
  {"id":"pearl-personal-data","title":"Pokémon Pearl species types, gender ratios, and Egg Groups","locator":"files/poketool/personal_pearl/personal.json: baseStats[1..493], fields species, types, genderRatio, eggGroups; row index matches National Dex. genderRatio 2.0 is genderless, 0.0 male-only, 1.0 female-only, intermediate values both.","url":"https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/files/poketool/personal_pearl/personal.json","revision":"b623abef1b4dfe204ca50aab42447ac00c134290"},
  {"id":"pearl-type-chart","title":"Generation IV type effectiveness used by Pokémon Pearl","locator":"Generations II–V chart, all 17 types and 289 matchups; Steel retains Ghost and Dark resistances.","url":"https://pokemondb.net/type/old","revision":"Reviewed 2026-10-13; unversioned page"}
]
```
