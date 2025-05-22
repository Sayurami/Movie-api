// movieController.js
const puppeteer = require('puppeteer');

async function getFullMovieData(movieName) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });

  const page = await browser.newPage();

  await page.goto(`https://cinesubz.co/?s=${encodeURIComponent(movieName)}`);

  const moviePageUrl = await page.evaluate(() => {
    const firstLink = document.querySelector('.post-title a');
    return firstLink ? firstLink.href : null;
  });

  if (!moviePageUrl) {
    await browser.close();
    return null;
  }

  await page.goto(moviePageUrl);

  const movieData = await page.evaluate(() => {
    const title = document.querySelector('h1.entry-title')?.innerText || null;
    const description = document.querySelector('.entry-content p')?.innerText || null;

    const subs = [];
    document.querySelectorAll('.subtitle-links a').forEach((el) => {
      subs.push({ name: el.innerText, url: el.href });
    });

    const videos = [];
    document.querySelectorAll('a.download-button').forEach((el) => {
      videos.push({ quality: el.innerText, url: el.href });
    });

    return {
      title,
      description,
      subtitles: subs,
      videos,
    };
  });

  await browser.close();
  return movieData;
}

module.exports = { getFullMovieData };
