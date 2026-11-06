# Omega Ruby source review

Review date: 2026-10-13. Game scope: the retail Pokémon Omega Ruby version, including its Delta Episode. Exclude external distributions and trading from other games. Keep Alpha Sapphire differences out of this record.

## Verified source base

The preferred available reconstruction source is [PKHeX](https://github.com/kwsch/PKHeX), a source reconstruction and legality-data project. I pinned revision `641c26ba100225f3605e5a44b61b3b16e15a3774` (master at review). This repo has exact ORAS encounter tables, personal data, location strings, and script flag names. It does not provide the original game scripts, complete story event logic, or a complete human-readable item and map placement catalogue. Do not treat it as the original game source.

Pinned source root: `https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774`

The related official decompilation `pret/pokeemerald` is Ruby/Sapphire/Emerald, not Omega Ruby. Revision checked: `731ad5bfd6e6f265508d0efcca0ba42f9dcf5881`. It is useful only to compare inherited Hoenn story concepts. It is not an Omega Ruby source and cannot establish ORAS encounters, scripts, forms, or gates.

## Collection locators

These are source locations to review for each of the thirteen game collections. A locator does not mean the collection is complete or ready to author.

| Collection | Exact pinned locator | What it supports and limits |
| --- | --- | --- |
| game | `PKHeX.Core/PKM/Enums/GameVersion.cs` and `PKHeX.Core/Resources/text/script/gen6/const_oras_en.txt` | Version identity and ORAS script constants. Does not establish this planner's story scope or first milestone. |
| pokemon | `PKHeX.Core/PersonalInfo/Info/PersonalInfo6AO.cs`; `PKHeX.Core/Resources/text/locations/gen6/` | ORAS species personal data and localized location labels. Personal data is not a complete profile list, regional Dex order, or form model. |
| type-chart | No complete ORAS matrix locator established in this source set. `PKHeX.Core/PersonalInfo/Info/PersonalInfo6AO.cs` can corroborate species typing only. | Need an independently reviewed Gen VI battle chart, including Fairy. Do not reuse Emerald's 17-type matrix. |
| progression | `PKHeX.Core/Resources/text/script/gen6/flags_oras_en.txt`; `PKHeX.Core/Resources/text/script/gen6/const_oras_en.txt` | Names script flags and constants, but does not define event dependencies or prove story order. Need retail-game script/event evidence. |
| bosses | No ORAS trainer-party source was found in the pinned PKHeX repository. `PKHeX.Core/Resources/text/script/gen6/const_oras_en.txt` gives names/constants only. | Need version-checked trainer parties from a reviewed source before authoring. |
| locations | `PKHeX.Core/Resources/text/locations/gen6/` (ORAS map identifiers and text); encounter area IDs in `PKHeX.Core/Legality/Encounters/Templates/Gen6/EncounterArea6AO.cs` | Exact location name resources and encounter area structures. Need a reviewed mapping from internal IDs to planner-visible locations and access gates. |
| capabilities | `PKHeX.Core/Resources/text/script/gen6/flags_oras_en.txt`; `PKHeX.Core/Resources/text/script/gen6/const_oras_en.txt` | Candidate flag names only. HM, badge, soaring, diving, and other capability unlock logic needs event/script evidence. |
| items | `PKHeX.Core/Resources/text/script/gen6/const_oras_en.txt` | Item constants only. It does not establish obtainable item placements, shops, or gates. |
| choices | `PKHeX.Core/Resources/text/script/gen6/flags_oras_en.txt`; `PKHeX.Core/Resources/text/script/gen6/const_oras_en.txt` | Choice flags/constants only. Need event evidence for starter, fossil, legendary, and one-time choice groups. |
| sources | `PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6AO.cs`; `PKHeX.Core/Legality/Encounters/Templates/Gen6/EncounterArea6AO.cs`; `PKHeX.Core/Legality/Encounters/Templates/Gen6/EncounterSlot6AO.cs`; `PKHeX.Core/Legality/Encounters/Templates/Gen6/EncounterStatic6.cs`; `PKHeX.Core/Legality/Encounters/Templates/Gen6/EncounterTrade6.cs` | ORAS wild/static/trade legality records and encounter structures. Need convert only after location IDs, method semantics, gates, gifts, Dexnav, soaring, and story unlocks are independently verified. |
| breeding-rules | `PKHeX.Core/Saves/Substructures/Gen6/Daycare6AO.cs`; no complete ORAS compatibility/offspring rule source locator established | Confirms an ORAS daycare save structure only. Need a primary/reconstruction source for compatibility, hatch level, Egg Groups, and special incense offspring rules. |
| evolutions | `PKHeX.Core/PersonalInfo/Info/PersonalInfo6AO.cs`; `PKHeX.Core/Resources/text/script/gen6/const_oras_en.txt` | Species/form data and item constants do not encode a complete evolution table or battle-only Mega/Primal transformations. Need a reviewed evolution source. |
| exclusions | `PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6AO.cs`; `PKHeX.Core/Resources/text/script/gen6/flags_oras_en.txt` | Establishes some recorded acquisition forms and flags, not a complete native acquisition coverage proof. Do not infer exclusions from absent table rows. |

Direct file URLs use the pinned revision, for example:

- https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/Legality/Encounters/Data/Gen6/Encounters6AO.cs
- https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Info/PersonalInfo6AO.cs
- https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/Resources/text/script/gen6
- https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/Resources/text/locations/gen6

## Required shared references

Add these references to `data/references.json` only after parent review. This agent cannot edit that shared file.

```json
[
  {
    "id": "omega-ruby-pkhex",
    "title": "PKHeX ORAS reconstruction data at pinned revision",
    "locator": "PersonalInfo6AO.cs; Encounters6AO.cs; EncounterArea6AO.cs; EncounterSlot6AO.cs; EncounterStatic6.cs; EncounterTrade6.cs; Daycare6AO.cs; Resources/text/script/gen6/const_oras_en.txt; flags_oras_en.txt; Resources/text/locations/gen6/",
    "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774"
  },
  {
    "id": "omega-ruby-nintendo-manual",
    "title": "Pokémon Omega Ruby official electronic manual",
    "locator": "Official game systems and feature descriptions; the manual does not establish encounter tables or full event dependencies",
    "url": "https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/manual-3DS-pokemon-omega-ruby-version-en?_a=DATC1RAAZAA0",
    "revision": "Not versioned; official manual located on Nintendo support site on 2026-10-13"
  }
]
```

### Profile and form source proposal (reviewed 2026-10-13)

The pinned source clone is at `output/source-review/pkhex-black` and resolves
to revision `641c26ba100225f3605e5a44b61b3b16e15a3774`. `PersonalTable.cs`
binds Omega Ruby/Alpha Sapphire to `GetTable("ao")`; `GetTable` resolves the
embedded `personal_ao` resource. The resource has 66,080 bytes: 826 records at
`PersonalInfo6AO.SIZE` (`0x50`) bytes each. Rows 1-721 align with the 721
shared National Dex identities in `data/pokemon.json`. I reviewed each of
those rows at offsets `0x06` and `0x07` (Type1/Type2), `0x12` (Gender), and
`0x16` and `0x17` (EggGroup1/EggGroup2), as defined in
`PersonalInfo6AO.cs`. `MoveType.cs` defines the Gen VI type IDs. PKHeX's
`EggGroup.cs` defines Egg Group IDs. Gender sentinels are 0 (male-only), 254
(female-only), and 255 (genderless); other byte values allow both genders.
I compared all three profile field groups against Alpha Sapphire's reviewed
profile records, after mapping PKHeX Egg Group names to this project's IDs.
All 721 matched. I then wrote the Omega Ruby profiles with Omega Ruby review
references and no regional Dex number. This field match supports only these
base-profile fields. It does not prove Omega Ruby's native acquisition scope,
regional Dex order, or form access.

```json
[
  {
    "id": "omega-ruby-profiles",
    "title": "PKHeX ORAS personal data at pinned revision",
    "locator": "PersonalTable.cs: AO = new(GetTable(\"ao\")); GetTable resolves personal_ao; Resources/byte/personal/personal_ao rows 1-721, each 0x50 bytes; PersonalInfo6AO.cs offsets 0x06 Type1, 0x07 Type2, 0x12 Gender, 0x16 EggGroup1, 0x17 EggGroup2; PKHeX.Core/Game/Enums/MoveType.cs and PKHeX.Core/PersonalInfo/Enums/EggGroup.cs",
    "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774"
  },
  {
    "id": "omega-ruby-forms",
    "title": "Official Pokémon Omega Ruby and Alpha Sapphire Pokémon and form descriptions",
    "locator": "Official ORAS site Pokémon list; Mega Evolution and Primal Reversion descriptions; specialist ORAS form index used to identify form inventory, not acquisition gates",
    "url": "https://www.pokemon.co.jp/ex/oras/pokemon/",
    "revision": "Official page unversioned; reviewed 2026-10-13"
  }
]
```

Do not add an Emerald reference for Omega Ruby records. The checked `pret/pokeemerald` revision is a different game and is not an Omega Ruby authority.

## Verified model gaps and proposed next work

1. **Generation VI shared identities are absent.** `data/pokemon.json` currently ends at #386. Omega Ruby data requires reviewed identities through #721, whether or not all have native access. Parent must add missing identities and references before profiles can validate.
2. **Form identity is not modeled.** Omega Ruby has Mega forms and Primal Reversion. Forms preserve one National Dex identity but can have different types, sprites, and temporary battle states. Current profiles and sources identify species only. Propose a shared form collection with stable form IDs and explicit profile, source, evolution, and asset references. Do not duplicate species identities or pretend these are permanent evolutions.
3. **The type chart is not ready.** Gen VI has 18 types, including Fairy. Shared app instructions that specify Emerald's 17 types do not establish a Gen VI chart. Add a game-scoped 18-type chart and verify every matchup from an authoritative battle reference.
4. **Evolution rules have gaps.** Gen IV–VI species add level, item, location, gender, move-known, and trade evolutions. Mega Evolution and Primal Reversion are temporary battle transformations, not ordinary acquisition evolutions. Review actual Omega Ruby triggers and item gates before modeling. The present evolution condition model may not represent all triggers.
5. **Encounter model gaps need review.** ORAS uses DexNav and soaring encounters, plus fishing, surf, hidden/interactive and static events. Existing wild methods and fixed level rules may not encode DexNav search levels, DexNav hidden Pokémon, soaring species/levels, or all encounter gating. Verify against the pinned source and add tested domain semantics where needed.
6. **Story and content gates are not established.** Review Gym/badge order; HM field move requirements; Team Magma events; weather trio and Cave of Origin; National Pokédex unlock; postgame Delta Episode; soaring and one-time legendary encounters; Mirage Spots, which can depend on daily/random conditions. Keep the planner's stated policy for dynamic clock/RNG opportunities. Do not turn unsupported postgame into a generic Victory Road milestone.
7. **Breeding needs exact game rules.** Confirm daycare access, hatch level, gender and Egg Groups, incense alternatives, and baby species. Existing model can express held incense only if the item requirement is proven obtainable. Confirm ORAS daycare source before creating any breeding data.
8. **Version scope remains strict.** Omega Ruby excludes Alpha Sapphire-only records. Record OR-exclusive encounters/items and version-specific event changes separately. Cross-version trades and distributions remain out of scope.
9. **Trainer and item sources are missing.** PKHeX does not establish all trainers, event reward placement, shops, or progression dependencies. Source these before authoring bosses, capabilities, items, choices, milestones, and complete exclusions.
10. **Assets are not reviewed.** Add local images for every profile and active type only after parent creates shared identities and approves asset sourcing.

## Unresolved questions

- Which reviewed reconstruction dataset can supply original ORAS scripts, map events, trainer parties, items, evolutions, and detailed encounter conditions? No complete public decompilation for Omega Ruby was established in this review.
- What is the product scope for Delta Episode and postgame Mirage Spots? The assigned game scope includes Delta Episode, but dynamic spots need explicit acquisition policy and source evidence.
- Which local asset set will parent approve for new species, Mega forms, Primal forms, and Fairy type?

No Omega Ruby game data has been authored. Source review is incomplete. Do not enable the game.

## Round 2 reviewed layer (2026-10-13)

This round adds only the first-run Gym/League highest party levels and the
Generation VI type chart. It does not claim full party-roster coverage. The
current boss schema stores `highestLevel`, not trainer party members or each
member's level.

### Reviewed evidence

- [Serebii ORAS Gym Leaders](https://www.serebii.net/omegarubyalphasapphire/gyms.shtml)
  lists each Gym Leader's first-battle party and levels. Its Gym 1–8 rows give
  maximum levels 14, 16, 21, 28, 30, 35, 45, and 46. [Bulbapedia's ORAS
  walkthrough](https://bulbapedia.bulbagarden.net/wiki/Appendix:Omega_Ruby_and_Alpha_Sapphire_walkthrough/Section_2)
  independently confirms Roxanne's first party at levels 12 and 14. Exact
  second-source cross-checks for every later Gym roster remain open.
- [Serebii ORAS Elite Four](https://www.serebii.net/omegarubyalphasapphire/elitefour.shtml)
  lists the first-run League parties and levels. It gives maximum levels 52,
  53, 54, 55, and 59 for Sidney, Phoebe, Glacia, Drake, and Champion Steven.
  The same page separates post-Delta Episode rematches; those rematch levels
  are not in `bosses.json`.
- [Pokémon Database type chart](https://pokemondb.net/type) displays the Gen 6+
  18-type effectiveness chart and describes the Generation VI changes.
  [Pokémon Showdown's type chart source at pinned revision
  `3a766f2cfb5e51c1e428cfe87d0dba91a8f01640`](https://github.com/smogon/pokemon-showdown/blob/3a766f2cfb5e51c1e428cfe87d0dba91a8f01640/data/typechart.ts)
  independently corroborates the damage relationships in source data. This
  is a battle simulator reconstruction, not Game Freak source. Fairy was
  appended after the Emerald type order in the authored matrix.
- [Bulbapedia Egg article](https://bulbapedia.bulbagarden.net/wiki/Egg)
  states that Generation IV and later Eggs hatch at level 1. This establishes
  the inherited Omega Ruby rule, but `game.json` is not authored because no
  valid reviewed first checkpoint or progression record exists yet.
- The official [Nintendo Omega Ruby manual](https://csassets.nintendo.com/noaext/image/private/t_KA_PDF/manual-3DS-pokemon-omega-ruby-version-en?_a=BATCtdAA0)
  confirms the Gym challenge as a game feature. It does not provide party or
  battle chart data.

### Shared references proposed for parent registration

```json
[
  {
    "id": "omega-ruby-bosses",
    "title": "Pokémon Omega Ruby & Alpha Sapphire Gym Leaders and Elite Four",
    "locator": "Serebii ORAS Gym Leaders, Gym 1-8 first battle party level rows; Elite Four, first League battle party level rows; cross-check Roxanne in Bulbapedia ORAS walkthrough Section 2",
    "url": "https://www.serebii.net/omegarubyalphasapphire/gyms.shtml",
    "revision": "Unversioned specialist reference, reviewed 2026-10-13; cross-check source pinned at 3a766f2cfb5e51c1e428cfe87d0dba91a8f01640"
  },
  {
    "id": "omega-ruby-type-chart",
    "title": "Generation VI type chart",
    "locator": "Pokémon Database Gen 6+ 18-type matrix; independently compare each interaction with Pokémon Showdown data/typechart.ts",
    "url": "https://pokemondb.net/type",
    "revision": "Unversioned specialist reference, reviewed 2026-10-13"
  },
  {
    "id": "omega-ruby-eggs",
    "title": "Pokémon Egg mechanics",
    "locator": "Generation IV section: Eggs hatch at level 1; applies to later generations including Omega Ruby",
    "url": "https://bulbapedia.bulbagarden.net/wiki/Egg",
    "revision": "Unversioned specialist reference, reviewed 2026-10-13"
  }
]
```

### Limits and outstanding evidence

- `bosses.json` records only the top level for each first-run Gym and League
  team. It cannot represent the full parties. This is the current schema limit.
- Wallace is the eighth Gym Leader in Omega Ruby. Do not copy Emerald's Juan.
- The final Delta Episode trainer and other story trainer parties are not
  included. Review them if progression records need a named final story boss.
- The chart was independently checked against two references. The Pokémon
  Showdown source is pinned at
  `3a766f2cfb5e51c1e428cfe87d0dba91a8f01640`.
- No `game.json` was written: the game has no reviewed progression checkpoint
  yet. Hatch level 1 is verified evidence for later inclusion.

