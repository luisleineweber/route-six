# Pokémon Black coverage review

## Current app status: 18 October 2026

Team Planner is enabled with 649 reviewed base profiles and 156 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

The new detailed encounter comparison has 2,654 wild rows in 80 areas and
214 species. All location-method joins and level ranges match the pinned
PKHeX Black resource. That resource has 17 further swarm-only species.
The detailed review retains dark grass, shaking grass, dust clouds, bridge
shadows, rippling water and seasons. It does not prove story access or
offline access for the separate 37 fixed and gift rows. See the saved review
at `output/game-proposals/black-detailed-encounter-review-notes.md`.

Checked on 2026-10-13. This is an incomplete source and schema review. It is
not a game dataset and must remain disabled.

## Verified

- The requested scope is English Pokémon Black Version 1.0 (USA/EUR), not
  White, Black 2, or White 2. The pinned reconstruction README names that ROM
  and its SHA-1.
- The pinned reconstruction commit is
  `bbb5cd501426c1ca5f16a9d09c8d91fd03a1c12b`.
- The source repository states that its species and trainer data has not been
  examined. It does not provide verified collection locators for the thirteen
  game data files.
- The current shared species catalogue has identities and local sprites through
  National Dex 721. This supports profile IDs and images, but does not prove
  which species Black can acquire.
- Current schema supports three evolution triggers, a restricted set of
  condition kinds, and eight wild methods. It has no form identity and no
  Black encounter-method fields. Its evolution conditions cannot state a
  required known move or exact evolution location. Player-trade evolutions are
  explicitly blocked by the availability solver.
- The Black data folder now has a 17-type chart record. Fairy is absent.

## Open questions

- Exact supported-species coverage and Unova Dex ordering for Black.
- Black-specific evolution rules and breeding outcomes.
- Exact encounters, levels, rates, locations, item sources, NPC trades,
  version choices, story gates, bosses, and post-game gates.
- Which forms count as persistent planner choices, and how to represent
  temporary battle forms and seasonal forms.
- Black-specific regional Dex order for each supported species.
- The decoded location, encounter, event, item, trainer, evolution, and
  breeding locators at a reviewed Black 1.0 source revision.

## Readiness

Black remains incomplete and disabled. The boss and type layers exist, and a
reviewed 649-entry base profile layer now exists. It contains no Black
regional-Dex values and makes no claim that every listed species has a native
acquisition path. The profile review uses the shared pinned PKHeX BW personal
table. Its reference ID still needs to be added by the parent.

The pinned Black reconstruction does not provide verified locators for the
game collections. Its README says that the species, trainer, and other game
data remain unexamined. The exact locator table in `black-sources.md` marks
all thirteen collection locators unavailable. Black still needs a reviewed
ROM reconstruction or decoded primary source before acquisition, story,
location, item, evolution, breeding, and exclusion records can be authored.

The profile layer does not resolve the schema gaps listed in `black-sources.md`:
forms, move/location and two-species trade evolutions, Black encounter
methods, conditional breeding outcomes, or detailed story/world-state gates.
Keep the game disabled until those rules, its exact coverage, data checks, and
planner checks are complete.

## Base profile and form review (2026-10-13)

### Verified

- The parent workspace now contains shared identities and local sprites for
  National Dex 1–721. This does not establish Black's profile facts.
- At pinned PKHeX revision
  `641c26ba100225f3605e5a44b61b3b16e15a3774`, `PersonalTable.BW` loads
  `GetTable("bw")`. `PersonalTable5BW.cs` sets the maximum species ID to 649,
  uses record size 0x3C, and parses the table by record size.
  `PersonalInfo5BW.cs` defines the type, gender-ratio, and Egg Group fields.
  Black and White therefore use the same personal table. The embedded resource
  is `personal_bw`.
- `data/games/black/pokemon.json` now has 649 profiles. All profile fields
  match the reviewed White profiles, including types, genders, Egg Groups,
  and shared sprite paths. No Black regional-Dex numbers are asserted.
- The profile file uses proposed reference `black-personal-table`. The parent
  must register it before validation.
- Black's Unova Dex has 156 entries, #000 Victini through #155 Genesect. The
  existing profile schema can hold that single sequence, including 0.
- PKHeX's pinned form lookup lists supported Gen V form indexes. The native
  inventory notes distinguish form-sensitive permanent profile states from
  battle-only states. The notes do not establish encounter or event access.

### Open questions and blockers

- Confirm Black's supported acquisition scope and regional ordering from a
  Black-specific source. Profiles alone do not establish native access.
- Verify Black form acquisition and transition behavior against the ROM's
  scripts. The profile schema still has no form identity or per-form sprite.
- The earlier story, encounter, evolution, item, and content-gate gaps remain.

### Readiness

Black has base profiles and remains incomplete and disabled. See
`docs/black-forms.md` for the proposed form model and inventory.


## Reviewed partial layer (2026-10-13)

### Verified

- The first-run Gym battles have highest party levels 14, 20, 23, 27, 31, 35,
  39, and 43. The type-specialist leaders after the starter-conditioned first
  Gym are Lenora (Normal), Burgh (Bug), Elesa (Electric), Clay (Ground), Skyla
  (Flying), Brycen (Ice), and Drayden (Dragon).
- The first-run Elite Four members have highest party levels 50 each. N's
  final story battle reaches level 52. Ghetsis's final story battle reaches
  level 54. Rematches and postgame Alder are outside this layer.
- Black's egg hatch level is 1.
- Black uses the 17-type pre-Generation-VI chart. Fairy is absent.
- The pinned PKHeX tree has Gen V personal data, but no trainer-party dataset.

Sources and exact locators are in `black-sources.md`. The bosses schema stores
only the highest party level. It cannot store a party roster or the three
starter-dependent Striaton alternatives. The first Gym record has a null
specialty type to avoid claiming one of the three specialties as universal.

### Open questions and blockers

- Full party rosters and each member's level need a model change if the UI or
  records need more than the highest level.
- Starter choices need a modeled choice and alternate boss-party support.
- Shared species identities and forms remain parent-owned dependencies.
- Black progression checkpoints and the full data layer remain unwritten.
- Encounter methods, evolutions, breeding rules, and story conditions still
  need focused source review and model support.

### Readiness

Only the boss caps and type chart files exist under `data/games/black/`.
There is no valid `game.json`, no checkpoint, and no registered Black loader.
Black remains incomplete and disabled.
