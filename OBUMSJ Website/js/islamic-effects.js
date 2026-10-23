/**
 * OBUMSJ Islamic Ambient Effects & Gold Particle System
 * GPU-Accelerated Subtle Ambient Gold Dust & Twinkle
 * Oda Bultum University Muslim Students' Jama'a
 */

(function () {
  'use strict';

  var canvas, ctx;
  var animationFrameId = null;
  var particles = [];
  var isRunning = false;
  var width = 0, height = 0, dpr = 1;

  var mouse = {
    x: -9999,
    y: -9999,
    targetX: -9999,
    targetY: -9999,
    radius: 110
  };

  // Color palettes inspired directly by Islamic reference assets
  // Night Mode: warm gold, rich amber, champagne sparks
  var NIGHT_COLORS = [
    { r: 250, g: 224, b: 132 }, // #fae084 (light gold)
    { r: 212, g: 175, b: 55 },  // #d4af37 (pure gold)
    { r: 255, g: 183, b: 3 },   // #ffb703 (warm amber)
    { r: 243, g: 207, b: 122 }, // #f3cf7a (pale amber)
    { r: 255, g: 236, b: 179 }, // #ffecb3 (bright gold sparkle)
    { r: 251, g: 133, b: 0 }    // #fb8500 (deep amber)
  ];

  // Day Mode: cream, ivory, soft burnished ochre and antique brass from cream reference
  var DAY_COLORS = [
    { r: 197, g: 154, b: 63 },  // #c59a3f (burnished gold)
    { r: 229, g: 184, b: 90 },  // #e5b85a (warm ochre)
    { r: 160, g: 113, b: 45 },  // #a0712d (antique brass)
    { r: 218, g: 185, b: 130 }, // #dab982 (champagne shimmer)
    { r: 175, g: 135, b: 75 },  // #af874b (warm bronze)
    { r: 235, g: 215, b: 170 }  // #ebd7aa (soft cream gold)
  ];

  function isReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  function isNightMode() {
    var theme = document.documentElement.getAttribute('data-theme');
    return theme === 'night' || document.body.classList.contains('dark-mode');
  }

  function getParticleCount() {
    var isMobile = window.innerWidth < 768;
    return isMobile ? 20 : 42;
  }

  function createParticle() {
    var colors = isNightMode() ? NIGHT_COLORS : DAY_COLORS;
    var color = colors[Math.floor(Math.random() * colors.length)];
    var size = Math.random() * 1.9 + 0.8; // 0.8px to 2.7px
    var baseVy = -(Math.random() * 0.38 + 0.12); // Gentle upward float
    var baseVx = (Math.random() - 0.5) * 0.22;

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: size,
      baseSize: size,
      vx: baseVx,
      vy: baseVy,
      baseVx: baseVx,
      baseVy: baseVy,
      color: color,
      alpha: Math.random() * 0.45 + 0.2,
      baseAlpha: Math.random() * 0.45 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.008,
      twinkleAngle: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.015 + 0.005,
      wobbleAngle: Math.random() * Math.PI * 2,
      wobbleRadius: Math.random() * 16 + 6
    };
  }

  function initParticles() {
    particles = [];
    var count = getParticleCount();
    for (var i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function resize() {
    if (!canvas) return;
    width = window.innerWidth;
    height = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    if (ctx) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
  }

  function updateParticle(p) {
    p.twinkleAngle += p.twinkleSpeed;
    p.wobbleAngle += p.wobbleSpeed;

    // Soft organic cursor repulsion with gentle fluid inertia
    var dx = p.x - mouse.x;
    var dy = p.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < mouse.radius && dist > 0) {
      var normDist = dist / mouse.radius;
      var force = Math.pow(1 - normDist, 1.6) * 0.45;
      p.vx += (dx / dist) * force;
      p.vy += (dy / dist) * force;
    }

    // Fluid velocity friction & gradual natural recovery to ambient drift
    p.vx *= 0.94;
    p.vy = p.vy * 0.95 + p.baseVy * 0.05;

    // Upward drift with soft sine wobble
    p.x += p.vx + Math.cos(p.wobbleAngle) * 0.22;
    p.y += p.vy;

    // Breathing twinkle alpha calculation
    var isNight = isNightMode();
    var alphaMultiplier = isNight ? 1.0 : 0.42;
    p.alpha = (p.baseAlpha + Math.sin(p.twinkleAngle) * 0.25) * alphaMultiplier;
    if (p.alpha < 0.04) p.alpha = 0.04;

    // Screen boundary wrap-around
    if (p.y < -20) {
      p.y = height + 10;
      p.x = Math.random() * width;
    }
    if (p.x < -20) p.x = width + 10;
    if (p.x > width + 20) p.x = -10;
  }

  function render() {
    if (!isRunning || !ctx) return;

    ctx.clearRect(0, 0, width, height);

    // Smooth mouse position damping towards pointer target
    mouse.x += (mouse.targetX - mouse.x) * 0.12;
    mouse.y += (mouse.targetY - mouse.y) * 0.12;

    var isNight = isNightMode();

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      updateParticle(p);

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);

      var fillCol = 'rgba(' + p.color.r + ',' + p.color.g + ',' + p.color.b + ',' + p.alpha + ')';
      ctx.fillStyle = fillCol;

      // Soft glow aura for larger particles in night mode
      if (isNight && p.size > 1.6) {
        ctx.shadowBlur = 8;
        ctx.shadowColor = 'rgba(255, 183, 3, 0.45)';
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.fill();
      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  function start() {
    if (isRunning) return;
    if (isReducedMotion()) return;
    isRunning = true;
    render();
  }

  function stop() {
    isRunning = false;
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
  }

  function mountCanvas() {
    if (document.querySelector('.islamic-particles-canvas')) return;

    canvas = document.createElement('canvas');
    canvas.className = 'islamic-particles-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:-1;';

    document.body.appendChild(canvas);
    ctx = canvas.getContext('2d');

    resize();
    initParticles();

    if (!isReducedMotion()) {
      start();
    }

    // Resize handler with debounce
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resize();
        initParticles();
      }, 150);
    });

    // Pointer move listener with passive option
    window.addEventListener('mousemove', function (e) {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    }, { passive: true });

    window.addEventListener('mouseleave', function () {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    });

    // Touch support for mobile pointer reactivity
    window.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchmove', function (e) {
      if (e.touches && e.touches[0]) {
        mouse.targetX = e.touches[0].clientX;
        mouse.targetY = e.touches[0].clientY;
      }
    }, { passive: true });

    window.addEventListener('touchend', function () {
      mouse.targetX = -9999;
      mouse.targetY = -9999;
    });

    // Pause when tab is not active to save battery
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else if (!isReducedMotion()) {
        start();
      }
    });

    // Handle OS reduced motion preference changes
    if (window.matchMedia) {
      var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      var handleMotionChange = function (e) {
        if (e.matches) {
          stop();
          if (ctx) ctx.clearRect(0, 0, width, height);
        } else {
          start();
        }
      };
      if (motionQuery.addEventListener) {
        motionQuery.addEventListener('change', handleMotionChange);
      } else if (motionQuery.addListener) {
        motionQuery.addListener(handleMotionChange);
      }
    }

    // React to theme changes
    window.addEventListener('obumsj:themeChanged', function () {
      var colors = isNightMode() ? NIGHT_COLORS : DAY_COLORS;
      for (var i = 0; i < particles.length; i++) {
        particles[i].color = colors[Math.floor(Math.random() * colors.length)];
      }
    });
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountCanvas);
  } else {
    mountCanvas();
  }

  // Global API
  window.OBUMSJ_EFFECTS = {
    start: start,
    stop: stop,
    refresh: function () {
      resize();
      initParticles();
    }
  };

})();
