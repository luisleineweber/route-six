# Pokemon X source review

## Current integration: 21 October 2026

The active records use pinned personal, encounter, evolution, breeding, and sprite evidence. Separate story, item, fixed-source, and full exclusion reviews are integrated. Each record keeps its review date and source IDs. PKHeX legality evidence and community story guides remain distinct. The exact source limits are in the shared X and Y review.

See [the X and Y Progress Planner review](xy-progress-review.md) for the active scope, source conflicts, and checks. The dated notes below are source history. Earlier pending states and model gaps are superseded by this integration.

## Earlier review history

Review date: 2026-10-13. Scope: Pokemon X, including ordinary native postgame access. Exclude external distributions, transfers, player trades, and connected-service rewards. Pokemon Y remains separate. This is a reviewed partial data layer.

## Sources reviewed

| Source | Revision | Locators and use | Review state |
| --- | --- | --- | --- |
| [PKHeX](https://github.com/kwsch/PKHeX) | `641c26ba100225f3605e5a44b61b3b16e15a3774` | `PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6XY.cs`; `PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs`; `PKHeX.Core/Legality/Evolutions/EvolutionGroup/EvolutionGroup6.cs`. Repository paths confirmed from the pinned commit tree. These files identify X/Y acquisition, personal-data, and evolution locators. They do not provide Gym or League trainer parties or a full type matchup table. No encounter records were derived from them in this layer. | Commit and paths verified. |
| [Serebii: X/Y Gym Leaders](https://www.serebii.net/xy/gyms.shtml) | Live page, checked 2026-10-13 | Gym #1-8, lines 393-626; individual teams, level values, and specialty types. | First-run party records checked. |
| [Serebii: X/Y Elite Four](https://www.serebii.net/xy/elitefour.shtml) | Live page, checked 2026-10-13 | League access and order-independence at line 393; Malva starts line 394; Wikstrom, Drasna, Siebold and Diantha follow. First-run teams and levels are listed. | First-run League records checked. |
| [Serebii: Team Flare HQ](https://www.serebii.net/pokearth/kalos/teamflarehq.shtml) | Live page, checked 2026-10-13 | Final Xerneas room, lines 447-456: Lysandre's last story battle; level 53 Gyarados. Cross-check: [Serebii Team Flare](https://www.serebii.net/xy/teamflare.shtml), lines 412-425. | Final story trainer record checked. |
| [Pokemon Database: X/Y Gym Leaders and Elite Four](https://pokemondb.net/x-y/gymleaders-elitefour) | Live page, checked 2026-10-13 | Lines 63-83 identify the ordered Gym and League members. Lines 87-248 list all Gym party members and levels. Lines 252-388 list League members and levels. | Independent cross-check of parties and levels. |
| [Bulbapedia: Generation VI type chart](https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart) | Live page, checked 2026-10-13 | -Generation VI onward- chart and -Between Generations V and VI- change list. | Full matrix independently checked against Pokemon Database. |
| [Pokemon Database: type chart](https://pokemondb.net/type) | Live page, checked 2026-10-13 | Lines 80-124 state chart scope as X/Y and list the full matrix and Gen VI changes. | Full matrix independently checked against Bulbapedia. |
| [Pokemon Egg](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Egg) | Live page, checked 2026-10-13 | Generation IV onward hatch level is 1; X/Y support breeding. | Hatch level checked. Not written to `game.json` because no reviewed X checkpoint exists yet. |

## Authored records

`data/games/x/bosses.json` records the eight Gym leaders, four Elite Four members, Champion, and Lysandre's final Team Flare HQ battle. The model stores each first-run party's highest level, not the individual team. Serebii and Pokemon Database agree on the highest levels and specialties. The Elite Four order in the file follows first listing only; the player may challenge them in any order. Rematches are excluded. Lysandre's final Team Flare HQ fight has a maximum party level of 53.

`data/games/x/type-chart.json` stores all 18 attacking and defending types in the app's existing order, with Fairy appended. It starts from the reviewed Gen III matrix, adds Fairy, changes Ghost and Dark attacks against Steel to neutral, and adds Steel's super-effective matchup against Fairy. Independent Gen VI charts confirm the full resulting matrix.

The source set contains two specialist game guides rather than primary game code for trainer parties. PKHeX at the required pinned revision has no trainer party data. This is a source limit, not a claim that PKHeX covers the complete event data. No party move, ability, or item records were authored.

## Proposed shared references

The parent owns `data/references.json`. Proposed IDs used by the two authored records:

```json
[
  {"id":"x-bosses","title":"Pokemon X and Y Gym Leaders and Elite Four","url":"https://www.serebii.net/xy/gyms.shtml","revision":"checked 2026-10-13","locator":"Gym #1-8, lines 393-626; cross-check teams and levels at https://pokemondb.net/x-y/gymleaders-elitefour, lines 87-248"},
  {"id":"x-story-boss","title":"Pokemon X and Y Team Flare HQ","url":"https://www.serebii.net/pokearth/kalos/teamflarehq.shtml","revision":"checked 2026-10-13","locator":"Final Xerneas room, lines 447-456; cross-check https://www.serebii.net/xy/teamflare.shtml, lines 412-425"},
  {"id":"x-type-chart","title":"Generation VI type chart","url":"https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart","revision":"checked 2026-10-13","locator":"Generation VI onward table and Gen V-VI changes; cross-check complete current chart at https://pokemondb.net/type, lines 80-124"},
  {"id":"x-pkhex","title":"PKHeX","url":"https://github.com/kwsch/PKHeX","revision":"641c26ba100225f3605e5a44b61b3b16e15a3774","locator":"PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6XY.cs; PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs; PKHeX.Core/Legality/Evolutions/EvolutionGroup/EvolutionGroup6.cs"},
  {"id":"x-egg-level","title":"Pokemon Egg","url":"https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Egg","revision":"checked 2026-10-13","locator":"Generation IV onward hatch level; Pokemon X and Y breeding availability"}
]
```

## Verified findings

- The X Gym leaders have highest party levels 12, 25, 32, 34, 37, 42, 48, and 59. Their specialties are Bug, Rock, Fighting, Grass, Electric, Fairy, Psychic, and Ice.
- The League party maxima are level 65 for Malva, Wikstrom, Drasna, and Siebold; Diantha's highest level is 68. The player can choose the Elite Four order. Lysandre's final Team Flare HQ fight has maximum level 53.
- Generation VI has 18 types. It adds Fairy; Ghost and Dark attacks are neutral against Steel; Steel attacks are super effective against Fairy. Both chart references match the complete matrix written here.
- X eggs hatch at level 1.
- The pinned PKHeX tree contains the noted X/Y encounter, personal-data, and evolution source files. It does not contain trainer party tables.

## Open questions and model blockers

- The boss schema supports `kind: trainer`; this round records Lysandre's final battle only. Other important story fights still need review before the boss list is complete.
- `game.json` needs at least one real X milestone and checkpoint first. No checkpoint was inferred or written in this round. Hatch level 1 is verified but not yet stored.
- The proposed IDs `x-bosses`, `x-story-boss`, `x-type-chart`, `x-pkhex`, and `x-egg-level` are not in shared `data/references.json`; the parent must add the proposed records before semantic validation.
- The parent has added shared identities #1-721 and local species assets. Form identities and form-specific images still need the shared form layer.
- The parent has added the Fairy type asset and shared support. X remains disabled for its incomplete data and form model.
- The current model lacks form-aware profile/source/evolution/image links and does not distinguish Mega battle state from permanent evolution. Define those layers before encoding affected X acquisitions.
- Review X evolution rules for location, move-known, party, affection, and other Gen VI conditions. Keep Mega Evolution outside permanent evolution.
- Review encounter method and gate support for Horde encounters, Friend Safari, fishing, Rock Smash, and other X methods. Friend Safari depends on connected player data and remains outside the current native-offline scope unless a valid solo path is established.
- Review Day Care access, Egg Groups, incense-dependent baby outcomes, ordinary postgame areas, version exclusives, one-time choices, and story/content gates against X-specific source records. No encounter or exclusion list is authored.

## Base profile and form-layer source review (2026-10-13)

The required profile source is the pinned PKHeX X/Y personal table at `641c26ba100225f3605e5a44b61b3b16e15a3774`. `PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs` defines the record layout, including type bytes, gender ratio, Egg Group bytes, and form metadata. `PKHeX.Core/PersonalInfo/PersonalTable.cs` binds the X/Y table to the `personal_xy` embedded resource. The resource is loaded by name `personal_xy`; the repository class exposes the name, but the embedded resource path must not be stated more specifically without checking the project resource manifest. This is a binary table, so review each species record against the class field definitions before authoring the hand-maintained profile list.

The current profile schema has one `regionalDex` integer. X/Y has three regional number namespaces: Central, Coastal, and Mountain Kalos. Do not flatten their numbers. Omit all `regionalDex` fields in the X draft until the parent adds section-aware regional numbering.

See [x-forms.md](x-forms.md) for the initial native-form inventory, evidence, and proposed smallest shared model change. It confirms persistent Rotom appliance forms with different types; cosmetic Vivillon, Flabebe-line, and Furfrou forms; and battle-only Xerneas/Aegislash states. This is a minimum inventory and still needs a complete source review.

Proposed shared references for the profile and form layer:

```json
[
  {"id":"x-personal-data","title":"PKHeX X/Y personal data","url":"https://github.com/kwsch/PKHeX","revision":"641c26ba100225f3605e5a44b61b3b16e15a3774","locator":"PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs; PKHeX.Core/PersonalInfo/PersonalTable.cs; embedded resource named personal_xy; X/Y records 1-721"},
  {"id":"x-forms","title":"Pokemon X and Y form changes","url":"https://www.serebii.net/xy/forms.shtml","revision":"checked 2026-10-13","locator":"Rotom, Vivillon, Flabebe/Floette, and Furfrou form behavior"},
  {"id":"x-kalos-dex","title":"Pokemon X/Y Kalos Pokedex","url":"https://pokemondb.net/pokedex/game/x-y","revision":"checked 2026-10-13","locator":"Central, Coastal, and Mountain Kalos Dex sections; separate local numbers"}
]
```


## Parent base-profile completion, 13 October 2026

The fifth agent round returned a Y profile check for the X task. That check
confirmed the shared X/Y source values. The parent then wrote the X base
profiles with X reference IDs. A separate read-only check compared all 721
records with `personal_xy` at the pinned PKHeX revision. Types, genders, Egg
Groups, and local image paths all match. The source file has 799 records of
64 bytes. Base species use indexes 1 through 721.

The base profile layer is complete. Kalos numbering, forms, encounters, story
access, items, choices, evolutions, and breeding remain open. The three Kalos
Dex sections need their own names and number sequences. Other games can use
one regional sequence followed by National Dex order. Sinnoh versus National
Dex does not itself require a new regional section model.
