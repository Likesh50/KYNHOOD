const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const { google } = require("googleapis");
const axios = require("axios");
const app = express();
const PORT = 5000;
const bcrypt = require("bcryptjs");
const puppeteer = require("puppeteer");
const nodemailer = require("nodemailer");
const cron = require("node-cron");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'srv1639.hstgr.io',
  user: 'u347524458_developer',
  password: 'Alamatn@24',
  database: 'u347524458_alamatn',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


db.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
  } else {
    console.log("Connected to MySQL database");
  }
});

const GEMINI_API_KEY = "AIzaSyAdFW-tfACDH3xlRiB2TFir0RZpm9-RxCc"; 
const GEMINI_API_URL = "https://gemini.googleapis.com/v1beta1/summarizeText";
const API_KEY = "AIzaSyA82SaGxS6_wXEffifV_QSopjWrk0EPJlA";

async function getVideoCaptions(videoId) {
  try {
    const youtube = google.youtube({
      version: "v3",
      auth: API_KEY,
    });

  
    const captionsResponse = await youtube.captions.list({
      part: "snippet",
      videoId: videoId,
    });

    const captions = captionsResponse.data.items;
    if (!captions || captions.length === 0) {
      throw new Error("No captions available for this video.");
    }

   
    const captionId = captions[0].id;

 
    const captionDetails = await youtube.captions.download({
      id: captionId,
    });

    return captionDetails.data;
  } catch (error) {
    console.error("Error fetching captions:", error.message);
    return null;
  }
}


async function summarizeTextWithGemini(text) {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      apiKey: GEMINI_API_KEY,
      text: text,
    });

    return response.data.summary; 
  } catch (error) {
    console.error("Error summarizing text with Gemini API:", error.message);
    return null;
  }
}


function getVideoId(url) {
  const match = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}


app.post("/api/getVideoSummary", async (req, res) => {
  const { videoUrl } = req.body;

  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    return res.status(400).send({ error: "Invalid YouTube URL" });
  }


  let captionsText = await getVideoCaptions(videoId);
  if (!captionsText) {
    return res
      .status(500)
      .send({ error: "Could not fetch captions for the video" });
  }


  const summary = await summarizeTextWithGemini(captionsText);
  if (!summary) {
    return res
      .status(500)
      .send({ error: "Could not generate summary using Gemini API" });
  }


  res.send({ summary });
});

app.post("/register", (req, res) => {
  const {
    name,
    email,
    password,
    mobile,
    preferredCategories,
    languagePreference,
    dateOfBirth,
    district,
  } = req.body;


  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: "Error hashing password" });
    }

   
    const query = `
      INSERT INTO users (name, email, password, mobile, preferred_categories, language_preference, date_of_birth, district)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

  
    const categoriesJson = JSON.stringify(preferredCategories);

    
    db.query(
      query,
      [
        name,
        email,
        hashedPassword,
        mobile,
        categoriesJson,
        languagePreference,
        dateOfBirth,
        district,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting data:", err);
          return res.status(500).json({ message: "Error registering user" });
        }

        
        res.status(201).json({ message: "User registered successfully" });
      }
    );
  });
});
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

 
  const query = "SELECT * FROM users WHERE email = ?";

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error("Error querying database:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    
    if (results.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }


    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error("Error comparing passwords:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

     
      if (isMatch) {
        res
          .status(200)
          .json({
            message: "Login successful",
            userId: user.id,
            preference: user.preferred_categories,
            languages: user.language_preference,
            district: user.district,
          });
      } else {
        res.status(400).json({ message: "Invalid email or password" });
      }
    });
  });
});

const getImageUrl = async (url) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/resolve-image-url?url=${url}`
    );
    return response.data.imageUrl; 
  } catch (error) {
    console.error("Error fetching the image URL:", error);
    return null;
  }
};

