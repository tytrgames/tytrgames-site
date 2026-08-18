(() => {
  "use strict";

  const storageKey = "rgbBlockPuzzleLanguage";
  const root = document.documentElement;
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navigation = document.querySelector("[data-nav]");
  const languageButtons = [...document.querySelectorAll("[data-language]")];
  const video = document.querySelector("#gameplay-video");
  const videoButton = document.querySelector("[data-video-play]");
  const videoStatus = document.querySelector("[data-video-status]");

  const pageMeta = {
    en: {
      title: "RGB Block Puzzle — Classic calm, Arcade challenge",
      description: "Play colorful block puzzles your way: chase high scores in Classic or complete objectives and progress through Arcade.",
      social: "Colorful block puzzle gameplay, two distinct modes, custom themes and satisfying clears.",
      videoLoading: "Gameplay video is loading.",
      videoError: "The gameplay video could not be loaded. Please try again.",
      menuOpen: "Open menu",
      menuClose: "Close menu"
    },
    tr: {
      title: "RGB Block Puzzle — Klasik sakinlik, Arcade mücadele",
      description: "Renkli blok bulmacaları kendi tarzında oyna: Klasik modda yüksek skor kovala veya Arcade hedeflerini tamamlayarak ilerle.",
      social: "Renkli blok bulmaca oynanışı, iki farklı mod, özel temalar ve tatmin edici temizlikler.",
      videoLoading: "Oynanış videosu yükleniyor.",
      videoError: "Oynanış videosu yüklenemedi. Lütfen tekrar deneyin.",
      menuOpen: "Menüyü aç",
      menuClose: "Menüyü kapat"
    }
  };

  function readSavedLanguage() {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved === "tr" || saved === "en" ? saved : null;
    } catch (_) {
      return null;
    }
  }

  function saveLanguage(language) {
    try {
      localStorage.setItem(storageKey, language);
    } catch (_) {
      // Storage can be unavailable in private or restricted browser contexts.
    }
  }

  function setMeta(selector, content) {
    const element = document.querySelector(selector);
    if (element) element.setAttribute("content", content);
  }

  function setLanguage(language, persist = true) {
    const selected = language === "tr" ? "tr" : "en";
    const alternate = selected === "tr" ? "en" : "tr";

    root.lang = selected;
    document.title = pageMeta[selected].title;
    setMeta('meta[name="description"]', pageMeta[selected].description);
    setMeta('meta[property="og:title"]', pageMeta[selected].title);
    setMeta('meta[property="og:description"]', pageMeta[selected].social);
    setMeta('meta[name="twitter:title"]', pageMeta[selected].title);
    setMeta('meta[name="twitter:description"]', pageMeta[selected].social);

    document.querySelectorAll(`[data-${selected}]`).forEach((element) => {
      element.textContent = element.dataset[selected];
    });

    document.querySelectorAll(`[data-alt-${selected}]`).forEach((element) => {
      element.alt = element.dataset[`alt${selected[0].toUpperCase()}${selected.slice(1)}`];
    });

    document.querySelectorAll(`[data-aria-${selected}]`).forEach((element) => {
      element.setAttribute("aria-label", element.dataset[`aria${selected[0].toUpperCase()}${selected.slice(1)}`]);
    });

    document.querySelectorAll(`[data-${alternate}]`).forEach((element) => {
      element.setAttribute(`lang`, selected);
    });

    languageButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.language === selected));
    });

    updateMenuLabel(selected);
    if (persist) saveLanguage(selected);
  }

  function updateMenuLabel(language) {
    if (!menuButton) return;
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    const label = expanded ? pageMeta[language].menuClose : pageMeta[language].menuOpen;
    const labelElement = menuButton.querySelector(".visually-hidden");
    if (labelElement) labelElement.textContent = label;
  }

  function setMenu(open) {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute("aria-expanded", String(open));
    navigation.dataset.open = String(open);
    document.body.classList.toggle("menu-open", open);
    updateMenuLabel(root.lang);
  }

  if (menuButton && navigation) {
    menuButton.addEventListener("click", () => {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        menuButton.focus();
      }
    });

    document.addEventListener("click", (event) => {
      if (menuButton.getAttribute("aria-expanded") !== "true") return;
      if (!event.target.closest("[data-header]")) setMenu(false);
    });

    window.matchMedia("(min-width: 1041px)").addEventListener("change", (event) => {
      if (event.matches) setMenu(false);
    });
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.language));
  });

  function announceVideo(message) {
    if (videoStatus) videoStatus.textContent = message;
  }

  async function loadAndPlayVideo() {
    if (!video || !videoButton) return;
    const language = root.lang === "tr" ? "tr" : "en";

    if (!video.currentSrc && video.dataset.videoSrc) {
      video.src = video.dataset.videoSrc;
      video.load();
    }

    video.controls = true;
    videoButton.hidden = true;
    announceVideo(pageMeta[language].videoLoading);

    try {
      await video.play();
      announceVideo("");
    } catch (_) {
      videoButton.hidden = false;
      announceVideo(pageMeta[language].videoError);
    }
  }

  if (video && videoButton) {
    videoButton.addEventListener("click", loadAndPlayVideo);

    video.addEventListener("error", () => {
      videoButton.hidden = false;
      const language = root.lang === "tr" ? "tr" : "en";
      announceVideo(pageMeta[language].videoError);
    });

    video.addEventListener("ended", () => {
      videoButton.hidden = false;
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden && !video.paused) video.pause();
    });

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver((entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting && !video.paused) video.pause();
      }, { threshold: 0.15 });
      observer.observe(video);
    }
  }

  const preferred = readSavedLanguage()
    || (navigator.language && navigator.language.toLowerCase().startsWith("tr") ? "tr" : "en");
  setLanguage(preferred, false);
})();
