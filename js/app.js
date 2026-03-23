/**
 * Full Adoration — Landing page
 * Thème (mode sombre par défaut)
 */

(function () {
  'use strict';

  const THEME_KEY = 'full-adoration-theme';
  const LANG_KEY = 'full-adoration-lang';
  const HISTORY_KEY = 'full-adoration-history';
  const html = document.documentElement;
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navbar = document.querySelector('.navbar');

  /** Applique data-theme selon la clé : dark | light | system | (absent = système) */
  function applyThemeToDOM() {
    const stored = localStorage.getItem(THEME_KEY);
    let resolved;
    if (stored === 'system' || stored === null || stored === undefined) {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } else if (stored === 'dark' || stored === 'light') {
      resolved = stored;
    } else {
      resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    html.setAttribute('data-theme', resolved);
  }

  /** dark | light | system — utilisé par la page Paramètres (#settings-theme) */
  function setThemeMode(mode) {
    if (mode === 'system') {
      localStorage.setItem(THEME_KEY, 'system');
    } else if (mode === 'dark' || mode === 'light') {
      localStorage.setItem(THEME_KEY, mode);
    }
    applyThemeToDOM();
  }

  try {
    var langStored = localStorage.getItem(LANG_KEY);
    if (
      langStored === 'en' ||
      langStored === 'fr' ||
      langStored === 'sw' ||
      langStored === 'ln' ||
      langStored === 'pt'
    ) {
      document.documentElement.lang = langStored;
    }
  } catch (eLang) {}

  applyThemeToDOM();

  // Historique : enregistrer cette page tôt (si le script va plus loin sans erreur, doublon évité par filtre URL)
  (function recordVisitEarly() {
    try {
      var pageTitle = document.title || '';
      var baseUrl = window.location.href.split('#')[0];
      var raw = localStorage.getItem(HISTORY_KEY);
      var list = [];
      if (raw) list = JSON.parse(raw);
      if (!Array.isArray(list)) list = [];
      list = list.filter(function (x) {
        return x && x.url !== baseUrl;
      });
      list.unshift({ url: baseUrl, title: pageTitle, t: Date.now() });
      if (list.length > 40) list = list.slice(0, 40);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
    } catch (e) {}
  })();

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'system' || stored === null) {
      html.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    }
  });

  /** Pop-up global — même style partout (remplace alert()) */
  var appModalEl = null;
  var appModalLastFocus = null;
  var appModalOnCloseCallback = null;

  function onAppModalKeydown(ev) {
    if (ev.key === 'Escape') {
      ev.preventDefault();
      closeAppModal();
    }
  }

  function closeAppModal() {
    if (!appModalEl || appModalEl.hasAttribute('hidden')) return;
    appModalEl.setAttribute('hidden', '');
    document.body.classList.remove('app-pop-open');
    document.removeEventListener('keydown', onAppModalKeydown);
    var cb = appModalOnCloseCallback;
    appModalOnCloseCallback = null;
    if (appModalLastFocus && typeof appModalLastFocus.focus === 'function') {
      try {
        appModalLastFocus.focus();
      } catch (e) {}
    }
    appModalLastFocus = null;
    if (typeof cb === 'function') {
      try {
        cb();
      } catch (e2) {}
    }
  }

  function ensureAppModal() {
    if (appModalEl) return appModalEl;
    appModalEl = document.getElementById('app-modal');
    if (appModalEl && document.getElementById('app-modal-ok')) return appModalEl;
    appModalEl = document.createElement('div');
    appModalEl.id = 'app-modal';
    appModalEl.className = 'app-pop';
    appModalEl.setAttribute('hidden', '');
    appModalEl.innerHTML =
      '<div class="app-pop__backdrop" id="app-modal-backdrop" aria-hidden="true"></div>' +
      '<div class="app-pop__panel" role="alertdialog" aria-modal="true" aria-labelledby="app-modal-title" aria-describedby="app-modal-body">' +
      '<div class="app-pop__icon app-pop__icon--info" id="app-modal-icon" aria-hidden="true"><i class="fa-solid fa-circle-exclamation"></i></div>' +
      '<h2 id="app-modal-title" class="app-pop__title"></h2>' +
      '<div id="app-modal-body" class="app-pop__text"></div>' +
      '<button type="button" class="app-pop__btn" id="app-modal-ok">OK</button>' +
      '</div>';
    document.body.appendChild(appModalEl);
    var okBtn = document.getElementById('app-modal-ok');
    var bd = document.getElementById('app-modal-backdrop');
    if (okBtn) okBtn.addEventListener('click', closeAppModal);
    if (bd) bd.addEventListener('click', closeAppModal);
    return appModalEl;
  }

  /**
   * @param {Object} opts
   * @param {string} [opts.title]
   * @param {string} [opts.message] texte brut
   * @param {string} [opts.messageHtml] HTML (contenu maîtrisé uniquement)
   * @param {string} [opts.okLabel]
   * @param {'info'|'success'|'error'} [opts.variant]
   * @param {function} [opts.onClose] après fermeture (OK, fond, Échap)
   */
  function showAppModal(opts) {
    opts = opts || {};
    ensureAppModal();
    var titleEl = document.getElementById('app-modal-title');
    var bodyEl = document.getElementById('app-modal-body');
    var iconWrap = document.getElementById('app-modal-icon');
    var okBtn = document.getElementById('app-modal-ok');
    var variant = opts.variant || 'info';
    var iconClass = variant === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation';
    if (iconWrap) {
      iconWrap.innerHTML = '<i class="fa-solid ' + iconClass + '"></i>';
      iconWrap.className = 'app-pop__icon app-pop__icon--' + variant;
    }
    if (titleEl) titleEl.textContent = opts.title != null ? opts.title : 'Information';
    if (bodyEl) {
      if (opts.messageHtml) {
        bodyEl.innerHTML = opts.messageHtml;
      } else {
        bodyEl.innerHTML = '';
        var p = document.createElement('p');
        p.textContent = opts.message || '';
        bodyEl.appendChild(p);
      }
    }
    if (okBtn) okBtn.textContent = opts.okLabel || 'OK';
    appModalOnCloseCallback = typeof opts.onClose === 'function' ? opts.onClose : null;
    appModalLastFocus = document.activeElement;
    appModalEl.removeAttribute('hidden');
    document.body.classList.add('app-pop-open');
    document.addEventListener('keydown', onAppModalKeydown);
    window.requestAnimationFrame(function () {
      if (okBtn) {
        try {
          okBtn.focus();
        } catch (e) {}
      }
    });
  }

  window.showAppModal = showAppModal;
  window.closeAppModal = closeAppModal;

  // Masquer / afficher la navbar en fonction du scroll (throttle requestAnimationFrame)
  var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var navbarHidden = false;
  var scrollRaf = 0;

  window.addEventListener(
    'scroll',
    function () {
      if (!navbar) return;
      if (scrollRaf) return;
      scrollRaf = window.requestAnimationFrame(function () {
        scrollRaf = 0;
        var currentY = window.pageYOffset || document.documentElement.scrollTop || 0;

        if (currentY > lastScrollY && currentY > 24) {
          if (!navbarHidden) {
            navbar.classList.add('navbar--hidden');
            navbarHidden = true;
          }
        } else {
          if (navbarHidden) {
            navbar.classList.remove('navbar--hidden');
            navbarHidden = false;
          }
        }

        lastScrollY = currentY;
      });
    },
    { passive: true }
  );

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', function () {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('is-open');
    });

    navMenu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('is-open');
      });
    });
  }

  // Message de bienvenue personnalisé sur la page d'accueil
  var greetingEl = document.getElementById('user-greeting');
  var heroOverlayNameEl = document.getElementById('hero-overlay-name');
  if (greetingEl) {
    var storedName = '';
    try {
      storedName = localStorage.getItem('full-adoration-name') || '';
    } catch (err) {
      storedName = '';
    }
    if (storedName) {
      greetingEl.textContent = 'Hello ' + storedName + ', bienvenu a Full Adoration';
      greetingEl.hidden = false;
    } else {
      greetingEl.hidden = true;
    }
  }

  // Nom sur l'overlay vidéo
  if (heroOverlayNameEl) {
    var storedName2 = '';
    try {
      storedName2 = localStorage.getItem('full-adoration-name') || '';
    } catch (err2) {
      storedName2 = '';
    }
    var firstName = (storedName2 || '').trim().split(/\s+/)[0] || '';
    heroOverlayNameEl.textContent = firstName || 'Invité';
  }

  // Chatbot simple sur la page d'accueil
  var chatLauncher = document.querySelector('.chat-launcher');
  var chatWindow = document.querySelector('.chat-window');
  var chatBackdrop = document.querySelector('.chat-backdrop');
  var presenceOpenBtn = document.getElementById('presence-open');
  var presenceModal = document.querySelector('.presence-modal');
  var presenceForm = document.getElementById('presence-form');
  var presenceCloseBtn = document.querySelector('.presence-close');
  var presenceCancelBtn = document.getElementById('presence-cancel');
  var navProgrammeNotif = document.getElementById('nav-programme-notif');
  var footerYear = document.getElementById('footer-year');
  var chatForm = document.getElementById('chat-form');
  var chatInput = document.getElementById('chat-input');
  var chatMessages = document.getElementById('chat-messages');
  var chatClose = document.querySelector('.chat-close');
  var countdownDays = document.getElementById('countdown-days');
  var countdownHours = document.getElementById('countdown-hours');
  var countdownMinutes = document.getElementById('countdown-minutes');
  var countdownSeconds = document.getElementById('countdown-seconds');
  var navNotifPanel = document.getElementById('nav-notif-panel');
  var navNotifList = document.querySelector('.nav-notif-list');
  var heroVideo = document.querySelector('.hero-video');
  var posterTrack = document.getElementById('poster-track');
  var posterPrev = document.getElementById('poster-prev');
  var posterNext = document.getElementById('poster-next');
  var posterIndex = 0;

  function appendMessage(text, role) {
    if (!chatMessages) return;
    var bubble = document.createElement('div');
    bubble.className = 'chat-message ' + role;
    bubble.textContent = text;
    chatMessages.appendChild(bubble);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function botReply(userText) {
    var txt = (userText || '').toLowerCase();
    var answer = "Merci pour votre message. Full Adoration est là pour ramener les cœurs au Christ.";
    if (txt.includes('lieu') || txt.includes('ou') || txt.includes('où')) {
      answer = "Le lieu exact sera communiqué prochainement sur cette page. Restez connecté.";
    } else if (txt.includes('programme')) {
      answer = "Le programme détaillé de Full Adoration sera bientôt disponible dans la section Programme.";
    } else if (txt.includes('bonjour') || txt.includes('salut')) {
      answer = "Bonjour 🙏, comment puis-je vous aider pour Full Adoration ?";
    }
    appendMessage(answer, 'bot');
  }

  if (footerYear) {
    try {
      footerYear.textContent = String(new Date().getFullYear());
    } catch (err) {}
  }

  // Slider des affiches
  if (posterTrack && posterPrev && posterNext) {
    var posterSlides = posterTrack.querySelectorAll('.poster-slide');
    var posterAutoTimer = null;

    function setPosterActive(index) {
      if (!posterSlides || !posterSlides.length) return;
      posterSlides.forEach(function (s) {
        s.classList.remove('poster-slide--active', 'poster-slide--next');
      });
      var active = index % posterSlides.length;
      if (active < 0) active = posterSlides.length - 1;
      var next = (active + 1) % posterSlides.length;
      if (posterSlides[active]) posterSlides[active].classList.add('poster-slide--active');
      if (posterSlides[next]) posterSlides[next].classList.add('poster-slide--next');
    }

    function goToPoster(index) {
      if (!posterSlides.length) return;
      if (index < 0) index = posterSlides.length - 1;
      if (index >= posterSlides.length) index = 0;
      posterIndex = index;
      setPosterActive(posterIndex);
      // Affichage "1.5 slide" : 1 image complète + la suivante à moitié
      var slideWidth = posterTrack.clientWidth * (2 / 3);
      var offset = posterIndex * slideWidth;
      posterTrack.scrollTo({ left: offset, behavior: 'smooth' });
    }

    posterPrev.addEventListener('click', function () {
      goToPoster(posterIndex - 1);
      startPosterAuto();
    });

    posterNext.addEventListener('click', function () {
      goToPoster(posterIndex + 1);
      startPosterAuto();
    });

    function startPosterAuto() {
      if (posterAutoTimer) clearInterval(posterAutoTimer);
      posterAutoTimer = setInterval(function () {
        goToPoster(posterIndex + 1);
      }, 5000);
    }

    // Défilement automatique toutes les 5 secondes
    startPosterAuto();

    // Ajuste l'index après redimensionnement
    window.addEventListener('resize', function () {
      goToPoster(posterIndex);
    });

    // Etat initial
    setPosterActive(posterIndex);
  }

  // Compte à rebours vers le 19 avril 2026
  if (countdownDays && countdownHours && countdownMinutes && countdownSeconds) {
    var targetDate = new Date(2026, 3, 19, 0, 0, 0); // 19 avril 2026 (mois = 3)

    function pad2(value) {
      return value < 10 ? '0' + value : String(value);
    }

    function updateCountdown() {
      var now = new Date();
      var diff = targetDate.getTime() - now.getTime();
      if (diff <= 0) {
        countdownDays.textContent = '00';
        countdownHours.textContent = '00';
        countdownMinutes.textContent = '00';
        countdownSeconds.textContent = '00';
        return;
      }
      var totalSeconds = Math.floor(diff / 1000);
      var days = Math.floor(totalSeconds / 86400);
      var hours = Math.floor((totalSeconds % 86400) / 3600);
      var minutes = Math.floor((totalSeconds % 3600) / 60);
      var seconds = totalSeconds % 60;

      countdownDays.textContent = pad2(days);
      countdownHours.textContent = pad2(hours);
      countdownMinutes.textContent = pad2(minutes);
      countdownSeconds.textContent = pad2(seconds);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
  }

  // Lecture de la vidéo du hero, notamment sur mobile
  if (heroVideo) {
    // S'assurer des bons attributs pour les mobiles
    heroVideo.setAttribute('playsinline', '');
    heroVideo.setAttribute('muted', '');

    // Sur les petits écrans, afficher les contrôles pour permettre un déclenchement manuel
    try {
      if (window.matchMedia && window.matchMedia('(max-width: 768px)').matches) {
        heroVideo.setAttribute('controls', 'controls');
      }
    } catch (err) {}

    function tryPlayHero() {
      try {
        var playPromise = heroVideo.play && heroVideo.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(function () { /* ignore blocage autoplay */ });
        }
      } catch (e) {}
    }

    // Tentative automatique dès que possible
    heroVideo.addEventListener('canplay', function () {
      if (heroVideo.paused) {
        tryPlayHero();
      }
    });

    // Sur le premier toucher / clic utilisateur, relancer la lecture si besoin
    function onFirstInteraction() {
      if (heroVideo.paused) {
        tryPlayHero();
      }
      document.removeEventListener('touchstart', onFirstInteraction);
      document.removeEventListener('click', onFirstInteraction);
    }

    document.addEventListener('touchstart', onFirstInteraction, { passive: true });
    document.addEventListener('click', onFirstInteraction);
  }

  // Notifications (centre de notif simple)
  var notifBadge = navProgrammeNotif ? navProgrammeNotif.querySelector('.nav-badge') : null;

  // Boucle du texte sur la vidéo jusqu'à 20s, puis on cache le texte
  // et on affiche la cloche sur la navbar.
  (function () {
    if (!navProgrammeNotif) return;
    var heroOverlay = document.getElementById('hero-video-overlay');
    if (!heroOverlay || !heroVideo) return;

    var lastTime = -1;
    var overlayDone = false;
    var cycleTimers = [];
    var repeatTimers = [];
    var CYCLE_DURATION_MS = 6000; // 3s bloc1 + 3s bloc2

    var heroHelloEl = heroOverlay.querySelector('.hero-overlay-hello');
    var heroNameEl = heroOverlay.querySelector('.hero-overlay-name');
    var heroWelcomePrefixEl = heroOverlay.querySelector('.hero-overlay-welcome-prefix');
    var heroBrandEl = heroOverlay.querySelector('.hero-overlay-brand');

    function clearCycleTimers() {
      cycleTimers.forEach(function (id) {
        try {
          clearTimeout(id);
        } catch (e) {}
      });
      cycleTimers = [];
    }

    function clearRepeatTimers() {
      repeatTimers.forEach(function (id) {
        try {
          clearTimeout(id);
        } catch (e) {}
      });
      repeatTimers = [];
    }

    function setOverlayVisible(visible) {
      if (visible) heroOverlay.classList.remove('hero-video-overlay--done');
      else heroOverlay.classList.add('hero-video-overlay--done');
    }

    function hideAllBlocks() {
      var els = [heroHelloEl, heroNameEl, heroWelcomePrefixEl, heroBrandEl];
      els.forEach(function (el) {
        if (!el) return;
        el.classList.remove('hero-overlay-animate');
      });
    }

    function showGroup(elsToShow) {
      if (overlayDone) return;
      elsToShow.forEach(function (el) {
        if (!el) return;
        el.classList.remove('hero-overlay-animate');
        // reflow pour relancer l'animation
        void el.offsetHeight;
        el.classList.add('hero-overlay-animate');
      });
    }

    function startOverlayCycle() {
      if (overlayDone) return;
      clearCycleTimers();

      navProgrammeNotif.classList.add('nav-programme-notif--delayed');
      setOverlayVisible(true);
      hideAllBlocks();

      // 1) Hello + Nom pendant 3s
      showGroup([heroHelloEl, heroNameEl]);

      // 2) Bienvenue + Full Adoration pendant 3s, ensuite on laisse vide
      cycleTimers.push(
        window.setTimeout(function () {
          if (overlayDone) return;
          showGroup([heroWelcomePrefixEl, heroBrandEl]);
        }, 3000)
      );
    }

    function maybeHideAt22Seconds() {
      if (overlayDone) return;
      var t = heroVideo.currentTime || 0;
      if (t >= 22) {
        overlayDone = true;
        clearCycleTimers();
        clearRepeatTimers();
        setOverlayVisible(false);
        navProgrammeNotif.classList.remove('nav-programme-notif--delayed');
      }
    }

    function scheduleCycleRepeat() {
      if (overlayDone) return;
      // planifie un nouveau cycle toutes les 6s
      repeatTimers.push(
        window.setTimeout(function () {
          if (overlayDone) return;
          // si on est déjà passé 22s, on ne relance pas
          var t = heroVideo.currentTime || 0;
          if (t >= 22) return;
          startOverlayCycle();
          scheduleCycleRepeat();
        }, CYCLE_DURATION_MS)
      );
    }

    // Démarrage
    navProgrammeNotif.classList.add('nav-programme-notif--delayed');
    setOverlayVisible(true);
    startOverlayCycle();
    scheduleCycleRepeat();

    heroVideo.addEventListener('timeupdate', function () {
      var t = heroVideo.currentTime || 0;

      // Détection loop: currentTime repart vers le début
      if (lastTime > 0 && t < lastTime - 1) {
        // On redémarre l'overlay à chaque boucle vidéo
        overlayDone = false;
        clearCycleTimers();
        clearRepeatTimers();
        navProgrammeNotif.classList.add('nav-programme-notif--delayed');
        setOverlayVisible(true);
        startOverlayCycle();
        scheduleCycleRepeat();
      }

      lastTime = t;
      maybeHideAt22Seconds();
    });

    // Sécurité au chargement
    window.setTimeout(maybeHideAt22Seconds, 250);
  })();

  function updateNotifBadge() {
    if (!notifBadge) return;
    if (!navNotifList) {
      notifBadge.classList.add('nav-badge-hidden');
      return;
    }
    var unread = navNotifList.querySelector('.nav-notif-item[data-unread="true"]');
    if (unread) {
      notifBadge.classList.remove('nav-badge-hidden');
    } else {
      notifBadge.classList.add('nav-badge-hidden');
    }
  }

  updateNotifBadge();

  function addNotification(message, href) {
    if (!navNotifList) return;
    var li = document.createElement('li');
    li.className = 'nav-notif-item';
    li.setAttribute('data-unread', 'true');
    var p = document.createElement('p');
    p.className = 'nav-notif-text';
    p.textContent = message;
    li.appendChild(p);
    if (href) {
      var link = document.createElement('a');
      link.className = 'nav-notif-link';
      link.href = href;
      link.textContent = 'Ouvrir';
      li.appendChild(link);
    }
    navNotifList.appendChild(li);
    updateNotifBadge();
  }

  function openNotifPanel() {
    if (!navNotifPanel) return;
    navNotifPanel.removeAttribute('hidden');
    if (navProgrammeNotif) navProgrammeNotif.setAttribute('aria-expanded', 'true');
    if (navNotifList) {
      navNotifList.querySelectorAll('.nav-notif-item').forEach(function (item) {
        item.setAttribute('data-unread', 'false');
      });
    }
    updateNotifBadge();
  }

  function closeNotifPanel() {
    if (!navNotifPanel) return;
    navNotifPanel.setAttribute('hidden', 'true');
    if (navProgrammeNotif) navProgrammeNotif.setAttribute('aria-expanded', 'false');
  }

  function openChat() {
    if (!chatWindow) return;
    chatWindow.removeAttribute('hidden');
    chatWindow.classList.add('is-open');
    if (chatBackdrop) chatBackdrop.removeAttribute('hidden');
    if (chatMessages && chatMessages.children.length === 0) {
      appendMessage("Bienvenue dans le chat Full Adoration. Posez votre question et nous vous répondrons dès que possible.", 'bot');
    }
    if (chatInput) chatInput.focus();
  }

  function closeChat() {
    if (!chatWindow) return;
    chatWindow.setAttribute('hidden', 'true');
    chatWindow.classList.remove('is-open');
    if (chatBackdrop) chatBackdrop.setAttribute('hidden', 'true');
  }

  function openPresence() {
    if (!presenceModal) return;
    presenceModal.removeAttribute('hidden');
    presenceModal.classList.add('is-open');
    if (chatBackdrop) chatBackdrop.removeAttribute('hidden');
    var firstField = document.getElementById('presence-origin');
    if (firstField) firstField.focus();
  }

  function closePresence() {
    if (!presenceModal) return;
    presenceModal.setAttribute('hidden', 'true');
    presenceModal.classList.remove('is-open');
    if (chatBackdrop && (!chatWindow || chatWindow.hasAttribute('hidden'))) {
      chatBackdrop.setAttribute('hidden', 'true');
    }
  }

  if (chatLauncher && chatWindow) {
    chatLauncher.addEventListener('click', function () {
      var hidden = chatWindow.hasAttribute('hidden');
      if (hidden) {
        openChat();
      } else {
        closeChat();
      }
    });
  }

  if (chatClose && chatWindow) {
    chatClose.addEventListener('click', function () {
      closeChat();
    });
  }

  if (chatBackdrop && chatWindow) {
    chatBackdrop.addEventListener('click', function () {
      closeChat();
      closePresence();
    });
  }

  if (chatForm && chatInput) {
    chatForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = chatInput.value.trim();
      if (!value) return;
      appendMessage(value, 'user');
      chatInput.value = '';
      botReply(value);
    });
  }

  // Modal "Je confirme ma présence"
  if (presenceOpenBtn && presenceModal) {
    presenceOpenBtn.addEventListener('click', function () {
      openPresence();
    });
  }

  if (presenceCloseBtn && presenceModal) {
    presenceCloseBtn.addEventListener('click', function () {
      closePresence();
    });
  }

  if (presenceCancelBtn && presenceModal) {
    presenceCancelBtn.addEventListener('click', function () {
      closePresence();
    });
  }

  /** Même pop-up global (.app-pop) que le formulaire d’inscription (experience.html) */
  function showPresenceFormErrorModal() {
    try {
      showAppModal({
        title: 'Champs requis',
        messageHtml:
          '<p><strong>Origine</strong>, <strong>impressions</strong> et <strong>attentes</strong> : sélectionnez chaque liste.</p>',
        variant: 'error'
      });
    } catch (err) {}
  }

  if (presenceForm) {
    presenceForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var originEl = document.getElementById('presence-origin');
      var impressionEl = document.getElementById('presence-impression');
      var attentesEl = document.getElementById('presence-attentes');
      var allFilled =
        originEl &&
        impressionEl &&
        attentesEl &&
        String(originEl.value || '').trim() !== '' &&
        String(impressionEl.value || '').trim() !== '' &&
        String(attentesEl.value || '').trim() !== '';
      var html5Ok = presenceForm.checkValidity && presenceForm.checkValidity();
      if (!allFilled || !html5Ok) {
        showPresenceFormErrorModal();
        return;
      }
      closePresence();
      try {
        showAppModal({
          title: 'Merci',
          message: 'Présence enregistrée. À bientôt à Full Adoration.',
          variant: 'success'
        });
      } catch (err2) {}
    });
  }

  if (navProgrammeNotif) {
    navProgrammeNotif.addEventListener('click', function (e) {
      e.stopPropagation();
      // L'icône de notification renvoie vers la messagerie
      try {
        window.location.href = 'messagerie.html';
      } catch (err) {}
    });
  }

  document.addEventListener('click', function (e) {
    if (!navNotifPanel || navNotifPanel.hasAttribute('hidden')) return;
    if (navProgrammeNotif && navProgrammeNotif.contains(e.target)) return;
    if (navNotifPanel.contains(e.target)) return;
    closeNotifPanel();
  });

  // Notifications planifiées à 07:00, 12:00, 20:00 (pendant que la page est ouverte)
  var scheduledTimes = ['07:00', '12:00', '20:00'];
  var triggeredSlots = {};

  function getTodayKey() {
    var now = new Date();
    return now.getFullYear() + '-' + (now.getMonth() + 1) + '-' + now.getDate();
  }

  function checkScheduledNotifications() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var hhmm = (hours < 10 ? '0' + hours : '' + hours) + ':' + (minutes < 10 ? '0' + minutes : '' + minutes);
    var today = getTodayKey();

    scheduledTimes.forEach(function (slot) {
      if (hhmm === slot) {
        if (triggeredSlots[slot] === today) return;
        triggeredSlots[slot] = today;
        var message;
        if (slot === '07:00') {
          message = "Commencez la journée avec une intention pour Full Adoration.";
        } else if (slot === '12:00') {
          message = "Prenez un instant pour confier votre journée à Jésus avant Full Adoration.";
        } else {
          message = "En fin de journée, préparez votre cœur pour Full Adoration.";
        }
        addNotification(message, 'messagerie.html');
      }
    });
  }

  // Vérification toutes les 30 secondes
  setInterval(checkScheduledNotifications, 30000);

  var AVATAR_KEY = 'full-adoration-avatar';
  var PHONE_KEY = 'full-adoration-phone';

  /** Préremplit correctement les champs : ajoute + si le numéro est stocké sans (E.164). */
  function normalizeStoredPhoneDisplay(raw) {
    if (raw == null || raw === '') return '';
    var s = String(raw).trim().replace(/\s/g, '');
    if (!s) return '';
    if (s.charAt(0) === '+') return s;
    var d = s.replace(/\D/g, '');
    if (d.length >= 9) return '+' + d;
    return String(raw).trim();
  }

  var PRESERVE_LOCAL_KEYS = [
    THEME_KEY,
    LANG_KEY,
    'full-adoration-name',
    AVATAR_KEY,
    PHONE_KEY
  ];

  function clearAppCache() {
    try {
      sessionStorage.clear();
    } catch (e1) {}
    try {
      var keys = Object.keys(localStorage);
      for (var i = 0; i < keys.length; i++) {
        if (PRESERVE_LOCAL_KEYS.indexOf(keys[i]) === -1) {
          localStorage.removeItem(keys[i]);
        }
      }
    } catch (e2) {}
    if (window.caches && window.caches.keys) {
      window.caches.keys().then(function (names) {
        names.forEach(function (n) {
          caches.delete(n);
        });
      }).catch(function () {});
    }
    try {
      var lngAlert = document.documentElement.lang || 'fr';
      var cacheMsg = {
        fr: 'Cache effacé (thème, langue, prénom, téléphone et photo conservés). Rechargement…',
        en: 'Cache cleared (theme, language, name, phone and photo kept). Reloading…',
        sw: 'Akiba imefutwa (mandhari, lugha, jina, nambari na picha zimehifadhiwa). Ukurasa unapakia tena…',
        ln: 'Cache ebimami (thème, monoko, téléphone, nkombo mpe sika). Page ekozongela…',
        pt: 'Cache limpo (tema, idioma, nome, telefone e foto mantidos). A recarregar…'
      };
      showAppModal({
        title: 'Cache',
        message: cacheMsg[lngAlert] || cacheMsg.fr,
        variant: 'success',
        onClose: function () {
          try {
            window.location.reload();
          } catch (e4) {}
        }
      });
    } catch (e3) {
      try {
        window.location.reload();
      } catch (e4) {}
    }
  }

  function initSettingsPage() {
    var root = document.getElementById('menu-avance');
    if (!root) return;

    var themeSelect = document.getElementById('settings-theme');
    var langSelect = document.getElementById('settings-lang');
    var historyList = document.getElementById('settings-history-list');
    var btnClearHistory = document.getElementById('settings-clear-history');
    var btnClearCache = document.getElementById('settings-clear-cache');

    var avatarImg = document.getElementById('settings-avatar-img');
    var avatarInitials = document.getElementById('settings-avatar-initials');
    var avatarTrigger = document.getElementById('settings-avatar-trigger');
    var avatarInput = document.getElementById('settings-avatar-input');
    var avatarRemove = document.getElementById('settings-avatar-remove');
    var profileNameInput = document.getElementById('settings-profile-name');
    var profilePhoneInput = document.getElementById('settings-profile-phone');
    var profileSaveBtn = document.getElementById('settings-profile-save');
    var DEFAULT_MASCOT_SRC = 'assets/mascotte.png';

    function getInitialsFromName(name) {
      var s = (name || '').trim();
      if (!s) return '?';
      var parts = s.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2);
      }
      return s.slice(0, 2).toUpperCase();
    }

    function refreshAvatarDisplay() {
      if (!avatarImg || !avatarInitials) return;
      var data;
      try {
        data = localStorage.getItem(AVATAR_KEY);
      } catch (e) {
        data = null;
      }
      var name = '';
      try {
        name = localStorage.getItem('full-adoration-name') || '';
      } catch (e2) {
        name = '';
      }
      avatarImg.onerror = null;

      if (data && String(data).indexOf('data:image') === 0) {
        avatarImg.classList.remove('settings-avatar-img--default');
        avatarImg.src = data;
        avatarImg.hidden = false;
        avatarInitials.hidden = true;
        avatarImg.alt = '';
        if (avatarRemove) avatarRemove.hidden = false;
      } else {
        avatarImg.classList.add('settings-avatar-img--default');
        avatarImg.src = DEFAULT_MASCOT_SRC;
        avatarImg.hidden = false;
        avatarInitials.hidden = true;
        avatarImg.alt = 'Mascotte Full Adoration';
        if (avatarRemove) avatarRemove.hidden = true;
        avatarImg.onerror = function () {
          avatarImg.onerror = null;
          avatarImg.classList.remove('settings-avatar-img--default');
          avatarImg.hidden = true;
          avatarImg.removeAttribute('src');
          avatarInitials.hidden = false;
          avatarInitials.textContent = getInitialsFromName(name);
        };
      }
    }

    function resizeImageToDataUrl(srcDataUrl, maxDim, quality, callback) {
      var img = new Image();
      img.onload = function () {
        var w = img.naturalWidth || img.width;
        var h = img.naturalHeight || img.height;
        var scale = Math.min(1, maxDim / Math.max(w, h, 1));
        var cw = Math.max(1, Math.round(w * scale));
        var ch = Math.max(1, Math.round(h * scale));
        var canvas = document.createElement('canvas');
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext('2d');
        if (!ctx) {
          callback(null);
          return;
        }
        ctx.drawImage(img, 0, 0, cw, ch);
        try {
          callback(canvas.toDataURL('image/jpeg', quality));
        } catch (e) {
          callback(null);
        }
      };
      img.onerror = function () {
        callback(null);
      };
      img.src = srcDataUrl;
    }

    if (avatarTrigger && avatarInput) {
      avatarTrigger.addEventListener('click', function () {
        avatarInput.click();
      });
    }

    if (avatarInput) {
      avatarInput.addEventListener('change', function () {
        var file = avatarInput.files && avatarInput.files[0];
        avatarInput.value = '';
        if (!file || !file.type || file.type.indexOf('image') !== 0) return;
        var reader = new FileReader();
        reader.onload = function (ev) {
          var raw = ev.target && ev.target.result;
          if (!raw) return;
          resizeImageToDataUrl(String(raw), 320, 0.82, function (dataUrl) {
            if (!dataUrl) {
              try {
                showAppModal({
                  title: 'Photo',
                  message:
                    (document.documentElement.lang || 'fr').indexOf('en') === 0
                      ? 'Image unreadable. Try another file.'
                      : 'Image illisible. Essayez un autre fichier.',
                  variant: 'error'
                });
              } catch (e) {}
              return;
            }
            try {
              localStorage.setItem(AVATAR_KEY, dataUrl);
            } catch (e2) {
              try {
                showAppModal({
                  title: 'Photo',
                  message:
                    (document.documentElement.lang || 'fr').indexOf('en') === 0
                      ? 'File too large. Choose a smaller image.'
                      : 'Fichier trop lourd. Choisissez une image plus légère.',
                  variant: 'error'
                });
              } catch (e3) {}
              return;
            }
            refreshAvatarDisplay();
          });
        };
        reader.onerror = function () {};
        try {
          reader.readAsDataURL(file);
        } catch (e) {}
      });
    }

    if (avatarRemove) {
      avatarRemove.addEventListener('click', function () {
        try {
          localStorage.removeItem(AVATAR_KEY);
        } catch (e) {}
        refreshAvatarDisplay();
      });
    }

    if (profileNameInput) {
      try {
        profileNameInput.value = localStorage.getItem('full-adoration-name') || '';
      } catch (e) {}
      profileNameInput.addEventListener('input', function () {
        refreshAvatarDisplay();
      });
    }

    function saveProfile() {
      if (profileNameInput) {
        var v = profileNameInput.value.trim();
        try {
          if (v) localStorage.setItem('full-adoration-name', v);
          else localStorage.removeItem('full-adoration-name');
        } catch (e) {}
      }
      if (profilePhoneInput) {
        var p = normalizeStoredPhoneDisplay(profilePhoneInput.value.trim());
        try {
          if (p) {
            localStorage.setItem(PHONE_KEY, p);
            profilePhoneInput.value = p;
          } else localStorage.removeItem(PHONE_KEY);
        } catch (e2) {}
      }
      refreshAvatarDisplay();
    }

    if (profilePhoneInput) {
      try {
        profilePhoneInput.value = normalizeStoredPhoneDisplay(localStorage.getItem(PHONE_KEY)) || '';
      } catch (e) {}
    }

    if (profileSaveBtn) {
      profileSaveBtn.addEventListener('click', function () {
        saveProfile();
        try {
          var lng = localStorage.getItem(LANG_KEY) || 'fr';
          var msg =
            lng === 'en'
              ? 'Saved.'
              : lng === 'sw'
                ? 'Imehifadhiwa.'
                : lng === 'ln'
                  ? 'Ebakisami.'
                  : lng === 'pt'
                    ? 'Guardado.'
                    : 'Enregistré.';
          showAppModal({
            title:
              lng === 'en'
                ? 'Profile'
                : lng === 'sw'
                  ? 'Wasifu'
                  : lng === 'ln'
                    ? 'Profil'
                    : lng === 'pt'
                      ? 'Perfil'
                      : 'Profil',
            message: msg,
            variant: 'success'
          });
        } catch (e) {}
      });
    }

    refreshAvatarDisplay();

    var i18n = {
      fr: {
        emptyHistory: 'Aucune page enregistrée pour le moment.',
        clearHistoryDone: 'Effacé.',
        cacheDone: 'Cache vidé.'
      },
      en: {
        emptyHistory: 'No pages recorded yet.',
        clearHistoryDone: 'Cleared.',
        cacheDone: 'Cache cleared.'
      },
      sw: {
        emptyHistory: 'Hakuna ukurasa uliorekodiwa bado.',
        clearHistoryDone: 'Imefutwa.',
        cacheDone: 'Akiba imefutwa.'
      },
      ln: {
        emptyHistory: 'Ba pages te ezali na liste sikoyo.',
        clearHistoryDone: 'Elongolami.',
        cacheDone: 'Cache elongolami.'
      },
      pt: {
        emptyHistory: 'Nenhuma página registada por agora.',
        clearHistoryDone: 'Limpo.',
        cacheDone: 'Cache limpo.'
      }
    };

    var localeByLang = {
      fr: 'fr-FR',
      en: 'en-GB',
      sw: 'sw',
      ln: 'ln-CD',
      pt: 'pt-BR'
    };

    function t(key) {
      var lng = localStorage.getItem(LANG_KEY) || 'fr';
      var pack = i18n[lng] || i18n.fr;
      return pack[key] || i18n.fr[key] || key;
    }

    function renderHistory() {
      if (!historyList) return;
      historyList.innerHTML = '';
      var list = [
        { title: 'Full Adoration 2023', url: 'accueil.html' },
        { title: 'Full Adoration 2024', url: 'accueil.html' },
        { title: 'Full Adoration 2025', url: 'accueil.html' }
      ];

      list.forEach(function (entry) {
        var li = document.createElement('li');
        li.className = 'settings-history-item';
        var a = document.createElement('a');
        a.href = entry.url;
        a.textContent = entry.title || entry.url;
        a.className = 'settings-history-link';
        li.appendChild(a);
        historyList.appendChild(li);
      });
    }

    if (themeSelect) {
      var st = localStorage.getItem(THEME_KEY);
      if (st === 'dark' || st === 'light' || st === 'system') {
        themeSelect.value = st;
      } else {
        themeSelect.value = 'system';
      }
      themeSelect.addEventListener('change', function () {
        setThemeMode(themeSelect.value);
      });
    }

    if (langSelect) {
      var sl = localStorage.getItem(LANG_KEY);
      var allowedLang = { en: 1, fr: 1, sw: 1, ln: 1, pt: 1 };
      langSelect.value = allowedLang[sl] ? sl : 'fr';
      langSelect.addEventListener('change', function () {
        var v = langSelect.value;
        if (!allowedLang[v]) return;
        var prev = localStorage.getItem(LANG_KEY) || 'fr';
        if (prev === v) return;
        try {
          localStorage.setItem(LANG_KEY, v);
          document.documentElement.lang = v;
          window.location.reload();
        } catch (e) {}
      });
    }

    if (btnClearHistory) {
      btnClearHistory.addEventListener('click', function () {
        try {
          localStorage.removeItem(HISTORY_KEY);
        } catch (e) {}
        renderHistory();
        try {
          showAppModal({
            title: 'Historique',
            message: t('clearHistoryDone'),
            variant: 'success'
          });
        } catch (e2) {}
      });
    }

    if (btnClearCache) {
      btnClearCache.addEventListener('click', function () {
        clearAppCache();
      });
    }

    renderHistory();
  }

  initSettingsPage();
})();
