import { globalCss } from "@stitches/react";

export const rem = 20;
export const headerHeight = 60.533333;

const defaults = {
  body: {
    margin: 0,
    padding: 0,
    backgroundColor: "$panelBackground", 
    color: "$text", 
  },

  html: {
    fontFamily: "$sans",
    fontSize: `${rem}px`,
    fontWeight: "500",
    fontSmooth: "always",
    webKitFontSmothing: "antialiased",
    mozOsxFontSmoth: "grayscale",
    paddingTop: `${headerHeight}px`,
    backgroundColor: "$panelBackground",
  },

  "ul, ol": {
    li: {
      paddingBottom: "$gr1",
    },
  },

  dl: {
    dt: {
      fontWeight: "400",
    },
    dd: {
      marginInlineStart: "0",
      paddingBottom: "$gr4",
      lineHeight: "1.47em",
    },
  },
};

const globalStyles = globalCss({
  ":root": {
    "--color-background": "#edf6f8",
});

export default globalStyles;
