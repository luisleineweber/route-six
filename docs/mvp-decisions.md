# MVP decisions

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

## Decision status

All eight initial product choices and the added breeding choice are confirmed.
The MVP plan can now use these choices.
