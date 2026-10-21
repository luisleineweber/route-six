# Black 2 native form inventory

Review date: 13 October 2026. This is a reviewed inventory of the main
story and ordinary postgame scope. It does not finish Black 2 data.

## Verified persistent form cases

| Species | Native forms | Persistent effect | Model impact |
| --- | --- | --- | --- |
| Rotom | Normal, Heat, Wash, Frost, Fan, Mow | Appliance changes typing to Electric/Ghost, Electric/Fire, Electric/Water, Electric/Ice, Electric/Flying, or Electric/Grass. Forms persist after leaving the appliance room. | Form identity needs game-specific types and image path. |
| Kyurem | Kyurem, Black Kyurem, White Kyurem | DNA Splicers fuse Kyurem with Zekrom or Reshiram. Black Kyurem is Dragon/Electric; White Kyurem is Dragon/Fire. Fusion can be undone. | Form-aware item action and reversible form state. Do not represent either as an evolution or species. |

## Other native forms

- Basculin Red-Striped and Blue-Striped are persistent species forms. They have
  the same Water type, gender rules, and base-stat-independent evolution
  outcome (none). They need distinct artwork if shown as separate forms.
- Deerling and Sawsbuck have four season appearances. The season changes their
  appearance, not type or gender. The season follows the in-game season and
  can change over time. Treat these as cosmetic forms, not four species.
- Unown has letter forms and punctuation forms. The forms change appearance,
  not type or gender. Encounter location can constrain letters. The current
  acquisition model cannot preserve this distinction.
- Spinda has spot-pattern forms. The pattern is cosmetic and does not change
  type, gender, or evolution. The game does not provide a finite named form
  list suitable for this catalogue.
- Shellos and Gastrodon East Sea / West Sea forms differ in appearance only.
  Both have Water/Ground typing and the same gender and evolution rules.
- Darmanitan's Zen Mode is a battle-triggered ability form. It is not a
  persistent party selection and has the same Fire/Psychic form typing only
  during battle. Do not add it to planner forms.
- Meloetta's Pirouette Form is activated by Relic Song in battle, then returns
  to Aria Form outside battle. It is Normal/Fighting while active and
  Normal/Psychic in Aria Form. It is a battle-only form.
- Keldeo's Resolute Form changes appearance and move access, but not its
  Water/Fighting typing, gender, or evolution. Treat as cosmetic for this
  planner.
- Tornadus, Thundurus, and Landorus have Incarnate and Therian forms. Their
  types remain Flying; Flying, Electric/Flying; and Ground/Flying respectively.
  The Reveal Glass changes these persistent forms. Gender does not change.
- Genesect's drives change Techno Blast's move type, not Genesect's Bug/Steel
  typing. The drive is an item choice, not a species form for type analysis.
- Shaymin Sky Forme is event-dependent in Black 2, reverts when frozen or at
  night, and changes typing. It is outside the normal native acquisition
  scope unless event content is explicitly added later.

## Source evidence and review limits

- [PKHeX Black 2 personal table](https://github.com/kwsch/PKHeX/tree/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/Resources/byte/personal/personal_b2w2)
  is pinned to `641c26ba100225f3605e5a44b61b3b16e15a3774`. Its binary records
  describe species typing, gender ratio, and Egg Groups. The record layout is
  defined in
  [PersonalInfo5B2W2.cs](https://github.com/kwsch/PKHeX/blob/641c26ba100225f3605e5a44b61b3b16e15a3774/PKHeX.Core/PersonalInfo/Info/PersonalInfo5B2W2.cs).
- [Bulbapedia Rotom](https://bulbapedia.bulbagarden.net/wiki/Rotom_(Pok%C3%A9mon))
  and [Kyurem](https://bulbapedia.bulbagarden.net/wiki/Kyurem_(Pok%C3%A9mon))
  form histories describe appliance forms and DNA Splicers. Black 2 event
  walkthroughs and the in-game item rules are needed to author exact gates.
- The form summaries above identify schema requirements. Exact acquisition
  routes, story gates, item records, and event scope still need direct
  Black 2 source review before access records are written.

## Proposed smallest shared model change

Add stable form records under one shared National Dex identity. A game profile
must select an explicit base form. Form records need a stable ID, owning
`pokemonId`, local image path, game-specific types, and review. Add explicit
form IDs to sources, evolution outcomes, and team slots. Add a reversible
form-change rule that names its item or capability gate. Keep form rules out of
species identity and base evolution. Add a focused test for one type-changing
form, one cosmetic form, and Kyurem fusion plus separation.

## Status

Base profiles are not written in this round. The pinned record layout and
complete source extraction still need review before exact profile facts can be
entered by hand. Black 2 must remain disabled until profiles and form-sensitive
rules are reviewed.
