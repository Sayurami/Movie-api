const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 3000;

// Dummy user list
const users = [
  {
    username: 'gojo',
    password: 'sixeyes123',
    email: 'yourgmail@gmail.com',
    verified: false,
    apiKey: 'abc123xyz789'
  }
];

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send verification code to Gmail
const sendVerificationEmail = async (email, code) => {
  await transporter.sendMail({
    from: `"GOJO API" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your API Verification Code',
    html: `<h2>Your verification code is: <strong>${code}</strong></h2>`
  });
};

// Step 1: Request verification code
app.post('/request-verification', async (req, res) => {
  const { username } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ error: 'User not found' });

  const code = Math.floor(100000 + Math.random() * 900000);
  user.tempCode = code;

  try {
    await sendVerificationEmail(user.email, code);
    res.json({ message: 'Verification code sent to your email.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send email', details: err.message });
  }
});

// Step 2: Verify code
app.post('/verify', (req, res) => {
  const { username, code } = req.body;
  const user = users.find(u => u.username === username);
  if (!user || user.tempCode != code) {
    return res.status(400).json({ error: 'Invalid verification code' });
  }

  user.verified = true;
  delete user.tempCode;
  res.json({ message: 'Email verified', apiKey: user.apiKey });
});

// Middleware for API key checking
function checkApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  const user = users.find(u => u.apiKey === key && u.verified);
  if (!user) return res.status(401).json({ error: 'Unauthorized or unverified' });
  next();
}

// SinhalaSub scraper
const scrapeSinhalaMovies = async () => {
  const url = 'https://sinhalasub.lk/';
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const movies = [];

    $('.ml-item').each((i, el) => {
      const title = $(el).find('.mli-info h2').text().trim();
      const image = $(el).find('img').attr('src');
      const link = $(el).find('a').attr('href');
      const quality = $(el).find('.mli-quality').text().trim() || 'Unknown';

      if (title && image && link) {
        movies.push({ title, image, link, quality });
      }
    });

    return movies;
  } catch (err) {
    console.error("SinhalaSub scraping error:", err.message);
    return [];
  }
};

// Cinesubz scraper
const scrapeCinesubzMovies = async () => {
  try {
    const { data } = await axios.get('https://cinesubz.co/movies/');
    const $ = cheerio.load(data);
    const movies = [];

    $('.movie-thumb').each((i, elem) => {
      const title = $(elem).find('h3').text().trim();
      const link = $(elem).find('a').attr('href');
      const image = $(elem).find('img').attr('src');
      if (title && link && image) {
        movies.push({ title, link, image });
      }
    });

    return movies;
  } catch (error) {
    console.error("Cinesubz scraping error:", error.message);
    return [];
  }
};

// Routes
app.post('/request-verification', async (req, res) => {
  // ... same as above
});

app.post('/verify', (req, res) => {
  // ... same as above
});

app.get('/api/cinesubz', checkApiKey, async (req, res) => {
  const movies = await scrapeCinesubzMovies();
  if (!movies.length) return res.status(500).json({ error: 'Cinesubz scraping failed' });
  res.json(movies);
});

app.get('/api/sinhalasub', checkApiKey, async (req, res) => {
  const movies = await scrapeSinhalaMovies();
  if (!movies.length) return res.status(500).json({ error: 'SinhalaSub scraping failed' });
  res.json(movies);
});

// Public Sinhala movies route without API key (optional)
app.get('/sinhala-movies', async (req, res) => {
  const movies = await scrapeSinhalaMovies();
  if (!movies.length) return res.status(500).json({ error: 'SinhalaSub scraping failed' });
  res.json(movies);
});

// Default protected example
app.get('/secure-data', checkApiKey, (req, res) => {
  res.send('You have accessed protected content!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
