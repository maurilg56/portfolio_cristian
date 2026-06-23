/* ═══════════════════════════════════════════════════════════
   CRISTIAN LEDESMA — PORTFOLIO  ·  script.js
═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Helpers ───────────────────────────────────────────── */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ─── Init after DOM ready ──────────────────────────────── */
  document.addEventListener('DOMContentLoaded', () => {

    /* Remove loading class once fonts / assets are ready */
    if (document.readyState === 'complete') {
      document.body.classList.remove('loading');
    } else {
      window.addEventListener('load', () => {
        document.body.classList.remove('loading');
      });
    }

    initCursor();
    initNav();
    initMobileMenu();
    initReveal();
    initCounters();
    initSmoothScroll();
    initForm();
  });

  /* ═══════════ CUSTOM CURSOR ══════════════════════════════ */
  function initCursor() {
    const cursor    = $('#cursor');
    const cursorDot = $('#cursorDot');
    if (!cursor || !cursorDot) return;

    /* Only on pointer devices (not touchscreen) */
    if (window.matchMedia('(pointer: coarse)').matches) {
      cursor.style.display    = 'none';
      cursorDot.style.display = 'none';
      return;
    }

    const darkSections = $$('.about, .services, .contact, .footer, .ticker');

    function isDark(x, y) {
      for (const section of darkSections) {
        const r = section.getBoundingClientRect();
        if (y >= r.top && y <= r.bottom && x >= r.left && x <= r.right) return true;
      }
      return false;
    }

    /* Both elements follow mouse instantly — zero lag */
    document.addEventListener('mousemove', e => {
      const pos = `translate(calc(${e.clientX}px - 50%), calc(${e.clientY}px - 50%))`;
      cursor.style.transform    = pos;
      cursorDot.style.transform = pos;

      const dark = isDark(e.clientX, e.clientY);
      cursor.classList.toggle('is-dark', dark);
      cursorDot.classList.toggle('is-dark', dark);
    }, { passive: true });

    /* Hover effect on interactive elements */
    const interactiveSelector = 'a, button, input, textarea, label';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.add('is-hover');
        cursorDot.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.remove('is-hover');
        cursorDot.classList.remove('is-hover');
      }
    });
  }

  /* ═══════════ NAVIGATION ═════════════════════════════════ */
  function initNav() {
    const nav = $('#nav');
    if (!nav) return;

    function onScroll() {
      nav.classList.toggle('is-scrolled', window.scrollY > 60);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); /* run once in case page loads mid-scroll */
  }

  /* ═══════════ MOBILE MENU ════════════════════════════════ */
  function initMobileMenu() {
    const burger     = $('#burger');
    const mobileMenu = $('#mobileMenu');
    if (!burger || !mobileMenu) return;

    function toggle(force) {
      const open = force !== undefined ? force : !mobileMenu.classList.contains('is-open');
      mobileMenu.classList.toggle('is-open', open);
      mobileMenu.setAttribute('aria-hidden', String(!open));
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      document.body.style.overflow = open ? 'hidden' : '';
    }

    burger.addEventListener('click', () => toggle());

    $$('.mobile-link', mobileMenu).forEach(link => {
      link.addEventListener('click', () => toggle(false));
    });

    /* Close on Escape */
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) toggle(false);
    });
  }

  /* ═══════════ SCROLL REVEAL ══════════════════════════════ */
  function initReveal() {
    const items = $$('.reveal-item');
    if (!items.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const el    = entry.target;
        const delay = el.dataset.delay;
        if (delay) el.style.transitionDelay = `${delay}s`;

        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    }, {
      threshold:  0.12,
      rootMargin: '0px 0px -60px 0px'
    });

    items.forEach(el => observer.observe(el));
  }

  /* ═══════════ COUNTER ANIMATION ══════════════════════════ */
  function initCounters() {
    const counters    = $$('.stat__num[data-target]');
    const statsWrap   = $('.hero__stats');
    if (!counters.length || !statsWrap) return;

    let started = false;

    const observer = new IntersectionObserver(entries => {
      if (started) return;
      if (!entries[0].isIntersecting) return;

      started = true;
      observer.disconnect();

      counters.forEach(counter => {
        const target   = parseInt(counter.dataset.target, 10);
        const duration = 1600; /* ms */
        const startTime = performance.now();

        function tick(now) {
          const elapsed  = now - startTime;
          const progress = Math.min(elapsed / duration, 1);
          /* easeOutCubic */
          const eased    = 1 - Math.pow(1 - progress, 3);
          counter.textContent = Math.round(eased * target);
          if (progress < 1) requestAnimationFrame(tick);
        }

        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });

    observer.observe(statsWrap);
  }

  /* ═══════════ SMOOTH SCROLL ══════════════════════════════ */
  function initSmoothScroll() {
    const NAV_H = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-h'),
      10
    ) || 80;

    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', e => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        const target = $(href);
        if (!target) return;
        e.preventDefault();

        const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
        window.scrollTo({ top, behavior: 'smooth' });
      });
    });
  }

  /* ═══════════ CONTACT FORM ═══════════════════════════════ */
  function initForm() {
    const form        = $('#contactForm');
    const formSuccess = $('#formSuccess');
    if (!form || !formSuccess) return;

    form.addEventListener('submit', e => {
      e.preventDefault();

      /* Basic validation */
      const name  = form.querySelector('#cName').value.trim();
      const email = form.querySelector('#cEmail').value.trim();
      const msg   = form.querySelector('#cMsg').value.trim();

      if (!name || !email || !msg) return;

      /* Simple email format check */
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(email)) return;

      const btn      = form.querySelector('button[type="submit"]');
      const btnLabel = btn.querySelector('span');

      btn.disabled    = true;
      btnLabel.textContent = 'Enviando…';

      /* Simulate async send */
      setTimeout(() => {
        form.reset();
        btn.disabled         = false;
        btnLabel.textContent = 'Enviar mensaje';
        formSuccess.classList.add('is-shown');

        setTimeout(() => {
          formSuccess.classList.remove('is-shown');
        }, 5500);
      }, 900);
    });
  }

})();
