# Pearl native forms review

## Active form data: 20 October 2026

Pearl now supports Sandy and Trash Burmy, Sandy and Trash Wormadam,
East Sea Shellos, and East Sea Gastrodon. All alternate profile fields match
the native Pearl personal table. Six Burmy changes and the explicit East Sea
Shellos evolution preserve the selected form. Local images, teams, details,
and export use the form under one species identity. Unown letters remain
cosmetic appearances under one selection. Origin Giratina and appliance Rotom
are outside Pearl's native form scope. See
[the current review](diamond-pearl-progress-review.md).
The incomplete status and model gaps below are historical.

Status: inventory is incomplete. Pearl stays disabled. This note records the
form families that need explicit review before any profile or acquisition layer
can claim full form coverage.

## Verified game scope

The pinned `pret/pokediamond` revision is the source of truth. It stores
species personal data in the binary personal NARC selected by the Pearl build.
The current repository checkout does not expose that NARC as reviewed text.
Do not infer Pearl forms from Platinum-only records.

The pinned PKHeX Gen IV personal-record definition is a useful decoder check.
`PersonalInfo4.cs` defines a 0x2C-byte record. It reads types at offsets 0x06
and 0x07, gender ratio at 0x10, Egg Groups at 0x14 and 0x15, and form count and
form-stat index at 0x29 and 0x2A. This defines the binary fields. It does not
by itself establish Pearl's species values or acquisition.

## Form inventory to verify against Pearl records and scripts

| Species | Candidate persistent forms | Required checks |
| --- | --- | --- |
| Unown | Letter forms | Identify which letters Pearl supports, image mapping, and whether form access has any effect on team planning. |
| Burmy | Plant, Sandy, and Trash Cloaks | Verify change conditions and form inheritance on evolution. |
| Wormadam | Plant, Sandy, and Trash Cloaks | Verify distinct types: Bug/Grass, Bug/Ground, and Bug/Steel. Verify only female Burmy evolves to Wormadam. |
| Cherrim | Overcast and Sunshine | Check whether form changes only in battle. If so, do not model as a persistent team form. |
| Shellos | West Sea and East Sea | Verify Pearl distribution, types, gender ratio, evolution inheritance, and local image needs. |
| Gastrodon | West Sea and East Sea | Verify inheritance from Shellos and local image needs. |
| Rotom | Appliance forms | Confirm whether these are absent in Diamond/Pearl and introduced only in Platinum. Do not add Platinum forms to Pearl. |

The candidate inventory is not a complete verified list. Check the pinned
Pearl personal records, form handling code, map scripts, and form graphics
before closing it. Distinguish forms that persist in the party from forms that
exist only in battle. Keep one National Dex identity for each species.

## Smallest shared model change

Add shared stable form IDs, then add optional form IDs to game profiles and
form-specific type and image records. Acquisition sources and evolution rules
must name a form only when the source or evolution constrains it. Team slots
must retain the selected form ID. Keep the species ID and National Dex number
unchanged. Add tests for two same-species forms with different types or images,
and for female-only Burmy evolution when the source confirms that rule.

Do not add forms to Pearl data until the shared form layer can represent and
validate them.
