const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const { google } = require('googleapis');
const axios = require('axios');
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Database Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '1207',
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
