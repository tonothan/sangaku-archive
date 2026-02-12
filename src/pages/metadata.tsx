import {
  BarCheck,
  BarLabel,
  BarValue,
  Button,
  Controls,
  GraphBar,
  GraphContainer,
  TabButton,
  TabsContainer,
  ToggleGroup,
} from "@styles/Metadata.styled";
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
                  onClick={() => setActiveTab(facet.slug)}
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

              const maxCount = Math.max(...values.map(v => v.doc_count));

              return (
                <div key={slug}>
                  <Heading as="h2">{label}</Heading>

                  {viewMode === "list" ? (
                    <ul style={{ padding: "0" }}>
                      {sortedValues.map((value) => (
                        <MetadataItem {...value} path={path} key={value.slug} />
                      ))}
                    </ul>
                  ) : (
                    <GraphContainer>
                      {sortedValues.map((value) => (
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
