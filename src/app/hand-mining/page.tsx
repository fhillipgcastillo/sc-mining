import type { Metadata } from "next";
import { getHandMiningArray, getAllHandMiningOres } from "@/lib/data";
import { PageHeader } from "@/components/shared/PageHeader";
import { HandMiningClient } from "@/components/hand-mining/HandMiningClient";

export const metadata: Metadata = {
  title: "Hand Mining — SC Mining Data",
  description:
    "Find the best locations to hand-mine gems in Star Citizen. Search by ore type or browse individual locations to see find rates and rock counts.",
};

export default function HandMiningPage() {
  const allLocations = getHandMiningArray();
  const allOres = getAllHandMiningOres();

  return (
    <>
      <PageHeader
        title="Hand Mining"
        description="Discover where gems spawn and how often. Filter by ore or explore any location."
      />
      <HandMiningClient allLocations={allLocations} allOres={allOres} />
    </>
  );
}
