const axios = require('axios');
const cheerio = require('cheerio');

async function getMovies() {
  try {
    const url = 'https://cinesubz.co/movies/';
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    let movies = [];

    // Cinesubz website එකේ movies list එකේ HTML structure එකට අනුව selector එක වෙනස් විය හැකිය.
    // මේක ඔයාට verify කරන්න ඕන.
    $('.card').each((i, el) => {
      const title = $(el).find('.card-title').text().trim();
      const link = $(el).find('a').attr('href');
      const image = $(el).find('img').attr('src');

      if (title && link) {
        movies.push({
          title,
          link: link.startsWith('http') ? link : `https://cinesubz.co${link}`,
          image: image ? (image.startsWith('http') ? image : `https://cinesubz.co${image}`) : null
        });
      }
    });

    return movies;
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    return [];
  }
}

module.exports = { getMovies };
