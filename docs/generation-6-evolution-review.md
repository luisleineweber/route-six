# Generation VI evolution rule review

Checked on 18 October 2026. The shared rules are implemented. X and Y now
have active acquisition and progress data, reviewed on 21 October 2026.
See [the integration review](xy-progress-review.md). Omega Ruby and Alpha
Sapphire still need their complete acquisition and progress data.

## Implemented rules

A party type requires a real source for another species or form with that
type. The proof retains that partner, its choices, and its acquisition costs.
The same partner can support more than one evolution. It can also occupy a
team slot. A generic capability cannot replace the partner.

Affection uses a separate Pokémon-Amie capability. It does not use friendship.
The current condition represents 50 affection points, shown as two hearts.
Sylveon also needs a reviewed Fairy move and a route to learn that move.
Natural rain and upside-down device orientation each need an explicit action
capability. All four conditions require a level gain. A Pokémon at level 100
cannot satisfy that gain in Generation VI.

The validator rejects an unknown party type, a party condition with no other
compatible profile, an incorrect trigger, and an action requirement that can
be bypassed through a free alternative. Details and export show the actions.

## Source comparison

The pinned [PKHeX resource and reader](https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/Legality/Evolutions)
use species indexes for Generation VI. Each evolution record has eight bytes.
The destination form is separate from the source species index.

| Evolution | Resource method | Minimum level field | Extra fact needed |
| --- | --- | ---: | --- |
| Pancham to Pangoro | 30 | 32 | Another Dark-type party member |
| Inkay to Malamar | 28 | 30 | Upside-down device |
| Eevee to Sylveon | 29 | 0 | Affection and a known Fairy move |
| Sliggoo to Goodra | 4 | 50 | Natural rain |
| Tyrunt to Tyrantrum | 32 | 39 | Day |
| Amaura to Aurorus | 33 | 39 | Night |
| Espurr to male Meowstic | 23 | 25 | Male gender, destination form 0 |
| Espurr to female Meowstic | 34 | 25 | Female gender, destination form 1 |

This legality resource does not prove every runtime condition. Sliggoo uses
the generic level-up method. Pancham's argument is 32; it is not a Dark-type
ID. The legality checker accepts several of these methods without checking
their party, affection, weather, or device state. Do not remove gameplay
conditions on that basis. A zero minimum level field also still requires a
level gain.

The pinned [PokeAPI evolution metadata](https://github.com/PokeAPI/pokeapi/blob/81d20919845b6a445969b9265aab5cec6b04cece/data/v2/csv/pokemon_evolution.csv)
supplies a separate community comparison. Its Generation VI rows record
Dark party type, upside-down orientation, rain, day, night, two affection
hearts, and a Fairy move. They agree with the conditions above. PokeAPI uses
different numeric type IDs from PKHeX. Do not copy numeric IDs between them.

Sylveon's Generation VI row has `is_default: 0`. A later row uses friendship
from a later version group. Selecting only default rows would apply the wrong
rule to X, Y, Omega Ruby, and Alpha Sapphire. Game records must keep the
version-specific rule and reviewed move learning routes.

The comparison is saved in `output/gen6-native-evolution-checks.json` and
`output/gen6-evolution-metadata-check.json`. The metadata file has SHA-256
`e78be51c8805551fffccd5551a556e752e4a76ff1b52482b53b409dd3882e1dd`.
Neither comparison proves route access, move access, item access, or complete
native acquisition coverage.
