import React from "react";
import dynamic from "next/dynamic";
import { styled } from "@src/styles/stitches";

const CloverViewer: React.ComponentType<{
  customTheme: any;
  iiifContent: string;
  options: any;
}> = dynamic(
  () => import("@samvera/clover-iiif").then((Clover) => Clover.Viewer),
  {
    ssr: false,
  }
);

const customTheme = {
  fonts: {
    sans: `var(--canopy-sans-font)`,
    display: `var(--canopy-display-font)`,
  },
};

const defaultOptions = {
  canvasBackgroundColor: "var(--gray-3)",
  canvasHeight: `900px`,
  openSeadragon: {
    gestureSettingsMouse: {
      scrollToZoom: true,
    },
  },
  informationPanel: {
    open: true,
    renderAbout: true,
    renderToggle: true,
  },
  showTitle: true,
  showIIIFBadge: true,
};

const Viewer = ({
  iiifContent,
  options,
}: {
  iiifContent: string;
  options?: any;
}) => (
  <StyledCloverViewer>
    <CloverViewer
      iiifContent={iiifContent}
      options={{ ...defaultOptions, ...options }}
      customTheme={customTheme}
    />
  </StyledCloverViewer>
);

const StyledCloverViewer = styled("div", {
  ".clover-viewer-header": {
    "span.label": {
      fontSize: "$gr3",
    },
    "& button": {
      backgroundColor: "var(--gray-1)",

      "> span[data-testid=select-button-value]": {
        fontSize: "$gr3",
      },
    },
  },
});

export default Viewer;
