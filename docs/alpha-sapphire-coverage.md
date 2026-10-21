# Alpha Sapphire coverage

## Current app status: 14 October 2026

Team Planner is enabled with 721 reviewed base profiles and 211 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Review date: 13 October 2026. Status: partial reviewed profile and battle-data
layers; game remains incomplete and disabled.

## Verified layers

- `pokemon.json` has all 721 base species profiles from the pinned PKHeX
  Alpha/Omega personal table. It has Generation VI types, gender possibilities,
  Egg Groups, local images, and Alpha Sapphire review IDs.
- The ORAS Hoenn Dex numbers cover one sequence from #001 through #211.
- `bosses.json` records first-run Gym and League highest party levels only.
- `type-chart.json` has the Generation VI 18-type matrix. These records do not
  establish party member lists, access paths, or complete game coverage.
- Persistent and battle-only form gaps are listed in
  [Alpha Sapphire forms](alpha-sapphire-forms.md).

## Not covered

- Native supported-species coverage and acquisitions, including event and
  transfer distinctions.
- Form identity, form-sensitive acquisition, gender-specific evolution, and
  gender-aware images.
- Progression, encounters, locations, capabilities, items, choices, breeding,
  evolutions, and exclusions.
- Hatch level. No `game.json` or loader exists.

## Next steps

1. Add the proposed shared references from `alpha-sapphire-sources.md`.
2. Implement and test shared form identity and selection, beginning with Rotom
   and Deoxys. Review event scope before adding Hoopa or distribution forms.
3. Review native ORAS acquisition and progression against game data. Do not infer
   supported species or exclusions from the base profile list.
4. Add remaining game records by reviewed layer. Keep Alpha Sapphire disabled
   until all thirteen collections pass validation and exact access coverage.
