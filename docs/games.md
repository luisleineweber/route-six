# Supported games and limits

Route Six supports 30 games. Team Planner and Progress Planner work in all of
them. The [README](../README.md#supported-games) lists them.

Each game has its own data. Route Six does not copy encounters, types or
story gates from one game to another. For example, Red uses the Generation I
types, and Ruby and Sapphire have different roaming Pokémon.

## What "available" means

A Pokémon is available when you **could** get it at the selected progress
point in that game. Route Six does not read your save, so it does not know
what you already own.

Route Six counts:

- Wild encounters, including fishing, surfing, Headbutt and other methods.
- Starters, gifts, eggs, fossils and fixed encounters.
- Roaming Pokémon after their release event.
- Trades with characters in the game.
- Breeding at the Day Care.
- Evolutions, with their level, item, time and other requirements.

Route Six does not count:

- Trades with other players. Pokémon that evolve only by trade show as blocked.
- Transfers from other games, Pokémon GO and the Poké Ball Plus.
- External events and distributions, such as the Eon Ticket or a Mew event.
- Pokémon that only appear in the other version of a game.

## What Route Six does not track

Route Six shows a possible path. It does not track:

- Money, Game Corner coins or items in your bag.
- Catch combos and Lures in Let's Go.
- The clock, the day of the week, the season or a daily swarm.
- Where a roaming Pokémon is now.
- Friendship values or how many times you used a one-time source.

When an encounter depends on the time, season or a daily event, the details
say so. Check that condition in your game.

## Choices and one-time sources

Some games make you choose, such as one starter or one fossil. Some sources
give only one Pokémon. Progress Planner warns you when your team needs
choices that you cannot all make in one playthrough.

## Level limits

When you turn on level limits, a progress point with a next boss uses the
highest level in that boss's team. Points without a next boss, such as after
the Champion, have no level limit. A Pokémon that needs a higher level is not available
yet. It shows as later when a later progress point allows it. A Pokémon that
you could already get stays available.

In Sun, Moon, Ultra Sun and Ultra Moon, the progress points follow the island
trials instead of Gyms.

## Report a problem

If a location, level or requirement is wrong,
[open an issue](https://github.com/luisleineweber/route-six/issues). Include
the game, the progress point and the Pokémon.
