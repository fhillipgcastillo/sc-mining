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
import type { HandMiningLocationRow } from "@/types";
import { formatLocationName, formatOreName } from "@/lib/constants";
import { formatNumber, formatProbability } from "@/lib/formatting";
import { useSort } from "@/hooks/useSort";
import type { SortAccessorMap } from "@/hooks/useSort";
import { OreChip } from "@/components/shared/OreChip";
import { SortableHeader } from "@/components/shared/SortableHeader";
import { ItemCard } from "@/components/shared/ItemCard";
import { LocationCard } from "@/components/shared/LocationCard";
import { ViewModeToggle } from "@/components/shared/ViewModeToggle";
import { HandMiningPivotAdapter } from "./HandMiningPivotAdapter";

interface HandMiningClientProps {
  allLocations: HandMiningLocationRow[];
  allOres: string[];
}

const enterAnim = { opacity: 1, y: 0 };
const exitAnim = { opacity: 0, y: -8 };
const initialAnim = { opacity: 0, y: 12 };
const transitionIn = { duration: 0.2 };

export function HandMiningClient({
  allLocations,
  allOres,
}: HandMiningClientProps) {
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
                <Tabs.List aria-label="Hand mining view mode">
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
                  <FindOreTab allLocations={allLocations} allOres={allOres} />
                </motion.div>
              </Tabs.Panel>

              <Tabs.Panel id="browse-locations">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <BrowseLocationsTab allLocations={allLocations} />
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
            <HandMiningPivotAdapter
              allLocations={allLocations}
              allOres={allOres}
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
  allOres,
}: {
  allLocations: HandMiningLocationRow[];
  allOres: string[];
}) {
  const [selectedOre, setSelectedOre] = useState<string>("");
  const [oreSearch, setOreSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedLocationSearch, setDebouncedLocationSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedLocationSearch(locationSearch),
      200
    );
    return () => clearTimeout(timer);
  }, [locationSearch]);

  // Only 7 hand-mining ores — no debounce needed on ore grid search
  const filteredOreTypes = useMemo(() => {
    if (!oreSearch) return allOres;
    const q = oreSearch.toLowerCase();
    return allOres.filter((ore) =>
      formatOreName(ore).toLowerCase().includes(q)
    );
  }, [allOres, oreSearch]);

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

  const sortColumns = useMemo<SortAccessorMap<HandMiningLocationRow>>(
    () => ({
      location: (loc) => formatLocationName(loc.location),
      prob: (loc) => loc.ores[selectedOre]?.prob ?? 0,
      finds: (loc) => loc.ores[selectedOre]?.finds ?? 0,
      minRocks: (loc) => loc.ores[selectedOre]?.minRocks ?? 0,
      medianRocks: (loc) => loc.ores[selectedOre]?.medianRocks ?? 0,
      maxRocks: (loc) => loc.ores[selectedOre]?.maxRocks ?? 0,
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
                        <SortableHeader columnId="finds" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Finds</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="minRocks" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Min Rocks</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="medianRocks" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Median Rocks</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="maxRocks" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Max Rocks</SortableHeader>
                      </Table.Column>
                      <Table.Column>
                        <SortableHeader columnId="users" sortDescriptor={sortDescriptor} onSortChange={onSortChange}>Users</SortableHeader>
                      </Table.Column>
                    </Table.Header>
                    <Table.Body items={sortedData}>
                      {(loc) => {
                        const oreData = loc.ores[selectedOre];
                        return (
                          <Table.Row key={loc.location} id={loc.location}>
                            <Table.Cell>
                              <span className="font-medium text-heading">
                                {formatLocationName(loc.location)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-semibold text-accent">
                                {formatProbability(oreData.prob)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>{formatNumber(oreData.finds)}</Table.Cell>
                            <Table.Cell>{formatNumber(oreData.minRocks)}</Table.Cell>
                            <Table.Cell>{formatNumber(oreData.medianRocks)}</Table.Cell>
                            <Table.Cell>{formatNumber(oreData.maxRocks)}</Table.Cell>
                            <Table.Cell>{formatNumber(loc.users)}</Table.Cell>
                          </Table.Row>
                        );
                      }}
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
}: {
  allLocations: HandMiningLocationRow[];
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
      finds: "finds" as const,
      minRocks: "minRocks" as const,
      medianRocks: "medianRocks" as const,
      maxRocks: "maxRocks" as const,
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
                    subtitle={`${formatNumber(loc.finds)} finds · ${formatNumber(loc.users)} users`}
                    onSelect={setSelectedLocation}
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
              <h2 className="text-lg font-semibold text-heading">
                {formatLocationName(selectedLocation)}
              </h2>
            </div>

            {location && (
              <>
                {/* Location summary */}
                <div className="flex gap-4 text-sm text-muted">
                  <span>
                    <strong className="text-heading">
                      {formatNumber(location.finds)}
                    </strong>{" "}
                    total finds
                  </span>
                  <span>
                    <strong className="text-heading">
                      {formatNumber(location.users)}
                    </strong>{" "}
                    users
                  </span>
                </div>

                {/* Ores table */}
                <div className="overflow-x-auto rounded-lg">
                  <Table
                    aria-label={`Hand-mining ores at ${formatLocationName(selectedLocation)}`}
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
                          <SortableHeader columnId="finds" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Finds</SortableHeader>
                        </Table.Column>
                        <Table.Column>
                          <SortableHeader columnId="minRocks" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Min Rocks</SortableHeader>
                        </Table.Column>
                        <Table.Column>
                          <SortableHeader columnId="medianRocks" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Median Rocks</SortableHeader>
                        </Table.Column>
                        <Table.Column>
                          <SortableHeader columnId="maxRocks" sortDescriptor={oreSortDescriptor} onSortChange={onOreSortChange}>Max Rocks</SortableHeader>
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
                            <Table.Cell>{formatNumber(ore.finds)}</Table.Cell>
                            <Table.Cell>{formatNumber(ore.minRocks)}</Table.Cell>
                            <Table.Cell>{formatNumber(ore.medianRocks)}</Table.Cell>
                            <Table.Cell>{formatNumber(ore.maxRocks)}</Table.Cell>
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
