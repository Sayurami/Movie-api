from flask import Flask, jsonify
import requests
from bs4 import BeautifulSoup

app = Flask(__name__)

def scrape_cinesubz_movies():
    url = 'https://cinesubz.co/movies/'
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    movies = []
    for movie_div in soup.find_all('div', class_='movie-thumb'):
        title_tag = movie_div.find('h3')
        link_tag = movie_div.find('a')
        if title_tag and link_tag:
            title = title_tag.text.strip()
            link = link_tag['href']
            movies.append({'title': title, 'link': link})

    return movies

@app.route('/api/cinesubz-movies')
def get_cinesubz_movies():
    movies = scrape_cinesubz_movies()
    return jsonify(movies)

if __name__ == '__main__':
    app.run(debug=True)
