# Pokémon Pearl coverage

## Current app status: 20 October 2026

Both planners are enabled. Pearl has 493 base profiles, 151 regional entries,
84 milestones, 180 locations, 1,901 acquisition sources, 251 evolution edges,
234 breeding rules, and six alternate forms. All 493 species have a reviewed
outcome: 363 native paths, 117 exclusions, and 13 player-trade blockers.
See [the current review](diamond-pearl-progress-review.md) and
[the shared status](generation-456-progress.md). The older notes below are
source history. Their pending status and next steps have been superseded.

## Native source update: 18 October 2026

Team Planner remains active. Progress Planner still needs access review.
The native 424-byte encounter layout is decoded for all 183 Pearl members.
Pearl's own map fields join 154 members to 154 maps. The review keeps 2,052
nonzero grass rows and 1,060 nonzero water rows. Twelve members differ from
Diamond in ordinary species. Runtime pool replacements and route gates remain
open. These source rows are not active acquisition records.

The native script loader uses relative 32-bit entry offsets. The older reader's
absolute-offset interpretation and 277 accepted-bank count are superseded.
The actual gift, item, starter, and story paths still need entry and variable
tracing. Source evidence is saved in `output/game-proposals/pearl-*` files.

## Earlier app status: 14 October 2026

Team Planner is enabled with 493 reviewed base profiles and 151 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Status: incomplete. Pearl remains disabled. The first reviewed layer is the
Gym and League boss level/type list. Other game files are not ready.

## Verified

- `pret/pokediamond` is a Diamond/Pearl reconstruction. The pinned revision is
  `b623abef1b4dfe204ca50aab42447ac00c134290`.
- Its README identifies the ROMs that the repository builds. Its INSTALL.md
  has a separate `make pearl` target.
- `files/poketool/trainer/trdata.json` identifies trainer indices, classes,
  party species, and levels. `arm9/src/trainer_data.c` reads trainer data and
  parties from NARC IDs 57 and 58 (`TRDATA` and `TRPOKE` in
  `include/filesystem.h`). The boss file records the eight leader party caps,
  League party caps, and Gym specialty types.
- The repository tree contains `arm9/src/encounter.c`, `arm9/src/daycare.c`,
  `arm9/src/trainer_data.c`, `arm9/src/pokedex.c`, and map, script, item, and
  field move code. Encounter tables are under `files/fielddata/encountdata/`.
- The current shared catalogue ends at National Dex number 386. Pearl requires
  identities for new Gen IV species before profiles and evolution paths can
  cover them.
- The current model has no form links or form-aware type, source, evolution,
  team, or image records.

## Open source review

The boss list is reviewed from extracted source trainer records. Confirm the
exact Pearl species data, Sinnoh Dex ordering, type chart, evolution archive,
event scripts, item placements, and all Pearl encounter archive members. The
binary NARC directories do not identify their member data by themselves.

Review the route and event list against Pearl scripts. Cover gifts, starters,
fossils, NPC trades, static encounters, post-game gates, roaming Mesprit,
Poké Radar, Honey Trees, dual-slot encounters, swarms, fishing, and Surf where
the source confirms them. Retain version and choice gates. Do not add exclusions
until source review proves that a supported species has no native acquisition.

## Required shared work

1. Add reviewed shared identities for Gen IV species 387–493.
2. Add form support. Model East and West Sea Shellos and Gastrodon without
   duplicate species IDs or National Dex numbers.
3. Add reviewed evolution trigger and condition tags for Gen IV methods.
4. Add tested encounter method support for Pearl mechanics that the current
   model cannot express.
5. Allow the Pearl 17-type chart and validate Gen IV effectiveness changes.
6. Review incense offspring and their held-item gates.

The next step is to resolve the precise source archive paths, then add the
shared data and domain support needed for reviewed Pearl records. Do not enable
the game until all thirteen collections, coverage tests, and integration checks
are complete.


## Base profile layer follow-up (13 October 2026)

No Pearl base profile list was written. The pinned source view exposes the
Pearl personal records through a binary NARC, but this review did not establish
the exact Pearl archive selection and record order or expose reviewed values
for all 493 species. The PKHeX Gen IV record definition confirms field offsets
for types, gender, Egg Groups, and form metadata. It does not supply Pearl
record values. See `docs/pearl-sources.md` and `docs/pearl-forms.md`.

Do not register Pearl. Next, identify the exact Pearl personal archive and
record order, then review all 493 records and author the base profiles by hand.
Keep the form-sensitive layer separate until shared form support is ready.

## Base profile review update (13 October 2026)

The pinned `filesystem.mk` confirms that Pearl selects `poketool/personal_pearl/personal.narc`. The archive member data and member-to-species order were not obtained or checked. No profiles were written. Do not copy Platinum profile fields as Pearl data. The next step is to review all 493 Pearl records and compare every type, gender ratio, and Egg Group before writing `pokemon.json`.

## Corrected base profile layer (13 October 2026)

The previous notes incorrectly said that the Pearl personal values were binary-only and not reviewed. The pinned source has a plain-text Pearl file: `files/poketool/personal_pearl/personal.json`. Its `baseStats` entries 1–493 follow National Dex order. They expose types, gender ratios, and Egg Groups. A full comparison checked these fields against all 493 shared identities and Diamond profiles. No mismatches were found. Pearl's `pokemon.json` now contains all 493 base profiles. Regional numbers remain omitted because the current model cannot describe Pearl's Pokédex sections.

The Pearl chart now contains the full 17-type Generation II–V matrix. The type-chart record applies to Pearl and retains Steel's Ghost and Dark resistances. The chart source is a specialist reference, not a decoded first-party table.

Forms do not block these base profiles. The game remains incomplete and disabled. Profile data does not establish acquisition or form access.

## Remaining work

Review exact Pearl content gates, route/event milestones, encounter tables and methods (including Poké Radar, Honey Trees, dual-slot encounters, swarms, fishing, Surf, and roaming Mesprit), native item and choice sources, new evolution triggers, incense breeding, postgame access, legendary events, and version/external-event limits. Add form-aware profiles and source access for Shellos/Gastrodon, Burmy/Wormadam, Unown, and other confirmed persistent forms. Add required Gen IV identities only if the shared identity list lacks them; current shared identities cover 1–721. The current model also needs explicit Sinnoh and National Dex sections before Pearl regional numbers can be recorded.
# Native grant checks, 18 October 2026

The bounded gift review now joins both rods, the starter, Happiny, fossil
revival and four NPC trades to their native callers. The separate Pearl wild
proposal uses Pearl bytes for ordinary and special pools. It keeps the
version differences from Diamond.

The Rowan lab event joins the National Dex setter and Poké Radar grant.
The route checks 150 seen Sinnoh entries and flag `0x09BA`. The flag's meaning
remains unresolved. Do not infer a Hall of Fame gate from that number.
The full story and access graph remains open. Pearl Progress Planner stays
pending.

