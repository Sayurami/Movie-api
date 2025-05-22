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

// Step 1: Send code
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

// Step 2: Verify
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

// Protected route (future use)
app.get('/secure-data', (req, res) => {
  const key = req.headers['x-api-key'];
  const user = users.find(u => u.apiKey === key && u.verified);
  if (!user) return res.status(401).json({ error: 'Unauthorized or unverified' });

  res.send('You have accessed protected content!');
});

// Public Cinesubz scraper route
app.get('/api/cinesubz', async (req, res) => {
  try {
    const { data } = await axios.get('https://cinesubz.co/movies/');
    const $ = cheerio.load(data);
    const movies = [];

    $('.movie-thumb').each((i, elem) => {
      const title = $(elem).find('h3').text().trim();
      const link = $(elem).find('a').attr('href');
      const image = $(elem).find('img').attr('src');
      movies.push({ title, link, image });
    });

    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: 'Scraping failed', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
