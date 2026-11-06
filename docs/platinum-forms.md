# Pokémon Platinum native forms

Update, 15 October 2026: the shared form model is implemented. Platinum has
seven reviewed alternate profiles and local images: Burmy and Wormadam Sandy
and Trash, East Sea Shellos and Gastrodon, and Giratina Origin. Team selection,
types, details and PNG export use the selected form. Access records remain
under review. The inventory below also includes forms that are not yet added.

Review date: 2026-10-13. Source: `pret/pokeplatinum` at
`fe1ea418a7364c93daf0d07ae55e195452d8803c`. The forms and form metadata are
in `res/pokemon/<species>/data.json` and, where split out, in
`res/pokemon/<species>/forms/<form>/data.json`. Examples include
`res/pokemon/wormadam/forms/sandy/data.json`,
`res/pokemon/wormadam/forms/trash/data.json`, and the five appliance records
under `res/pokemon/rotom/forms/`. Giratina Origin data is in
`res/pokemon/giratina/forms/origin/data.json`. This inventory covers normal
offline play and ordinary postgame. It excludes external distributions.

## Persistent or selectable forms

| Species | Platinum form(s) | Data effect | Treatment |
| --- | --- | --- | --- |
| Burmy | Plant, Sandy, Trash cloak | Type stays Bug. Cloak affects the form appearance and Wormadam's resulting form. | Track the acquired form. It determines the female evolution outcome. |
| Wormadam | Plant, Sandy, Trash cloak | Types are Bug/Grass, Bug/Ground, and Bug/Steel. Wormadam is female only. | Three form records under one National Dex identity. |
| Cherrim | Overcast, Sunshine | Type stays Grass. Sunshine is a battle state caused by weather. | Overcast is the persistent profile. Sunshine is battle-only. |
| Shellos | West Sea, East Sea | Type stays Water. | Appearance-only form. The regional forms are native and persistent. |
| Gastrodon | West Sea, East Sea | Type stays Water/Ground. | Appearance-only form. The regional forms are native and persistent. |
| Rotom | Normal, Heat, Wash, Frost, Fan, Mow | Platinum appliance forms have Electric/Ghost typing. Forms change battle moves and appearance, not species identity. | Track form and image; model all as Electric/Ghost in Platinum. |
| Giratina | Altered, Origin | Both are Ghost/Dragon in Platinum. Origin Forme requires the Griseous Orb. | Track form and held-item condition; do not create a second species. |
| Shaymin | Land, Sky | Land is Grass. Sky is Grass/Flying and has a different gender presentation. | Track form and image; model the Sky Forme transformation condition. |
| Arceus | Normal and type-dependent forms | The held Plate sets Arceus's type. | Needs a form/type rule tied to held item. Keep one species identity. |
| Unown | Alphabet and punctuation forms | Type stays Psychic. Appearance changes. | Cosmetic form selection. It does not change access or team identity. |
| Deoxys | Normal, Attack, Defense, Speed | Type stays Psychic. Stats and appearance change. | Persistent form choice. Do not create extra species identities. |

Burmy's cloak is set from its battle environments. A female Burmy evolves to
Wormadam and keeps its cloak. A male Burmy evolves to Mothim. This needs both a
form-aware evolution condition and gender-aware outcomes. The existing profile
and evolution model cannot represent those outcomes.

## Battle-only or temporary states

Castform's Sunny, Rainy, and Snowy states change its type during battle. These
are not persistent species forms for the team planner. Cherrim Sunshine is also
a battle-only state. Do not list Mega Evolution or Primal Reversion for
Platinum; the game does not have those mechanics.

## Smallest shared model change

Add a stable form collection keyed by `(gameId, pokemonId, formId)`. Profiles,
sources, evolution outcomes, team slots and sprite selection must accept an
optional form ID. Each form must hold its game-specific type set, possible
genders when they differ, and local sprite path. Add form requirements to
evolution and held-item transformation rules. Keep one shared National Dex
species identity. Define regional Dex behavior for forms before validating
regional numbers.

## Required assets

The base sprites do not establish distinct form artwork. Add reviewed
local assets for Wormadam's three forms, both Sea forms of Shellos and
Gastrodon, Rotom's five appliances, Giratina Origin Forme, Shaymin Sky Forme,
Arceus type forms, and Deoxys's three alternate forms. Add Unown and Burmy form
art only if the interface will display those selectable appearances. Each
asset needs a source and review record.
