# Pokémon White source review

Review date: 2026-10-13. This review does not approve game records.

## Pinned source candidate

The [squiddonaut/pokeblack repository](https://github.com/squiddonaut/pokeblack)
is an English Pokémon Black decompilation. Its README identifies the US/EUR
NDSi Enhanced target. The checked out HEAD is
`bbb5cd501426c1ca5f16a9d09c8d91fd03a1c12b`.

This source is not a complete reconstruction of White. The repository tree
has `data/arm9_data.s` and `data/README.md`; the `data` directory has no
reviewable species, encounter, progression, item, or trainer data collections.
The available `src` files are `battle_record.c`, `README.md`, and one unknown
function source. The source candidate therefore cannot establish White rules.
It is not valid to treat absent files as empty game collections.

## Thirteen required collection locators

The repository does not expose a verified White source locator for any of the
required collections. These are exact outstanding locator needs, not claims
about files in the repository.

| Collection | Locator needed | Status |
| --- | --- | --- |
| game | White version identity, regional Pokédex scope, and opening state | Open |
| pokemon | species data and White regional Pokédex ordering | Open |
| type-chart | Generation V battle type effectiveness data | Open |
| progression | story event scripts and access flags | Open |
| bosses | Gym, Elite Four, Champion, and relevant rival parties | Open |
| locations | map headers and displayed location names | Open |
| capabilities | field move use, traversal checks, and unlock flags | Open |
| items | item definitions and placements, key-item gates, fossils, evolution items | Open |
| choices | starter, fossil, and other persistent game choices | Open |
| sources | encounter tables, gifts, statics, in-game trades, and eggs | Open |
| breeding-rules | Day Care compatibility, offspring, gender, and special rules | Open |
| evolutions | White evolution methods and conditions | Open |
| exclusions | White version-specific and native-acquisition exclusions | Open |

## Proposed shared references

Do not add a data reference until a source with the required records is verified.
The pinned candidate is evidence of repository identity and scope only.

```json
[]
```

## Verified model gaps and required review

- The shared species catalogue has 386 species. White requires review through
  National Dex 649. The parent-owned identity and asset layer must cover every
  White-supported species before profiles can be complete.
- Profiles and acquisitions have no form ID. White form-dependent types,
  sources, evolution, and image selection cannot be represented safely. Review
  forms such as seasonal Deerling and Sawsbuck and Darmanitan's Zen Mode before
  setting the exact required form layer.
- Generation V uses the 17-type chart without Fairy. Build and verify the chart
  from an appropriate game source. Do not use the later chart.
- The evolution schema supports level-up, item use, and player trade. Review
  White's trade-held-item and location or condition-based evolution methods.
  Do not encode unsupported conditions as generic level evolutions.
- The wild-method enum has grass, surf, rods, Rock Smash, Headbutt, and Bug
  Contest only. Review White's dark grass, shaking grass, dust clouds, rippling
  water, and seasonal encounter behavior. Add tested support before declaring
  sources that need new methods.
- Review gender differences and form-dependent encounters. The current profile
  has one profile per species and cannot encode form-specific appearance or
  source outcomes.
- Review breeding outcomes and special held-item rules from White itself.
  Current records can name one held item per rule but cannot express every
  possible condition or alternate offspring outcome without verification.
- Review story progression and optional/post-game content gates from White
  scripts. Do not infer gates from another Unova version.
- Review Dream World, external transfers, events, and NPC trades against the
  project's native acquisition scope before excluding or representing them.

No game data files, source references, or shared identities were written. No
source, encounter, exclusion, or completion status was fabricated.

## Reviewed White battle layer (2026-10-13)

### Pinned source and source limits

- PKHeX was requested at `641c26ba100225f3605e5a44b61b3b16e15a3774` as a legality cross-check. PKHeX is not a reconstruction of White's trainer party tables and does not establish trainer parties. No White trainer-party locator is claimed from PKHeX.
- The earlier pinned `squiddonaut/pokeblack` revision remains Black-only and partial. It does not provide White battle tables.
- PokéJungle's game-specific guide gives Gen V teams and levels, including the White Iris Gym and N/Ghetsis final story fights. The trainer list is independently checked against Bulbapedia's Pokémon White game article for the encounter/order and Iris-in-White version distinction. The available browser extraction of that Bulbapedia page did not expose all team-level rows; exact party species are therefore corroborated only by the PokéJungle guide, and are not stored in the current schema anyway.
- PokéJungle pages reviewed: [trainer guide](https://pokejungle.net/pokemon-black-white-black-2-and-white-2/gym-leaders-elite-4-and-champions/), locators: Cilan/Cress/Chili lines 47-97; Lenora 117-130; Burgh 152-167; Elesa 181-195; Clay 213-227; Skyla 238-250; Brycen 264-275; Iris 302-314; Elite Four 334-435; Alder and B2W2 contrast 439-460. These are game-guide records, not primary source code. Use a retail-game capture or complete White reconstruction before claiming source-code confirmation.
- [Bulbapedia Pokémon White](https://bulbapedia.bulbagarden.net/wiki/Pokemon_White_Version), locators in extracted article: Gym leader variance and Iris in White; Elite Four order and mandatory Team Plasma interruption before the Champion. This independently checks boss identity/story ordering, not every party level.
- [Bulbapedia type chart](https://bulbapedia.bulbagarden.net/wiki/Type_chart_(Generation_II-IV)), lines 168-189 and 252-255: the applicable Gen V 17-type chart is under Generations II-V; Fairy was added afterward, and Steel's Ghost/Dark resistances change only in Gen VI. [Smogon Black/White](https://www.smogon.com/bw/), line 27, independently identifies the metagame type chart as 17 types. White's chart is therefore identical to the existing Gen III 17-type matrix; the authored file uses that matrix with White review metadata. This is an evidence-based reuse, not a White source-code locator.

### Reviewed values and limits

The supported records in `data/games/white/bosses.json` use highest party level for each fixed Gym, each Elite Four member, and the story finale. The Striaton entry uses level 14 and null specialty because its leader and type depend on the chosen starter. The current schema does not support listing a party's species and individual levels. It also cannot represent Striaton's three conditional leader variants as separate alternatives for one badge. N and Ghetsis are trainer records because the model has no story-final boss category; their sequence is N (level 52), then Ghetsis (level 54), before the Champion is available.

The authored White type chart uses the full 17-type Gen V matrix. Fairy is absent. Special move exceptions are outside the chart contract.

### Proposed shared references

```json
[
  {"id":"white-bosses","title":"Pokémon White Gym, Elite Four, and story-final trainer levels","locator":"Game-specific documented parties cross-checked against Bulbapedia for boss identities and story order; no reconstruction locator verified","url":"https://pokejungle.net/pokemon-black-white-black-2-and-white-2/gym-leaders-elite-4-and-champions/","revision":"reviewed 2026-10-13; web guide has no immutable revision"},
  {"id":"white-type-chart","title":"Generation V type effectiveness chart","locator":"Generations II-V chart; Gen V has 17 types, before Fairy and before Gen VI Steel matchup changes","url":"https://bulbapedia.bulbagarden.net/wiki/Type_chart_(Generation_II-IV)","revision":"reviewed 2026-10-13; web page has no immutable revision"}
]
```

Do not register these shared references until the owner accepts their attribution and review limits. Suggested stronger follow-up: obtain a verified White retail party table or source reconstruction for exact parties, and a primary White game mechanic source for type effectiveness.

## Proposed profile reference

```json
[
  {"id":"white-personal-data","title":"Pokémon White personal data: types, genders, and Egg Groups","locator":"PKHeX.Core/Resources/byte/personal/personal_bw; offsets and record size in PKHeX.Core/PersonalInfo/Info/PersonalInfo5BW.cs; BW form handling in PKHeX.Core/PersonalInfo/Table/PersonalTable5BW.cs","url":"https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774","revision":"641c26ba100225f3605e5a44b61b3b16e15a3774"}
]
```

```json
[
  {"id":"white-regional-dex","title":"Pokémon White Unova Pokédex sequence","locator":"Unova Pokédex listing from #000 Victini through #155 Genesect","url":"https://www.serebii.net/blackwhite/unovadex.shtml","revision":"reviewed 2026-10-13; no immutable revision"},
  {"id":"white-form-notes","title":"Pokémon White native form behavior review","locator":"Shopping Mall Nine Rotom appliances; Burmy gender/cloak evolution; Generation V Deerling and Sawsbuck seasonal forms","url":"https://bulbapedia.bulbagarden.net/wiki/Shopping_Mall_Nine","revision":"reviewed 2026-10-13; no immutable revision"}
]
```