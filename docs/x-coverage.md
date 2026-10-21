# Pokemon X coverage

## Current integration: 21 October 2026

Team Planner and Progress Planner are enabled. The active data has 721 base profiles, 457 regional entries, 76 milestones, and 1,092 sources. Complete game checks resolve 435 native species and 13 alternate forms. Fifteen species need player trade. The 271 exclusions have a full source comparison.

See [the X and Y Progress Planner review](xy-progress-review.md) for the active scope, source conflicts, and checks. The dated notes below are source history. Earlier pending states and model gaps are superseded by this integration.

## Earlier review history

## Current app status: 14 October 2026

Team Planner is enabled with 721 reviewed base profiles and 457 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Review date: 2026-10-13. State: partial reviewed layer; game remains disabled. Scope is native offline X acquisition through ordinary postgame. Exclude external distributions, transfers, player trades, and connected-service rewards.

## Completed

- First-run Gym, Elite Four, Champion, and final Lysandre story-battle highest party levels and Gym specialties are in `data/games/x/bosses.json`.
- The complete 18-type Generation VI matrix is in `data/games/x/type-chart.json`.
- Pinned PKHeX source review confirms the X/Y personal table and the record fields needed for profiles: types, gender ratio, Egg Groups, and form metadata.
- `docs/x-forms.md` records the initial form inventory and exact gap in regional Dex representation.

## Profile layer status

No profiles were written. The exact pinned binary table must be reviewed by species against the `PersonalInfo6XY` structure before manually authoring 721 records. I did not copy profiles from another game or infer missing values.

X supports three separate Kalos regional Dex sections: Central, Coastal, and Mountain. The current schema has only one `regionalDex` integer. Do not flatten these official number namespaces. Omit regional numbers from a later draft until the parent adds section-aware numbers.

This is a base-profile-only requirement and does not imply native acquisition. Missing encounters must not remove a profile or become false exclusions. The form-sensitive X data and all acquisition data remain incomplete.

## Remaining work

- Review and author exact base types, genders, Egg Groups, and local sprite paths for all 721 species from the pinned X/Y personal data.
- Add the proposed `x-personal-data`, `x-forms`, and `x-kalos-dex` references to shared `data/references.json`. Existing shared identities and species assets now cover National Dex #1-721.
- Add the smallest shared form layer and a section-aware Kalos Dex model.
- Complete the X native-form inventory and map type-changing Rotom forms. Keep cosmetic and battle-only states distinct.
- Review milestones, locations, capabilities, items, choices, encounters, evolutions, breeding, exclusions, story trainers, and postgame gates before registration.

