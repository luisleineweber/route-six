# Diamond native form inventory

## Active form data: 20 October 2026

Diamond now supports Sandy and Trash Burmy, Sandy and Trash Wormadam,
East Sea Shellos, and East Sea Gastrodon. The six alternate profiles match
native types, genders, and Egg Groups. Burmy can change cloak after a battle.
Wormadam retains its cloak. East Sea Shellos evolves into East Sea Gastrodon.
Local images, team selections, acquisition details, and PNG export keep one
National Dex identity for each species. Unown letters remain cosmetic
appearances under one selection. Origin Giratina and appliance Rotom have
no native Diamond form. See [the current review](diamond-pearl-progress-review.md).
The model gaps in the older inventory below are historical.

Review date: 2026-10-13. Scope: normal offline native Diamond play and ordinary postgame. Base species keep one shared National Dex identity. This inventory does not create a second identity for a form.

## Verified source basis

The PKHeX source at `641c26ba100225f3605e5a44b61b3b16e15a3774` exposes the Diamond/Pearl personal table (`PersonalTable.DP`) and defines its record as 0x2C bytes. `PersonalInfo4.cs` places types at offsets 0x06 and 0x07, gender ratio at 0x10, and Egg Groups at 0x14 and 0x15. Its form count and form-stat index fields are at 0x29 and 0x2A. This describes base personal records. It does not itself establish every persistent appearance or story acquisition.

Pinned sources:

- [PKHeX personal table](https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/PersonalTable.cs)
- [PKHeX Generation IV record layout](https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Info/PersonalInfo4.cs)
- [pret Diamond/Pearl species constants](https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/include/constants/pokemon.h)
- [pret Diamond personal archive](https://github.com/pret/pokediamond/tree/b623abef1b4dfe204ca50aab42447ac00c134290/files/poketool/personal)

The reconstruction stores personal records in archive members. The archive needs decoding and review before it can independently confirm each profile. The pinned PKHeX table is a source record, but the profile collection was not transcribed or cross-checked in this round.

## Diamond native forms

| Species | Native Diamond state | Gameplay effect | Current shared model gap |
| --- | --- | --- | --- |
| Unown | 28 letter appearances | Cosmetic appearance; same species identity and type | Form IDs and image selection are absent. A single National Dex sprite cannot name the selected letter. |
| Burmy | Plant, Sandy, and Trash Cloak | Cloak is persistent. Female Burmy evolves to Wormadam and retains the cloak; male Burmy evolves to Mothim. The result depends on gender and cloak. | Evolution condition can represent gender only if acquisition carries it; no form field preserves cloak or chooses form-specific evolution outcomes. |
| Wormadam | Plant, Sandy, and Trash Cloak | Persistent form follows Burmy's cloak. All are one National Dex species. | Form identity, image and possibly type data are missing. |
| Shellos | West Sea and East Sea | Persistent regional appearance; same species identity and typing. Both appearances occur in Diamond. | Source/form selectors and image paths are absent. |
| Gastrodon | West Sea and East Sea | Keeps Shellos's sea appearance on evolution; same species identity and typing. | Evolution cannot preserve a source form, and images cannot distinguish it. |
| Cherrim | Overcast and Sunshine | Sunshine is a battle-weather state. It is not a permanent acquisition form. | Battle-only form tracking is out of scope. |
| Spinda | Spot-pattern variants | Cosmetic variation only. | Pattern identity is not useful to access or team planning; do not expand it into species identities. |
| Unown ? and ! | The upper Solaceon chamber contains these appearances after the letter collection opens the tunnel. | Cosmetic appearance. | Keep one Unown selection. |

Diamond's Rotom has only its normal form. The appliance forms were added after Diamond and must not appear as native Diamond forms. The standard local path `/pokemon/<nationalDex>.png` can show the species, but it cannot represent Unown letters, Burmy cloaks, or sea appearances.

## Smallest shared model change

Add a shared `forms` identity collection linked to `pokemonId`, with stable form IDs and reviewed local images. Add an optional `formId` to game profiles and acquisition/evolution records. Define a base form explicitly where it affects images or evolution. Let an evolution rule state its output form and whether it preserves the input form. Keep species ID, National Dex number, gender, and game-specific types on their existing records. Do not create duplicate shared species identities.

Tests must prove that forms can share one species identity and differ in image, acquisition state, and evolution result. Test Burmy's gender-dependent branch and cloak preservation to Wormadam. Cherrim's temporary weather state needs no support in the native acquisition model.

## Open verification

- Verify future form-specific profile and asset data against the pinned Diamond personal archive and game scripts.
- Confirm which alternate forms Diamond encodes as player-selectable persistent data. Verify local artwork for each supported form.
- Confirm Diamond's Sinnoh regional order from its own Pokédex data. The 493 base profile identities are now covered. Do not copy Platinum's regional numbers.
- The 493 base profile layer is now written and reviewed. It does not represent alternate forms. No form-sensitive evolution or acquisition data is ready for registration.
