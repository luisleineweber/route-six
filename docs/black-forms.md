# Pokémon Black native form review

Reviewed on 27 October 2026. The active Progress Planner has 12 alternate
form profiles. Each profile keeps its own types, genders, breeding data,
local image and review reference. Forms share the species’ National Dex number.

| Species | Native persistent forms | Access rule |
| --- | --- | --- |
| Basculin | Red-Striped and Blue-Striped | Own encounter tables and fixed NPC trade. Breeding inherits the parent’s stripe. There is no free stripe-change action. |
| Deerling and Sawsbuck | Spring, Summer, Autumn, Winter | Seasonal capture and season-change action. Evolution keeps the seasonal form. |
| Rotom | Base, Heat, Wash, Frost, Fan, Mow | Native Rotom plus Shopping Mall Nine appliances. Gen V appliance types are Electric/Fire, Water, Ice, Flying, or Grass. |
Battle-only changes do not create persistent selectable team members.
External-event forms and species do not gain access from a type profile.
No type is inferred from a form name: White Kyurem is not Dragon/Fire and
Black Kyurem is not Dragon/Electric. Gastrodon remains Water/Ground.

Pinned personal tables, form actions and source locators are in the
[source review](black-sources.md). The form checks include inherited forms, native
partner access, partner conflicts, and separation in `tests/fusion.test.ts`.

## Local form images

Image archive revision: `ba403973fdf9d0ac59175813861e6a1f8ed5020c` in
[PokeAPI sprites](https://github.com/PokeAPI/sprites/tree/ba403973fdf9d0ac59175813861e6a1f8ed5020c).
Existing Rotom and Shellos/Gastrodon images remain in use. New image pins:

| Form | Archive path | SHA-256 |
| --- | --- | --- |
| basculin-blue-striped | `sprites/pokemon/10016.png` | `d33574b961f258554fc83a6f54cdd51d2042bfa528a2bc17d02fb7351a5d8ad8` |
| deerling-summer | `sprites/pokemon/585-summer.png` | `fd543e6194ae949e0dfe83c3d82912585189dbd2c862b28c22a1342a1458908e` |
| deerling-autumn | `sprites/pokemon/585-autumn.png` | `f9c52f56824deba311fde2bb739e7936db4858fb1b2637ddbf692420b52882ca` |
| deerling-winter | `sprites/pokemon/585-winter.png` | `efc568706571ce7eca0edd82d12045c1d5358011d3d034ee3c6ad0f43fd059ce` |
| sawsbuck-summer | `sprites/pokemon/586-summer.png` | `c8d6a6821a27627ed815beccd9cb81d4b698d7d86bea796d78986ab7336c3669` |
| sawsbuck-autumn | `sprites/pokemon/586-autumn.png` | `4af6a14a7fae4954f32b2285a0974bb5cb5fe14835a926095dc1a732476369a4` |
| sawsbuck-winter | `sprites/pokemon/586-winter.png` | `b9e31b16ff72b619fc42644fede2362dc6ec99340df2b0ef104c5b74e51d096b` |
