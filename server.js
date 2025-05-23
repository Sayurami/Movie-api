const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 8000;
const BASE_URL = 'https://cinesubz.co/movies/';
const SECRET = 'sayura_secret_key';

const apiKeys = new Set();
const usersFile = './users.json';

// Generate random API key
function generateApiKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Load user data
function loadUsers() {
  if (!fs.existsSync(usersFile)) return [];
  return JSON.parse(fs.readFileSync(usersFile));
}

// Save user data
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API key generation
app.post('/generate-key', (req, res) => {
  const newKey = generateApiKey();
  apiKeys.add(newKey);
  res.json({ apiKey: newKey });
});

// Signup route
app.post('/signup', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ message: 'User already exists' });
  }
  const hash = await bcrypt.hash(password, 10);
  users.push({ username, password: hash });
  saveUsers(users);
  res.json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// Movie fetch route (requires valid API key)
app.get('/movies', async (req, res) => {
  const key = req.headers['x-api-key'];
  if (!key || !apiKeys.has(key)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid API key' });
  }

  try {
    const { search, quality } = req.query;
    const response = await axios.get(BASE_URL);
    const $ = cheerio.load(response.data);
    const movies = [];

    $('.ml-item').each((i, elem) => {
      const title = $(elem).find('.mli-info h2').text().trim();
      const link = $(elem).find('a').attr('href');
      const image = $(elem).find('img').attr('src');
      const qualityText = $(elem).find('.mli-quality').text().trim();

      if (title && link && image) {
        movies.push({ title, link, image, quality: qualityText });
      }
    });

    let filtered = movies;

    if (search) {
      const keyword = search.toLowerCase();
      filtered = filtered.filter(m => m.title.toLowerCase().includes(keyword));
    }

    if (quality) {
      filtered = filtered.filter(m => m.quality.toLowerCase().includes(quality.toLowerCase()));
    }

    res.json(filtered);
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`GOJO-MD Movie API running at http://localhost:${PORT}`);
});
