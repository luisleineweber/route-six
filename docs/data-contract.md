# Manual data contract

This contract describes the maintained dataset. Its schema version is 2.
JSON Schema checks shape. A separate semantic check validates references and
game rules. All eleven Generation I–III games support both planners. The
thirteen Generation IV–VI games support Team Planner. Their progress data
remains in review. See [the new game status](generation-456-progress.md).

## File layout

```text
data/
  references.json
  pokemon.json
  games/<game-id>/
    game.json
    pokemon.json
    type-chart.json
    progression.json
    bosses.json
    locations.json
    capabilities.json
    items.json
    choices.json
    sources.json
    breeding-rules.json
    evolutions.json
    exclusions.json
```

All data is maintained by hand. Assemble these files for validation; assembly
must not fetch or import data. Each file maps directly to a schema definition.

| File | Root shape | Schema definition |
| --- | --- | --- |
| `references.json` | Array | `common.schema.json#/$defs/reference` per entry. |
| `pokemon.json` | Array | `common.schema.json#/$defs/pokemon` per entry. |
| `game.json` | Object | `game.schema.json#/$defs/game`. |
| Game `pokemon.json` | Array | `game.schema.json#/$defs/profile` per entry. |
| `type-chart.json` | Object | `game.schema.json#/$defs/typeChart`. |
| `progression.json` | Array | `game.schema.json#/$defs/milestone` per entry. |
| `bosses.json` | Array | `game.schema.json#/$defs/boss` per entry. |
| `locations.json` | Array | `game.schema.json#/$defs/location` per entry. |
| `capabilities.json` | Array | `game.schema.json#/$defs/capability` per entry. |
| `items.json` | Array | `game.schema.json#/$defs/item` per entry. |
| `choices.json` | Array | `game.schema.json#/$defs/choiceGroup` per entry. |
| `sources.json` | Array | `acquisition.schema.json#/$defs/source` per entry. |
| `breeding-rules.json` | Array | `game.schema.json#/$defs/breedingRule` per entry. |
| `evolutions.json` | Array | `acquisition.schema.json#/$defs/evolution` per entry. |
| `exclusions.json` | Array | `acquisition.schema.json#/$defs/exclusion` per entry. |

Gym opponents have a `badgeNumber` and `specialtyTypeId`. Badge numbers must
form a sequence from 1. The specialty must be a type in the game's type chart.
League opponents do not have these fields. Emerald's Gym scripts give the badge
flags and type descriptions at the pinned source revision. These fields let the
reviewed checkpoint labels show the badge number and type beside the leader's name.

The assembled object contains `schemaVersion`, `references`, `pokemon`, and
`games`. Each game object contains the thirteen corresponding game collections.
Use the [root schema](schema/planner-data.schema.json) to validate it.

`game.planner: null` and `game.firstMilestoneId: null` declare reviewed team
data without progress coverage. The progress collections must be empty in
this state. The app shows a pending message in Progress Planner. The domain
returns the explicit `progress-not-ready` result. Empty arrays do not establish
native access or exclusions. Profile, image, type, boss and regional number
checks still apply.

Games with several regional lists declare an ordered `regionalDexSections`
array of `{ id, name }` records. Each regional profile then has a
`regionalDexSectionId` and a `regionalDex` number. Number sequences are unique
and contiguous within each section. Other profiles keep National Dex order.

The app validates shared records first. It then loads and validates only the
requested game through `src/data/game-registry.ts`. A game data error must not
prevent another valid game from loading. Build checks assemble all registered
games and check their local images. No external data is fetched.

Schema IDs identify the local schema resources. Resolve their references from
the four supplied files. Validation must not depend on a remote schema server.

## Shared identity and game rules

The shared identity list reaches National Dex 721. Each game still declares
its own supported species in its profile file. New shared identities do not
add species to an older game's catalogue or access results.

A regional Dex sequence can start at 0 or 1. Numbers must be unique and
contiguous within the declared sequence. Number 0 is a regional number, not a
missing number. Black and White use Unova #000 for Victini. Separate regional
Dex sections, such as the Kalos sections, need an explicit section model before
their numbers can be declared. Do not replace their local numbers with a made-up
combined sequence.

Shared Pokémon records contain ID, National Dex number, name, introduction
generation, and review information. Game profiles contain types, a local
`spriteSrc`, possible `genders`, breeding data, and an optional `regionalDex`
number. Omit `regionalDex` for
species outside the game's regional Pokédex. Regional numbers must be unique
and form a sequence from 1. Both planner catalogues show these species first
in regional order, then the remaining species in National Dex order.
Game evolution records contain version-specific rules.
This avoids assigning later-generation
types or evolutions to Emerald.

