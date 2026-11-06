export {};

export type Id = string;
export type Level = number; // Integer from 1 to 100; validated when data loads.
export type Multiplier = 0 | 0.5 | 1 | 2;
export type Gender = "male" | "female" | "genderless" | "not-applicable";
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

export interface PokemonForm {
  id: Id;
  pokemonId: Id;
  name: string;
  introducedGeneration: number;
  review: Review;
}

export type Requirement =
  | { kind: "all"; requirements: Requirement[] }
  | { kind: "any"; requirements: Requirement[] }
  | { kind: "milestone"; id: Id }
  | { kind: "location"; id: Id }
  | { kind: "capability"; id: Id }
  | { kind: "item"; id: Id; quantity: number; consumed: boolean }
  | { kind: "pokemon"; id: Id; quantity: number; consumed: boolean };

export interface Game {
  id: Id;
  name: string;
  generation: number;
  region: string;
  regionalDexSections?: { id: Id; name: string }[];
  firstMilestoneId: Id | null;
  planner: {
    defaultMilestoneId: Id;
    checkpoints: ProgressCheckpoint[];
  } | null;
  breeding: { hatchLevel: Level } | null;
  review: Review;
}

export interface ProgressCheckpoint {
  milestoneId: Id;
  label: string;
  title: string;
  detail: string;
  typeId: Id | null;
}

export interface PokemonProfile {
  pokemonId: Id;
  regionalDex?: number;
  regionalDexSectionId?: Id;
  types: [Id] | [Id, Id];
  spriteSrc: string;
  genders: Gender[];
  breeding: {
    eggGroupIds: [EggGroupId] | [EggGroupId, EggGroupId];
  } | null;
  review: Review;
  forms?: PokemonFormProfile[];
}

export interface PokemonFormProfile {
  formId: Id;
  types: PokemonProfile['types'];
  spriteSrc: string;
  genders: Gender[];
  breeding: PokemonProfile['breeding'];
  review: Review;
}

export interface FormChange {
  id: Id;
  pokemonId: Id;
  fromFormId: Id | null;
  toFormId: Id | null;
  heldItemId: Id | null;
  fusionPartnerPokemonId?: Id;
  requirements: Requirement;
  review: Review;
}

export interface BreedingRule {
  id: Id;
  parentPokemonIds: Id[];
  parentFormIds?: Id[];
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

export type Boss = {
  id: Id;
  name: string;
  highestLevel: Level;
  review: Review;
} & ({ kind: "gym"; badgeNumber: number; specialtyTypeId: Id | null }
  | { kind: "elite-four" | "champion" | "trainer" });

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
  details?: ItemSourceDetails;
  review: Review;
}

export type ItemSourceDetails =
  | { kind: 'wild-held-item'; pokemonSourceId: Id; ratePercent: number }
  | { kind: 'received-held-item'; pokemonSourceId: Id }
  | { kind: 'pickup'; pokemonSourceId: Id; minimumLevel: Level; maximumLevel: Level; ratePercent: number };

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
      method: "grass" | "surf" | "old-rod" | "good-rod" | "super-rod" | "rock-smash" | "headbutt" | "bug-contest" | "poke-radar"
        | "dark-grass" | "grass-spots" | "cave-spots" | "bridge-spots" | "surf-spots" | "super-rod-spots"
        | "horde" | "rough-terrain" | "yellow-flowers" | "red-flowers" | "purple-flowers"
        | "ceiling-ambush" | "ground-ambush" | "rustling-bush-ambush" | "sky-ambush" | "trash-can-ambush"
        | "long-grass" | "dive";
      ratePercent: number;
    }
  | { kind: "starter" | "gift" | "static" | "roaming" | "egg" }
  | { kind: "honey-tree"; rareTreeOnly: boolean }
  | { kind: "berry-tree"; color: "red" | "blue" | "purple" | "green" | "yellow" | "pink" }
  | { kind: "dexnav"; habitat: "grass" | "long-grass" | "cave" | "surf" }
  | { kind: "hidden-grotto"; mode: "regeneration"; ratePercent: number }
  | { kind: "hidden-grotto"; mode: "first-visit" }
  | { kind: "hidden-grotto"; mode: "funfest"; mission: "noisy" | "quiet" }
  | { kind: "white-forest"; method: "grass" | "surf"; residentId: Id; residentName: string }
  | { kind: "fossil"; itemId: Id }
  | { kind: "game-trade"; offeredPokemonId: Id | null; traderName?: string; cyclePosition?: number }
  | { kind: "breeding"; ruleId: Id; capabilityId: Id };

