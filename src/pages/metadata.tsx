import {
  BarCheck,
  BarLabel,
  BarValue,
  Button,
  ChartContainer,
  Controls,
  FilterContainer,
  GraphBar,
  GraphContainer,
  Input,
  TabButton,
  TabsContainer,
  ToggleGroup,
} from "@styles/Metadata.styled";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ContentStyled,
  ContentWrapper,
} from "@components/Shared/Content.styled";
import React, { useState } from "react";

import Container from "@components/Shared/Container";
import FACETS from "@.canopy/facets.json";
import Heading from "@components/Shared/Heading/Heading";
import Layout from "@components/layout";
import Link from "@components/Shared/Link";
import { getPrefectureSortIndex } from "@src/lib/constants/prefectures";
import { styled } from "@styles/stitches";

const ListItem = styled("li", {
  listStyle: "none",
  padding: "0",
  lineHeight: "unset",

  em: {
    fontSize: "$gr1",
    fontStyle: "normal",
  },
});

interface MetadataItemProps {
  value: string;
  slug: string;
  doc_count: number;
  path: string;
}

export default function Metadata() {
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");
  const [sortOrder, setSortOrder] = useState<"chronological" | "count">("chronological");
  const [filterYearFrom, setFilterYearFrom] = useState<string>("");
  const [filterYearTo, setFilterYearTo] = useState<string>("");

  // Selection state for drag-to-filter
  const [refAreaLeft, setRefAreaLeft] = useState<number | string>("");
  const [refAreaRight, setRefAreaRight] = useState<number | string>("");

  // Initialize with the first facet (e.g., Year/Date)
  const [activeTab, setActiveTab] = useState(FACETS[0]?.slug);

  const MetadataItem: React.FC<MetadataItemProps> = ({
    value,
    slug,
    doc_count,
    path,
  }) => {
    return (
      <ListItem>
        <Link href={`${path}${slug}`}>{value}</Link> <em>({doc_count})</em>
      </ListItem>
    );
  };

  // Filter keys to display only the active one
  const activeFacetData = FACETS.find(facet => facet.slug === activeTab);

  // determine label for "Chronological" button
  const sortLabel = activeFacetData?.label.includes("Year") || activeFacetData?.label.includes("年")
    ? "Chronological"
    : "Standard";

  return (
    <Layout>
      <Container containerType="wide">
        <ContentWrapper>
          <ContentStyled fullWidth>
            <Heading as="h1">Metadata</Heading>

            {/* Tab Navigation */}
            <TabsContainer>
              {FACETS.map((facet) => (
                <TabButton
                  key={facet.slug}
                  active={activeTab === facet.slug}
                  onClick={() => {
                    setActiveTab(facet.slug);
                    setFilterYearFrom("");
                    setFilterYearTo("");
                  }}
                >
                  {facet.label}
                </TabButton>
              ))}
            </TabsContainer>

            {/* View and Sort Controls */}
            <Controls>
              <ToggleGroup>
                <span>View:</span>
                <Button
                  active={viewMode === "list"}
                  onClick={() => setViewMode("list")}
                >
                  List
                </Button>
                <Button
                  active={viewMode === "graph"}
                  onClick={() => setViewMode("graph")}
                >
                  Graph
                </Button>
              </ToggleGroup>

              <ToggleGroup>
                <span>Sort:</span>
                <Button
                  active={sortOrder === "chronological"}
                  onClick={() => setSortOrder("chronological")}
                >
                  {sortLabel}
                </Button>
                <Button
                  active={sortOrder === "count"}
                  onClick={() => setSortOrder("count")}
                >
                  Count
                </Button>
              </ToggleGroup>
            </Controls>

            {/* Content Area - Only one facet displayed at a time */}
            {activeFacetData && (() => {
              const { label, slug, values } = activeFacetData;
              const path = `/search?${slug}=`;

              // Check if we are sorting Prefectures
              const isPrefecture = label.includes("Prefecture") || label.includes("県");

              // Sorting Logic
              const getYearFromValue = (val: string) => {
                // Try to find the last occurrence of a 3-4 digit year (e.g. 1731, 1802, 2022)
                // This handles formats like "Japanese Era・WesternYear"
                const matches = val.match(/[0-9]{3,4}/g);
                if (matches && matches.length > 0) {
                  return parseInt(matches[matches.length - 1], 10);
                }
                // Fallback: try parsing the start of the string
                const parsed = parseInt(val);
                return isNaN(parsed) ? -1 : parsed;
              };

              const sortedValues = [...values].sort((a, b) => {
                if (sortOrder === "count") {
                  return b.doc_count - a.doc_count;
                }

                // Special Sort for Prefectures
                if (isPrefecture) {
                  return getPrefectureSortIndex(a.value) - getPrefectureSortIndex(b.value);
                }

                // Chronological Sort
                const yearA = getYearFromValue(a.value);
                const yearB = getYearFromValue(b.value);

                // If both have valid years, sort by year
                if (yearA !== -1 && yearB !== -1) {
                  return yearA - yearB;
                }

                // If one has year and other doesn't, put year first (or last, depending on preference)
                // Here we push non-years to the bottom
                if (yearA !== -1) return -1;
                if (yearB !== -1) return 1;

                // Default alphabetical
                return a.value.localeCompare(b.value);
              });

              const isYearFacet = label.includes("Year") || label.includes("年");
              let filteredValues = sortedValues;

              if (isYearFacet) {
                filteredValues = sortedValues.filter((v) => {
                  const year = getYearFromValue(v.value);
                  if (year === -1) return true; // Keep items without parseable year? Or remove?
                  const from = filterYearFrom ? parseInt(filterYearFrom, 10) : -Infinity;
                  const to = filterYearTo ? parseInt(filterYearTo, 10) : Infinity;
                  return year >= from && year <= to;
                });
              }

              const maxCount = Math.max(...values.map(v => v.doc_count));

              return (
                <div key={slug}>
                  <Heading as="h2">{label}</Heading>

                  {isYearFacet && (
                    <FilterContainer>
                      <label>From:</label>
                      <Input
                        type="number"
                        placeholder="Year"
                        value={filterYearFrom}
                        onChange={(e) => setFilterYearFrom(e.target.value)}
                      />
                      <label>To:</label>
                      <Input
                        type="number"
                        placeholder="Year"
                        value={filterYearTo}
                        onChange={(e) => setFilterYearTo(e.target.value)}
                      />
                      <Button
                        onClick={() => {
                          setFilterYearFrom("");
                          setFilterYearTo("");
                        }}
                        style={{ marginLeft: "auto" }}
                      >
                        Reset
                      </Button>
                    </FilterContainer>
                  )}

                  {viewMode === "list" ? (
                    <ul style={{ padding: "0" }}>
                      {filteredValues.map((value) => (
                        <MetadataItem {...value} path={path} key={value.slug} />
                      ))}
                    </ul>
                  ) : isYearFacet ? (
                    (() => {
                      // Prepare data for the chart
                      // 1. Map to get clean year and count
                      // 2. Filter out invalid years (-1) so the scale isn't skewed
                      // 3. Sort by year ascending regardless of the "Sort" button state (which is for valid list/bar)
                      const chartData = filteredValues
                        .map(v => ({
                          original: v.value,
                          year: getYearFromValue(v.value),
                          count: v.doc_count,
                          slug: v.slug
                        }))
                        .filter(item => item.year !== -1)
                        .sort((a, b) => a.year - b.year);

                      return (
                        <ChartContainer>
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart
                              data={chartData}
                              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                              onMouseDown={(e) => {
                                if (e && e.activeLabel) {
                                  setRefAreaLeft(e.activeLabel);
                                }
                              }}
                              onMouseMove={(e) => {
                                if (refAreaLeft && e && e.activeLabel) {
                                  setRefAreaRight(e.activeLabel);
                                }
                              }}
                              onMouseUp={() => {
                                if (refAreaLeft && refAreaRight) {
                                  // Ensure correct order (left is smaller)
                                  const [bottom, top] = [Number(refAreaLeft), Number(refAreaRight)].sort((a, b) => a - b);

                                  setFilterYearFrom(bottom.toString());
                                  setFilterYearTo(top.toString());
                                }
                                // Reset selection
                                setRefAreaLeft("");
                                setRefAreaRight("");
                              }}
                              style={{ userSelect: 'none' }}
                            >
                              <defs>
                                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4c6ef5" stopOpacity={0.8} />
                                  <stop offset="95%" stopColor="#4c6ef5" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                              <XAxis
                                dataKey="year"
                                type="number"
                                domain={['auto', 'auto']}
                                tick={{ fill: '#666' }}
                                tickCount={10}
                                allowDataOverflow
                              />
                              <YAxis tick={{ fill: '#666' }} />
                              <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                labelStyle={{ color: '#666', marginBottom: '0.5rem' }}
                                formatter={(value: any) => [value, "Count"]}
                                labelFormatter={(label) => `Year: ${label}`}
                              />
                              <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#4c6ef5"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorCount)"
                                animationDuration={300}
                              />
                              {refAreaLeft && refAreaRight ? (
                                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#4c6ef5" fillOpacity={0.3} />
                              ) : null}
                            </AreaChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      );
                    })()
                  ) : (
                    <GraphContainer>
                      {filteredValues.map((value) => (
                        <GraphBar key={value.slug}>
                          <BarLabel>
                            <Link href={`${path}${value.slug}`}>{value.value}</Link>
                          </BarLabel>
                          <BarCheck style={{ width: `${(value.doc_count / maxCount) * 100}%` }} />
                          <BarValue>{value.doc_count}</BarValue>
                        </GraphBar>
                      ))}
                    </GraphContainer>
                  )}
                </div>
              );
            })()}
          </ContentStyled>
        </ContentWrapper>
      </Container>
    </Layout>
  );
}

export async function getStaticProps() {
  const pageTitle = "Metadata";

  return {
    props: { pageTitle },
  };
}
