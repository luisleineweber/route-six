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

Run `npm test` and `npm run build` after a domain or data change. Use
`npm run data:check` for a focused data check. Read `docs/emerald-coverage.md`
for the route and event list. Use `docs/implementation-checks.md` for the checks.
