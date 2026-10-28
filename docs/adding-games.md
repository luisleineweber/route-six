# Adding reviewed game data

The dataset uses schema version 2. All eleven catalogue games from Generations
I to III support both planners. Thirteen games from Generations IV to VI
support Team Planner. Diamond, Pearl, Platinum, Black, White, Black 2,
White 2, X, and Y also support Progress Planner. The other four games still
need their access review. The totals are 24 Team Planner games and 20
Progress Planner games.
Ruby passed the second-game checks before the group.
A catalogue entry or logo does not provide game rules.

A game is complete only when its reviewed Progress Planner works. Team
Planner registration alone does not complete a game. Black, White, Black 2,
and White 2 now pass their native access checks. See their
[current source review](generation-5-progress-review.md).

## Data ownership

| Data | Owner |
| --- | --- |
| Species ID, National Dex number, name, introduction generation | `data/pokemon.json` |
| Source titles, URLs, locators, revisions | `data/references.json` |
| Supported species, types, regional Dex order, genders, Egg Groups, image paths | Each game's `pokemon.json` |
| Locations, progress, encounter sources, items, choices, evolutions, breeding | Each game's data folder |
| Selectable progress points, default point, hatch level or no breeding | Each game's `game.json` |
| Game logos, type icons, and Pokémon images | `public/` |

The profile collection is the game's supported species list. A missing profile
means that the game does not support that species. A reviewed exclusion means
that the game supports the species but has no native acquisition in this scope.
Do not use exclusions to hide unfinished data. Check the supported list against
the game's pinned reference and add an exact coverage test.

The shared identities now reach National Dex 721. Generation IV–VI datasets
are still in review; see [their current status](generation-456-progress.md).
Each game must still declare its own supported profile list. A larger shared
list does not expand an older game's supported species.

All game files remain manually maintained. Runtime imports load files shipped
with the app. They do not download game data from an external service.

## Add one game

1. Confirm the game version and the scope of its content. Record the reviewed
   sources and revisions in `data/references.json`. Use game-specific reference
   IDs for new records. Keep existing references stable.
2. Add new species identities to `data/pokemon.json` only when needed. Keep one
   stable ID and one National Dex number per species.
3. Create `data/games/<game-id>/` with the same thirteen files as Emerald.
   Review each record. Do not copy Emerald encounters or gates as a substitute
   for checking the new game.
4. Declare each supported species in the game's `pokemon.json`. Give each
   profile its reviewed types, genders, regional Dex number where applicable,
   and explicit local `spriteSrc`. Set profile breeding data to null if game
   breeding is null. Otherwise supply reviewed Egg Groups.
5. Set `game.planner.defaultMilestoneId` and its `checkpoints`. Each checkpoint
   refers to a real milestone. Give it its visible label, title, detail, and
   nullable type ID. The existing milestone `displayOrder` determines order.
   Include Gym 1 through Gym 8, then Victory Road when the game has that
   milestone. Do not add starter, story, League, or post-game checkpoints. Set
   Victory Road as the default when it exists; otherwise use Gym 8.
   For reviewed team data without progress coverage, set both `game.planner`
   and `game.firstMilestoneId` to null. Keep the progress collections empty.
   This is an explicit pending review, not a claim that no encounters exist.
6. Declare `game.breeding` as null or `{ "hatchLevel": <reviewed-level> }`.
   Empty breeding rule arrays are valid when breeding is absent. Do not create
   fake breeding capabilities or sources.
7. Add `src/data/games/<game-id>.ts`. Follow the Emerald module: import the local
   files and export `rawGame: unknown` with the thirteen collections. The file
   names map to `profiles`, `milestones`, `typeChart`, and `breedingRules` in the
   assembled object. No conversion or external data import belongs here.
   A game with reviewed form changes also imports `form-changes.json` and
   supplies the optional `formChanges` collection.
8. Add the module to `progressGameLoaders` or `teamGameLoaders` in
   `src/data/game-registry.ts`. The registry
   key must equal `game.id` and a game catalogue ID. The catalogue generation
   must match the game record. Team registration needs complete reviewed base
   profiles, regional order, images and type rules. Progress registration also
   needs complete reviewed access data. The selector shows the coverage level.
9. Add a coverage document and tests for exact species coverage, early access,
   later access, exclusions, progress defaults, and game-specific rules. Check
   switching between this game and Emerald. Supported team members keep their
   slot positions. Members outside the new game's profiles leave empty slots.
