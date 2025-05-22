const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

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