app.get("/scrape3", async (req, res) => {
  try {
    console.log("testing 123");

    const searchQuery = req.query.q; 
    if (!searchQuery) {
      return res.status(400).send("Search query is required.");
    }

    const url = `https://news.google.com/search?q=${encodeURIComponent(
      searchQuery
    )}`; // Construct the URL with the search query
    const browser = await puppeteer.launch({ headless: true }); 
    const page = await browser.newPage();

    // Go to the target URL
    await page.goto(url, { waitUntil: "networkidle2" });

    // Scrape the required data
    const elements = await page.evaluate(() => {
      const articleElements = document.querySelectorAll("article");
      return Array.from(articleElements).map((article) => {
        const imageElement = article.querySelector(".K0q4G img");
        const imageUrl = imageElement ? imageElement.src : null;

        const linkElement = article.querySelector(".JtKRv");
        const link = linkElement ? linkElement.href : null;
        const text = linkElement ? linkElement.textContent : null;

        const timeElement = article.querySelector(".hvbAAd");
        const time = timeElement ? timeElement.textContent : null;

        const sourceElement = article.querySelector(".a7P8l .vr1PYe");
        const source = sourceElement ? sourceElement.textContent : null;

        return {
          title: text,
          url: link,
          imgSrc: imageUrl, 
          publishedAt: time,
          source,
        };
      });
    });

    await browser.close();

    
    const articlesWithImages = await Promise.all(
      elements.slice(0, 10).map(async (article) => ({
        ...article,
        imgSrc: article.imgSrc ? await getImageUrl(article.imgSrc) : null,
      }))
    );

    
    res.json({ articles: articlesWithImages });
    console.log(articlesWithImages);
  } catch (error) {
    console.error("Error scraping:", error);
    res.status(500).send("Error scraping the website.");
  }
});

app.get("/resolve-image-url", async (req, res) => {
  const { url } = req.query;
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2" });

    const finalImageUrl = await page.evaluate(() => {
      const imgElement = document.querySelector("img"); 
      return imgElement ? imgElement.src : null;
    });

    await browser.close();

    if (finalImageUrl) {
      res.json({ imageUrl: finalImageUrl });
    } else {
      res.status(404).json({ error: "Image not found" });
    }
  } catch (error) {
    console.error("Error resolving image URL:", error);
    res.status(500).send("Error resolving image URL");
  }
});

app.get("/scrapeforMail", async (req, res) => {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).send("User ID is required.");

   
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [userId], async (err, results) => {
      if (err) {
        console.error("Error querying database:", err);
        await browser.close();
        return res.status(500).send("Internal server error.");
      }

      if (results.length === 0) {
        await browser.close();
        return res.status(404).send("User not found.");
      }

      const user = results[0];
      const { preferred_categories, district } = user;
      const categories = JSON.parse(preferred_categories);
      const searchQuery =
        categories[Math.floor(Math.random() * categories.length)] +
        " " +
        district;

      console.log("Search Query:", searchQuery);

      try {
        const url = `https://news.google.com/search?q=${encodeURIComponent(
          searchQuery
        )}`;
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: "networkidle2" });

      
        const elements = await page.evaluate(() => {
          const articleElements = document.querySelectorAll("article");
          return Array.from(articleElements)
            .map((article) => {
              const imageElement = article.querySelector(".K0q4G img");
              const imageUrl = imageElement ? imageElement.src : null;

              const linkElement = article.querySelector(".JtKRv");
              const link = linkElement ? linkElement.href : null;
              const text = linkElement ? linkElement.textContent : null;

              const timeElement = article.querySelector(".hvbAAd");
              const time = timeElement ? timeElement.textContent : null;

              const sourceElement = article.querySelector(".a7P8l .vr1PYe");
              const source = sourceElement ? sourceElement.textContent : null;

              return {
                title: text,
                url: link,
                imgSrc: imageUrl,
                publishedAt: time,
                source,
              };
            })
            .filter((article) => article.title && article.url); 
        });

      
        const articlesWithImages = await Promise.all(
          elements.slice(0, 2).map(async (article) => ({
            ...article,
            imgSrc: article.imgSrc ? await getImageUrl(article.imgSrc) : null,
          }))
        );

       
        res.json({ articles: articlesWithImages });
        console.log("Scraped Articles:", articlesWithImages);
      } catch (scrapingError) {
        console.error("Error during scraping:", scrapingError);
        res.status(500).send("Error scraping the website.");
      } finally {
        await browser.close(); 
      }
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    res.status(500).send("Unexpected server error.");
  }
});

