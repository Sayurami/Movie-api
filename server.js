const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const crypto = require('crypto');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const PORT = process.env.PORT || 8000;
const BASE_URL = 'https://cinesubz.co/movies/';

const apiKeys = new Set();

// API Key Generate Function
function generateApiKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Root page - Serve UI
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Generate Key Endpoint
app.post('/generate-key', (req, res) => {
  const newKey = generateApiKey();
  apiKeys.add(newKey);
  res.json({ apiKey: newKey });
});

// Get Movies (Protected)
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

app.listen(PORT, () => {
  console.log(`GOJO-MD Movie API running at http://localhost:${PORT}`);
});
