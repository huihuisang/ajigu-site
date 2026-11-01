from concurrent.futures import ThreadPoolExecutor
from urllib.request import Request,urlopen
from urllib.parse import urlsplit,urljoin
from xml.etree import ElementTree
from pathlib import Path
from datetime import datetime,timezone
import sys,json,hashlib,re
revision=sys.argv[1]
assert re.fullmatch('[a-f0-9]{40}',revision)
domains={'ajigu':'ajigu.com','typenote':'typenote.ajigu.com','moodsk':'moodsk.ajigu.com','gosleep':'gosleep.ajigu.com','dailyapod':'dailyapod.ajigu.com','tutu':'tutu.ajigu.com'}
def get(url):
    request=Request(url,headers={'User-Agent':'ajigu-site-release-verification','Cache-Control':'no-cache'})
    with urlopen(request,timeout=30) as response:
        assert response.status==200,(url,response.status)
        assert urlsplit(response.geturl()).hostname==urlsplit(url).hostname,(url,response.geturl())
        return response.read()
def marker(entry):
    site,domain=entry
    url=f'https://{domain}/site-release.json'
    value=json.loads(get(url))
    assert value=={'sourceRepository':'huihuisang/ajigu-site','sourceRevision':revision,'site':site,'domain':domain},(site,value)
    return {'site':site,'url':url,**value}
with ThreadPoolExecutor(max_workers=6) as pool:
    markers=list(pool.map(marker,domains.items()))
urls=[]
for site,domain in domains.items():
    data=get(f'https://{domain}/sitemap.xml')
    root=ElementTree.fromstring(data)
    for loc in root.findall('.//{*}loc'):
        assert urlsplit(loc.text).hostname==domain
        urls.append(loc.text)
def page(url):
    data=get(url)
    text=data.decode('utf-8')
    canonical=re.search(r'<link[^>]*rel="canonical"[^>]*href="([^"]+)"',text)
    assert canonical and canonical.group(1)==url,(url,'canonical mismatch')
    assert re.search(r'<h1\b',text),(url,'missing heading')
    return {'url':url,'status':200,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
with ThreadPoolExecutor(max_workers=8) as pool:
    pages=list(pool.map(page,urls))
styles=[]
for site,domain in domains.items():
    html=get(f'https://{domain}/').decode('utf-8')
    assert ('work-gallery' if site=='ajigu' else 'detail-flow') in html,site
    sheets=re.findall(r'<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"',html)
    assert sheets,site
    content=''
    for sheet in sheets:
        url=urljoin(f'https://{domain}/',sheet)
        data=get(url)
        content+=data.decode('utf-8')
        styles.append({'site':site,'url':url,'sha256':hashlib.sha256(data).hexdigest()})
    assert 'detail-flow' in content and '--section-gap' in content,site
bing=get('https://ajigu.com/BingSiteAuth.xml')
result={'verifiedAt':datetime.now(timezone.utc).isoformat(),'sourceRevision':revision,'markers':markers,'pages':pages,'styles':styles,'bingVerificationSha256':hashlib.sha256(bing).hexdigest()}
Path(sys.argv[2]).write_text(json.dumps(result,indent=2)+'\n')
print(f'{len(markers)} release markers, {len(pages)} public page URLs and {len(styles)} stylesheets passed.')
