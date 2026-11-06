# MVP decisions

The **Later decisions** below are current and override conflicting entries in
the original MVP history. The original choices remain here for context.

## Later decisions (current)

### Product scope and modes

- Support the eleven Generation I–III games in both planners. All thirteen
  Generation IV–VI games support Team Planner. Platinum, Diamond, Pearl, X, and
  Y also support Progress Planner. Show the coverage level in the selector.
- Keep Team Planner simple: team building and type analysis, without progress,
  availability, or level-limit controls.
- Keep progress and access information in Progress Planner.
- Share the six team slots between modes for the selected game. Clear the team
  when the user changes games.
- Sort by regional Pokédex first, then National Pokédex.
- Show the regional and National Pokédex as separate catalogue sections.

### Progress selection and access

- Show eight Gym stages and Victory Road when the game has it. Do not expose
  every route or story event as a progress stage. Keep those requirements in
  the access data.
- Use Victory Road as the default when it exists; otherwise use Gym 8. Do not
  add starter, story, League, or post-game checkpoints. Games without reviewed
  progress data remain Team Planner only.
- Keep a separate level-limit switch in Progress Planner.
- Keep the team planning target separate from list filters. **Whole game** lets
  team checks use future sources. Search and type filters only change the list.
- Keep current search text and type filters when the team target changes.
- Check each future source for Whole game against its own progress point and
  level limit. Turning limits off removes only level checks.
- Whole game includes future and post-game sources present in the reviewed game
  data, even though the progress selector has no post-game checkpoint.
- Keep plans in memory only. Mode changes keep the team, game changes clear it,
  and reload starts a new plan. Do not add accounts or saved player plans.

### Interface and output

- Use a clear dark field-guide style, game-specific header colours, and white
  highlights. Keep labels and status text short and easy to understand.
- Use a consistent Gym picker with clear labels. Avoid nested progress menus.
- Show nine Pokémon per row in Team Planner and six per row in Progress Planner.
  Keep the catalogue on one continuous page.
- Keep a visible six-slot team strip. Use compact 4:3 cards with the Pokémon
  image and types side by side; keep empty slots visible.
- Use generation-sorted game logos in the game selector. Prefer English logos,
  avoid redundant selected-state text, and check logo contrast with each game
  colour. Keep a useful footer with a GitHub link and project information.
- In the Team Planner, show the add action on hover and give feedback after an
  add. Put type markers at the card's lower-right. Keep a detail view on card
  selection; omit a separate detail-file action. Use remove without a separate
  replace action.
- Show useful selected-Pokémon sources and evolution steps without duplicate
  paths or excessive detail. Show route names and encounter methods, including
  method icons. For later access, show the location and the unmet requirement.
- In a Pokémon detail view, show the selected Pokémon's own sources and its
  evolution line. Let the user open each evolution stage. Show levels and items,
  keep first access brief, and avoid duplicate close controls.
- Use earlier available evolution stages as access paths when useful. Keep
  unavailable and team-conflict messages wide enough to read and state their
  cause in direct language.
- Allow PNG export for team and progress plans. Keep the output readable, use
  colour for type effectiveness, and show only the easiest useful source paths.
  Keep team-card heights even. Use a game logo, clear type graphics, aligned
  export headings, and readable source text. Put extra encounter locations in
  one section below the team rather than repeating them on each card.
- Capture before and after screenshots for every UI change.

### Ideas that are not requirements

- A separate home page was discussed, but it was not selected as a requirement.
- Type multi-select was discussed, but no default behavior was confirmed.

## Original decisions (history)

Record confirmed choices here before writing the MVP plan or application code.

## Confirmed choices

### 1. First game

- The MVP supports Pokémon Emerald.
- The MVP uses one game to check the shared availability rules.
- Other games and versions can follow later.

### 2. Progress detail

- The MVP includes every route and story event.
- Each route has its own progress point.
- Gym and League battles remain part of game progress.

### 3. Evolution level rule

- Each milestone has a recommended level limit.
- The limit uses the next Gym or League opponent's highest Pokémon level.
- The limit applies by default.
- The user can turn it off to include further level evolutions.

### 4. Trades

- The MVP excludes trades with other players.
- The MVP includes trades with game characters when all requirements are met.
- Trade availability includes access to the required Pokémon and the character.
- The MVP has no setting to enable trades with other players.

### 5. Version rules

- Show Pokémon that require another game version.
- Mark them as unavailable in Emerald.
- Keep this status separate from Pokémon available at a later Emerald milestone.
- Use Emerald's sources and evolution rules to determine availability.

### 6. Special sources

- Include starters, gifts, fossils, and Pokémon the player can obtain only once.
- Show each source and its requirements.
- Warn when a team contains choices that cannot be taken together in one playthrough.
- A Pokémon can be available on its own while its planned team has a choice conflict.

### 7. Team analysis

- Use Pokémon types only.
- Show weaknesses, resistances, immunities, and attack coverage.
- Moves are outside the MVP scope.

### 8. Data sources

- Maintain all Pokémon and Emerald data by hand in local JSON files.
- Do not add an automated data import or a runtime data API.
- Check each record against its reference source.
- Record the reference and review date with the data.

### 9. Breeding

- Include breeding in the MVP availability rules.
- Require Day Care access, a compatible parent pair, and any required held item.
- Preserve parent sources and choices in the resulting acquisition path.
- Treat parents and breeding held items as reusable resources.
- Show breeding requirements and check them in team feasibility results.

## Original decision status

These choices defined the first Emerald-only MVP. Use them only where they do
not conflict with the current decisions above. In particular, the original
Emerald-only scope and route-by-route progress picker are retired.
