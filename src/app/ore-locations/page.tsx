import type { Metadata } from "next";
import { getOreLocationsArray, getAllOreTypes } from "@/lib/data";
import { PageHeader } from "@/components/shared/PageHeader";
import { OreLocationsClient } from "@/components/ore-locations/OreLocationsClient";

export const metadata: Metadata = {
  title: "Ore Locations — SC Mining Data",
  description:
    "Find where any ore spawns across Star Citizen locations. Search by ore type or browse individual locations to see ore composition and rock stats.",
};

export default function OreLocationsPage() {
  const allLocations = getOreLocationsArray();
  const allOreTypes = getAllOreTypes();

  return (
    <>
      <PageHeader
        title="Ore Locations"
        description="Find where an ore spawns, or explore the full ore composition of any location."
      />
      <OreLocationsClient
        allLocations={allLocations}
        allOreTypes={allOreTypes}
      />
    </>
  );
}
