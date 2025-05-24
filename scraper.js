const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeSinhalaSub(query) {
  const searchUrl = `https://www.sinhalasub.lk/?s=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(searchUrl);
    const $ = cheerio.load(response.data);

    const firstResult = $('.post-title a').first();
    const title = firstResult.text().trim();
    const link = firstResult.attr('href');

    if (!title || !link) {
      return null;
    }

    return {
      title,
      link
    };
  } catch (error) {
    console.error("Scraping error:", error.message);
    return null;
  }
}

module.exports = scrapeSinhalaSub;
