// @ts-nocheck

import "leaflet/dist/leaflet.css";

import { Button, FilterContainer, Select, Input } from "@styles/Metadata.styled";
import { Slider, Text, Flex, TextField } from "@radix-ui/themes";
import React, { useState } from "react";
import { canopyFacets, canopyManifests } from "@lib/constants/canopy";

import Layout from "@components/layout";
import { Manifest } from "@iiif/presentation-3";
import dynamic from "next/dynamic";
import { getFeatures } from "@lib/iiif/navPlace";
import { getPrefectureSortIndex } from "@src/lib/constants/prefectures";

const Map = dynamic(() => import("../components/Map/Map"), { ssr: false });

interface MapPageProps {
  manifests: Manifest[];
  facets: any[];
}

export default function MapPage({ manifests, facets }: MapPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSchool, setFilterSchool] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const yearFacet = facets?.find((f: any) => f.label.includes("Year") || f.label.includes("年"));
  const schoolFacet = facets?.find((f: any) => f.label.includes("School") || f.label.includes("流"));

  // Years logic
  const getYearFromValue = (val: string) => {
    const matches = val.match(/[0-9]{3,4}/g);
    if (matches && matches.length > 0) return parseInt(matches[matches.length - 1], 10);
    const parsed = parseInt(val);
    return isNaN(parsed) ? -1 : parsed;
  };

  const years = yearFacet ? [...yearFacet.values].map((v: any) => getYearFromValue(v.value)).filter(y => y !== -1) : [];
  const minYear = years.length > 0 ? Math.min(...years) : 1700;
  const maxYear = years.length > 0 ? Math.max(...years) : 1900;

  const [yearRange, setYearRange] = useState([minYear, maxYear]);
  const [inputFrom, setInputFrom] = useState<string | number>(minYear);
  const [inputTo, setInputTo] = useState<string | number>(maxYear);

  const handleYearChange = (newRange: number[]) => {
    setYearRange(newRange);
    setInputFrom(newRange[0]);
    setInputTo(newRange[1]);
  };

  const schools = schoolFacet ? [...schoolFacet.values].sort((a: any, b: any) => a.value.localeCompare(b.value)) : [];

  const getFilteredDocs = (filterValue: string, facetValues: any[]) => {
    if (!filterValue) return null;
    const selected = facetValues.find(v => v.slug === filterValue);
    return selected ? new Set(selected.docs) : new Set();
  };

  const schoolDocs = getFilteredDocs(filterSchool, schools);

  const filteredManifests = manifests.filter((manifest, index) => {
    if (!manifest.navPlace) return false;

    // School Filter
    if (schoolDocs && !schoolDocs.has(index)) return false;

    // Search Query filter (checks title/label or summary)
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      // presentation-3 label could be international string
      const getLabelString = (labelObj: any) => {
        if (!labelObj) return "";
        let str = "";
        Object.values(labelObj).forEach((vals: any) => {
          str += vals.join(" ") + " ";
        });
        return str.toLowerCase();
      };

      const labelMatch = getLabelString(manifest.label).includes(q);
      const summaryMatch = getLabelString(manifest.summary).includes(q);

      if (!labelMatch && !summaryMatch) return false;
    }

    // Year range filter
    if (yearFacet && manifest.metadata) {
      // Find the year metadata entry if it exists in the manifest
      const yearMeta = manifest.metadata.find((m: any) => {
        const label = m.label ? Object.values(m.label).flat().join("") : "";
        return label.includes("Year") || label.includes("年");
      });

      if (yearMeta && yearMeta.value) {
        const valStr = Object.values(yearMeta.value).flat().join("");
        const manifestYear = getYearFromValue(valStr);
        if (manifestYear !== -1) {
          if (manifestYear < yearRange[0] || manifestYear > yearRange[1]) {
            return false;
          }
        }
      }
    }

    return true;
  });

  const features = getFeatures(filteredManifests);

  return (
    <Layout>
      <div style={{ display: "flex", height: "calc(100vh - 80px)", width: "100%", overflow: "hidden" }}>

        {/* Sidebar Filters */}
        <div style={{
          width: isFiltersOpen ? "300px" : "0px",
          transition: "width 0.3s ease",
          borderRight: isFiltersOpen ? "1px solid var(--gray-4)" : "none",
          backgroundColor: "var(--gray-1)",
          overflowY: "auto",
          flexShrink: 0
        }}>
          {isFiltersOpen && (
            <div style={{ padding: "24px 16px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600 }}>Filters</h3>
                <Button onClick={() => setIsFiltersOpen(false)}>
                  Hide
                </Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>Search keyword:</label>
                <Input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "100%" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>Year:</label>
                <Slider
                  min={minYear}
                  max={maxYear}
                  step={1}
                  value={yearRange}
                  onValueChange={handleYearChange}
                />
                <Flex justify="between" mt="2" gap="4">
                  <TextField.Root
                    type="number"
                    size="1"
                    min={minYear}
                    max={yearRange[1]}
                    value={inputFrom}
                    onChange={(e) => setInputFrom(e.target.value)}
                    onBlur={() => {
                      const val = parseInt(inputFrom as string, 10);
                      const newFrom = !isNaN(val) ? Math.max(minYear, Math.min(val, yearRange[1])) : minYear;
                      setInputFrom(newFrom);
                      setYearRange([newFrom, yearRange[1]]);
                    }}
                    style={{ width: "80px" }}
                  />
                  <TextField.Root
                    type="number"
                    size="1"
                    min={yearRange[0]}
                    max={maxYear}
                    value={inputTo}
                    onChange={(e) => setInputTo(e.target.value)}
                    onBlur={() => {
                      const val = parseInt(inputTo as string, 10);
                      const newTo = !isNaN(val) ? Math.min(maxYear, Math.max(val, yearRange[0])) : maxYear;
                      setInputTo(newTo);
                      setYearRange([yearRange[0], newTo]);
                    }}
                    style={{ width: "80px" }}
                  />
                </Flex>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "14px", fontWeight: "bold" }}>School:</label>
                <Select value={filterSchool} onChange={(e) => setFilterSchool(e.target.value)}>
                  <option value="">All</option>
                  {schools.map((s: any) => <option key={s.slug} value={s.slug}>{s.value} ({s.doc_count})</option>)}
                </Select>
              </div>

              <Button
                onClick={() => {
                  setSearchQuery("");
                  setYearRange([minYear, maxYear]);
                  setInputFrom(minYear);
                  setInputTo(maxYear);
                  setFilterSchool("");
                }}
              >
                Reset
              </Button>
            </div>
          )}
        </div>

        {/* Map Area */}
        <div style={{ flexGrow: 1, position: "relative" }}>

          <Button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}
          >
            {isFiltersOpen ? "◀ Hide Filters" : "Filters ▶"}
          </Button>

          <Map manifests={features} />
        </div>
      </div>
    </Layout >
  );
}

export async function getStaticProps() {
  const enabled = process.env.CANOPY_CONFIG?.map?.enabled;

  if (!enabled) {
    return {
      notFound: true,
    };
  }

  try {
    const pageTitle = "Map";

    return {
      props: {
        manifests: canopyManifests(),
        facets: canopyFacets(),
        pageTitle,
      },
    };
  } catch (error) {
    console.error("Error fetching data:", error);

    return {
      notFound: true,
    };
  }
}
