# Alpha Sapphire base profile review

Reviewed: 13 October 2026. This file records base species profiles only. It does
not approve acquisitions, exclusions, or game registration. Keep the game
disabled until the form and access layers are complete.

## Pinned sources

- PKHeX commit `641c26ba100225f3605e5a44b61b3b16e15a3774`.
  `PKHeX.Core/PersonalInfo/Info/PersonalInfo6AO.cs` defines the 0x50-byte
  personal record. `Type1` and `Type2` are bytes 0x06 and 0x07; gender is 0x12;
  Egg Groups are 0x16 and 0x17. `PersonalTable6AO.cs` indexes these records by
  species and form. The pinned binary table is
  `PKHeX.Core/Resources/byte/personal/personal_ao` (66080 bytes, 826 records).
  The profile list uses species records 1–721 only. The record type, not the
  later form records, supplies base types, gender ratios, and Egg Groups.
- ORAS Hoenn Dex numbers use the 211-entry order in Serebii's Hoenn Dex table.
  National numbers in its sprite links map each entry to the shared species ID.
- Shared names, National numbers, IDs, and local sprite paths use the reviewed
  shared `data/pokemon.json` and `public/pokemon/<nationalDex>.png` assets.

PKHeX is an interpreted personal-data table, not a full game reconstruction.
This review verifies the profile fields represented by those records. It does
not use personal records as proof of native acquisition.

## Profile review result

`data/games/alpha-sapphire/pokemon.json` has one base profile for each shared
species 1–721. Each profile has its Generation VI types, possible genders, Egg
Groups, local image, and review record. The Hoenn Dex numbers form one unique
sequence from 1 to 211. All other profiles omit `regionalDex`.

Do not treat the 721 profile rows as a complete supported-species or acquisition
review. Later source and evolution work must establish native availability,
transfers, event-only cases, and exclusions.

## Proposed shared references

Add these records to `data/references.json` when the parent integrates this
layer. The IDs below are used by the profile review records.

```json
[
  {
    "id": "alpha-sapphire-pkhex",
    "title": "PKHeX: Alpha/Omega personal data and record layout",
    "url": "https://github.com/kwsch/PKHeX",
    "revision": "641c26ba100225f3605e5a44b61b3b16e15a3774",
    "locator": "PKHeX.Core/PersonalInfo/Info/PersonalInfo6AO.cs; PKHeX.Core/PersonalInfo/Table/PersonalTable6AO.cs; PKHeX.Core/Resources/byte/personal/personal_ao; record offsets 0x06–0x07 types, 0x12 gender, 0x16–0x17 Egg Groups"
  },
  {
    "id": "alpha-sapphire-hoenn-dex",
    "title": "Pokémon Omega Ruby & Alpha Sapphire: Hoenn Pokédex",
    "url": "https://www.serebii.net/omegarubyalphasapphire/hoenndex.shtml",
    "revision": "live page checked 2026-10-13",
    "locator": "Hoenn regional numbers #001–#211 and National Dex species links"
  },
  {
    "id": "alpha-sapphire-bosses",
    "title": "Pokémon Omega Ruby & Alpha Sapphire: Gym Leaders",
    "url": "https://www.serebii.net/omegarubyalphasapphire/gyms.shtml",
    "revision": "live page checked 2026-10-13",
    "locator": "Gym and League first-run highest party levels"
  },
  {
    "id": "alpha-sapphire-type-chart",
    "title": "Type/Type chart: Generation VI onward",
    "url": "https://bulbapedia.bulbagarden.net/wiki/Type/Type_chart",
    "revision": "live page checked 2026-10-13",
    "locator": "Generation VI onward full type chart and changes from Generation V"
  }
]
```
## Required later model review

These are known review targets. Do not represent them with false generic rules.

- Forms need stable identities, form-specific types and images, gender selectors,
  form-aware acquisitions, and gender-conditioned evolution outputs. The current
  schema has no forms. Proposed identities/assets include Rotom forms for
  National Dex 479, Deoxys forms for 386, Hoopa forms for 720 if event access is
  in scope, and cosmetic form selections for Furfrou 676, Unown 201, Vivillon
  666, and other confirmed native species. Keep one species identity per Dex
  number and use local assets such as `/pokemon/forms/479-wash.png` only after
  the parent approves the shared asset convention.
- New evolution outcomes include female Combee to Vespiquen, male Kirlia to
  Gallade with a Dawn Stone, female Snorunt to Froslass with a Dawn Stone, and
  Burmy's gender-dependent branches. The current evolution conditions cannot
  express all of these reliably. Add a typed gender condition and branch-output
  model after game-specific verification.
- ORAS encounter methods include DexNav, Horde, Soaring, Mirage Spots, and
  fishing variations. Review whether the current source kinds and detail fields
  can preserve their method, access, level, and form distinctions. Add only the
  smallest tested method extensions that actual records need.
- The current shared type model has 17 types. Fairy requires the 18th type and
  a complete Generation VI chart. The Alpha Sapphire chart is already authored,
  but parent integration and shared type support remain required.
- Breeding needs the verified Alpha Sapphire hatch level, Incense outcomes,
  special egg species, egg gifts, genders, and Day Care gates. Do not reuse the
  Emerald hatch level or generic egg rules without evidence.
- Progress and story records need ORAS-specific gates for Gym and League
  progress, Team Aqua events, postgame Delta Episode, Soaring, Mirage Spots,
  legendary encounters, version-specific gifts, and event distribution scope.
  Review optional branches as optional milestones. Preserve item, badge, story,
  and choice gates exactly; do not copy Sapphire progression.
