import requests
from bs4 import BeautifulSoup

def get_sinhala_subtitles():
    url = 'https://www.sinhalasub.net/'
    response = requests.get(url)

    if response.status_code != 200:
        print("Failed to retrieve the page.")
        return []

    soup = BeautifulSoup(response.text, 'html.parser')
    subtitles = []

    posts = soup.select('h2.post-title.entry-title a')
    
    for post in posts:
        title = post.text.strip()
        link = post['href']
        subtitles.append({
            'title': title,
            'link': link
        })

    return subtitles

if __name__ == '__main__':
    subs = get_sinhala_subtitles()
    for sub in subs:
        print(f"{sub['title']}\n{sub['link']}\n")
