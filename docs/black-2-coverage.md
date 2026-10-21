# Pokémon Black 2 coverage review

## Current app status: 14 October 2026

Team Planner is enabled with 649 reviewed base profiles and 301 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Review date: 13 October 2026. Status: partial reviewed layer. Keep Black 2
disabled until its game data and registration work are complete.

## Reviewed layer

- All 649 base profiles now record types, genders, Egg Groups, and local sprites. Their source is the pinned `personal_b2w2` table. No regional Dex number is set yet.

- First-run standard Gym leaders, badge order, specialty types and highest
  party levels are recorded in `data/games/black-2/bosses.json`.
- First-run standard Elite Four and Champion highest levels are recorded.
- Ghetsis is recorded as a story trainer with his highest listed party level.
- The full Gen V 17-type chart is recorded in
  `data/games/black-2/type-chart.json`. Fairy is not present.
- Egg hatch level 1 is verified, but no `game.json` exists yet to carry it.
- Source details and limitations appear in [source notes](black-2-sources.md).

## Open coverage

- Exact Black 2 supported species coverage, profile regional Dex order, and any later reviewed forms.
- Main-story milestones and postgame gates.
- Native encounters, gifts, static Pokémon, NPC trades, roaming Pokémon and
  reviewed exclusions.
- Location list, capabilities, items, choices, breeding rules and evolutions.
- Version-specific content and ordinary postgame scope.
- Forms, encounter activation methods, and any other schema/domain gaps found
  during source review.
- Full boss parties cannot fit the present boss schema. Current records hold
  only highest levels and Gym specialty types.

The failed `FieryMewtwo/pokeblack2` candidate remains rejected. Its README calls
it a Pokémon Diamond decompilation. It did not support the records in this
round. The pinned PKHeX revision is a format reference only, not a complete
Black 2 source.
