# Manual data contract

This is a proposed contract for the MVP plan. JSON Schema checks shape. A separate
semantic check validates references and game rules. This contract is not a full
Emerald dataset.

## File layout

```text
data/
  references.json
  pokemon.json
  games/emerald/
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

Gym opponents have a `badgeNumber` and `specialtyTypeId`. Badge numbers must
form a sequence from 1. The specialty must be a type in the game's type chart.
League opponents do not have these fields. Emerald's Gym scripts give the badge
flags and type descriptions at the pinned source revision. These fields let the
progress picker show the badge number and type beside the leader's name.
| `evolutions.json` | Array | `acquisition.schema.json#/$defs/evolution` per entry. |
| `exclusions.json` | Array | `acquisition.schema.json#/$defs/exclusion` per entry. |

The assembled object contains `schemaVersion`, `references`, `pokemon`, and
`games`. Each game object contains the thirteen corresponding game collections.
Use the [root schema](schema/planner-data.schema.json) to validate it.

Schema IDs identify the local schema resources. Resolve their references from
the four supplied files. Validation must not depend on a remote schema server.

## Shared identity and game rules

Shared Pokémon records contain ID, National Dex number, name, introduction
generation, and review information. Game profiles contain types, Egg Groups,
possible genders, and an optional `regionalDex` number. Omit `regionalDex` for
species outside the game's regional Pokédex. Regional numbers must be unique
and form a sequence from 1. Both planner catalogues show these species first
in regional order, then the remaining species in National Dex order.
Game evolution records contain version-specific rules.
This avoids assigning later-generation
types or evolutions to Emerald.

The initial catalogue covers species present in Generation III. Every selected
game profile must refer to a shared species. Later games can add profiles and
rules without changing the identity record or the availability interface.

The type chart stores a complete matrix. Row and column order follow `typeIds`.
Each cell is explicit, including neutral damage. Multiply two cells for a dual
type. Do not fill missing cells with neutral damage.

## Milestones and access

`previousIds` records mandatory milestone dependencies. `displayOrder` only sorts
the picker. `locationId` can be null for a story event. `nextBossId` can be null
when no next Gym or League opponent exists.

Requirements are tagged values: all, any, milestone, capability, item, or Pokémon.
An empty `all` means no requirement. An empty `any` is invalid.
An item or Pokémon requirement describes access, not actual player inventory.
The acquisition path must preserve the witness source and its finite uses.

Capabilities name game actions such as Surf access or a fishing method. Their
requirements prove access from story progress and obtainable items. Do not make
a capability available solely because an unrelated route occurs earlier in a list.

## Sources and levels

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

## Breeding sources and rules

Breeding is a source kind. Its details name `ruleId` and `capabilityId`. The
capability proves Day Care access and must also appear in the requirement tree.
Breeding sources use a fixed hatch level and null `maxUses` for repeatable eggs.
Emerald eggs hatch at level 5; see the
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

## Required semantic checks

- IDs are unique within their collections. All cross-references resolve.
- National Dex numbers are unique. Profiles do not predate their species.
- Milestone dependencies are acyclic. Each milestone is rooted at game start.
- Display orders are unique. Each route has an initial-access milestone.
- All source locations, capabilities, items, Pokémon, and choices exist.
- Required item and offered Pokémon dependencies match their source details.
- Source and evolution levels lie from 1 to 100; ranges have minimum <= maximum.
- The first milestone exists. Boss references exist and supply the displayed cap.
- Every active type has exactly one matrix row and column. Profiles use active types.
- Emerald's chart and profiles use its Generation III rules.
- Choice limits do not exceed their option count. Choice references use real options.
- Profile Egg Groups are recognised. Source genders match their profiles.
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
