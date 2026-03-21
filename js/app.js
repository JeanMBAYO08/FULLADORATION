/**
 * Full Adoration — Landing page
 * Thème (mode sombre par défaut)
 */

(function () {
  'use strict';

  const THEME_KEY = 'full-adoration-theme';
  const html = document.documentElement;
  const themeToggle = document.querySelector('.theme-toggle');
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navbar = document.querySelector('.navbar');

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
    if (themeToggle) {
      themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Basculer en mode clair' : 'Basculer en mode sombre');
    }
  }

  setTheme(getPreferredTheme());

  if (themeToggle) {
    themeToggle.addEventListener('click', function () {
      const current = html.getAttribute('data-theme') || 'dark';
      setTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
    if (!localStorage.getItem(THEME_KEY)) setTheme(e.matches ? 'dark' : 'light');
  });

  // Masquer / afficher la navbar en fonction du scroll
  var lastScrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
  var navbarHidden = false;

  window.addEventListener('scroll', function () {
    if (!navbar) return;
    var currentY = window.pageYOffset || document.documentElement.scrollTop || 0;

    // Si on défile vers le bas et qu'on n'est pas en haut de page, on cache la navbar
    if (currentY > lastScrollY && currentY > 24) {
      if (!navbarHidden) {
        navbar.classList.add('navbar--hidden');
        navbarHidden = true;
      }
    } else {
      // Si on remonte, on l'affiche à nouveau
      if (navbarHidden) {
        navbar.classList.remove('navbar--hidden');
        navbarHidden = false;
      }
    }

    lastScrollY = currentY;
  });

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

  if (presenceForm) {
    presenceForm.addEventListener('submit', function (e) {
      e.preventDefault();
      closePresence();
      try {
        alert('Merci pour votre confirmation de présence. Nous nous réjouissons de vous retrouver à Full Adoration.');
      } catch (err) {}
    });
  }

  if (navProgrammeNotif) {
    navProgrammeNotif.addEventListener('click', function (e) {
      e.stopPropagation();
      // L'icône de notification renvoie vers la page Programme
      // au lieu d'ouvrir le panneau notifications.
      try {
        window.location.href = 'programme.html';
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
        addNotification(message, 'programme.html');
      }
    });
  }

  // Vérification toutes les 30 secondes
  setInterval(checkScheduledNotifications, 30000);
})();
