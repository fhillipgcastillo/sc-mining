/**
 * Data layer for the Star Citizen Mining Data app.
 *
 * All heavy data work happens here so pages stay clean. Each function is
 * pure and safe to call from Server Components — no browser APIs, no state.
 *
 * Import pattern: Next.js resolveJsonModule + @/* path alias.
 */

import oreLocationsRaw from '@/data/ore-locations.json';
import rockTypeLocationsRaw from '@/data/rock-type-locations.json';
import rockTypesRaw from '@/data/rock-types.json';
import handMiningRaw from '@/data/hand-mining.json';
import locationHierarchyRaw from '@/data/location-hierarchy.json';
import rockTypeTiersRaw from '@/data/rock-type-tiers.json';

import type {
  OreLocationsData,
  OreLocationRow,
  RockTypeLocationsData,
  RockTypeLocationRow,
  RockTypesData,
  RockTypeSystemRow,
  HandMiningData,
  HandMiningLocationRow,
  LocationHierarchyData,
  LocationMeta,
  RockTier,
  TierMeta,
  OreSpawnType,
} from '@/types';

// ---------------------------------------------------------------------------
// Typed casts — JSON imports come in as `any`; we assert the shapes here so
// the rest of the file is fully type-safe.
// ---------------------------------------------------------------------------

const oreLocations = oreLocationsRaw as unknown as OreLocationsData;
const rockTypeLocations = rockTypeLocationsRaw as unknown as RockTypeLocationsData;
const rockTypes = rockTypesRaw as unknown as RockTypesData;
const handMining = handMiningRaw as unknown as HandMiningData;
const locationHierarchy = locationHierarchyRaw as unknown as LocationHierarchyData;
const rockTypeTiers = rockTypeTiersRaw as unknown as {
  asteroid: Record<string, string[]>;
  surface: Record<string, string[]>;
  tierMeta: Record<string, TierMeta>;
  oreSpawnType: Record<string, string[]>;
};

// ---------------------------------------------------------------------------
// Ore Locations
// ---------------------------------------------------------------------------

/**
 * Returns every ore-location entry as a flat array with the location key
 * attached, sorted by total scans descending (most-sampled first).
 */
export function getOreLocationsArray(): OreLocationRow[] {
  return Object.entries(oreLocations)
    .map(([location, data]) => ({ location, ...data }))
    .sort((a, b) => b.scans - a.scans);
}

/**
 * Returns all locations that contain a given ore (e.g. "QUANTANIUM"),
 * sorted by that ore's probability descending.
 *
 * Locations where the ore is absent are excluded entirely.
 */
export function getLocationsForOre(oreName: string): OreLocationRow[] {
  return Object.entries(oreLocations)
    .filter(([, data]) => oreName in data.ores)
    .map(([location, data]) => ({ location, ...data }))
    .sort((a, b) => (b.ores[oreName]?.prob ?? 0) - (a.ores[oreName]?.prob ?? 0));
}

/**
 * Returns a sorted, de-duplicated list of every ore name found across all
 * locations in the ore-locations dataset.
 */
export function getAllOreTypes(): string[] {
  const names = new Set<string>();
  Object.values(oreLocations).forEach((loc) =>
    Object.keys(loc.ores).forEach((ore) => names.add(ore)),
  );
  return [...names].sort();
}

// ---------------------------------------------------------------------------
// Rock-Type Locations
// ---------------------------------------------------------------------------

/**
 * Returns every rock-type-location entry as a flat array with the location key
 * attached, sorted by total scans descending.
 */
export function getRockTypeLocationsArray(): RockTypeLocationRow[] {
  return Object.entries(rockTypeLocations)
    .map(([location, data]) => ({ location, ...data }))
    .sort((a, b) => b.scans - a.scans);
}

/**
 * Returns all locations that contain a given rock type (e.g. "MTYPE"),
 * sorted by that type's probability descending.
 */
export function getLocationsForRockType(typeName: string): RockTypeLocationRow[] {
  return Object.entries(rockTypeLocations)
    .filter(([, data]) => typeName in data.rockTypes)
    .map(([location, data]) => ({ location, ...data }))
    .sort(
      (a, b) =>
        (b.rockTypes[typeName]?.prob ?? 0) - (a.rockTypes[typeName]?.prob ?? 0),
    );
}

/**
 * Returns a sorted, de-duplicated list of every rock type name found across
 * all locations in the rock-type-locations dataset.
 */
export function getAllRockTypes(): string[] {
  const names = new Set<string>();
  Object.values(rockTypeLocations).forEach((loc) =>
    Object.keys(loc.rockTypes).forEach((rt) => names.add(rt)),
  );
  return [...names].sort();
}

