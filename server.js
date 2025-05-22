const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const app = express();
const PORT = process.env.PORT || 8000;

const BASE_URL = 'https://cinesubz.co/movies/';

app.get('/', (req, res) => {
    res.send('Welcome to GOJO-MD Movie API! Use /movies to get movie data.');
});

app.get('/movies', async (req, res) => {
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
