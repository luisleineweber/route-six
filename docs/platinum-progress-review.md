# Platinum Progress Planner review

Data review: 20 October 2026. Check date: 20 October 2026.
Platinum is active in both planners.

## Scope and counts

The scope covers play in one Platinum game, including the Battle Zone.
Player trades, transfers, GBA dual-slot links, external gifts, linked-player
rewards, and temporary facility rentals do not provide native access.
Conditional encounters keep their time, day, rotation, and action conditions.

| Collection | Records |
| --- | ---: |
| Base profiles | 493 |
| Regional entries | 210 |
| Milestones | 84 |
| Locations | 201 |
| Capabilities | 36 |
| Items | 68 |
| Choice groups | 3 |
| Acquisition sources | 2,213 |
| Evolution edges | 251 |
| Breeding rules | 234 |
| Exclusions | 97 |
| Form changes | 8 |

The solver finds native paths for 382 species and seven alternate forms.
Fourteen other species need player-trade evolution. They remain blocked.
The remaining 97 species have reviewed exclusions. Thus every base profile
has a native path, a player-trade rule, or an exclusion.

The 7,802 reviewed wild rows map to 154 native map headers. The active data
combines equal repeatable slots into 1,947 wild sources. It keeps distinct
conditions and native map headers separate. Another 266 fixed, gift, trade,
and egg records bring the source count to 2,213. The saved source review
keeps the raw slot IDs and levels for each combined record.

## Native source

All native locators below use pret/pokeplatinum revision
`fe1ea418a7364c93daf0d07ae55e195452d8803c`.
The active records use the `platinum-source` reference.

| Facts | Source locators |
| --- | --- |
| Wild slots, native map joins, rates, special pools | `res/field/encounters/`, `res/field/maps/`, `src/overlay006/wild_encounters.c` and the native encounter loaders |
| Story, gifts, static encounters, items, visible objects | `res/field/scripts/`, map script assignments, event placements, flags and variables |
| Field move badge checks | `src/field_move_tasks.c` |
| Evolution and offspring | `res/pokemon/*/data.json`, evolution routines, `src/overlay005/daycare.c` |
| Pickup levels and item probabilities | Native Pickup item tables and battle routines |
| Held items and native forms | Species personal data, form routines, and the matching native event scripts |
| Native exclusions | All ordinary and special wild tables, fixed grants, dynamic starter and fossil grants, five roamers, four NPC trades, breeding closure, and permanent C-level grants |

The exclusion review checks all five GBA dual-slot arrays across the native
tables. Those linked sources remain outside the scope. The review also checks
the Regi dependency cycle, external eggs, Mystery Gift, and rental systems.
An absent row in one encounter table is not proof of exclusion.

## Gates and finite resources

Fantina is the third Gym Leader. Surf needs Wake's badge. Strength needs
Byron's badge. The SecretPotion event follows Wake. The library event follows
Byron. HM04 comes from Riley outside Iron Island before its cave quest.
Togepi's egg and the Bicycle follow the Eterna rescue.

Wayward Cave's hidden entrance needs the ground route through Cut trees.
Its basement has no Strength gate in Platinum. Mt. Coronet records distinguish
the early northern rooms, the Bicycle approach, and the late HQ passage.
Both Battle Zone exits need the National Dex. Snowpoint Temple and swarms
also need Hall of Fame. Optional early Pastoria and National Dex paths have
separate milestones. The usual story path does not require a League loss.

The two Giratina battle sites share one capture. Spring Path opens on exit
from the Distortion World. After Hall of Fame, the Turnback Cave portal gives
access to the Griseous Orb. Origin Forme retains that same animal and Orb.
Dialga and Palkia require their own Orbs and the late story event.

Trainer ID parity limits the two Sinnoh fossil families. Starter choices
remain mutually exclusive. Breeding can provide further family members.
Held-item sources retain their captured holder. A finite capture cannot give
two different held items. Pickup requires the exact holder and level window.
King's Rock starts at level 11; Dusk, Shiny, and Dawn Stones start at 31, 41,
and 51. Feebas uses four selected tiles from 528 eligible tiles and a 50 percent
replacement check after fishing succeeds.

Spiritomb needs 32 distinct linked Underground player talks. The planner
records that external connection requirement. The Regi cycle has no native
starting animal. Manaphy and Phione also have no native starting source.

The 20 October source comparison added missing genderless parent records for
ten families. It also added Shedinja to the Nincada parent rule. Rotom can now
produce repeatable level 1 eggs with Ditto. Manaphy and Phione have the correct
Phione egg rule, while their native acquisition exclusions remain in force.
East Sea Shellos now has an explicit evolution edge to East Sea Gastrodon.

The 21 October check also separates female and male Nidoran parents. Female
Nidoran can produce either Nidoran species. Male Nidoran, Nidorino, and Nidoking
with Ditto produce Nidoran male only. The new rule and egg source bring the
current totals to 234 breeding rules and 2,213 acquisition sources.

## Checks

The full suite passes 444 tests in 46 files. The focused Platinum checks cover
all species outcomes, starter and fossil limits, the single Giratina, early
caves and eggs, all eight badges, League stages, and the Friday Drifloon.
Separate tests cover item proof costs, cached solver paths, breeding partners,
forms, and resource retention.

The solver reuses only compatible earlier progress results. It remaps breeding
parent path IDs and preserves the earlier result. Egg Group indexes limit
partner searches. Item proof reduction keeps finite costs, choices, and source
dependencies. These changes have focused regression checks.

Browser and build results are recorded in
[`implementation-checks.md`](implementation-checks.md). The ignored `output/`
folder holds the raw source review, slot joins, tests, browser samples, and
the combined task and usage report. Active data stays in `data/games/platinum/`.
