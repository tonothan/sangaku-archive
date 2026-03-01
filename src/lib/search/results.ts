import FACETS from "@.canopy/facets.json";
import INDEX from "@.canopy/index.json";
import MANIFESTS from "@.canopy/manifests.json";
import _ from "lodash";
import { getDocuments } from "@lib/search/documents";
import { getItem } from "@lib/search/response";

// @ts-nocheck

const getResults = (
  baseUrl: any,
  q: any,
  activeFacets: any,
  flexSearch: any,
  yearFrom?: number,
  yearTo?: number
) => {
  const documents = !q
    ? INDEX.map((doc) => doc.id)
    : getDocuments(q, flexSearch);

  const applyFacets = (activeFacets: any, yearDocs?: Set<number>) => {
    const docs = activeFacets.map((facet: any) => {
      // @ts-ignore
      const facetSource = FACETS.find(
        (entry) => entry.slug === facet.label
      );
      if (!facetSource) return [];

      const facetDocs = facet.values.flatMap((val: string) => {
        const found = facetSource.values.find((entry: any) => entry.slug === val);
        return found?.docs || [];
      });
      return Array.from(new Set(facetDocs));
    });

    if (yearDocs) {
      docs.push(Array.from(yearDocs));
    }

    return MANIFESTS.filter((item) =>
      docs.length > 0 ? _.intersection(...docs).includes(item.index) : true
    );
  };

  let yearDocs: Set<number> | undefined;
  if (yearFrom !== undefined || yearTo !== undefined) {
    yearDocs = new Set<number>();
    const yearFacet = FACETS.find((f: any) => f.label.includes("Year") || f.label.includes("年"));
    if (yearFacet) {
      yearFacet.values.forEach((v: any) => {
        const getYearFromValue = (val: string) => {
          const matches = val.match(/[0-9]{3,4}/g);
          if (matches && matches.length > 0) return parseInt(matches[matches.length - 1], 10);
          const parsed = parseInt(val);
          return isNaN(parsed) ? -1 : parsed;
        };
        const year = getYearFromValue(v.value);
        if (year !== -1) {
          const f = yearFrom !== undefined ? yearFrom : -Infinity;
          const t = yearTo !== undefined ? yearTo : Infinity;
          if (year >= f && year <= t) {
            v.docs.forEach((d: number) => yearDocs?.add(d));
          }
        } else {
          // If no year could be extracted but filtering is on, what should we do?
          // We could include it or omit it. Usually omit it on filtering.
        }
      });
    }
  }

  const items =
    activeFacets.length === 0 && !yearDocs ? MANIFESTS : applyFacets(activeFacets, yearDocs);

  // @ts-ignore
  return (documents as number[])
    .filter((doc: number) => items.some((item) => item.index === doc))
    .map((doc: number) => {
      const item = items.find((item) => item.index === doc);
      return getItem(item, baseUrl);
    });
};

export { getResults };
