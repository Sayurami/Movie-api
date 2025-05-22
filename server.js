const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 8000;

// Sinhala Subtitle Site
const BASE_URL = 'https://cinesubz.co/movies/';

// Home route
app.get('/', (req, res) => {
  res.send('Welcome to Sinhala Movie API by Cinesubz!');
});

// Get recent movies
app.get('/api/movies', async (req, res) => {
  try {
    const response = await axios.get(BASE_URL);
    const html = response.data;
    const $ = cheerio.load(html);

    const movies = [];

    $('.ml-item').each((i, el) => {
      const title = $(el).find('.mli-info h2').text().trim();
      const link = $(el).find('a').attr('href');
      const thumbnail = $(el).find('img').attr('data-original') || $(el).find('img').attr('src');

      if (title && link) {
        movies.push({ title, link, thumbnail });
      }
    });

    res.json({ success: true, count: movies.length, movies });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
