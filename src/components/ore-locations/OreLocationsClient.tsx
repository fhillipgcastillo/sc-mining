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
import type { OreLocationRow } from "@/types";
import { formatLocationName, formatOreName } from "@/lib/constants";
import { formatProbability, formatPercent, formatNumber } from "@/lib/formatting";
import { OreChip } from "@/components/shared/OreChip";
import { StatsCard } from "@/components/shared/StatsCard";
import { ItemCard } from "@/components/shared/ItemCard";
import { LocationCard } from "@/components/shared/LocationCard";

interface OreLocationsClientProps {
  allLocations: OreLocationRow[];
  allOreTypes: string[];
}

const enterAnim = { opacity: 1, y: 0 };
const exitAnim = { opacity: 0, y: -8 };
const initialAnim = { opacity: 0, y: 12 };
const transitionIn = { duration: 0.2 };
const transitionOut = { duration: 0.15 };

export function OreLocationsClient({
  allLocations,
  allOreTypes,
}: OreLocationsClientProps) {
  const [activeTab, setActiveTab] = useState<string>("find-ore");

  return (
    <Tabs
      selectedKey={activeTab}
      onSelectionChange={(key) => setActiveTab(String(key))}
      className="mt-6"
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
// Tab 1: Find Ore
// ---------------------------------------------------------------------------

function FindOreTab({
  allLocations,
  allOreTypes,
}: {
  allLocations: OreLocationRow[];
  allOreTypes: string[];
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
                      <Table.Column>Min %</Table.Column>
                      <Table.Column>Median %</Table.Column>
                      <Table.Column>Max %</Table.Column>
                      <Table.Column>Scans</Table.Column>
                      <Table.Column>Users</Table.Column>
                    </Table.Header>
                    <Table.Body items={filteredLocations}>
                      {(loc) => (
                        <Table.Row key={loc.location} id={loc.location}>
                          <Table.Cell>
                            <span className="font-medium text-heading">
                              {formatLocationName(loc.location)}
                            </span>
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
}: {
  allLocations: OreLocationRow[];
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
              <h2 className="text-lg font-semibold text-heading">
                {formatLocationName(selectedLocation)}
              </h2>
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
                        <Table.Column isRowHeader>Ore</Table.Column>
                        <Table.Column>Probability</Table.Column>
                        <Table.Column>Min %</Table.Column>
                        <Table.Column>Median %</Table.Column>
                        <Table.Column>Max %</Table.Column>
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
