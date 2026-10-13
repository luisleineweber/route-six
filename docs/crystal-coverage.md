# Pokemon Crystal coverage review

Reviewed on 2026-10-12 against pret `pokecrystal` commit
`3bc8daa4173e96a7f4011dad3922eb6fa5dad5c6`. See
[crystal-sources.md](crystal-sources.md) for source locators and findings.

## Scope and coverage

The dataset models original international Pokemon Crystal, including native
Johto and Kanto access. It covers all 251 entries in Crystal's regional Dex.
Player trades and externally distributed Pokemon are outside the planner's
acquisition scope.

All 13 local collections have reviewed records: game metadata, 251 profiles,
type chart, progression, bosses, locations, capabilities, items, choices,
acquisition sources, breeding rules, evolutions and exclusions. The focused
Crystal test validates the assembled local game against shared species and
references. It also checks profile order, source-derived encounter facts,
story gates, event outcomes and the exact exclusion set.

The 2,719 acquisition records include 2,560 wild table records, 2 roaming
beasts, 11 static encounters, 10 gifts, 8 egg outcomes, 7 NPC trades, 3 starter
choices and 118 breeding outcomes. Wild methods include grass, Surf, rods,
Headbutt, Rock Smash and Bug-Catching Contest. Swarm tables keep their source
weights and story gates. Each beast has one finite roaming source.

All source records point to a location and include review metadata. Story gates
cover Johto routes, the League, Kanto access, independent Kanto Gyms, the
sixteen-badge Mt. Silver gate, the Route 36 Suicune scene, Cianwood Eusine
battle, Radio Tower, Clear Bell and Tin Tower. The route access milestones
match route location gates. Weekly Lapras remains renewable until caught.

## Specific source-backed rules

The Odd Egg has seven species outcomes and a one-selection choice. Its source
probabilities and two gender/DV variants per outcome are not modeled. Togepi's
Violet City Egg is a separate finite gift. The Dragon Shrine gift gives
Dratini at level 15 after Clair. Crystal's seven NPC trades use their actual
offered species, locations and received Pokemon. The Blackthorn trade returns
a female Dodrio.

The source confirms held-item evolution sources, Bills Grandfather's sequential
stone gifts, one-use phone stone gifts, Bug-Catching Contest Sun Stone, and
source-backed item pickups. Friendship, day/night and Tyrogue stat conditions
are represented by Crystal capabilities. The planner does not simulate a
clock, random values or Tyrogue's stat growth.

Sixteen species have source-reviewed no-native paths. This includes the four
Kanto legendary species without native Crystal encounters, the unavailable
Crystal base species listed in `exclusions.json`, and Mew and Celebi external
access. The exact list has focused test coverage. The dataset validator
confirms source and evolution closure for all 251 profiles.

## Focused checks

Run `npx vitest run tests/crystal.test.ts tests/crystal-encounters.test.ts`.
The Crystal test includes full local dataset shape and semantic validation.
The encounter test checks source counts, methods, rates, one-use roaming,
weekly Lapras, static events, Odd Egg outcomes and corrected NPC trades.