10. Run `npm run data:check`, `npm test`, and `npm run build`. Check both planners,
    details, images, and PNG exports in the shared browser. Check a small screen.

The selector enables registered games. A build fails for invalid data, missing
images, or an incorrect registry/catalogue entry. Runtime validation also checks
the selected game. A load failure leaves the current game and team in place and
shows an error. Select the game again to retry.

For games with several regional lists, declare the ordered
`game.regionalDexSections` array. Each entry has an `id` and a visible `name`.
Give each regional profile its `regionalDexSectionId`. Number sequences are
unique and contiguous within each section. Profiles outside the regional
lists have neither field. The catalogue shows all sections in declared order,
then the remaining species in National Dex order.

## Loading and rule boundaries

Shared species and references load first. Game modules load on request. Valid
game results are cached; concurrent requests share the same load. Failed loads
can be retried. The availability worker loads and checks the queried game.
Build checks and tests assemble all registered games through `loadRawDataset`.

Access rules stay in `src/domain/availability/`. Team resource checks stay in
`src/domain/team/`. Neither module needs React or a browser API. Each query uses
the selected game's profiles, locations, sources, progress, and type chart.
Unknown source or evolution tags fail schema validation. Add a focused test and
the required domain rule before declaring a new mechanic in a game dataset.
Games with gender, encounter, evolution, or progress rules outside the current
model need that tested rule layer before registration.

Player trades and external events remain outside the acquisition scope. The
preparations do not add account data, a backend, an external API, or a trade
setting. Teams and settings still stay in memory.

Access means that a player could obtain a species at the selected story
progress. The planner does not track money, the current clock, a random seed,
or a roaming encounter's current route. Review such opportunities against the
game source and retain their actual story, item, species, and choice gates.
Do not treat these save details as a reason to omit reviewed acquisition paths.

Use the `roaming` source kind for a released roaming Pokémon. Give it a fixed
level and `maxUses: 1`. Its location represents the region where it can roam.
Keep the actual release gate. Do not use its initial route or the release town
as a fixed catch location, or invent a wild encounter rate.

Use `not-applicable` as the only gender value when a game has no gender system.
That value differs from a genderless species. Such a game must have no breeding.
The `headbutt` and `bug-contest` wild methods require capabilities with the same
IDs. Review those capabilities against the game's actual access rules.

Ditto can serve as a breeding partner but cannot be a breeding offspring.
Do not add an offspring rule for a profile in the Ditto Egg Group.

An evolution can declare `excludedSourceIds` when a reviewed acquisition cannot
use that evolution. Each ID must name a source of the parent species. The rule
checks the acquired individual's source, including later evolution steps. It
does not block a different individual that used the source as a prerequisite.
Yellow's starter Pikachu is one such case. Keep the normal Pikachu evolution
rule and exclude the starter source from it.

## Forms

Form support is implemented. Species keep unique National Dex numbers.
Do not add a second species record with the same number.

Use `data/forms.json` for form identities linked to the species. Add reviewed
alternate profiles to the game's profile, with local images, types, genders,
and Egg Groups. Sources and evolution edges use explicit form IDs. Evolution
does not infer an inherited form from the species name. Declare every native
form edge, including East Sea Shellos to East Sea Gastrodon. Form changes
retain the captured individual and check any separate held-item requirement.

Platinum, Diamond, and Pearl have reviewed native form data. Test that
two forms can have different types, sources, and images without changing the
species identity. Do not infer form access from a generation number.

## Visual maps: next display layer

The current app stores 88 Emerald location records. It has no visual map files,
coordinates, or route connections. Location cards and acquisition text use the
existing `locationId` references.

For visual maps, use `data/games/<game-id>/maps.json` for definitions and
`public/maps/<game-id>/` for reviewed local images. A definition should contain
its ID, image path, image dimensions, location markers, and review information.
Each marker should have a `locationId` and coordinates within those dimensions.
Several markers can refer to one location when the map needs that display.

Add schema and reference checks when the map view is implemented. The map view
must read access results from the domain module. Coordinates and visual route
lines must not grant access. Games can share an image while keeping separate
marker definitions and access rules. Document image sources with the assets.

## Scope after the preparations

The next working layer is one complete second game using existing supported
rules. Check two-game isolation before adding a group of games. Add forms,
additional encounter and evolution rules, content scope, and visual maps in
separate tested layers when reviewed game data requires them.
