# Route Six field guide

Players use the guide next to their game in normal room light. Keep one calm
light surface. Group content with space and tone. Do not use divider lines,
eyebrow labels, hero text, or decorative stamps.

Keep the visible planner copy short. Put search descriptions in page metadata
and agent summaries in separate text files.

## Colour

Define colours in OKLCH. Keep the content surfaces white and neutral grey.
Use a dark, strong colour from the selected game for the header, primary
actions, and current selections. Show the field guide icon and header text in
white. Mark the active planner with a white background and dark text. Keep
hover and focus states clear on the dark header. Pair each status colour with
a name and an icon. Type colours come only from the type logos.

Follow the system colour scheme. Each game sets only a hue and a chroma. The
stylesheet sets the lightness for each theme. In the dark theme, keep the
surfaces neutral grey, from oklch 0.17 for the page to 0.29 for tile hover.
Keep the header and primary actions in the dark game colour with white text.
Use a light tone of the game colour (lightness 0.8) for links, focus, and
selection lines. Mark the active planner with the page background and light
text. Use light status colours on dark tint surfaces. In the defense chart, give
the strongest effect the brightest mark. PNG exports stay light.

## Type

Use Segoe UI Variable or Segoe UI with a system font fallback. Use one family
with weights 400, 600, and 700. Do not set text below 13 pixels. Use tabular
numbers for counts and Dex numbers. Inputs use 16 pixels on narrow screens.

## Identity

- Route Six is the working name. Its mark draws a six with a route and six
  points, one for each team slot (`public/route-six.svg`). Use the same mark
  in the footer and browser icon. Keep the mark white in the header.
- The header has two rows. Put the name and mark on the leading side and the
  selected game's official logo on the other side (`public/games/`). Give the
  game control a darker surface and a Change game hint. Put both planner
  controls below in one shared selection area, with equal widths and a short
  description of each view. On phones, put the game below the name and show
  only the planner names, without icons or descriptions. Group the game menu
  by generation. Mark games without reviewed local data as planned.
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
flat list for every game. If a game has no Victory Road milestone, show only
its eight Gyms. Start at Victory Road when it exists; otherwise start at Gym 8.
Show each Gym's badge number, type, and leader. Do not use menu groups. Use a
custom progress dropdown with type icons, a clear Gym number, and a second line
for the leader and type. Mark the selected row with a check. One selected point
sets current or goal progress.

Show six slots in one row on wide screens, three per row on medium screens,
and two compact cards per row on phones. Keep empty slots visible and mark each
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
species in one grid without page controls. On small screens, let players choose two, three, or four columns.
Team cards open details when selected. Use a small sprite movement on hover
and focus. Place the types at the bottom right. Show Add above the top right
corner on hover and keyboard focus. Keep Add visible on touch screens.
Progress cards combine access status and source in one statement on wide screens.
On small screens, use three columns by default and large sprites. Put the name
and type icon on one row below the sprite in both catalogues. Use a split icon
for two types. Keep locations
and evolution requirements in details. Show short access labels only when the
visible results contain different access states.

## PNG exports

PNG exports use a separate poster layout. They do not change the page layout.
Use three columns and export at 2400 pixels wide. Give each Pokémon a large
pixel sprite. In Progress exports, use a type-colored image area with large
type symbols in the background. For two types, split the color area diagonally into equal areas.
Fit each complete type symbol within its area. Keep the name,
Dex number, slot number, and type names readable above that background.
Progress exports do not repeat type symbols in small circles. Use the selected game's
logo with a large, clear team title. Team exports use “My Pokémon team” and a
short description of the type chart. Progress exports use “My playthrough
team”. In Progress exports, show the selected
point and level limit. Do not repeat the game name or the current target label.

In Progress exports, place location and evolution details below each image
area on the plain sheet. Use two aligned rows of three. Give all six image
areas the same height. Align the location and evolution sections within each
row. Prefer an earlier valid acquisition path to a simpler late catch. Put
other encounter options in one section below the team. Label each group with
its original slot number and Pokémon name. Show each
place once and at most two extra places per member. Give the remaining count
and point to the planner for the full list. Keep evolution requirements,
conditions, and team warnings. Wrap long names and text. Keep empty slots visible.
Use larger, darker detail text and keep image panels compact without reducing
sprite size. Put the location on its own line in the extra-location section.
If an extra catch needs evolution steps absent from the main chain, show those
steps once below its printed locations, with their requirements.

In Team exports, place the six image areas above the defense and coverage
charts. Keep the chart symbols and their text legend.
Use neutral card surfaces with a subtle dot pattern. Put the sprite beside
a transparent base stat chart. Print the highest values in red, without a
badge. Keep every tied highest value red. State “Base stats” once below the
title. Use the selected game's reviewed stats and a fixed 0–255 chart range.
Generation I uses one Special axis; later games use six axes. Do not print
scale values. Show small type icons with names below the Pokémon name.
Fit visible sprite pixels inside their reserved area. Wrap long form names
and enlarge all cards equally when they need more space. Keep empty slots.
These card changes apply only to Team PNG exports.
Put “Made with Route Six” below the notes in both exports. Print the public
site address below the credit when `VITE_SITE_URL` is set.

## Motion and access

Keep transitions short and limited to state changes. Respect reduced motion.
Keep visible focus. Support narrow screens down to 320 pixels without
horizontal page scrolling.
