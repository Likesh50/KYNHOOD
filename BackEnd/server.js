const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { google } = require('googleapis');
const axios = require('axios');
const app = express();
const PORT = 5000;
const bcrypt = require('bcryptjs');
const puppeteer = require('puppeteer');
const nodemailer = require('nodemailer');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'pass123',
  database: 'kynhood',
});

// Connect to the database
db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
  } else {
    console.log('Connected to MySQL database');
  }
});

const GEMINI_API_KEY = 'AIzaSyAdFW-tfACDH3xlRiB2TFir0RZpm9-RxCc';  // Replace with your Gemini API Key
const GEMINI_API_URL = 'https://gemini.googleapis.com/v1beta1/summarizeText';
const API_KEY = 'AIzaSyA82SaGxS6_wXEffifV_QSopjWrk0EPJlA';
// Function to fetch captions using Google APIs
async function getVideoCaptions(videoId) {
  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: API_KEY,
    });

    // Fetch captions
    const captionsResponse = await youtube.captions.list({
      part: 'snippet',
      videoId: videoId,
    });

    const captions = captionsResponse.data.items;
    if (!captions || captions.length === 0) {
      throw new Error('No captions available for this video.');
    }

    // Select the first caption (assuming it's in a supported language)
    const captionId = captions[0].id;

    // Fetch caption text
    const captionDetails = await youtube.captions.download({
      id: captionId,
    });

    return captionDetails.data;
  } catch (error) {
    console.error('Error fetching captions:', error.message);
    return null;
  }
}

// Function to summarize text using Gemini API
async function summarizeTextWithGemini(text) {
  try {
    const response = await axios.post(GEMINI_API_URL, {
      apiKey: GEMINI_API_KEY,
      text: text,
    });

    return response.data.summary; // Assuming Gemini API returns a 'summary' field
  } catch (error) {
    console.error('Error summarizing text with Gemini API:', error.message);
    return null;
  }
}

// Extract video ID from YouTube URL
function getVideoId(url) {
  const match = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

// Endpoint to handle video transcript and summarization
app.post('/api/getVideoSummary', async (req, res) => {
  const { videoUrl } = req.body;

  // Extract video ID from URL
  const videoId = getVideoId(videoUrl);
  if (!videoId) {
    return res.status(400).send({ error: 'Invalid YouTube URL' });
  }

  // Step 1: Fetch captions
  let captionsText = await getVideoCaptions(videoId);
  if (!captionsText) {
    return res.status(500).send({ error: 'Could not fetch captions for the video' });
  }

  // Step 2: Summarize the captions using Gemini API
  const summary = await summarizeTextWithGemini(captionsText);
  if (!summary) {
    return res.status(500).send({ error: 'Could not generate summary using Gemini API' });
  }

  // Send the summarized result
  res.send({ summary });
});

app.post('/register', (req, res) => {
  const { name, email, password, mobile, preferredCategories, languagePreference, dateOfBirth, district } = req.body;

  // Hash the password using bcrypt
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ message: 'Error hashing password' });
    }

    // Prepare data to be inserted into the database
    const query = `
      INSERT INTO users (name, email, password, mobile, preferred_categories, language_preference, date_of_birth, district)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Convert the preferredCategories array into a JSON string for storing
    const categoriesJson = JSON.stringify(preferredCategories);

    // Execute the query to insert data into the users table
    db.query(query, [name, email, hashedPassword, mobile, categoriesJson, languagePreference, dateOfBirth, district], (err, result) => {
      if (err) {
        console.error('Error inserting data:', err);
        return res.status(500).json({ message: 'Error registering user' });
      }

      // Respond with success message
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
});
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate if both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  // Query to find the user by email
  const query = 'SELECT * FROM users WHERE email = ?';

  db.query(query, [email], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // Check if the user with the given email exists
    if (results.length === 0) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // Compare the provided password with the stored hashed password
    const user = results[0];
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // If passwords match, send a success response
      if (isMatch) {
        res.status(200).json({ message: 'Login successful', userId: user.id,preference:user.preferred_categories,languages:user.language_preference});
      } else {
        res.status(400).json({ message: 'Invalid email or password' });
      }
    });
  });
});

const getImageUrl = async (url) => {
  try {
    const response = await axios.get(`http://localhost:5000/resolve-image-url?url=${url}`);
    return response.data.imageUrl; // Get the actual image URL after redirect
  } catch (error) {
    console.error('Error fetching the image URL:', error);
    return null;
  }
};

app.get('/scrape3', async (req, res) => {
  try {
    console.log("testing 123");
    const searchQuery = req.query.q; // Get the search query from the request
    if (!searchQuery) {
      return res.status(400).send('Search query is required.');
    }

    const url = `https://news.google.com/search?q=${encodeURIComponent(searchQuery)}`; // Construct the URL with the search query
    const browser = await puppeteer.launch({ headless: true }); // Launch Puppeteer in headless mode
    const page = await browser.newPage();

    // Go to the target URL
    await page.goto(url, { waitUntil: 'networkidle2' });

    // Scrape the required data
    const elements = await page.evaluate(() => {
      const articleElements = document.querySelectorAll('article');
      return Array.from(articleElements).map((article) => {
        const imageElement = article.querySelector('.K0q4G img');
        const imageUrl = imageElement ? imageElement.src : null;

        const linkElement = article.querySelector('.JtKRv');
        const link = linkElement ? linkElement.href : null;
        const text = linkElement ? linkElement.textContent : null;

        const timeElement = article.querySelector('.hvbAAd');
        const time = timeElement ? timeElement.textContent : null;

        const sourceElement = article.querySelector('.a7P8l .vr1PYe');
        const source = sourceElement ? sourceElement.textContent : null;

        return {
          title: text,
          url: link,
          imgSrc: imageUrl, // Processed later
          publishedAt: time,
          source,
        };
      });
    });

    await browser.close();

    // Resolve image URLs
    const articlesWithImages = await Promise.all(
      elements.slice(0, 5).map(async (article) => ({
        ...article,
        imgSrc: article.imgSrc ? await getImageUrl(article.imgSrc) : null,
      }))
    );

    // Return the scraped articles as JSON
    res.json({ articles: articlesWithImages });
    console.log(articlesWithImages);
  } catch (error) {
    console.error('Error scraping:', error);
    res.status(500).send('Error scraping the website.');
  }
});

app.get('/resolve-image-url', async (req, res) => {
  const { url } = req.query;
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2' });

    const finalImageUrl = await page.evaluate(() => {
      const imgElement = document.querySelector('img'); // Assuming the first image needs to be fetched
      return imgElement ? imgElement.src : null;
    });

    await browser.close();

    if (finalImageUrl) {
      res.json({ imageUrl: finalImageUrl });
    } else {
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (error) {
    console.error('Error resolving image URL:', error);
    res.status(500).send('Error resolving image URL');
  }
});

const transporter = nodemailer.createTransport({
  service: 'gmail', // Replace with your email service (e.g., 'smtp.mailtrap.io')
  auth: {
    user: 'like22050.it@rmkec.ac.in', // Replace with your email address
    pass: 'ffezcjwvtnmihwow', // Replace with your email password or app-specific password
  },
});

// Email sending endpoint
app.post('/send-email', async (req, res) => {
  const { to, subject, text } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: 'Please provide all required fields: to, subject, text.' });
  }

  try {
    const mailOptions = {
      from: 'like22050.it@rmkec.ac.in', // Sender email address
      to, // Recipient email address
      subject, // Email subject
      text, // Email content
    };

    const info = await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Email sent successfully', info });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to send email', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