The shared catalogue currently has 386 species. Each game's profiles define
which species that game supports. Generation does not imply membership.
Each profile must refer to a shared species that exists by the game's generation.
An unsupported species has no profile. A supported but unobtainable species has
a profile and a reviewed exclusion or blocked acquisition path. Both planners
and the access checker use the same profiles. Each game needs its own coverage
test to check the reviewed species list.

`spriteSrc` names a local PNG, WebP, or SVG file under `public/`. The interface
and PNG exports use that exact path. Shared artwork is allowed. There is no
default image path when a profile is incomplete. Build checks require each
profile image, active type icon, and registered game logo to exist.

The type chart stores a complete matrix. Row and column order follow `typeIds`.
Each cell is explicit, including neutral damage. Multiply two cells for a dual
type. Do not fill missing cells with neutral damage.

## Milestones and access

`previousIds` records mandatory milestone dependencies. `displayOrder` only sorts
the picker. `locationId` can be null for a story event. `nextBossId` can be null
when no next Gym or League opponent exists.

`game.planner.checkpoints` names the milestones shown in the progress selector.
Each entry has `milestoneId`, `label`, `title`, `detail`, and nullable `typeId`.
The milestone's `displayOrder` sorts these entries. IDs must be unique and must
refer to existing milestones. Non-null type IDs must exist in the game's chart.
`game.planner.defaultMilestoneId` must name one of these checkpoints. Both
initial startup and game selection use this default. No Gym suffix or route
name identifies a checkpoint in code.

Requirements are tagged values: all, any, milestone, location, capability,
item, or Pokémon. A location requirement proves that location's access rules.
An empty `all` means no requirement. An empty `any` is invalid.
An item or Pokémon requirement describes access, not actual player inventory.
The acquisition path must preserve the witness source and its finite uses.

Capabilities name game actions such as Surf access or a fishing method. Their
requirements prove access from story progress and obtainable items. Do not make
a capability available solely because an unrelated route occurs earlier in a list.

## Sources and levels

An evolution can name a `location`, `held-item`, `party-pokemon`, or
`known-move` condition. The domain proves location access, consumes the held
evolution item, and retains the required party Pokémon. These conditions
require a level gain. Their requirements remain in the resulting proof.

A known-move condition declares reviewed learning routes. A `level-up` route
has its actual learn level. The acquired individual must be below that level
to learn the move later. A source can declare `knownMoveIds` for moves that
the captured or received individual already knows. Do not infer those moves
from its level alone.

A `teach` route has explicit action requirements and the lowest eligible
teaching level. Move Reminder routes must retain their access gate and consume
the required Heart Scale. Teaching a move at that level still requires one
more level gain for evolution. Each route keeps its own resource cost and
level limit. Do not replace these routes with a free generic move capability.

A `party-type` condition requires another species with that type in its reviewed
game profile. Alternate forms use their own types. The proof retains the actual
partner and all costs of obtaining it. The evolving species cannot also prove
its own party condition. A capability name cannot replace a partner.

Generation VI also supports `affection` with minimum 50 (two hearts in
Pokémon-Amie), natural `rain`, and `upside-down` device orientation. Each needs
a level gain and its own explicit action capability in every requirement
alternative. Friendship cannot prove affection. Sylveon records must also name
a reviewed Fairy move and its learning routes with a `known-move` condition.

Each source names a Pokémon, location, requirement, optional choice, finite-use
limit, level rule, possible genders, details, and review. Null `maxUses` means
repeatable access.
Positive `maxUses` limits uses in one playthrough.

An item can have no native sources. Use an empty `sources` array in that case.
For example, Emerald's Up-Grade needs a player trade from another game. Keep its
item record so blocked evolution rules can name it. Do not invent a local source.

Level rules are fixed, range, or match the Pokémon offered in a game trade.
The last rule must name the offered species. The source details must name the
same offered species. The validator checks this equality.

Wild details include method and encounter rate. Other source kinds are starter,
gift, static encounter, egg gift, fossil revival, and game trade. Fossils name
the consumed item. Game trades name the offered Pokémon. Those requirements
must also appear in the requirement tree so they cannot be ignored.

Source genders describe the outcomes possible from that source. They must form
a non-empty subset of the species profile's possible genders. Track gender through
each evolution's reviewed gender transitions. A source with a fixed gender must
not permit the profile's other genders.

## Items from captured Pokémon

A `received-held-item` source names one exact gift, starter, static capture,
roaming capture, fossil revival, or NPC trade source. Both records must have
`maxUses: 1` and the same location. The proof keeps the holder available and
preserves the offer, item cost, and choice used to obtain it. All item records
for that holder share one `received-loot` budget. Repeatable sources and eggs
cannot use this kind.