- Full boss party lists are not required by the current planner registration
  contract. `bosses.json` stores the highest party level used as a level cap.
  No extra boss-party feature is needed for this game.
## Thirteen game collections: locator and review state

| Collection | Exact locator | Review state |
| --- | --- | --- |
| `game.json` | XAMX extracted ORAS `a/0/2/9` global scripts and `a/0/1/3` map scripts; retail game constants for hatch level | Archive families identified. The exact milestone gates, default checkpoint, and hatch level remain open. |
| Game `pokemon.json` | PKHeX `PersonalInfo6AO.cs`, `PersonalTable6AO.cs`, `PersonalInfo.cs`, and `Resources/byte/personal/personal_ao`; Serebii Hoenn Dex table | Base profiles reviewed. Native support and acquisition are not established by the personal table. Regional sequence is reviewed from Serebii. |
| `type-chart.json` | Generation VI onward chart at Bulbapedia Type/Type chart; official Pokémon Fairy-type note at `https://www.pokemon.com/uk/pokemon-news/celebrate-25-years-of-pokemon-with-memorable-moments-from-the-kalos-region` | Chart file authored and reviewed in the previous round. Shared Fairy support remains open. The official note confirms Fairy's Dragon immunity, not the full matrix. |
| `progression.json` | XAMX extracted ORAS `a/0/2/9` global scripts and `a/0/1/3` map scripts; inspect game flags and map transitions | Archive families identified. Individual script IDs, flags, and mandatory dependencies remain open. |
| `bosses.json` | XAMX extracted ORAS `a/0/1/3` map scripts and `a/0/2/9` global scripts; Serebii Gym/League page for first-run highest levels | Highest party levels were reviewed and authored. Trainer parties and their individual levels are not needed by the current boss schema. |
| `locations.json` | XAMX extracted ORAS `a/0/1/3` map scripts; Alpha Sapphire map-name resources in a retail game dump | No full location list or per-location gate review. |
| `capabilities.json` | XAMX `a/0/1/3` and `a/0/2/9`; inspect HM, field move, badge, and event-flag checks | Archive families identified. Exact access gates remain open. |
| `items.json` | XAMX extracted ORAS `a/0/2/9/39.bin` field-item scripts and `a/0/1/3` map scripts; item data from the same dump | Field-item script locator identified. Shops, hidden items, pickups, held items, and finite quantities need review. |
| `choices.json` | XAMX extracted ORAS `a/0/1/3` map scripts and `a/0/2/9` global scripts | Archive families identified. Starter, fossil, and version-exclusive choices remain open. |
| `sources.json` | PKHeX `Encounters6AO.cs`, `EncounterArea6AO.cs`, `EncounterSlot6AO.cs`, `EncounterStatic6.cs`, and `EncounterTrade6.cs`; XAMX `a/0/1/3` and `a/0/2/9` | Structured candidate encounter data exists. Native sources, DexNav, Horde, Soaring, Mirage Spots, gifts, and event scope remain open. |
| `breeding-rules.json` | Alpha Sapphire Day Care and egg behaviour in retail game; PKHeX Gen VI encounter data for egg recipients; ORAS item data for Incense | Hatch level, special offspring, Incense, gender, and egg-gift rules remain open. Do not reuse Emerald or Sapphire records. |
| `evolutions.json` | PKHeX Gen VI personal/evolution legality data; XAMX `a/0/1/3` and `a/0/2/9` for game-specific gates | Base profile fields are reviewed. AS-specific evolution rules and extra conditions remain open. Mega Evolution and Primal Reversion are battle-only states. |
| `exclusions.json` | Reviewed Alpha Sapphire native encounter and event data; compare documented external events | No exclusions are approved. Do not infer an exclusion from missing acquisition work. |

XAMX archive paths are locations inside an extracted Alpha Sapphire dump. XAMX
does not include those game archives. The PKHeX paths are pinned candidate source
records, not a complete ORAS reconstruction. Do not claim the remaining
collections are reviewed from archive family names alone.
## Additional known evolution and access gaps

The current evolution model cannot express every later-generation rule. Review
these Alpha Sapphire cases against the pinned game content before adding rules:

- Gender branches: Burmy, Combee, Kirlia, and Snorunt.
- Party conditions: Pancham requires a Dark-type party member.
- Move conditions: Eevee needs a Fairy-type move for Sylveon; Tangela, Yanma,
  Piloswine, and other move-evolution families need the reviewed level-up move.
- Orientation action: Inkay evolves after a level-up while the system is held
  upside down. Do not encode this as a generic level evolution.
- Weather and time: Sliggoo needs rain; Tyrunt and Amaura have day/night
  conditions.
- Location and environment: review magnetic-field, Moss Rock, and Ice Rock
  evolution outcomes in ORAS. Do not carry forward a location from an earlier
  game without confirmation.
- Friendship and affection: Sylveon uses the Gen VI affection system plus a
  Fairy move. Check whether the current friendship condition can represent the
  actual ORAS requirement.
- Level-up conditions with a spare party slot, co-products, and item use need
  the same exact conditions as the selected game, including Nincada's Shedinja.

The acquisition model also needs review for finite DexNav searches, Horde
encounters, Soaring encounter regions, Mirage Spot gates, and special gift or
event branches. Add explicit requirements only when the source establishes them.
