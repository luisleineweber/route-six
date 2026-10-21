# SoulSilver data coverage and blockers

## Current app status: 14 October 2026

Team Planner is enabled with 493 reviewed base profiles and 256 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Status: `blocked on shared schema and identity work`. This is an incomplete draft. The parent must keep SoulSilver disabled.

The pinned source review is in [soulsilver-sources.md](soulsilver-sources.md). It maps every one of the thirteen game collections to exact repository paths. The repository uses shared HGSS source files in many places. The review still needs a second pass through SoulSilver-specific script branches before data authoring.

## Current layer

No game JSON records are ready to author. The shared identity catalogue ends at Generation III. A SoulSilver profile would refer to missing Gen IV identities, and this agent cannot edit `data/pokemon.json` or local shared assets. The present evolution schema also cannot faithfully represent multiple Gen IV triggers. Writing an incomplete profile set, a generic type chart, or empty source/evolution/exclusion collections would falsely imply coverage.

## Required shared next steps

1. Add reviewed shared identities for National Dex #387–493 and local species images. Add an exact identity coverage test.
2. Add a form model with stable form IDs and explicit profile, acquisition, evolution, team, and sprite references. Decide and document which HGSS forms are separate acquisition outcomes.
3. Extend evolution conditions for friendship, day/night, location, learned move, gender, party species, and trade-held-item. Add focused tests for each condition before adding SoulSilver evolution rows.
4. Extend acquisition sources and gates for time-based encounters, radio, swarms, Headbutt trees, Bug-Catching Contest, Safari Zone blocks, Pokéwalker, and version-specific static/event gifts where these are within scope. Preserve each source's actual gate and method.
5. Review HGSS special breeding rules and add a representation for special offspring such as Manaphy/Phione and incense outcomes. Do not encode fake generic breeding rules.
6. Verify the complete Gen IV type chart at the pinned revision. Gen IV has 17 types and no Fairy type; do not reuse post-Gen-VI Steel/Dark matchups.
7. Map the full Johto and post-League Kanto progression from event scripts. Confirm the selected scope for optional facilities and postgame content.
8. Merge the proposed reference from [soulsilver-sources.md](soulsilver-sources.md) in a parent-owned change, then validate its shape against `data/references.json` schema.

## Thirteen collection state

The source notes give a pinned path and locator for each collection. No collection is marked complete. Do not treat empty arrays or copied Gold/Silver data as reviewed SoulSilver data. In particular, keep HeartGold/SoulSilver version differences separate for exclusives, roaming/static Pokémon, events, and item sources.

## Verified facts and open questions

Verified: the repository has separate personal species data, evolution data, encounter data, trainer data, item data, and map event scripts. It is an HGSS reconstruction with many shared records. These facts support the locators in the source notes.

Open: the SoulSilver-specific rows for every encounter table; full form availability and forms' planner relevance; the exact event milestone graph; optional facilities in scope; and complete source coverage for gifts, roaming encounters, Pokéwalker, radio, swarms, and special breeding. Resolve these before authoring data.

## Round 2 layer

The reviewed type chart is ready in `data/games/soulsilver/type-chart.json`. It is a complete Gen IV chart from the pinned source table. This is a standalone game-data layer, not a complete SoulSilver dataset. All other collections remain open. Keep SoulSilver disabled.

### Exact next work

1. Parent adds reference ID `soulsilver-pret-2026-10-13` to shared references.
2. Review the egg creation code and cite the exact level passed to egg generation before setting `game.breeding.hatchLevel`.
3. Map trainer table indices to SoulSilver story/Gym event IDs before authoring Gym and League boss levels.
4. Build milestone IDs and checkpoint definitions from reviewed event scripts. Then author `game.json` and `progression.json` together.
5. Resolve identities, forms, evolution conditions, encounters, and breeding gaps listed above before authoring those collections.

## Round 3 base profile layer

`data/games/soulsilver/pokemon.json` now has 493 reviewed base species profiles. It uses the first 493 personal records at the pinned source revision. Each profile has the game's base types, possible genders, Egg Groups, local National Dex sprite, and review. The profiles use the exact Johto order from `files/application/zukanlist/zkn_data/zukan_data.json`, under `sorting` → `dex_order` → `johto` → `mons`, for regional numbers 1–256.

This is only a base-profile layer. The current schema cannot retain form IDs, form-specific types, or form-specific images. See [soulsilver-forms.md](soulsilver-forms.md). Keep SoulSilver disabled until shared form support and all other game records are complete.

### Verified profile coverage

- 493 source records map in order to the 493 supported National Dex identities.
- The game has 17 types and no Fairy type.
- Profiles use the existing local image `/pokemon/<National Dex>.png`.
- Gender, Egg Group, and type fields come from the pinned personal records.

### Still open

- Add the proposed `soulsilver-pret-2026-10-13` reference to the shared reference list.
- Add shared form IDs and game-specific variants for Wormadam, Arceus, Shaymin, and other form data needed by the planner.
- Review native form item access. Do not make form variants appear as new species identities.
- Finish the other twelve game collections and all exact source coverage, progression, and mechanics checks.
