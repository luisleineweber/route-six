export {};

export type Id = string;
export type Level = number; // Integer from 1 to 100; validated when data loads.
export type Multiplier = 0 | 0.5 | 1 | 2;
export type Gender = "male" | "female" | "genderless";
export type EggGroupId = "monster" | "water-1" | "bug" | "flying" | "field" | "fairy"
  | "grass" | "human-like" | "water-3" | "mineral" | "amorphous" | "water-2"
  | "ditto" | "dragon" | "undiscovered";

export interface Review {
  referenceIds: Id[];
  checkedOn: string; // ISO calendar date.
}

export interface Reference {
  id: Id;
  title: string;
  locator: string;
  url?: string;
  revision?: string;
}

export interface Pokemon {
  id: Id;
  nationalDex: number;
  name: string;
  introducedGeneration: number;
  review: Review;
}

export type Requirement =
  | { kind: "all"; requirements: Requirement[] }
  | { kind: "any"; requirements: Requirement[] }
  | { kind: "milestone"; id: Id }
  | { kind: "capability"; id: Id }
  | { kind: "item"; id: Id; quantity: number; consumed: boolean }
  | { kind: "pokemon"; id: Id; quantity: number; consumed: boolean };

export interface Game {
  id: Id;
  name: string;
  generation: number;
  region: string;
  firstMilestoneId: Id;
  review: Review;
}

export interface PokemonProfile {
  pokemonId: Id;
  types: [Id] | [Id, Id];
  breeding: {
    eggGroupIds: [EggGroupId] | [EggGroupId, EggGroupId];
    genders: Gender[];
  };
  review: Review;
}

export interface BreedingRule {
  id: Id;
  parentPokemonIds: Id[];
  offspringPokemonIds: Id[];
  requiredHeldItemId: Id | null;
  review: Review;
}

export interface TypeChart {
  typeIds: Id[];
  matrix: Multiplier[][];
  review: Review;
}

export interface Milestone {
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

export interface Boss {
  id: Id;
  name: string;
  kind: "gym" | "elite-four" | "champion";
  highestLevel: Level;
  review: Review;
}

export interface Location {
  id: Id;
  name: string;
  requirements: Requirement;
  review: Review;
}

export interface Capability {
  id: Id;
  name: string;
  requirements: Requirement;
  review: Review;
}

export interface ChoiceGroup {
  id: Id;
  name: string;
  options: Id[];
  maximumSelections: number;
  review: Review;
}

export interface ChoiceSelection {
  groupId: Id;
  optionId: Id;
}

export interface ItemSource {
  id: Id;
  locationId: Id;
  requirements: Requirement;
  maxUses: number | null;
  choice: ChoiceSelection | null;
  review: Review;
}

export interface Item {
  id: Id;
  name: string;
  sources: ItemSource[];
  review: Review;
}

export type SourceLevel =
  | { kind: "fixed"; value: Level }
  | { kind: "range"; minimum: Level; maximum: Level }
  | { kind: "match-traded-pokemon"; pokemonId: Id };

export type SourceDetails =
  | {
      kind: "wild";
      method: "grass" | "surf" | "old-rod" | "good-rod" | "super-rod" | "rock-smash";
      ratePercent: number;
    }
  | { kind: "starter" | "gift" | "static" | "egg" }
  | { kind: "fossil"; itemId: Id }
  | { kind: "game-trade"; offeredPokemonId: Id }
  | { kind: "breeding"; ruleId: Id; capabilityId: Id };

export interface PokemonSource {
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

export type EvolutionCondition =
  | { kind: "friendship"; minimum: number }
  | { kind: "beauty"; minimum: number }
  | { kind: "time"; period: "day" | "night" }
  | { kind: "stats"; relation: "attack-lt-defense" | "attack-eq-defense" | "attack-gt-defense" }
  | { kind: "personality"; modulus: number; minimum: number; maximum: number }
  | { kind: "party-space"; freeSlots: number };

export interface Evolution {
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

export interface Exclusion {
  pokemonId: Id;
  reason: "other-version" | "external-event";
  explanation: string;
  review: Review;
}

export interface GameData {
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

export interface Dataset {
  schemaVersion: 1;
  references: Reference[];
  pokemon: Pokemon[];
  games: GameData[];
}

export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export interface ValidationIssue {
  recordId: Id | null;
  fieldPath: string;
  message: string;
}

export interface AvailabilityQuery {
  gameId: Id;
  milestoneId: Id;
  respectLevelLimit: boolean;
}

export type QueryError =
  | { code: "unknown-game"; gameId: Id }
  | { code: "unknown-milestone"; milestoneId: Id };

export interface ResourceClaim {
  resourceId: Id; // A namespaced source or item-source ID.
  quantity: number;
  use: "consume" | "retain";
}

export interface ParentWitness {
  pokemonId: Id;
  gender: Gender;
  pathId: Id;
}

export interface BreedingStep {
  sourceId: Id;
  ruleId: Id;
  parents: [ParentWitness, ParentWitness];
}

export interface AcquisitionPath {
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

export interface Blocker {
  code: "progress" | "level-limit" | "item" | "pokemon" | "condition"
    | "breeding-parents" | "player-trade" | "other-version" | "external-event";
  relatedId: Id | null;
  message: string;
}

export interface AvailabilityEntry {
  pokemonId: Id;
  status: "available" | "later" | "blocked" | "unavailable";
  currentPathIds: Id[];
  futurePathIds: Id[];
  firstMilestoneIds: Id[];
  blockers: Blocker[];
}

export interface AvailabilitySnapshot {
  query: AvailabilityQuery;
  levelLimit: { bossId: Id; level: Level } | null;
  entries: Record<Id, AvailabilityEntry>;
  paths: Record<Id, AcquisitionPath>;
  choiceGroups: ChoiceGroup[];
  resourceLimits: Record<Id, number | null>;
}

export type PlanningTarget = "whole-game" | "current-progress";

export interface TeamWarning {
  code: "too-many-members" | "unavailable" | "later" | "choice-conflict" | "finite-resource";
  slotIndexes: number[];
  relatedId: Id | null;
  message: string;
}

export interface TeamCheck {
  feasible: boolean;
  chosenPathIds: Id[];
  warnings: TeamWarning[];
}

export interface TypeAnalysis {
  weaknesses: Record<Id, number>;
  resistances: Record<Id, number>;
  immunities: Record<Id, number>;
  repeatedTypes: Record<Id, number>;
  coveredTypes: Id[];
  totalTypes: number;
}

// getAvailability requires data that passed structural and semantic validation.


