import { Button as RadixThemesButton } from "@radix-ui/themes";
import { styled } from "@styles/stitches";

const ButtonStyled = styled(RadixThemesButton, {
  cursor: "pointer",
});

const ButtonWrapper = styled("div", {
  margin: "$gr4 0 0",
  display: "flex",
  flexWrap: "wrap",
  gap: "$gr3",

  [`> ${ButtonStyled}`]: {
    marginRight: 0,
  },
});

export { ButtonStyled, ButtonWrapper };
