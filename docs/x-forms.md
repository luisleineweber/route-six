# Pokemon X native forms review

## Current integration: 21 October 2026

The active data has 19 alternate form profiles, 18 form changes, and local images. Thirteen alternate forms have native paths. Meowstic has separate male and female selections. Rotom keeps the Generation VI appliance types. All Pumpkaboo sizes are native. Gourgeist sizes need player trade. Cosmetic colors and battle states do not add permanent evolution records.

See [the X and Y Progress Planner review](xy-progress-review.md) for the active scope, source conflicts, and checks. The dated notes below are source history. Earlier pending states and model gaps are superseded by this integration.

## Earlier review history

Review date: 2026-10-13. Scope: native offline Pokemon X through ordinary postgame. This note inventories the persistent forms that affect profile types, images, or acquisition. It does not add form records. Pokemon X stays disabled until the shared form model and form-sensitive acquisition data are ready.

## Verified native form findings

| Species | X form behavior | Profile impact | Evidence |
| --- | --- | --- | --- |
| Rotom | The player can find Rotom at the Lost Hotel and change it with appliances at the Lumiose Pokemon Lab. Appliance forms replace Ghost with Fire, Water, Ice, Flying, or Grass. | The base form is Electric/Ghost. The five persistent appliance forms need distinct types and form images. Gender and evolution do not change. | [Serebii X/Y forms](https://www.serebii.net/xy/forms.shtml); [Serebii Rotom X/Y](https://www.serebii.net/pokedex-xy/479.shtml); pinned PKHeX `PersonalInfo6XY.cs` form fields. |
| Vivillon | Pattern depends on the console region. X/Y has multiple patterns, including patterns unavailable by normal local play. | Cosmetic pattern forms. Type, gender, and evolution do not change. Keep local native-pattern access separate from connected or distributed patterns. | [Pokemon Database Vivillon](https://pokemondb.net/pokedex/vivillon); [Serebii X/Y forms](https://www.serebii.net/xy/forms.shtml). |
| Flabebe line | Flabebe and its evolutions retain flower color. X/Y encounter Flabebe with location-based flower colors. | Cosmetic flower forms. Type, gender, and evolution do not change. Floette's Eternal Flower is a story character form and is not a normal player acquisition. | [Serebii X/Y forms](https://www.serebii.net/xy/forms.shtml); pinned PKHeX X/Y encounter and personal data. |
| Furfrou | The player can trim Furfrou and the trim expires after time. | Cosmetic trims with the same type, gender, and evolution. The current progress model does not track elapsed time, so trim persistence must not affect access. | [Serebii X/Y forms](https://www.serebii.net/xy/forms.shtml). |
| Xerneas | Battle-active and neutral appearance states differ visually. | Battle state only. Type, gender, and evolution do not change. A form-aware display can map both battle states to one stored species profile unless the app models battle state. | [Serebii X/Y forms](https://www.serebii.net/xy/forms.shtml); pinned PKHeX X/Y personal form data. |
| Aegislash | Shield and Blade Stance change during battle. | Battle state only. No separate acquisition, type, gender, or evolution record. | Pinned PKHeX `PersonalInfo6XY.cs` form support; confirm ability-driven battle state in game rule sources before implementation. |

Mega Evolution changes battle form and often type, but it is a temporary battle state. Do not add Mega forms as permanent evolutions or acquisition sources. The parent's scope excludes Mega tracking.

Other cosmetic or battle-only forms need a full source-backed inventory during the form implementation pass. This list is the minimum confirmed set for known X-sensitive profile data, not a claim that every form state in the game is represented.

## Regional Dex model gap

X/Y uses three Kalos Dex sections: Central, Coastal, and Mountain. The current profile schema has one optional integer `regionalDex` with one sequence. It cannot store these official section numbers without flattening distinct number namespaces. Omit `regionalDex` from the draft X profiles until the shared model can store a section ID and a number. The smallest change is an optional regional-Dex object with `sectionId` and `number`, plus the three X/Y section IDs and ordering rules. Do not derive one combined 1-454 number.

## Recommended shared form model

Keep one shared species identity per National Dex number. Add stable form identities linked to that species. Let a game profile name a base form and optional supported forms; put each form's types and image path on that game form record. Sources and evolution outcomes must be able to name a form when the form changes acquisition or evolution. Keep cosmetic forms optional where they do not affect access or team type analysis. Add separate battle-state support only if a later scope needs Mega or stance tracking.

## Proposed shared source references

The parent owns `data/references.json`. Proposed references for this layer are:

```json
[
  {"id":"x-personal-data","title":"PKHeX X/Y personal data","url":"https://github.com/kwsch/PKHeX","revision":"641c26ba100225f3605e5a44b61b3b16e15a3774","locator":"PKHeX.Core/PersonalInfo/Info/PersonalInfo6XY.cs (record field layout); PKHeX.Core/PersonalInfo/PersonalTable.cs (XY table binding to personal_xy); embedded resource named `personal_xy`; X/Y records 1-721"},
  {"id":"x-forms","title":"Pokemon X and Y form changes","url":"https://www.serebii.net/xy/forms.shtml","revision":"checked 2026-10-13","locator":"Rotom, Vivillon, Flabebe/Floette, Furfrou form behavior"},
  {"id":"x-kalos-dex","title":"Pokemon X/Y Kalos Pokedex","url":"https://pokemondb.net/pokedex/game/x-y","revision":"checked 2026-10-13","locator":"Central, Coastal, and Mountain Pokédex sections; separate local numbers"}
]
```

## Open work

- Review all 721 X/Y personal records against the pinned `personal_xy` resource before writing profiles. Each record stores types, gender ratio, Egg Groups, and form metadata. A profile list copied from another game is not an acceptable substitute.
- The current profile writer cannot add the three regional Dex namespaces. Omit all X `regionalDex` fields until the shared regional section model exists.
- Confirm the complete persistent-form and cosmetic-form inventory from X/Y-native sources. Confirm how the game treats any patterns that require console region or distribution.
- Add exact source review and image mappings for every form whose types or visual identity the app will show.
- Keep the base-profile layer distinct from acquisition completion. Do not infer native acquisition or an exclusion from personal-table presence.

