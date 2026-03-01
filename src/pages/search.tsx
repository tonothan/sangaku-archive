import React, { useEffect, useState } from "react";

import Container from "@components/Shared/Container";
import Facets from "@components/Facets/Facets";
import FacetsSidebar from "@components/Facets/Sidebar";
import { FacetsProvider } from "@context/facets";
import Layout from "@components/layout";
import { LocaleString } from "@hooks/useLocale";
import { SearchHeaderStyled } from "@components/Search/Header.styled";
import { SearchLayout, SearchSidebarWrapper, SearchFacetsModalWrapper } from "@components/Search/Search.styled";
import SearchResults from "@components/Search/Results";
import ActiveFilters from "@components/Facets/ActiveFilters";
import { Summary } from "@samvera/clover-iiif/primitives";
import { Text } from "@radix-ui/themes";
import { searchRequest } from "@lib/search/request";
import { useCanopyState } from "@context/canopy";
import { useSearchParams } from "next/navigation";

const Search = () => {
  const searchParams = useSearchParams();

  const [pages, setPages] = useState<string[]>([]);
  const [params, setParams] = useState<URLSearchParams>();

  const searchHeaderRef = React.useRef<HTMLDivElement>(null);

  const {
    canopyDispatch,
    canopyState: { config, searchSummary },
  } = useCanopyState();

  useEffect(() => {
    setPages([]);
    setParams(new URLSearchParams(searchParams.toString()));
  }, [searchParams]);

  useEffect(() => {
    if (typeof params !== "undefined") {
      canopyDispatch({
        searchParams: params,
        type: "updateSearchParams",
      });

      const flexSearch = config?.search?.flexSearch;
      const baseUrl = config?.baseUrl;

      const { items, summary } = searchRequest({
        params,
        baseUrl,
        flexSearch,
      });

      setPages(items.map((item: any) => item.id));
      summary &&
        canopyDispatch({
          type: "updateSearchSummary",
          searchSummary: summary,
        });
    }
  }, [params, config, canopyDispatch]);

  return (
    <Layout>
      <FacetsProvider>
        <SearchHeaderStyled ref={searchHeaderRef}>
          <SearchFacetsModalWrapper>
            <Facets />
          </SearchFacetsModalWrapper>
          <Container containerType="wide">
            {searchSummary && (
              <Text id="canopy-search-summary">
                <Summary summary={searchSummary} />{" "}
                {LocaleString("searchResults")}
              </Text>
            )}
          </Container>
        </SearchHeaderStyled>

        <Container containerType="wide">
          <SearchLayout>
            <SearchSidebarWrapper>
              <FacetsSidebar />
            </SearchSidebarWrapper>
            <main style={{ flexGrow: 1, minWidth: 0 }}>
              <ActiveFilters />
              <SearchResults pages={pages} query={params} />
            </main>
          </SearchLayout>
        </Container>
      </FacetsProvider>
    </Layout>
  );
};

export async function getStaticProps() {
  const pageTitle = "Search";

  return {
    props: { pageTitle },
  };
}

export default Search;
