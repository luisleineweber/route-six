# Hoenn Field Guide

Players use the guide next to their game in normal room light. Keep one calm
light surface. Group content with space and tone. Do not use divider lines,
eyebrow labels, hero text, or decorative stamps.

## Colour

Define colours in OKLCH. Keep the content surfaces white and neutral grey.
Use a dark, strong colour from the selected game for the header, primary
actions, and current selections. Show the field guide icon and header text in
white. Mark the active planner with a white background and dark text. Keep
hover and focus states clear on the dark header. Pair each status colour with
a name and an icon. Type colours come only from the type logos.

## Type

Use Segoe UI Variable or Segoe UI with a system font fallback. Use one family
with weights 400, 600, and 700. Do not set text below 13 pixels. Use tabular
numbers for counts and Dex numbers. Inputs use 16 pixels on narrow screens.

## Identity

- The header groups the site logo and both planner modes on one side. Show the
  selected game's official logo on the other side (`public/games/`). Group the
  game menu by generation. Mark games without reviewed local data as planned.
- Each of Emerald's 17 types has a round logo (`public/types/`, MIT licence).
  Slots and catalogue cards show the logo alone. The name stays available as a
  tooltip and to assistive technology. The details dialog and the type
  analysis keeps the name in the chart description and tooltip.
- Pokémon appear as pixel sprites from the Emerald image set.

## Layout

The Team Planner shows team slots, type analysis, and a simple catalogue.
Keep progress settings, access status, sources, and level limits in the
Progress Planner. Start the Progress Planner at Victory Road with the Current
progress target. Keep the team and progress settings when the view changes.

Show Progress Planner settings in a top bar before the team slots and
catalogue. Wrap controls into rows on narrow screens. Both modes use the full
content width. Use only the eight Gym checkpoints, then Victory Road, in one
flat list. Show each Gym's badge number, type, and leader. Do not use menu
groups. Use a custom progress dropdown with type icons, a clear Gym number,
and a second line for the leader and type. Mark the selected row with a check.
One selected point sets current or goal progress.

Show six slots in one row on wide screens, three per row on medium screens,
and one compact row per slot on phones. Keep empty slots visible and mark each
slot with its number. A tile has one main control that opens the details.
Filled slots have one Remove control. Empty slots have one Add control.

When the full team row scrolls above the viewport, show a full-width team bar
at the top. Center six small 4:3 cards in one row. Use two rows of three on
narrow screens. Split the upper area 60/40: sprite on the left, type logos on
the right. Show the name below. Keep empty cards with a question mark and Add
control. Show Remove on hover and keyboard focus, and keep it visible on touch
screens. Keep search and keyboard focus below the bar.

Combine weaknesses, resistances, and immunities in one compact defense chart.
Show six marks per attack type, one per team member. Use distinct symbols and
colours with a short legend. Keep attack coverage as a compact type strip.

Both catalogues use type logos and a search field. The Progress Planner also
uses status chips that show their counts. Sort regional Pokédex species first
in regional order. Then show the remaining species in National Dex order.
Show the name of the Dex with its number.
Use native radio inputs, checkboxes, details, and a dialog. Use the Radix Select
primitive for the progress dropdown's keyboard access and focus handling.
Build the level limit as a switch.
Whole-game planning in the Progress Planner shows every obtainable species,
including future sources. Keep source filters out of both catalogues.
Keep acquisition paths in the Progress Planner details dialog.

Show nine catalogue cards per row in the Team Planner and six in the Progress
Planner on wide screens. Use fewer columns on small screens. Show all matching
species in one grid without page controls or a grid size control.
Team cards open details when selected. Use a small sprite movement on hover
and focus. Place the types at the bottom right. Show Add above the top right
corner on hover and keyboard focus. Keep Add visible on touch screens.
Progress cards combine access status and source in one statement.

## Motion and access

Keep transitions short and limited to state changes. Respect reduced motion.
Keep visible focus. Support narrow screens down to 320 pixels without
horizontal page scrolling.
