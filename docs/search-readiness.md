# Route Six search setup

Updated on 13 November 2026.

## Page purpose

Search title: **Pokémon Team Planner & Playthrough Guide | Route Six**

Description: Build Pokémon teams for 24 games. Check type weaknesses, export
your team, and find encounters and evolutions in 24 supported playthrough guides.

The title leads with the task players can do. Route Six remains the site name.
The title stays the same when a player changes the game or planner view.
Those controls share one URL; they are not separate search pages.

Keep the interface compact. Use the original planner headings and header
description. Do not add visible marketing paragraphs or
a guide section for search purposes.

## Build output

The Vite search plugin writes the title, description, Open Graph tags, and
Twitter card tags into the head of `dist/index.html`. This metadata does not
add text to the visible page.

The build then prerenders the start page. `vite build --ssr
src/entry-server.tsx` builds a renderer into `dist-ssr/`, and
`scripts/prerender.ts` renders the real initial interface with
`react-dom/server` into `#root` of `dist/index.html`. The HTML then contains
the header, game selector, planner navigation, team slots, type analysis, and
the Pok�dex list of the default game. It is the same tree the browser shows;
there is no separate text version. In the browser, `src/main.tsx` loads the
same game and calls `hydrateRoot`. Effects, workers, and canvas code do not
run during the build render. A render error or a missing `#root` stops the
build. `npm run dev` serves the empty template and renders on the client.

`public/llms.txt` provides a separate plain-text summary for agents. It covers
features, supported games, and limits. A help link in the HTML head points to
it. Tests compare its game lists with the registry. It is an optional context
file, not a Google ranking feature or a guarantee that an agent will use it.

Do not place keyword paragraphs off-screen or hide them with CSS for search
engines. Google classifies text hidden only to affect rankings as abuse.
Use accurate metadata and structured data for the actual planner features.

The output keeps the character encoding declaration near the start of the
document. The planner still uses local data and needs no runtime API or backend.

## Set the public URL before release

Set `SITE_URL` in the host's build environment or in `.env.local`. Use the final
HTTPS site URL. A path must end with `/`. Do not include a query, fragment, or
credentials. Then run `npm run build`.

The path of `SITE_URL` becomes the Vite `base`. All public assets load below
it. The planned GitHub Pages project site uses these build values:

```sh
SITE_URL=https://luisleineweber.github.io/route-six/
VITE_SITE_URL=https://luisleineweber.github.io/route-six/
```

Search engines read `robots.txt` only at the host root. On a project site, the
build still writes `robots.txt` below the path, but crawlers ignore it. Submit
`sitemap.xml` in Search Console instead.

The build uses that value for:

- The canonical home page link.
- The Open Graph page URL.
- `WebSite` and `WebApplication` structured data.
- The home page entry in `sitemap.xml`.
- The sitemap reference in `robots.txt`.

When `SITE_URL` is empty, the build reports a warning. It omits these
domain-specific entries and still writes `robots.txt`. When `VITE_SITE_URL`
is empty, the build reports a second warning. The footer site link and the
PNG site address are then omitted. Invalid values stop
the build with a clear error. The local build has no invented public domain.

The sitemap contains one real page. Game selections and planner controls do
not have separate URLs. The structured data has no ratings or review claims.

## After publication

1. Check the public HTML, canonical URL, and `sitemap.xml`:
   `npx tsx scripts/check-host.ts https://luisleineweber.github.io/route-six/`
   after `npm run build` with the release values.
2. In Google Search Console, add a **URL prefix** property for
   `https://luisleineweber.github.io/route-six/`. A domain property is not
   possible, because `github.io` DNS is not under project control.
3. Select the **HTML tag** method. Copy only the `content` value of the tag.
4. Save the value as a repository variable and publish again:

   ```sh
   gh variable set GOOGLE_SITE_VERIFICATION -R luisleineweber/route-six --body "<content value>"
   gh workflow run pages.yml -R luisleineweber/route-six
   ```

   The build writes `<meta name="google-site-verification">` into the home
   page head. A value that is not a plain token stops the build. Without the
   variable, the build writes no tag.
5. After the deployment, select **Verify** in Search Console. Keep the
   variable: Google checks the tag again later.
6. Submit `sitemap.xml` in **Sitemaps**.
7. Use URL Inspection to check the rendered home page and request indexing.
8. Check search terms, impressions, and clicks after Google processes the site.
   Use those results to improve the page text.

Google chooses the final search title and snippet. These changes give it clear
page content; they do not guarantee placement or a fixed search appearance.

## Sources

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: hidden text and links](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-link-abuse)
