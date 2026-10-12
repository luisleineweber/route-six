# TypeScript contract

These declarations describe the proposed data and public results. They are
specification examples, not application files. Tags make each case explicit.
See [TypeScript union guidance](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#discriminated-unions).

## Input data

```ts
export {};

type Id = string;
type Level = number; // Integer from 1 to 100; validated when data loads.
type Multiplier = 0 | 0.5 | 1 | 2;
type Gender = "male" | "female" | "genderless";
type EggGroupId = "monster" | "water-1" | "bug" | "flying" | "field" | "fairy"
  | "grass" | "human-like" | "water-3" | "mineral" | "amorphous" | "water-2"
  | "ditto" | "dragon" | "undiscovered";

interface Review {
  referenceIds: Id[];
  checkedOn: string; // ISO calendar date.
}

interface Reference {
  id: Id;
  title: string;
  locator: string;
  url?: string;
  revision?: string;
}

interface Pokemon {
  id: Id;
  nationalDex: number;
  name: string;
  introducedGeneration: number;
  review: Review;
}

type Requirement =
  | { kind: "all"; requirements: Requirement[] }
  | { kind: "any"; requirements: Requirement[] }
  | { kind: "milestone"; id: Id }
  | { kind: "capability"; id: Id }
  | { kind: "item"; id: Id; quantity: number; consumed: boolean }
  | { kind: "pokemon"; id: Id; quantity: number; consumed: boolean };

interface Game {
  id: Id;
  name: string;
  generation: number;
  region: string;
  firstMilestoneId: Id;
  review: Review;
}

interface PokemonProfile {
  pokemonId: Id;
  regionalDex?: number; // Omit for species outside the regional Pokédex.
  types: [Id] | [Id, Id];
  breeding: {
    eggGroupIds: [EggGroupId] | [EggGroupId, EggGroupId];
    genders: Gender[];
  };
  review: Review;
}

interface BreedingRule {
  id: Id;
  parentPokemonIds: Id[];
  offspringPokemonIds: Id[];
  requiredHeldItemId: Id | null;
  review: Review;
}

interface TypeChart {
  typeIds: Id[];
  matrix: Multiplier[][];
  review: Review;
}

interface Milestone {
  id: Id;
  name: string;
  kind: "route" | "story" | "boss" | "area";
  phase: "main-story" | "post-game";
  displayOrder: number;
  previousIds: Id[];
  locationId: Id | null;
  nextBossId: Id | null;
  review: Review;
}

type Boss = {
  id: Id;
  name: string;
  highestLevel: Level;
  review: Review;
} & ({ kind: "gym"; badgeNumber: number; specialtyTypeId: Id }
  | { kind: "elite-four" | "champion" });

interface Location {
  id: Id;
  name: string;
  requirements: Requirement;
  review: Review;
}

interface Capability {
  id: Id;
  name: string;
  requirements: Requirement;
  review: Review;
}

interface ChoiceGroup {
  id: Id;
  name: string;
  options: Id[];
  maximumSelections: number;
  review: Review;
}

interface ChoiceSelection {
  groupId: Id;
  optionId: Id;
}

interface ItemSource {
  id: Id;
  locationId: Id;
  requirements: Requirement;
  maxUses: number | null;
  choice: ChoiceSelection | null;
  review: Review;
}

interface Item {
  id: Id;
  name: string;
  sources: ItemSource[];
  review: Review;
}

type SourceLevel =
  | { kind: "fixed"; value: Level }
  | { kind: "range"; minimum: Level; maximum: Level }
  | { kind: "match-traded-pokemon"; pokemonId: Id };

type SourceDetails =
  | {
      kind: "wild";
      method: "grass" | "surf" | "old-rod" | "good-rod" | "super-rod" | "rock-smash";
      ratePercent: number;
    }
  | { kind: "starter" | "gift" | "static" | "egg" }
  | { kind: "fossil"; itemId: Id }
  | { kind: "game-trade"; offeredPokemonId: Id }
  | { kind: "breeding"; ruleId: Id; capabilityId: Id };

interface PokemonSource {
  id: Id;
  pokemonId: Id;
  locationId: Id;
  requirements: Requirement;
  level: SourceLevel;
  genders: Gender[];
  maxUses: number | null;
  choice: ChoiceSelection | null;
  details: SourceDetails;
  review: Review;
}

type EvolutionCondition =
  | { kind: "friendship"; minimum: number }
  | { kind: "beauty"; minimum: number }
  | { kind: "time"; period: "day" | "night" }
  | { kind: "stats"; relation: "attack-lt-defense" | "attack-eq-defense" | "attack-gt-defense" }
  | { kind: "personality"; modulus: number; minimum: number; maximum: number }
  | { kind: "party-space"; freeSlots: number };

interface Evolution {
  id: Id;
  fromPokemonId: Id;
  toPokemonId: Id;
  trigger: "level-up" | "use-item" | "player-trade";
  minimumLevel: Level | null;
  itemId: Id | null;
  conditions: EvolutionCondition[];
  genderTransitions: { from: Gender; to: Gender }[] | null;
  requirements: Requirement;
  coProductIds: Id[];
  review: Review;
}

interface Exclusion {
  pokemonId: Id;
  reason: "other-version" | "external-event";
  explanation: string;
  review: Review;
}

interface GameData {
  game: Game;
  profiles: PokemonProfile[];
  typeChart: TypeChart;
  milestones: Milestone[];
  bosses: Boss[];
  locations: Location[];
  capabilities: Capability[];
  items: Item[];
  choices: ChoiceGroup[];
  sources: PokemonSource[];
  breedingRules: BreedingRule[];
  evolutions: Evolution[];
  exclusions: Exclusion[];
}

interface Dataset {
  schemaVersion: 1;
  references: Reference[];
  pokemon: Pokemon[];
  games: GameData[];
}
```

## Module results

These types describe computed values. They do not belong in the maintained JSON.
The snapshot indexes current, future, and parent paths so both planning targets
can use the same proofs.

```ts
type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

interface ValidationIssue {
  recordId: Id | null;
  fieldPath: string;
  message: string;
}

interface AvailabilityQuery {
  gameId: Id;
  milestoneId: Id;
  respectLevelLimit: boolean;
}

type QueryError =
  | { code: "unknown-game"; gameId: Id }
  | { code: "unknown-milestone"; milestoneId: Id };

interface ResourceClaim {
  resourceId: Id; // A namespaced source or item-source ID.
  quantity: number;
  use: "consume" | "retain";
}

interface ParentWitness {
  pokemonId: Id;
  gender: Gender;
  pathId: Id;
}

interface BreedingStep {
  sourceId: Id;
  ruleId: Id;
  parents: [ParentWitness, ParentWitness];
}

interface AcquisitionPath {
  id: Id;
  pokemonId: Id;
  sourceIds: Id[];
  evolutionIds: Id[];
  breedingSteps: BreedingStep[];
  genders: Gender[];
  minimumLevel: Level;
  firstMilestoneIds: Id[];
  choices: ChoiceSelection[];
  claims: ResourceClaim[];
  coProductIds: Id[];
}

interface Blocker {
  code: "progress" | "level-limit" | "item" | "pokemon" | "condition"
    | "breeding-parents" | "player-trade" | "other-version" | "external-event";
  relatedId: Id | null;
  message: string;
}

interface AvailabilityEntry {
  pokemonId: Id;
  status: "available" | "later" | "blocked" | "unavailable";
  currentPathIds: Id[];
  futurePathIds: Id[];
  firstMilestoneIds: Id[];
  blockers: Blocker[];
}

interface AvailabilitySnapshot {
  query: AvailabilityQuery;
  levelLimit: { bossId: Id; level: Level } | null;
  entries: Record<Id, AvailabilityEntry>;
  paths: Record<Id, AcquisitionPath>;
  choiceGroups: ChoiceGroup[];
  resourceLimits: Record<Id, number | null>;
}

type PlanningTarget = "whole-game" | "current-progress";

interface TeamWarning {
  code: "too-many-members" | "unavailable" | "later" | "choice-conflict" | "finite-resource";
  slotIndexes: number[];
  relatedId: Id | null;
  message: string;
}

interface TeamCheck {
  feasible: boolean;
  chosenPathIds: Id[];
  warnings: TeamWarning[];
}

interface TypeAnalysis {
  weaknesses: Record<Id, number>;
  resistances: Record<Id, number>;
  immunities: Record<Id, number>;
  repeatedTypes: Record<Id, number>;
  coveredTypes: Id[];
  totalTypes: number;
}

declare function validateDataset(input: unknown): Result<Dataset, ValidationIssue[]>;
// getAvailability requires data that passed structural and semantic validation.
declare function getAvailability(data: Dataset, query: AvailabilityQuery): Result<AvailabilitySnapshot, QueryError>;
declare function checkTeam(snapshot: AvailabilitySnapshot, team: Id[], target: PlanningTarget): TeamCheck;
declare function analyzeTypes(data: GameData, team: Id[]): TypeAnalysis;
```

Expected input failures use results. Missing data, unexpected runtime failures,
and invalid invariants must stay visible; they must not produce a substitute result.
