# Supported games and limits

Route Six supports 24 games. Team Planner and Progress Planner work in all of
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
- Transfers from other games.
- External events and distributions, such as the Eon Ticket or a Mew event.
- Pokémon that only appear in the other version of a game.

## What Route Six does not track

Route Six shows a possible path. It does not track:

- Money, Game Corner coins or items in your bag.
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

When you turn on level limits, Route Six uses the highest level in the next
boss's team. Level evolutions above that limit count as later.

## Report a problem

If a location, level or requirement is wrong,
[open an issue](https://github.com/luisleineweber/route-six/issues). Include
the game, the progress point and the Pokémon.
