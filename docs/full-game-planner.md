# Full Game planner: first working layer

Started on 28 October 2026.

The Full Game view uses the six shared team slots as the final team for the
Elite Four and Champion. The player can select that team in any planner.
View changes keep the final team and the temporary stage members in memory.
Reloading starts a new plan.

## Stages and access

Show the eight main Gyms, then League entry. Use the selected game's reviewed
progress data. Games without that data show the same support limit as the
Progress Planner.

Check access before each battle. Include optional areas that the player can
reach before that battle. Do not grant the battle's badge or reward early.
Keep post-game sources outside the plan. Use the next battle's level limit
when the shared level-limit setting is on. The final team must be available
at League entry, before the first Elite Four battle. Do not assume that it
can gain levels or evolve between League battles.

For each Gym team slot, use the final member if available. Otherwise, follow
its evolution line backwards and use the nearest available earlier stage.
Do not use a sibling evolution branch. Show a missing member and its access
reason when no earlier stage is available. Check the final League team as
selected; do not replace an unavailable final member with an earlier stage.

## Temporary members

Open **Edit team** at a Gym to select available temporary members. Each stage
keeps its own six slots. A player can leave a slot empty, restore its planned
evolution, or restore the entire stage team. Temporary members do not change
the final team. A final-team change keeps explicit temporary members.

Each stage checks its selected team for source choices and finite resources.
An invalid temporary member stays visible after a level-limit change. A game
change clears the final team and stage teams. The existing Undo control
restores both teams during the game-change undo period.

## Work that remains

- Check choices and resource use across all stages in one playthrough.
- Define how temporary members move between stages.
- Add a Full Game export. The current PNG exports cover Team and Progress.
- Decide whether to model evolution and level gains within the League.

The interface states that it checks each team separately. A ready team at
every stage does not prove that the entire plan fits one playthrough.

## PR integration: 6 November 2026

The PR uses the current public repository base. Game-change Undo restores
stage teams. Battle checks use separate contexts so they can apply the
selected leader's cap without granting that leader's reward. The stage list
supports both before-battle checkpoints and completed-battle checkpoints.

The focused stage, game-change Undo, and shared slot checks pass 25 tests.
The Windows full-suite run reports an existing CRLF parsing failure in
`tests/search-metadata.test.ts`. Its summary reader retains the final carriage
return. The PR does not change that test or the agent summary file.
