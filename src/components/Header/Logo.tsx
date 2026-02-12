import React from "react";
import { styled } from "@styles/stitches";

const LogoWrapper = styled("div", {
    display: "flex",
    alignItems: "center",
    height: "40px",
    "& svg": {
        height: "100%",
        width: "auto",
    },
});

const Logo = () => {
    return (
        <LogoWrapper>
            {/* Placeholder SVG Logo - Replace with actual logo.png/svg later */}
            <svg
                viewBox="0 0 200 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Sangaku Archive Logo"
            >
                <text
                    x="0"
                    y="30"
                    fontSize="24"
                    fontWeight="bold"
                    fill="var(--gray-12)"
                    fontFamily="sans-serif"
                >
                    算額アーカイブ
                </text>
            </svg>
        </LogoWrapper>
    );
};

export default Logo;
