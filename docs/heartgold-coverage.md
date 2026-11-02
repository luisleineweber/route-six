# HeartGold coverage status

## Current integration constraints

The older gap list below is historical. Shared identities through 493,
form support, and the `heartgold-source` reference now exist. See
`docs/hgss-progress-review.md` for the current shared rule review.

The data validator requires all progress collections to be empty while
`game.planner` is null (`src/data/validate-semantics.ts`). Adding a partial
story graph to the game files will therefore fail the data check until the
planner metadata and complete reviewed records are ready. Registration is
separate and remains parent-owned.

The field-action source review establishes these badge gates: Cut needs Hive,
Fly needs Storm, Surf needs Fog, Strength needs Plain, Rock Smash needs Zephyr,
Waterfall needs Rising, and Whirlpool needs Glacier. Rock Climb needs Earth.
The move grants and local route joins also need to be represented. See
`output/game-proposals/hgss-field-actions-review-notes.md` and
`src/field_move.c` at the pinned revision.

## Current app status: 14 October 2026

Team Planner is enabled with 493 reviewed base profiles and 256 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Status: incomplete first data layer. Keep HeartGold disabled.
Review date: 2026-10-13. Source revision:
`53dded53802b237d39fabfd8ee396fe9cdc8aa3e`.

## Reviewed layer

### Base species profiles (reviewed 2026-10-13)

- `pokemon.json` now declares the 493 National Dex base species from the
  HeartGold personal data table. It records the game's base types, genders,
  Egg Groups, local numbered sprite, and review reference for every species.
- Form records remain outside this layer. See [form inventory](heartgold-forms.md).
- `regionalDex` is omitted because HeartGold has separate Johto and Kanto
  numbering namespaces and the current schema supports only one sequence.
- This profile layer does not establish native acquisition. Sources,
  evolutions, breeding outcomes, and exclusions still need review.

- `game.json`: Generation IV, Johto and Kanto, first progress checkpoint IDs,
  League default, and level-1 breeding hatch rule. Milestone records must be
  added and checked before integration.
- `type-chart.json`: 17-type effectiveness chart derived from the sparse
  HeartGold battle table. Neutral matchups are explicit in the output matrix.
- `bosses.json`: first-run Gym Leaders and League caps from first matching
  trainer records. The source includes rematch parties; those are not caps for
  the first clear.

The source details and exact locators are in [HeartGold source review](heartgold-sources.md).

## Verified gaps

- Shared Pokémon identities stop at National Dex 386. HeartGold needs species
  through 493. Add the missing identities and local images before profiles.
- The model has no forms. HeartGold profiles and encounters may require form
  identity, form-specific types, source variants, and images.
- The current evolution model needs review against HeartGold evolution methods.
  Add tested domain conditions for any unsupported method before records use it.
- The encounter model needs review for HeartGold-specific methods and time,
  day, weather, swarm, Safari Zone, radio, roaming, and Pokéwalker gates.
- The game has postgame Johto and Kanto progression. Milestones and locations
  must preserve the story gate, not just geographic order.
- Breeding supports special offspring and incense cases. The general rules need
  source review before breeding records are added.
- `heartgold-source` must be added to shared `data/references.json` by the parent.

## Next steps

1. Add and validate the shared reference.
2. Review complete progression and boss dependencies, then add the thirteen
   game collections by hand.
3. Add missing identities and the agreed form layer.
4. Add domain support and focused tests for confirmed rules the current model
   cannot express.
5. Complete coverage checks, register HeartGold only when the dataset passes.
# Native acquisition checks, 18 October 2026

The wild review contains 244 species across its included ordinary, Headbutt,
Safari and Bug Contest sources. Safari age levels now use the correct day
scale. The maximum block contribution starts at 250 days.

The fixed review records thirteen GiveMon and three GiveEgg call sites.
The trade archive has thirteen verified 84-byte members. Ten permanent
trade IDs and two loans have callers. Rapidash has a payload but no caller.
Shuckie holds Berry Juice. Kenya holds Grass Mail. Jasmine's script accepts
any eligible Pokémon despite the raw Steelix request field. The archive's
gender field is the original trainer gender.

These records still need the complete story graph and native species access
checks. They do not enable HeartGold Progress Planner.

