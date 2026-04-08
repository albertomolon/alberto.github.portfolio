document.addEventListener("DOMContentLoaded", () => {
  setupNavigation();
  setupReveal();
  setupParallax();
  setupHeroFollow();
  setupFloatingAssistant();
  setupProjectCards();
  setupProtectedEmail();
  setupContactForm();
});

function setupNavigation() {
  const toggle = document.getElementById("nav-toggle");
  const panel = document.getElementById("nav-panel");
  const nav = document.querySelector(".site-nav");
  const links = Array.from(document.querySelectorAll(".nav-link"));
  const sectionEntries = links
    .map((link) => {
      const target = document.querySelector(link.getAttribute("href"));

      if (!target) {
        return null;
      }

      return { link, target };
    })
    .filter(Boolean);

  if (toggle && panel) {
    const closeMenu = () => {
      panel.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    toggle.addEventListener("click", () => {
      const isOpen = panel.classList.toggle("is-open");
      toggle.classList.toggle("is-open", isOpen);
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.classList.toggle("nav-open", isOpen);
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        closeMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (!panel.classList.contains("is-open")) {
        return;
      }

      if (panel.contains(event.target) || toggle.contains(event.target)) {
        return;
      }

      closeMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  if (!sectionEntries.length) {
    return;
  }

  let scrollTicking = false;

  const setActiveLink = (activeId) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === activeId);
    });
  };

  const updateActiveSection = () => {
    const navOffset = nav ? nav.offsetHeight + 28 : 110;
    const scrollPosition = window.scrollY + navOffset;
    const viewportBottom = window.scrollY + window.innerHeight;
    let activeEntry = sectionEntries[0];

    sectionEntries.forEach((entry, index) => {
      const sectionTop = entry.target.offsetTop;
      const nextTop = sectionEntries[index + 1]?.target.offsetTop ?? Number.POSITIVE_INFINITY;
      const sectionBottom = Math.max(entry.target.offsetTop + entry.target.offsetHeight, nextTop);

      if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
        activeEntry = entry;
      }
    });

    const lastEntry = sectionEntries[sectionEntries.length - 1];

    if (viewportBottom >= document.documentElement.scrollHeight - 24) {
      activeEntry = lastEntry;
    }

    setActiveLink(`#${activeEntry.target.id}`);
  };

  const requestActiveSectionUpdate = () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      updateActiveSection();
      scrollTicking = false;
    });
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      setActiveLink(link.getAttribute("href"));
    });
  });

  window.addEventListener("scroll", requestActiveSectionUpdate, { passive: true });
  window.addEventListener("resize", requestActiveSectionUpdate);
  updateActiveSection();
}

function setupReveal() {
  const items = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!items.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -10% 0px",
    }
  );

  items.forEach((item, index) => {
    const manualDelay = Number.parseFloat(item.dataset.revealDelay);
    item.style.transitionDelay = Number.isNaN(manualDelay)
      ? `${Math.min(index * 0.06, 0.36)}s`
      : `${manualDelay}s`;
    observer.observe(item);
  });
}

function setupParallax() {
  const elements = Array.from(document.querySelectorAll("[data-parallax]"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let frame = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;

  if (!elements.length || reducedMotion || !finePointer) {
    return;
  }

  const updateElement = (element, x, y) => {
    const strength = Number(element.dataset.parallax || 12);
    const offsetX = (x - 0.5) * strength;
    const offsetY = (y - 0.5) * strength;
    element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
  };

  const renderParallax = () => {
    elements.forEach((element) => updateElement(element, pointerX, pointerY));
    frame = 0;
  };

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / window.innerWidth;
    pointerY = event.clientY / window.innerHeight;

    if (frame) {
      return;
    }

    frame = window.requestAnimationFrame(renderParallax);
  }, { passive: true });
}

