# HeartGold and SoulSilver progress work

Reviewed on 21 October 2026. Both games support Team Planner. Their Progress
Planner data is still pending. The shared encounter extensions below are
implemented and tested. The wild review rows are not active game data.

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
