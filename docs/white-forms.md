# Pokémon White form inventory

Review date: 2026-10-13. This inventory is a base-species follow-up. It does not make White complete or ready for registration.

## Evidence and scope

The pinned [PKHeX revision](https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774) defines the Generation V personal record and its form table in `PKHeX.Core/PersonalInfo/Info/PersonalInfo5BW.cs` and `PKHeX.Core/PersonalInfo/Table/PersonalTable5BW.cs`. The White profile file records form-zero base species only. The game source remains incomplete for acquisition and encounter details. Form availability below is limited to the normal White game and its native content. Event and transfer access still need separate source review.

PKHeX maps several stored forms, but the table alone does not prove how White exposes them. The exact gameplay evidence must be reviewed before form records are accepted. This inventory names the known White-sensitive cases to check, and marks that limitation.

## Form-sensitive cases to review

| Species | Form set and effect | White relevance | Required model data |
| --- | --- | --- | --- |
| Unown | Aâ€“Z, `!`, `?`; appearance only, same type and gender rules | Form species are supported in the Gen V table | Stable form IDs and image paths; no duplicate species identities |
| Burmy | Plant, Sandy, Trash Cloak; appearance persists and chooses Wormadam's form on evolution | Form-dependent evolution outcome; Wormadam has Bug/Grass, Bug/Ground, or Bug/Steel typing | Source form, gender-conditioned evolution target and target form, form-specific type/image |
| Wormadam | Plant (Bug/Grass), Sandy (Bug/Ground), Trash (Bug/Steel) | Persistent, form-specific types | Form-specific profile typing and image |
| Mothim | Cloak appearance can persist; type remains Bug/Flying | Form state is cosmetic for this profile | Form-specific image only if the game retains the form |
| Cherrim | Overcast and Sunshine; Sunshine appears in battle in strong sunlight | Battle-only change; type stays Grass | Do not treat as a separately acquired or persistent form |
| Shellos, Gastrodon | West Sea and East Sea; appearance only, same types | Both patterns must be sourced for White acquisition | Form-aware source and image if both occur; no separate species ID |
| Rotom | Base, Heat, Wash, Frost, Fan, Mow; appliance forms add Fire, Water, Ice, Flying, or Grass to Electric | Persistent item/room-driven forms; acquisition and appliance access need White source confirmation | Form-specific type, image, and reviewed form-change capability |
| Giratina | Altered and Origin; different appearance and stats, same Ghost/Dragon typing | Origin is tied to Griseous Orb; check whether White has native access | Item/form gate, form image; same type if confirmed |
| Arceus | 17 type forms; type and appearance follow held Plate | Distribution-dependent in this game; do not grant access by profile alone | Form type, image, held-item gate, and event/native scope review |
| Deerling, Sawsbuck | Spring, Summer, Autumn, Winter; appearance follows season, types unchanged | Season changes are a core White mechanic | Four persistent/cosmetic form IDs and images; season change rule if progression display needs it |
| Basculin | Red- and Blue-Striped; appearance only, same Water type | Version encounter distribution can affect which form is native | Form on source outcomes and form-specific image; White source proof required |
| Darmanitan | Standard and Zen; Zen is Fire/Psychic and is activated by Zen Mode in battle | Zen Mode is an ability-driven battle state, not an acquired evolution | Keep base profile Fire; represent the battle state only if battle display is added |
| Meloetta | Aria and Pirouette; Pirouette is Normal/Fighting and follows Relic Song in battle | Form change is a battle action, not a separate native capture | Battle-only state; form-specific type only in battle calculations |
| Genesect | Drives alter appearance and Techno Blast's type, not Genesect's type | Item-driven appearance variants | Form/image support if visible in White; do not alter base Bug/Steel profile typing |

## Gender-specific appearance

Gender remains an individual property, not a second species identity. White species with visible gender-dependent sprites include Unfezant, Frillish, and Jellicent among Generation V species. Earlier species present in the National data also include Hippopotas and Hippowdon. A future image selector must support a gender-dependent image where the game shows one. The current single `spriteSrc` cannot do this.

Burmy evolution needs a separate gender rule: female Burmy evolves to Wormadam and male Burmy evolves to Mothim. The form of Burmy determines Wormadam's cloak and typing. Current evolution records cannot express both a gender-conditioned target species and a carried form.

## Smallest shared model change

Add stable shared form identities linked to one National Dex species. Add optional form references to game profiles, acquisition outcomes, and evolution targets. Store each form's game-specific types and local image. Add a narrowly typed form-change rule for White season, appliance, and held-item changes only after source review. Keep battle-only state separate from persistent acquisition forms. Add a gender-specific image key to the presentation record; do not create extra species for dimorphism.

Registration remains blocked until the native White form inventory, its access paths, and any required rule support have reviewed records and focused tests. The base profile file is intentionally not form-complete.

## Reviewed game behavior references

- [Shopping Mall Nine](https://bulbapedia.bulbagarden.net/wiki/Shopping_Mall_Nine) describes the White appliance room and Rotom changes. This is a secondary game reference; no White reconstruction locator is verified.
- [Burmy](https://bulbapedia.bulbagarden.net/wiki/Burmy) describes cloak retention, gender-specific evolution, and Wormadam typing. Use this as a review locator, not as a claim of pinned White source code.
- [Deerling](https://bulbapedia.bulbagarden.net/wiki/Deerling) describes the four seasonal forms and Generation V seasonal change behavior.
- [Unova Pokédex](https://www.serebii.net/blackwhite/unovadex.shtml) lists #000 Victini through #155 Genesect.

These sources identify the mechanics to model. They do not complete White acquisition review. Confirm form acquisition and access through a White reconstruction or captured game records before registration.