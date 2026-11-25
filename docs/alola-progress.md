# Alola Progress Planner

Sun, Moon, Ultra Sun, and Ultra Moon use separate story paths and encounter
records. The planner starts when you choose your first partner. It includes
the main island trials, grand trials, the Pokémon League and a post-game
checkpoint. The Ultra games move Hapu's grand trial after Mina's trial.

The planner checks Poké Ride access, the Fishing Rod, SOS battles, Island
Scan, Poké Pelago, in-game trades, fossils, breeding, and evolutions. It uses
the current edition's native forms. For example, Ultra Space lets Pikachu
evolve into Kantonian Raichu. It does not grant the same evolution in Sun or
Moon.

## Review sources

- Ordinary encounters come from the pinned ROM-derived location tables.
  Use the table for the current edition. The planner leaves the rate blank
  when the table does not establish a percentage. [Encounter tables](https://github.com/Scotts-Thoughts/pokemon-data/tree/96107bb60fc031b699602483ce67fe201443af1d/encounters/by_location)
- Fixed encounters, gifts, trades, and Island Scan levels use the PKHeX
  legality templates and the game location records. A Pokémon received in
  an in-game trade can evolve upon receipt. [PKHeX templates](https://github.com/kwsch/PKHeX/tree/a5311f9f55a84376fd2e2499b25d9fb9640d9f2d/PKHeX.Core/Legality/Encounters/Data/Gen7)
- The route order and trial gates follow the game walkthroughs. Fishing
  starts after Lana's trial. Tauros Charge starts after Hala's grand trial.
  [Sun and Moon walkthrough](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Sun_and_Moon), [Ultra walkthrough](https://bulbapedia.bulbagarden.net/wiki/Walkthrough:Pok%C3%A9mon_Ultra_Sun_and_Ultra_Moon), [Poké Ride](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9_Ride)
- Rules for the Nursery include form inheritance and items that affect egg
  species. The planner models the four Oricorio styles and the nectar that
  changes them. [Breeding](https://bulbapedia.bulbagarden.net/wiki/Pok%C3%A9mon_breeding), [Nectar](https://bulbapedia.bulbagarden.net/wiki/Nectar)

## Scope

The planner covers local play. Player trades, transfers, and external
distributions are outside this scope. Dusk Form Lycanroc requires an
external Own Tempo Rockruff lineage. The current profile catalogue has no
separate Totem-sized selections, cap variants, or temporary battle states.
Some SOS records show a known caller or weather. Remaining SOS records
show the encounter action. Story and item dependencies can control when a
source becomes available even when its location opens earlier.

## Regenerate the data

Put the pinned ROM-derived encounter files in an input folder. Name the
original table `sm.js` and the Ultra table `usum.js`. Download
`pokemon_evolution.csv` and `pokemon_species.csv` from the pinned
[PokéAPI CSV data](https://github.com/PokeAPI/pokeapi/tree/de6760be38b60a3024f1d9054330ff265f0dc619/data/v2/csv)
to the same folder.

Run `py -B scripts/alola_progress.py <input-directory>` from the repository
root. The script writes game metadata, the shared Alola progress records,
records shared by each pair, and records unique to an edition. Run
`npm run data:check` and `npx vitest run tests/alola-progress.test.ts`.
