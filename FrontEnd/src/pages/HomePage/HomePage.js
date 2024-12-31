import React from "react";
import { NavBar, News } from "../../components";
import { Box, Typography } from "@mui/material";

function HomePage() {
  return (
	<>
	<NavBar/>
    <Box
      sx={{
        backgroundColor: "#f9f9ff",
        minHeight: "100vh",
        paddingTop: "80px", // Adjust for navbar height
        paddingX: { xs: 2, sm: 4, md: 8 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <News />
      </Box>
    </Box>
	</>
  );
}

export default HomePage;
