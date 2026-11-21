# Team comparison

## User flow

Put **Compare teams** beside the Team Planner actions. It opens a dedicated view in the same tab. The header keeps its current planner choices. **Back to Team Planner** returns focus to the Compare teams button.

Show the current team as the reference on entry. Start the second team with six empty slots. **Copy current team** fills the second team with the same selections in the same slots. Use the existing Pokémon search and slot controls to create or edit the second team, including replacing a member in a full team. Keep the draft in memory while the user stays in the comparison view. Back ends the comparison. A successful game change also ends it. A failed game change keeps both teams visible.

Use the selected game, progress point, planning target, and level limit for both teams. Show these settings in the comparison and use the existing controls for games with reviewed progress data. If the game has no reviewed progress data, show the type comparison and explain that the access check is unavailable.

## Results

- **Attack coverage** shows the number of covered types and the types only one team covers. Use the selected game's type chart and the planner's existing type calculation.
- **Team defense** shows how many members are weak, resist, or are immune to each attack type. Use the same type rules as the Team Planner. Coverage and defense use Pokémon types only.
- **Obtainability** shows how many selected members have a path now or later, which members have no valid path, and whether the entire team can be obtained under the selected settings. Include the reasons for blocked paths and team conflicts. A team can have a path for every member and still require incompatible choices or more copies of a limited resource than one playthrough supplies.

Use counts out of the number of occupied slots. Show an empty state for an empty team and keep the other team's results visible. Show loading and errors in the obtainability section.

## Work split

1. **Comparison logic and tests.** Add a pure comparison function under `src/domain/team`. It takes `GameData`, both slot lists, the shared `PlanningTarget`, and the matching `AvailabilitySnapshot` when available. Reuse `analyzeTypes` and run `checkTeam` once per team. Return each team's type results, types covered only by each team, availability status per occupied slot, and team feasibility and warnings. Keep the original slot indexes in warning results when the team has empty slots. The view requests one snapshot with `useAvailability` and reuses it for both teams. Changing only a team slot or the planning target uses the existing snapshot. Keep the draft state separate from the main team reducer.
2. **Visible interface and integration.** Opus 5.5 owns the Compare teams button, comparison view, search and slot controls, displayed results, styles, and visible navigation and settings changes. Reuse existing components and keep shared controls scoped to the active view. Route all add and remove actions in the comparison view to the draft, including actions from Pokémon details. Keep the sticky team bar from exposing main-team edit controls during comparison. Give Opus the comparison function and test cases before it starts.

Use the current worktree as the base. [PR #1](https://github.com/luisleineweber/route-six/pull/1) has its own Full Game view and is still draft. Keep comparison at one shared planning target. A comparison across Gym stages can use Full Game's stage snapshots once that work is available.

## Checks before delivery

- Copying a team preserves forms, duplicates, and empty slots. Editing the copy leaves the current team intact.
- Identical teams have identical results. A changed member updates the expected coverage and defense rows.
- Current progress and whole game use the correct paths. A choice or finite resource conflict applies within each team. A resource used by both teams does not cause a conflict across teams.
- A new progress point discards stale access results. Type results stay visible during loading, errors, and in games with no reviewed progress data.
- Check both empty and full draft teams. Verify the compare, copy, replace, and back flow by keyboard and on a narrow screen.
