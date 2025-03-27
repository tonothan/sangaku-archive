export const dm_sans = "DM Sans, sans-serif";
export const dm_serif_display = "DM Serif Display, serif";

export const GoogleFontImport = () => (
  <>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      rel="preconnect"
      href="https://fonts.gstatic.com"
      crossOrigin="anonymous"
    />
    <link
      href="https://fonts.googleapis.com/css2?family=Jost:wght@300;400;500;700&display=swap"
      rel="stylesheet"
    ></link>
  </>
);

const sans = `var(--canopy-sans-font)`;


const fonts = {
  sans,
};

export default fonts;
