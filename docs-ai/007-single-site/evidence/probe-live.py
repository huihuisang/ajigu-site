from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlsplit
from urllib.request import Request, urlopen
from xml.etree import ElementTree
import json
import re
import sys

revision = sys.argv[1]
assert re.fullmatch('[a-f0-9]{40}', revision)
root = Path(__file__).resolve().parents[3]
products = ['typenote', 'moodsk', 'gosleep', 'dailyapod', 'tutu']


def get(url):
    request = Request(url, headers={'User-Agent': 'ajigu-site-migration-verification', 'Cache-Control': 'no-cache'})
    with urlopen(request, timeout=45) as response:
        assert response.status == 200, (url, response.status)
        assert urlsplit(response.geturl()).hostname == urlsplit(url).hostname
        return response.read()


class Document(HTMLParser):
    def __init__(self, data):
        super().__init__()
        self.canonical = None
        self.refresh = None
        self.heading = False
        self.styles = []
        self.feed(data.decode())

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'h1':
            self.heading = True
        if tag == 'link' and attrs.get('rel') == 'canonical':
            self.canonical = attrs.get('href')
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.styles.append(attrs['href'])
        if tag == 'meta' and attrs.get('http-equiv', '').lower() == 'refresh':
            self.refresh = attrs.get('content')


def sitemap(data):
    return [loc.text for loc in ElementTree.fromstring(data).findall('.//{*}loc')]


def marker(site):
    domain = 'ajigu.com' if site == 'ajigu' else f'{site}.ajigu.com'
    data = json.loads(get(f'https://{domain}/site-release.json'))
    expected = {'sourceRepository': 'huihuisang/ajigu-site', 'sourceRevision': revision, 'site': site, 'domain': domain, 'mode': 'site' if site == 'ajigu' else 'redirect'}
    if site != 'ajigu':
        expected['targetBase'] = f'https://ajigu.com/{site}/'
    assert data == expected, (site, data)
    return data


with ThreadPoolExecutor(max_workers=6) as pool:
    markers = list(pool.map(marker, ['ajigu', *products]))

urls = sitemap(get('https://ajigu.com/sitemap.xml'))
assert len(urls) == len(set(urls)) == 91
assert all(urlsplit(url).hostname == 'ajigu.com' for url in urls)


def page(url):
    data = get(url)
    document = Document(data)
    assert document.canonical == url, (url, document.canonical)
    assert document.heading, url
    return {'url': url, 'bytes': len(data), 'sha256': sha256(data).hexdigest()}


with ThreadPoolExecutor(max_workers=8) as pool:
    pages = list(pool.map(page, urls))

legacy = []
for site in products:
    for url in sitemap((root / f'apps/ajigu/public/{site}/sitemap.xml').read_bytes()):
        legacy.append((site, url))
assert len(legacy) == 82


def redirect(entry):
    site, url = entry
    data = get(url)
    document = Document(data)
    target = f'https://ajigu.com/{site}' + urlsplit(url).path
    assert document.canonical == target, (url, document.canonical, target)
    assert document.refresh == '0;url=' + target, (url, document.refresh)
    assert b'location.replace' in data and b'astro-island' not in data
    return {'url': url, 'target': target, 'status': 200, 'sha256': sha256(data).hexdigest()}


with ThreadPoolExecutor(max_workers=8) as pool:
    redirects = list(pool.map(redirect, legacy))

resources = []
for site in products:
    asset = 'assets/appicon.jpg' if site == 'moodsk' else 'assets/app-icon.png'
    expected = (root / f'apps/ajigu/public/{site}/{asset}').read_bytes()
    for url in [f'https://{site}.ajigu.com/{asset}', f'https://ajigu.com/{site}/{asset}']:
        data = get(url)
        assert data == expected, url
        resources.append({'url': url, 'sha256': sha256(data).hexdigest()})
for asset in ['BingSiteAuth.xml', '006457a8747962bd1d5a650d6b9a5365.txt']:
    data = get('https://ajigu.com/' + asset)
    assert data == (root / asset).read_bytes()
    resources.append({'url': 'https://ajigu.com/' + asset, 'sha256': sha256(data).hexdigest()})

styles = []
for site in ['ajigu', *products]:
    base = 'https://ajigu.com/' + (site + '/' if site != 'ajigu' else '')
    document = Document(get(base))
    assert document.styles, base
    for sheet in document.styles:
        url = urljoin(base, sheet)
        data = get(url)
        assert b'detail-flow' in data and b'--section-gap' in data
        styles.append({'url': url, 'sha256': sha256(data).hexdigest()})

result = {'verifiedAt': datetime.now(timezone.utc).isoformat(), 'sourceRevision': revision, 'markers': markers, 'pages': pages, 'redirects': redirects, 'resources': resources, 'styles': styles}
Path(sys.argv[2]).write_text(json.dumps(result, indent=2) + '\n')
print(f'{len(markers)} markers, {len(pages)} canonical pages, {len(redirects)} legacy redirects, {len(resources)} resources and {len(styles)} stylesheets passed.')