function setupHeroFollow() {
  const hero = document.querySelector(".hero");
  const heroGrid = document.querySelector(".hero-reference-grid");
  const title = document.querySelector(".hero-title-reference");
  const portrait = document.querySelector(".hero-portrait-reference");
  const portraitImage = document.querySelector(".hero-portrait-frame img");
  const portraitShadow = document.querySelector(".hero-portrait-shadow");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let frame = 0;

  if (!hero || !heroGrid || !title || !portrait || !portraitImage || reducedMotion) {
    return;
  }

  const setVariable = (name, value) => {
    heroGrid.style.setProperty(name, value);
  };

  const updateFromPointer = (clientX, clientY) => {
    const rect = hero.getBoundingClientRect();
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    const dx = x - 0.5;
    const dy = y - 0.5;

    setVariable("--hero-portrait-x", `${dx * 52}px`);
    setVariable("--hero-portrait-y", `${dy * 34}px`);
    setVariable("--hero-portrait-rx", `${dy * -6.5}deg`);
    setVariable("--hero-portrait-ry", `${dx * 10}deg`);

    setVariable("--hero-face-x", `${dx * 34}px`);
    setVariable("--hero-face-y", `${dy * 26}px`);
    setVariable("--hero-face-rx", `${dy * -8}deg`);
    setVariable("--hero-face-ry", `${dx * 12}deg`);

    setVariable("--hero-shadow-x", `${dx * 24}px`);
    setVariable("--hero-shadow-y", `${dy * 16}px`);

    if (portraitShadow) {
      portraitShadow.style.opacity = `${0.72 + Math.abs(dx) * 0.12 + Math.abs(dy) * 0.12}`;
    }
  };

  const requestPointerUpdate = (clientX, clientY) => {
    if (frame) {
      window.cancelAnimationFrame(frame);
    }

    frame = window.requestAnimationFrame(() => {
      updateFromPointer(clientX, clientY);
      frame = 0;
    });
  };

  const resetHeroFollow = () => {
    const defaults = {
      "--hero-title-x": "0px",
      "--hero-title-y": "0px",
      "--hero-title-rx": "0deg",
      "--hero-title-ry": "0deg",
      "--hero-portrait-x": "0px",
      "--hero-portrait-y": "0px",
      "--hero-portrait-rx": "0deg",
      "--hero-portrait-ry": "0deg",
      "--hero-face-x": "0px",
      "--hero-face-y": "0px",
      "--hero-face-rx": "0deg",
      "--hero-face-ry": "0deg",
      "--hero-shadow-x": "0px",
      "--hero-shadow-y": "0px",
    };

    Object.entries(defaults).forEach(([name, value]) => {
      setVariable(name, value);
    });

    if (portraitShadow) {
      portraitShadow.style.opacity = "";
    }
  };

  hero.addEventListener("mousemove", (event) => {
    requestPointerUpdate(event.clientX, event.clientY);
  });

  hero.addEventListener("mouseleave", () => {
    if (frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }

    resetHeroFollow();
  });

  resetHeroFollow();
}

