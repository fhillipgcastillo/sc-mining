import { HomeAnimations } from "@/components/home/HomeAnimations";
import {
  getOreLocationsArray,
  getRockTypeLocationsArray,
  getAllSystems,
  getHandMiningArray,
} from "@/lib/data";

export default function HomePage() {
  const oreLocationCount = getOreLocationsArray().length;
  const rockTypeLocationCount = getRockTypeLocationsArray().length;
  const systemCount = getAllSystems().length;
  const handMiningCount = getHandMiningArray().length;

  const cards = [
    {
      title: "Ore Locations",
      description: "Find where specific ores spawn across planets and moons.",
      href: "/ore-locations",
      count: oreLocationCount,
      countLabel: "locations",
      highlighted: true,
    },
    {
      title: "Rock Type Locations",
      description: "Explore rock type distributions by location.",
      href: "/rock-type-locations",
      count: rockTypeLocationCount,
      countLabel: "locations",
      highlighted: false,
    },
    {
      title: "Rock Types by System",
      description: "Compare rock types across star systems.",
      href: "/rock-types",
      count: systemCount,
      countLabel: "systems",
      highlighted: false,
    },
    {
      title: "Hand Mining",
      description: "ROC and hand mining data for gems and surface minerals.",
      href: "/hand-mining",
      count: handMiningCount,
      countLabel: "locations",
      highlighted: false,
    },
  ];

  return <HomeAnimations cards={cards} />;
}
