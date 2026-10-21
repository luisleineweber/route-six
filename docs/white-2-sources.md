# Pokémon White 2 source review

Review date: 2026-10-13. Status: partial. White 2 remains disabled.

## Round 2: trainer caps and type chart

The earlier source warning still applies to the `FieryMewtwo/pokeblack2`
candidate. Do not use it. This round uses game-specific published trainer
tables and a Generation V type-chart reference. These sources have no pinned
software revision, so the facts have a published-reference review, not a
reconstruction-source review.

### Verified facts

- Serebii's Black 2/White 2 Gym page lists the normal-mode Gym teams and
  levels. Pokémon Database independently lists the first-run Gyms and League
  level caps. I used the highest member level for each boss record. This model
  does not store the party members.
- Pokémon Database lists Champion Iris's first-run ace at level 59 and
  Ghetsis's first-run ace at level 52. I included these two story battles.
- Bulbapedia labels its complete 17-type matchup table as the chart used from
  Generation II through V. It names the changes between V and VI: Fairy is
  added, and Ghost/Dark attacks cease to be resisted by Steel. Smogon's BW
  reference independently identifies its chart as the 17-type chart. The
  maintained matrix uses the 17 types and Generation V interactions. This is
  cross-checked reference data, not a direct game-code extraction.
- PKHeX at `641c26ba100225f3605e5a44b61b3b16e15a3774` identifies Black 2 and
  White 2 as distinct version values. Its generic `PKM` class does not establish
  White 2's hatch level. Serebii's White 2-specific breeding page does not state
  a hatch level either. Therefore no hatch-level value is approved for
  `game.json` in this round.

### References proposed for the shared reference list

```json
[
  {"id":"white-2-trainers","title":"Pokémon Black 2 & White 2 Gyms and Pokémon Database Gym/League tables","url":"https://www.serebii.net/black2white2/gyms.shtml","revision":null,"locator":"Serebii Gym 1-8 normal-mode party level sections; cross-check https://pokemondb.net/black-white-2/gymleaders-elitefour sections Gym Leaders and Elite Four"},
  {"id":"white-2-type-chart","title":"Type/Type chart; Smogon Black/White reference","url":"https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart","revision":null,"locator":"Generations II-V table (17 types), lines/section: Generation II through V; cross-check https://www.smogon.com/bw/ Types"},
  {"id":"white-2-pkhex","title":"PKHeX","url":"https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774","revision":"641c26ba100225f3605e5a44b61b3b16e15a3774","locator":"PKHeX.Core/PKM/PKM.cs: B2W2 version predicate; inspected as a version/source context check only, not evidence for hatch level or complete event data"},
  {"id":"white-2-breeding","title":"Pokémon Black 2 & White 2 New Breeding Mechanics","url":"https://www.serebii.net/black2white2/breed.shtml","revision":null,"locator":"Sections: breeding unlock after Elite Four and reaching Route 3; Hatching Mechanics"}
]
```

## Still open

The earlier review identified the conflicting `pokeblack2` provenance. That
does not block these independent boss and type layers. It still blocks using
that repository for other White 2 collections.

There is no White 2 checkpoint to support a valid `game.json`. No hatch level
is recorded until a White 2 source directly establishes it. No source
reconstruction revision or exact collection locators are verified for the
remaining collections. Do not treat missing records as empty data.

This earlier note that shared identities ended at 493 is stale. The parent has
now added identities and local assets through 721. Shared form support remains
absent. White 2 form support and per-game species acquisition still need review.

## Profile layer continuation (2026-10-13)

The parent workflow now provides shared identities 1-721 and local images
`public/pokemon/1.png` through `public/pokemon/721.png`, plus
`public/types/fairy.svg`. This supports image paths and identity coverage, but
does not establish White 2 types, gender ratios, Egg Groups, regional order,
or form-specific profiles.

The pinned PKHeX source confirms the table binding: `PersonalTable.B2W2` loads
`personal_b2w2`, and the Generation V `PK5` accessor calls that table for
forms. `PersonalInfo5B2W2.SIZE` is `0x4C` bytes. Its field offsets are types
`0x06`/`0x07`, gender ratio `0x12`, Egg Groups `0x16`/`0x17`, form-stat index
`0x1C`, and form count `0x20`. PKHeX uses the same table for Black 2 and White
2. These facts are from `PersonalTable.cs`, `PK5.cs`, and
`PersonalInfo5B2W2.cs` at the pinned revision.

