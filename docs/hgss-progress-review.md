# HeartGold and SoulSilver progress work

Updated on 5 November 2026. Both games now support both planners.
The new integration report below supersedes the candidate status in the
21 October source notes that follow it.

## Active integration: 5 November 2026

Each game has 157 milestones, 232 locations, 121 actions, 234 breeding rules,
247 evolution records and seven alternate forms. The nine quick checkpoints
cover the eight Johto Gyms and the first League challenge. The full graph
also covers Kanto and Red.

The source revision remains `53dded53802b237d39fabfd8ee396fe9cdc8aa3e`.
The review joins the existing continuation packets and the five later route,
story and resource batches. All missing references are resolved. The focused
milestone check reports no inaccessible milestone location in either game.

### Encounters and resources

- 11,658 native wild slot rows per version become 3,043 HeartGold and 3,062
  SoulSilver sources. Equal slots share a source only within the same map,
  native pool and conditions. Adjacent level intervals can merge. Gaps stay
  separate. Identical time pools share their time conditions. This keeps the
  species, level ranges and slot rates while reducing duplicate solver paths.
- Radio replacements, outbreaks, normal and special Headbutt trees, Safari
  areas and objects, and retained Bug-Catching Contest catches keep their
  conditions. National Dex access remains explicit for the relevant systems.
- Route 47 now needs Amphy's medicine scene. Reaching Cianwood alone is not
  sufficient. Baoba's tests and three-hour play-time calls are separate from
  Safari area aging. High Safari point totals can require many elapsed days.
- The League journey now includes the version tower encounter. The old
  candidate removed this dependency after checking Route 27's greeting only.
  New Bark's east-exit coordinate events instead check scene values 1 and 2
  and move the player back (`057_T20.json:273-294`;
  `scr_seq_0842_T20.s:1462-1732,1767-1770`). The version legendary battle
  sets the scene to 3 (`scr_seq_0021_D17R0110.s:83`;
  `scr_seq_0104_D40R0107.s:95`). This does not force a catch: facing the
  legend and resolving the battle is sufficient.
- The three Rocket Hideout Electrode have separate finite sources. Lapras is
  repeatable on Fridays. The two tower legends use version-specific wings,
  bells and levels. Steven releases Latias in HeartGold and Latios in
  SoulSilver. Rayquaza keeps its real partner requirements and stays blocked
  without the opposite-version tower legend.
- Native NARC `files/a/2/5/3` gives Ruins of Alph map 113 odds 30/type 1 and
  Cliff Cave map 342 odds 25/type 2. The version pools in
  `src/field/rock_smash_item.c:44-93` supply Helix/Claw Fossils in HeartGold,
  Dome/Root Fossils in SoulSilver, and Old Amber in both. Revival at Pewter
  Museum consumes one fossil and gives a level-20 Pokémon
  (`scr_seq_0755_T03R0101.s:108-358`; `src/scrcmd_fossils.c:8-16`).
- Celadon Prize Corner gives Mr. Mime, Eevee and Porygon for 3,333, 6,666 and
  9,999 coins. This is separate from Goldenrod's version-specific prizes
  (`scr_seq_0804_T07R0501.s:410-494`).
- All 234 reviewed breeding rules now have acquisition sources. A rule alone
  did not create an egg path. The native offspring, incense and inherited
  form checks remain in `hgss-packed-rule-check-notes.md` under the review
  packets. New active tests check baby Pokémon and native forms.
- Optional route visits use the location's real access rule, not a separate
  visit marker. The Radio Card action can be completed at the accessible
  Goldenrod tower. This prevents later queries from incorrectly blocking
  radio Pokémon, special trees, the National Park and Pokéathlon items.
- Winning the Bug-Catching Contest gives a repeatable Sun Stone before the
  National Dex. The later prize pool includes the ten reviewed evolution
  stones. The native prize table is separate from the contest encounter set.
- The seven alternate-form stat records now include the HGSS table. Their
  values were checked against native `personal.json`, including the shared
  Burmy and Shellos/Gastrodon values.

### Clear limits

The planner checks what a player could obtain. It does not inspect a save.
The emergency Cianwood Tentacool gift is therefore omitted: it requires
exactly one party Pokémon and all 540 PC slots empty. It is not an unlimited
gift source. Tentacool remains available through ordinary Surf encounters.

The six distant Route 47 secret-tree slot rows remain omitted while their
individual approaches await review. Their species have reviewed sources
elsewhere. This does not exclude a species from the planner.

