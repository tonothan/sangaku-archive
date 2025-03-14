import Masonry from "react-masonry-css";
import { styled } from "@styles/stitches";

const GridItem = styled("div", {
  paddingBottom: "$gr2",
  zIndex: "1",

  "@xxs": {
    paddingBottom: "$gr1",
  },

  "@xs": {
    paddingBottom: "$gr1",
  },

  "@sm": {
    paddingBottom: "$gr2",
  },

  "@md": {
    paddingBottom: "$gr2",
  },
});

const GridStyled = styled(Masonry, {
  display: "flex",
  width: "auto",
  position: "relative",
  padding: "$gr2 0",
  zIndex: "1",

  ".canopy-grid-column": {
    marginLeft: "$gr2",

    "@xxs": {
      marginLeft: "$gr1",
    },

    "@xs": {
      marginLeft: "$gr1",
    },

    "@sm": {
      marginLeft: "$gr2",
    },

    "@md": {
      marginLeft: "$gr2",
    },

    "&:first-child": {
      marginLeft: "0",
    },
  },
});

export { GridItem, GridStyled };
