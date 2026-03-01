import { styled } from "@styles/stitches";

const SearchForm = styled("form", {
  cursor: "select",
  margin: "0 $gr4",
  width: "100%",

  "@sm": {
    width: "calc(100% - ($gr4 * 2))",
  },

  "@xs": {
    margin: "0 $gr3",
    width: "calc(100% - ($gr3 * 2))",
  },

  "&:focus-within": {
    svg: {
      color: "var(--accent-11)",
    },
  },
});

const SearchLayout = styled("div", {
  display: "flex",
  gap: "32px",
  alignItems: "flex-start",
  paddingBottom: "32px",

  "@sm": {
    gap: "0",
  },
});

const SearchSidebarWrapper = styled("aside", {
  width: "240px",
  flexShrink: 0,
  position: "sticky",
  top: "100px", // to make space for header
  maxHeight: "calc(100vh - 120px)",
  overflowY: "auto",
  paddingRight: "$gr2",
  paddingBottom: "$gr4",

  "@sm": {
    display: "none",
  },
});

const SearchFacetsModalWrapper = styled("div", {
  display: "none",

  "@sm": {
    display: "block",
  },
});

export { SearchForm, SearchLayout, SearchSidebarWrapper, SearchFacetsModalWrapper };
