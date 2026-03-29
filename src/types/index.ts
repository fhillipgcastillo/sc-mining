// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** Min / max / median triple used across all datasets. */
export interface StatRange {
  min: number;
  max: number;
  med: number;
}

// ---------------------------------------------------------------------------
// Ore locations  (ore-locations.json)
// ---------------------------------------------------------------------------

/** Per-ore statistics within a location. */
export interface OreEntry {
  /** Fraction of scans where this ore appeared (0–1+). */
  prob: number;
  /** Minimum percentage of the rock composed of this ore (0–1). */
  minPct: number;
  /** Maximum percentage of the rock composed of this ore (0–1). */
  maxPct: number;
  /** Median percentage of the rock composed of this ore (0–1). */
  medPct: number;
}

/** Statistics for a single mining location in the ore-locations dataset. */
export interface OreLocation {
  users: number;
  scans: number;
  clusters: number;
  clusterCount: StatRange;
  /** Rock mass in SCU. */
  mass: StatRange;
  /** Instability rating. */
  inst: StatRange;
  /** Resistance rating. */
  res: StatRange;
  /** Ore composition keyed by ore name (e.g. "QUANTANIUM"). */
  ores: Record<string, OreEntry>;
}

/** Full ore-locations.json shape: location name → OreLocation. */
export type OreLocationsData = Record<string, OreLocation>;

/** OreLocation with its location key attached — used in component lists. */
export interface OreLocationRow extends OreLocation {
  location: string;
}

// ---------------------------------------------------------------------------
// Rock-type locations  (rock-type-locations.json)
// ---------------------------------------------------------------------------

/** Statistics for a single rock type within a location. */
export interface RockTypeEntry {
  /** Fraction of scans that were this rock type (0–1). */
  prob: number;
  scans: number;
  clusters: number;
  mass: StatRange;
  inst: StatRange;
  res: StatRange;
}

/** Statistics for a single location in the rock-type-locations dataset. */
export interface RockTypeLocation {
  users: number;
  scans: number;
  clusters: number;
  /** Rock types found at this location, keyed by type name (e.g. "MTYPE"). */
  rockTypes: Record<string, RockTypeEntry>;
}

/** Full rock-type-locations.json shape: location name → RockTypeLocation. */
export type RockTypeLocationsData = Record<string, RockTypeLocation>;

/** RockTypeLocation with its location key attached — used in component lists. */
export interface RockTypeLocationRow extends RockTypeLocation {
  location: string;
}

// ---------------------------------------------------------------------------
// Rock types by system  (rock-types.json)
// ---------------------------------------------------------------------------

/** Aggregate stats for a rock type within a specific star system. */
export interface RockTypeSystemEntry {
  users: number;
  scans: number;
  clusters: number;
  clusterCount: StatRange;
  mass: StatRange;
  inst: StatRange;
  res: StatRange;
  /** Ore composition for this rock type in this system. */
  ores: Record<string, OreEntry>;
}

/**
 * Full rock-types.json shape:
 * system name → rock type name → RockTypeSystemEntry
 */
export type RockTypesData = Record<string, Record<string, RockTypeSystemEntry>>;

/** RockTypeSystemEntry with system + rock-type keys attached. */
export interface RockTypeSystemRow extends RockTypeSystemEntry {
  system: string;
  rockType: string;
}

// ---------------------------------------------------------------------------
// Hand mining  (hand-mining.json)
// ---------------------------------------------------------------------------

/** Per-ore statistics within a hand-mining location. */
export interface HandMiningOre {
  finds: number;
  /** Fraction of sessions where this ore appeared (0–1). */
  prob: number;
  minRocks: number;
  maxRocks: number;
  medianRocks: number;
}

/** Statistics for a single hand-mining location. */
export interface HandMiningLocation {
  finds: number;
  users: number;
  /** Hand-mining ore types found here, keyed by ore name (e.g. "HADANITE"). */
  ores: Record<string, HandMiningOre>;
}

/** Full hand-mining.json shape: location code → HandMiningLocation. */
export type HandMiningData = Record<string, HandMiningLocation>;

/** HandMiningLocation with its location key attached — used in component lists. */
export interface HandMiningLocationRow extends HandMiningLocation {
  location: string;
}

// ---------------------------------------------------------------------------
// Location hierarchy  (location-hierarchy.json)
// ---------------------------------------------------------------------------

/** The type of celestial or structural entity a location represents. */
export type LocationType =
  | 'planet'
  | 'moon'
  | 'lagrange'
  | 'asteroid_belt'
  | 'mining_outpost'
  | 'mining_base'
  | 'station';

/** Whether ores at this location spawn as asteroids, on surfaces, or both. */
export type SpawnType = 'asteroid' | 'surface' | 'both';

/** Metadata for a single location in the hierarchy. */
export interface LocationMeta {
  system: string;
  parent: string | null;
  type: LocationType;
  spawnType: SpawnType;
  displayName: string;
  children: string[];
}

/** Full location-hierarchy.json shape: location key → LocationMeta. */
export type LocationHierarchyData = Record<string, LocationMeta>;

// ---------------------------------------------------------------------------
// Rock-type tiers  (rock-type-tiers.json)
// ---------------------------------------------------------------------------

/** Value tier for rock types. */
export type RockTier = 'S' | 'A' | 'B' | 'C';

/** Display metadata for a tier level. */
export interface TierMeta {
  label: string;
  description: string;
  color: string;
}

/** Where an ore can be found: asteroid belt, surface, both, hand-mining, or inert. */
export type OreSpawnType = 'asteroid' | 'surface' | 'both' | 'hand_mining' | 'inert';

// ---------------------------------------------------------------------------
// Pivot table generics
// ---------------------------------------------------------------------------

/** A single row in the pivot table grid (one per location). */
export interface PivotRow<TEntry> {
  id: string;
  label: string;
  entries: Record<string, TEntry>;
}

/** A single column in the pivot table grid (one per ore/rock type). */
export interface PivotColumn {
  id: string;
  label: string;
  colorVariant: string;
}

/** Sort state for the pivot table. */
export interface PivotSort {
  columnId: string | null;
  direction: "asc" | "desc";
}
