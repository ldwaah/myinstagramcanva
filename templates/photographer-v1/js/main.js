(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initLoader() {
    const loader = document.getElementById("loader");
    if (!loader) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      loader.classList.add("is-exiting");
      document.body.classList.remove("is-loading");
      document.body.classList.add("loader-ready");
      window.setTimeout(() => {
        loader.remove();
        document.dispatchEvent(new CustomEvent("site-ready"));
      }, 800);
    };

    if (prefersReducedMotion) {
      document.body.classList.remove("is-loading");
      document.body.classList.add("loader-ready");
      loader.remove();
      return;
    }

    const minDisplay = 2100;
    const start = performance.now();

    const tryFinish = () => {
      const elapsed = performance.now() - start;
      const wait = Math.max(0, minDisplay - elapsed);
      window.setTimeout(finish, wait);
    };

    if (document.readyState === "complete") {
      tryFinish();
    } else {
      window.addEventListener("load", tryFinish, { once: true });
    }
    window.setTimeout(finish, 4000);
  }

  initLoader();

  // Year
  document.getElementById("year").textContent = new Date().getFullYear();

  // Film grain canvas
  function initGrain() {
    const canvas = document.getElementById("grain");
    if (!canvas || prefersReducedMotion) return;

    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }

    function paint() {
      const imageData = ctx.createImageData(w, h);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 18;
      }
      ctx.putImageData(imageData, 0, 0);
      requestAnimationFrame(paint);
    }

    resize();
    window.addEventListener("resize", resize);
    paint();
  }

  // Custom cursor
  function initCursor() {
    if (prefersReducedMotion || !window.matchMedia("(hover: hover)").matches) return;

    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    if (!dot || !ring) return;

    let mx = 0;
    let my = 0;
    let rx = 0;
    let ry = 0;

    document.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    });

    function loop() {
      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      requestAnimationFrame(loop);
    }
    loop();

    document.querySelectorAll("a, button, .frame, .film-rail").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-hover"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-hover"));
    });
  }

  // Header scroll
  function initHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let lastY = 0;

    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        header.classList.toggle("is-solid", y > 60);
        if (y > 200 && y > lastY) {
          header.classList.add("is-hidden");
        } else {
          header.classList.remove("is-hidden");
        }
        lastY = y;
      },
      { passive: true }
    );
  }

  // Mobile menu
  function initMenu() {
    const toggle = document.querySelector(".menu-toggle");
    const menu = document.getElementById("mobile-menu");
    if (!toggle || !menu) return;

    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      menu.hidden = open;
      document.body.classList.toggle("menu-open", !open);
    });

    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        menu.hidden = true;
        document.body.classList.remove("menu-open");
      });
    });
  }

  // Hero slideshow
  function initHeroSlides() {
    if (prefersReducedMotion) return;

    const slides = document.querySelectorAll(".hero-slide");
    if (slides.length < 2) return;

    let i = 0;
    setInterval(() => {
      slides[i].classList.remove("is-active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("is-active");
    }, 5500);
  }

  // Split text reveal
  function initSplitText() {
    document.querySelectorAll("[data-split]").forEach((el) => {
      const text = el.textContent;
      el.textContent = "";
      const span = document.createElement("span");
      span.textContent = text;
      el.appendChild(span);
    });

    const title = document.querySelector(".hero-title");
    if (!title) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            title.classList.add("is-visible");
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 }
    );
    observer.observe(title);
  }

  // Scroll reveal with stagger groups
  function initReveal() {
    const groups = document.querySelectorAll("[data-reveal-group]");
    const els = document.querySelectorAll("[data-reveal]");

    groups.forEach((group) => {
      group.querySelectorAll("[data-reveal]").forEach((el, i) => {
        el.style.setProperty("--reveal-i", i);
      });
    });

    if (prefersReducedMotion) {
      groups.forEach((g) => g.classList.add("is-visible"));
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    const opts = { threshold: 0.08, rootMargin: "0px 0px -6% 0px" };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const target = e.target;
        if (target.matches("[data-reveal-group]")) {
          target.classList.add("is-visible");
        } else {
          target.classList.add("is-visible");
        }
        observer.unobserve(target);
      });
    }, opts);

    groups.forEach((g) => observer.observe(g));
    els.forEach((el) => {
      if (!el.closest("[data-reveal-group]")) observer.observe(el);
    });

    function revealInView() {
      const check = (el) => {
        const rect = el.getBoundingClientRect();
        return rect.top < window.innerHeight * 0.92 && rect.bottom > 0;
      };
      groups.forEach((g) => {
        if (check(g)) g.classList.add("is-visible");
      });
      els.forEach((el) => {
        if (!el.closest("[data-reveal-group].is-visible") && check(el)) {
          el.classList.add("is-visible");
        }
      });
    }

    revealInView();
    window.addEventListener("load", revealInView, { once: true });
    return revealInView;
  }

  // Counter animation
  function initCounters() {
    const nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;

    const animate = (el) => {
      const target = Number(el.dataset.count);
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            animate(e.target);
            observer.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    nums.forEach((n) => observer.observe(n));
  }

  // Drag-to-scroll film rail
  function initFilmRail() {
    const rail = document.querySelector(".film-rail");
    if (!rail) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    rail.addEventListener("mousedown", (e) => {
      isDown = true;
      rail.classList.add("is-dragging");
      startX = e.pageX - rail.offsetLeft;
      scrollLeft = rail.scrollLeft;
    });

    rail.addEventListener("mouseleave", () => {
      isDown = false;
      rail.classList.remove("is-dragging");
    });

    rail.addEventListener("mouseup", () => {
      isDown = false;
      rail.classList.remove("is-dragging");
    });

    rail.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      rail.scrollLeft = scrollLeft - (x - startX) * 1.2;
    });
  }

  function initReels() {
    document.querySelectorAll(".reel-card").forEach((card) => {
      const video = card.querySelector(".reel-video");
      const btn = card.querySelector(".reel-play");
      if (!video || !btn) return;

      const play = () => {
        video.muted = false;
        video.play();
        card.classList.add("is-playing");
      };

      const pause = () => {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
        card.classList.remove("is-playing");
      };

      btn.addEventListener("click", () => {
        if (card.classList.contains("is-playing")) {
          pause();
        } else {
          document.querySelectorAll(".reel-card.is-playing").forEach((other) => {
            const v = other.querySelector(".reel-video");
            if (v) {
              v.pause();
              v.muted = true;
            }
            other.classList.remove("is-playing");
          });
          play();
        }
      });

      video.addEventListener("ended", pause);
    });
  }

  // 3D tilt on frames
  function initTilt() {
    if (prefersReducedMotion || !window.matchMedia("(hover: hover)").matches) return;

    document.querySelectorAll("[data-tilt]").forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) scale(1.02)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  initGrain();
  initCursor();
  initHeader();
  initMenu();
  initHeroSlides();
  initSplitText();
  const revealInView = initReveal();
  document.addEventListener("site-ready", () => {
    document.querySelector(".hero-title")?.classList.add("is-visible");
    revealInView?.();
  });
  initCounters();
  initFilmRail();
  initTilt();
  initReels();
})();
