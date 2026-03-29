"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Table,
  Tabs,
  SearchField,
  Button,
  Label,
} from "@heroui/react";
import { motion, AnimatePresence } from "framer-motion";
import type { OreLocationRow, LocationHierarchyData } from "@/types";
import { formatLocationName, formatOreName } from "@/lib/constants";
import { formatProbability, formatPercent, formatNumber } from "@/lib/formatting";
import { useSort } from "@/hooks/useSort";
import type { SortAccessorMap } from "@/hooks/useSort";
import { OreChip } from "@/components/shared/OreChip";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { StatsCard } from "@/components/shared/StatsCard";
import { ItemCard } from "@/components/shared/ItemCard";
import { LocationCard } from "@/components/shared/LocationCard";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { LocationInfoPopover } from "@/components/shared/LocationInfoPopover";
import { OreLocationsPivotAdapter } from "./OreLocationsPivotAdapter";

interface OreLocationsClientProps {
  allLocations: OreLocationRow[];
  allOreTypes: string[];
  locationHierarchy: LocationHierarchyData;
}

const enterAnim = { opacity: 1, y: 0 };
const exitAnim = { opacity: 0, y: -8 };
const initialAnim = { opacity: 0, y: 12 };
const transitionIn = { duration: 0.2 };
const transitionOut = { duration: 0.15 };

