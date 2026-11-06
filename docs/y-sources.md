# Pokémon Y source review

## Current integration: 21 October 2026

The active records use pinned personal, encounter, evolution, breeding, and sprite evidence. Separate story, item, fixed-source, and full exclusion reviews are integrated. Each record keeps its review date and source IDs. PKHeX legality evidence and community story guides remain distinct. The exact source limits are in the shared X and Y review.

See [the X and Y Progress Planner review](xy-progress-review.md) for the active scope, source conflicts, and checks. The dated notes below are source history. Earlier pending states and model gaps are superseded by this integration.

## Earlier review history

Review date: 2026-10-13. Scope: retail Pokémon Y (Kalos), separate from Pokémon X.

## Verified source assessment

The repository [PocketMonsters-X-Decompilation](https://github.com/SakuraiTsubaki/PocketMonsters-X-Decompilation) describes itself as a target-specific research and source reconstruction workspace. Its README says the exact build identity is not selected and requires `PROJECT.md` and `config/target.json` before target claims. The repository page lists eight commits, but this review could not obtain a revision hash. I did not treat it as an authoritative Y source. It targets Pokémon X, so it cannot establish Y-only version differences.

Repository areas shown on its page include `src/`, `research/`, `analysis/`, `config/`, `tools/`, and `manifests/`. The public page does not verify game-specific data files or exact locators for the thirteen planner collections. Do not infer records from the directory names.

## Collection locator status

The current data contract requires these thirteen game collections. Exact Y source locators remain unverified. Use a reviewed Pokémon Y build, pin its revision or documented release identity, and record exact file/record paths before authoring each collection.

| Planner collection | Required evidence | Locator status |
| --- | --- | --- |
| `game.json` | Y identity, Kalos scope, checkpoints, default progress, breeding hatch level | No verified Y target file |
| `pokemon.json` | Y-supported roster, forms, regional Pokédex order, types, genders, Egg Groups, local image paths | No verified Y target file |
| `type-chart.json` | Generation VI type IDs and full damage matrix, including Fairy | No verified Y target file |
| `progression.json` | Y story flags, route unlocks, postgame gates | No verified Y target file |
| `bosses.json` | Gym leaders, Elite Four, Champion and relevant story battles with levels and parties | No verified Y target file |
| `locations.json` | Kalos maps and access links | No verified Y target file |
| `capabilities.json` | HMs, field actions, rods, roller skates, and other access checks | No verified Y target file |
| `items.json` | Evolution items, held incense, key items and relevant pickups | No verified Y target file |
| `choices.json` | Starter, fossils, gifts, and one-time choice groups | No verified Y target file |
| `sources.json` | Wild tables by method/level, gifts, static encounters, eggs, fossils, trades, Friend Safari and other native acquisition sources | No verified Y target file |
| `breeding-rules.json` | Egg groups, offspring rules, incense cases, gender and special inheritance rules | No verified Y target file |
| `evolutions.json` | Y evolution triggers, conditions, level gains, items, gender/location/time gates, co-products | No verified Y target file |
| `exclusions.json` | Y-supported species with no native access under the declared scope, with exact reasons | No verified Y target file |

These are evidence needs, not source citations. No collection data is authored from them.

## Verified project gaps and proposed next steps

The shared catalogue contains 386 species. Generation VI adds species identities that the Y profile list needs. The current contract has no form identities or form references. Y needs form-aware records and assets for Mega Evolution and any other supported forms. The current type model must add Fairy and allow a per-game chart with the Generation VI rules. Do not append a Fairy chart to Emerald's 17-type chart.

The current evolution triggers only cover level-up, item use, and player trade. Y uses additional triggers and gates, including trading while holding an item, gender, location, time, friendship, move knowledge, party composition, and level-up with a specific species in the party. The current requirements cannot encode all of these reliably. Mega Evolution is a battle form change, not a permanent species evolution; it needs a separate form-state model.

Y also needs a reviewed method model for its encounter systems and a scope decision for content gated by Friend Safari, version differences, events, and postgame access. The current generic source methods and exclusion model do not establish these records by themselves. Review breeding inheritance and special offspring, including incense, against Y-specific evidence before creating breeding sources.

### Required shared work before Y data can be complete

1. Select a verified Y target/source and obtain a stable revision or exact release identity. Review the Y-specific data directly. Keep X as a separate source and record set.
2. Add shared identities for the Generation IV–VI species used by Y. Add stable form identities and local assets, while retaining one National Dex identity per species.
3. Extend the profile and acquisition model with explicit form IDs and form-aware image selection.
4. Add Fairy as a game-selectable type and validate a complete Generation VI chart independently from Emerald.
5. Add tested evolution and access rules for Y's unsupported trigger and story gates, including required party species, gender, location, time, held-item trade, and Mega form state.
6. Add tested encounter-method support for each Y source method that does not fit the current wild-source shape.
7. Define the content scope for Friend Safari, events, version differences, postgame, and special breeding. Then author and test each of the thirteen collections against exact Y locators.

### Proposed shared references

No reference IDs were added to `data/references.json` because that shared file is outside this task's write scope. Add candidate source records only after a source is selected and pinned.

```json
[
  {
    "id": "y-source-reconstruction",
    "title": "Pokémon Y source reconstruction (exact target not yet established)",
    "locator": "Not verified; the inspected candidate repository targets X and says its exact build identity is not selected",
    "url": "https://github.com/SakuraiTsubaki/PocketMonsters-X-Decompilation",
    "revision": null
  }
]
```

Do not use this proposed reference to support Y data. It records the rejected candidate and its limitation only.

## Round 2 reviewed sources (2026-10-13)

The earlier statement that no Y records can be authored is superseded for these partial layers. I reviewed published game-specific boss data and Generation VI type references. They do not provide source locators for every collection or a pinned Y ROM reconstruction.

### Boss levels

- Dittobase, [Pokémon X and Y Gym Leaders and Elite Four](https://www.dittobase.com/x-y/gym-leaders-elite-four), mutable page checked 2026-10-13. Exact locators: Gym section lines 45-117 gives Gym 1 through 7 and first-clear party members and levels; continue after line 119 for Wulfric. Elite Four section lines 127-151 gives Malva and Wikstrom; continue after line 153 for Drasna, Siebold, and Champion. The game-specific page separates Gym and League teams.
- Cross-check: [TCG Stacked Y Gym Leaders & Boss Prep](https://www.tcgstacked.com/pokemon/nuzlocke/y/gyms), mutable page checked 2026-10-13. Locator: lines 17-26 identifies the Y boss list; entries begin at line 32. This page independently reports level caps, not full party rosters. It supports the listed maximum levels.
- Limit: both are secondary references. No pinned primary executable, script, or reconstruction locator was found in this round. The authored `bosses.json` stores maximum levels only. It does not claim to store exact teams.

### Hatch level

- Bulbapedia, [Pokémon Egg](https://bulbapedia.bulbagarden.net/wiki/Egg), mutable page checked 2026-10-13. Locator: Level section states Eggs hatch at level 1 from Generation IV onward. This establishes Y's Generation VI hatch level. It is a secondary reference, not a Y-specific cartridge locator.

### Type chart

- Bulbapedia, [Type/Type chart](https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart), mutable page checked 2026-10-13. Locator: “Generation VI onward” complete chart. It states the chart applies from Generation VI onward and lists all 18 attacking and defending types, including Fairy. It documents the Generation V to VI Ghost/Dark versus Steel change.
- Cross-check: Serebii, [X & Y Fairy-type](https://www.serebii.net/xy/fairytype.shtml), mutable page checked 2026-10-13. Locator: “The New Fairy-type” and “Damage Given/Received” at lines 393-397. This confirms Fairy's introduction and its effectiveness row/column. It does not reproduce the full matrix in the extracted text.
- The authored matrix preserves the previous complete 17-type matrix except for Fairy interactions and the Generation VI change that Ghost and Dark deal neutral damage to Steel. It adds the source-listed Fairy row and column. A focused matrix check remains necessary before registration.

### Proposed shared references

```json
[
  {"id":"y-bosses","title":"Pokémon X and Y Gym Leaders and Elite Four","url":"https://www.dittobase.com/x-y/gym-leaders-elite-four","locator":"Gym Leaders lines 45 onward; Elite Four lines 127 onward; first-clear teams","revision":null},
  {"id":"y-boss-caps-crosscheck","title":"Y Gym Leaders & Boss Prep","url":"https://www.tcgstacked.com/pokemon/nuzlocke/y/gyms","locator":"Y boss list lines 17-26; individual entries from line 32","revision":null},
  {"id":"y-type-chart","title":"Type/Type chart","url":"https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart","locator":"Generation VI onward complete matchup chart and changes from Generations V to VI","revision":null},
  {"id":"y-fairy-type-crosscheck","title":"Pokémon X & Y - Fairy-type","url":"https://www.serebii.net/xy/fairytype.shtml","locator":"The New Fairy-type and effectiveness, lines 393-397","revision":null},
  {"id":"y-eggs","title":"Pokémon Egg","url":"https://bulbapedia.bulbagarden.net/wiki/Egg","locator":"Level section: Eggs hatch at level 1 from Generation IV onward","revision":null}
]
```

### Remaining model and evidence gaps

Verified: the shared catalogue through #493 still lacks many species needed for Y. The model has no form identity, per-form type, or form-aware image support. The evolution model does not express Inkay's orientation trigger, Sylveon's affection plus Fairy move, party-dependent Pancham, special trade/item/gender/location/time rules, or Mega Evolution state. Review the source-method model against Friend Safari and other Y methods before authoring encounters. Do not represent unsupported mechanics as generic level evolutions or exclusions.

Open: exact retail build-specific Y source locators for all thirteen collections; story and postgame gates; Friend Safari eligibility; one-time gifts and version differences; breeding incense and inherited form rules; final Team Flare boss coverage; and complete primary evidence for Fairy interactions. No source revision was pinned in this round.


## Round 3 base profile source (2026-10-13)

- PKHeX source at pinned revision [`641c26ba100225f3605e5a44b61b3b16e15a3774`](https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774).
- Exact locators: `PKHeX.Core/Resources/byte/personal/personal_xy` is the 0x40-byte personal table used by `PKHeX.Core/PersonalInfo/Table/PersonalTable6XY.cs`; offsets 0x06 and 0x07 are types, 0x12 is gender ratio, and 0x16-0x17 are Egg Groups per `PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs`. Type and Egg Group numeric values are declared in `PKHeX.Core/Game/Enums/MoveType.cs` and `PKHeX.Core/PersonalInfo/Enums/EggGroup.cs`. `PersonalTable6XY.IsPresentInGame` lists accepted form IDs.
- `personal_y` is a 4,256-byte (66-record) supplemental table, not a complete per-species table. The base profile records therefore use the shared XY personal table. Y-specific differences and acquisition are not established by this table.
- The authored 721 base profiles use the pinned table's species-indexed values. All regional numbers are omitted because Kalos has three regional sequences.
- Proposed shared reference (parent adds it to `data/references.json`):

```json
[
  {
    "id": "y-pkhex-personal",
    "title": "PKHeX Generation VI Pokémon personal table and record definitions",
    "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774",
    "locator": "PKHeX.Core/Resources/byte/personal/personal_xy; PKHeX.Core/PersonalInfo/Table/PersonalTable6XY.cs; PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs; PKHeX.Core/Game/Enums/MoveType.cs; PKHeX.Core/PersonalInfo/Enums/EggGroup.cs"
  }
]
```

The personal data supports base types, gender ratios, and Egg Groups. It does not establish Y's supported native acquisitions, Dex numbering, or story progression. `docs/y-forms.md` records the incomplete form inventory and proposed shared model.


## Round 5: complete base-profile comparison (2026-10-13)

This round corrects the earlier unverified profile-comparison claim. I read the local pinned PKHeX source at revision `641c26ba100225f3605e5a44b61b3b16e15a3774` and decoded `PKHeX.Core/Resources/byte/personal/personal_xy` directly. The file has 51,136 bytes: 799 records of 64 bytes, with no remainder. `PersonalTable6XY.cs` indexes a species record by species ID and selects forms through its form index. `PersonalInfo6XY.cs` defines the record size and reads types at offsets `0x06`/`0x07`, gender ratio at `0x12`, and Egg Groups at `0x16`/`0x17`. The pinned `MoveType.cs` and `EggGroup.cs` define the numeric maps.

I compared species IDs 1 through 721 to the shared identities and every Y base profile. All 721 identities have one profile. All 721 type pairs, gender categories, and Egg Group pairs match the decoded XY records. The project Egg Group IDs use hyphens (`water-1`, `human-like`, and so on); the comparison mapped PKHeX enum names to those IDs. Gender ratios map to the project categories: ratio 0 is male-only, 254 female-only, 255 genderless, and all other ratios in this table allow male and female. Every profile has the pinned reference and review date. Each uses its local `/pokemon/<nationalDex>.png` asset. Regional numbers remain omitted because the model cannot represent Central, Coastal, and Mountain sequences.

The table supports these shared XY base-profile facts. It does not prove that every identity is natively obtainable in Y, Y-specific forms, regional Dex membership, encounter paths, or story gates. The earlier `personal_y` supplemental-table statement is not needed for this layer and must not be read as evidence for Y-specific acquisition. Forms remain outside the base profile layer.

Exact source locators for this reviewed collection:

- `pokemon.json` profile facts: `personal_xy[1..721]`, fields `0x06`, `0x07`, `0x12`, `0x16`, and `0x17`.
- Record layout: `PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs`, `SIZE`, `Type1`, `Type2`, `Gender`, `EggGroup1`, and `EggGroup2`.
- Species and form table selection: `PKHeX.Core/PersonalInfo/Table/PersonalTable6XY.cs`, constructor, indexers, `GetFormIndex`, and `IsPresentInGame`.
- Numeric type names: `PKHeX.Core/Game/Enums/MoveType.cs`.
- Numeric Egg Group names: `PKHeX.Core/PersonalInfo/Enums/EggGroup.cs`.

Proposed shared reference for `data/references.json`:

```json
[
  {
    "id": "y-pkhex-personal",
    "title": "PKHeX Generation VI Pokémon personal table and record definitions",
    "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774",
    "locator": "PKHeX.Core/Resources/byte/personal/personal_xy records 1 through 721, offsets 0x06, 0x07, 0x12, 0x16, 0x17; PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs; PKHeX.Core/PersonalInfo/Table/PersonalTable6XY.cs; PKHeX.Core/Game/Enums/MoveType.cs; PKHeX.Core/PersonalInfo/Enums/EggGroup.cs"
  }
]
```

Earlier notes about missing Generations IV to VI identities are superseded: the shared identities now include 1 through 721. The form model, named Kalos sections, the other twelve collection locators, and game-specific acquisition and progression facts remain open.
