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
import type { HandMiningLocationRow } from "@/types";
import { formatLocationName, formatOreName } from "@/lib/constants";
import { formatNumber, formatProbability } from "@/lib/formatting";
import { OreChip } from "@/components/shared/OreChip";

interface HandMiningClientProps {
  allLocations: HandMiningLocationRow[];
  allOres: string[];
}

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
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredLocations = useMemo(() => {
    if (!selectedOre) return [];

    return allLocations
      .filter((loc) => {
        const hasOre = selectedOre in loc.ores;
        if (!hasOre) return false;
        if (debouncedSearch) {
          return formatLocationName(loc.location)
            .toLowerCase()
            .includes(debouncedSearch.toLowerCase());
        }
        return true;
      })
      .sort(
        (a, b) =>
          (b.ores[selectedOre]?.prob ?? 0) - (a.ores[selectedOre]?.prob ?? 0)
      );
  }, [allLocations, selectedOre, debouncedSearch]);

  return (
    <div className="mt-4 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Select
          aria-label="Select a hand-mining ore"
          selectedKey={selectedOre || null}
          onSelectionChange={(key) => setSelectedOre(String(key ?? ""))}
          className="sm:w-64"
        >
          <Label>Ore Type</Label>
          <Select.Trigger>
            <Select.Value>
              {selectedOre ? formatOreName(selectedOre) : "Select an ore..."}
            </Select.Value>
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {allOres.map((ore) => (
                <ListBox.Item key={ore} id={ore} textValue={formatOreName(ore)}>
                  {formatOreName(ore)}
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

      {!selectedOre ? (
        <p className="py-12 text-center text-white/40">
          Select an ore to see where it can be found.
        </p>
      ) : filteredLocations.length === 0 ? (
        <p className="py-12 text-center text-white/40">
          No locations found for {formatOreName(selectedOre)}
          {debouncedSearch ? ` matching "${debouncedSearch}"` : ""}.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg">
          <Table aria-label={`Locations for ${formatOreName(selectedOre)}`}>
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
                        <span className="font-medium text-white">
                          {formatLocationName(loc.location)}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-semibold text-amber-300">
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

  const handleSelectionChange = useCallback((key: React.Key | null) => {
    setSelectedLocation(String(key ?? ""));
  }, []);

  return (
    <div className="mt-4 space-y-4">
      <Select
        aria-label="Select a hand-mining location"
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
          Select a location to see its hand-mining ores.
        </p>
      ) : (
        <>
          {/* Location summary */}
          <div className="flex gap-4 text-sm text-white/50">
            <span>
              <strong className="text-white">{formatNumber(location.finds)}</strong>{" "}
              total finds
            </span>
            <span>
              <strong className="text-white">{formatNumber(location.users)}</strong>{" "}
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
                        <span className="font-semibold text-amber-300">
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
    </div>
  );
}