function setupFloatingAssistant() {
  const assistant = document.getElementById("floating-assistant");
  const assistantBubble = document.getElementById("assistant-bubble");
  const hero = document.getElementById("home");
  const heroGrid = document.querySelector(".hero-reference-grid");
  const footer = document.querySelector(".site-footer");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
  let assistantActive = false;
  let throwFrame = 0;
  let dragPointerId = null;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragOriginX = 0;
  let dragOriginY = 0;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let velocityX = 0;
  let velocityY = 0;
  let lastPointerX = 0;
  let lastPointerY = 0;
  let lastPointerTime = 0;
  let lastThrowTime = 0;
  let bubbleTimeout = 0;
  let throwCount = 0;
  let assistantWasActive = false;
  let introHintShown = false;
  const bubbleMessages = [
    "Basta!",
    "Allora la smetti",
    "Ti stai divertendo troppo",
    "Oh, piano!",
    "Non sono una pallina",
    "Dai su, lasciami stare",
    "Ancora?!",
    "Mi gira la testa",
    "Pensi di farmi male?",
    "Non sento niente",
    "Vai, continua",
    "E successo qualcosa?",
    "Ti diverti?",
  ];

  if (!assistant || !hero || !heroGrid || !footer || reducedMotion) {
    return;
  }

  const setAssistantVariable = (name, value) => {
    assistant.style.setProperty(name, value);
  };

  const setHeroVariable = (name, value) => {
    heroGrid.style.setProperty(name, value);
  };

  const showAssistantBubble = (message, duration = 2400) => {
    if (!assistantBubble) {
      return;
    }

    assistantBubble.textContent = message;
    assistantBubble.classList.add("is-visible");

    if (bubbleTimeout) {
      window.clearTimeout(bubbleTimeout);
    }

    bubbleTimeout = window.setTimeout(() => {
      assistantBubble.classList.remove("is-visible");
      bubbleTimeout = 0;
    }, duration);
  };

  const showThrowBubble = () => {
    throwCount += 1;
    showAssistantBubble(
      bubbleMessages[(throwCount - 1) % bubbleMessages.length]
    );
  };

  const resetOrientation = () => {
    setAssistantVariable("--assistant-x", "0px");
    setAssistantVariable("--assistant-y", "0px");
    setAssistantVariable("--assistant-rotate-x", "0deg");
    setAssistantVariable("--assistant-rotate-y", "0deg");
    setAssistantVariable("--assistant-rotate-z", "0deg");
    setAssistantVariable("--assistant-face-x", "0px");
    setAssistantVariable("--assistant-face-y", "0px");
  };

  const setDragOffset = (x, y) => {
    dragOffsetX = x;
    dragOffsetY = y;
    setAssistantVariable("--assistant-drag-x", `${x}px`);
    setAssistantVariable("--assistant-drag-y", `${y}px`);
  };

  const resetDragOffset = () => {
    setDragOffset(0, 0);
  };

  const getDragBounds = () => {
    const rect = assistant.getBoundingClientRect();
    const styles = window.getComputedStyle(assistant);
    const baseLeft = Number.parseFloat(styles.left) || 18;
    const baseBottom = Number.parseFloat(styles.bottom) || 18;
    const safeMargin = 10;

    return {
      minX: -(baseLeft - safeMargin),
      maxX: window.innerWidth - baseLeft - rect.width - safeMargin,
      minY: -(window.innerHeight - baseBottom - rect.height - safeMargin),
      maxY: baseBottom - safeMargin,
    };
  };

  const clampDragOffset = (x, y) => {
    const bounds = getDragBounds();

    return {
      x: clamp(x, bounds.minX, bounds.maxX),
      y: clamp(y, bounds.minY, bounds.maxY),
    };
  };

  const constrainDragOffset = () => {
    const nextOffset = clampDragOffset(dragOffsetX, dragOffsetY);

    if (nextOffset.x !== dragOffsetX || nextOffset.y !== dragOffsetY) {
      setDragOffset(nextOffset.x, nextOffset.y);
    }
  };

  const setMomentumTilt = (xMomentum, yMomentum) => {
    const tiltX = clamp(yMomentum * -0.24, -16, 16);
    const tiltY = clamp(xMomentum * 0.28, -18, 18);
    const tiltZ = clamp(xMomentum * 0.22, -14, 14);
    const faceX = clamp(xMomentum * 0.42, -18, 18);
    const faceY = clamp(yMomentum * 0.28, -14, 14);

    setAssistantVariable("--assistant-x", `${clamp(xMomentum * 0.18, -14, 14)}px`);
    setAssistantVariable("--assistant-y", `${clamp(yMomentum * 0.14, -12, 12)}px`);
    setAssistantVariable("--assistant-rotate-x", `${tiltX}deg`);
    setAssistantVariable("--assistant-rotate-y", `${tiltY}deg`);
    setAssistantVariable("--assistant-rotate-z", `${tiltZ}deg`);
    setAssistantVariable("--assistant-face-x", `${faceX}px`);
    setAssistantVariable("--assistant-face-y", `${faceY}px`);
  };

  const stopThrow = () => {
    if (!throwFrame) {
      lastThrowTime = 0;
      return;
    }

    window.cancelAnimationFrame(throwFrame);
    throwFrame = 0;
    lastThrowTime = 0;
    assistant.classList.remove("is-throwing");
  };

  const resetFloatingAssistant = () => {
    stopThrow();
    dragPointerId = null;
    assistant.classList.remove("is-dragging");
    resetDragOffset();
    resetOrientation();
  };

  const animateThrow = () => {
    stopThrow();
    assistant.classList.add("is-throwing");
    lastThrowTime = 0;

    const step = (time) => {
      if (!assistantActive || dragPointerId !== null) {
        resetFloatingAssistant();
        return;
      }

      const delta = lastThrowTime
        ? clamp((time - lastThrowTime) / 16.6667, 0.75, 2.2)
        : 1;
      const bounds = getDragBounds();
      const friction = Math.pow(0.985, delta);
      const bounceLoss = 0.82;
      let nextX = dragOffsetX + velocityX * delta;
      let nextY = dragOffsetY + velocityY * delta;

      lastThrowTime = time;

      velocityX *= friction;
      velocityY *= friction;

      if (nextX < bounds.minX) {
        nextX = bounds.minX + (bounds.minX - nextX);
        velocityX = Math.abs(velocityX) * bounceLoss;
      } else if (nextX > bounds.maxX) {
        nextX = bounds.maxX - (nextX - bounds.maxX);
        velocityX = -Math.abs(velocityX) * bounceLoss;
      }

      if (nextY < bounds.minY) {
        nextY = bounds.minY + (bounds.minY - nextY);
        velocityY = Math.abs(velocityY) * bounceLoss;
      } else if (nextY > bounds.maxY) {
        nextY = bounds.maxY - (nextY - bounds.maxY);
        velocityY = -Math.abs(velocityY) * bounceLoss;
      }

      const nextOffset = clampDragOffset(nextX, nextY);

      setDragOffset(nextOffset.x, nextOffset.y);
      setMomentumTilt(velocityX, velocityY);

      const settled = Math.hypot(velocityX, velocityY) < 0.42;

      if (settled) {
        assistant.classList.remove("is-throwing");
        lastThrowTime = 0;
        resetOrientation();
        throwFrame = 0;
        return;
      }

      throwFrame = window.requestAnimationFrame(step);
    };

    throwFrame = window.requestAnimationFrame(step);
  };

  const updateScrollState = () => {
    const heroHeight = hero.offsetHeight;
    const start = hero.offsetTop + heroHeight * 0.04;
    const end = hero.offsetTop + heroHeight * 0.72;
    const progress = clamp((window.scrollY - start) / Math.max(end - start, 1), 0, 1);
    const eased = progress * progress * (3 - 2 * progress);
    const heroFade = clamp((eased - 0.12) / 0.42, 0, 1);
    const assistantReveal = clamp((eased - 0.58) / 0.24, 0, 1);
    const footerStart = footer.offsetTop - window.innerHeight * 0.82;
    const footerEnd = footer.offsetTop - window.innerHeight * 0.34;
    const footerProgress = clamp((window.scrollY - footerStart) / Math.max(footerEnd - footerStart, 1), 0, 1);
    const assistantOpacity = clamp(assistantReveal * (1 - footerProgress), 0, 1);
    const heroShiftX = -Math.min(window.innerWidth * 0.34, 320) * eased;
    const heroShiftY = Math.min(window.innerHeight * 0.22, 190) * eased;
    const heroScale = 1 - eased * 0.64;
    const heroOpacity = 1 - heroFade;

    assistantActive = assistantOpacity > 0.03;
    assistant.classList.toggle("is-interactive", assistantActive);

    if (assistantActive && !assistantWasActive && !introHintShown) {
      showAssistantBubble("Prova a lanciarmi", 3000);
      introHintShown = true;
    }

    setHeroVariable("--hero-scroll-x", `${heroShiftX}px`);
    setHeroVariable("--hero-scroll-y", `${heroShiftY}px`);
    setHeroVariable("--hero-scroll-scale", `${heroScale}`);
    setHeroVariable("--hero-scroll-opacity", `${heroOpacity}`);

    setAssistantVariable("--assistant-progress", `${eased}`);
    setAssistantVariable("--assistant-opacity", `${assistantOpacity}`);
    setAssistantVariable("--assistant-entry-x", `${Math.min(window.innerWidth * 0.34, 320)}px`);
    setAssistantVariable("--assistant-entry-y", `${-Math.min(window.innerHeight * 0.34, 240)}px`);
    setAssistantVariable("--assistant-scale", `${1 + (1 - assistantReveal) * 0.28 - footerProgress * 0.06}`);

    if (!assistantActive) {
      resetFloatingAssistant();
    } else if (dragPointerId === null && !throwFrame) {
      constrainDragOffset();
    }

    assistantWasActive = assistantActive;
  };

  window.addEventListener("scroll", updateScrollState, { passive: true });
  window.addEventListener("resize", updateScrollState);

  assistant.addEventListener("pointerdown", (event) => {
    if (!assistantActive) {
      return;
    }

    event.preventDefault();
    stopThrow();

    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragOriginX = dragOffsetX;
    dragOriginY = dragOffsetY;
    velocityX = 0;
    velocityY = 0;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    lastPointerTime = event.timeStamp || performance.now();

    assistant.classList.add("is-dragging");
    assistant.setPointerCapture(event.pointerId);
  });

  assistant.addEventListener("pointermove", (event) => {
    if (event.pointerId !== dragPointerId) {
      return;
    }

    event.preventDefault();

    const nextOffset = clampDragOffset(
      dragOriginX + (event.clientX - dragStartX),
      dragOriginY + (event.clientY - dragStartY)
    );
    const elapsed = Math.max((event.timeStamp || performance.now()) - lastPointerTime, 1);
    const frameScale = 16.6667 / elapsed;
    const instantVelocityX = (event.clientX - lastPointerX) * frameScale;
    const instantVelocityY = (event.clientY - lastPointerY) * frameScale;

    velocityX = velocityX * 0.68 + instantVelocityX * 0.32;
    velocityY = velocityY * 0.68 + instantVelocityY * 0.32;
    lastPointerX = event.clientX;
    lastPointerY = event.clientY;
    lastPointerTime = event.timeStamp || performance.now();

    setDragOffset(nextOffset.x, nextOffset.y);
    setMomentumTilt(velocityX, velocityY);
  });

  const releaseDrag = (event) => {
    if (event.pointerId !== dragPointerId) {
      return;
    }

    if (assistant.hasPointerCapture(event.pointerId)) {
      assistant.releasePointerCapture(event.pointerId);
    }

    dragPointerId = null;
    assistant.classList.remove("is-dragging");
    velocityX = clamp(velocityX * 1.28, -58, 58);
    velocityY = clamp(velocityY * 1.28, -58, 58);
    showThrowBubble();
    animateThrow();
  };

  assistant.addEventListener("pointerup", releaseDrag);
  assistant.addEventListener("pointercancel", releaseDrag);

  updateScrollState();
  resetOrientation();
}

