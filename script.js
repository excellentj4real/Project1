/* ============================================================
   TREAL TIMEPIECES — script.js
   Handles: navbar scroll, mobile menu, hero canvas particles,
   scroll reveal animations, footer year, live clock hands
   ============================================================ */

'use strict';

/* ============================================================
   1. UTILITY: Wait for DOM to be fully loaded
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {

  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initHeroCanvas();
  initLiveClocks();
  initFooterYear();

});


/* ============================================================
   2. NAVBAR — Shrinks & gains backdrop blur on scroll
   ============================================================ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  // Add 'scrolled' class when user scrolls past 60px
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  // Use passive listener for scroll performance
  window.addEventListener('scroll', handleScroll, { passive: true });

  // Run once on load in case page is already scrolled
  handleScroll();
}


/* ============================================================
   3. MOBILE MENU — Hamburger toggle with body scroll lock
   ============================================================ */
function initMobileMenu() {
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!hamburger || !mobileMenu) return;

  // Track open/closed state
  let isOpen = false;

  const openMenu = () => {
    isOpen = true;
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden'; // Prevent background scroll
  };

  const closeMenu = () => {
    isOpen = false;
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  };

  // Toggle on hamburger click
  hamburger.addEventListener('click', () => {
    isOpen ? closeMenu() : openMenu();
  });

  // Close menu when a mobile link is clicked
  const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
  mobileLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) closeMenu();
  });
}


/* ============================================================
   4. SCROLL REVEAL — Animate elements as they enter viewport
   Uses IntersectionObserver for performance
   ============================================================ */
function initScrollReveal() {
  // Select all elements with reveal classes
  const revealElements = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  if (!revealElements.length) return;

  // Create observer — triggers when 15% of element is visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Add visible class to trigger CSS transition
        entry.target.classList.add('is-visible');
        // Stop observing once revealed (one-time animation)
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,       // 15% of element must be visible
    rootMargin: '0px 0px -40px 0px' // Trigger slightly before bottom edge
  });

  // Observe each element
  revealElements.forEach(el => observer.observe(el));

  // Immediately reveal anything already in view on load
  // (e.g. hero content above the fold)
  revealElements.forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      // Small delay to allow CSS to paint first
      setTimeout(() => el.classList.add('is-visible'), 100);
    }
  });
}


/* ============================================================
   5. HERO CANVAS — Floating gold particle field
   Creates atmosphere with slow-drifting golden particles
   ============================================================ */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  let width, height;

  /* --- Resize canvas to match hero section --- */
  const resize = () => {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  };

  /* --- Particle class --- */
  class Particle {
    constructor() {
      this.reset(true);
    }

    // Initialise or re-initialise position/velocity
    reset(initial = false) {
      this.x    = Math.random() * width;
      // On initial spawn scatter vertically; on reset start from bottom
      this.y    = initial ? Math.random() * height : height + 10;
      this.size = Math.random() * 1.5 + 0.3;    // 0.3–1.8px
      this.speedY  = -(Math.random() * 0.4 + 0.1); // Float upward slowly
      this.speedX  = (Math.random() - 0.5) * 0.2;  // Gentle horizontal drift
      this.opacity = Math.random() * 0.5 + 0.1;    // 0.1–0.6 opacity
      this.twinkle = Math.random() * Math.PI * 2;   // Phase offset for twinkling
    }

    // Update position each frame
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      // Gentle twinkle by oscillating opacity
      this.twinkle += 0.02;
      this.currentOpacity = this.opacity * (0.7 + 0.3 * Math.sin(this.twinkle));

      // Reset if particle floats off-screen
      if (this.y < -10) this.reset(false);
      // Wrap horizontal edges
      if (this.x < 0)      this.x = width;
      if (this.x > width)  this.x = 0;
    }

    // Draw as a small glowing gold dot
    draw() {
      ctx.save();
      ctx.globalAlpha = this.currentOpacity;

      // Soft glow using radial gradient
      const gradient = ctx.createRadialGradient(
        this.x, this.y, 0,
        this.x, this.y, this.size * 3
      );
      gradient.addColorStop(0,   `rgba(201, 168, 76, 1)`);
      gradient.addColorStop(0.4, `rgba(201, 168, 76, 0.4)`);
      gradient.addColorStop(1,   `rgba(201, 168, 76, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Hard centre dot
      ctx.globalAlpha = this.currentOpacity * 0.8;
      ctx.fillStyle = '#e8d5a3';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /* --- Create particle pool --- */
  const createParticles = () => {
    // Density: 1 particle per ~6000px² of canvas area
    const count = Math.floor((width * height) / 6000);
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  };

  /* --- Animation loop --- */
  const animate = () => {
    // Clear with a slight fade trail for motion blur effect
    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    animationId = requestAnimationFrame(animate);
  };

  /* --- Handle window resize --- */
  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animationId);
      resize();
      createParticles();
      animate();
    }, 200);
  };

  window.addEventListener('resize', onResize, { passive: true });

  // Pause animation when tab is hidden (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });

  /* --- Initialise --- */
  resize();
  createParticles();
  animate();
}


/* ============================================================
   6. LIVE CLOCK HANDS — Watch illustrations show real time
   Updates hour and minute hands every second
   ============================================================ */
function initLiveClocks() {
  // Select all watch hand pairs within illustrations
  const illustrations = document.querySelectorAll('.watch-illustration');
  if (!illustrations.length) return;

  const updateHands = () => {
    const now     = new Date();
    const hours   = now.getHours() % 12;   // 0–11
    const minutes = now.getMinutes();       // 0–59
    const seconds = now.getSeconds();       // 0–59

    // Smooth second-level interpolation for minute hand
    const minuteDeg = (minutes + seconds / 60) * 6;         // 360° / 60 = 6° per minute
    const hourDeg   = (hours + minutes / 60) * 30;          // 360° / 12 = 30° per hour

    illustrations.forEach(illus => {
      const hourHand   = illus.querySelector('.hour-hand');
      const minuteHand = illus.querySelector('.minute-hand');

      if (hourHand)   hourHand.style.transform   = `rotate(${hourDeg}deg)`;
      if (minuteHand) minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    });
  };

  // Update immediately then every second
  updateHands();
  setInterval(updateHands, 1000);
}


/* ============================================================
   7. FOOTER YEAR — Auto-updates copyright year
   ============================================================ */
function initFooterYear() {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}