# Pokémon Black native form review

Checked on 2026-10-13. This is a form inventory for the base-profile layer.
It does not declare game acquisition paths or finish Black data.

## Verified source model

PKHeX at revision `641c26ba100225f3605e5a44b61b3b16e15a3774` maps Black and
White records through `PKHeX.Core/PersonalInfo/Table/PersonalTable5BW.cs` and
`PKHeX.Core/PersonalInfo/Info/PersonalInfo5BW.cs`. The table lookup uses
species and form indexes. It lists special form indexes for Unown, Burmy,
Mothim, Cherrim, Shellos, Gastrodon, Arceus, Deerling, Sawsbuck, and Genesect.
This confirms that one National Dex identity can have several personal-data
forms. It does not by itself establish that each form is obtainable in Black.

PKHeX also maps the base type, gender ratio, and two Egg Groups from the
personal record. Its field definitions establish the binary facts that a
profile needs. The pinned source stores the personal table in resources, not in
a hand-readable species table. No record-by-record transcription was reviewed
in this round. Do not use this note as approval for unreviewed profiles.

## Native forms to model

| Species | Black form states | Data differences relevant to planner | Treatment |
| --- | --- | --- | --- |
| Basculin | Red-Striped, Blue-Striped | Same Water type, gender range, Egg Group, and evolution outcome. Different appearance. | Persistent cosmetic form. Black-specific availability still needs encounter source review. |
| Deerling | Spring, Summer, Autumn, Winter | Same Normal/Grass types, gender range, Egg Groups, and evolution outcome. The form follows the in-game season. | Persistent seasonal appearance. It can change with the season; do not model four species or four evolutions. |
| Sawsbuck | Spring, Summer, Autumn, Winter | Same Normal/Grass types, gender range, Egg Groups, and evolution outcome. The form follows the in-game season. | Persistent seasonal appearance. It can change with the season; do not model four species or four evolutions. |
| Rotom | Normal plus five appliance states | Normal is Electric/Ghost. Appliance states are Electric/Fire, Electric/Water, Electric/Ice, Electric/Flying, and Electric/Grass. Gender and Egg Groups do not change. Appliance state also changes appearance and move access. | Persistent selectable form after the in-game appliance interaction. Keep one species identity. |

## Battle-only states

| Species | State | Treatment |
| --- | --- | --- |
| Darmanitan | Zen Mode | Battle-only ability state. It changes appearance and type to Fire/Psychic while active. It is not a permanent evolution or a separate base profile. |
| Meloetta | Pirouette Forme | Battle-only Relic Song state. It changes appearance and type while active. It is not a permanent evolution or a separate base profile. |

Kyurem's Black and White fused forms are not native forms in Black Version.
Do not include them in the Black inventory. Therian Formes belong to Black 2
and White 2 content, not Black Version. Genesect's drives alter Techno Blast's
type and appearance state; they do not create another species identity or
permanent type profile.

## Required shared model change

Add a small shared form collection linked to the existing species ID. Give
each form a stable ID, display name, local image, form type override when
needed, and a reviewed form-change kind. Let a profile select the native form
states that the game can present. Keep acquisition sources and evolution
outcomes attached to the species unless reviewed game data proves that a form
changes them. Add a distinct battle-state value only if the planner later needs
to show battle-only type states; do not put those states in the permanent form
catalogue by default.

The regional Pokédex still orders species, not each cosmetic form. Keep one
regional number for each species. Black's profile data can use the existing
single regional sequence once its exact supported species list and records
have been reviewed.

## Sources and open review

- [PKHeX PersonalTable5BW.cs at the pinned revision](https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Table/PersonalTable5BW.cs), form-index handling and supported form checks.
- [PKHeX PersonalInfo5BW.cs at the pinned revision](https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Info/PersonalInfo5BW.cs), base field offsets and form-data access.
- [Serebii Black and White alternate forms](https://www.serebii.net/blackwhite/forms.shtml), Black/White form behavior and version availability. This is a secondary cross-check, not the source of base personal records.

Before registration, inspect the Black 1.0 form resources and event scripts.
Confirm Rotom's appliance interaction, the two Basculin stripe encounter
outcomes, seasonal transitions, and event access for battle-form species.
The current game profile has no form field and one sprite path per species.
