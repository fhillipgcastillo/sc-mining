"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Table,
  Tabs,
  Select,
  ListBox,
  SearchField,
  Label,
} from "@heroui/react";
import { motion } from "framer-motion";
import type { RockTypeLocationRow } from "@/types";
import { formatLocationName, formatOreName } from "@/lib/constants";
import { formatProbability, formatNumber, formatStat } from "@/lib/formatting";

interface RockTypeLocationsClientProps {
  allLocations: RockTypeLocationRow[];
  allRockTypes: string[];
}

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredLocations = useMemo(() => {
    if (!selectedRockType) return [];

    return allLocations
      .filter((loc) => {
        const hasType = selectedRockType in loc.rockTypes;
        if (!hasType) return false;
        if (debouncedSearch) {
          return formatLocationName(loc.location)
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase());
        }
        return true;
      })
      .sort(
        (a, b) =>
          (b.rockTypes[selectedRockType]?.prob ?? 0) -
          (a.rockTypes[selectedRockType]?.prob ?? 0)
      );
  }, [allLocations, selectedRockType, debouncedSearch]);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Select
          aria-label="Select a rock type"
          selectedKey={selectedRockType || null}
          onSelectionChange={(key) => setSelectedRockType(String(key ?? ""))}
          className="sm:w-64"
        >
          <Label>Rock Type</Label>
          <Select.Trigger>
            <Select.Value>
              {selectedRockType
                ? formatOreName(selectedRockType)
                : "Select a rock type..."}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {allRockTypes.map((rt) => (
                <ListBox.Item key={rt} id={rt} textValue={formatOreName(rt)}>
                  {formatOreName(rt)}
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <SearchField
          aria-label="Search locations"
          value={search}
          onChange={setSearch}
          className="sm:w-64"
        >
          <Label>Search Locations</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Filter by location name..." />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </div>

      {!selectedRockType ? (
        <p className="py-12 text-center text-white/40">
          Select a rock type to see where it can be found.
        </p>
      ) : filteredLocations.length === 0 ? (
        <p className="py-12 text-center text-white/40">
          No locations found for {formatOreName(selectedRockType)}
          {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}.
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

  const handleSelectionChange = useCallback((key: React.Key | null) => {
    setSelectedLocation(String(key ?? ""));
  }, []);

  return (
    <div className="mt-4 space-y-4">
      <Select
        aria-label="Select a location"
        selectedKey={selectedLocation || null}
        onSelectionChange={handleSelectionChange}
        className="sm:w-80"
      >
        <Label>Location</Label>
        <Select.Trigger>
          <Select.Value>
            {selectedLocation
              ? formatLocationName(selectedLocation)
              : "Select a location..."}
          </Select.Value>
          <Select.Indicator />
        </Select.Trigger>
        <Select.Popover>
          <ListBox>
            {allLocations.map((loc) => (
              <ListBox.Item
                key={loc.location}
                id={loc.location}
                textValue={formatLocationName(loc.location)}
              >
                {formatLocationName(loc.location)}
              </ListBox.Item>
            ))}
          </ListBox>
        </Select.Popover>
      </Select>

      {!location ? (
        <p className="py-12 text-center text-white/40">
          Select a location to see its rock type composition.
        </p>
      ) : (
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
                        <span className="font-medium text-white">
                          {formatOreName(rt.name)}
                        </span>
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
    </div>
  );
}
