# Publication checks

Prepared on 6 November 2026. Target: the first Route Six beta at
`https://luisleineweber.github.io/route-six/`.

## Current evidence

- The release production build and release output checks pass with the
  project-site URL. All 59 built JavaScript assets pass the local host check.
- The final TypeScript check passes, including the new release scripts.
- The full dependency audit reports zero known vulnerabilities.
- The prepared source archive passes the local-file and credential-pattern
  scan. No local history is included.
- The full test run passes 809 of 811 tests. Two X/Y tests exceed their
  time limits (95 seconds against 60 seconds; 5.97 seconds against 5 seconds).
  Both test cases pass in both versions when repeated separately: four pass,
  forty unrelated cases skipped, 76 seconds for the selected run. Limits
  were not changed. Other test workloads ran on the same computer during
  the full run. This supports load-sensitive timings, not a data assertion
  failure. Keep the full result red and require a green CI run before deploy.
- A physical-phone timing check and checks at the final public URL remain
  open. No GitHub repository, commit, push or public deployment was created
  by this preparation. The owner selected MIT for original application code
  on 6 November. `LICENSE` and `NOTICE.md` record its scope and exclusions.

## Release checks

The Check release workflow runs on pull requests and pushes to main.
The Publish beta workflow runs only when started manually. It runs the
tests, dependency audit, production build and release output check before
uploading the site. Only its deployment job can write to GitHub Pages.
Enable GitHub Actions as the Pages source after creating the repository.
The workflows use Node 24 and the committed lockfile.

The dependency audit found a moderate advisory in `fast-uri`. The lockfile
now selects the fixed release. The full dependency audit reports zero
known vulnerabilities on 6 November. The archive scan reports zero matching
credentials or local-only files. These are checks, not a guarantee that no
unknown vulnerability or unrecognized secret exists.

Both release URL values must match. `npm run release:check` checks the
canonical URL, sitemap, site path and entry assets. The production build
also checks local game data, images and TypeScript. Keep the large-data
warning visible. It is not evidence of a failed build.

## Public repository content

The local Git history contains tracked build logs and project instructions.
Ignoring these files now does not remove their old versions from history.
Do not push that history as the initial public repository without reviewing
those files. A clean source snapshot is the safer initial publication path.
Keep the existing local history intact. Do not include `output/`, local
environment files, research source trees, usage records or personal notes.
Keep game data references and third-party notices in the source snapshot.

Original application code uses the root MIT licence. `NOTICE.md` excludes
Pokémon images, names, game logos, datasets and other external material. The existing
type-icon MIT notice is in `public/types/LICENSE.txt`. The app credits the
sprite and icon sources. Review the intended public asset distribution
before publication; attribution alone does not establish image rights.

Source references for these checks: [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages),
[PokéAPI sprites](https://github.com/PokeAPI/sprites), and the local
`public/games/README.md` logo source list. These references document sources
and deployment behaviour; they do not grant new rights to third-party art.

Run `python scripts/prepare-release-source.py` and then
`python scripts/check-release-source.py` to produce and check
`output/route-six-release-source.zip`. Its manifest records every included
file. The archive excludes the local Git history and agent instructions.

## Checks on the final host

Check the initial Emerald load and switch to HGSS and a Generation VI game.
Open both planners, add and remove team members, open details and export a
PNG. Check worker and image requests below `/route-six/`. Repeat at 320
pixels and on a physical phone. A local production check does not prove the
host serves the worker and assets correctly.

The local preview serves all 59 JavaScript files, including the worker,
below `/route-six/`. Start the preview with the same two URL settings as
the build. Otherwise Vite serves assets from a different path. Run
`npx tsx scripts/check-host.ts <site-url-with-final-slash>` against the
running preview or final host. This check covers entry loading, JavaScript
content types, notices and sitemap. It does not replace the UI checks.

HGSS's first access query took about 40 seconds on the development computer.
Measure it on a phone before a broad release. The worker keeps input usable.
Do not promise instant results. Plans reset on reload; the footer explains
this. PNG export preserves a picture, not an editable plan.

The app has no accounts, analytics or runtime data service. GitHub Pages
still receives normal site requests. Do not claim that hosting collects no
request information. No save sync, offline install or cross-device restore
is part of this beta.
