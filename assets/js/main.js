(function () {
  "use strict";

  const body = document.body;
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const progress = document.querySelector(".scroll-progress");
  const topButton = document.querySelector("[data-top]");
  const toast = document.querySelector("[data-toast]");
  const preloader = document.querySelector("[data-preloader]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function finishPreloader() {
    if (!preloader || preloader.classList.contains("is-complete")) return;
    const minimumDisplay = reducedMotion ? 150 : 1100;
    const elapsed = performance.now();
    window.setTimeout(() => {
      preloader.classList.add("is-complete");
      preloader.setAttribute("aria-hidden", "true");
      body.classList.remove("is-loading");
      window.setTimeout(() => preloader.remove(), 1000);
    }, Math.max(0, minimumDisplay - elapsed));
  }

  if (document.readyState === "complete") {
    finishPreloader();
  } else {
    window.addEventListener("load", finishPreloader, { once: true });
    window.setTimeout(finishPreloader, 3200);
  }

  function setScrollState() {
    const y = window.scrollY;
    header?.classList.toggle("is-scrolled", y > 18);
    topButton?.classList.toggle("show", y > 700);

    if (!progress) return;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
  }

  const heroParallax = document.querySelector("[data-parallax='hero']");
  const testimonyParallax = document.querySelector("[data-parallax='testimony']");
  let parallaxQueued = false;

  function updateParallax() {
    parallaxQueued = false;
    if (reducedMotion) return;

    if (heroParallax) {
      const heroShift = Math.min(window.scrollY * 0.12, 90);
      heroParallax.style.transform = `translate3d(0, ${heroShift}px, 0) scale(1.055)`;
    }

    if (testimonyParallax) {
      const parent = testimonyParallax.parentElement;
      const rect = parent?.getBoundingClientRect();
      if (rect) {
        const centreOffset = window.innerHeight / 2 - (rect.top + rect.height / 2);
        const shift = Math.max(-40, Math.min(40, centreOffset * 0.07));
        testimonyParallax.style.transform = `translate3d(0, ${shift}px, 0) scale(1.1)`;
      }
    }
  }

  function queueParallax() {
    if (parallaxQueued) return;
    parallaxQueued = true;
    window.requestAnimationFrame(updateParallax);
  }

  function closeNav() {
    nav?.classList.remove("open");
    body.classList.remove("nav-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Open navigation");
    const icon = navToggle?.querySelector("i");
    icon?.classList.remove("bi-x-lg");
    icon?.classList.add("bi-list");
  }

  navToggle?.addEventListener("click", () => {
    const open = nav?.classList.toggle("open") || false;
    body.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    const icon = navToggle.querySelector("i");
    icon.classList.toggle("bi-list", !open);
    icon.classList.toggle("bi-x-lg", open);
  });

  document.querySelectorAll(".site-nav a").forEach((link) => link.addEventListener("click", closeNav));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNav();
  });

  topButton?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.remove("show"), 3200);
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -35px" }
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const counter = document.querySelector("[data-counter]");
  if (counter) {
    const target = Number(counter.dataset.counter || 0);
    const count = () => {
      if (reducedMotion) {
        counter.textContent = target.toLocaleString();
        return;
      }
      const start = performance.now();
      const duration = 1500;
      const frame = (now) => {
        const progressValue = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        counter.textContent = Math.round(target * eased).toLocaleString();
        if (progressValue < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    };

    if ("IntersectionObserver" in window) {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          if (!entries[0].isIntersecting) return;
          count();
          observer.disconnect();
        },
        { threshold: 0.6 }
      );
      counterObserver.observe(counter);
    } else {
      count();
    }
  }

  const navigationLinks = Array.from(document.querySelectorAll(".site-nav a[href^='#']"));
  const observedSections = navigationLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navigationLinks.forEach((link) => {
            link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
          });
        });
      },
      { rootMargin: "-35% 0px -55%", threshold: 0 }
    );
    observedSections.forEach((section) => sectionObserver.observe(section));
  }

  function nextSundayAtSevenThirty() {
    const now = new Date();
    const next = new Date(now);
    const daysUntilSunday = (7 - now.getDay()) % 7;
    next.setDate(now.getDate() + daysUntilSunday);
    next.setHours(7, 30, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 7);
    return next;
  }

  function updateCountdown() {
    const countdown = document.querySelector("[data-countdown]");
    if (!countdown) return;
    const totalMinutes = Math.max(Math.floor((nextSundayAtSevenThirty().getTime() - Date.now()) / 60000), 0);
    const days = Math.floor(totalMinutes / 1440);
    const hours = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const values = { days, hours, minutes };
    Object.entries(values).forEach(([key, value]) => {
      const node = countdown.querySelector(`[data-${key}]`);
      if (node) node.textContent = String(value).padStart(2, "0");
    });
  }

  function setupTabs(buttonSelector, panelSelector, buttonKey, panelKey) {
    const buttons = Array.from(document.querySelectorAll(buttonSelector));
    const panels = Array.from(document.querySelectorAll(panelSelector));
    if (!buttons.length || !panels.length) return;

    function activate(button) {
      const target = button.dataset[buttonKey];
      buttons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
      });
      panels.forEach((panel) => {
        const active = panel.dataset[panelKey] === target;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
    }

    buttons.forEach((button, index) => {
      button.addEventListener("click", () => activate(button));
      button.addEventListener("keydown", (event) => {
        if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
        event.preventDefault();
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        const next = buttons[(index + offset + buttons.length) % buttons.length];
        next.focus();
        activate(next);
      });
    });
  }

  setupTabs("[data-tab]", "[data-panel]", "tab", "panel");
  setupTabs("[data-giving-tab]", "[data-giving-panel]", "givingTab", "givingPanel");

  async function copyText(value) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return;
    }
    const input = document.createElement("textarea");
    input.value = value;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.opacity = "0";
    document.body.appendChild(input);
    input.select();
    document.execCommand("copy");
    input.remove();
  }

  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copy;
      try {
        await copyText(value);
        showToast(`Account number ${value} copied.`);
      } catch (error) {
        showToast(`Please copy this account number: ${value}`);
      }
    });
  });

  const requestSelect = document.querySelector("[data-request-select]");
  function chooseRequest(value) {
    if (!requestSelect || !value) return;
    const match = Array.from(requestSelect.options).find((option) => option.value === value || option.text === value);
    if (match) requestSelect.value = match.value;
    window.setTimeout(() => requestSelect.focus({ preventScroll: true }), 550);
  }

  document.querySelectorAll("[data-support-option]").forEach((button) => {
    button.addEventListener("click", () => {
      chooseRequest(button.dataset.supportOption);
      document.querySelector("[data-contact-form]")?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    });
  });

  document.querySelectorAll("[data-request]").forEach((link) => {
    link.addEventListener("click", () => chooseRequest(link.dataset.request));
  });

  document.querySelectorAll(".sermon-play").forEach((button) => {
    button.addEventListener("click", () => showToast("Audio archive coming online soon. Contact the media team for this recording."));
  });

  document.querySelectorAll("[data-social-unavailable]").forEach((button) => {
    button.addEventListener("click", () => showToast("The church's official social links will be connected here."));
  });

  document.querySelector("[data-contact-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const subject = `GSP Website Request: ${data.get("request")}`;
    const bodyText = [
      `Name: ${data.get("name")}`,
      `Phone: ${data.get("phone")}`,
      `Email: ${data.get("email")}`,
      `Request: ${data.get("request")}`,
      "",
      String(data.get("message"))
    ].join("\n");
    showToast("Opening your email app to send this request to the church office.");
    window.location.href = `mailto:info@rccgtgsp.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  });

  updateCountdown();
  window.setInterval(updateCountdown, 60000);
  setScrollState();
  updateParallax();
  window.addEventListener("scroll", setScrollState, { passive: true });
  window.addEventListener("scroll", queueParallax, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) closeNav();
  });
})();
