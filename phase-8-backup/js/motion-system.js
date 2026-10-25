/**
 * OBUMSJ Unified Motion & Interaction Engine
 * Phase 4: Premium Motion System
 * Oda Bultum University Muslim Students' Jama'a
 */

(function () {
  'use strict';

  function isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  // ============================================================
  // 1. PROGRESSIVE ENHANCEMENT SCROLL REVEAL OBSERVER
  // ============================================================
  function initScrollReveal() {
    if (isReducedMotion()) {
      // For reduced motion, ensure all elements are immediately visible
      document.querySelectorAll('.reveal-on-scroll, .reveal-up, .reveal-description').forEach(function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    // Mark HTML as JS reveal-ready so CSS only animates elements once JS is active
    document.documentElement.classList.add('js-reveal-ready');

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-on-scroll, .reveal-up, .reveal-description').forEach(function (el) {
        el.classList.add('is-revealed');
      });
      return;
    }

    var revealSelectors = [
      '.reveal-on-scroll',
      '.reveal-up',
      '.reveal-description',
      '.feature-card',
      '.blog-card',
      '.event-card',
      '.sector-card',
      '.sector-detailed-card',
      '.stat-card',
      '.stat-box',
      '.stat-item',
      '.vm-card',
      '.testimonial-card',
      '.two-column-grid',
      '.frame-card',
      '.member-card',
      '.section-card'
    ];

    var elements = document.querySelectorAll(revealSelectors.join(', '));
    if (elements.length === 0) return;

    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          obs.unobserve(entry.target); // Trigger once only!
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    elements.forEach(function (el) {
      if (!el.classList.contains('reveal-on-scroll') && !el.classList.contains('reveal-up') && !el.classList.contains('reveal-description')) {
        el.classList.add('reveal-on-scroll');
      }
      observer.observe(el);
    });
  }

  // ============================================================
  // 2. UNIFIED ANIMATED NUMBER COUNTERS
  // ============================================================
  function animateCounter(el) {
    if (el.classList.contains('counted')) return;

    var targetAttr = el.getAttribute('data-target');
    var target = parseInt(targetAttr, 10);
    if (isNaN(target)) {
      var parsed = parseInt(el.textContent.replace(/[^\d]/g, ''), 10);
      if (!isNaN(parsed)) target = parsed;
      else return;
    }

    var prefix = el.getAttribute('data-prefix') || '';
    var suffix = el.getAttribute('data-suffix') || '';

    // Automatically detect existing suffixes if not explicitly set
    if (!suffix && !el.classList.contains('no-plus')) {
      if (el.textContent.indexOf('+') !== -1 || target >= 20) {
        suffix = '+';
      } else if (el.textContent.indexOf('%') !== -1) {
        suffix = '%';
      }
    }

    el.classList.add('counted');

    if (isReducedMotion()) {
      el.textContent = prefix + target.toLocaleString() + suffix;
      el.classList.add('animated');
      return;
    }

    var duration = 1600; // 1.6s smooth count
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      // Smooth cubic ease-out
      var easeOut = 1 - Math.pow(1 - progress, 3);
      var current = Math.floor(target * easeOut);

      el.textContent = prefix + current.toLocaleString() + (progress >= 1 ? suffix : '');

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = prefix + target.toLocaleString() + suffix;
        el.classList.add('animated');
      }
    }

    requestAnimationFrame(step);
  }

  function initCounters() {
    var counters = document.querySelectorAll('.counter, [data-counter]');
    if (counters.length === 0) return;

    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
      return;
    }

    var counterObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          obs.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -20px 0px'
    });

    counters.forEach(function (c) {
      counterObserver.observe(c);
    });
  }

  // ============================================================
  // 3. TITLE TYPEWRITER EFFECT (Major Hero Titles Only)
  // ============================================================
  function initTypewriter() {
    var targets = document.querySelectorAll('.typewriter-title, [data-typewriter]');
    if (targets.length === 0) return;

    targets.forEach(function (heading) {
      if (heading._hasTypewriter) return;
      heading._hasTypewriter = true;

      // Extract phrases or use existing text
      var rawPhrases = heading.getAttribute('data-typewriter-phrases');
      var phrases = [];
      if (rawPhrases) {
        try {
          phrases = JSON.parse(rawPhrases);
        } catch (e) {
          phrases = rawPhrases.split('|').map(function (s) { return s.trim(); });
        }
      }
      if (!phrases || phrases.length === 0) {
        var baseText = heading.textContent.trim() || 'Welcome to OBUMSJ';
        phrases = [
          baseText,
          'Faith, Unity & Academic Excellence',
          "Oda Bultum University Muslim Students' Jama'a"
        ];
      }

      // Reduced motion: render complete first phrase immediately
      if (isReducedMotion()) {
        heading.textContent = phrases[0];
        return;
      }

      // Preserve layout: ensure min-height to prevent jumping
      heading.style.minHeight = '1.3em';
      heading.style.display = 'inline-block';

      // Accessibility: full phrase accessible to screen readers
      heading.innerHTML =
        '<span class="sr-only">' + phrases[0] + '</span>' +
        '<span class="typewriter-text" aria-hidden="true"></span>' +
        '<span class="typewriter-cursor" aria-hidden="true">|</span>';

      var textEl = heading.querySelector('.typewriter-text');
      var srEl = heading.querySelector('.sr-only');
      var phraseIdx = 0;
      var charIdx = 0;
      var isDeleting = false;
      var timer = null;

      function type() {
        if (!textEl) return;
        var currentPhrase = phrases[phraseIdx];

        if (isDeleting) {
          charIdx--;
          textEl.textContent = currentPhrase.substring(0, charIdx);
        } else {
          charIdx++;
          textEl.textContent = currentPhrase.substring(0, charIdx);
        }

        var speed = isDeleting ? 38 : 75; // Typing speed (ms)

        if (!isDeleting && charIdx === currentPhrase.length) {
          // Pause at complete word
          speed = 2800;
          isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
          isDeleting = false;
          phraseIdx = (phraseIdx + 1) % phrases.length;
          if (srEl) srEl.textContent = phrases[phraseIdx];
          speed = 500; // Pause before next word
        }

        timer = setTimeout(type, speed);
      }

      type();

      // Listen for language change to adapt phrase
      window.addEventListener('obumsj:languageChanged', function (e) {
        clearTimeout(timer);
        if (textEl) textEl.textContent = heading.textContent;
      });
    });
  }

  // ============================================================
  // 4. SUBTLE BACKGROUND STAR LIGHTING
  // ============================================================
  function initStarLighting() {
    var containers = document.querySelectorAll(
      '.header, .hero-section, .slideshow-container, .auth-card, .login-container, .member-login-container, .card-form, .visit-section, .hero-banner, header, .dept-header, .page-hero, .form-card'
    );

    containers.forEach(function (container) {
      if (container.querySelector('.islamic-stars-backdrop')) return;

      var backdrop = document.createElement('div');
      backdrop.className = 'islamic-stars-backdrop';
      backdrop.setAttribute('aria-hidden', 'true');

      // Make parent relative if static
      var computedStyle = window.getComputedStyle(container);
      if (computedStyle.position === 'static') {
        container.style.position = 'relative';
      }

      var starCount = window.innerWidth < 768 ? 6 : 10;
      for (var i = 0; i < starCount; i++) {
        var star = document.createElement('div');
        star.className = 'star-mote' + (i % 3 === 0 ? ' star-8point' : '');

        var size = Math.random() * 4 + 3; // 3px to 7px
        var top = Math.random() * 85 + 5; // 5% to 90%
        var left = Math.random() * 90 + 5; // 5% to 95%
        var duration = Math.random() * 5 + 6; // 6s to 11s
        var delay = Math.random() * 5; // 0s to 5s

        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.top = top + '%';
        star.style.left = left + '%';
        star.style.setProperty('--star-duration', duration + 's');
        star.style.animationDelay = delay + 's';

        backdrop.appendChild(star);
      }

      container.prepend(backdrop);
    });
  }

  // ============================================================
  // 5. MOVING BUTTON BORDER ENHANCEMENT
  // ============================================================
  function initMovingBorders() {
    var ctaButtons = document.querySelectorAll(
      '.hero-btn, .btn-donate, .btn-primary.btn-lg, .auth-btn-primary, [data-action="donate"], .header-btns .btn:first-child'
    );

    ctaButtons.forEach(function (btn) {
      if (!btn.classList.contains('btn-moving-border')) {
        btn.classList.add('btn-moving-border');
      }
    });
  }

  // ============================================================
  // INITIALIZATION & GLOBAL EXPOSURE
  // ============================================================
  function init() {
    initMovingBorders();
    initScrollReveal();
    initCounters();
    initTypewriter();
    initStarLighting();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.OBUMSJ_MOTION = {
    init: init,
    initScrollReveal: initScrollReveal,
    initCounters: initCounters,
    initTypewriter: initTypewriter,
    initStarLighting: initStarLighting,
    initMovingBorders: initMovingBorders,
    animateCounter: animateCounter,
    animateAllCounters: function () {
      document.querySelectorAll('.counter').forEach(animateCounter);
    }
  };

})();
