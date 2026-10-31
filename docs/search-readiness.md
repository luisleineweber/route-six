# Route Six search setup

Reviewed on 27 October 2026.

## Page purpose

Search title: **Pokémon Team Planner & Playthrough Guide | Route Six**

Description: Build Pokémon teams for 24 games. Check type weaknesses, export
your team, and find encounters and evolutions in 16 supported playthrough guides.

The title leads with the task players can do. Route Six remains the site name.
The title stays the same when a player changes the game or planner view.
Those controls share one URL; they are not separate search pages.

Keep the interface compact. Use the original planner headings, header
description, and loading message. Do not add visible marketing paragraphs or
a guide section for search purposes.

## Build output

The Vite search plugin writes the title, description, Open Graph tags, and
Twitter card tags into the head of `dist/index.html`. This metadata does not
add text to the visible page. Google renders the React app to read its page
content; this build does not add a separate text version of the interface.

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
HTTPS origin. Do not include a path, query, fragment, or credentials. Then run
`npm run build`.

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

1. Check the public HTML, canonical URL, `robots.txt`, and `sitemap.xml`.
2. Verify the site in Google Search Console and submit the sitemap.
3. Use URL Inspection to check the rendered home page and request indexing.
4. Check search terms, impressions, and clicks after Google processes the site.
   Use those results to improve the page text.

Google chooses the final search title and snippet. These changes give it clear
page content; they do not guarantee placement or a fixed search appearance.

## Sources

- [Google: title links](https://developers.google.com/search/docs/appearance/title-link)
- [Google: JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Google: site names](https://developers.google.com/search/docs/appearance/site-names)
- [Google: build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Google: hidden text and links](https://developers.google.com/search/docs/essentials/spam-policies#hidden-text-and-link-abuse)
