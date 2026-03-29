# SC Mining Data - Development Context

## Project Overview

This is a Star Citizen Mining Data web application that preserves and showcases mining data originally sourced from Regolith (which is shutting down). The app displays ore locations, rock type distributions, and hand-mining data in an interactive, filterable format.

## Important Notes

- **Data version**: All data is based on Star Citizen versions up to v4.6. In v4.7+, the signature/scanning system changed significantly (rock signatures now show the highest-amount material instead of rock type). We are working to get updated v4.7 data.
- **Data source**: Regolith allowed users to download this data before shutting down. This is an open-source preservation effort.

## Tech Stack

- **Framework**: Next.js 16+ with App Router, TypeScript
- **Styling**: Tailwind CSS v4, HeroUI v3 (`@heroui/react`), Framer Motion
- **Structure**: `src/` directory with app routing
- **Node**: v24.11.0 (managed via nvm, see `.nvmrc`)

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    layout.tsx            # Root layout (dark theme, Navbar, Footer)
    page.tsx              # Home page
    ore-locations/        # Ore locations data page (most important)
    rock-type-locations/  # Rock type locations data page
    rock-types/           # Rock types by system page
    hand-mining/          # Hand/ROC mining data page
  components/
    layout/               # Navbar, Footer, VersionBanner
    shared/               # Reusable: DataTable, FilterBar, StatsCard, OreChip, PageHeader
    home/                 # Home page specific (DataCard)
    ore-locations/        # Ore locations page components
    rock-type-locations/  # Rock type locations page components
    rock-types/           # Rock types page components
    hand-mining/          # Hand mining page components
  data/                   # JSON data files (copied from root data/ with simplified names)
  lib/                    # Utilities: data.ts, constants.ts, formatting.ts
  types/                  # TypeScript interfaces
  providers/              # App providers (if needed)
```

## Data Files

4 JSON files in `src/data/`:

1. **ore-locations.json** (191 locations, 25 ore types) - Most important. Shows which ores can be found at each location with probability and percentage composition.
2. **rock-type-locations.json** (191 locations, 18 rock types) - Shows rock type distribution by location.
3. **rock-types.json** (3 systems: Stanton/Pyro/Nyx) - Rock types per star system with ore composition.
4. **hand-mining.json** (25 locations, 7 ores) - ROC/hand mining data with find probabilities.

## Page Priority

1. **Ore Locations** - Primary use case: "Where do I find X ore?"
2. **Rock Type Locations** - Second: "What rock types are at location Y?"
3. **Rock Types by System** - Third: System-level overview
4. **Hand Mining** - Fourth: Smaller dataset, niche use

## Development Guidelines

- Use HeroUI v3 components (Table, Card, Tabs, Select, Input, Chip, Navbar, etc.)
- Dark theme (space/mining aesthetic)
- All data pages have dual-mode filtering: "Find by material/type" and "Browse by location"
- Framer Motion for page transitions and subtle animations
- No tests for now
- Responsive design: tables scroll horizontally on mobile
- Version banner: dismissible notice about v4.6 data and v4.7 changes