// ---------------------------------------------------------------------------
// Rock Types by System
// ---------------------------------------------------------------------------

/**
 * Returns all rock types for a given system (e.g. "STANTON") as an array,
 * each row carrying the system and rock-type keys, sorted by scans descending.
 *
 * Returns an empty array when the system is not found.
 */
export function getRockTypesBySystem(system: string): RockTypeSystemRow[] {
  const systemData = rockTypes[system.toUpperCase()];
  if (!systemData) return [];

  return Object.entries(systemData)
    .filter(([, data]) => data != null)
    .map(([rockType, data]) => ({ system: system.toUpperCase(), rockType, ...data }))
    .sort((a, b) => b.scans - a.scans);
}

/**
 * Returns the list of known star systems in the dataset.
 * Order: most-populated first (Stanton, Pyro, then others).
 */
export function getAllSystems(): string[] {
  // Return keys from the data to stay in sync, but guarantee a sensible order.
  const preferred = ['STANTON', 'PYRO', 'NYX'];
  const dataKeys = Object.keys(rockTypes);
  const ordered = preferred.filter((s) => dataKeys.includes(s));
  const remaining = dataKeys.filter((s) => !preferred.includes(s)).sort();
  return [...ordered, ...remaining];
}

// ---------------------------------------------------------------------------
// Hand Mining
// ---------------------------------------------------------------------------

/**
 * Returns every hand-mining location as a flat array with the location key
 * attached, sorted by total finds descending.
 */
export function getHandMiningArray(): HandMiningLocationRow[] {
  return Object.entries(handMining)
    .map(([location, data]) => ({ location, ...data }))
    .sort((a, b) => b.finds - a.finds);
}

/**
 * Returns all hand-mining locations that contain a given ore (e.g. "HADANITE"),
 * sorted by that ore's probability descending.
 */
export function getLocationsForHandMiningOre(oreName: string): HandMiningLocationRow[] {
  return Object.entries(handMining)
    .filter(([, data]) => oreName in data.ores)
    .map(([location, data]) => ({ location, ...data }))
    .sort(
      (a, b) =>
        (b.ores[oreName]?.prob ?? 0) - (a.ores[oreName]?.prob ?? 0),
    );
}

/**
 * Returns a sorted, de-duplicated list of every hand-mining ore name found
 * across all hand-mining locations.
 */
export function getAllHandMiningOres(): string[] {
  const names = new Set<string>();
  Object.values(handMining).forEach((loc) =>
    Object.keys(loc.ores).forEach((ore) => names.add(ore)),
  );
  return [...names].sort();
}

// ---------------------------------------------------------------------------
// Location Hierarchy
// ---------------------------------------------------------------------------

/** Returns the full location hierarchy lookup map. */
export function getLocationHierarchy(): LocationHierarchyData {
  return locationHierarchy;
}

/** Returns metadata for a single location, or undefined if not in hierarchy. */
export function getLocationMeta(locationKey: string): LocationMeta | undefined {
  return locationHierarchy[locationKey];
}

/**
 * Returns sibling locations — other children of the same parent, excluding
 * the given key itself. Returns an empty array for root-level locations.
 */
export function getSiblingLocations(locationKey: string): string[] {
  const meta = locationHierarchy[locationKey];
  if (!meta?.parent) return [];
  const parentMeta = locationHierarchy[meta.parent];
  if (!parentMeta) return [];
  return parentMeta.children.filter((k) => k !== locationKey);
}

// ---------------------------------------------------------------------------
// Rock-Type Tiers
// ---------------------------------------------------------------------------

/**
 * Returns the tier (S/A/B/C) for a given rock type, checking both asteroid
 * and surface tier maps. Returns null for unknown rock types.
 */
export function getRockTypeTier(rockType: string): RockTier | null {
  const upper = rockType.toUpperCase();
  for (const tierMap of [rockTypeTiers.asteroid, rockTypeTiers.surface]) {
    for (const [tier, types] of Object.entries(tierMap)) {
      if (types.includes(upper)) return tier as RockTier;
    }
  }
  return null;
}

/** Returns display metadata for a given tier level. */
export function getTierMeta(tier: RockTier): TierMeta {
  return rockTypeTiers.tierMeta[tier];
}

/** Returns where a given ore spawns: asteroid, surface, both, hand_mining, or inert. */
export function getOreSpawnType(oreName: string): OreSpawnType {
  const upper = oreName.toUpperCase();
  for (const [spawnType, ores] of Object.entries(rockTypeTiers.oreSpawnType)) {
    if (ores.includes(upper)) return spawnType as OreSpawnType;
  }
  return 'both';
}