export type EncounterCondition =
  | { kind: "time"; periods: ("morning" | "day" | "night")[] }
  | { kind: "season"; seasons: ("spring" | "summer" | "autumn" | "winter")[] }
  | { kind: "weekday"; day: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" }
  | { kind: "swarm" }
  | { kind: "funfest"; mission: "mushrooms" }
  | { kind: "daily"; system: "great-marsh" | "trophy-garden" | "mirage-spot" }
  | { kind: "radio"; sound: "hoenn" | "sinnoh" }
  | { kind: "headbutt-tree"; category: "common" | "rare" | "secret" }
  | { kind: "safari-blocks"; blocks: { type: "plains" | "forest" | "peak" | "water"; points: number }[] }
  | { kind: "feebas-tiles"; tileCount: number; replacementPercent: number };

export interface PokemonSource {
  id: Id;
  pokemonId: Id;
  formId?: Id | null;
  locationId: Id;
  requirements: Requirement;
  level: SourceLevel;
  genders: Gender[];
  knownMoveIds?: Id[];
  maxUses: number | null;
  choice: ChoiceSelection | null;
  details: SourceDetails;
  encounterConditions?: EncounterCondition[];
  review: Review;
}

export type EvolutionCondition =
  | { kind: "friendship"; minimum: number }
  | { kind: "beauty"; minimum: number }
  | { kind: "time"; period: "day" | "night" }
  | { kind: "stats"; relation: "attack-lt-defense" | "attack-eq-defense" | "attack-gt-defense" }
  | { kind: "personality"; modulus: number; minimum: number; maximum: number }
  | { kind: "party-space"; freeSlots: number }
  | { kind: "location"; locationId: Id }
  | { kind: "held-item"; itemId: Id }
  | { kind: "party-pokemon"; pokemonId: Id }
  | { kind: "party-type"; typeId: Id }
  | { kind: "affection"; minimum: 50 }
  | { kind: "weather"; weather: "rain" }
  | { kind: "device-orientation"; orientation: "upside-down" }
  | { kind: "known-move"; moveId: Id; moveName: string; learning: MoveLearning[] };

export type MoveLearning =
  | { kind: "level-up"; level: Level }
  | { kind: "teach"; minimumLevel: Level; requirements: Requirement };

export interface Evolution {
  id: Id;
  fromPokemonId: Id;
  toPokemonId: Id;
  fromFormId?: Id | null;
  toFormId?: Id | null;
  trigger: "level-up" | "use-item" | "player-trade";
  minimumLevel: Level | null;
  itemId: Id | null;
  conditions: EvolutionCondition[];
  genderTransitions: { from: Gender; to: Gender }[] | null;
  requirements: Requirement;
  coProductIds: Id[];
  excludedSourceIds?: Id[];
  review: Review;
}

export interface Exclusion {
  pokemonId: Id;
  reason: "other-version" | "external-event" | "external-connection";
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
  formChanges?: FormChange[];
}

export interface SharedData {
  schemaVersion: 2;
  references: Reference[];
  pokemon: Pokemon[];
  forms?: PokemonForm[];
}

export interface Dataset extends SharedData {
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
  | { code: "progress-not-ready"; gameId: Id }
  | { code: "unknown-milestone"; milestoneId: Id };

export interface ResourceClaim {
  resourceId: Id; // A namespaced source or item-source ID.
  quantity: number;
  use: "consume" | "retain";
}

export interface ParentWitness {
  pokemonId: Id;
  formId?: Id | null;
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
  formId?: Id | null;
  formChangeIds?: Id[];
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
    | "breeding-parents" | "player-trade" | Exclusion['reason'];
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


