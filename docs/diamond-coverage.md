# Pokémon Diamond coverage status

## Current app status: 20 October 2026

Both planners are enabled. Diamond has 493 base profiles, 151 regional entries,
84 milestones, 180 locations, 1,903 acquisition sources, 251 evolution edges,
234 breeding rules, and six alternate forms. All 493 species have a reviewed
outcome: 363 native paths, 117 exclusions, and 13 player-trade blockers.
See [the current review](diamond-pearl-progress-review.md) and
[the shared status](generation-456-progress.md). The older notes below are
source history. Their pending status and next steps have been superseded.

Review date: 2026-10-13. Game ID: `diamond`. Generation: 4. Region: Sinnoh. Status: incomplete and not registered.

## Reviewed work

The North American Diamond source reconstruction is pinned to `b623abef1b4dfe204ca50aab42447ac00c134290`. PKHeX personal records are pinned to `641c26ba100225f3605e5a44b61b3b16e15a3774`. The source notes list exact locators and separate verified facts from open records.

`data/games/diamond/bosses.json` contains highest party levels for eight Gym Leaders, four Elite Four members, and the Champion. This is sufficient for the current boss-cap model. The parent has added shared species identities and base artwork through #721. These do not establish Diamond support or form artwork.

The 493 base profiles now cover National Dex #1–493. A field-by-field review compared Diamond's pinned personal archive with PKHeX's pinned `PersonalTable.DP` table for types, genders, and Egg Groups. The profile list has no regional numbers because Diamond's Sinnoh order is still open. The form inventory is in [diamond-forms.md](diamond-forms.md).

## Verified findings

- PKHeX's pinned `PersonalTable.DP` selects `personal_dp`. `PersonalInfo4.cs` defines type offsets 0x06/0x07, gender ratio 0x10, Egg Group offsets 0x14/0x15, and form metadata at 0x29/0x2A.
- All 493 base profiles match Diamond's `personal.json` fields and the pinned PKHeX DP record bytes for types, gender ratios, and Egg Groups. No Platinum profile values were used as proof.
- Diamond has native Unown letter appearances, Burmy/Wormadam cloak outcomes, and Shellos/Gastrodon sea appearances. Cherrim's Sunshine state is battle weather. Form details and model requirements are in [diamond-forms.md](diamond-forms.md).

## Required next work

1. Review Diamond's Sinnoh sequence from its own Pokédex data. Do not copy Platinum's regional numbers.
2. Add tested shared form records and form-aware profile, source, evolution, and image selection. Keep one National Dex species identity.
3. Review Diamond encounters, story, events, locations, trades, breeding, evolutions, exclusions, and type chart.
4. Add the two proposed profile references to shared `data/references.json` before registering or validating Diamond.
5. Keep Diamond disabled until all data layers and checks pass.

## Open blockers

- Diamond's own Sinnoh regional order remains unverified.
- Form identities, form images, and form-aware acquisition and evolution support.
- Type chart, progression, locations, capabilities, items, choices, encounters, breeding, evolutions, and exclusions.

Do not use this coverage record as a claim that all Diamond species or acquisition paths are reviewed.
# Native story checks, 18 October 2026

The source review now joins all eight badge awards, Secret Potion at Valor
Lakefront, Old Charm on Route 210 south, and HM03 at the Celestic mural.
The mural uses background events. Its one-time scene flag must be clear.
The scene sets that flag itself and gives one HM03. The separate Celestic
grunt win consumes Old Charm. Surf field use requires the Relic Badge.

The key review joins the Lake Acuity actor release, Storage Key pickup and
consumption at the Warehouse door, and the separate Galactic Key pickup.
The full route graph and remaining acquisition coverage are still open.
These source records do not enable Diamond Progress Planner.

