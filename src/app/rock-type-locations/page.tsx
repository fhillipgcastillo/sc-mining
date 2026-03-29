import type { Metadata } from "next";
import { getRockTypeLocationsArray, getAllRockTypes } from "@/lib/data";
import { PageHeader } from "@/components/shared/PageHeader";
import { RockTypeLocationsClient } from "@/components/rock-type-locations/RockTypeLocationsClient";

export const metadata: Metadata = {
  title: "Rock Type Locations — SC Mining Data",
  description:
    "Find where any rock type spawns across Star Citizen locations. Search by rock type or browse individual locations to see rock composition and mining stats.",
};

export default function RockTypeLocationsPage() {
  const allLocations = getRockTypeLocationsArray();
  const allRockTypes = getAllRockTypes();

  return (
    <>
      <PageHeader
        title="Rock Type Locations"
        description="Find where a rock type spawns, or explore the full rock composition of any location."
      />
      <RockTypeLocationsClient
        allLocations={allLocations}
        allRockTypes={allRockTypes}
      />
    </>
  );
}
