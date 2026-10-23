/**
 * OBUMSJ Islamic Ambient Effects & Gold Particle System
 * GPU-Accelerated Subtle Ambient Gold Dust & Twinkle
 * Oda Bultum University Muslim Students' Jama'a
 */

(function () {
  'use strict';

  // Check prefers-reduced-motion
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    console.log('[OBUMSJ Effects] Reduced motion preferred. Particle engine disabled.');
    return;
  }

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
    radius: 90
  };

  // Color palettes
  var NIGHT_COLORS = [
    { r: 250, g: 224, b: 132 }, // #fae084 (light gold)
    { r: 212, g: 175, b: 55 },  // #d4af37 (pure gold)
    { r: 255, g: 183, b: 3 },   // #ffb703 (warm amber)
    { r: 243, g: 207, b: 122 }  // #f3cf7a (pale amber)
  ];

  var DAY_COLORS = [
    { r: 197, g: 154, b: 63 },  // #c59a3f (burnished gold)
    { r: 229, g: 184, b: 90 },  // #e5b85a (warm ochre)
    { r: 160, g: 113, b: 45 }   // #a0712d (antique brass)
  ];

  function isNightMode() {
    var theme = document.documentElement.getAttribute('data-theme');
    return theme === 'night' || document.body.classList.contains('dark-mode');
  }

  function getParticleCount() {
    var isMobile = window.innerWidth < 768;
    return isMobile ? 22 : 45;
  }

  function createParticle() {
    var colors = isNightMode() ? NIGHT_COLORS : DAY_COLORS;
    var color = colors[Math.floor(Math.random() * colors.length)];
    var size = Math.random() * 1.8 + 0.8; // 0.8px to 2.6px

    return {
      x: Math.random() * width,
      y: Math.random() * height,
      size: size,
      baseSize: size,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -(Math.random() * 0.45 + 0.15), // Gentle upward drift
      color: color,
      alpha: Math.random() * 0.5 + 0.2,
      baseAlpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.01,
      twinkleAngle: Math.random() * Math.PI * 2,
      wobbleSpeed: Math.random() * 0.015 + 0.005,
      wobbleAngle: Math.random() * Math.PI * 2,
      wobbleRadius: Math.random() * 18 + 6
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

    // Upward drift with soft sine wobble
    p.y += p.vy;
    p.x += p.vx + Math.cos(p.wobbleAngle) * 0.25;

    // Calculate dynamic alpha (breathing twinkle)
    var isNight = isNightMode();
    var alphaMultiplier = isNight ? 1.0 : 0.45;
    p.alpha = (p.baseAlpha + Math.sin(p.twinkleAngle) * 0.25) * alphaMultiplier;
    if (p.alpha < 0.05) p.alpha = 0.05;

    // Soft cursor repulsion
    var dx = p.x - mouse.x;
    var dy = p.y - mouse.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < mouse.radius && dist > 0) {
      var force = (1 - dist / mouse.radius) * 1.5;
      p.x += (dx / dist) * force;
      p.y += (dy / dist) * force;
    }

    // Wrap around screen boundaries
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

    // Smooth mouse position damping
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

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
      }

      ctx.fill();
      ctx.restore();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  function start() {
    if (isRunning) return;
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
    start();

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

    // Pause when tab is not active to save battery
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        stop();
      } else {
        start();
      }
    });

    // React to theme changes
    window.addEventListener('obumsj:themeChanged', function () {
      // Re-assign colors to existing particles
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