function setupProjectCards() {
  const cards = Array.from(document.querySelectorAll(".project-card"));
  const progress = document.querySelector("[data-project-progress]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  let scrollTicking = false;
  let dots = [];

  if (!cards.length) {
    return;
  }

  if (progress) {
    const fragment = document.createDocumentFragment();

    cards.forEach((card, index) => {
      const dot = document.createElement("span");
      const title = card.querySelector(".project-summary h3")?.textContent?.trim() || `Progetto ${index + 1}`;

      dot.className = "project-progress-dot";
      dot.setAttribute("data-project-dot", "");
      dot.setAttribute("aria-label", `Card progetto ${index + 1}: ${title}`);
      fragment.appendChild(dot);
    });

    progress.replaceChildren(fragment);
    dots = Array.from(progress.querySelectorAll("[data-project-dot]"));
  }

  const syncDotLayout = () => {
    if (!dots.length) {
      return;
    }

    const pageOffset = 92;
    let fallbackTop = 164;

    dots.forEach((dot, index) => {
      const card = cards[index];
      const stickyTopValue = Number.parseFloat(window.getComputedStyle(card).getPropertyValue("--sticky-top"));
      const dotTop = Number.isFinite(stickyTopValue)
        ? stickyTopValue + pageOffset
        : fallbackTop;

      dot.style.setProperty("--project-dot-top", `${dotTop}px`);
      fallbackTop = dotTop + 26;
    });
  };

  const setActiveDot = (activeIndex) => {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  };

  const syncActiveDot = () => {
    if (!dots.length) {
      return;
    }

    const activationLine = window.innerHeight * 0.34;
    let activeIndex = 0;

    cards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();

      if (rect.top <= activationLine) {
        activeIndex = index;
      }
    });

    setActiveDot(activeIndex);
  };

  const syncScrollShift = () => {
    const viewportLimit = window.innerHeight * 1.2;

    cards.forEach((card) => {
      const rect = card.getBoundingClientRect();

      if (rect.bottom < -viewportLimit || rect.top > viewportLimit) {
        card.style.setProperty("--card-shift", "0px");
        return;
      }

      const progress = 1 - Math.min(Math.abs(window.innerHeight * 0.56 - rect.top) / (window.innerHeight * 0.9), 1);
      const eased = progress * progress * (3 - 2 * progress);
      const shiftStrength = card.classList.contains("project-card-static") ? -10 : -18;
      card.style.setProperty("--card-shift", `${eased * shiftStrength}px`);
    });
  };

  const requestScrollSync = () => {
    if (scrollTicking) {
      return;
    }

    scrollTicking = true;
    window.requestAnimationFrame(() => {
      syncScrollShift();
      syncActiveDot();
      scrollTicking = false;
    });
  };

  window.addEventListener("scroll", requestScrollSync, { passive: true });
  window.addEventListener("resize", () => {
    syncDotLayout();
    requestScrollSync();
  });
  syncDotLayout();
  syncScrollShift();
  syncActiveDot();

  if (reducedMotion || !finePointer) {
    return;
  }

  cards.forEach((card) => {
    let hoverFrame = 0;
    let cardBounds = null;

    card.addEventListener("pointerenter", () => {
      cardBounds = card.getBoundingClientRect();
    });

    card.addEventListener("pointermove", (event) => {
      if (hoverFrame) {
        window.cancelAnimationFrame(hoverFrame);
      }

      hoverFrame = window.requestAnimationFrame(() => {
        const rect = cardBounds || card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const rotateY = (x - 0.5) * 4.2;
        const rotateX = (0.5 - y) * 4;

        card.style.setProperty("--card-rotate-x", `${rotateX}deg`);
        card.style.setProperty("--card-rotate-y", `${rotateY}deg`);
        hoverFrame = 0;
      });
    });

    card.addEventListener("pointerleave", () => {
      if (hoverFrame) {
        window.cancelAnimationFrame(hoverFrame);
      }

      cardBounds = null;
      card.style.setProperty("--card-rotate-x", "0deg");
      card.style.setProperty("--card-rotate-y", "0deg");
    });
  });
}

