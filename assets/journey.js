(() => {
  'use strict';
  const container = document.getElementById('map');
  const status = document.getElementById('map-status');
  if (!container || !status) return;
  if (!window.L) {
    container.hidden = true;
    status.textContent = 'The interactive map is unavailable. Explore the education, research and research-interest locations below.';
    return;
  }
  const locations = [
    { coords: [-33.8688,151.2093], title: 'Sydney, Australia', description: 'UTS · Study, tutoring and research' },
    { coords: [1.3521,103.8198], title: 'Singapore', description: 'Education background' },
    { coords: [-42.8821,147.3272], title: 'Hobart, Australia', description: 'IMAS · Squidle+ marine AI collaboration' },
    { coords: [63.4305,10.3951], title: 'Trondheim, Norway', description: 'Arctic marine robotics research interests' },
    { coords: [51.4416,5.4697], title: 'Eindhoven, Netherlands', description: 'Multilingual bias research collaboration' }
  ];
  try {
    const map = L.map(container, { scrollWheelZoom: false }).setView([20, 0], 2);
    const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    tiles.on('tileerror', () => {
      status.textContent = 'Some map tiles could not load. The full location list remains available below.';
    });
    tiles.addTo(map);
    locations.forEach(location => L.marker(location.coords, { title: location.title, alt: location.title })
      .addTo(map).bindPopup(`<strong>${location.title}</strong><br>${location.description}`));
  } catch {
    container.hidden = true;
    status.textContent = 'The interactive map is unavailable. Explore the location list below.';
  }
})();
