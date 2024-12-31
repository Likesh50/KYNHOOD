import React, { useState } from "react";
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
  CircularProgress,
} from "@mui/material";
import "./News.css";

function News({ personalized, handleShowSidebar }) {
  const { articles, status, filters } = useSelector((state) => state.articles);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 10;

  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const paginatedArticles = articles.slice(
    (currentPage - 1) * articlesPerPage,
    currentPage * articlesPerPage
  );

  const heading = personalized
    ? "Personalized News"
    : filters.query || filters.category || "Top News";

  const handlePageChange = (direction) => {
    if (direction === "next" && currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    } else if (direction === "prev" && currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        minHeight: "100vh",
        padding: 0,
      }}
    >
      {/* Centered Article List */}
      <Box
        sx={{
          flex: { xs: "1", md: "3" },
          marginRight: { xs: 0, md: 2 },
        }}
      >
        {status === "loading" ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
            }}
          >
            <CircularProgress size={60} thickness={5} />
          </Box>
        ) : paginatedArticles.length === 0 ? (
          <p>No articles found.</p>
        ) : (
          <>
            {paginatedArticles.map((article, index) => (
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

            {/* Pagination Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginTop: 5,
                marginBottom: 3,
              }}
            >
              <Button
                disabled={currentPage === 1}
                onClick={() => handlePageChange("prev")}
                sx={{
                  marginRight: 2,
                  background: "#6f42c1",
                  color: "#fff",
                  "&:disabled": { background: "#ccc" },
                }}
              >
                Previous
              </Button>
              <Typography variant="body2" style={{ color: "grey" }}>
                Page {currentPage} of {totalPages}
              </Typography>
              <Button
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange("next")}
                sx={{
                  marginLeft: 2,
                  background: "#6f42c1",
                  color: "#fff",
                  "&:disabled": { background: "#ccc" },
                }}
              >
                Next
              </Button>
            </Box>
          </>
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