Pokéwalker, transfers, player trades and event distributions stay outside the
scope. Exclusion messages explain these limits directly. The native inventory
was compared with Serebii's [unavailable](https://www.serebii.net/heartgoldsoulsilver/unobtainable.shtml),
[version-exclusive](https://www.serebii.net/heartgoldsoulsilver/exclusives.shtml)
and [Pokéwalker-only](https://www.serebii.net/heartgoldsoulsilver/pokewalker-pkmn.shtml)
rosters on 5 November. Native tree coordinates and field-action rules were
cross-checked with the [special-tree approaches](https://www.serebii.net/heartgoldsoulsilver/headbutt.shtml).

### Verification

Final integration checks on 5 November pass all 811 tests in 82 files.
The production build passes. Both games pass loading, image and overflow
checks at 1440 and 320 pixels. Before and after screenshots are in
`output/hgss-release/`. The usage report, matching measurement CSV files and
retention check were updated; missing historical task counters remain
explicit, and the earlier aggregate is retained separately.

Both staged datasets pass full schema and semantic validation. Full-game
queries reach 395 HeartGold and 393 SoulSilver selections before independent
team choices are applied. Trade evolutions and Rayquaza stay blocked.
Public availability queries and a six-member team check pass for both games.
The first uncached public query took about 40 seconds locally. The worker
keeps the interface usable, but this cost remains relevant on slower devices.

The source helpers and raw review packets remain under ignored `output/`.
The app imports only the reviewed local JSON files in `data/`.

## Earlier source notes: 21 October 2026

## Native source and wild records

The source is `pret/pokeheartgold`, revision
`53dded53802b237d39fabfd8ee396fe9cdc8aa3e`. The review resolves each version
selector separately. Each version has 11,664 source rows in the current review
packet. They cover 244 species across ordinary encounters, radio replacements,
night fishing, swarms, Headbutt, Safari pools, and Bug-Catching Contest days.
This count includes separate time and day conditions. It is not an acquisition
source count or a complete species count.

The ordinary map join has 135 assigned encounter keys. Seven unassigned keys
stay outside the candidate rows. The swarm review uses the native table of
20 map and method pairs. A nonzero replacement species in another map's raw
table does not establish a possible swarm there. Base and replacement weights
must not be added together.

The source rows are in `output/game-proposals/heartgold-wild-candidates.json`
and `soulsilver-wild-candidates.json`. Story and local field-action joins remain
open. The helper stays under ignored `output/`; the app has no data importer.

## Shared encounter rules

Radio conditions identify Hoenn Sound or Sinnoh Sound. They require the
matching sound action in every access alternative. The native radio actions
need the National Dex. Hoenn Sound runs on Wednesday; Sinnoh Sound runs on
Thursday. Radio replacements apply to grass encounters.

Headbutt conditions keep common, rare, and secret trees separate. The native
tree checks establish a usable common and rare tree on every reviewed regular
map for each possible final Trainer ID digit. Secret-tree maps also have a
usable secret tree for every digit. No Trainer ID setting is needed.

Safari block conditions keep each required object type and point threshold.
Validation rejects repeated types, fractional points, unsupported methods,
and point combinations that cannot fit the 30-object limit even at maximum
area age. A separate native comparison proves that each authored bonus row
can enter the ten-slot active pool with its own arrangement.

At 250 elapsed area days, each object can provide seven points. The review
uses this as a sufficient arrangement for each row. It does not call it the
minimum wait. Area aging is separate from Baoba's three-hour game-time checks.
All five Safari encounter methods use the same point and action validation.

## Evolution, breeding, items, and fixed events

The current 234 Platinum breeding rules cover all breedable HGSS parents when
compared with the native egg table. All nine incense outcomes and all seven
move-evolution learning levels match. Male Nidoran with Ditto produces male
Nidoran. Female Nidoran can produce either sex. The Manaphy-to-Phione override
is a breeding rule; it does not prove native acquisition.

Four location evolutions cannot occur in HGSS. The native map function returns
no evolution location. Magneton cannot become Magnezone, Nosepass cannot become
Probopass, and Eevee cannot become Leafeon or Glaceon within this game.
They must not receive false local evolution paths.

The Battle Frontier gatehouse moves its blocking NPC after the first League
clear. Its repeatable Razor Claw and Razor Fang shop needs that world gate.
The Pokéathlon construction state ends after the first Whitney battle win.
Daily item lists and National Dex additions have separate native checks.

All nine incense items have fixed pickup events and joined maps. Their local
paths still need review. The native held-item table provides no incense source.
An absent shop entry is not an exclusion.

The early Burned Tower scene releases Raikou and Entei. Its later level-40
Suicune battle is a retry. It needs the Route 25 failed-catch state, an unset
caught flag, and a later League win. These are separate acquisition events.

The early Cherrygrove gift is a Map Card. The Goldenrod quiz gives the Radio
Card. Route 36's Rock Smash grant has no Sudowoodo event check. The Day Care
interior is map 331, reached from exterior Route 34. These source corrections
are retained in the field-action review.

Rock Climb needs the Earth Badge and HM08 from Oak. Blue's win and the following
Viridian phone scene prepare Oak's grant and Mt. Silver unlock. Safari travel
has an upstream gate: healing Amphy leads to the Olivine scene that removes
the Cliff Edge Gate workers. The paid admission script alone does not prove
earlier access. The further Route 47/48 path still needs its map join.

## Next integration work

Join the reviewed rows to the full story graph and local HM paths. Add gifts,
trades, fossils, items, forms, and exclusions. Then check every supported
selection and finite team choice before enabling either Progress Planner.
Keep the ordinary Safari admission separate from the external Safari Link
flow. The current packets do not prove complete HGSS access.
