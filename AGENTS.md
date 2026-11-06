# Pokémon Playthrough Planner

This project is a React, TypeScript, and Vite field guide for Pokémon Emerald.
It has a Team Planner and a Progress Planner. The Team Planner gives a simple
team overview. The Progress Planner checks access at the selected progress.
Both views share the six team slots. Sort each catalogue by the regional
Pokédex first, then by National Dex for the remaining species.

Maintain game data by hand in `data/`. Keep a reference and review date for each
record. Use the pinned Emerald source revision for review. Do not add a data
import, runtime data API, backend, accounts, or player trade setting.

Keep access rules in `src/domain/availability/`. Keep team resource checks in
`src/domain/team/`. These modules must work without React or browser APIs.
Keep settings and the six team slots shared between both views.

Use the field guide style in `DESIGN.md`. Keep visible status text, keyboard
access, and small-screen support. Use Emerald's 17 types for type analysis.
For every UI change, capture a screenshot before and after the change. Include
both screenshots in the final response. If you cannot capture the before
screen, state why and include the after screenshot.

Run `npm test` and `npm run build` after a domain or data change. Use
`npm run data:check` for a focused data check. Read `docs/emerald-coverage.md`
for the route and event list. Use `docs/implementation-checks.md` for the checks.

Before you mark work on any game complete, update
`output/game-usage-report.html`, the overview of token use and JSON data size
per game. Apply this rule to every game and to later work on completed games.
Run `python -I output/measure_project_usage.py`, then
`python -I output/check_project_usage.py`. They measure every project thread
for Codex and Claude, price each request by its model, and keep a request
copied into a forked session once. Add a price to `output/usage_prices.py`
before you use a new model. Keep earlier measurements and
include the new work without counting the same session or task twice.
Record measured token use, current JSON data counts and sizes, and the date
of the measurement. Keep parent and child task use separate. Mark estimates
and missing measurements clearly. Do not invent token counts or costs.
Update the report's existing JSON and CSV files to match. Run the relevant
report checks and confirm that earlier totals remain present before completion.
