import { styled } from "@styles/stitches";

const BannerStyled = styled("div", {
  width: "100%",
  backgroundImage: "url('/images/sangaku-archive-banner_20250417.png')",
  backgroundSize: "cover", // Changed to cover to fill the area, or contain if aspect ratio is preserved
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center center",
  height: "300px",

  "@lg": {
    height: "250px",
  },

  "@md": {
    height: "200px",
  },

  "@sm": {
    height: "150px",
    backgroundSize: "contain",
  },

  "@xs": {
    height: "120px",
  },
});

export { BannerStyled };
