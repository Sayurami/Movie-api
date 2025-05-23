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

// ... existing routes ...

// Search route - ADD THIS HERE
app.get('/sinhala-movies/search', async (req, res) => {
  const query = req.query.q?.toLowerCase();
  if (!query) return res.status(400).json({ error: 'Search query missing (use ?q=your_search)' });

  const movies = await scrapeSinhalaMovies();
  const filtered = movies.filter(movie => movie.title.toLowerCase().includes(query));

  if (!filtered.length) {
    return res.status(404).json({ message: 'No movies found for that search.' });
  }

  res.json(filtered);
});

// Default protected route
app.get('/secure-data', checkApiKey, (req, res) => {
  res.send('You have accessed protected content!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
