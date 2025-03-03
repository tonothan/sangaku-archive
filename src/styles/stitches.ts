import { fontSizes, fonts, media, sizes, transitions } from "@styles/theme";

import { createStitches } from "@stitches/react";

export const theme = {
  fontSizes: { ...fontSizes },
  fonts: { ...fonts },
  sizes: { ...sizes },
  space: { ...sizes },
  transitions: { ...transitions },
};

export const { styled, css, keyframes, createTheme } = createStitches({
  theme,
  media,
});

export const darkTheme = createTheme({
  colors: {
    background: "#252d5c",
    text: "#8d8f96",
  },
});
