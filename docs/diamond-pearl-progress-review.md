# Diamond and Pearl Progress Planner

Reviewed on 20 October 2026. Both games now have active local Progress Planner
data. HeartGold, SoulSilver, Generation V, and Generation VI remain in review.

Each game has 493 base profiles, 151 regional entries, 84 milestones, 180
locations, 34 capabilities, 56 items, 251 evolution edges, 234 breeding rules,
six form changes, and one starter choice. Diamond has 1,903 acquisition records.
Pearl has 1,901. The solver finds 363 native species and six alternate forms in
each game. The other profiles have 117 reviewed exclusions and 13 player-trade
blockers. These three sets cover all 493 species.

The scope is the original Nintendo DS games. Transfers, GBA cartridge
encounters, player trades, other-player Underground conversations, Ranger,
Ranch, and external distributions have no native access path in these records.
Darkrai, Shaymin, and Arceus do not use unreleased items or glitches.

## Encounters and forms

The review reads the native 424-byte encounter members and joins all 154 used
map assignments. It checks ordinary slots, time replacements, swarms, Radar,
water methods, Honey Trees, Great Marsh rotations, Trophy Garden visitors, and
the four daily Feebas tiles. Per-slot weights differ from area encounter rates.
Equal slots can share one record. Equal time alternatives do not add their
rates. Trophy Garden's two saved visitor positions remain separate 5% records.

The native Swarm selector has 28 map entries. It selects Lake Verity's later
Galactic map, not the earlier lake map. Unused Turnback Cave archive members
do not become encounters. The cave's 18 random rooms use their actual maps.

Native fields at offsets 140 and 144 select Shellos and Gastrodon forms. The
six alternate profiles are Sandy and Trash Burmy, Sandy and Trash Wormadam,
East Sea Shellos, and East Sea Gastrodon. East Sea Shellos has its own level 30
evolution edge to East Sea Gastrodon. The same missing edge was fixed in
Platinum. The three games keep one species identity for each form family.
Diamond and Pearl have no Origin Giratina selection.

The fixed inventory covers three starters, Happiny and Riolu eggs, Bebe's level
5 Eevee, Friday Drifloon, night Rotom, lake guardians, roamers, the matching
level 47 box legend, Heatran, Giratina, six native fossil choices per version,
and four NPC trades. The Snowpoint Haunter keeps its Everstone. Gengar still
needs a player trade. Spiritomb needs other players in the Underground.

## Story and item rules

Fantina is Gym 5. Surf needs her badge and HM03 from Celestic. HM04 is in Lost
Tower; Strength field use needs Byron's badge. Wayward Cave's hidden basement
needs Strength in these games. The Route 206 grass needs Bicycle and Cut.
The Mt. Coronet tunnel uses Rock Climb and Rock Smash. Route 227 keeps Bicycle
for its main path; Surf remains a separate encounter method requirement.

The optional National Pokedex checkpoint permits a return to Rowan after
seeing the last entries in the Champion battle. The native Rowan event checks
150 seen entries, Eterna visit flag 0x9BA, and the existing National Dex state.
Its Hall of Fame check calls a returning helper; it does not gate the award.
The visit table joins Eterna map 65 to visit index 10. The separate Hall of Fame
flag is 0x964. The Swarm sister checks both National Dex and Hall of Fame.

The review compares all 246 native evolution tuples, all 493 offspring fields,
and all nine incense cases. Explicit Burmy and Shellos form edges expand the
species evolution table to 251 planner edges. Known-move routes use the actual
Diamond and Pearl level-up move table. Move Reminder costs a Heart Scale and
still needs a later level gain for evolution.

The 20 October comparison found missing genderless parent records. The data
now includes all ten missing families and their evolved parents. Shedinja can
produce Nincada with Ditto. Rotom can produce repeatable level 1 eggs with
Ditto. Manaphy produces Phione; Phione produces Phione. These last two species
still have no native starting source and retain their external-event exclusions.

The 21 October check separates the Nidoran rules. A female Nidoran parent can
produce either Nidoran species. A male Nidoran, Nidorino, or Nidoking parent
with Ditto produces Nidoran male only. Separate egg sources keep these rules
explicit. Platinum uses the same Generation IV split.

Item rules retain field move gates, version fossils, renewable native held
items, and Pickup. Both native Pickup arrays match all 18 common items and
11 rare items. The nine cumulative weights also match. The runtime uses a
10% activation and level bands of ten. Electirizer and Magmarizer have no
native item source here because their holders need an external GBA cartridge.

Beauty has a native offline route through Amity Square Pamtre Berries. Eight
solo Poffins with at least 25 dryness reach Beauty 170 even with the adverse
nature multiplier. The eighth can be fed before sheen reaches 255. This route
does not use Platinum's Poffin shop or multiplayer cooking.

## Sources and checks

Native game source: `pret/pokediamond`
`b623abef1b4dfe204ca50aab42447ac00c134290`. Key paths are
`arm9/src/map_header.c`, `arm9/src/pokemon.c`, the personal and move tables,
overlay 05 Day Care, overlay 06 encounters, overlay 11 Pickup, and overlay 73
Poffin cooking. Rowan's event is script member 990; the Swarm sister is member
991. Eterna's visit table is `arm9/asm/unk_02034E84.s`.

The pinned PKHeX fixed inventory is
`641c26ba100225f3605e5a44b61b3b16e15a3774`, `Encounters4DPPt.cs`.
Original DS walkthroughs, Serebii item and area guides, and form references
support route, item-pocket, and battle-environment rules. The records retain
their source IDs and review date. Community gameplay evidence is not described
as decoded native collision data.

Luna checks cover the native wild bytes, map joins, form fields, candidate
validation, species access, and integrated regression tests. Reports are in
`output/game-proposals/diamond-pearl-*-check.json`. Full test and production
browser results are recorded in [implementation checks](implementation-checks.md).
The planner shows possible access. It does not track the current clock,
random daily selection, Honey timer, Trainer ID, or capture state.
