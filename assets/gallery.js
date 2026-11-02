(() => {
  'use strict';
  const dialog = document.getElementById('gallery-dialog');
  const title = document.getElementById('album-title');
  const image = document.getElementById('album-image');
  const video = document.getElementById('album-video');
  const status = document.getElementById('album-status');
  const empty = document.getElementById('album-empty');
  const previous = document.getElementById('album-previous');
  const next = document.getElementById('album-next');
  let albums = {};
  let items = [];
  let position = 0;
  let opener;
  const stopVideo = () => {
    video.pause();
    video.removeAttribute('src');
    video.load();
  };
  const show = () => {
    stopVideo();
    image.hidden = true;
    image.removeAttribute('src');
    video.hidden = true;
    const item = items[position];
    const hasItem = Boolean(item);
    empty.hidden = hasItem;
    previous.disabled = next.disabled = items.length < 2;
    status.textContent = hasItem ? `${position + 1} of ${items.length}` : 'No photos or videos uploaded yet.';
    if (!hasItem) return;
    if (item.type === 'video') {
      video.src = item.src;
      video.hidden = false;
      video.load();
    } else {
      image.alt = item.alt || title.textContent;
      image.src = item.src;
      image.hidden = false;
    }
  };
  const showLoadError = () => {
    empty.textContent = 'This photo or video is unavailable. Try another item.';
    empty.hidden = false;
    image.hidden = video.hidden = true;
  };
  image.addEventListener('error', showLoadError);
  video.addEventListener('error', showLoadError);
  const move = direction => {
    if (!items.length) return;
    position = (position + direction + items.length) % items.length;
    show();
  };
  previous.addEventListener('click', () => move(-1));
  next.addEventListener('click', () => move(1));
  document.getElementById('album-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { stopVideo(); opener?.focus(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  const ready = fetch('assets/gallery-data.json')
    .then(response => { if (!response.ok) throw new Error('Album list unavailable'); return response.json(); })
    .then(data => { albums = data; })
    .catch(() => { albums = {}; });
  document.querySelectorAll('[data-album]').forEach(button => button.addEventListener('click', async () => {
    opener = button;
    title.textContent = button.querySelector('.album-name').textContent;
    empty.textContent = 'The original photos and videos for this album have not been uploaded yet.';
    items = [];
    position = 0;
    show();
    dialog.showModal();
    await ready;
    // Ignore a response after the visitor closed or changed the album.
    if (!dialog.open || opener !== button) return;
    items = Array.isArray(albums[button.dataset.album]) ? albums[button.dataset.album] : [];
    show();
  }));
})();
