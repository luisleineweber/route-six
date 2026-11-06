# SoulSilver native form review

Checked on 13 October 2026 against `pret/pokeheartgold` at revision `53dded53802b237d39fabfd8ee396fe9cdc8aa3e`. This is a shared HGSS reconstruction. Confirm event availability for any distribution-gated item before adding an acquisition path.

## Verified form data

The personal table has base species records 1–493 and separate records for Deoxys Attack/Defense/Speed, Wormadam Sandy/Trash, Giratina Origin, Shaymin Sky, and five Rotom appliances. The extra rows retain their shared species IDs; they are form records, not new National Dex identities. `include/struct_defs/personal_narc_structs.h` defines the base record, while form selection is stored separately in Pokémon data. `include/constants/species.h` assigns the form constants after Arceus.

| Species | Native form behavior | Type, gender, evolution, or image effect | Status for planner |
| --- | --- | --- | --- |
| Unown | 28 letter/punctuation forms | Appearance only. One Psychic type, same gender, same evolution. | Form-specific images are cosmetic. |
| Burmy | Plant, Sandy, Trash cloaks | Appearance changes with battle locations. The stored cloak determines Wormadam's evolved form. | Must retain form through evolution to get the correct Wormadam type. |
| Wormadam | Plant, Sandy, Trash | Types are Bug/Grass, Bug/Ground, Bug/Steel. All female. Form is inherited from Burmy at evolution. | Required type variants and form-aware evolution. |
| Deoxys | Normal, Attack, Defense, Speed | Appearance and stats change. Psychic typing, genderless, and no evolution in all forms. | Form selection exists, but it does not change type or acquisition logic. |
| Shellos and Gastrodon | West Sea and East Sea | Appearance only in HGSS. Same Water type, gender rules, and evolution line. | Cosmetic form images. |
| Rotom | Normal plus five appliance forms | Appliance forms change appearance and moves; HGSS personal records retain Electric/Ghost typing. Genderless, no evolution. | Form and image selection needed. Do not apply later-generation type changes. |
| Pichu | Spiky-eared | Special event Pichu with a distinct appearance. It cannot evolve. | Event-only and outside the normal offline acquisition scope. Keep it out of native acquisition records. |
| Giratina | Altered and Origin | Same Ghost/Dragon typing and genderless state. Origin requires Griseous Orb; battle code also checks Distortion World. | Item/form gate needs SoulSilver item review. |
| Shaymin | Land and Sky | Sky changes to Grass/Flying and preserves genderless state. Gracidea changes form; game conditions revert it. | Form-specific type, image, and time/reversion rule. Confirm native item access before acquisition records. |
| Arceus | Normal plus one form per Plate | Multitype changes its type with its held Plate. Genderless, no evolution. | Form-specific types and image selection. Plate is an access requirement. |
| Castform | Normal, Sunny, Rainy, Snowy | Battle-only appearance and type changes from weather. | Do not model as a permanent party form. |
| Cherrim | Overcast, Sunshine | Battle-only appearance change. Type remains Grass. | Do not model as a permanent party form. |
| Spinda | Many spot patterns | Generated cosmetic pattern; no type, gender, evolution, or access change. | No separate form identity is needed for the planner. |
| Gender-dependent evolution outcomes | Burmy, Combee, Kirlia, Snorunt | Burmy's gender selects Mothim or Wormadam; female Combee can evolve to Vespiquen; male Kirlia can evolve to Gallade; female Snorunt can evolve to Froslass. | Evolution rules need explicit gender conditions. Burmy also needs its cloak form carried into Wormadam. |
| Gender-dependent sprite appearance | Multiple species | The game chooses gender-specific battle and follower graphics for some species. These are image variants, not new species identities or type forms. | If the planner displays sex-specific art, sprite selection must also accept gender. The current shared art has one image per National Dex number. |

## Model gap and next step

The current `PokemonProfile` has one type tuple and one sprite path per species. Acquisition sources and evolution rules have no form ID. This cannot represent Wormadam's three type outcomes, Arceus's Plate types, Shaymin Sky's type, or form images and continuity. Evolution rules also lack a gender condition for Burmy, Combee, Kirlia, and Snorunt.

Smallest shared change: add stable form IDs under each shared species identity, then allow a game profile, acquisition result, evolution rule, and team member to carry an optional form ID. Store form-specific types and `spriteSrc` in the game form record. Keep the National Dex identity unchanged. Add a gender condition to evolution rules and allow sprite selection by gender where the game has sex-specific art. Allow form transformations with explicit item, location, and game-state gates. Do not add separate party state for battle-only Castform or Cherrim appearances.

Required new shared species identities: none. Required assets: the current `/pokemon/<nationalDex>.png` assets give only one base image per species and do not prove all SoulSilver forms. Add reviewed local form images for Wormadam's Sandy/Trash cloaks, Arceus Plates, Shaymin Sky, Rotom appliances, and any other form the UI exposes. Keep one species identity per National Dex number.

## Evidence locators

- [Personal data](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/poketool/personal/personal.json) and [personal structure](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/include/struct_defs/personal_narc_structs.h)
- [Species and form constants](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/include/constants/species.h)
- [Form-sensitive battle calculations](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src/battle/overlay_12_0224E4FC.c)
- [Form item handling](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src/field_use_item.c)
- [Form update scripts](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/src/field/scrcmd_pokemon_misc.c)
- [Spiky-eared Pichu event and form flags](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/include/constants/pokemon.h) and [Ilex Forest event object](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/fielddata/eventdata/zone_event/114_D36R0101.json)
- [Johto Dex size constant](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/include/constants/johto_dex.h) and [Dex order data](https://github.com/pret/pokeheartgold/blob/53dded53802b237d39fabfd8ee396fe9cdc8aa3e/files/application/zukanlist/zkn_data/zukan_data.json). The `sorting` → `dex_order` → `johto` → `mons` array gives the exact 256 species order used for regional numbers 1–256.
