import * as Accordion from "@radix-ui/react-accordion";
import { Flex } from "@radix-ui/themes";
import { ButtonStyled } from "../Shared/Button/Button.styled";
import FACETS from "@.canopy/facets.json";
import Facet from "./Facet";
import { LocaleString } from "@hooks/useLocale";
import React, { useEffect } from "react";
import { useFacetsState } from "@context/facets";
import { useRouter } from "next/router";
import { useCanopyState } from "@src/context/canopy";

const FacetsSidebar = () => {
    const { facetsState, facetsDispatch } = useFacetsState();
    const { canopyState } = useCanopyState();
    const { searchParams } = canopyState;
    const { facetsActive } = facetsState;
    const router = useRouter();

    useEffect(() => {
        facetsDispatch({
            type: "updateFacetsActive",
            facetsActive: searchParams,
        });
    }, [searchParams, facetsDispatch]);

    const handleClearAll = () => {
        FACETS.forEach((facet: any) => facetsActive.delete(facet.slug));
        facetsActive.delete("year_from");
        facetsActive.delete("year_to");
        facetsDispatch({
            type: "updateFacetsActive",
            facetsActive: facetsActive,
        });
        handleViewResults();
    };

    const handleViewResults = () => {
        router.push({ pathname: "/search", query: facetsActive.toString() });
    };

    return (
        <div style={{ padding: "0 16px 16px 0", borderRight: "1px solid var(--gray-4)", height: "100%" }}>
            <header style={{ marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 600, color: "var(--gray-12)" }}>
                    {LocaleString("searchFilter")}
                </h3>
            </header>
            <div>
                <Accordion.Root type="multiple">
                    {FACETS.filter((facet: any) => !facet.label.includes("Region")).map((facet: any) => (
                        <Facet {...facet} key={facet.slug} />
                    ))}
                </Accordion.Root>
            </div>
            <Flex mt="5" style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
                <ButtonStyled onClick={handleViewResults} style={{ width: "100%" }}>
                    {LocaleString("searchFilterSubmit")}
                </ButtonStyled>
                <ButtonStyled variant="soft" onClick={handleClearAll} style={{ width: "100%" }}>
                    {LocaleString("searchFilterClear")}
                </ButtonStyled>
            </Flex>
        </div>
    );
};

export default FacetsSidebar;
