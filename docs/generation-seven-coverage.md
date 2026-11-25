# Generation VII coverage

Reviewed on 24 November 2026. All six games load in both planners.

| Games | Species profiles | Regional Pokédex entries |
| --- | ---: | ---: |
| Sun and Moon | 802 | 302 |
| Ultra Sun and Ultra Moon | 807 | 403 |
| Let’s Go, Pikachu! and Let’s Go, Eevee! | 153 | 153 |

## Team data

- The pinned [PKHeX personal tables](https://github.com/kwsch/PKHeX/tree/a5311f9f55a84376fd2e2499b25d9fb9640d9f2d/PKHeX.Core/Resources/byte/personal)
  supply types, genders, Egg Groups and base stats. The inputs are
  `personal_sm`, `personal_uu` and `personal_gg`. Their 84-byte records
  store the six base stats first. Form indexes point to additional records.
- [PokéAPI CSV data](https://github.com/PokeAPI/pokeapi/tree/de6760be38b60a3024f1d9054330ff265f0dc619/data/v2/csv)
  supplies English identities and Pokédex numbers. Alola uses the full
  regional lists 16 and 21. Let’s Go uses list 26, which includes Meltan
  and Melmetal. The four overlapping island lists per Alola release are
  outside the current catalogue scope.
- The four Alola games share 800 equal profiles. The original games and the
  Ultra games each supply their own regional numbers and extra profiles.
  Pikachu is Alola #025 in Sun and Moon and #032 in both Ultra games.
  Dusk Form Lycanroc and the two Necrozma fusions are Ultra selections.
- Let’s Go has its own Kanto profiles and has no breeding. The partner
  forms have separate IDs and base stats. Each edition shows its own
  partner alongside the standard form. Both games include the 18 Alolan
  forms in the supported profiles. [Official partner guide](https://pokemonletsgo.pokemon.com/en-us/story/)
- Team Planner includes the reviewed regional and persistent forms in
  the profile data. Cosmetic variants and battle states have no separate
  selections. The catalogue represents the species a game supports.
  Native access and version restrictions belong in Progress Planner.
- [PokéAPI sprites](https://github.com/PokeAPI/sprites/tree/c0542f7c51215d9672439012838c99f520596cbd/sprites/pokemon)
  are stored with the app. The 18 Alolan forms use static frames from the
  pinned Ultra Sun and Ultra Moon sprites. The catalogue prefers each
  native Alolan form when both it and the base form match the filters.

## Progress Planner

The four Alola editions share matching records, with further shared
records for Sun and Moon and for the two Ultra editions. Each game keeps
its distinct trials, ride unlocks, captures, trades, gifts, and evolution
rules. Island Scan uses its weekday schedule. SOS encounters can show
the caller and weather when the source records them.
See [Alola coverage and sources](alola-progress.md).

The two Let’s Go editions share their Kanto checkpoints and common sources.
Land, water and air spawns have separate access rules. Each game keeps its
own partner and exclusives. See [Let’s Go coverage and sources](lets-go-progress.md).

The native gameplay scope excludes player trades, transfers, and
external distributions. The planner does not track a save file.

## Earlier PokéAPI data review

Filter the pinned PokéAPI encounter table by version ID. Join
`encounters.csv` to `location_areas.csv`, `encounter_slots.csv`,
`encounter_methods.csv` and `encounter_condition_value_map.csv`.
The raw counts include duplicates across encounter slots, gifts and trades.
One check found five Sun rows for New Mauville in Hoenn. They report Voltorb
and Electrode as fixed encounters. Another check found 100 percent rarity
in every Route 1 Let’s Go, Pikachu! row, even for the different air spawns.
The raw counts describe the input. They cannot establish native access or
spawn rates.

| Edition | Version ID | Raw rows |
| --- | ---: | ---: |
| Sun | 27 | 891 |
| Moon | 28 | 890 |
| Ultra Sun | 29 | 1,216 |
| Ultra Moon | 30 | 1,216 |
| Let’s Go, Pikachu! | 31 | 693 |
| Let’s Go, Eevee! | 32 | 693 |

The raw files share 849 rows within Sun and Moon, 1,106 within the Ultra
pair, and 649 within the Let’s Go pair. Across the four Alola games, 144
rows agree. This comparison includes area, Pokémon ID, encounter method, slot,
rarity, level range and conditions. It excludes row and version IDs. These
rows are candidates for reuse after their story gates pass review.

- **Sun and Moon.** Keep SOS encounters, fishing and Island Scan tied to
  their own actions. Use island trials and grand trials as checkpoints.
  Cross-check gifts, trades and fixed encounters with the pinned
  `Encounters7SM.cs` legality templates. Build the Ride access gates from
  the story order. [Official island challenge guide](https://press.pokemon.com/en/Z-MOVES-AND-ALOLAN-POKEMON-VARIANTS-ANNOUNCED-FOR-POKEMON-SUN-AND-POKE)
- **Ultra Sun and Ultra Moon.** Check equality before reusing Alola records.
  The games change trials and add Mantine Surf, Ultra Space encounters and
  new species. Reuse an evolution only when its form, action and access gate
  agree. The PokéAPI evolution table records changes by version group.
  Filtering only for group 18 omits the base rules that still apply.
  [Official Ultra changes](https://press.pokemon.com/en/NEW-DETAILS-REVEALED-FOR-POKEMON-ULTRA-SUN-AND-POKEMON-ULTRA-MOO-30650)
- **Let’s Go.** Check Kanto spawn tables by edition, and keep land, water,
  air and rare spawns distinct. Check access through Secret Techniques.
  Partner evolutions are unavailable. Alolan trades consume the offered
  Pokémon. Each edition has its own wild exclusives.
  [Official game guide](https://www.pokemon.com/us/pokemon-video-games/pokemon-lets-go-pikachu-and-pokemon-lets-go-eevee)

PKHeX keeps the three matching C# files in
[Legality/Encounters/Data/Gen7](https://github.com/kwsch/PKHeX/tree/a5311f9f55a84376fd2e2499b25d9fb9640d9f2d/PKHeX.Core/Legality/Encounters/Data/Gen7).
Use them to check sources and levels. The templates cover several kinds of
legal origin. Use the story gates to establish native access.
