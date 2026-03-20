(function () {
  'use strict';

  var STORAGE_KEY = 'full-adoration-messages';
  var NAME_KEY = 'full-adoration-chat-name';
  var listEl = document.getElementById('messagerie-messages');
  var formEl = document.getElementById('messagerie-form');
  var inputEl = document.getElementById('messagerie-input');
  var nameInputEl = document.getElementById('messagerie-nom');

  function loadMessages() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (err) {
      return [];
    }
  }

  function saveMessages(messages) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (err) {}
  }

  function loadName() {
    try {
      return localStorage.getItem(NAME_KEY) || '';
    } catch (err) {
      return '';
    }
  }

  function saveName(name) {
    try {
      localStorage.setItem(NAME_KEY, name || '');
    } catch (err) {}
  }

  function formatTime(date) {
    var d = typeof date === 'string' ? new Date(date) : date;
    if (Number.isNaN(d.getTime())) d = new Date();
    var h = d.getHours();
    var m = d.getMinutes();
    var dd = d.getDate();
    var mm = d.getMonth() + 1;
    return (
      (dd < 10 ? '0' + dd : dd) +
      '/' +
      (mm < 10 ? '0' + mm : mm) +
      ' ' +
      (h < 10 ? '0' + h : h) +
      ':' +
      (m < 10 ? '0' + m : m)
    );
  }

  function renderMessages() {
    if (!listEl) return;
    var messages = loadMessages();
    listEl.innerHTML = '';

    if (!messages.length) {
      var empty = document.createElement('p');
      empty.className = 'messagerie-empty';
      empty.textContent = "Aucun message pour le moment. Commencez par écrire ce que vous avez sur le cœur.";
      listEl.appendChild(empty);
      return;
    }

    messages.forEach(function (msg) {
      var row = document.createElement('div');
      var isSystem = msg.role === 'system';
      row.className =
        'messagerie-message-row ' +
        (isSystem ? 'messagerie-message-row--system' : 'messagerie-message-row--user');

      var bubble = document.createElement('div');
      bubble.className =
        'messagerie-message ' +
        (isSystem ? 'messagerie-message--system' : 'messagerie-message--user');
      bubble.textContent = msg.text || '';

      var meta = document.createElement('div');
      meta.className = 'messagerie-message-meta';
      var author = msg.author || (isSystem ? 'Système' : 'Moi');
      meta.textContent = author + ' • ' + formatTime(msg.createdAt || new Date());

      bubble.appendChild(meta);
      row.appendChild(bubble);
      listEl.appendChild(row);
    });

    listEl.scrollTop = listEl.scrollHeight;
  }

  function addMessage(text, role) {
    var trimmed = (text || '').trim();
    if (!trimmed) return;
    var messages = loadMessages();
    var authorName = '';
    if (nameInputEl && nameInputEl.value.trim()) {
      authorName = nameInputEl.value.trim();
      saveName(authorName);
    } else {
      authorName = 'Moi';
    }
    messages.push({
      text: trimmed,
      role: role || 'user',
      author: role === 'system' ? 'Equipe Full Adoration' : authorName,
      createdAt: new Date().toISOString()
    });
    saveMessages(messages);
    renderMessages();
  }

  if (formEl && inputEl) {
    formEl.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = inputEl.value;
      if (!value || !value.trim()) return;
      addMessage(value, 'user');
      inputEl.value = '';
    });
  }

  // Initialisation
  // Pré-remplir le nom si déjà saisi
  if (nameInputEl) {
    var storedName = loadName();
    if (storedName) {
      nameInputEl.value = storedName;
    }
    nameInputEl.addEventListener('blur', function () {
      if (nameInputEl.value.trim()) {
        saveName(nameInputEl.value.trim());
      }
    });
  }

  // Si aucune discussion, ajouter quelques messages d'accueil pour donner l'impression d'un vrai chat
  var existing = loadMessages();
  if (!existing.length) {
    existing = [
      {
        text: 'Bienvenue dans le chat Full Adoration. Cet espace est pensé pour les échanges entre membres.',
        role: 'system',
        author: 'Equipe Full Adoration',
        createdAt: new Date().toISOString()
      },
      {
        text: 'Vous pouvez déjà écrire vos messages ici. Le partage en temps réel avec les autres sera activé plus tard.',
        role: 'system',
        author: 'Equipe Full Adoration',
        createdAt: new Date().toISOString()
      }
    ];
    saveMessages(existing);
  }

  renderMessages();
})();