async function fetchNewsArticles(userId) {
  const API_URL = `http://localhost:5000/scrapeforMail?userId=${userId}`;
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch news articles: ${response.statusText}`);
    }
    const data = await response.json();
    return data.articles || [];
  } catch (error) {
    console.error("Error fetching articles:", error.message);
    return [];
  }
}

// Generate Email Template
function generateEmailTemplate(articles) {
  const defaultImage = "https://via.placeholder.com/600x300";
  const newsletterHeader = `
      <div class="header">
          <h1>Today's Top Stories</h1>
          <p>Your curated news from கணினி_X' செய்தி360</p>
      </div>
  `;

  const articleTemplates = articles
    .map((article) => {
      const articleTitle = article.title || "No Title Available";
      const articleImage = article.imgSrc || defaultImage;
      const articleContent = article.publishedAt
        ? article.publishedAt
        : "Published date unavailable.";
      const articleUrl = article.url || "#";

      return `
      <div class="article-container">
          <h2 class="article-title">${articleTitle}</h2>
          <img src="${articleImage}" alt="Article Image" class="article-image">
          <p class="article-content">Published on: ${articleContent}</p>
          <a href="${articleUrl}" class="read-more">Read Full Article</a>
      </div>`;
    })
    .join("");
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily News Update</title>
  <style>
      body {
          margin: 0;
          padding: 0;
          font-family: 'Helvetica Neue', Arial, sans-serif;
          background-color: #f9f9f9;
          line-height: 1.6;
          color: #333333;
      }
      .email-container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
      }
      .header {
          background: linear-gradient(90deg, #6a11cb, #2575fc);
          color: #ffffff;
          padding: 30px 20px;
          text-align: center;
      }
      .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
          letter-spacing: 0.5px;
      }
      .header p {
          margin: 5px 0 0;
          font-size: 16px;
          opacity: 0.9;
      }
      .article-container {
          padding: 20px;
          border-bottom: 1px solid #eeeeee;
      }
      .article-title {
          font-size: 22px;
          margin-bottom: 15px;
          font-weight: 600;
          color: #2c3e50;
      }
      .article-image {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 8px;
          margin-bottom: 15px;
      }
      .article-content {
          font-size: 16px;
          color: #666666;
          margin-bottom: 20px;
          line-height: 1.8;
      }
      .read-more {
          display: block;
          width: fit-content;
          margin: 0 auto;
          background: linear-gradient(90deg, #6a11cb, #2575fc);
          color: #ffffff;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          transition: background 0.3s ease;
      }
      .read-more:hover {
          background: linear-gradient(90deg, #2575fc, #6a11cb);
      }
      .footer {
          background-color: #f9f9f9;
          text-align: center;
          padding: 20px;
          font-size: 14px;
          color: #888888;
          border-top: 1px solid #eeeeee;
      }
      .footer a {
          color: #6a11cb;
          text-decoration: none;
      }
      .footer a:hover {
          text-decoration: underline;
      }
  </style>
</head>
<body>
  <div class="email-container">
      <!-- Header Section -->
      ${newsletterHeader}
      
      <!-- Articles Section -->
      ${articleTemplates}
      
      <!-- Footer Section -->
      <div class="footer">
          <p>You're receiving this email because you subscribed to our கணினி_X newsletter.</p>
          <p><a href="{{UNSUBSCRIBE_URL}}">Unsubscribe</a> | <a href="{{SETTINGS_URL}}">Manage Preferences</a></p>
      </div>
  </div>
</body>
</html>`;
}

// Send Email
async function sendEmail(recipient, subject, htmlContent) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "rohitvijayandrive@gmail.com",
      pass: "kfzxznsmouxvszel",
    },
  });

  const mailOptions = {
    from: 'கணினி_X\' "செய்தி360" <like22050.it@rmkec.ac.in>',
    to: "rohitvijayan1111@gmail.com",
    subject: subject,
    html: htmlContent,
  };
  console.log(mailOptions);
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.response);
  } catch (error) {
    console.error("Error sending email:", error);
  
    if (error.response) {
      console.error("Error response:", error.response);
    }
  }
}

// Main Workflow
cron.schedule("*/6 * * * *", async () => {
  console.log("Running Cron Job - Sending Daily News Email");

  try {
    const latestArticles = await fetchNewsArticles(1);
    const emailContent = generateEmailTemplate(latestArticles);
   
    await sendEmail(
      "rithikraja28.rr@gmail.com",
      "Your Daily News Update",
      emailContent
    );
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error in cron job workflow:", error);
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