An item source can have `details.kind: "pickup"` or `"wild-held-item"`.
Both kinds name an exact wild `pokemonSourceId`. The item source and the
capture source must use the same location. The solver must prove that
capture. Another source of the same species cannot replace it.

Pickup also has `minimumLevel`, `maximumLevel`, and `ratePercent`. The
holder must reach that level range within the level cap. A capture above
the range cannot prove the item. The holder stays available for the team.
Pickup sources are repeatable. Their rates include the activation check.
Details and exports name Pickup, the holder level range, and the empty
held item slot.

A wild held-item source has a normal `ratePercent`. Its quantity limit
matches the capture limit. Shared loot claims prevent two different item
outcomes from one finite capture. The captured Pokémon stays available.
This contract permits free entry and retained access keys. It rejects a
capture with a consumed entry resource, including one in a capability or
location requirement. Keep that unsupported capture cost outside active
item records; do not remove its cost to make validation pass.

## Breeding sources and rules

`game.breeding` is null when the game does not support breeding. Its profile
`breeding` fields must then be null, its breeding rules must be empty, and it
must have no breeding sources. Source genders remain in each profile's
`genders` field. When breeding exists, `game.breeding.hatchLevel` gives the
reviewed hatch level. Every profile then has an `eggGroupIds` breeding record.

