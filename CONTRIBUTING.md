# Development guide

Route Six is a static React app. All game data is local JSON that we maintain
by hand. The app has no backend, no runtime API and no data import script.

The domain words (milestone, source, capability, choice conflict and others)
are defined in [CONTEXT.md](CONTEXT.md). The visual rules are in
[DESIGN.md](DESIGN.md).

## Run

Use Node.js 22.12 or later and npm.

```sh
npm ci
npm run dev        # development server
npm run build      # data check, TypeScript, build, prerender
npm run preview    # serve the production build
```

## Checks

```sh
npm test
npm run data:check
npm run typecheck
```

`npm run build` also fails for invalid data, missing images or a wrong game
registry entry. The large-data chunk warning is expected.

## Project layout

| Path | Content |
| --- | --- |
| `src/domain/availability/` | Access rules. No React or browser APIs. |
| `src/domain/team/` | Team resource and choice checks. |
| `src/domain/types.ts` | Application data types. |
| `src/data/game-registry.ts` | Registered games and their loaders. |
| `src/data/games/<game-id>.ts` | Imports one game's JSON files. |
| `data/` | Shared and per-game data. |
| `schema/` | JSON Schema for the data. |
| `public/` | Sprites, type icons, game logos, `llms.txt`. |

The first Progress Planner query runs in a web worker, so the page stays
usable. Later queries reuse the checked state.

## Data files

```text
data/
  references.json      source titles, URLs, locators and revisions
  pokemon.json         species ID, National Dex number, name, generation
  forms.json           form identities
  base-stats/          base stats for the Team PNG
  games/<game-id>/
    game.json          planner checkpoints, default point, breeding setting
    pokemon.json       supported species: types, genders, Egg Groups, sprite
    type-chart.json    full type matrix, neutral cells included
    progression.json   milestones and their mandatory previous milestones
    bosses.json        Gym, League and boss levels
    locations.json
    capabilities.json  game actions such as Surf or a fishing rod
    items.json
    choices.json       exclusive choices such as starter or fossil
    sources.json       ways to get a Pokémon
    breeding-rules.json
    evolutions.json
    exclusions.json    supported species with no native source, with a reason
  games/shared/<group>/  files that paired games share, such as sun-moon
```

Paired games can share files. For example, `src/data/games/sun.ts` combines
`data/games/shared/sun-moon/` with Sun's own `game.json` and `progress.json`.
Each game still has its own `game.json`, sources and exclusions.

JSON Schema checks the shape. `scripts/check-data.ts` checks references and
game rules. Every record keeps its reference IDs and review date.

## Data rules

- A game's `pokemon.json` is its supported species list. A missing profile
  means "not in this game". An exclusion means "in this game, but no native
  source". Do not use exclusions to hide unfinished data.
- Every profile needs a source, an incoming evolution or an exclusion.
- `previousIds` gives mandatory access. List order and `displayOrder` never
  grant access.
- Requirements are tagged trees: `all`, `any`, `milestone`, `location`,
  `capability`, `item` and `pokemon`. An empty `any` is invalid.
- `maxUses: null` means repeatable. A positive value limits one playthrough.
- Fossils, game trades and breeding must repeat their item, offered Pokémon
  or Day Care capability inside the requirement tree.
- Roaming Pokémon use the `roaming` kind with a fixed level, `maxUses: 1` and
  the real release gate. Do not invent a fixed route or encounter rate.
- Level-up evolutions always need a level gain. Player-trade evolutions are
  blocked. Record the real condition; do not mark all special evolutions as
  available.
- Source genders must be a subset of the profile genders. Use
  `genderTransitions` when an evolution changes the possible genders.
- When `game.breeding` is null, profiles have no breeding data and the game
  has no breeding rules or sources. Ditto is a partner, never an offspring.
- Forms keep one species and one National Dex number. Sources and evolutions
  name exact form IDs. A form change does not create a second Pokémon.
- Time, season, weekday, swarm and daily conditions use typed
  `encounterConditions`. The host clock never controls access.
- A wild source with a null rate shows no percentage. SOS sources can name
  callers and required weather. Let's Go overworld sources name land, water
  or air and whether the spawn is rare.
- An exclusion without `formId` covers the species and all its forms.
  `formId: null` covers the base form only. A form ID covers that form only.
- Use game-specific reference IDs for new records. Keep existing IDs stable.

## Add a game

1. Record the reviewed sources and revisions in `data/references.json`.
2. Add new species to `data/pokemon.json` only when needed.
3. Create `data/games/<game-id>/` with the same files as Emerald. Review each
   record. Do not copy another game's encounters or gates.
4. Give each profile its types, genders, regional Dex number, Egg Groups and
   a local `spriteSrc`. For several regional lists, declare
   `game.regionalDexSections` and give each profile its section ID.
5. Set `game.planner.checkpoints` and `defaultMilestoneId`. With Gyms, use
   Gym 1 to Gym 8, then Victory Road when the game has it, and default to
   Victory Road, else Gym 8. In Alola, use the island trials and grand trials
   in game order.
6. Set `game.breeding` to null or `{ "hatchLevel": <level> }`.
   If the game has native form changes (such as Platinum's Giratina), also add
   `form-changes.json`.
7. Add `src/data/games/<game-id>.ts` like the Emerald module. With form
   changes, import `form-changes.json` as the `formChanges` collection.
8. Add it to `progressGameLoaders` in `src/data/game-registry.ts`. The key must equal `game.id`
   and a catalogue ID.
9. Add tests for exact species coverage, early and late access, exclusions,
   defaults and game-specific rules. Check a switch to and from Emerald.
10. Run `npm run data:check`, `npm test` and `npm run build`. Check both
    planners, details, images and PNG export, also on a small screen.

If a game needs a mechanic that the model does not support, add the domain
rule and a focused test first.

## Release

Set both URLs in the build environment or in `.env.local` (see
`.env.example`). They must match:

```sh
SITE_URL=https://luisleineweber.github.io/route-six/
VITE_SITE_URL=https://luisleineweber.github.io/route-six/
```

The path of `SITE_URL` becomes the Vite `base`. The build uses it for the
canonical link, structured data and `sitemap.xml`. Without these values the
build prints warnings and serves from `/`.

- **Check release** runs on pull requests and pushes to `main`.
- **Publish beta** runs on pushes to `main` and when you start it by hand.
  It tests, audits, builds, runs `npm run release:check` and deploys to
  GitHub Pages. A merge to `main` publishes the site.
- `npx tsx scripts/check-host.ts <site-url>` checks a running preview or the
  live host.
- For Search Console, save the HTML tag `content` value as the
  `GOOGLE_SITE_VERIFICATION` repository variable, then publish again.

The build prerenders the start page into `dist/index.html`, and the browser
hydrates it. Do not add hidden keyword text for search engines.

## Assets

Sprites come from [PokéAPI](https://github.com/PokeAPI/sprites). Type icons
come from [partywhale/pokemon-type-icons](https://github.com/partywhale/pokemon-type-icons)
(`public/types/LICENSE.txt`). Logo sources are in `public/games/README.md`.
See [NOTICE.md](NOTICE.md) for the licence scope.
