# HeartGold form inventory

Review date: 2026-10-13. Source revision:
`53dded53802b237d39fabfd8ee396fe9cdc8aa3e`.

HeartGold keeps one National Dex identity per species. The base profile layer
does not claim to model forms. Records in `personal.json` include dedicated
form stat/type records, and `include/constants/pokemon.h` declares form ranges.
`include/battle/battle.h` stores a form value. These facts establish native
form handling. The form model must keep form-specific facts alongside the
species identity.

## Persistent forms and form-sensitive facts

| Species | Native forms | Data effect | Persistence and image |
| --- | --- | --- | --- |
| Unown | A–Z, `!`, `?` | Appearance only | Persistent; form-specific sprite |
| Deoxys | Normal, Attack, Defense, Speed | Stats and appearance; same Psychic type and genderless status | Persistent in HeartGold; form-specific sprite |
| Burmy | Plant, Sandy, Trash cloak | Appearance; gender affects its later evolution | Persistent; cloak-specific sprite |
| Wormadam | Plant, Sandy, Trash cloak | Bug/Grass, Bug/Ground, Bug/Steel respectively | Persistent; type and sprite vary |
| Shellos | West Sea, East Sea | Appearance only; same Water type | Persistent; form-specific sprite |
| Gastrodon | West Sea, East Sea | Appearance only; same Water/Ground types | Persistent; form-specific sprite |
| Rotom | Normal, Heat, Wash, Frost, Fan, Mow | Alternate forms change type and stats; form-specific sprite | Persistent after appliance change |
| Giratina | Altered, Origin | Same Ghost/Dragon type; stats and appearance differ | Origin is a persistent held-item form; form-specific sprite |
| Shaymin | Land, Sky | Sky changes to Grass/Flying; both remain genderless | Persistent while conditions permit; form-specific sprite |
| Arceus | Normal plus 17 Plate types | Type changes with held Plate; form-specific sprite | Persistent while holding Plate |

The exact form IDs and counts are in `include/constants/pokemon.h`:
`UNOWN_FORM_MAX=28`, `DEOXYS_FORM_MAX=4`, `BURMY_FORM_MAX=3`,
`WORMADAM_FORM_MAX=3`, `SHELLOS_FORM_MAX=2`, `GASTRODON_FORM_MAX=2`,
`ROTOM_FORM_MAX=6`, `GIRATINA_FORM_MAX=2`, `SHAYMIN_FORM_MAX=2`, and
`ARCEUS_FORM_MAX=18`. `personal.json` stores separate personal records for
forms, with distinct typing for Wormadam, Rotom, Shaymin, and Arceus.

Burmy's evolution outcome depends on both gender and form condition: female
Burmy evolves to the matching Wormadam cloak; male Burmy evolves to Mothim.
This means form data and the evolution rule must share a form-aware condition.

## Cosmetic and battle-only changes

Cherrim has Cloudy and Sunny battle forms. Castform has Normal, Sunny, Rainy,
and Snowy battle forms. These are temporary battle states and do not need
separate team identities or acquisition profiles. Spinda's pattern and
ordinary gender differences are per-individual appearance variation rather
than selectable species forms. Transform is also a temporary battle state.

Pichu's Spiky-eared form is not a standard HeartGold obtainable form; do not
include it in the native collection. The source enum includes it for shared
engine and cross-version data.

## Smallest shared model change

Add stable form identities under each existing National Dex species. Allow a
game profile and an acquired individual to name a form; let a form override
types and image while inheriting species gender and Egg Groups unless reviewed
otherwise. Evolution rules need optional source-form and outcome-form fields
for Burmy. Acquisition records need form variants where the game fixes or
changes a form. Team slot identity must remain the species ID plus optional
form ID. Keep one shared species identity and do not add duplicate National
Dex records. The present profile schema cannot represent either form-specific
types or form-specific image selection.

## Evidence

- `include/constants/pokemon.h`: complete form enum and form counts.
- `files/poketool/personal/personal.json`: per-form typing, Egg Group, gender,
  and form records in the `baseStats` array.
- `include/battle/battle.h`: battle Pokémon form field.
- `src/use_item_on_mon.c`, `src/pokemon.c`, and `src/get_egg.c`: item-based,
  species initialization, and egg paths that need form handling review.
- `src/battle/` form-change handlers: temporary weather and battle form
  transitions. Exact item and location gates remain for the later acquisition
  and evolution layer.

Verified scope: the inventory above is the source-declared form set and
form-sensitive profile layer. Unresolved: exact HeartGold gameplay gates,
form-specific acquisition availability, and all form-changing triggers need
record-level script review before registration.