Breeding is a source kind. Its details name `ruleId` and `capabilityId`. The
capability proves Day Care access and must also appear in the requirement tree.
Breeding sources use a fixed hatch level and null `maxUses` for repeatable eggs.
The validator uses the game's hatch level. Emerald declares level 5; see the
[game constant](https://github.com/pret/pokeemerald/blob/master/include/constants/daycare.h).

A breeding rule names `parentPokemonIds`, `offspringPokemonIds`, and an optional
`requiredHeldItemId`. Parent IDs identify the family parent that determines the
offspring. The module finds its partner through profile Egg Groups and genders.
An offspring source must name an offspring declared by its rule.

Use [Emerald's compatibility and offspring rules](https://github.com/pret/pokeemerald/blob/master/src/daycare.c).
Normal pairs need opposite genders and a shared Egg Group. Ditto pairs follow
the game's distinct rule. Reject two Ditto and any parent in the Undiscovered
group. Keep special offspring alternatives explicit in the rule data. An incense
rule needs its held item as an accessible, non-consumed item requirement.

Resolve two distinct parent Pokémon with compatible acquisition paths. Check
source gender restrictions, choices, finite sources, and parent level limits.
Parents are not consumed. The same pair can support later eggs. A retained parent
proof must not count as a new capture for every egg. Check copies needed together
and the action order before declaring the entire team feasible.

Breeding paths retain all parent source IDs, chosen genders, parent path IDs,
choices, and resource uses. Add a path only after its parent proofs are grounded.
Do not create access from a self-dependent breeding rule. Apply later evolution
rules to each hatched species as normal.

## Evolution rules

Evolution triggers are level-up, use-item, and player-trade. A level-up needs a
level gain even when the source already exceeds the nominal minimum level.
Use-item needs an item ID and item access. Player-trade rules are blocked in
this MVP. A held item on a trade rule does not remove that restriction.

Conditions describe friendship, Beauty, time, stat comparison, personality,
and spare party slots. Item and action access remain in the requirement tree.
`coProductIds` records simultaneous products when the game creates more than
one Pokémon. Team checks must not count that outcome as two independent uses of
a finite source. Check these details against the selected game.

Null `genderTransitions` means the evolution preserves gender. Otherwise, each
entry records a possible input and output gender. Validate those entries against
the two species profiles and the actual source restrictions. Do not assume every
evolution or separately created product preserves gender.

Record the actual condition. Do not replace a rule with a blanket statement
that all non-level evolutions are available.

## Exclusions and coverage

Use an explicit exclusion for a species that needs another version or an external
distribution event. A player-trade-only form is explained by its blocked evolution
path. An exclusion is not a substitute for missing encounter or evolution data.

Every profile must have at least one declared source, an incoming evolution path,
or an explicit exclusion. Validate that the chain has a grounded outcome. A
reference cycle with no base source does not establish availability.

## Reviews and reference sources

Each record has a review date and reference IDs. Each reference has a title and
locator. A URL and a source revision are optional when the reference is direct
game observation. Record a repository revision when using source files.

Use the original game and manually inspect the
[Emerald source reconstruction](https://github.com/pret/pokeemerald).
Useful reference areas are [species profiles](https://github.com/pret/pokeemerald/blob/master/src/data/pokemon/species_info.h),
[evolution rules](https://github.com/pret/pokeemerald/blob/master/src/data/pokemon/evolution.h),
[wild encounters](https://github.com/pret/pokeemerald/blob/master/src/data/wild_encounters.json),
and [trainer parties](https://github.com/pret/pokeemerald/blob/master/src/data/trainer_parties.h).
Breeding also needs [Day Care rules](https://github.com/pret/pokeemerald/blob/master/src/daycare.c)
and [hatch constants](https://github.com/pret/pokeemerald/blob/master/include/constants/daycare.h).
Location and event access also need script review or direct game checks.

These are review sources. The application reads only the maintained local data.
No external API or import script forms part of this plan.

Use game-specific reference IDs for new records, such as `ruby-encounters`.
Keep current Emerald reference IDs stable. Each new game needs reviewed
references for its own version. A shared region does not prove shared encounters
or story gates. See [Adding games](adding-games.md) for the required steps and
the later form and visual map work.

## Required semantic checks

Forms keep one shared species and one National Dex number. `data/forms.json`
declares the form identity. A game's species profile contains its reviewed
`forms` with types, genders, breeding data, image, and references. A base team
selection uses the species ID. An alternate selection uses its form ID.
Regional numbers belong to the species profile.

Sources and evolution edges name their exact forms. `formChanges` declares
the action requirements and any item that must stay held. Each current team
member needs its own held item. Changing a form does not create a second
captured animal. Form-only breeding rules use an empty `parentPokemonIds`
and a nonempty `parentFormIds`. The two arrays list alternative parents.

Conditional sources use typed `encounterConditions` for time, season, weekday, swarm,
daily rotations, and Feebas tiles. Story and item gates remain explicit
requirements. The selected progress does not set the game clock or daily
rotation. Details and exports state the encounter condition. Honey Tree
sources use their own method and consume Honey. They do not claim one fixed
encounter percentage for all trees and all prior Honey uses.

HGSS conditions keep radio sounds, Headbutt tree classes, and Safari block
points separate. Each action is required in every access alternative. Radio
sounds use grass; tree classes use Headbutt. Safari blocks use grass, Surf,
or fishing. Block types are unique, points are positive whole numbers, and
the layout must fit 30 objects at the maximum seven points per object.
Area aging can increase points. A sufficient 250-day arrangement is not a
claim about the minimum wait. Story and National Dex gates stay in action
requirements. The host clock does not control the access result.

Unova wild sources keep separate methods for dark grass, shaking grass, dust
clouds, bridge shadows and rippling water. Each method needs its reviewed
action capability. Rippling water also requires Surf or the Super Rod, as
applicable. Seasonal conditions list one or more game seasons. Details and
exports state these conditions. Availability does not use the host clock.

Kalos wild methods keep Hordes, rough terrain, each flower color, and each
ambush method separate. Each method requires its action capability. A Berry
Fields pest uses `details.kind: berry-tree` and one of the six tree colors.
It requires the `berry-tree` action in every requirement alternative and must
be repeatable. Its probability is unreviewed, so this detail kind has no rate
field. Details and exports keep the color and the instruction to check pests.

- IDs are unique within their collections. All cross-references resolve.
- National Dex numbers are unique. Profiles do not predate their species.
- Milestone dependencies are acyclic. Each milestone is rooted at game start.
- Display orders are unique. Each route has an initial-access milestone.
- All source locations, capabilities, items, Pokémon, and choices exist.
- Required item and offered Pokémon dependencies match their source details.
- Source and evolution levels lie from 1 to 100; ranges have minimum <= maximum.
- The first milestone exists. Boss references exist and supply the displayed cap.
- Checkpoints reference valid milestones and types. The default is a declared checkpoint.
- Every active type has exactly one matrix row and column. Profiles use active types.
- Emerald's chart and profiles use its Generation III rules.
- Choice limits do not exceed their option count. Choice references use real options.
- Profile breeding data matches the game's setting. Source genders match their profiles.
- Breeding source rule and capability IDs resolve. The offspring belongs to its rule.
- Breeding sources are repeatable, use a fixed hatch level, and require Day Care access.
- Emerald breeding sources use hatch level 5. Incense requirements retain the held item.
- Parent pairs have grounded, compatible proofs and enough distinct Pokémon copies.
- Evolution outputs differ from inputs. Evolution and capability paths have a
  grounded source; cycles do not manufacture access.
- Every catalogue entry has a reviewed outcome. Each explicit exclusion has a reason.
- Review references exist; dates are valid. A source error fails validation visibly.

Use explicit validation results with record IDs and field paths. Invalid data
must stop the affected game from loading and show a clear data error.
