# Omega Ruby coverage status

## Current app status: 1 November 2026

Team Planner and Progress Planner are enabled. See [the ORAS Progress Planner review](oras-progress-review.md) for counts, sources and limits. Earlier notes below are source history.

## Current app status: 14 October 2026

Team Planner is enabled with 721 reviewed base profiles and 211 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Status: partial reviewed layer. Review date: 2026-10-13.

The source base and model gaps are in [omega-ruby-sources.md](omega-ruby-sources.md).
The game stays disabled. Parent owns shared references, species identities,
schema changes, and registration.

## Authored and reviewed

| Area | State |
| --- | --- |
| Base profiles | 721 profiles. Types, gender possibilities, and Egg Groups match the pinned ORAS personal records row by row. Regional order remains pending. |
| First-run Gyms | Highest party level and badge order recorded for all eight leaders. Wallace is the final leader. The data schema does not store party rosters. |
| First-run League | Highest party level recorded for Sidney, Phoebe, Glacia, Drake, and Champion Steven. |
| Hatch level | Level 1 is supported by Generation IV onward Egg evidence. No game file was written because no valid progression checkpoint exists. |
| Type chart | Complete 18-type Gen VI matrix added and compared with two independent chart references. Pin an immutable reconstruction revision before global registration. |

## Still open

- Add any missing shared references after parent review.
- Add reviewed shared species identities through #721, forms, and local assets.
- Add a tested form layer for Mega Evolution and Primal Reversion.
- Review Omega Ruby regional Dex order and version-specific native acquisition
  paths. Do not infer exclusions from missing encounter records.
- Review story gates, capabilities, items, choices, encounters, evolutions,
  breeding rules, and special incense offspring from source evidence.
- Review a valid first checkpoint and progression through Delta Episode. Do not
  write `game.json` until that checkpoint and its milestone exist.
- The current boss schema stores only highest party level. It cannot store
  party members. First-run Gym roster cross-checks after Roxanne remain open.
- Review the final Delta Episode trainer if the story progression layer needs
  a named final boss. Rematch parties remain outside this first-run layer.
- Review map assets and whether the existing numeric base sprites are approved
  for Omega Ruby. Forms need separate reviewed assets after shared form support.

No game loader or registry entry was added. Do not enable this incomplete game.

## Round 4 profile review (2026-10-13)

`data/games/omega-ruby/pokemon.json` now contains 721 base profiles in shared
National Dex order. Each record has the types, gender possibilities, and
Egg Groups decoded from its pinned `personal_ao` row. Alpha Sapphire's reviewed
profile fields were compared against every corresponding Omega Ruby row before
reuse: all 721 matched. Omega Ruby records use `omega-ruby-profiles` and omit
`regionalDex`; regional order remains unreviewed. The check does not establish
which species have native Omega Ruby acquisition paths. See the exact field
mapping and row-size review in [omega-ruby-sources.md](omega-ruby-sources.md).

The game remains partial and disabled. These profiles do not resolve form
identity, native coverage, encounters, story gates, or the other open data
collections.
