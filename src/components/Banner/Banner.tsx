const Banner = () => {
  return (
    <div style={{
      width: "100%",
      height: "300px",
      backgroundImage: "url('https://tonothan.github.io/mock-banner.jpg')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "2rem"
    }}>
      <h1>Welcome to My IIIF Archive</h1>
    </div>
  );
};

export default Banner;
