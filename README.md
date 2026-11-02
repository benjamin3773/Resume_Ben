# Benjamin Sun resume website

Static GitHub Pages website at <https://benjamin3773.github.io/Resume_Ben/>.
The homepage, research journey and photography gallery work without a build step.

## Preview and check

From the repository directory:

```sh
python3 -m http.server 8000
python3 scripts/check_site.py
```

Open <http://localhost:8000/>. The checks require Python 3.9+ and Node.js,
but no third-party packages. They check HTML structure, local links and anchors,
gallery definitions, JavaScript syntax and PDF signatures.

## Update papers and CVs

Paper entries are in the `papers` section of `index.html`. Author manuscripts
are in `papers/`. Keep conference submission, acceptance, proceedings publication
and arXiv announcement statuses distinct. Add public arXiv links only after an
identifier has been assigned; submission receipt numbers are not public paper IDs.
The three 2027 conference manuscripts are under review as of 2 November 2026.
The multilingual-bias and ClassQuest preprints have been submitted to arXiv;
PaperWeave has not. No acceptance is implied by either status.

The two root-level CV PDFs are the downloads linked from the homepage.

## Add real gallery media

The original photo and video files were absent from the repository. All ten
albums are retained with an explicit empty state; no replacement travel photos
have been invented. Add the original files and list them in
`assets/gallery-data.json`, using paths relative to the repository root:

```json
{
  "austria": [
    {"type": "img", "src": "images/austria/1.jpg", "alt": "Describe the actual photograph"},
    {"type": "video", "src": "videos/austria/1.mp4"}
  ]
}
```

Retain the other album keys. Use web-friendly file sizes and filenames with the
same case as their manifest entries. Re-run the checks before publishing.

## Map availability

The journey map uses Leaflet 1.9.4 and OpenStreetMap tiles with attribution.
The complete location list remains readable if the external map cannot load.
Trondheim is identified as a research interest, not an institutional affiliation.

Changes pushed to `main` are published by the existing GitHub Pages deployment.
