# Generation V Progress Planner integration

Reviewed on 27 October 2026. Black, White, Black 2 and White 2 now have active
native offline Progress Planners. The app supports 24 Team Planner games
and 20 Progress Planner games. Team Planner alone does not complete a game.

| Game | Sources | Milestones | Evolutions | Breeding rules | Reviews |
| --- | ---: | ---: | ---: | ---: | --- |
| Black | 1,220 | 56 | 323 | 289 | [Coverage](black-coverage.md) / [Sources](black-sources.md) / [Forms](black-forms.md) |
| White | 1,280 | 56 | 323 | 289 | [Coverage](white-coverage.md) / [Sources](white-sources.md) / [Forms](white-forms.md) |
| Black 2 | 1,834 | 64 | 324 | 290 | [Coverage](black-2-coverage.md) / [Sources](black-2-sources.md) / [Forms](black-2-forms.md) |
| White 2 | 1,835 | 64 | 324 | 290 | [Coverage](white-2-coverage.md) / [Sources](white-2-sources.md) / [Forms](white-2-forms.md) |

Each game has 649 base profiles, its own 17-type data, level caps and native
source records. Black/White have 156 regional entries and twelve alternate
form profiles. The sequels have 301 regional entries and sixteen alternate
form profiles. All records keep a reference and review date.

## Review method

Four Luna agents reviewed one game each. They investigated sources and gaps
without editing shared project files. Their reports were proposals. The
parent checked those proposals against the pinned source and current schema.
The parent rejected stale model-gap claims and unsupported source joins.
All final data stays in hand-maintained JSON under `data/`. No importer,
external runtime API, backend, account or player-trade setting was added.

## Pinned evidence

- PKHeX: `641c26ba100225f3605e5a44b61b3b16e15a3774`. Separate `encounter_b.pkl`, `encounter_w.pkl`, `encounter_b2.pkl`, and `encounter_w2.pkl` resources; own-version event branches and personal tables; separate BW and B2W2 level-up tables.
- PokeAPI: `81d20919845b6a445969b9265aab5cec6b04cece`. Version IDs 17, 18, 21 and 22; detailed methods, conditions, seasons and area IDs.
- Native sequel source: `a17a9fedc6344da8bc063b0517a755faee137b0b`. Named event scripts, trade archive order, native action code and explicit version branches. No local matching-ROM build was run.
- Grotto cross-check: suloku/BW2_grottoswarm `2a68f0cd10cb4e680b9514d4b72f053cbee8a3e3`.
- New local form images: PokeAPI sprites `ba403973fdf9d0ac59175813861e6a1f8ed5020c`.
- Published area, item, event and White Forest reviews have exact SHA-256 snapshot pins in each game's source review. Their game/version columns were checked separately.

The detailed wild review covers 12,748 source rows: 2,654 each for Black and
White, and 3,720 each for Black 2 and White 2. These rows are not a count of
active aggregated records. Swarms, gifts, NPC trades and special pools need
separate review and are present in the final data.

## Closed evidence conflicts

- Black Dreamyard encounter 35400 and White encounter 38054 are dark-grass Watchog in the later pocket. The post-game basement route and the published own-version area tables close the missing access join. Opening Cut grass and the monkey gift keep separate gates.
- Route 22 Hidden Grotto Mienfoo has raw bounds 40/45 in both own-version resources. The native reader's exclusive upper bound and the pinned table cross-check give 40-44. The conflicting 50-54 candidate is rejected.
- The full native source packet supplies `twist_mountain_8.s`. Its party check requires Regirock, Regice and Registeel for level 68 Regigigas. The opposite native key is absent, so the source stays blocked rather than being deleted or called unreviewed.
- Regirock's capture script and the official Key System cross-check give Black 2 the Iron Key and White 2 the Iceberg Key. The script VM uses false branches; reading them as true branches reverses the keys.
- N's Zorua is a native level 25 gift. Memory Link is not required.
- Native phone-trade code accepts any hatched, unfused Pokémon. The trade table's Pikachu offer is ignored by this special caller. The actual offer remains a consumed resource. Native archive order proves male player to Yancy and female player to Curtis.
- The 30th-call wheel ride, a later-day meeting and Hall of Fame access unlock phone trades. The maximum counter of 51 is not the first-trade gate. The twelve outputs repeat, one trade per day.
- Route 11 fake-item Amoonguss is level 43 in the native actor parameters. The candidate's level 47 is rejected. The native mushroom mission restores the twelve fake-item event flags.
- Sequel swarms use a 41% native check. Black/White retain their published 40% rate; the sequel implementation is not assumed for them.
- White Forest has positive native Wooper evidence. A broad negative summary that lists Wooper does not override the reviewed White Forest source.
- BW and sequel move levels differ. Tangela, Bonsly and Mime Jr. use their own game's learning table. Female Azurill can become male at evolution.
- Kyurem fusion reserves and releases its partner. Both fused forms stay Dragon/Ice. Rotom appliance types follow Gen V. Gastrodon stays Water/Ground.

## Shared implementation and checks

The existing source, evolution, breeding, choice and resource models cover
most rules. Focused additions cover fusion partner reservation, arbitrary
NPC offers, grotto source modes, solo mushroom missions and initial forest
residents. Validation, details and exports use the same typed records.
Domain modules use no React or browser APIs.

`tests/gen5-acceptance-checks.ts` checks nine checkpoints per game and final
native access. It checks early route gates, gifts, finite choices, version
species, grotto bounds, phone branches, breeding and fusion conflicts.
`tests/generation-v-progress.test.ts` checks the public query at all 36 points
and the shared six-slot state with game-switch reset behavior.
See [implementation checks](implementation-checks.md) for command results,
browser checks and before/after screenshots.

## Declared limits

External distributions, transfers, connected services, Memory Link, Entralink
recruitment, Unova Link keys and player trades stay outside scope. Native
solo Funfest missions stay inside scope. The planner checks possible access,
not the player's current save, clock, random result, call counter or resident
loss. Required conditions remain visible. No factual blocker remains for the
declared native scope. First queries can take several seconds while the
worker builds access proofs. Large local-data chunks remain a build warning.
