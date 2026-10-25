/**
 * OBUMSJ Theme Engine & Atmosphere Injector
 * Premium Islamic Design System | Day & Night Theme Manager
 * Oda Bultum University Muslim Students' Jama'a
 */

(function () {
  'use strict';

  var THEME_STORAGE_KEY = 'obumsj_theme';
  var LEGACY_STORAGE_KEY = 'theme';

  // SVG Icons for Theme Toggle (Sun and Crescent Moon with 8-point Islamic Star)
  var MOON_ICON_SVG = '<svg class="theme-icon icon-moon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>' +
    '<circle cx="16" cy="7" r="1" fill="currentColor"></circle>' +
    '</svg>';

  var SUN_ICON_SVG = '<svg class="theme-icon icon-sun" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
    '<circle cx="12" cy="12" r="5" fill="currentColor"></circle>' +
    '<line x1="12" y1="1" x2="12" y2="3"></line>' +
    '<line x1="12" y1="21" x2="12" y2="23"></line>' +
    '<line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>' +
    '<line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>' +
    '<line x1="1" y1="12" x2="3" y2="12"></line>' +
    '<line x1="21" y1="21" x2="23" y2="12"></line>' +
    '<line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>' +
    '<line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>' +
    '</svg>';

  /**
   * Determine preferred initial theme
   */
  function getPreferredTheme() {
    var stored = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    } catch (e) {
      console.warn('[OBUMSJ Theme] LocalStorage inaccessible:', e);
    }

    if (stored === 'night' || stored === 'dark') {
      return 'night';
    }
    if (stored === 'day' || stored === 'light') {
      return 'day';
    }

    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'night';
    }
    return 'day';
  }

  /**
   * Apply theme tokens to DOM
   */
  function applyTheme(theme, animate) {
    var isNight = (theme === 'night');
    var root = document.documentElement;
    var body = document.body;

    if (root) {
      root.setAttribute('data-theme', theme);
      if (isNight) {
        root.classList.add('dark-mode');
      } else {
        root.classList.remove('dark-mode');
      }
    }

    if (body) {
      body.setAttribute('data-theme', theme);
      if (isNight) {
        body.classList.add('dark-mode');
      } else {
        body.classList.remove('dark-mode');
      }
    }

    // Save to storage
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      localStorage.setItem(LEGACY_STORAGE_KEY, isNight ? 'dark' : 'light');
    } catch (e) {
      console.warn('[OBUMSJ Theme] Could not save preference:', e);
    }

    // Update all toggle controls across the page
    updateToggleButtons(isNight);

    // Notify listeners
    try {
      var event = new CustomEvent('obumsj:themeChanged', {
        detail: { theme: theme, isNight: isNight }
      });
      window.dispatchEvent(event);
    } catch (e) {}
  }

  /**
   * Update all theme toggle buttons in DOM
   */
  function updateToggleButtons(isNight) {
    var buttons = document.querySelectorAll(
      '#darkModeToggle, .dark-btn, .theme-toggle-control, [data-action="toggle-theme"]'
    );

    buttons.forEach(function (btn) {
      btn.setAttribute('aria-pressed', isNight ? 'true' : 'false');
      btn.setAttribute('aria-label', isNight ? 'Switch to Day Theme' : 'Switch to Night Theme');
      btn.title = isNight ? 'Switch to Day Theme' : 'Switch to Night Theme';

      // Insert or update SVG icon
      btn.innerHTML = isNight ? SUN_ICON_SVG : MOON_ICON_SVG;

      // Ensure proper styling classes
      if (!btn.classList.contains('theme-toggle-ready')) {
        btn.classList.add('theme-toggle-ready');
      }
    });
  }

  /**
   * Toggle between day and night
   */
  function toggleTheme() {
    var current = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    var next = (current === 'night') ? 'day' : 'night';
    applyTheme(next, true);
    return next;
  }

  /**
   * Setup click listeners on all theme toggle buttons
   */
  function attachListeners() {
    var buttons = document.querySelectorAll(
      '#darkModeToggle, .dark-btn, .theme-toggle-control, [data-action="toggle-theme"]'
    );

    buttons.forEach(function (btn) {
      if (btn._hasThemeListener) return;
      btn._hasThemeListener = true;

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleTheme();
      });

      btn.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleTheme();
        }
      });
    });

    // Listen for OS system theme changes
    if (window.matchMedia) {
      var mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', function (e) {
          var userSaved = localStorage.getItem(THEME_STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
          if (!userSaved) {
            applyTheme(e.matches ? 'night' : 'day', true);
          }
        });
      }
    }
  }

  /**
   * Inject Islamic Atmosphere (Wallpaper, Vignette, Hanging Lanterns)
   */
  function injectIslamicAtmosphere() {
    if (!document.body) return;

    // 1. Seamless Background Wallpaper
    if (!document.querySelector('.islamic-bg-wallpaper')) {
      var wallpaper = document.createElement('div');
      wallpaper.className = 'islamic-bg-wallpaper';
      wallpaper.setAttribute('aria-hidden', 'true');
      document.body.prepend(wallpaper);
    }

    // 2. Radial Lighting Vignette
    if (!document.querySelector('.islamic-lighting-vignette')) {
      var vignette = document.createElement('div');
      vignette.className = 'islamic-lighting-vignette';
      vignette.setAttribute('aria-hidden', 'true');
      document.body.prepend(vignette);
    }

    // 3. Hanging Corner Lanterns (Dual Left & Right)
    if (!document.querySelector('.islamic-corner-lantern.lantern-left')) {
      var lanternLeft = document.createElement('div');
      lanternLeft.className = 'islamic-corner-lantern lantern-left';
      lanternLeft.setAttribute('aria-hidden', 'true');
      lanternLeft.innerHTML = '<img src="./IMAGE/decorative/lantern.svg" alt="" width="82" height="195" loading="lazy">';
      document.body.appendChild(lanternLeft);
    }

    if (!document.querySelector('.islamic-corner-lantern.lantern-right')) {
      var lanternRight = document.createElement('div');
      lanternRight.className = 'islamic-corner-lantern lantern-right';
      lanternRight.setAttribute('aria-hidden', 'true');
      lanternRight.innerHTML = '<img src="./IMAGE/decorative/lantern.svg" alt="" width="82" height="195" loading="lazy">';
      document.body.appendChild(lanternRight);
    }

    // 4. Ambient Gold Particle System
    if (!document.querySelector('script[src*="islamic-effects.js"]')) {
      var effectScript = document.createElement('script');
      effectScript.src = './js/islamic-effects.js';
      effectScript.defer = true;
      document.head.appendChild(effectScript);
    }
  }

  // 1. Synchronous Immediate Application (Prevents White Flash)
  var initialTheme = getPreferredTheme();
  if (document.documentElement) {
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (initialTheme === 'night') {
      document.documentElement.classList.add('dark-mode');
    }
  }

  // 2. DOM Ready Initialization
  function initDOM() {
    applyTheme(initialTheme, false);
    attachListeners();
    injectIslamicAtmosphere();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDOM);
  } else {
    initDOM();
  }

  // 3. Expose Global API
  window.OBUMSJ_THEME = {
    getTheme: function () {
      return document.documentElement.getAttribute('data-theme') || getPreferredTheme();
    },
    isNight: function () {
      return this.getTheme() === 'night';
    },
    setTheme: function (theme) {
      applyTheme(theme === 'night' ? 'night' : 'day', true);
    },
    toggleTheme: toggleTheme,
    refreshButtons: function () {
      updateToggleButtons(document.documentElement.getAttribute('data-theme') === 'night');
      attachListeners();
    },
    injectAtmosphere: injectIslamicAtmosphere
  };

})();
