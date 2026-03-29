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
import type { RockTypeLocationRow } from "@/types";
import { formatLocationName, formatOreName } from "@/lib/constants";
import { formatProbability, formatNumber, formatStat } from "@/lib/formatting";
import { OreChip } from "@/components/shared/OreChip";
import { ItemCard } from "@/components/shared/ItemCard";
import { LocationCard } from "@/components/shared/LocationCard";

interface RockTypeLocationsClientProps {
  allLocations: RockTypeLocationRow[];
  allRockTypes: string[];
}

const enterAnim = { opacity: 1, y: 0 };
const exitAnim = { opacity: 0, y: -8 };
const initialAnim = { opacity: 0, y: 12 };
const transitionIn = { duration: 0.2 };

export function RockTypeLocationsClient({
  allLocations,
  allRockTypes,
}: RockTypeLocationsClientProps) {
  const [activeTab, setActiveTab] = useState<string>("find-rock-type");

  return (
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(String(key))}
      className="mt-6"
    >
      <Tabs.ListContainer>
        <Tabs.List aria-label="Rock type locations view mode">
          <Tabs.Tab id="find-rock-type">Find Rock Type<Tabs.Indicator /></Tabs.Tab>
          <Tabs.Tab id="browse-locations">Browse Locations<Tabs.Indicator /></Tabs.Tab>
        </Tabs.List>
      </Tabs.ListContainer>

      <Tabs.Panel id="find-rock-type">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <FindRockTypeTab
            allLocations={allLocations}
            allRockTypes={allRockTypes}
          />
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
// Tab 1: Find Rock Type
// ---------------------------------------------------------------------------

function FindRockTypeTab({
  allLocations,
  allRockTypes,
}: {
  allLocations: RockTypeLocationRow[];
  allRockTypes: string[];
}) {
  const [selectedRockType, setSelectedRockType] = useState<string>("");
  const [rockTypeSearch, setRockTypeSearch] = useState("");
  const [locationSearch, setLocationSearch] = useState("");
  const [debouncedLocationSearch, setDebouncedLocationSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedLocationSearch(locationSearch), 200);
    return () => clearTimeout(timer);
  }, [locationSearch]);

  // No debounce needed — only ~18 rock types
  const filteredRockTypes = useMemo(() => {
    if (!rockTypeSearch) return allRockTypes;
    const q = rockTypeSearch.toLowerCase();
    return allRockTypes.filter((rt) =>
      formatOreName(rt).toLowerCase().includes(q)
    );
  }, [allRockTypes, rockTypeSearch]);

  const filteredLocations = useMemo(() => {
    if (!selectedRockType) return [];
    return allLocations
      .filter((loc) => {
        const hasType = selectedRockType in loc.rockTypes;
        if (!hasType) return false;
        if (debouncedLocationSearch) {
          return formatLocationName(loc.location)
            .toLowerCase()
            .includes(debouncedLocationSearch.toLowerCase());
        }
        return true;
      })
      .sort(
        (a, b) =>
          (b.rockTypes[selectedRockType]?.prob ?? 0) -
          (a.rockTypes[selectedRockType]?.prob ?? 0)
      );
  }, [allLocations, selectedRockType, debouncedLocationSearch]);

  function handleBack() {
    setSelectedRockType("");
    setRockTypeSearch("");
    setLocationSearch("");
    setDebouncedLocationSearch("");
  }

  return (
    <div className="mt-4 space-y-4">
      <AnimatePresence mode="wait">
        {!selectedRockType ? (
          <motion.div
            key="rock-type-grid"
            initial={initialAnim}
            animate={enterAnim}
            exit={exitAnim}
            transition={transitionIn}
          >
            <SearchField
              aria-label="Search rock types"
              value={rockTypeSearch}
              onChange={setRockTypeSearch}
              className="mb-4 sm:w-72"
            >
              <Label>Search Rock Types</Label>
              <SearchField.Group>
                <SearchField.SearchIcon />
                <SearchField.Input placeholder="Filter rock types..." />
                <SearchField.ClearButton />
              </SearchField.Group>
            </SearchField>

            {filteredRockTypes.length === 0 ? (
              <p className="py-12 text-center text-white/40">
                No rock types matching &ldquo;{rockTypeSearch}&rdquo;.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredRockTypes.map((rt) => (
                  <ItemCard
                    key={rt}
                    name={rt}
                    onSelect={setSelectedRockType}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="rock-type-detail"
            initial={initialAnim}
            animate={enterAnim}
            exit={exitAnim}
            transition={transitionIn}
            className="space-y-4"
          >
            {/* Header with back button */}
            <div className="flex items-center gap-3">
              <Button variant="ghost" onPress={handleBack}>
                &larr; Back to rock types
              </Button>
              <OreChip name={selectedRockType} size="md" />
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
              <p className="py-12 text-center text-white/40">
                No locations found for {formatOreName(selectedRockType)}
                {debouncedLocationSearch
                  ? ` matching "${debouncedLocationSearch}"`
                  : ""}
                .
              </p>
            ) : (
              <div className="overflow-x-auto rounded-lg">
                <Table
                  aria-label={`Locations for ${formatOreName(selectedRockType)}`}
                >
                  <Table.Content>
                    <Table.Header>
                      <Table.Column isRowHeader>Location</Table.Column>
                      <Table.Column>Probability</Table.Column>
                      <Table.Column>Scans</Table.Column>
                      <Table.Column>Clusters</Table.Column>
                      <Table.Column>Mass (med)</Table.Column>
                      <Table.Column>Instability (med)</Table.Column>
                      <Table.Column>Resistance (med)</Table.Column>
                    </Table.Header>
                    <Table.Body items={filteredLocations}>
                      {(loc) => {
                        const entry = loc.rockTypes[selectedRockType];
                        return (
                          <Table.Row key={loc.location} id={loc.location}>
                            <Table.Cell>
                              <span className="font-medium text-white">
                                {formatLocationName(loc.location)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-semibold text-amber-300">
                                {formatProbability(entry.prob)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>{formatNumber(entry.scans)}</Table.Cell>
                            <Table.Cell>{formatNumber(entry.clusters)}</Table.Cell>
                            <Table.Cell>{formatStat(entry.mass.med)}</Table.Cell>
                            <Table.Cell>{formatStat(entry.inst.med)}</Table.Cell>
                            <Table.Cell>{formatStat(entry.res.med)}</Table.Cell>
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
  allLocations: RockTypeLocationRow[];
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

  const sortedRockTypes = useMemo(() => {
    if (!location) return [];
    return Object.entries(location.rockTypes)
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
              <p className="py-12 text-center text-white/40">
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
              <h2 className="text-lg font-semibold text-white">
                {formatLocationName(selectedLocation)}
              </h2>
            </div>

            {location && (
              <>
                {/* Location summary stats */}
                <div className="flex gap-4 text-sm text-white/50">
                  <span>
                    <strong className="text-white">
                      {formatNumber(location.scans)}
                    </strong>{" "}
                    scans
                  </span>
                  <span>
                    <strong className="text-white">
                      {formatNumber(location.users)}
                    </strong>{" "}
                    users
                  </span>
                  <span>
                    <strong className="text-white">
                      {formatNumber(location.clusters)}
                    </strong>{" "}
                    clusters
                  </span>
                </div>

                {/* Rock types table */}
                <div className="overflow-x-auto rounded-lg">
                  <Table
                    aria-label={`Rock types at ${formatLocationName(selectedLocation)}`}
                  >
                    <Table.Content>
                      <Table.Header>
                        <Table.Column isRowHeader>Rock Type</Table.Column>
                        <Table.Column>Probability</Table.Column>
                        <Table.Column>Scans</Table.Column>
                        <Table.Column>Clusters</Table.Column>
                        <Table.Column>Mass (med)</Table.Column>
                        <Table.Column>Instability (med)</Table.Column>
                        <Table.Column>Resistance (med)</Table.Column>
                      </Table.Header>
                      <Table.Body items={sortedRockTypes}>
                        {(rt) => (
                          <Table.Row key={rt.name} id={rt.name}>
                            <Table.Cell>
                              <OreChip name={rt.name} />
                            </Table.Cell>
                            <Table.Cell>
                              <span className="font-semibold text-amber-300">
                                {formatProbability(rt.prob)}
                              </span>
                            </Table.Cell>
                            <Table.Cell>{formatNumber(rt.scans)}</Table.Cell>
                            <Table.Cell>{formatNumber(rt.clusters)}</Table.Cell>
                            <Table.Cell>{formatStat(rt.mass.med)}</Table.Cell>
                            <Table.Cell>{formatStat(rt.inst.med)}</Table.Cell>
                            <Table.Cell>{formatStat(rt.res.med)}</Table.Cell>
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
