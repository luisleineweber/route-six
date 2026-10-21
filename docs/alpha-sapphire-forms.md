# Alpha Sapphire native form inventory

Reviewed: 13 October 2026. Base profiles are in `data/games/alpha-sapphire/pokemon.json`.
They do not represent form identity. Keep the game disabled until the shared form
layer and form-sensitive acquisition, evolution, and image rules exist.

## Persistent forms that need explicit identity

| Species | Alpha Sapphire form behaviour | Type, gender, evolution, and image impact |
| --- | --- | --- |
| Rotom | Six persistent appliance forms; the game changes forms through the appliance catalogue. | Wash is Electric/Water, Frost is Electric/Ice, Fan is Electric/Flying, Mow is Electric/Grass, and Heat is Electric/Fire. Rotom has no gender and does not evolve. Each form needs its own profile type and image. |
| Deoxys | Normal, Attack, Defense, and Speed forms; the player can change its form at meteorites. It is available in the Delta Episode. | All forms are Psychic and genderless. They have different stats and images, but no different species or evolution outcome. |
| Hoopa | Confined and Unbound forms; the Prison Bottle changes the form and it reverts after a limited duration. Access depends on a distribution Hoopa and the item. | Confined is Psychic/Ghost; Unbound is Psychic/Dark. Both are genderless and do not evolve. Include as supported mechanics only if the scope later includes event Pokémon and item access. |
| Furfrou | Ten trims can be selected at a salon and later revert. | Normal type; gender can vary; no evolution change. Trim images differ. Model as cosmetic form state if the planner shows trim art. |
| Vivillon | Pattern is set by the save region, including the Fancy and Poké Ball patterns through distributions. | Bug/Flying; gender can vary; no evolution change. Pattern affects image only. Distribution patterns need a separate event scope decision. |
| Unown | Letter and punctuation forms can be found in Mirage Spots. | Psychic, genderless, and no evolution change. Form affects image only. |
| Spinda | Spot patterns vary between individuals. | Normal; gender can vary; no evolution change. The pattern does not need separate planner form IDs unless artwork renders it. |
| Castform | Forecast changes its weather appearance in battle. | Forms retain Normal type and gender/evolution. Battle-only; do not expose as a persistent team form. |

PKHeX's `PersonalTable6AO.IsPresentInGame` lists the Gen VI form ranges for
Unown, Burmy, Mothim, Shellos, Gastrodon, Arceus, Deerling, Sawsbuck, Genesect,
Scatterbug, Spewpa, Vivillon, Flabébé, Floette, Florges, and Xerneas. These are
record-layout support checks, not proof that Alpha Sapphire can natively obtain
each form. Do not infer native acquisition from this list. Confirm each species
and form against ORAS game content before adding an acquisition.

## Gender and evolution outcomes

The single `genders` set in a base profile cannot express gender-specific art or
evolution. Add explicit form or evolution conditions for these outcomes:

- Burmy evolves into Wormadam when female and Mothim when male. Wormadam also
  carries one of three cloak appearances based on its environment.
- Combee evolves into Vespiquen only when female.
- Kirlia can evolve into Gallade only when male and with a Dawn Stone; otherwise
  its level evolution leads to Gardevoir.
- Snorunt can evolve into Froslass only when female and with a Dawn Stone; its
  level evolution leads to Glalie.
- Gendered appearance records include Pyroar, Meowstic, Unfezant, Frillish,
  Jellicent, Hippopotas, and Hippowdon. These do not change the shared species
  identity. They need a gender-aware image selector if the UI must show the
  game's exact appearance.

These outcomes need game-reviewed evolution paths later. The PKHeX personal
record alone does not establish their Alpha Sapphire story gates or sources.

## Battle-only forms

Mega Evolution and Primal Reversion are temporary battle states. Some Mega
forms change type. Keep them out of permanent evolution and acquisition records.
Other temporary battle forms include Aegislash stance, Castform weather forms,
Cherrim sunshine, Darmanitan Zen Mode, Meloetta Pirouette, and Xerneas Active
Mode. They do not create another National Dex identity or an ordinary captured
form for this planner.

## Smallest shared model change

Add stable `forms` linked to one base species ID. A game profile should list its
supported forms and point to a default form. A form should carry its types,
image path, and optional gender or cosmetic selector. Acquisition and evolution
records should name a form only when the game requires one. Keep cosmetic
selectors separate from type-changing forms. Team slots must store the form ID
without changing the shared National Dex identity. Add tests for Rotom type and
image differences, Deoxys form selection, gender-gated evolutions, and forms
with cosmetic-only differences.

## Source evidence

- PKHeX pinned record layout and form presence table:
  `https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Info/PersonalInfo6AO.cs`
  and
  `https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Table/PersonalTable6AO.cs`.
- ORAS Hoenn Dex, including forms shown separately in the table:
  `https://www.serebii.net/omegarubyalphasapphire/hoenndex.shtml`.
- Form presence in PKHeX is evidence for stored Gen VI form indexes. Verify
  in-game method, persistence, and distribution status before authoring records.
## Evidence boundary

PKHeX's pinned personal table verifies stored species and form records and the
base profile fields. It does not prove that Alpha Sapphire natively obtains a
species or can switch every listed form. The form behaviours above are candidate
mechanics from Generation VI game references. They remain open until checked
against Alpha Sapphire scripts or direct game evidence. In particular, review
native access for Rotom, Unown, Furfrou, Vivillon, and each form separately.
Do not add form profiles or sources from this inventory alone.
