import { styled } from "@styles/stitches";

const Controls = styled("div", {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "$gr3",
    padding: "$gr2",
    backgroundColor: "var(--gray-2)",
    borderRadius: "4px",
    flexWrap: "wrap",
    gap: "$gr2",
});

const ToggleGroup = styled("div", {
    display: "flex",
    gap: "$gr2",
    alignItems: "center",
});

const Button = styled("button", {
    padding: "$gr1 $gr2",
    border: "1px solid var(--gray-6)",
    borderRadius: "4px",
    backgroundColor: "var(--gray-1)",
    color: "var(--gray-12)",
    cursor: "pointer",
    fontSize: "$gr2",
    "&:hover": {
        backgroundColor: "var(--gray-3)",
    },
    variants: {
        active: {
            true: {
                backgroundColor: "var(--primary)",
                color: "var(--white)",
                borderColor: "var(--primary)",
            },
        },
    },
});

const GraphContainer = styled("div", {
    display: "flex",
    flexDirection: "column",
    gap: "$gr1",
    marginTop: "$gr3",
});

const GraphBar = styled("div", {
    display: "grid",
    gridTemplateColumns: "120px 1fr 40px", // Fixed width for labels ensures perfect alignment
    alignItems: "center",
    gap: "$gr3",
    fontSize: "$gr2",
    marginBottom: "$gr1",
});

const BarCheck = styled("div", {
    height: "24px", // Increased height for better visibility
    backgroundColor: "var(--indigo-9, #4c6ef5)", // Use --indigo-9 with a fallback hex blue
    borderRadius: "2px",
    transition: "width 0.5s ease-in-out",
    minWidth: "4px", // Ensure even small values are visible
});

const BarLabel = styled("div", {
    textAlign: "right",
    paddingRight: "$gr3",
    borderRight: "1px solid var(--gray-6)", // visual axis line
    color: "var(--gray-11)",
    fontWeight: "500",
});

const BarValue = styled("div", {
    fontSize: "$gr1",
    color: "var(--gray-11)",
});

const TabsContainer = styled("div", {
    display: "flex",
    flexWrap: "wrap",
    gap: "$gr2",
    marginBottom: "$gr3",
    borderBottom: "1px solid var(--gray-6)",
    paddingBottom: "$gr2",
});

const TabButton = styled("button", {
    padding: "$gr2 $gr3",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "$gr3",
    color: "var(--gray-11)",
    borderBottom: "2px solid transparent",
    transition: "all 0.2s ease",
    fontWeight: "500",

    "&:hover": {
        color: "var(--primary-11)", // Assuming primary color token exists
        backgroundColor: "var(--gray-3)",
        borderRadius: "4px 4px 0 0",
    },

    variants: {
        active: {
            true: {
                color: "var(--primary-11)",
                borderBottom: "2px solid var(--primary-9)",
            },
        },
    },
});

export {
    Controls,
    ToggleGroup,
    Button,
    GraphContainer,
    GraphBar,
    BarCheck,
    BarLabel,
    BarValue,
    TabsContainer,
    TabButton
};
