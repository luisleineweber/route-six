# Pokémon White coverage

## Current app status: 14 October 2026

Team Planner is enabled with 649 reviewed base profiles and 156 regional entries. Type analysis, six team slots, details and PNG export use local data. Progress Planner remains pending. Its acquisition, route, evolution, breeding and form coverage is incomplete. The earlier review below is retained as source history. Current checks take precedence. See [the shared status](generation-456-progress.md).

Status: partial-reviewed battle and base-profile layers. Review date: 2026-10-13. White remains disabled and unregistered.

## Verified records

- `data/games/white/type-chart.json` contains the 17-type Generation V chart. Gen V uses the Gen II–V interactions. Fairy and Generation VI Steel changes do not apply.
- `data/games/white/bosses.json` records highest levels for the Gym leaders, Elite Four, and story-ending N/Ghetsis battles. Striaton's specialty depends on the chosen starter.
- `data/games/white/pokemon.json` contains 649 base-species profiles. It uses the pinned PKHeX Black/White personal table for exact types, gender possibilities, and Egg Groups. Each profile points to the local National Dex sprite.
- The 156 Black/White Unova Dex entries use numbers 000–155. Victini has `regionalDex: 0`; the other Gen V species use 1–155. Other species omit `regionalDex`.
- `docs/white-forms.md` inventories form-sensitive cases and the smallest shared model change.

The PKHeX personal data identifies species records. It does not prove that a species or form can be acquired natively in White. The profile list is a base-profile layer, not an acquisition or completion claim.

## Model gaps and open work

- One profile per species cannot express multiple form types, source forms, form-specific images, or form-conditioned evolution outcomes.
- The wild method enum does not cover dark grass, shaking grass, dust clouds, rippling water, and seasonal encounter behavior.
- Evolution records do not support all White-specific location and condition evolution requirements or gender-conditioned target forms.
- Breeding needs White-specific review for special offspring and held-item rules.
- Progression, native acquisition, items, choices, exclusions, and the remaining collection locators still need White source review. The partial Black decompilation is not a White source.
- Shared profile and form reference proposals await parent review. Secondary sources support the regional numbering and form behavior; they do not replace a pinned White reconstruction.

## Recommended next step

Review the proposed references. Add tested form and encounter support, then source-check native acquisition, progression, and other White rules. Keep White disabled until all required records are reviewed.