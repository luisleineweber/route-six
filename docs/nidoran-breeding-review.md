# Nidoran breeding review

Reviewed on 21 October 2026. The active Generation II, III, and IV data now
keeps the female and male Nidoran offspring rules separate.

Female Nidoran with a compatible partner can produce either Nidoran species.
Male Nidoran, Nidorino, or Nidoking with Ditto produces Nidoran male only.
Nidorina and Nidoqueen cannot breed. They remain in the Undiscovered Egg Group.

Gold and Crystal lacked the male offspring from female Nidoran. Gold, Silver,
and Crystal also gave Nidorino eggs from Nidorino and Nidoking. These eggs now
contain Nidoran male. Ruby, Sapphire, Emerald, FireRed, LeafGreen, Diamond,
Pearl, and Platinum had one rule that let male parents produce both species.
Each game now has a separate male parent rule and its own egg source.

The change keeps the game's hatch level. Generation II and III eggs hatch at
level 5. Generation IV eggs hatch at level 1. The change adds no native
acquisition source for a parent that is unavailable in that game.

## Source evidence

Gold and Crystal select the female or non-Ditto parent, then call
`GetPreEvolution` twice. The random branch checks only `NIDORAN_F`.

- [Gold Day Care source](https://github.com/pret/pokegold/blob/ef0201d8daf47e8b3ea1518eacf890f37d4cd5e8/engine/events/daycare.asm)
- [Crystal Day Care source](https://github.com/pret/pokecrystal/blob/3bc8daa4173e96a7f4011dad3922eb6fa5dad5c6/engine/events/daycare.asm)

Generation III walks the evolution table back to the base species in
`GetEggSpecies`. The split in `DetermineEggSpeciesAndParentSlots` changes only
a female Nidoran result. The same branch also keeps Volbeat and Illumise
separate. Their reviewed records already match this behavior.

- [Ruby and Sapphire Day Care source](https://github.com/pret/pokeruby/blob/5784633ce4ef7ade1a7f2d2d0c288e3d5e6cdd7f/src/daycare.c)
- [Emerald Day Care source](https://github.com/pret/pokeemerald/blob/731ad5bfd6e6f265508d0efcca0ba42f9dcf5881/src/daycare.c)
- [FireRed and LeafGreen Day Care source](https://github.com/pret/pokefirered/blob/037335f4c725d7c9aecdac87066f2002b4bd7e14/src/daycare.c)

Generation IV checks the same female base species in Diamond and Pearl's
`ov05_021ECE44` and Platinum's Day Care code.

- [Diamond and Pearl Day Care source](https://github.com/pret/pokediamond/blob/b623abef1b4dfe204ca50aab42447ac00c134290/arm9/overlays/05/asm/ov05_021EC458.s)
- [Platinum Day Care source](https://github.com/pret/pokeplatinum/blob/fe1ea418a7364c93daf0d07ae55e195452d8803c/src/overlay005/daycare.c)

Generation VI uses different split rules. The new X/Y candidate retains both
offspring from male Nidoran parents with Ditto. It does not copy the older
generation rule into X/Y.

## Regression scope

The tests use actual game profiles, breeding rules, and egg sources. Controlled
parent sources give each test the required parent and Ditto. The solver must
then produce the expected eggs. The controlled sources are test fixtures.
They do not claim that a game has a native gift for each tested parent.

The initial Generation II/III run failed 23 of 32 cases. Separate Generation
IV checks cover all three male stages, the female split, Volbeat, and Illumise.
Final full test and build results are recorded in
[implementation checks](implementation-checks.md).
