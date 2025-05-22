# cinesubz_scraper.py

from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

@app.route('/api/cinesubz-movies', methods=['GET'])
def get_movies():
    url = 'https://cinesubz.co/movies/'
    headers = {
        "User-Agent": "Mozilla/5.0"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()  # check for HTTP errors
        soup = BeautifulSoup(response.text, 'html.parser')

        movies = []
        for movie_div in soup.find_all('div', class_='movie-thumb'):
            title_tag = movie_div.find('h3')
            link_tag = movie_div.find('a')
            img_tag = movie_div.find('img')

            if title_tag and link_tag:
                title = title_tag.text.strip()
                link = link_tag['href']
                image = img_tag['src'] if img_tag else ''
                movies.append({
                    'title': title,
                    'link': link,
                    'image': image
                })

        return jsonify(movies)

    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)
