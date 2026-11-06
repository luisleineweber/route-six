# Pok?mon Y form inventory

## Current integration: 21 October 2026

The active data has 19 alternate form profiles, 18 form changes, and local images. Thirteen alternate forms have native paths. Meowstic has separate male and female selections. Rotom keeps the Generation VI appliance types. All Pumpkaboo sizes are native. Gourgeist sizes need player trade. Cosmetic colors and battle states do not add permanent evolution records.

See [the X and Y Progress Planner review](xy-progress-review.md) for the active scope, source conflicts, and checks. The dated notes below are source history. Earlier pending states and model gaps are superseded by this integration.

## Earlier review history

Review date: 2026-10-13. Source: pinned PKHeX revision `641c26ba100225f3605e5a44b61b3b16e15a3774`.

## Verified native form data

`PersonalTable6XY.IsPresentInGame` and the form-index logic in `PersonalInfo6XY` identify the species whose form numbers are valid in Generation VI. The record layout gives each form's type, gender ratio, and Egg Groups. Y currently has only base-species profiles. Its profile layer does not yet select a form. Do not treat this inventory as proof of how a save unlocks or retains each form.

- Unown has letter forms; Burmy and Wormadam have cloak forms; Shellos and Gastrodon have East/West forms; Arceus has type forms; Deerling and Sawsbuck have seasonal forms; Genesect has drive forms.
- Scatterbug, Spewpa, and Vivillon have pattern forms. Flab?b? and Florges have flower-color forms; Floette has flower-color forms plus Eternal Flower; Xerneas has active and neutral forms.
- Furfrou has trim forms; Aegislash has Shield and Blade stances; Pumpkaboo and Gourgeist have size forms; Zygarde has 10%, 50%, and Complete forms.
- Wormadam has Plant, Sandy, and Trash Cloak forms with different types. Burmy gender determines whether it evolves to Wormadam or Mothim; the current evolution schema cannot express the gender-dependent outcome. Rotom has appliance forms that change its type combination. Arceus type forms change type with held Plates. These are persistent form/state changes and need exact Y-specific acquisition and persistence review.
- Mega forms exist for Venusaur, Charizard, Blastoise, Alakazam, Gengar, Kangaskhan, Pinsir, Gyarados, Aerodactyl, Mewtwo, Ampharos, Scizor, Heracross, Houndoom, Tyranitar, Blaziken, Gardevoir, Mawile, Aggron, Medicham, Manectric, Banette, Absol, Garchomp, Lucario, Abomasnow, and Latias/Latios. They are battle-only forms and are not permanent evolutions.

Flower colors for Flab?b?, Floette, and Florges; Vivillon wing patterns; Furfrou trims; Deerling/Sawsbuck seasons; and Xerneas' neutral state are cosmetic or display forms with no base type change in this inventory. Pumpkin size and Aegislash stance also do not create separate species identities. PKHeX's table includes form data beyond the listed set and its save/form handling code needs a follow-up pass. The list above is a source-backed inventory of major persistent and battle forms, not a complete exhaustive form-to-image mapping. Form counts and indices must be checked against the pinned table before implementing data.

## Model gap and next step

Keep one National Dex identity per species. The smallest shared change is a form collection with stable form IDs and species IDs, plus an optional form ID on game profiles, acquisition sources, and evolution outcomes. A form record needs game-specific type overrides and explicit image selection. Cosmetic forms can share types and acquisition rules while retaining separate display names or images. Battle-only Mega forms need a separate battle-state marker; do not add them as permanent evolutions.

Before form-sensitive data is authored, review Y-specific obtain, change, and persistence rules from a pinned game source. Add tests for a persistent type-changing form, a gender-changing form if supported, and an evolution outcome that depends on a form. Keep the base profile layer incomplete until the shared model exists.
