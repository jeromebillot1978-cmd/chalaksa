/* =========================================================
   LE CHALAKSA — Scripts (JavaScript vanilla)
   ========================================================= */

/* --- Configuration : à personnaliser --- */
const CONFIG = {
  // Horaires utilisés pour le badge "Ouvert / Fermé" (0 = dimanche … 6 = samedi), format [ouverture, fermeture] en heures décimales
  hours: {
    0: [14, 18],
    1: null,
    2: [11.5, 18.5],
    3: [11.5, 18.5],
    4: [11.5, 18.5],
    5: [11.5, 18.5],
    6: [11, 19]
  }
};

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

document.addEventListener('DOMContentLoaded', () => {
  initPreloader();
  initTheme();
  initHeader();
  initMobileNav();
  initActiveLinks();
  initReveal();
  initCounters();
  initLanterns();
  initParallax();
  initTabs();
  initCatFilter();
  initTilt();
  initGallery();
  initOpenStatus();
  $('#year').textContent = new Date().getFullYear();
});

/* ---------- Préchargeur ---------- */
function initPreloader() {
  const pre = $('#preloader');
  if (!pre) return;
  const hide = () => pre.classList.add('is-hidden');
  window.addEventListener('load', () => setTimeout(hide, 500));
  setTimeout(hide, 3000); // sécurité si une ressource tarde
}

/* ---------- Mode sombre ---------- */
function initTheme() {
  const btn = $('#themeToggle');
  const root = document.documentElement;
  btn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('chalaksa-theme', next); } catch (e) { /* stockage indisponible */ }
  });
}

/* ---------- En-tête sticky + progression + retour haut ---------- */
function initHeader() {
  const header = $('#header');
  const progress = $('#scrollProgress');
  const toTop = $('#toTop');
  let ticking = false;

  const update = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 40);
    toTop.classList.toggle('is-visible', y > window.innerHeight);
    progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
  update();
}

/* ---------- Menu mobile ---------- */
function initMobileNav() {
  const burger = $('#burger');
  const nav = $('#nav');
  const close = () => {
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Ouvrir le menu');
    document.body.classList.remove('no-scroll');
  };
  burger.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('no-scroll', open);
  });
  $$('a', nav).forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) close(); });
}

/* ---------- Lien actif selon la section visible ---------- */
function initActiveLinks() {
  const links = $$('.nav__link');
  const sections = links.map(l => $(l.getAttribute('href'))).filter(Boolean);
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === `#${entry.target.id}`));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => io.observe(s));
}

/* ---------- Apparition au scroll ---------- */
function initReveal() {
  const items = $$('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    items.forEach(el => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach(el => io.observe(el));
}

/* ---------- Compteurs animés ---------- */
function initCounters() {
  const counters = $$('[data-count]');
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = +el.dataset.count;
      const suffix = el.dataset.suffix || '';
      const duration = prefersReduced ? 0 : 1800;
      const start = performance.now();
      const step = now => {
        const p = duration ? Math.min((now - start) / duration, 1) : 1;
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      obs.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => io.observe(c));
}

/* ---------- Lanternes flottantes du hero ---------- */
function initLanterns() {
  const wrap = $('#lanterns');
  if (!wrap || prefersReduced) return;
  const count = window.innerWidth < 600 ? 10 : 18;
  for (let i = 0; i < count; i++) {
    const l = document.createElement('span');
    l.className = 'lantern';
    const size = 0.6 + Math.random() * 0.9;
    l.style.left = `${Math.random() * 100}%`;
    l.style.transform = `scale(${size})`;
    l.style.width = `${14 * size}px`;
    l.style.height = `${20 * size}px`;
    l.style.animationDuration = `${14 + Math.random() * 14}s`;
    l.style.animationDelay = `${-Math.random() * 20}s`;
    l.style.setProperty('--drift', `${(Math.random() - 0.5) * 140}px`);
    wrap.appendChild(l);
  }
}

/* ---------- Parallaxe douce du hero ---------- */
function initParallax() {
  const media = $('[data-parallax]');
  if (!media || prefersReduced) return;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight * 1.2) {
      media.style.translate = `0 ${y * 0.3}px`;
    }
  }, { passive: true });
}

/* ---------- Onglets de la carte ---------- */
function initTabs() {
  const tabs = $$('.tab');
  const activate = tab => {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = $(`#${t.getAttribute('aria-controls')}`);
      panel.hidden = !on;
      panel.classList.toggle('is-active', on);
    });
    tab.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(tab));
    tab.addEventListener('keydown', e => {
      let idx = null;
      if (e.key === 'ArrowRight') idx = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') idx = (i - 1 + tabs.length) % tabs.length;
      if (idx !== null) { e.preventDefault(); tabs[idx].focus(); activate(tabs[idx]); }
    });
  });
}

/* ---------- Filtre des chats ---------- */
function initCatFilter() {
  const buttons = $$('.filter');
  const cards = $$('.cat-card');
  buttons.forEach(btn => btn.addEventListener('click', () => {
    buttons.forEach(b => b.classList.toggle('is-active', b === btn));
    const f = btn.dataset.filter;
    cards.forEach(card => {
      const show = f === 'all' || card.dataset.status === f;
      card.classList.toggle('is-hidden', !show);
      if (show) {
        card.classList.add('is-visible');
        if (!prefersReduced) card.animate(
          [{ opacity: 0, transform: 'translateY(20px)' }, { opacity: 1, transform: 'none' }],
          { duration: 500, easing: 'cubic-bezier(.22,1,.36,1)' }
        );
      }
    });
  }));
}

/* ---------- Effet 3D + halo sur les cartes univers ---------- */
function initTilt() {
  if (prefersReduced || !window.matchMedia('(hover: hover)').matches) return;
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 6}deg) rotateY(${(x - 0.5) * 8}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}

/* ---------- Galerie + lightbox ---------- */
function initGallery() {
  const items = $$('.g-item');
  const lb = $('#lightbox');
  const img = $('#lbImg');
  const cap = $('#lbCaption');
  let current = 0;
  let lastFocus = null;

  const show = i => {
    current = (i + items.length) % items.length;
    const it = items[current];
    img.style.setProperty('--img', it.style.getPropertyValue('--img'));
    cap.textContent = it.dataset.caption || '';
    img.style.animation = 'none'; void img.offsetWidth; img.style.animation = '';
  };
  const open = i => {
    lastFocus = document.activeElement;
    show(i);
    lb.hidden = false;
    document.body.classList.add('no-scroll');
    $('#lbClose').focus();
  };
  const close = () => {
    lb.hidden = true;
    document.body.classList.remove('no-scroll');
    if (lastFocus) lastFocus.focus();
  };

  items.forEach((it, i) => it.addEventListener('click', () => open(i)));
  $('#lbClose').addEventListener('click', close);
  $('#lbPrev').addEventListener('click', () => show(current - 1));
  $('#lbNext').addEventListener('click', () => show(current + 1));
  lb.addEventListener('click', e => { if (e.target === lb) close(); });
  document.addEventListener('keydown', e => {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });

  // Balayage tactile
  let startX = 0;
  lb.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });
}


/* ---------- Badge ouvert / fermé ---------- */
function initOpenStatus() {
  const el = $('#openStatus');
  if (!el) return;
  const now = new Date();
  const h = now.getHours() + now.getMinutes() / 60;
  const slot = CONFIG.hours[now.getDay()];
  const open = slot && h >= slot[0] && h < slot[1];
  el.textContent = open ? 'Ouvert' : 'Fermé';
  el.classList.add(open ? 'is-open' : 'is-closed');
}

