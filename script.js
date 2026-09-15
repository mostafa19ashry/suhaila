/* ============================================================
   FOR SUHAILA — interaction + animation logic
   ------------------------------------------------------------
   Three small systems, kept deliberately lightweight for iPhone
   Safari:
     1. Night sky (subtle twinkling stars, drawn on canvas)
     2. Fireworks (a short, capped-particle canvas burst sequence,
        triggered once by the opening button)
     3. Scroll reveals (IntersectionObserver toggling a class —
        no scroll-linked JS, so it costs nothing while idle)
   ============================================================ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------
     Canvas setup
     ------------------------------------------------------------ */
  var canvas = document.getElementById("sky-canvas");
  var ctx = canvas.getContext("2d", { alpha: true });
  var dpr = Math.min(window.devicePixelRatio || 1, 2); // cap for perf
  var width = 0;
  var height = 0;

  function resizeCanvas() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resizeCanvas();

  var resizeTimer = null;
  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        resizeCanvas();
        buildStars(); // re-scatter stars for the new viewport
      }, 150);
    },
    { passive: true }
  );

  /* ------------------------------------------------------------
     Stars — a fixed, small field that twinkles gently.
     Cheap: one array, opacity-only sine modulation.
     ------------------------------------------------------------ */
  var STAR_COUNT = 70;
  var stars = [];

  function buildStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.1 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.6
      });
    }
  }
  buildStars();

  function drawStars(t) {
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var twinkle = reduceMotion
        ? 0.55
        : 0.35 + 0.45 * Math.abs(Math.sin(t * 0.0006 * s.speed + s.phase));
      ctx.globalAlpha = twinkle;
      ctx.fillStyle = "#f4efe4";
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------
     Fireworks — small, capped particle bursts on HTML5 canvas.
     Triggered once, runs a handful of launches, then stops.
     ------------------------------------------------------------ */
  var PALETTE = ["#d9b877", "#f4efe4", "#c98a86", "#8fb3c9", "#e4c9e0"];
  var particles = [];
  var fireworksActive = false;
  var launchesRemaining = 0;
  var lastLaunchTime = 0;
  var launchInterval = 650; // ms between bursts

  function spawnBurst(x, y) {
    var color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
    var count = 26; // capped per burst — keeps total particles low
    for (var i = 0; i < count; i++) {
      var angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
      var speed = 1.4 + Math.random() * 2.2;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.012 + Math.random() * 0.01,
        color: color,
        r: 1.6 + Math.random() * 1.4
      });
    }
  }

  function updateFireworks(now, dt) {
    if (fireworksActive && now - lastLaunchTime > launchInterval && launchesRemaining > 0) {
      var x = width * (0.28 + Math.random() * 0.44);
      var y = height * (0.22 + Math.random() * 0.28);
      spawnBurst(x, y);
      lastLaunchTime = now;
      launchesRemaining--;

      // Reveal the headline partway through the sequence
      if (launchesRemaining === 3) {
        revealHeadline();
      }
      if (launchesRemaining === 0) {
        fireworksActive = false;
      }
    }

    // gravity + drag, opacity fade — transform/opacity-equivalent, cheap
    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      p.vy += 0.028; // gentle gravity
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;

      if (p.life <= 0) {
        particles.splice(i, 1);
        continue;
      }

      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function startFireworks() {
    if (reduceMotion) {
      revealHeadline();
      return;
    }
    fireworksActive = true;
    launchesRemaining = 6;
    lastLaunchTime = performance.now() - launchInterval; // fire the first one almost immediately
  }

  /* ------------------------------------------------------------
     Main animation loop — single rAF loop for the whole canvas.
     Pauses automatically when the tab is hidden or when nothing
     is left to animate (stars still get a very cheap twinkle).
     ------------------------------------------------------------ */
  var rafId = null;

  function frame(now) {
    ctx.clearRect(0, 0, width, height);
    drawStars(now);
    if (fireworksActive || particles.length > 0) {
      updateFireworks(now);
    }
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (rafId === null) {
      rafId = requestAnimationFrame(frame);
    }
  }

  function stopLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      stopLoop();
    } else {
      startLoop();
    }
  });

  // In reduced-motion mode, draw the star field once and stop —
  // no continuous loop needed.
  if (reduceMotion) {
    drawStars(0);
  } else {
    startLoop();
  }

  /* ------------------------------------------------------------
     Scene 1 → Scene 2: the opening button
     ------------------------------------------------------------ */
  var openBtn = document.getElementById("open-btn");
  var fireworksScene = document.getElementById("scene-fireworks");

  openBtn.addEventListener("click", function () {
    if (!reduceMotion) startLoop();
    startFireworks();
    fireworksScene.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    openBtn.disabled = true;
  });

  /* ------------------------------------------------------------
     Headline reveal (Scene 2)
     ------------------------------------------------------------ */
  var headline = document.getElementById("headline");
  var headlineRevealed = false;

  function revealHeadline() {
    if (headlineRevealed) return;
    headlineRevealed = true;
    headline.classList.add("is-visible");
  }

  /* ------------------------------------------------------------
     Scroll reveals — IntersectionObserver, fires once per element
     ------------------------------------------------------------ */
  var revealTargets = document.querySelectorAll(".reveal-on-scroll");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.35 }
    );
    revealTargets.forEach(function (el) {
      io.observe(el);
    });
  } else {
    // No IntersectionObserver support, or reduced motion: show everything
    revealTargets.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
