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
import { OreChip } from "@/components/shared/OreChip";
import { ItemCard } from "@/components/shared/ItemCard";
import { LocationCard } from "@/components/shared/LocationCard";

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

  return (
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(String(key))}
      className="mt-6"
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
    return allLocations
      .filter((loc) => {
        const hasOre = selectedOre in loc.ores;
        if (!hasOre) return false;
        if (debouncedLocationSearch) {
          return formatLocationName(loc.location)
            .toLowerCase()
            .includes(debouncedLocationSearch.toLowerCase());
        }
        return true;
      })
      .sort(
        (a, b) =>
          (b.ores[selectedOre]?.prob ?? 0) - (a.ores[selectedOre]?.prob ?? 0)
      );
  }, [allLocations, selectedOre, debouncedLocationSearch]);

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
            {filteredLocations.length === 0 ? (
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
                      <Table.Column isRowHeader>Location</Table.Column>
                      <Table.Column>Probability</Table.Column>
                      <Table.Column>Finds</Table.Column>
                      <Table.Column>Min Rocks</Table.Column>
                      <Table.Column>Median Rocks</Table.Column>
                      <Table.Column>Max Rocks</Table.Column>
                      <Table.Column>Users</Table.Column>
                    </Table.Header>
                    <Table.Body items={filteredLocations}>
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

  const sortedOres = useMemo(() => {
    if (!location) return [];
    return Object.entries(location.ores)
      .map(([name, entry]) => ({ name, ...entry }))
      .sort((a, b) => b.prob - a.prob);
  }, [location]);

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
                        <Table.Column isRowHeader>Ore</Table.Column>
                        <Table.Column>Probability</Table.Column>
                        <Table.Column>Finds</Table.Column>
                        <Table.Column>Min Rocks</Table.Column>
                        <Table.Column>Median Rocks</Table.Column>
                        <Table.Column>Max Rocks</Table.Column>
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
