import { styled } from "@styles/stitches";

const Content = styled("div", {
  padding: "$gr3 0 0",
});

const Placeholder = styled("div", {
  backgroundColor: "var(--gray-3)",
  width: "100%",
  height: "100%",
  overflowY: "hidden",
  borderRadius: "3px",
  transition: "$canopyAll",
});

const Wrapper = styled("div", {
  width: "250px",
  position: "flex",
  flexDirection: "column", 
  height: "auto",
  padding: "8px",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
  position: "relative",

  img: {
    width: "100%",
    height: "auto",
    maxHeight: "100%",
    objectFit: "contain",
  },

  a: {
    display: "flex",
    flexDirection: "column",
    width: "100%",
    color: "var(--gray-12)",
    textDecoration: "none !important",
    transition: "$canopyAll",

    [`&:hover, &:focus`]: {
      color: "var(--accent-11)",

      [`${Placeholder}`]: {
        transform: "scale3d(1.03, 1.03, 1.03)",
      },
    },
  },
});

export { Content, Placeholder, Wrapper };
