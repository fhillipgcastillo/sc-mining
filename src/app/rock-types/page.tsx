import type { Metadata } from "next";
import { getAllSystems, getRockTypesBySystem } from "@/lib/data";
import { PageHeader } from "@/components/shared/PageHeader";
import { RockTypesClient } from "@/components/rock-types/RockTypesClient";
import type { RockTypeSystemRow } from "@/types";

export const metadata: Metadata = {
  title: "Rock Types by System — SC Mining Data",
  description:
    "Explore rock type composition by star system. See ore probabilities, mass, instability, and resistance for every rock type across Stanton, Pyro, and Nyx.",
};

export default function RockTypesPage() {
  const systems = getAllSystems();

  // Pre-load all system data server-side so the client never fetches
  const systemData: Record<string, RockTypeSystemRow[]> = {};
  for (const system of systems) {
    systemData[system] = getRockTypesBySystem(system);
  }

  return (
    <>
      <PageHeader
        title="Rock Types by System"
        description="Compare rock type ore compositions and stats across star systems."
      />
      <RockTypesClient systems={systems} systemData={systemData} />
    </>
  );
}
