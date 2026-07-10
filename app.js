/* J2 INDUSTRIES hub — motion + data layer */
(() => {
  "use strict";
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- filmography data (featured two are in HTML) ---------- */
  const FILMS = [
    { id: "KE_8elWvzsk", title: "DBZ Multiverse: Frieza Saga — Official Trailer", views: "9.2K",  date: "JUL 2026", tag: "TRAILER" },
    { id: "d9PdFKPpGXc", title: "Frieza Saga Preview — Early Test Footage",        views: "13K",   date: "JUN 2026", tag: "TEST FOOTAGE" },
    { id: "EW3xKtc5ZcU", title: "Happy Horse 1.0 vs Seedance 2.0 — AI Fight Scene", views: "8.8K",  date: "MAY 2026", tag: "KINOVI.AI" },
    { id: "ZPoeFDE_guc", title: "DBZ Saiyan Saga — Multiverse Live Action",         views: "260K",  date: "APR 2026", tag: "FAN FILM" },
    { id: "f2aJcDzCZXc", title: "Superman: Kingdom Come — Cinematic Trailer",       views: "91K",   date: "FEB 2026", tag: "TRAILER" },
    { id: "_zhSLrBVTTM", title: "Superman: Kingdom Come — Scene Test",              views: "3.1K",  date: "JAN 2026", tag: "TEST FOOTAGE" },
    { id: "AYW022KNtmQ", title: "Sandwich Man — A Cinematic AI Test",               views: "2.4K",  date: "DEC 2025", tag: "SHORT" },
    { id: "VC649l7xEiQ", title: "Jaeger One — AI Cinematic Short",                  views: "2.6K",  date: "NOV 2025", tag: "SHORT" },
  ];

  const grid = document.getElementById("filmGrid");
  grid.innerHTML = FILMS.map((f, i) => `
    <article class="film card spotlight gradient-border reveal d${i % 3}" data-video="${f.id}" data-title="${f.title}">
      <div class="film-media">
        <img src="assets/${f.id}.jpg" alt="${f.title} — poster" loading="lazy">
        <button class="play-btn" aria-label="Play ${f.title}">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
        </button>
      </div>
      <div class="film-body">
        <p class="mono-meta"><span class="film-no">${String(i + 1).padStart(2, "0")}</span><b>${f.tag}</b> ✦ ${f.views} views ✦ ${f.date}</p>
        <h3>${f.title}</h3>
      </div>
    </article>`).join("");

  /* ---------- preloader ---------- */
  const loader = document.getElementById("loader");
  if (reduceMotion || sessionStorage.getItem("j2seen")) {
    loader.classList.add("skip");
  } else {
    sessionStorage.setItem("j2seen", "1");
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      loader.classList.add("done");
      document.body.style.overflow = "";
    }, 1500);
  }

  /* ---------- hero reel rotation (Ken Burns crossfade) ---------- */
  const frames = [...document.querySelectorAll(".reel-frame")];
  if (frames.length > 1 && !reduceMotion) {
    let cur = 0;
    setInterval(() => {
      frames[cur].classList.remove("is-active");
      cur = (cur + 1) % frames.length;
      frames[cur].classList.add("is-active");
    }, 6500);
  }

  /* ---------- fullscreen menu ---------- */
  const menuBtn = document.getElementById("menuBtn");
  const menu = document.getElementById("menu");
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  }
  menuBtn.addEventListener("click", () => setMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });

  /* ---------- modal player ---------- */
  const modal = document.getElementById("modal");
  const frame = document.getElementById("modalFrame");
  const mTitle = document.getElementById("modalTitle");
  const mYt = document.getElementById("modalYt");

  function openPlayer(id, title) {
    frame.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="${title}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    mTitle.textContent = title;
    mYt.href = `https://www.youtube.com/watch?v=${id}`;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function closePlayer() {
    modal.hidden = true;
    frame.innerHTML = "";
    document.body.style.overflow = "";
  }
  document.addEventListener("click", (e) => {
    const closer = e.target.closest("[data-close]");
    if (closer) return closePlayer();
    const card = e.target.closest("[data-video]");
    if (card) openPlayer(card.dataset.video, card.dataset.title);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) closePlayer(); });

  /* ---------- nav glass + progress ---------- */
  const nav = document.getElementById("nav");
  const bar = document.getElementById("progressBar");
  const banner = document.getElementById("heroReel");
  let ticking = false;
  addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = scrollY;
      nav.classList.toggle("scrolled", y > 40);
      const h = document.documentElement.scrollHeight - innerHeight;
      bar.style.width = (h > 0 ? (y / h) * 100 : 0) + "%";
      if (!reduceMotion && banner && y < innerHeight * 1.2) {
        banner.style.transform = `translateY(${y * 0.28}px) scale(${1 + y * 0.0002})`;
      }
      ticking = false;
    });
  }, { passive: true });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    }
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

  /* ---------- count-up stats ---------- */
  const fmt = (n, mode) => {
    if (mode === "m") return (n / 1e6).toFixed(1).replace(/\.0$/, "") + "M+";
    if (mode === "k") return (n / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    if (mode === "plus") return n + "+";
    return String(n);
  };
  const statIO = new IntersectionObserver((entries) => {
    for (const en of entries) {
      if (!en.isIntersecting) continue;
      statIO.unobserve(en.target);
      const el = en.target, target = +el.dataset.count, mode = el.dataset.fmt;
      if (reduceMotion) { el.textContent = fmt(target, mode); continue; }
      const t0 = performance.now(), dur = 1600;
      (function tick(t) {
        const p = Math.min((t - t0) / dur, 1);
        el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))), mode);
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
    }
  }, { threshold: 0.5 });
  document.querySelectorAll(".stat[data-count]").forEach((el) => statIO.observe(el));

  /* ---------- cursor spotlight on cards ---------- */
  if (!reduceMotion && matchMedia("(pointer: fine)").matches) {
    document.addEventListener("pointermove", (e) => {
      const card = e.target.closest(".spotlight");
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", (e.clientX - r.left) + "px");
      card.style.setProperty("--my", (e.clientY - r.top) + "px");
    }, { passive: true });
  }

  /* ---------- ember particles (hero canvas) ---------- */
  const cv = document.getElementById("embers");
  if (cv && !reduceMotion) {
    const ctx = cv.getContext("2d");
    let W, H, parts = [];
    const N = 46;
    function resize() {
      W = cv.width = cv.offsetWidth;
      H = cv.height = cv.offsetHeight;
    }
    function spawn(init) {
      return {
        x: Math.random() * W,
        y: init ? Math.random() * H : H + 10,
        r: 0.6 + Math.random() * 1.8,
        vy: 0.15 + Math.random() * 0.5,
        vx: (Math.random() - 0.5) * 0.22,
        a: 0.15 + Math.random() * 0.5,
        tw: Math.random() * Math.PI * 2,
      };
    }
    function loop() {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.y -= p.vy; p.x += p.vx + Math.sin(p.tw += 0.01) * 0.12;
        if (p.y < -12) Object.assign(p, spawn(false));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 3.2);
        g.addColorStop(0, `rgba(240,208,137,${p.a})`);
        g.addColorStop(1, "rgba(240,208,137,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, 7); ctx.fill();
      }
      requestAnimationFrame(loop);
    }
    resize();
    parts = Array.from({ length: N }, () => spawn(true));
    addEventListener("resize", resize, { passive: true });
    requestAnimationFrame(loop);
  }
})();