At the time of this earlier note, I had verified the binary contract but had
not inspected its byte records. Round 5 below performs that comparison and
adds White 2 profiles. Regional order remains unverified.

Proposed shared reference entry for the profile-source contract:

```json
{
  "id": "white-2-pkhex-personal",
  "title": "PKHeX generation-five personal records and binary structure",
  "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo",
  "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774",
  "locator": "PKHeX.Core/PersonalInfo/PersonalTable.cs: PersonalTable.B2W2 = GetTable(\"b2w2\"); PKHeX.Core/PKM/PK5.cs: PersonalInfo uses PersonalTable.B2W2.GetFormEntry(Species, Form); PKHeX.Core/PersonalInfo/Info/PersonalInfo5B2W2.cs: SIZE 0x4C, types at 0x06/0x07, Gender 0x12, Egg Groups 0x16/0x17, FormStatsIndex 0x1C, FormCount 0x20"
}
```

The exact pinned binary resource path is
`PKHeX.Core/Resources/byte/personal/personal_b2w2`. Round 5 below records the
verified byte size, record count, and base-species comparison.

Do not use the contract definition as evidence for profile values. Exact BW2
record paths and regional number sequence still need verification. The parent
has authorized the base-profile layer, but these data facts are not established
by the inspected source page.

The current mechanics model still needs review for White 2's move-known,
party-species, location/environment and held-item level-up evolutions; Hidden
Grotto mechanics; other source methods; special breeding outcomes; and
postgame/story gates. These are not represented by generic rules here.



## Round 5: reviewed base profiles (2026-10-13)

### Verified facts

The local pinned source table was inspected directly. The repository revision is
`641c26ba100225f3605e5a44b61b3b16e15a3774`. `PersonalTable.B2W2` loads the
`personal_b2w2` resource. `PK5.PersonalInfo` resolves that table by species and
form. `PersonalInfo5B2W2.SIZE` is `0x4C`; it defines types at `0x06` and `0x07`,
gender at `0x12`, Egg Groups at `0x16` and `0x17`, and form metadata at `0x1C`
and `0x20`.

A temporary read-only comparison decoded base species records 1 through 649.
The table has 709 records of `0x4C` bytes. Each base species record is at its
National Dex index. The decoded types, gender category, and Egg Groups match the
corresponding Black 2 profile fields for all 649 species (1,947 field checks;
zero mismatches). The Black 2 and White 2 editions use the same `B2W2` personal
table in PKHeX. White 2 profiles therefore use these table values. Profiles do
not declare regional numbers because the White 2 regional sequence is not yet
reviewed.

The comparison covers base species records only. Form support, form-specific
profiles, and White 2 acquisition of forms remain unreviewed and unsupported by
the current model.

### Proposed shared reference entry

```json
{
  "id": "white-2-pkhex-personal",
  "title": "PKHeX Black 2 and White 2 personal data table and record structure",
  "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core",
  "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774",
  "locator": "PKHeX.Core/Resources/byte/personal/personal_b2w2: records indexed by National Dex species, base species 1-649 inspected; PKHeX.Core/PersonalInfo/PersonalTable.cs: PersonalTable.B2W2 loads GetTable(\"b2w2\"); PKHeX.Core/PKM/PK5.cs: PersonalInfo uses PersonalTable.B2W2.GetFormEntry(Species, Form); PKHeX.Core/PersonalInfo/Info/PersonalInfo5B2W2.cs: SIZE 0x4C, Type1 0x06, Type2 0x07, Gender 0x12, EggGroup1 0x16, EggGroup2 0x17, FormStatsIndex 0x1C, FormCount 0x20; PKHeX.Core/PersonalInfo/Table/PersonalTable5B2W2.cs: form index resolution"
}
```

### Open questions

This review does not establish White 2 regional Dex order or form-specific
profiles. It does not verify encounter, evolution, breeding, story, or
progression records. See coverage notes for shared model gaps and remaining
source work.
