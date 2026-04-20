(() => {
  // src/components/navigation.js
  function setupNavigation() {
    console.log("\u{1F3AF} Setting up navigation...");
    const menuToggle = document.getElementById("menu-toggle");
    const navMenu = document.getElementById("nav-menu");
    if (!menuToggle || !navMenu) {
      console.warn("\u26A0\uFE0F Navigation elements not found in DOM");
      console.log("menu-toggle:", menuToggle);
      console.log("nav-menu:", navMenu);
      return;
    }
    console.log("\u2705 Menu toggle and nav menu found!");
    menuToggle.addEventListener("click", () => {
      const isActive = navMenu.classList.toggle("active");
      menuToggle.classList.toggle("active");
      menuToggle.setAttribute("aria-expanded", isActive);
    });
    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("click", (e) => {
      if (!e.target.closest("nav") && !e.target.closest(".menu-toggle")) {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.focus();
      }
    });
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.addEventListener("click", (e) => {
        e.stopPropagation();
      });
    }
  }

  // src/components/game-cards.js
  function setupGameCards() {
    const gameCards = document.querySelectorAll(".game-card");
    if (gameCards.length === 0) {
      console.warn("\u26A0\uFE0F No game cards found in DOM");
      return;
    }
    gameCards.forEach((card) => {
      card.addEventListener("mouseenter", () => {
        card.classList.add("active");
      });
      card.addEventListener("mouseleave", () => {
        card.classList.remove("active");
      });
      card.addEventListener("touchstart", () => {
        card.classList.add("active");
      });
      card.addEventListener("touchend", () => {
        setTimeout(() => {
          card.classList.remove("active");
        }, 300);
      });
    });
  }

  // src/utils/theme.js
  var THEME_KEY = "arcade-theme";
  var THEMES = {
    DARK: "dark",
    LIGHT: "light"
  };
  function setupTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const savedTheme = localStorage.getItem(THEME_KEY) || THEMES.DARK;
    applyTheme(savedTheme);
    if (themeToggle) {
      themeToggle.addEventListener("click", (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute("data-theme") || THEMES.DARK;
        const newTheme = currentTheme === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK;
        applyTheme(newTheme);
        localStorage.setItem(THEME_KEY, newTheme);
        updateThemeToggleText(newTheme);
      });
      updateThemeToggleText(savedTheme);
    }
  }
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    const themeColor = theme === THEMES.DARK ? "#0a0e27" : "#f0f0f0";
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement("meta");
      metaTheme.setAttribute("name", "theme-color");
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute("content", themeColor);
  }
  function updateThemeToggleText(theme) {
    const themeToggle = document.getElementById("theme-toggle");
    if (themeToggle) {
      themeToggle.textContent = theme === THEMES.DARK ? "\u2600\uFE0F" : "\u{1F319}";
      themeToggle.setAttribute(
        "aria-label",
        theme === THEMES.DARK ? "Switch to light mode" : "Switch to dark mode"
      );
    }
  }

  // src/utils/storage.js
  var SCORES_KEY = "arcade-scores";
  function loadHighScores() {
    try {
      const scores = localStorage.getItem(SCORES_KEY);
      return scores ? JSON.parse(scores) : {};
    } catch (error) {
      console.error("Error loading scores:", error);
      return {};
    }
  }

  // src/core/app.js
  async function initializeApp() {
    console.log("\u{1F3AE} Initializing Arcade Mini Game v2.0...");
    try {
      setupTheme();
      setupNavigation();
      setupGameCards();
      loadHighScores();
      setupSmoothScroll();
      setupLazyLoading();
      console.log("\u2713 Application initialized successfully!");
    } catch (error) {
      console.error("\u2717 Error initializing application:", error);
    }
  }
  function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });
  }
  function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            observer.unobserve(img);
          }
        }
      });
    });
    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  // src/index.js
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeApp);
  } else {
    initializeApp();
  }
})();
