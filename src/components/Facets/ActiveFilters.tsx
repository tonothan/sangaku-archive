import React from "react";
import { Flex, Badge, IconButton } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useFacetsState } from "@context/facets";
import FACETS from "@.canopy/facets.json";
import { useRouter } from "next/router";

const ActiveFilters = () => {
    const { facetsState, facetsDispatch } = useFacetsState();
    const { facetsActive } = facetsState;
    const router = useRouter();

    const getActiveSlugsText = () => {
        const activeTags: { type: string; label: string; value: string; slug: string; facetSlug: string }[] = [];

        if (!facetsActive || typeof facetsActive.getAll !== "function") return activeTags;

        FACETS.forEach((facet: any) => {
            const slugsArray = facetsActive.getAll(facet.slug);
            if (slugsArray && slugsArray.length > 0) {
                slugsArray.forEach((activeSlug: string) => {
                    const option = facet.values.find((val: any) => val.slug === activeSlug);
                    if (option) {
                        activeTags.push({
                            type: "term",
                            label: facet.label,
                            value: option.value,
                            slug: activeSlug,
                            facetSlug: facet.slug,
                        });
                    }
                });
            }
        });

        return activeTags;
    };

    const getYearRange = () => {
        const yearFrom = typeof facetsActive?.get === "function" ? facetsActive.get("year_from") : undefined;
        const yearTo = typeof facetsActive?.get === "function" ? facetsActive.get("year_to") : undefined;

        if (yearFrom || yearTo) {
            return {
                from: yearFrom,
                to: yearTo,
            };
        }
        return null;
    };

    const activeTags = getActiveSlugsText();
    const yearRange = getYearRange();

    if (activeTags.length === 0 && !yearRange) return null;

    const handleRemoveTag = (type: string, paramSlug?: string, facetSlug?: string) => {
        if (type === "year") {
            facetsActive.delete("year_from");
            facetsActive.delete("year_to");
        } else if (type === "term" && paramSlug && facetSlug) {
            const allValues = facetsActive.getAll(facetSlug);
            facetsActive.delete(facetSlug);
            allValues.forEach((val: string) => {
                if (val !== paramSlug) {
                    facetsActive.append(facetSlug, val);
                }
            });
        }

        facetsDispatch({
            type: "updateFacetsActive",
            facetsActive: facetsActive,
        });

        router.push({ pathname: "/search", query: facetsActive.toString() });
    };

    const handleClearAll = () => {
        FACETS.forEach((facet: any) => facetsActive.delete(facet.slug));
        facetsActive.delete("year_from");
        facetsActive.delete("year_to");

        facetsDispatch({
            type: "updateFacetsActive",
            facetsActive: facetsActive,
        });

        router.push({ pathname: "/search", query: facetsActive.toString() });
    };

    return (
        <Flex wrap="wrap" gap="2" mb="4" align="center" style={{ marginTop: "16px" }}>
            {yearRange?.from && yearRange?.to && (
                <Badge size="2" color="indigo" radius="full">
                    Year: {yearRange.from} - {yearRange.to}
                    <IconButton
                        size="1"
                        variant="ghost"
                        radius="full"
                        color="indigo"
                        onClick={() => handleRemoveTag("year")}
                        style={{ marginLeft: "4px", padding: 0, height: "16px", width: "16px", cursor: "pointer" }}
                    >
                        <Cross2Icon />
                    </IconButton>
                </Badge>
            )}

            {activeTags.map((tag, index) => (
                <Badge key={`${tag.slug}-${tag.facetSlug}-${index}`} size="2" color="indigo" radius="full">
                    {tag.label}: {tag.value}
                    <IconButton
                        size="1"
                        variant="ghost"
                        radius="full"
                        color="indigo"
                        onClick={() => handleRemoveTag("term", tag.slug, tag.facetSlug)}
                        style={{ marginLeft: "4px", padding: 0, height: "16px", width: "16px", cursor: "pointer" }}
                    >
                        <Cross2Icon />
                    </IconButton>
                </Badge>
            ))}

            <Badge
                size="2"
                color="gray"
                radius="full"
                variant="surface"
                style={{ cursor: "pointer", paddingRight: "10px", paddingLeft: "10px" }}
                onClick={handleClearAll}
            >
                Clear all
            </Badge>
        </Flex>
    );
};

export default ActiveFilters;
