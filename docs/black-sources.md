# Pokémon Black source review

Checked on 2026-10-13. Scope: English Pokémon Black Version 1.0 (USA/EUR,
NDSi Enhanced), not White or either sequel.

## Pinned reconstruction review

The source reconstruction is [squiddonaut/pokeblack](https://github.com/squiddonaut/pokeblack),
commit `bbb5cd501426c1ca5f16a9d09c8d91fd03a1c12b`. Its README identifies the
target ROM by SHA-1 `26ad0b9967aa279c4a266ee69f52b9b2332399a5`.
The repository calls itself a decompilation of English Pokémon Black. Its
`data/README.md` says the data files for species, moves, trainers, and other
records have not been examined. At the pinned commit, `data/` contains only
`README.md` and `arm9_data.s`. The small `src/` tree has only battle and
unattributed functions; it does not provide named game-data definitions.
Therefore this pin identifies the correct version but does not yet establish
the game records below. Do not cite it as evidence for guessed records.

Repository locators were checked in the recursive Git tree at the pinned
commit. These are the nearest exact locators found for the thirteen required
collections. `UNAVAILABLE` means that the pinned tree does not expose a reviewed
record or a descriptive source locator for that collection. Numeric paths under
`files/a/` are extracted assets, not verified collection locators.

| Collection | Exact locator in pinned repo | Review result |
| --- | --- | --- |
| Game metadata and planner | `data/README.md` | UNAVAILABLE; README only describes repository scope. |
| Profiles and supported species | `data/README.md` | UNAVAILABLE; README names species data but says it has not been examined. |
| Type chart | `data/arm9_data.s` | UNAVAILABLE; raw aggregate data, no decoded table locator. |
| Progression | `files/a/` | UNAVAILABLE; extracted numbered assets, no reviewed script map. |
| Bosses | `data/README.md` | UNAVAILABLE; README names trainer data but says it has not been examined. |
| Locations | `files/a/` | UNAVAILABLE; no decoded map or location index. |
| Capabilities | `files/a/` | UNAVAILABLE; no reviewed event or field-move gates. |
| Items and item sources | `files/a/` | UNAVAILABLE; no decoded item table or item-ball scripts. |
| Choices | `files/a/` | UNAVAILABLE; no decoded version-specific choices. |
| Acquisition sources | `data/README.md` | UNAVAILABLE; species data is unreviewed and encounter tables are not named. |
| Breeding rules | `data/README.md` | UNAVAILABLE; no reviewed compatibility or offspring table. |
| Evolutions | `data/README.md` | UNAVAILABLE; no reviewed evolution table. |
| Exclusions | `data/README.md` | UNAVAILABLE; no reviewed native-acquisition or version-difference table. |

## Proposed shared references

These IDs are proposals only. The parent must add them to `data/references.json`
before records can validate. Do not use them to imply reviewed records.

```json
[
  {
    "id": "black-reconstruction",
    "title": "English Pokémon Black Version 1.0 reconstruction",
    "locator": "Repository README; data/README.md; recursive tree at commit bbb5cd501426c1ca5f16a9d09c8d91fd03a1c12b",
    "url": "https://github.com/squiddonaut/pokeblack/tree/bbb5cd501426c1ca5f16a9d09c8d91fd03a1c12b",
    "revision": "bbb5cd501426c1ca5f16a9d09c8d91fd03a1c12b"
  }
]
```

## Reviewed Black base profiles (2026-10-13)

Black and White share the pinned PKHeX Generation V personal table. At commit
`641c26ba100225f3605e5a44b61b3b16e15a3774`, `PersonalTable.BW` loads
`GetTable("bw")`. The same table class sets `MaxSpecies` to
`Legal.MaxSpeciesID_5` (649), parses `data.Length / 0x3C` records, and resolves
form entries. `PersonalInfo5BW.cs` reads the two type bytes, gender ratio, and
two Egg Group bytes from each record. PKHeX documents the record format and
field meanings; it is not a Black ROM reconstruction. The repository resource
stores the shared BW personal data as an embedded binary table.

The pinned code defines a single BW personal table, rather than separate
Black and White tables. White's 649 profile records were reviewed against this
same PKHeX table by the White task. I compared all 649 Black records to White
for species ID, types, gender values, Egg Groups, and sprite path. All fields
match. This supports those base profile fields only. It does not transfer
White's species access, encounters, regional order, items, or story gates to
Black. Black `pokemon.json` therefore records no regional Dex numbers pending
a Black-specific ordering review.

The shared identity list has all National Dex 1-649 IDs, and local sprite paths
exist for all 649. The Black profile file contains exactly those 649 entries.
The file uses the proposed `black-personal-table` reference ID. Parent must
add that reference to `data/references.json` before data validation can pass.

### Proposed profile reference

```json
[
  {
    "id": "black-personal-table",
    "title": "PKHeX Black and White Generation V personal records",
    "locator": "PKHeX.Core/PersonalInfo/PersonalTable.cs: PersonalTable.BW = new(GetTable(\"bw\")); PKHeX.Core/PersonalInfo/Table/PersonalTable5BW.cs: MaxSpecies, SIZE-based table count and form indexing; PKHeX.Core/PersonalInfo/Info/PersonalInfo5BW.cs: type, gender ratio and Egg Group fields; embedded PKHeX.Core/Resources/byte/personal/personal_bw resource",
    "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774"
  }
]
```

### Limits and remaining work

- The 649 personal profiles do not prove every species is natively obtainable
  in Black. Review Black's species coverage and exclusions separately.
- Review Black's own Unova order before adding regional numbers. Do not copy
  White's version-specific Pokédex assignments without checking them.
- The current schema has no persistent form identity, form-specific type or
  sprite, or source outcome by form. Black needs a shared form model for
  Basculin stripes, seasonal Deerling and Sawsbuck, and Rotom appliance forms.
  Do not turn Darmanitan Zen Mode or Meloetta Pirouette into permanent species
  profiles. Confirm their game scope and event gates in a Black ROM source.
- The current evolution model cannot express evolution while knowing a move,
  evolution at an exact location, or a two-species trade condition. Review
  every Black evolution and add tested condition rules before authoring those
  records. Do not use a generic level trigger for these cases.
- The wild-method model cannot distinguish dark grass, rustling grass, dust
  clouds, rippling water, or bridge shadows. It also cannot preserve
  phenomenon-specific encounter conditions and rates. Add tested method and
  source-detail support before writing those encounters.
- The breeding model has one parent family, offspring list, and optional held
  item per rule. Review Black's incense, gender-dependent offspring, and
  alternate offspring rules. Extend and test the rule model where one rule
  cannot express the actual outcome.
- Black uses 17 types and no Fairy type. The existing matrix shape supports
  this chart; the game-specific chart was not independently sourced from a
  Black reconstruction. Parent owns the shared type chart files for this task.
- The progression and requirement model can represent ordinary story
  milestones and capabilities. It cannot express all species, move, season,
  daily, or world-state gates without new tested conditions. Locate and review
  Black scripts before writing gates. Do not copy White's routes or events.
- The pinned `pokeblack` reconstruction does not expose verified locators for
  any of the thirteen collections. Its README says its game data remains
  unexamined. The thirteen-locator table above marks those collection sources
  unavailable; PKHeX supports the profile layer only.

## Required next steps

1. Find a lawful, descriptive Black 1.0 source reconstruction or a primary
   reference that decodes game data. Pin its commit and map each collection to
   exact files and symbols. Do not infer data from Black 2, White, or a shared
   Gen V database.
2. Add shared identities for the supported Gen IV and V species, after coverage
   is verified. The current shared catalogue ends at National Dex 386.
3. Add a shared form layer. Black needs at least seasonal Deerling/Sawsbuck and
   Basculin's two forms; battle form changes also include Zen Mode Darmanitan
   and other temporary or battle-only forms. State the acquisition scope for
   each before modeling it. Current profiles cannot identify forms or give
   forms separate sprites and types.
4. Add explicit evolution conditions and tested domain rules for level-up while
   knowing a move, and level-up at a location. Existing requirements can name
   items, milestones, capabilities, and species, but they do not encode the
   move-known or exact-location predicates. A trade evolution is represented
   as a blocked player-trade trigger; do not claim it as native access. Do not
   replace other triggers with generic level-up or item use.
5. Extend wild method and source details for Black's dark grass, rustling
   grass, dust clouds, rippling water, bridge shadows, and phenomenon-specific
   encounters. Current methods cannot distinguish them or preserve their
   requirements and rates.
6. Extend story, capability, and requirement rules for seasons and relevant
   party/species/move gates. Current generic milestone and capability records
   cannot state those conditions. Review Black's version-specific choices,
   one-time gifts, fossils, trades, post-game areas, and event-only species.
7. Keep the Black type chart at the 17 types used in Generation V. The current
   chart shape can represent it, but no reviewed Black chart locator was found.
   Fairy is not part of this game's type set.


## Reviewed partial layer (2026-10-13)

The following independent layers are now authored. They do not complete the
Black dataset and must not enable the game.

### Trainer level caps

`data/games/black/bosses.json` records the highest party level for each of the
eight first-run Gym battles, the four first-run Elite Four battles, N, and
Ghetsis. The trainer-page source lists each party member and level. The
launch-era source independently reports the gym and League levels. The schema
stores only `highestLevel`; it cannot retain the party roster or each member's
level. The file therefore stores only the highest level per battle. It omits
Elite Four rematches and Alder's postgame battle.

The first Striaton leader changes with the selected starter. The three leaders
use different types. The schema permits a null specialty type, so the record
keeps the shared Gym battle and maximum level without claiming one type. It
cannot represent the starter choice or the three alternate parties.

PKHeX at `641c26ba100225f3605e5a44b61b3b16e15a3774` was checked. Its pinned
README describes a save editor and entity-file support. Its tree includes
`PKHeX.Core/PersonalInfo/Table/PersonalTable5BW.cs` and Gen V personal data,
but no Black trainer party dataset. It is not used as trainer evidence.

### Type chart

`data/games/black/type-chart.json` uses the 17-type chart for Generations II
through V. The full pre-Generation-VI table on Bulbapedia was checked against
the Generation V historical damage relations in PokéAPI's type records. It has
no Fairy type. The numeric chart matches this project's Emerald chart because
no type matchup changes separate Generation III from V.

### Hatch level

The reviewed Black scope supports breeding. Eggs hatch at level 1. Bulbapedia's
breeding article states that eggs hatch at level 1 from Generation IV onward;
Pokémon Database's breeding guide independently states the same. This is a
verified game fact, but no `game.json` was written because there is no reviewed
Black checkpoint layer yet.

## Proposed shared references

Add these references before integrating the local records. The IDs are local
to Black.

```json
[
  {
    "id": "black-bosses",
    "title": "Black and White Gym Leaders and Elite Four",
    "locator": "Gym Leaders: sections Gym #1–#8; Elite Four #1–#4; Other trainers: N and Ghetsis",
    "url": "https://pokemondb.net/black-white/gymleaders-elitefour"
  },
  {
    "id": "black-launch-observation",
    "title": "Pokémon Black and White game coverage (launch-era observations)",
    "locator": "Game Coverage, lines headed Gym Leader data and Elite Four data, 2010-09",
    "url": "https://www.pokebeach.com/2010/09/pokemon-black-and-white-game-coverage-begins"
  },
  {
    "id": "black-type-chart",
    "title": "Type chart",
    "locator": "Between Generations V and VI; 17-type Generation V matchup matrix",
    "url": "https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart"
  },
  {
    "id": "black-type-chart-crosscheck",
    "title": "PokéAPI type data",
    "locator": "Type records 1–17; Generation V past_damage_relations",
    "url": "https://pokeapi.co/api/v2/type/"
  },
  {
    "id": "black-breeding-level",
    "title": "Pokémon breeding",
    "locator": "Egg hatching level by generation",
    "url": "https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_Breeding"
  },
  {
    "id": "black-breeding-level-crosscheck",
    "title": "Breeding guide and Egg Groups",
    "locator": "Egg hatching level",
    "url": "https://pokemondb.net/mechanics/breeding"
  },
  {
    "id": "black-pkhex-pin",
    "title": "PKHeX source tree at pinned revision",
    "locator": "README.md; PKHeX.Core/PersonalInfo/Table/PersonalTable5BW.cs; recursive tree",
    "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774"
  },
  {
    "id": "black-personal-table",
    "title": "PKHeX Generation V personal records",
    "locator": "PKHeX.Core/PersonalInfo/Table/PersonalTable5BW.cs and PKHeX.Core/PersonalInfo/Info/PersonalInfo5BW.cs; embedded Black/White personal table resource",
    "url": "https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774"
  },
  {
    "id": "black-form-review",
    "title": "Pokémon Black and White alternate forms",
    "locator": "Alternate Forms; Basculin, Rotom, Darmanitan, Deerling, Sawsbuck, Meloetta",
    "url": "https://www.serebii.net/blackwhite/forms.shtml"
  },
  {
    "id": "black-unova-dex",
    "title": "Pokémon Black and White Unova Pokédex",
    "locator": "Unova Pokédex entries #000–#155; Victini #000 and Genesect #155",
    "url": "https://www.serebii.net/blackwhite/unovadex.shtml"
  }
]
```

## Base profile layer review (2026-10-13)

The shared identity catalogue and local sprite files now contain species 1–721.
That removes the earlier identity and image dependency for Black's 649 base
species. It does not supply reviewed Black profile facts.

The pinned PKHeX source provides one shared Generation V Black/White personal
table through `PersonalTable.BW`, `PersonalTable5BW.cs`, and
`PersonalInfo5BW.cs`. The table uses 0x3C-byte records and supports species IDs
through 649. Black's 649 base profiles match White's reviewed records for types,
genders, Egg Groups, and sprite paths. The table is embedded binary data. It
does not establish Black's native supported species, acquisitions, or regional
order. The profile file cites proposed reference `black-personal-table`.

See `docs/black-forms.md` for the form inventory and proposed shared model.
Black's single regional numbering sequence can use the existing schema, with
0 for Victini and 1–155 for the numbered Unova entries. Verify each assignment
against a Black-specific source before writing it.

## Remaining schema and data gaps

- Party members and their individual levels are outside the boss schema.
- Starter-conditioned Striaton leader, specialty, and party alternatives are
  outside the boss and choice schemas.
- `game.json` needs at least one real authored checkpoint. No Black progression
  checkpoint is established in this partial layer.
- The current global identity catalogue does not cover all Black species/forms.
  Parent must add the required species identities and decide a form layer.
- Previously listed form, evolution-condition, encounter-method, story-gate,
  item, location, and coverage gaps remain. The partial boss and type layers do
  not resolve them.
