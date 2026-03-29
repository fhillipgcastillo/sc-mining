# SC Mining Data

An open-source web application that preserves and displays Star Citizen mining data originally sourced from [Regolith](https://regolith.rocks). With Regolith shutting down, this project ensures the community still has access to comprehensive ore location, rock type, and hand-mining data in a searchable, interactive format.

## Data Version Notice

All data in this application is based on **Star Citizen versions up to v4.6**. In v4.7+, the signature/scanning system changed significantly — rock signatures now display the material with the highest composition percentage instead of the rock type name. We are actively working to collect and integrate the updated v4.7 data.

## Features

- **Ore Locations** — Find where any of 25 ore types spawn across 191 mining locations. Search by ore or browse by location to see full composition data.
- **Rock Type Locations** — Explore the distribution of 18 rock types across all mining locations with probability, mass, instability, and resistance stats.
- **Rock Types by System** — Compare rock type data across the Stanton, Pyro, and Nyx star systems, with expandable ore composition details.
- **Hand Mining (ROC)** — View hand-mining data for 7 gem types across 25 locations, including find probabilities and rocks-per-find statistics.

## Tech Stack

- [Next.js](https://nextjs.org) 16+ (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com) v4
- [HeroUI](https://heroui.com) v3 (React component library)
- [Framer Motion](https://motion.dev) (animations)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) v24+ (see `.nvmrc`)
- [nvm](https://github.com/nvm-sh/nvm) (recommended for version management)

### Installation

```bash
# Use the correct Node version
nvm use

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Production Build

```bash
npm run build
npm start
```

## Data Sources

The mining data was downloaded from Regolith before its shutdown. The raw JSON files are stored in the `data/` directory at the repository root, with processed copies in `src/data/` for the application.

| File | Description | Records |
|------|-------------|---------|
| `ore-locations.json` | Ore spawn data by location | 191 locations, 25 ore types |
| `rock-type-locations.json` | Rock type distributions by location | 191 locations, 18 rock types |
| `rock-types.json` | Rock types by star system | 3 systems |
| `hand-mining.json` | ROC/hand mining data | 25 locations, 7 ore types |

## Contributing

This is an open-source community project. Contributions are welcome — whether it's adding new data, improving the UI, or helping integrate v4.7+ data.

## License

MIT
