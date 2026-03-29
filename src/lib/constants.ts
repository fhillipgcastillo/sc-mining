/**
 * Display constants for the Star Citizen Mining Data app.
 *
 * Color variants use HeroUI's semantic color names so they automatically
 * respect the active theme (light / dark).
 */

// ---------------------------------------------------------------------------
// Ore color map
// ---------------------------------------------------------------------------

/**
 * HeroUI color variant for each ore or rock type.
 *
 * Tiers (loosely by in-game value):
 *   warning  — high-value ores (amber / gold tones)
 *   primary  — mid-value ores (blue tones)
 *   default  — common / inert materials (gray tones)
 *   secondary — surface / structural ores
 *   success  — hand-mining gems
 *   danger   — rare / exotic
 */
export const ORE_COLORS: Record<string, string> = {
  // --- High value (warning / amber) ---
  QUANTANIUM: 'warning',
  BEXALITE: 'warning',
  TARANITE: 'warning',
  LARANITE: 'warning',

  // --- Medium value (primary / blue) ---
  AGRICIUM: 'primary',
  HEPHAESTANITE: 'primary',
  GOLD: 'primary',
  BORASE: 'primary',

  // --- Common / structural (default / gray) ---
  IRON: 'default',
  COPPER: 'default',
  ALUMINUM: 'default',
  TIN: 'default',
  TUNGSTEN: 'default',
  TITANIUM: 'default',

  // --- Other space ores ---
  CORUNDUM: 'secondary',
  SILICON: 'secondary',
  QUARTZ: 'secondary',
  BERYL: 'secondary',
  ICE: 'secondary',
  STILERON: 'secondary',
  RICCITE: 'secondary',
  LINDINIUM: 'secondary',
  SAVRILIUM: 'secondary',
  TORITE: 'secondary',

  // --- Inert (always gray) ---
  INERTMATERIAL: 'default',

  // --- Hand-mining gems (success / green tones) ---
  HADANITE: 'success',
  APHORITE: 'success',
  FEYNMALINE: 'success',
  GLACOSITE: 'success',
  DOLIVINE: 'success',
  BERADOM: 'success',
  JANALITE: 'success',
} as const;

/** Fallback color for any ore not explicitly listed. */
export const ORE_COLOR_FALLBACK = 'secondary';

/** Returns the HeroUI color variant for a given ore name. */
export function getOreColor(oreName: string): string {
  return ORE_COLORS[oreName.toUpperCase()] ?? ORE_COLOR_FALLBACK;
}

// ---------------------------------------------------------------------------
// Name formatters
// ---------------------------------------------------------------------------

/**
 * Converts a SCREAMING_SNAKE_CASE location key to a human-readable name.
 *
 * Rules:
 *  - If the name contains hyphens it is a station/beacon code ("ST-IGB-FXW")
 *    and is kept entirely uppercase.
 *  - Otherwise each underscore-separated word is title-cased:
 *    "AARON_HALO" → "Aaron Halo"
 */
export function formatLocationName(name: string): string {
  if (name.includes('-')) {
    // Station codes like ST-IGB-FXW stay uppercase.
    return name.toUpperCase();
  }
  return name
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts an ALL-CAPS ore or rock-type key to a display string.
 *
 * Special cases handled explicitly:
 *  - "INERTMATERIAL" → "Inert Material"
 *  - Everything else → standard title case ("QUANTANIUM" → "Quantanium")
 */
export function formatOreName(name: string): string {
  const upper = name.toUpperCase();

  // Explicit overrides for names that need spacing or unusual casing.
  const overrides: Record<string, string> = {
    INERTMATERIAL: 'Inert Material',
    // Rock type display names
    CTYPE: 'C-Type',
    MTYPE: 'M-Type',
    ETYPE: 'E-Type',
    QTYPE: 'Q-Type',
    STYPE: 'S-Type',
    PTYPE: 'P-Type',
    ITYPE: 'I-Type',
    ATACAMITE: 'Atacamite',
    'ATACAMITE DEPOSIT': 'Atacamite Deposit',
    FELSIC: 'Felsic',
    'FELSIC DEPOSIT': 'Felsic Deposit',
    GNEISS: 'Gneiss',
    GRANITE: 'Granite',
    IGNEOUS: 'Igneous',
    OBSIDIAN: 'Obsidian',
    QUARTZITE: 'Quartzite',
    'QUARTZITE DEPOSIT': 'Quartzite Deposit',
    SHALE: 'Shale',
  };

  if (overrides[upper]) {
    return overrides[upper];
  }

  // Generic title case: "QUANTANIUM" → "Quantanium"
  return upper.charAt(0).toUpperCase() + upper.slice(1).toLowerCase();
}
