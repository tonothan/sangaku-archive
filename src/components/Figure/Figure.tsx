import { Flex, Spinner, Text } from "@radix-ui/themes";
import { Image, Wrapper } from "@components/Figure/Figure.styled";
import React, { useCallback, useEffect, useRef, useState } from "react";

import clsx from "clsx";
import { getResourceImage } from "@hooks/getResourceImage";

interface FigureProps {
  alt: string;
  resource: any;
  region?: string;
  size?: string;
  isCover?: boolean;
}

const MAX_RETRIES = 5;

const Figure: React.FC<FigureProps> = ({
  alt,
  resource,
  region = "full",
  size = "400,",
  isCover = false,
}) => {
  const [image, setImage] = useState<string>();
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    let baseImage = getResourceImage(resource, size, region);
    if (retryCount > 0) {
      baseImage += `?retry=${Date.now()}`;
    }
    setImage(baseImage);
    setLoaded(false);
    setError(false);
  }, [region, resource, size, retryCount]);

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRIES) {
      setTimeout(() => setRetryCount((prev) => prev + 1), 1500);
    } else {
      setError(true);
      setLoaded(false);
    }
  }, [retryCount]);

  return (
    <Wrapper style={{ position: "relative" }}>
      {!loaded && !error && (
        <Flex
          align="center"
          justify="center"
          style={{ width: "100%", height: "100%", position: "absolute", zIndex: 0 }}
        >
          <Spinner size="3" />
        </Flex>
      )}

      {error && (
        <Flex
          align="center"
          justify="center"
          style={{ width: "100%", height: "100%", position: "absolute", zIndex: 0 }}
        >
          <Text size="2" color="gray">
            Image unavailable
          </Text>
        </Flex>
      )}

      {!error && (
        <Image
          alt={alt}
          src={image}
          ref={imgRef}
          style={
            {
              ...(isCover
                ? {
                    objectFit: "cover",
                    objectPosition: "50% 50%",
                    width: "100%",
                    height: "100%",
                  }
                : {}),
               opacity: loaded ? 1 : 0,
               transition: "opacity 0.3s"
            }
          }
          onLoad={() => {
            setLoaded(true);
            setError(false);
          }}
          onError={handleError}
          className={clsx("source", loaded && "loaded")}
        />
      )}
    </Wrapper>
  );
};

export default Figure;
