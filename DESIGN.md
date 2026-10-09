# Hoenn Field Guide

Players use the guide next to their game in normal room light. Keep one calm
light surface. Group content with space and tone. Do not use divider lines,
eyebrow labels, hero text, or decorative stamps.

## Colour

Define colours in OKLCH. Surfaces are near-white with a faint green tint. Use
the emerald accent for primary actions and the current selection only. Pair
each status colour with a name and an icon. Type colours come only from the
type logos.

## Type

Use Segoe UI Variable or Segoe UI with a system font fallback. Use one family
with weights 400, 600, and 700. Do not set text below 13 pixels. Use tabular
numbers for counts and Dex numbers. Inputs use 16 pixels on narrow screens.

## Identity

- The selected game version has a logo, drawn for this project (`public/games/`).
- Each of Emerald's 17 types has a round logo (`public/types/`, MIT licence).
  Slots and catalogue cards show the logo alone. The name stays available as a
  tooltip and to assistive technology. The details dialog and the type
  analysis show logo and name.
- Pokémon appear as pixel sprites from the Emerald image set.

## Layout

Show shared settings at the left on wide screens and keep them in view. On
narrow screens show them first as one compact row that opens the settings.
Then show team slots, warnings, type analysis, and the catalogue.

Show six slots in one row on wide screens, three per row on medium screens,
and one compact row per slot on phones. Keep empty slots visible and mark each
slot with its number. A tile has one main control that opens the details. Add,
replace, and remove stay separate controls on top of it.

Filter the catalogue with status chips that show their counts, a row of type
logos, a search field, and a source select. Use native selects, radio inputs,
checkboxes, details, and a dialog. Build the level limit as a switch.

## Motion and access

Keep transitions short and limited to state changes. Respect reduced motion.
Keep visible focus. Support narrow screens down to 320 pixels without
horizontal page scrolling.
