// movieRoutes.js or app.js
const express = require('express');
const router = express.Router();

const { getFullMovieData } = require('./movieController');

router.get('/api/movie/:name', async (req, res) => {
  const movieName = req.params.name;
  try {
    const movie = await getFullMovieData(movieName);
    if (!movie) return res.status(404).json({ error: 'Movie not found' });
    res.json(movie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
