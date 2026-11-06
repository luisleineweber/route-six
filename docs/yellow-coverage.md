# Yellow review coverage

Review status: all thirteen collections are reviewed from the pinned source, including tracked items and native acquisition coverage.

Pinned source and proposed reference records are in
[yellow-sources.md](./yellow-sources.md). The review scope is the original
international game, with native captures, gifts, NPC trades, and ordinary
postgame access. Player link trades and external distributions are out of scope.

## Collection status

| Collection | Status |
| --- | --- |
| Game | Reviewed: Pallet Town default and 11 progress checkpoints |
| Profiles | Reviewed for all 151 species; all profiles pass the profile schema, with unique type IDs |
| Type chart | Reviewed: full Generation I 15-by-15 chart |
| Progression | Reviewed: 57 story, route-entry, and League milestones, all eight badges, and post-game cave access |
| Bosses | Reviewed: eight Gym leaders, Elite Four, Champion highest levels |
| Locations | Reviewed: 83 routes, towns, buildings, caves, and gated subareas |
| Capabilities | Reviewed: 15 HM, rod, guard, key-item, and Safari access rules |
| Items | Reviewed all tracked planner items; all five finite Moon Stone pickups and the four repeatable Celadon stone stocks are recorded. Ordinary consumable pickups and other mart stock are outside tracked resources |
| Choices | Partial: dojo and Mt. Moon fossil choices; starter is fixed Pikachu |
| Sources | 542 grass, 42 Surf, 216 rod records, gifts, choices, trades, fossil revivals, both Snorlax, eight fake-ball encounters, Zapdos, Articuno, Moltres, and Mewtwo are recorded |
| Breeding rules | Reviewed as empty: Yellow has no breeding |
| Evolutions | Reviewed: 72 level, stone, and trade rules; starter Pikachu source excluded from Thunder Stone evolution |
| Exclusions | Reviewed: Mew and 13 version-specific species have no ordinary native acquisition path; every exclusion is listed by ID |

## Review boundary

Yellow data is complete for this reviewed scope. Ordinary consumable pickups, general mart stock, link trades, and external distributions are outside tracked planner resources.

Profiles are checked against the 151 `data/pokemon/base_stats/*.asm` files in
pinned `pret/pokeyellow`. That count describes species records in the source;
it does not prove that every species is natively obtainable. Every profile now
passes the game profile schema. The 89 mono-type profiles store one type ID.

The access graph and map gates were reviewed against the pinned Yellow scripts,
map headers and objects, badge map table, HM use checks, and key item effects.
Every Route 1-25 now has one route-entry milestone. Each route milestone follows
its first reviewed story or field-move gate, including the Poké Flute routes,
the Soul Badge surf routes, and Route 23 after Viridian Gym. HM capabilities use
the maintained item IDs `hm01-cut` through `hm05-flash`. Celadon stone stock,
Moon Stone pickups, and key-item pickups point to declared Yellow milestones.
The reviewed wild collection has no wild Pikachu entry. Yellow's only reviewed
Pikachu source is the starter. Do not add a wild Pikachu source or claim that one can
evolve in Yellow without new source evidence. Grass and Surf source rates are
conditional shares within each selected table. They are not step encounter rates.
The exact map and floor table inventory and slot weights are in
[yellow-sources.md](./yellow-sources.md).



## Static encounters and acquisition coverage

I reviewed the static object tables and event scripts at the pinned commit. The three roaming-free legendary encounters are Articuno (Seafoam Islands B4F, level 50), Moltres (Victory Road 2F, level 50), and Mewtwo (Cerulean Cave B1F, level 70). All three are recorded as one-use static sources. Existing static records include both Snorlax encounters, six Power Plant Voltorb, two Electrode, and Zapdos.

I reviewed Mew against the ordinary in-game script and trade tables. Yellow contains no ordinary native Mew source. Its unused trade entry is Mew for Mew and cannot start a native acquisition. The external distribution and glitch paths are outside this scope, so Mew has an `external-event` exclusion. The 13 Yellow-unavailable species have `other-version` exclusions: Weedle, Kakuna, Beedrill, Ekans, Arbok, Raichu, Meowth, Persian, Koffing, Weezing, Jynx, Electabuzz, and Magmar. A focused test walks evolution paths from sourced species and checks that each remaining profile has exactly one reviewed exclusion.
