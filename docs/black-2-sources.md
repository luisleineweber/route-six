# Pokémon Black 2 source review

Review date: 13 October 2026. Scope for this round: ordinary first-run
Black 2 Gym, League and final story battles; Generation V battle type chart;
and egg hatch level. This does not complete or enable the game.

## Reviewed source locators

| Facts | Source and locator | Pin / review limit |
| --- | --- | --- |
| First-run Gym parties and specialty types | [Pokémon Database Black 2/White 2 Gym Leaders & Elite Four](https://pokemondb.net/black-white-2/gymleaders-elitefour), Gym #1–#8 sections | Page is version-paired, not revisioned. Black 2 and White 2 share these listed first-run leader parties. Cross-check leader order and first two parties with Serebii. |
| First-run Gym party cross-check | [Serebii Black 2/White 2 Gyms](https://www.serebii.net/black2white2/gyms.shtml), Gym #1–#8, standard party entries | Version-paired specialist guide. Each first-run Gym party and highest level agrees with Pokémon Database. Challenge Mode entries are listed separately. |
| First-run Elite Four and Iris party levels | Same page, Elite Four #1–#4 and Champion sections | Page lists first battles separately from rematches. The authored layer uses the first-battle entries. Serebii corroborates the Elite Four first-battle level 56/58 parties. |
| Final story trainer, Ghetsis | Same page, “Other trainers” → Team Plasma Ghetsis | The page lists Ghetsis's six Pokémon at levels 50–52. The schema stores only his highest level. |
| Order and first-run trainer party cross-check | [Serebii Black 2/White 2 Elite Four](https://www.serebii.net/black2white2/elitefour.shtml), Elite #1–#4 and Champion Iris sections | Version-paired specialist guide. It identifies standard and Challenge Mode separately. This layer uses standard mode. |
| Type chart | [Pokémon Database Generation 2–5 type chart](https://pokemondb.net/type/old), “Generation 2-5 type chart” table | The table explicitly includes Black 2 and White 2. Its full 17×17 matrix was checked against the current project matrix values. |
| Type chart generation boundary | [Bulbapedia Type chart](https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart), note “This matchup table is used from Generation II to Generation V” and “Between Generations V and VI” | Independent cross-check confirms 17 types for Gen V and that Fairy plus the removed Steel resistances belong to the Gen V→VI change. The Black 2 chart has no Fairy type. |
| Hatch level | [Bulbapedia Pokémon breeding](https://bulbapedia.bulbagarden.net/wiki/Pokemon_breeding), section “Hatching Eggs” | States eggs hatch at level 1 from Generation IV onward. Black 2 is Gen V. |
| Pinned source reconstruction inspection | [PKHeX PK5.cs at revision `641c26ba100225f3605e5a44b61b3b16e15a3774`](https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PKM/PK5.cs) | Inspected as a pinned Gen V format reference. It does not provide Black 2 trainer-party or type-chart source data, so no such records cite it. PKHeX is not treated as an event or complete game-data source. |
| Official manual check | [Nintendo Black Version 2 instruction booklet](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/DS_pokemon_black_2?_a=DATAg1AAZAA0) | Official manual PDF opened. This booklet is Black Version 2. It does not publish trainer party tables or a battle type chart. |

## Verified findings

- The standard first-run Gym ace levels are 13, 18, 24, 30, 33, 39, 48 and
  51. Leader types are Normal, Poison, Bug, Electric, Ground, Flying, Dragon
  and Water in badge order.
- Each standard first-run Elite Four opponent has a highest level of 58. Their
  order is optional. Iris is the Champion; her highest level is 59.
- Ghetsis is the final story trainer shown on the specialist party list. His
  highest listed party level is 52. The parent can decide whether to include
  the preceding N battle in a wider story-boss layer.
- Generation V uses 17 types. The chart excludes Fairy. Steel resists Dark
  and Ghost in this generation.
- Black 2 eggs hatch at level 1.
- The existing boss schema stores only `highestLevel`; it cannot preserve every
  party member and level. The source notes retain the exact cited party lists.

## Inferences and limits

- First-run levels and parties are version-paired facts. The sources present a
  shared Black 2/White 2 section, so I infer that these entries apply to Black
  2. Version-differing rematches, areas and gifts are out of this layer.
- The copied chart values are supported by the Gen II–V chart and its 17-type
  boundary. No game-specific Black 2 source reconstruction currently supplies
  the table itself.
- The entry for Ghetsis uses a generic `trainer` kind because the current boss
  schema has no story-final kind.

## Proposed shared references

Add these references to `data/references.json` when the parent integrates this
layer. The two boss pages are dynamic web pages and have no immutable revision.

```json
[
  {"id":"black-2-bosses","title":"Black 2 first-run boss parties","locator":"Gym #1–#8; Elite Four #1–#4; Champion Iris; Other trainers → Team Plasma Ghetsis","url":"https://pokemondb.net/black-white-2/gymleaders-elitefour"},
  {"id":"black-2-serebii-bosses","title":"Black 2/White 2 Elite Four and Champion parties","locator":"Elite #1–#4 and Champion Iris; standard mode","url":"https://www.serebii.net/black2white2/elitefour.shtml"},
  {"id":"black-2-serebii-gyms","title":"Black 2/White 2 Gym parties","locator":"Gym #1–#8; standard parties","url":"https://www.serebii.net/black2white2/gyms.shtml"},
  {"id":"black-2-type-chart","title":"Generation 2–5 type chart","locator":"Generation 2-5 type chart table; 17 attacking and defending types","url":"https://pokemondb.net/type/old"},
  {"id":"black-2-bulbapedia-type-chart","title":"Generation II–V type chart boundary","locator":"Type chart used from Generation II to Generation V; changes between Generations V and VI","url":"https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart"},
  {"id":"black-2-hatching-level","title":"Pokémon egg hatching levels","locator":"Hatching Eggs; Generation IV onward","url":"https://bulbapedia.bulbagarden.net/wiki/Pokemon_breeding"}
]
```

## Remaining collection and model work

- The earlier thirteen collection locator plan remains valid. This round did
  not review profiles, progression, locations, capabilities, items, choices,
  acquisitions, breeding rules, evolutions or exclusions.
- Existing identities stop at #493. Required Black 2 species identities begin
  at #494 and continue to #649. Parent must add those identities and local
  assets before profiles can be authored. Forms need form identities and
  form-aware paths; do not duplicate National Dex identities.
- Check the model against shaking grass, dust clouds, rippling water, dark
  grass and Hidden Grottos before adding encounters. The current `wild` method
  shape has no per-slot encounter table or activation condition.
- Review seasons, Black City, Key System access, Join Avenue, PokéStar Studios,
  postgame routes, roaming encounters and version-specific gates against
  direct Black 2 evidence before authoring access records.
- Check special breeding offspring, gender ratios, form inheritance, and all
  Black 2 evolution triggers against the current rule tags before authoring.
- Current boss data cannot store full parties. Add a tested shared model layer
  if the interface needs party members rather than just highest levels.

## Proposed species work

Parent should add exact shared identities and reviewed local assets for any
Black 2 supported species absent from the shared catalogue, starting with
National Dex #494–#649. Do not infer the supported list from the generation;
Black 2 regional and native acquisition coverage still needs its own review.

## Profile and form source review extension

The pinned PKHeX source tree is revision
`641c26ba100225f3605e5a44b61b3b16e15a3774`. Its Black 2/White 2 personal
records are at `PKHeX.Core/Resources/byte/personal/personal_b2w2`; record
fields are defined by `PersonalInfo5B2W2.cs`. The pin and paths are verified.
I did not extract or hand-check every record's type, gender ratio, or Egg
Groups in this round. Therefore no base profile records are claimed as reviewed.
See [Black 2 forms](black-2-forms.md) for the native form inventory and model
gap.

Proposed shared references for parent integration:

```json
[
  {"id":"black-2-personal-records","title":"PKHeX Black 2/White 2 personal data records","locator":"PKHeX.Core/Resources/byte/personal/personal_b2w2; revision 641c26ba100225f3605e5a44b61b3b16e15a3774","url":"https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/Resources/byte/personal/personal_b2w2"},
  {"id":"black-2-personal-layout","title":"PKHeX Black 2/White 2 personal record layout","locator":"PersonalInfo5B2W2.cs; revision 641c26ba100225f3605e5a44b61b3b16e15a3774","url":"https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Info/PersonalInfo5B2W2.cs"}
]
```


## Base profile source review

The base profile layer is now reviewed against the pinned PKHeX data. The binding is `PersonalTable.B2W2 = new(GetTable("b2w2"))` in `PKHeX.Core/PersonalInfo/PersonalTable.cs`. The data file is `PKHeX.Core/Resources/byte/personal/personal_b2w2`. `PersonalInfo5B2W2.cs` sets `SIZE = 0x4C` (76 bytes), type offsets `0x06` and `0x07`, gender ratio offset `0x12`, and Egg Group offsets `0x16` and `0x17`. The file has 709 records. National Dex IDs 1?649 use direct matching record indexes. The remaining records are form and other auxiliary entries.

I decoded every base record and compared its types, gender category, and deduplicated Egg Groups with the corresponding White profile. All 649 comparisons match. This comparison is a check only; the Black 2 records cite `black-2-personal-data` and were built from the B2W2 table. Gender byte 0 means male only, 254 female only, 255 genderless, and all other values allow both. Egg Group byte 0 and 15 both map to the schema's `undiscovered` group.

The profile file does not include a regional Dex number. Unova regional numbering still needs a separate reviewed pass. These profiles do not review Black 2 acquisition coverage, form-aware data, or progression.

Proposed shared source reference for parent integration:

```json
[
  {"id":"black-2-personal-data","title":"PKHeX Black 2/White 2 personal data records","locator":"PersonalTable.B2W2 binding to GetTable(\"b2w2\"); PKHeX.Core/Resources/byte/personal/personal_b2w2; 709 records, 76 bytes each","url":"https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/Resources/byte/personal/personal_b2w2"}
]
```
