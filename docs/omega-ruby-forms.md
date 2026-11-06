# Omega Ruby native forms review

Review date: 2026-10-13. This is a form inventory, not an authored data layer.

## Verified facts

- PKHeX defines an ORAS personal record with base types, gender ratio, Egg
  Groups, form count, form-stat index, and form sprite metadata. Its record size
  is `0x50`. The record does not provide a game-profile form identity or a
  player access rule. See the pinned [PersonalInfo6AO.cs](https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Info/PersonalInfo6AO.cs),
  fields `Type1`/`Type2` (`0x06`/`0x07`), `Gender` (`0x12`), `EggGroup1`/`EggGroup2`
  (`0x16`/`0x17`), `FormStatsIndex` (`0x1C`), `FormSprite` (`0x1E`), and
  `FormCount` (`0x20`).
- ORAS introduces 20 Mega Evolutions and includes the Primal Reversions of
  Groudon and Kyogre. The official Pokémon ORAS site labels Primal forms and
  Mega forms separately. [Serebii's ORAS Mega Evolution guide](https://www.serebii.net/omegarubyalphasapphire/megaevolutions.shtml)
  lists the Mega Stones and Mega-capable species. These transformations happen
  in battle. They do not create a new National Dex identity or permanent
  acquisition evolution. Keep them out of the first persistent-form layer.
- The Hoenn Pokédex sequence contains 211 entries in ORAS. The list includes
  nine Sinnoh evolutions/pre-evolutions absent from the original Hoenn list:
  Budew, Chingling, Magnezone, Probopass, Gallade, Roserade, Rhyperior,
  Dusknoir, and Froslass. See the [ORAS Hoenn Pokédex list](https://pokemondb.net/pokedex/game/omega-ruby-alpha-sapphire).

## Persistent form inventory to model

These are base species identities with ORAS form state. A later reviewed layer
must confirm native access and the exact local image for each state. Do not add
duplicate National Dex identities.

| Species or family | Persistent states / difference | Scope note |
| --- | --- | --- |
| Deoxys | Normal, Attack, Defense, Speed; same Psychic type, distinct appearance and stats | Form can persist outside battle. Review ORAS form-change event and access gate. |
| Rotom | Normal, Heat, Wash, Frost, Fan, Mow; appliance forms change type | Persistent form change. The model needs per-form types and images. |
| Giratina | Altered and Origin; same Ghost/Dragon types | Persistent form depends on held item. Access, item, and image must attach to form. |
| Shaymin | Land and Sky; same Grass typing | Persistent form change. Confirm ORAS availability and conditions before records. |
| Arceus | Form follows held Plate; type changes with Plate | Many type states, one species. Avoid one flattened form with one type. |
| Genesect | Drives change Techno Blast type, not species typing | Cosmetic/battle presentation and move effect do not alone justify a type form. Review image requirements separately. |
| Unown | Letter forms | Cosmetic form states. Form image may differ, but species typing and acquisition rules do not. |
| Castform | Sunny, Rainy, Snowy weather forms | Battle-only weather changes. Do not treat as persistent acquisition forms. |
| Cherrim | Sunshine form | Battle-only weather change. |
| Aegislash | Shield and Blade | Battle-only stance change. |
| Darmanitan | Zen Mode | Battle ability state. Not a persistent acquisition form. |
| Furfrou | Trim styles | Cosmetic persistent forms; confirm which trims and image assets are in ORAS. |
| Vivillon | Wing patterns | Cosmetic persistent forms; pattern distribution is a separate form state. |
| Flabébé, Floette, Florges | Flower colors | Cosmetic forms. Evolution outcome uses species identity; color may persist. |
| Pumpkaboo, Gourgeist | Size forms | Persistent appearance/stat variants; evolution preserves size. |
| Basculin | Red- and Blue-Striped | Persistent appearance variant. Confirm regional ORAS access. |
| Deerling, Sawsbuck | Seasonal forms | Persistent appearance state. In-game season rules require review. |
| Shellos, Gastrodon | East/West Sea | Persistent appearance variants. |
| Spinda | Spot patterns | Large cosmetic pattern set; do not enumerate patterns as species. |
| Unisex/gender-form species | Nidoran pair, Indeedee not in this generation; Meowstic male/female, Pyroar male/female | Gender-based differences in species identity or appearance must not become gender probabilities or separate National Dex identities. Pyroar and Meowstic use one species identity each in this app's identity table; model gender-specific images if needed. |
| Pikachu | Cosplay Pikachu costumes | Special persistent costume state; confirm ORAS access and image assets. |

This inventory is a discovery list, not a claim that every named form has a
native ORAS acquisition path. Items marked for confirmation remain open. PKHeX
table form metadata and the official ORAS forms page are evidence for form
structure; they do not establish each native acquisition gate.

## Smallest shared model change

Add a shared form identity keyed by `{ pokemonId, formId }`, then let each game
profile select a base form and declare form records with their own types,
gender profile when the game changes it, and local `spriteSrc`. Let source and
evolution records point to an optional form ID. Keep form state separate from
the six species team slots and National Dex identity. Add explicit transition
kind (`persistent`, `cosmetic`, or `battle-only`) so Mega/Primal states cannot
be mistaken for permanent evolutions. Add regional Dex ordering at the base
species level unless a game's official Dex explicitly numbers forms.

Do not implement this proposal in the Omega Ruby files. Parent owns shared
schema, domain, and UI changes.
