import React, { ReactNode } from "react";

import Footer from "./Footer/Footer";
import Header from "@components/Header/Header";
import Main from "./Shared/Main";
import { useTheme } from "next-themes";

const Layout = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();

  // define Clover IIIF colors for @radix-ui/themes variables
  const cloverColors =
    theme === "dark"
      ? {
        accent: "var(--accent-9)",
        accentAlt: "var(--accent-a3)",
        primary: "var(--gray-1)",
        secondary: "var(--gray-12)",
      }
      : {
        accent: "var(--accent-11)",
        accentAlt: "var(--accent-a12)",
        primary: "var(--gray-12)",
        secondary: "var(--gray-1)",
      };

  return (
    <div
      style={
        {
          "--colors-accent": cloverColors.accent,
          "--colors-accentAlt": cloverColors.accentAlt,
          "--colors-accentMuted": cloverColors.accent,
          "--colors-primary": cloverColors.primary,
          "--colors-primaryAlt": cloverColors.primary,
          "--colors-primaryMuted": cloverColors.primary,
          "--colors-secondary": cloverColors.secondary,
          "--colors-secondaryAlt": cloverColors.secondary,
          "--colors-secondaryMuted": cloverColors.secondary,
        } as React.CSSProperties
      }
    >
      <Header />
      <Main>{children}</Main>
      <Footer />
    </div>
  );
};

export default Layout;