function setupContactForm() {
  const form = document.getElementById("contact-form");
  const formNote = document.getElementById("form-note");
  const formStatus = document.getElementById("form-status");
  const submitButton = form?.querySelector('button[type="submit"]');
  const consentField = form?.querySelector('input[name="privacy-consent"]');
  const honeypotField = form?.querySelector('input[name="website"]');
  const startedAt = Date.now();
  const minimumFillTime = 3500;
  const minimumRetryDelay = 45000;

  if (!form) {
    return;
  }

  const setStatus = (message, type = "info") => {
    if (!formStatus) {
      return;
    }

    formStatus.textContent = message;
    formStatus.dataset.state = type;
  };

  const cleanSingleLine = (value) =>
    value
      .replace(/[\u0000-\u001F\u007F]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const cleanMessage = (value) =>
    value
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]+/g, "")
      .trim();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!form.reportValidity()) {
      setStatus("Controlla i campi obbligatori prima di inviare.", "error");
      return;
    }

    const formData = new FormData(form);
    const name = cleanSingleLine(String(formData.get("name") || ""));
    const email = cleanSingleLine(String(formData.get("email") || "")).toLowerCase();
    const message = cleanMessage(String(formData.get("message") || ""));
    const lastSubmitAt = Number(window.localStorage.getItem("contactFormLastSubmitAt") || 0);

    if (honeypotField && honeypotField.value.trim()) {
      setStatus("Invio non consentito.", "error");
      return;
    }

    if (!consentField?.checked) {
      setStatus("Devi confermare l'informativa privacy per continuare.", "error");
      return;
    }

    if (Date.now() - startedAt < minimumFillTime) {
      setStatus("Invio bloccato: compila il form con calma e riprova tra qualche secondo.", "error");
      return;
    }

    if (Date.now() - lastSubmitAt < minimumRetryDelay) {
      setStatus("Attendi qualche secondo prima di inviare un'altra richiesta.", "error");
      return;
    }

    if (name.length < 2 || name.length > 80) {
      setStatus("Inserisci un nome valido.", "error");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email) || email.length > 160) {
      setStatus("Inserisci un indirizzo email valido.", "error");
      return;
    }

    if (message.length < 20 || message.length > 1500) {
      setStatus("Il messaggio deve contenere tra 20 e 1500 caratteri.", "error");
      return;
    }

    const subject = `Richiesta portfolio da ${name || "contatto sito"}`;
    const bodyLines = [
      `Nome: ${name}`,
      `Email: ${email}`,
      "",
      "Messaggio:",
      message,
    ];

    const mailtoUrl = `mailto:albertomolon4@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    if (submitButton) {
      submitButton.disabled = true;
    }

    if (formNote) {
      formNote.textContent = "Apro il tuo client email con il messaggio gia compilato.";
    }

    setStatus("Apro la tua applicazione email. Il messaggio non viene salvato sul sito.", "success");
    window.localStorage.setItem("contactFormLastSubmitAt", String(Date.now()));
    window.location.href = mailtoUrl;

    window.setTimeout(() => {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }, 4000);
  });
}

function setupProtectedEmail() {
  const emailLinks = Array.from(document.querySelectorAll(".protected-email"));

  emailLinks.forEach((link) => {
    const { user, domain, label } = link.dataset;

    if (!user || !domain) {
      return;
    }

    const email = `${user}@${domain}`;
    link.setAttribute("href", `mailto:${email}`);
    link.textContent = label || "Email";
  });
}
