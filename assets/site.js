(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const button = document.getElementById('theme-toggle');
  const applyTheme = light => {
    document.body.classList.toggle('light-mode', light);
    if (button) {
      button.textContent = light ? '☾' : '☀';
      button.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
      button.setAttribute('aria-pressed', String(light));
    }
  };
  let savedTheme;
  try { savedTheme = localStorage.getItem('theme'); } catch { /* Storage may be blocked. */ }
  applyTheme(savedTheme === 'light');
  button?.addEventListener('click', () => {
    const light = !document.body.classList.contains('light-mode');
    applyTheme(light);
    try { localStorage.setItem('theme', light ? 'light' : 'dark'); } catch { /* Keep this session's choice. */ }
  });
  const header = document.querySelector('.navbar');
  const menu = document.getElementById('menu-toggle');
  const setMenu = open => {
    header?.classList.toggle('menu-open', open);
    menu?.setAttribute('aria-expanded', String(open));
    if (menu) menu.textContent = open ? 'Close' : 'Menu';
  };
  menu?.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('.nav-links a').forEach(link => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menu.focus();
    }
  });
  document.addEventListener('click', event => {
    if (header && !header.contains(event.target)) setMenu(false);
  });
  window.matchMedia('(min-width: 1121px)').addEventListener('change', () => setMenu(false));
  document.querySelectorAll('[data-current-year]').forEach(el => { el.textContent = String(new Date().getFullYear()); });
})();
