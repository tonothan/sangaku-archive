import FACETS from "@.canopy/facets.json";

export const getActiveFacets = (searchParams: URLSearchParams) => {
  return FACETS.map((facet: any) => facet.slug)
    .filter((key: string) => searchParams.has(key))
    .map((key: string) => {
      const values = searchParams.getAll(key);
      return {
        label: key,
        values: values,
      };
    });
};
