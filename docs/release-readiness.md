# Route Six first beta

Updated on 5 November 2026.

All 24 enabled games now support both planners. The app is close to a first
beta. Publication and checks on the final host remain separate release work.
The [HGSS report](hgss-progress-review.md) records its scope and known limits.

## Current scope

- Team Planner supports 24 games from Generations I to VI.
- Progress Planner supports the same 24 games.
- Both views share six team slots. Players can export a PNG.
- Plans reset on reload. The footer explains this limit. Saving and loading
  a plan is a separate feature, not part of this release change.
- Game data and images are local. The build needs no runtime API or server.

The game registry in `src/data/game-registry.ts` defines support. See
[Generation IV–VI status](generation-456-progress.md) for the pending games.

## Name and header

Route Six is the working name selected by the owner. The route mark has six
points for the six team slots. The header separates the name, game selector,
and planner controls. The footer, loading screen, page title, and browser
icon use the same name or mark.

Screenshots are in `output/route-six/`. They include the previous header,
the new header, and the new header at 320 pixels.

## Before publication

- Choose a static host and the public URL. No host configuration is present
  in this repository.
- Set `SITE_URL` to that public HTTPS origin before the release build. Follow
  [search setup](search-readiness.md) to check the sitemap and Search Console.
- Set `VITE_SITE_URL` to the public site URL for the footer link.
  Use the same URL as `SITE_URL` when the app and site share one domain.
- Run the full tests and production build. Check the published site after
  upload: initial load, game switch, both planners, details, and PNG export.
  Check the worker, local images, and the 320-pixel layout on that host.

The existing large-chunk warning comes from local game data. It does not
block the build. Check first-load speed on the chosen host before a wider
release.

## Local checks

- `npm test`: 736 tests pass in 74 files on 28 October 2026.
- `npm run build`: all game data, local images, TypeScript, Vite, and
  document copying pass. The existing large-chunk warning remains.
- Production browser check: planner switching keeps the team. Keyboard
  controls work. The header fits at 320 and 768 pixels. The browser reports
  no app errors or warnings, and loaded images have no broken sources.

See [implementation checks](implementation-checks.md) for details.

## Generation V completion: 28 October 2026

Black, White, Black 2 and White 2 have active native offline Progress Planners.
The totals are 24 Team Planner games and 20 Progress Planner games. Each game
passed data validation before registration and has nine checkpoint tests.

The [Generation V review](generation-5-progress-review.md) records the four
read-only Luna reviews, parent source checks, source pins, resolved conflicts,
native scope and domain rules. Coverage includes the special native sources,
version keys, native solo missions, phone trades, breeding and persistent forms.

All four games pass the browser checks: Progress Planner loads, both views
keep the same six slots, game switching clears the slots, Undo restores
them, and details show access paths. The 320-pixel pages have no horizontal
scroll. Loaded images have no broken sources. No app errors were reported.
The report is `output/generation-v-progress/browser-report.json`.

The data check and production build pass. All 736 tests pass in 74 files.
See [implementation checks](implementation-checks.md) for logs and images.
The existing large-chunk and unset `SITE_URL` warnings remain. No release,
commit, branch change, push or publication was made by this work.
