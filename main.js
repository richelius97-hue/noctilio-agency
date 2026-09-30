/* =========================================================
   NOCTILIO — Interactions
   ========================================================= */
(() => {
  'use strict';

  document.documentElement.classList.add('js');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: scrolled state ---------- */
  const header = document.querySelector('.header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ---------- Mobile nav ---------- */
  const burger = document.querySelector('.burger');
  const mobileNav = document.querySelector('.mobile-nav');
  if (burger && mobileNav) {
    const toggle = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      mobileNav.classList.toggle('is-open', open);
      mobileNav.setAttribute('aria-hidden', String(!open));
    };
    burger.addEventListener('click', () => {
      toggle(burger.getAttribute('aria-expanded') !== 'true');
    });
    mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggle(false)));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') toggle(false);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('is-inview');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-inview'));
  }

  /* ---------- Signal network ---------- */
  document.querySelectorAll('[data-network]').forEach(initNetwork);

  function initNetwork(root) {
    const nodes = root.querySelectorAll('.network__node');
    const edges = root.querySelectorAll('.network__edge');
    const panelItems = root.querySelectorAll('.network__panel__items > *');
    const hint = root.querySelector('.network__panel .hint');
    if (!nodes.length) return;

    const activate = (id) => {
      nodes.forEach(n => {
        const isActive = n.dataset.node === id;
        n.classList.toggle('is-active', isActive);
        n.setAttribute('aria-selected', String(isActive));
      });
      edges.forEach(e => {
        const [a, b] = (e.dataset.between || '').split('|');
        e.classList.toggle('is-active', a === id || b === id);
      });
      panelItems.forEach(p => p.classList.toggle('is-visible', p.dataset.node === id));
      if (hint) hint.hidden = true;
    };

    nodes.forEach(n => {
      n.setAttribute('role', 'button');
      n.setAttribute('tabindex', '0');
      n.setAttribute('aria-selected', 'false');
      const id = n.dataset.node;
      n.addEventListener('click', () => activate(id));
      n.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(id); }
      });
      n.addEventListener('mouseenter', () => {
        if (!root.querySelector('.network__node.is-active')) activate(id);
      });
    });
  }

  /* ---------- Flight path draw on scroll ---------- */
  document.querySelectorAll('.path').forEach(path => {
    const line = path.querySelector('.path__line');
    const stages = path.querySelectorAll('.path__stage');
    if (line) {
      const len = line.getTotalLength ? line.getTotalLength() : 2400;
      line.style.setProperty('--len', len);
      line.style.strokeDasharray = len;
      line.style.strokeDashoffset = len;
    }
    if (reduceMotion) {
      path.classList.add('is-inview');
      stages.forEach(s => s.classList.add('is-active'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          path.classList.add('is-inview');
          stages.forEach((s, i) => {
            setTimeout(() => s.classList.add('is-active'), 300 + i * 260);
          });
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    io.observe(path);
  });

  /* ---------- Year ---------- */
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });
})();