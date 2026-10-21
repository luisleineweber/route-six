# White 2 native form review

Review date: 2026-10-13. This is an inventory for the future form layer. It does
not approve form-sensitive acquisition data or game registration.

## Verified model need

The current profile has one type pair, one gender set, and one sprite path per
National Dex identity. PKHeX's pinned `PersonalInfo` definition exposes types,
egg groups, gender ratio, and form-count/stat-index as separate personal-data
properties. Its records can therefore distinguish form-specific stats from
species identity. The current planner cannot represent those differences.

The first White 2 form pass must inspect the pinned BW2 personal records and
game scripts before authoring the inventory below. Do not treat this note as a
complete list of form access or encounter sources.

## Candidate persistent forms requiring source review

PKHeX's generation-five format supports form data. The following identities
need an explicit form audit against the pinned personal records and White 2
form-change scripts before any form-sensitive profile or source is approved:

- Unown, Castform, Deoxys, Burmy, Wormadam, Shellos, Gastrodon, Rotom,
  Giratina, Shaymin, Arceus, Basculin, Darmanitan, Deerling, Sawsbuck,
  Tornadus, Thundurus, Landorus, Kyurem, Keldeo, Meloetta, and Genesect.
- Gender-specific appearance or form data also needs audit for species such
  as Unfezant, Frillish, Jellicent, and Meowstic is not a Generation V species
  (do not include it in this game).

Some differences are cosmetic or seasonal. Some battle forms are temporary.
Do not infer a type change from an appearance change. Do not make battle-only
Mega or Primal states permanent forms in the ordinary story planner.

## Smallest shared model change

Add a shared form identity collection linked to the existing National Dex
species ID, then let a game profile declare available persistent forms. Put
form-specific type, gender, Egg Group where it truly differs, and local image
on the game form profile. Add an optional form ID to sources and evolution
outcomes. Preserve one species identity and make access and type analysis use
the selected form. Keep cosmetic variants that do not affect planner behavior
out of this first model.

Before implementation, define stable form IDs and decide whether seasonal
forms are selectable or are derived from an ignored game clock. White 2
seasonal access cannot be represented as a fixed story gate under the current
scope. Verify all candidate entries against the pinned source first.
