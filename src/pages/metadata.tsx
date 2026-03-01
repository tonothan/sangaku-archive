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
  Select,
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

export default function Metadata() {
  // eslint-disable-next-line @typescript-eslint/sort-type-union-intersection-members
  const METADATA_FACETS = FACETS.filter((facet: any) => !facet.label.includes("Dedication site") && !facet.label.includes("Dedicator") && !facet.label.includes("Region") && !facet.label.includes("地域") && !facet.label.includes("奉納所") && !facet.label.includes("奉納者"));
  const [viewMode, setViewMode] = useState("graph");
  const [sortOrder, setSortOrder] = useState("chronological");
  const [filterYearFrom, setFilterYearFrom] = useState<string>("");
  const [filterYearTo, setFilterYearTo] = useState<string>("");
  const [appliedYearFrom, setAppliedYearFrom] = useState<string>("");
  const [appliedYearTo, setAppliedYearTo] = useState<string>("");
  const [filterPrefecture, setFilterPrefecture] = useState<string>("");
  const [filterRegions, setFilterRegions] = useState<string[]>([]);

  // Selection state for drag-to-filter
  const [refAreaLeft, setRefAreaLeft] = useState<number | string>("");
  const [refAreaRight, setRefAreaRight] = useState<number | string>("");

  // Initialize with the first facet (e.g., Year/Date)
  const [activeTab, setActiveTab] = useState(METADATA_FACETS[0]?.slug);



  // Filter keys to display only the active one
  const activeFacetData = FACETS.find(facet => facet.slug === activeTab);

  // determine label for "Chronological" button
  const sortLabel = activeFacetData?.label.includes("Year") || activeFacetData?.label.includes("年")
    ? "Chronological"
    : "Standard";

  // Data processing for the active facet
  let facetContent = null;
  if (activeFacetData) {
    const { label, slug, values } = activeFacetData;
    const path = `/search?${slug}=`;

    const isPrefecture = label.includes("Prefecture") || label.includes("県");
    const isYearFacet = label.includes("Year") || label.includes("年");

    const prefectureFacet = FACETS.find((f: any) => f.label.includes("Prefecture") || f.label.includes("県"));
    const prefectures = prefectureFacet ? [...prefectureFacet.values].sort((a: any, b: any) => getPrefectureSortIndex(a.value) - getPrefectureSortIndex(b.value)) : [];
    const selectedPrefecture = prefectures.find((p: any) => p.slug === filterPrefecture);

    const regionFacet = FACETS.find((f: any) => f.label.includes("Region") || f.label.includes("地域"));
    const regions = regionFacet ? [...regionFacet.values].sort((a: any, b: any) => a.value.localeCompare(b.value)) : [];
    const selectedRegions = regions.filter((p: any) => filterRegions.includes(p.slug));

    const getYearFromValue = (val: string) => {
      const matches = val.match(/[0-9]{3,4}/g);
      if (matches && matches.length > 0) {
        return parseInt(matches[matches.length - 1], 10);
      }
      const parsed = parseInt(val);
      return isNaN(parsed) ? -1 : parsed;
    };

    const processedValues = [...values].map((v: any) => {
      if (!isYearFacet) return v;

      let doc_count = v.doc_count;
      let docs = v.docs || [];

      if (selectedPrefecture) {
        const prefDocs = selectedPrefecture.docs || [];
        docs = docs.filter((docId: number) => prefDocs.includes(docId));
        doc_count = docs.length;
      }

      const regionCounts: Record<string, number> = {};

      if (selectedRegions.length > 0) {
        const intersectedDocs = new Set<number>();

        selectedRegions.forEach((reg: any) => {
          const regDocs = reg.docs || [];
          const commonDocs = docs.filter((id: number) => regDocs.includes(id));
          regionCounts[reg.slug] = commonDocs.length;
          commonDocs.forEach((id: number) => intersectedDocs.add(id));
        });

        docs = Array.from(intersectedDocs);
        doc_count = intersectedDocs.size;
      }

      return { ...v, docs, doc_count, regionCounts };
    }).filter((v: any) => v.doc_count > 0);

    const sortedValues = processedValues.sort((a: any, b: any) => {
      if (sortOrder === "count") {
        return b.doc_count - a.doc_count;
      }
      if (isPrefecture) {
        return getPrefectureSortIndex(a.value) - getPrefectureSortIndex(b.value);
      }
      const yearA = getYearFromValue(a.value);
      const yearB = getYearFromValue(b.value);
      if (yearA !== -1 && yearB !== -1) return yearA - yearB;
      if (yearA !== -1) return -1;
      if (yearB !== -1) return 1;
      return a.value.localeCompare(b.value);
    });

    let filteredValues = sortedValues;
    if (isYearFacet) {
      filteredValues = sortedValues.filter((v: any) => {
        const year = getYearFromValue(v.value);
        if (year === -1) return true;
        const from = appliedYearFrom ? parseInt(appliedYearFrom, 10) : -Infinity;
        const to = appliedYearTo ? parseInt(appliedYearTo, 10) : Infinity;
        return year >= from && year <= to;
      });
    }

    const validValues = processedValues;
    const maxCount = validValues.length > 0 ? Math.max(...validValues.map(v => v.doc_count)) : 1;

    let displayContent = null;

    if (viewMode === "list") {
      displayContent = (
        <ul style={{ padding: "0" }}>
          {filteredValues.map((value) => (
            <MetadataItem {...value} path={path} key={value.slug} />
          ))}
        </ul>
      );
    } else if (isYearFacet) {
      const validYearItems = filteredValues
        .map((v: any) => ({
          original: v.value,
          year: getYearFromValue(v.value),
          count: v.doc_count,
          slug: v.slug,
          regionCounts: v.regionCounts
        }))
        .filter((item: any) => item.year !== -1);

      const chartData: any[] = [];
      if (validYearItems.length > 0) {
        const minYear = Math.min(...validYearItems.map((item: any) => item.year));
        const maxYear = Math.max(...validYearItems.map((item: any) => item.year));

        const yearMap = new Map<number, any>();
        validYearItems.forEach((item: any) => {
          if (yearMap.has(item.year)) {
            const existing = yearMap.get(item.year);
            existing.count += item.count;
            if (item.regionCounts) {
              Object.keys(item.regionCounts).forEach(slug => {
                existing.regionCounts[slug] = (existing.regionCounts[slug] || 0) + item.regionCounts[slug];
              });
            }
          } else {
            yearMap.set(item.year, { ...item, regionCounts: item.regionCounts ? { ...item.regionCounts } : {} });
          }
        });

        for (let y = minYear; y <= maxYear; y++) {
          if (yearMap.has(y)) {
            const item = yearMap.get(y);
            const dataObj: any = { year: y, count: item.count, original: item.original, slug: item.slug };
            if (item.regionCounts) {
              Object.keys(item.regionCounts).forEach(slug => {
                dataObj[slug] = item.regionCounts[slug];
              });
            }
            chartData.push(dataObj);
          } else {
            const dataObj: any = {
              year: y,
              count: 0,
              original: `Year ${y}`,
              slug: ""
            };
            selectedRegions.forEach((reg: any) => {
              dataObj[reg.slug] = 0;
            });
            chartData.push(dataObj);
          }
        }
      }

      displayContent = (
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
                  const [bottom, top] = [Number(refAreaLeft), Number(refAreaRight)].sort((a, b) => a - b);
                  const bottomStr = bottom.toString();
                  const topStr = top.toString();

                  setFilterYearFrom(bottomStr);
                  setFilterYearTo(topStr);
                  setAppliedYearFrom(bottomStr);
                  setAppliedYearTo(topStr);
                }
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
                domain={['dataMin', 'dataMax']}
                tick={{ fill: '#666' }}
                tickCount={10}
                allowDataOverflow
              />
              <YAxis tick={{ fill: '#666' }} />
              <Tooltip
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#666', marginBottom: '0.5rem' }}
                labelFormatter={(label) => `Year: ${label}`}
              />
              {selectedRegions.length === 0 ? (
                <Area
                  type="monotone"
                  dataKey="count"
                  name="Count"
                  stroke="#4c6ef5"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorCount)"
                  animationDuration={300}
                />
              ) : (
                selectedRegions.map((reg: any, index: number) => {
                  const GRAPH_COLORS = [
                    "#4c6ef5", "#fa5252", "#82c91e", "#fcc419", "#be4bdb",
                    "#15aabf", "#fd7e14", "#40c057", "#fab005", "#7950f2",
                    "#e64980", "#12b886", "#1c7ed6", "#f03e3e", "#0ca678",
                    "#d9480f", "#5c940d", "#d6336c", "#ae3ec9", "#f59f00"
                  ];
                  const color = GRAPH_COLORS[index % GRAPH_COLORS.length];
                  return (
                    <Area
                      key={reg.slug}
                      type="monotone"
                      dataKey={reg.slug}
                      name={reg.value}
                      stroke={color}
                      strokeWidth={3}
                      fillOpacity={0.4}
                      fill={color}
                      animationDuration={300}
                    />
                  );
                })
              )}
              {refAreaLeft && refAreaRight ? (
                <ReferenceArea x1={refAreaLeft} x2={refAreaRight} strokeOpacity={0.3} fill="#4c6ef5" fillOpacity={0.3} />
              ) : null}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      );
    } else {
      displayContent = (
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
      );
    }

    facetContent = (
      <div key={slug}>

        {isYearFacet && (
          <FilterContainer style={{ flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label>Prefecture:</label>
              <Select
                value={filterPrefecture}
                onChange={(e) => setFilterPrefecture(e.target.value)}
              >
                <option value="">All Prefectures</option>
                {prefectures.map((p: any) => (
                  <option key={p.slug} value={p.slug}>{p.value}</option>
                ))}
              </Select>
            </div>

            {/*
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <label>Region:</label>
              <Select
                multiple
                value={filterRegions}
                onChange={(e) => {
                  const opts = e.target.options;
                  const selected = [];
                  for (let i = 0; i < opts.length; i++) {
                    if (opts[i].selected) {
                      selected.push(opts[i].value);
                    }
                  }
                  setFilterRegions(selected);
                }}
                style={{ height: '80px', minWidth: '150px' }}
              >
                {regions.map((r: any) => (
                  <option key={r.slug} value={r.slug}>{r.value}</option>
                ))}
              </Select>
            </div>
            */}

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
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
                  setAppliedYearFrom(filterYearFrom);
                  setAppliedYearTo(filterYearTo);
                }}
              >
                Apply Filter
              </Button>
            </div>

            <Button
              onClick={() => {
                setFilterYearFrom("");
                setFilterYearTo("");
                setAppliedYearFrom("");
                setAppliedYearTo("");
                setFilterPrefecture("");
                setFilterRegions([]);
              }}
              style={{ marginLeft: "auto" }}
            >
              Reset
            </Button>
          </FilterContainer>
        )}

        {displayContent}
      </div>
    );
  }

  return (
    <Layout>
      <Container containerType="wide">
        <ContentWrapper>
          <ContentStyled fullWidth>
            {/* Tab Navigation */}
            <TabsContainer>
              {METADATA_FACETS.map((facet: any) => (
                <TabButton
                  key={facet.slug}
                  active={activeTab === facet.slug}
                  onClick={() => {
                    setActiveTab(facet.slug);
                    setFilterYearFrom("");
                    setFilterYearTo("");
                    setAppliedYearFrom("");
                    setAppliedYearTo("");
                    setFilterPrefecture("");
                    setFilterRegions([]);
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

              {viewMode !== "graph" && (
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
              )}
            </Controls>

            {/* Content Area - Only one facet displayed at a time */}
            {facetContent}
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
