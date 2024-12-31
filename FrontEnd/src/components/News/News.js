import React, { useState } from "react";
import { getAIResponse } from "../api/openai"; // Adjust the import path as needed
import { useSelector } from "react-redux";
import { Container } from "@mui/system";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  List,
  ListItem,
  ListItemText,
  TextField,
  CircularProgress,
} from "@mui/material";
import InfiniteScroll from "react-infinite-scroll-component";
import Loading from "../Loading/Loading";
import NoDataFound from "../NoDataFound/NoDataFound";
import "./News.css";


function News({ personalized, handleShowSidebar }) {
  const { articles, status, filters } = useSelector((state) => state.articles);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // AI section state
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [loadingAi, setLoadingAi] = useState(false);

  const heading = personalized
    ? "Personalized News"
    : filters.query || filters.category || "Top News";

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleAiSubmit = async () => {
    if (!aiPrompt) return;
    setLoadingAi(true);
    try {
      const response = await getAIResponse(aiPrompt); // This should work now
      setAiResponse(response);
    } catch (error) {
      console.error("Error generating AI response:", error);
      setAiResponse("Sorry, there was an error generating the news.");
    } finally {
      setLoadingAi(false);
    }
  };
  const renderSidebar = () => (
    <Box
      sx={{
        width: "100%",
        padding: 2,
        background: "#f9f9ff",
        borderRadius: "10px",
        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
        margin: "10px 0",
      }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Typography variant="h6" gutterBottom sx={{ color: "#6f42c1" }}>
        Recommended Titles
      </Typography>
      <List>
        {articles.slice(0, 10).map((article, index) => (
          <ListItem
            button
            key={index}
            sx={{
              background: "#fff",
              margin: "5px 0",
              borderRadius: "5px",
              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
            }}
          >
            <ListItemText
              primary={article.title}
              primaryTypographyProps={{
                style: { fontSize: "0.9rem", color: "#333" },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Stack on mobile, row on larger screens
        minHeight: "100vh", // Ensures full height of the page
        padding: 0,
      }}
    >
      {/* Left Sidebar - AI Section */}
      <Box
        sx={{
          flex: { xs: "1", md: "1" },
          padding: 2,
          backgroundColor: "#f9f9ff",
          borderRadius: "10px",
          boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
          marginBottom: { xs: "20px", md: "0" }, // Add space below on small screens
        }}
      >
        <Typography variant="h6" sx={{ color: "#6f42c1", marginBottom: 2 }}>
          AI Text Generator
        </Typography>
        <TextField
          label="Enter Prompt"
          variant="outlined"
          fullWidth
          value={aiPrompt}
          onChange={(e) => setAiPrompt(e.target.value)}
          sx={{ marginBottom: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleAiSubmit}
          sx={{
            backgroundColor: "#6f42c1",
            color: "#fff",
            width: "100%",
            padding: "10px",
          }}
          disabled={loadingAi || !aiPrompt}
        >
          {loadingAi ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Generate"
          )}
        </Button>
        {aiResponse && (
          <Box
            sx={{
              marginTop: 2,
              padding: 2,
              backgroundColor: "#fff",
              borderRadius: "8px",
            }}
          >
            <Typography variant="body2">{aiResponse}</Typography>
          </Box>
        )}
      </Box>

      {/* Centered Article List */}
      <Box
        sx={{
          flex: { xs: "1", md: "3" }, // Main content takes more space on larger screens
          marginRight: { xs: 0, md: 2 },
        }}
      >
        <Typography
          variant="h5"
          component="h5"
          sx={{
            margin: "20px 0",
            textAlign: "center",
            color: "#6f42c1",
            textTransform: "capitalize",
            fontWeight: "bold",
          }}
        >
          TOP {heading} News
        </Typography>

        {status === "loading" ? (
          <Loading />
        ) : articles.length === 0 ? (
          <NoDataFound />
        ) : (
          <InfiniteScroll
            dataLength={articles.length}
            next={() => {}} // Add logic for fetching more articles here
            hasMore={false} // Update to true if implementing infinite scroll
            loader={<Loading />}
          >
            {articles.map((article, index) => (
              <Card
                key={index}
                sx={{
                  marginBottom: 3,
                  backgroundColor: "#fff",
                  borderRadius: "10px",
                  boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
                }}
              >
                <CardMedia
                  component="img"
                  height="300"
                  image={article.imgSrc}
                  alt={article.title}
                />
                <CardContent>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ color: "#6f42c1" }}
                  >
                    {article.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ marginBottom: 1 }}
                  >
                    {article.description?.substr(0, 150)}...
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", marginBottom: 1 }}
                  >
                    Published by {article.source} on {article.publishedAt}
                  </Typography>
                  <Button
                    size="small"
                    variant="contained"
                    href={article.url}
                    target="_blank"
                    sx={{ mt: 1, background: "#6f42c1", color: "#fff" }}
                  >
                    Read More
                  </Button>
                </CardContent>
              </Card>
            ))}
          </InfiniteScroll>
        )}
      </Box>

      {/* Right Sidebar - Recommended Titles */}
      <Box
        sx={{
          flex: { xs: "1", md: "1" },
          borderLeft: "1px solid #ddd",
          paddingLeft: 2,
          display: { xs: "none", md: "block" },
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: "#6f42c1" }}>
          Recommended Titles
        </Typography>
        <List>
          {articles.slice(0, 10).map((article, index) => (
            <ListItem
              button
              key={index}
              sx={{
                background: "#fff",
                margin: "5px 0",
                borderRadius: "5px",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              }}
            >
              <ListItemText
                primary={article.title}
                primaryTypographyProps={{
                  style: { fontSize: "0.9rem", color: "#333" },
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Container>
  );
}

export default News;