export function OreLocationsClient({
  allLocations,
  allOreTypes,
  locationHierarchy,
}: OreLocationsClientProps) {
  const [activeTab, setActiveTab] = useState<string>("find-ore");
  const [viewMode, setViewMode] = useState<"cards" | "matrix">("cards");

  return (
    <div>
      <div className="mt-6 mb-4 flex justify-end">
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      <AnimatePresence mode="wait">
        {viewMode === "cards" ? (
          <motion.div
            key="cards-view"
            initial={initialAnim}
            animate={enterAnim}
            exit={exitAnim}
            transition={transitionIn}
          >
            <Tabs
              selectedKey={activeTab}
              onSelectionChange={(key) => setActiveTab(String(key))}
            >
              <Tabs.ListContainer>
                <Tabs.List aria-label="Ore locations view mode">
                  <Tabs.Tab id="find-ore">Find Ore<Tabs.Indicator /></Tabs.Tab>
                  <Tabs.Tab id="browse-locations">Browse Locations<Tabs.Indicator /></Tabs.Tab>
                </Tabs.List>
              </Tabs.ListContainer>

              <Tabs.Panel id="find-ore">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <FindOreTab
                    allLocations={allLocations}
                    allOreTypes={allOreTypes}
                    locationHierarchy={locationHierarchy}
                  />
                </motion.div>
              </Tabs.Panel>

              <Tabs.Panel id="browse-locations">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BrowseLocationsTab allLocations={allLocations} locationHierarchy={locationHierarchy} />
                </motion.div>
              </Tabs.Panel>
            </Tabs>
          </motion.div>
        ) : (
          <motion.div
            key="matrix-view"
            initial={initialAnim}
            animate={enterAnim}
            exit={exitAnim}
            transition={transitionIn}
          >
            <OreLocationsPivotAdapter
              allLocations={allLocations}
              allOreTypes={allOreTypes}
              locationHierarchy={locationHierarchy}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1: Find Ore
// ---------------------------------------------------------------------------

function FindOreTab({
  allLocations,
  allOreTypes,
  locationHierarchy,
}: {
  allLocations: OreLocationRow[];
  allOreTypes: string[];
  locationHierarchy: LocationHierarchyData;
}) {
  const [selectedOre, setSelectedOre] = useState<string>("");
  const [oreSearch, setOreSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedLocationSearch, setDebouncedLocationSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocationSearch(locationSearch), 200);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  const filteredOreTypes = useMemo(() => {
    if (!oreSearch) return allOreTypes;
    const q = oreSearch.toLowerCase();
    return allOreTypes.filter((ore) =>
      formatOreName(ore).toLowerCase().includes(q)
    );
  }, [allOreTypes, oreSearch]);

  const filteredLocations = useMemo(() => {
    if (!selectedOre) return [];
    return allLocations.filter((loc) => {
      const hasOre = selectedOre in loc.ores;
      if (!hasOre) return false;
      if (debouncedLocationSearch) {
        return formatLocationName(loc.location)
          .toLowerCase()
          .includes(debouncedLocationSearch.toLowerCase());
      }
      return true;
    });
  }, [allLocations, selectedOre, debouncedLocationSearch]);

  const sortColumns = useMemo<SortAccessorMap<OreLocationRow>>(
    () => ({
      location: (loc) => formatLocationName(loc.location),
      prob: (loc) => loc.ores[selectedOre]?.prob ?? 0,
      minPct: (loc) => loc.ores[selectedOre]?.minPct ?? 0,
      medPct: (loc) => loc.ores[selectedOre]?.medPct ?? 0,
      maxPct: (loc) => loc.ores[selectedOre]?.maxPct ?? 0,
      scans: (loc) => loc.scans,
      users: (loc) => loc.users,
    }),
    [selectedOre]
  );

  const { sortedData, sortDescriptor, onSortChange } = useSort({
    data: filteredLocations,
    columns: sortColumns,
    defaultSort: { column: "prob", direction: "descending" },
  });

  function handleBack() {
    setSelectedOre("");
    setOreSearch("");
    setLocationSearch("");
    setDebouncedLocationSearch("");
  }

  return (
    <div className="mt-4 space-y-4">
      <AnimatePresence mode="wait">
        {!selectedOre ? (
          <motion.div
            key="ore-grid"
            initial={initialAnim}
            animate={enterAnim}
            exit={exitAnim}
            transition={transitionIn}
          >
            <SearchField
              aria-label="Search ore types"
              value={oreSearch}
              onChange={setOreSearch}
              className="mb-4 sm:w-72"
            >
              <Label>Search Ores</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Filter ore types..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            {filteredOreTypes.length === 0 ? (
              <p className="py-12 text-center text-muted-deeper">
                No ore types matching &ldquo;{oreSearch}&rdquo;.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredOreTypes.map((ore) => (
                  <ItemCard
                    key={ore}
                    name={ore}
                    onSelect={setSelectedOre}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="ore-detail"
            initial={initialAnim}
            animate={enterAnim}
            exit={exitAnim}
            transition={transitionIn}
            className="space-y-4"
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" onPress={handleBack}>
                &larr; Back to ore types
              </Button>
              <OreChip name={selectedOre} size="md" />
            </div>

            {/* Location search */}
            <SearchField
              aria-label="Search locations"
              value={locationSearch}
              onChange={setLocationSearch}
              className="sm:w-72"
            >
              <Label>Search Locations</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Filter by location name..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            {/* Results table */}
            {sortedData.length === 0 ? (
              <p className="py-12 text-center text-muted-deeper">
                No locations found for {formatOreName(selectedOre)}
                {debouncedLocationSearch
                  ? ` matching "${debouncedLocationSearch}"`
                  : ""}
                .
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <Table
                  aria-label={`Locations for ${formatOreName(selectedOre)}`}
                >
                  <Table.Content>
                    <Table.Header>
                      <Table.Column isRowHeader>
                        <SortableHeader columnId="location" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Location</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="prob" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Probability</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="minPct" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Min %</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="medPct" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Median %</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="maxPct" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Max %</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="scans" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Scans</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="users" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Users</SortableHeader>
                      </Table.Column>
                    </Table.Header>
                    <Table.Body items={sortedData}>
                      {(loc) => (
                        <Table.Row key={loc.location} id={loc.location}>
                          <Table.Cell>
                            <LocationInfoPopover
                              locationKey={loc.location}
                              hierarchy={locationHierarchy}
                            >
                              <button
                                type="button"
                                className="font-medium text-heading underline-offset-2 hover:underline cursor-pointer"
                              >
                                {formatLocationName(loc.location)}
                              </button>
                            </LocationInfoPopover>
                          </Table.Cell>
                          <Table.Cell>
                            <span className="font-semibold text-accent">
                              {formatProbability(loc.ores[selectedOre].prob)}
                            </span>
                          </Table.Cell>
                          <Table.Cell>
                            {formatPercent(loc.ores[selectedOre].minPct)}
                          </Table.Cell>
                          <Table.Cell>
                            {formatPercent(loc.ores[selectedOre].medPct)}
                          </Table.Cell>
                          <Table.Cell>
                            {formatPercent(loc.ores[selectedOre].maxPct)}
                          </Table.Cell>
                          <Table.Cell>{formatNumber(loc.scans)}</Table.Cell>
                          <Table.Cell>{formatNumber(loc.users)}</Table.Cell>
                        </Table.Row>
                      )}
                    </Table.Body>
                  </Table.Content>
                </Table>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2: Browse Locations
// ---------------------------------------------------------------------------

function BrowseLocationsTab({
  allLocations,
  locationHierarchy,
}: {
  allLocations: OreLocationRow[];
  locationHierarchy: LocationHierarchyData;
}) {
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedLocationSearch, setDebouncedLocationSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedLocationSearch(locationSearch),
      200
    );
    return () => clearTimeout(timer);
  }, [locationSearch]);

  const filteredGridLocations = useMemo(() => {
    if (!debouncedLocationSearch) return allLocations;
    const q = debouncedLocationSearch.toLowerCase();
    return allLocations.filter((loc) =>
      formatLocationName(loc.location).toLowerCase().includes(q)
    );
  }, [allLocations, debouncedLocationSearch]);

  const location = useMemo(
    () => allLocations.find((loc) => loc.location === selectedLocation),
    [allLocations, selectedLocation]
  );

  const oreRows = useMemo(() => {
    if (!location) return [];
    return Object.entries(location.ores).map(([name, entry]) => ({
      name,
      ...entry,
    }));
  }, [location]);

  const oreSortColumns = useMemo(
    () => ({
      name: "name" as const,
      prob: "prob" as const,
      minPct: "minPct" as const,
      medPct: "medPct" as const,
      maxPct: "maxPct" as const,
    }),
    []
  );

  const { sortedData: sortedOres, sortDescriptor: oreSortDescriptor, onSortChange: onOreSortChange } = useSort({
    data: oreRows,
    columns: oreSortColumns,
    defaultSort: { column: "prob", direction: "descending" },
  });

  function handleBack() {
    setSelectedLocation("");
    setLocationSearch("");
    setDebouncedLocationSearch("");
  }

  return (
    <div className="mt-4 space-y-4">
      <AnimatePresence mode="wait">
        {!selectedLocation ? (
          <motion.div
            key="location-grid"
            initial={initialAnim}
            animate={enterAnim}
            exit={exitAnim}
            transition={transitionIn}
          >
            <SearchField
              aria-label="Search locations"
              value={locationSearch}
              onChange={setLocationSearch}
              className="mb-4 sm:w-72"
            >
              <Label>Search Locations</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Filter by location name..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            {filteredGridLocations.length === 0 ? (
              <p className="py-12 text-center text-muted-deeper">
                No locations matching &ldquo;{locationSearch}&rdquo;.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredGridLocations.map((loc) => (
                  <LocationCard
                    key={loc.location}
                    locationKey={loc.location}
                    subtitle={`${formatNumber(loc.scans)} scans · ${formatNumber(loc.users)} users`}
                    onSelect={setSelectedLocation}
                    meta={locationHierarchy[loc.location]}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="location-detail"
            initial={initialAnim}
            animate={enterAnim}
            exit={exitAnim}
            transition={transitionIn}
            className="space-y-4"
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" onPress={handleBack}>
                &larr; Back to locations
              </Button>
              <LocationInfoPopover
                locationKey={selectedLocation}
                hierarchy={locationHierarchy}
              >
                <button
                  type="button"
                  className="text-lg font-semibold text-heading underline-offset-2 hover:underline cursor-pointer"
                >
                  {formatLocationName(selectedLocation)}
                </button>
              </LocationInfoPopover>
            </div>

            {location && (
              <>
                {/* Location stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <StatsCard label="Mass" range={location.mass} />
                  <StatsCard label="Instability" range={location.inst} />
                  <StatsCard label="Resistance" range={location.res} />
                  <StatsCard
                    label="Cluster Count"
                    range={location.clusterCount}
                  />
                </div>

                <div className="flex gap-4 text-sm text-muted">
                  <span>
                    <strong className="text-heading">
                      {formatNumber(location.scans)}
                    </strong>{" "}
                    scans
                  </span>
                  <span>
                    <strong className="text-heading">
                      {formatNumber(location.users)}
                    </strong>{" "}
                    users
                  </span>
                  <span>
                    <strong className="text-heading">
                      {formatNumber(location.clusters)}
                    </strong>{" "}
                    clusters
                  </span>
                </div>

                {/* Ores table */}
                <div className="overflow-x-auto rounded-lg">
                  <Table
                    aria-label={`Ores at ${formatLocationName(selectedLocation)}`}
                  >
                    <Table.Content>
                      <Table.Header>
                        <Table.Column isRowHeader>
                          <SortableHeader columnId="name" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Ore</SortableHeader>
                        </Table.Column>
                        <Table.Column>
                          <SortableHeader columnId="prob" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Probability</SortableHeader>
                        </Table.Column>
                        <Table.Column>
                          <SortableHeader columnId="minPct" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Min %</SortableHeader>
                        </Table.Column>
                        <Table.Column>
                          <SortableHeader columnId="medPct" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Median %</SortableHeader>
                        </Table.Column>
                        <Table.Column>
                          <SortableHeader columnId="maxPct" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Max %</SortableHeader>
                        </Table.Column>
                      </Table.Header>
                      <Table.Body items={sortedOres}>
                        {(ore) => (
                          <Table.Row key={ore.name} id={ore.name}>
                            <Table.Cell>
                              <OreChip name={ore.name} />
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-semibold text-accent">
                                {formatProbability(ore.prob)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              {formatPercent(ore.minPct)}
                            </Table.Cell>
                            <Table.Cell>
                              {formatPercent(ore.medPct)}
                            </Table.Cell>
                            <Table.Cell>
                              {formatPercent(ore.maxPct)}
                            </Table.Cell>
                          </Table.Row>
                        )}
                      </Table.Body>
                    </Table.Content>
                  </Table>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
