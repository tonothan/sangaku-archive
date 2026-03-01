import {
  FacetsFacetActivate,
  FacetsFacetContent,
  FacetsFacetHeader,
  FacetsFacetStyled,
} from "./Facet.styled";
import React, { useEffect, useState } from "react";

import { ChevronDownIcon } from "@radix-ui/react-icons";
import { Slider, Flex, TextField } from "@radix-ui/themes";
import FacetsOption from "./Option";
import { LocaleString } from "@hooks/useLocale";
import { useFacetsState } from "@context/facets";

interface FacetsFacetProps {
  label: string;
  slug: string;
  values: any;
}

export const FacetsFacet: React.FC<FacetsFacetProps> = ({
  label,
  slug,
  values,
}) => {
  const { facetsState, facetsDispatch } = useFacetsState();
  const { facetsActive } = facetsState;

  const params = facetsActive?.toString();
  const defaultValue = {
    slug: "",
    value: LocaleString("searchFilterAny"),
  };

  const [activeSlugs, setActiveSlugs] = useState<string[]>([]);

  const isYearFacet = label.includes("Year") || label.includes("年");

  const getYearFromValue = (val: string) => {
    const matches = val.match(/[0-9]{3,4}/g);
    if (matches && matches.length > 0) return parseInt(matches[matches.length - 1], 10);
    const parsed = parseInt(val);
    return isNaN(parsed) ? -1 : parsed;
  };

  const years = isYearFacet ? values.map((v: any) => getYearFromValue(v.value)).filter((y: number) => y !== -1) : [];
  const minYear = isYearFacet && years.length > 0 ? Math.min(...years) : 1700;
  const maxYear = isYearFacet && years.length > 0 ? Math.max(...years) : 1900;

  const [yearRange, setYearRange] = useState([minYear, maxYear]);
  const [inputFrom, setInputFrom] = useState<number | string>(minYear);
  const [inputTo, setInputTo] = useState<number | string>(maxYear);

  // Sync state with URL params
  useEffect(() => {
    const getParam = (paramName: string) => {
      return typeof facetsActive?.get === 'function' ? facetsActive.get(paramName) : undefined;
    };

    const getAllParams = (paramName: string) => {
      return typeof facetsActive?.getAll === 'function' ? facetsActive.getAll(paramName) : [];
    };

    if (isYearFacet) {
      const yearFromParam = getParam("year_from");
      const yearToParam = getParam("year_to");
      const yFrom = yearFromParam ? parseInt(yearFromParam, 10) : minYear;
      const yTo = yearToParam ? parseInt(yearToParam, 10) : maxYear;
      setYearRange([yFrom, yTo]);
      setInputFrom(yFrom);
      setInputTo(yTo);
    } else {
      const slugsArray = getAllParams(slug);
      setActiveSlugs(slugsArray);
    }
  }, [facetsActive, params, slug, values, isYearFacet, minYear, maxYear]);

  const handleYearChange = (newRange: number[]) => {
    setYearRange(newRange);
    setInputFrom(newRange[0]);
    setInputTo(newRange[1]);
  };

  const handleYearCommit = (newRange: number[]) => {
    if (typeof facetsActive?.delete !== 'function') return;

    facetsActive.delete("year_from");
    facetsActive.delete("year_to");
    facetsActive.append("year_from", newRange[0].toString());
    facetsActive.append("year_to", newRange[1].toString());

    facetsDispatch({
      type: "updateFacetsActive",
      facetsActive: facetsActive,
    });
  };

  return (
    <FacetsFacetStyled value={slug}>
      <FacetsFacetHeader asChild>
        <FacetsFacetActivate>
          <span>
            {label} <ChevronDownIcon />
          </span>
          {isYearFacet ? (
            <span>{yearRange[0]} - {yearRange[1]}</span>
          ) : (
            <span>
              {activeSlugs.length === 0 ? defaultValue.value : (
                activeSlugs.length === 1 ? values.find((entry: any) => entry.slug === activeSlugs[0])?.value : `${activeSlugs.length} selected`
              )}
            </span>
          )}
        </FacetsFacetActivate>
      </FacetsFacetHeader>
      <FacetsFacetContent>
        {isYearFacet ? (
          <div style={{ padding: "16px 8px" }}>
            <Slider
              min={minYear}
              max={maxYear}
              step={1}
              value={yearRange}
              onValueChange={handleYearChange}
              onValueCommit={handleYearCommit}
            />
            <Flex justify="between" mt="3" gap="4">
              <TextField.Root
                type="number"
                size="1"
                min={minYear}
                max={yearRange[1]}
                value={inputFrom}
                onChange={(e) => setInputFrom(e.target.value)}
                onBlur={() => {
                  const val = parseInt(inputFrom as string, 10);
                  const newFrom = !isNaN(val) ? Math.max(minYear, Math.min(val, yearRange[1])) : minYear;
                  setInputFrom(newFrom);
                  handleYearChange([newFrom, yearRange[1]]);
                  handleYearCommit([newFrom, yearRange[1]]);
                }}
                style={{ width: "80px" }}
              />
              <TextField.Root
                type="number"
                size="1"
                min={yearRange[0]}
                max={maxYear}
                value={inputTo}
                onChange={(e) => setInputTo(e.target.value)}
                onBlur={() => {
                  const val = parseInt(inputTo as string, 10);
                  const newTo = !isNaN(val) ? Math.min(maxYear, Math.max(val, yearRange[0])) : maxYear;
                  setInputTo(newTo);
                  handleYearChange([yearRange[0], newTo]);
                  handleYearCommit([yearRange[0], newTo]);
                }}
                style={{ width: "80px" }}
              />
            </Flex>
          </div>
        ) : (
          <div style={{ maxHeight: "300px", overflowY: "auto", overflowX: "hidden", paddingRight: "8px" }}>
            {values.map((option: any, index: number) => {
              const identifier = `${slug}-${option.slug}-${index}`;
              return (
                <FacetsOption
                  active={activeSlugs.includes(option.slug)}
                  facet={slug}
                  key={identifier}
                  identifier={identifier}
                  option={option}
                />
              );
            })}
          </div>
        )}
      </FacetsFacetContent>
    </FacetsFacetStyled>
  );
};

export default FacetsFacet;
