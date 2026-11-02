"""Check the static site's HTML, local links, media references and JavaScript."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import json
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
errors = []

class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(convert_charrefs=True)
        self.path, self.stack, self.ids, self.references = path, [], set(), []
        self.headings = []
        self.albums = set()
        self.has_viewport = False
        self.feed(path.read_text())
        if self.stack:
            errors.append(f'{path.name}: unclosed tags {self.stack}')

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if tag not in VOID:
            self.stack.append(tag)
        if attrs.get('id'):
            if attrs['id'] in self.ids:
                errors.append(f'{self.path.name}: duplicate id {attrs["id"]}')
            self.ids.add(attrs['id'])
        if tag == 'h1':
            self.headings.append(tag)
        if tag == 'meta' and attrs.get('name') == 'viewport':
            self.has_viewport = True
        if tag == 'img' and 'alt' not in attrs:
            errors.append(f'{self.path.name}: image lacks alternative text')
        if tag == 'a' and attrs.get('target') == '_blank' and 'noopener' not in attrs.get('rel', '').split():
            errors.append(f'{self.path.name}: new-tab link lacks noopener')
        if attrs.get('data-album'):
            self.albums.add(attrs['data-album'])
        for key in ['href', 'src']:
            if attrs.get(key):
                self.references.append(attrs[key])

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if not self.stack or self.stack[-1] != tag:
            errors.append(f'{self.path.name}:{self.getpos()[0]} mismatched </{tag}>; open={self.stack[-3:]}')
            return
        self.stack.pop()

pages = {p.resolve(): Page(p) for p in ROOT.glob('*.html')}
checked = 0
for path, page in pages.items():
    if len(page.headings) != 1:
        errors.append(f'{path.name}: expected one h1, got {len(page.headings)}')
    if not page.has_viewport:
        errors.append(f'{path.name}: missing viewport metadata')
    for target in page.references:
        url = urlsplit(target)
        if url.scheme or url.netloc:
            continue
        destination = (path.parent / unquote(url.path)).resolve() if url.path else path
        if destination.is_dir():
            destination /= 'index.html'
        checked += 1
        if not destination.is_file():
            errors.append(f'{path.name}: missing local target {target}')
        if url.fragment and destination in pages and unquote(url.fragment) not in pages[destination].ids:
            errors.append(f'{path.name}: missing anchor {target}')

albums = json.loads((ROOT / 'assets/gallery-data.json').read_text())
gallery = pages[(ROOT / 'gallery.html').resolve()]
if gallery.albums != set(albums):
    errors.append('Gallery cards and album manifest do not match')
for key, items in albums.items():
    if not isinstance(items, list):
        errors.append(f'{key}: album must be a list')
        continue
    for item in items:
        if item.get('type') not in ['img', 'video'] or not item.get('src'):
            errors.append(f'{key}: invalid media item')
            continue
        source = (ROOT / item['src']).resolve()
        if not source.is_relative_to(ROOT) or not source.is_file():
            errors.append(f'{key}: missing or invalid media file {item["src"]}')
        if item['type'] == 'img' and not item.get('alt'):
            errors.append(f'{key}: photo requires descriptive alt text')

for js in (ROOT / 'assets').glob('*.js'):
    result = subprocess.run(['node', '--check', str(js)], capture_output=True, text=True)
    if result.returncode:
        errors.append(result.stderr)

for pdf in [*ROOT.glob('*.pdf'), *(ROOT / 'papers').glob('*.pdf')]:
    if not pdf.read_bytes().startswith(b'%PDF-'):
        errors.append(f'{pdf.name}: invalid PDF file')

if errors:
    print('\n'.join(errors), file=sys.stderr)
    raise SystemExit(1)
print(f'PASS: {len(pages)} pages, {checked} local links and assets, {len(albums)} album definitions, JavaScript syntax and PDF signatures.')
