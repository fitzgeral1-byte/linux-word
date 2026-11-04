/*
 * keyboard.js
 * Estado de color del teclado (mejor estado alcanzado), teclado virtual y teclado físico.
 */
(function (g) {
  'use strict';

  const RANK = { absent: 1, present: 2, correct: 3 };
  const SYMBOL = { correct: '✓', present: '↔', absent: '✕' };
  const LABEL = { correct: 'correcta', present: 'en otra posición', absent: 'ausente' };

  /** Devuelve el mejor de dos estados (verde > amarillo > gris). */
  function bestState(a, b) {
    const ra = RANK[a] || 0;
    const rb = RANK[b] || 0;
    return rb > ra ? b : a;
  }

  /**
   * Fusiona el resultado de un intento en el mapa de estados de teclas.
   * Nunca degrada una tecla ya confirmada como amarilla o verde.
   */
  function mergeKeyStates(states, guess, result) {
    const next = Object.assign({}, states);
    const chars = Array.from(guess);
    for (let i = 0; i < chars.length; i++) {
      const prev = next[chars[i]];
      next[chars[i]] = prev ? bestState(prev, result[i]) : result[i];
    }
    return next;
  }

  function buildKeyStates(guesses, results) {
    let states = {};
    guesses.forEach((guess, i) => { states = mergeKeyStates(states, guess, results[i]); });
    return states;
  }

  const ROWS = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '-', 'back']
  ];

  /** Construye el teclado virtual dentro de `container`. onKey recibe 'a'..'z', '-', 'enter' o 'back'. */
  function renderKeyboard(container, onKey) {
    container.textContent = '';
    ROWS.forEach((row) => {
      const rowEl = document.createElement('div');
      rowEl.className = 'kb-row';
      row.forEach((key) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'key';
        btn.dataset.key = key;
        if (key === 'enter') {
          btn.classList.add('key-wide');
          btn.textContent = 'Enter';
          btn.setAttribute('aria-label', 'Confirmar');
        } else if (key === 'back') {
          btn.classList.add('key-wide');
          btn.textContent = '⌫';
          btn.setAttribute('aria-label', 'Borrar');
        } else {
          const label = document.createElement('span');
          label.className = 'key-label';
          label.textContent = key === '-' ? '–' : key.toUpperCase();
          btn.appendChild(label);
          const badge = document.createElement('span');
          badge.className = 'key-badge';
          badge.setAttribute('aria-hidden', 'true');
          btn.appendChild(badge);
          btn.setAttribute('aria-label', key === '-' ? 'guion' : key);
        }
        // Evita que la tecla toque el foco: así Enter/Espacio del teclado físico no la reactivan.
        btn.addEventListener('mousedown', (ev) => ev.preventDefault());
        btn.addEventListener('click', () => { onKey(key); btn.blur(); });
        rowEl.appendChild(btn);
      });
      container.appendChild(rowEl);
    });
  }

  /** Aplica los estados (clases, símbolo y texto accesible) al teclado virtual. */
  function updateKeyboard(container, states) {
    container.querySelectorAll('.key').forEach((btn) => {
      const key = btn.dataset.key;
      btn.classList.remove('correct', 'present', 'absent');
      const badge = btn.querySelector('.key-badge');
      if (badge) badge.textContent = '';
      const st = states[key];
      if (st && RANK[st]) {
        btn.classList.add(st);
        if (badge) badge.textContent = SYMBOL[st];
        const base = key === '-' ? 'guion' : key;
        btn.setAttribute('aria-label', base + ': ' + LABEL[st]);
      }
    });
  }

  /**
   * Vincula el teclado físico. handler recibe 'a'..'z', '-', 'enter' o 'back'.
   * Se ignoran las combinaciones con Ctrl/Alt/Meta y los eventos que ocurren dentro de campos de texto.
   * Devuelve una función para desvincular.
   */
  function bindPhysicalKeyboard(handler) {
    function onKeyDown(ev) {
      if (ev.ctrlKey || ev.altKey || ev.metaKey) return;
      const t = ev.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const k = ev.key;
      const onVirtualKey = t && t.classList && t.classList.contains('key');
      if (k === 'Enter') {
        // En otros botones, Enter conserva su función normal (activar el botón).
        if (t && t.tagName === 'BUTTON' && !onVirtualKey) return;
        ev.preventDefault();
        handler('enter');
      } else if (k === ' ' && onVirtualKey) {
        ev.preventDefault();
      } else if (k === 'Backspace') {
        ev.preventDefault();
        handler('back');
      } else if (/^[a-zA-Z]$/.test(k)) {
        handler(k.toLowerCase());
      } else if (k === '-') {
        handler('-');
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }

  const api = {
    RANK, SYMBOL, LABEL, ROWS, bestState, mergeKeyStates, buildKeyStates,
    renderKeyboard, updateKeyboard, bindPhysicalKeyboard
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else { g.LW = g.LW || {}; g.LW.keyboard = api; }
})(typeof window !== 'undefined' ? window : globalThis);
