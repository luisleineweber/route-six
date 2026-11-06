# Specification checks

Checked on 2026-10-07.

- All four schema files passed Draft 2020-12 schema validation.
- Twenty-seven valid synthetic data cases passed structural validation.
- Thirty-four invalid synthetic data cases failed structural validation as expected.
- All 116 local schema references resolved without a remote schema request.
- The combined TypeScript examples passed `tsc --noEmit --strict` with ES2022
  and DOM libraries.
- All local document links resolved.
- Each specification file is below 400 lines.

The cases cover source kinds, source level rules, evolution triggers,
evolution conditions, nested requirements, finite uses, exclusions, breeding
sources, offspring rules, Egg Groups, source genders, and gender transitions.
Invalid cases cover missing fields, unknown fields, invalid levels and dates,
duplicate types, invalid rates and multipliers, mismatched source kinds,
missing breeding fields, invalid Egg Groups, and invalid gender transitions.

These checks apply to the specification and schema shape. The full data set and
availability engine now have separate [implementation checks](implementation-checks.md).

Breeding is confirmed for the MVP. These checks include its schema and types.
Compatible parent proofs, reusable resources, and breeding cycle checks now have
domain regression coverage in `tests/`.
