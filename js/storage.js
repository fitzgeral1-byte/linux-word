/*
 * storage.js
 * Persistencia del progreso en localStorage, con validación estricta al cargar
 * para evitar estados inconsistentes (datos manipulados, versiones antiguas, etc.).
 * Los datos viven solo en este navegador: no se sincronizan ni se envían a ningún sitio.
 */
(function (g) {
  'use strict';

  const isNode = typeof module === 'object' && module.exports;
  const levels = isNode ? require('./levels.js') : g.LW.levels;
  const validator = isNode ? require('./word-validator.js') : g.LW.validator;
  const scoring = isNode ? require('./scoring.js') : g.LW.scoring;

  const STORAGE_KEY = 'linux-word:progress:v1';
  const VERSION = 1;
  const MAX_ALIAS = 20;
  const MAX_COUNTER = 100000;

  function defaultState() {
    return {
      version: VERSION,
      alias: '',
      unlockedLevel: 1,
      won: {},          // { id: true }
      attempted: {},    // { id: partidas jugadas }
      best: {},         // { id: mejor puntuación }
      attemptsUsed: {}, // { id: intentos de la última partida }
      hintsUsed: {},    // { id: { concept, advanced } } de la última partida
      streak: 0,
      bestStreak: 0,
      last: null,       // último desafío visitado
      prefs: { colorblind: false, studyMode: false },
      introSeen: false,
      session: null     // partida en curso: { id, guesses, hints }
    };
  }

  const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
  function toCounter(v, min) {
    const n = Number(v);
    if (!Number.isFinite(n)) return min;
    return Math.min(MAX_COUNTER, Math.max(min, Math.floor(n)));
  }

  function sanitizeAlias(v) {
    if (typeof v !== 'string') return '';
    // Elimina caracteres de control y recorta; el alias se muestra siempre con textContent.
    return v.replace(/[\u0000-\u001F\u007F<>]/g, '').trim().slice(0, MAX_ALIAS);
  }

  /** Valida una partida en curso guardada. Devuelve la sesión limpia o null. */
  function sanitizeSession(raw, unlocked) {
    if (!isObj(raw) || !levels.isValidId(raw.id)) return null;
    const challenge = levels.getChallenge(raw.id);
    if (challenge.level > unlocked) return null;
    if (!Array.isArray(raw.guesses) || raw.guesses.length >= scoring.MAX_ATTEMPTS) return null;
    const seen = new Set();
    const guesses = [];
    for (const item of raw.guesses) {
      if (typeof item !== 'string') return null;
      const v = validator.validateGuess(item, challenge.length);
      if (!v.valid || v.guess !== item) return null;
      if (v.guess === challenge.answer) return null; // una partida ganada no está "en curso"
      if (seen.has(v.guess)) return null;
      seen.add(v.guess);
      guesses.push(v.guess);
    }
    const h = isObj(raw.hints) ? raw.hints : {};
    return { id: raw.id, guesses, hints: { concept: h.concept === true, advanced: h.advanced === true } };
  }

  /** Valida y normaliza un estado recuperado del almacenamiento. Nunca lanza. */
  function sanitizeState(raw) {
    const s = defaultState();
    if (!isObj(raw)) return s;

    s.alias = sanitizeAlias(raw.alias);

    if (isObj(raw.won)) {
      Object.keys(raw.won).forEach((id) => {
        if (levels.isValidId(id) && raw.won[id] === true) s.won[id] = true;
      });
    }
    // Coherencia: no se puede haber ganado un desafío de un nivel que no estaba desbloqueado.
    // Se conservan solo las victorias de niveles alcanzables, avanzando nivel a nivel.
    const consistent = {};
    for (let n = 1; n <= levels.LEVELS.length; n++) {
      if (!levels.isLevelUnlocked(n, consistent)) break;
      levels.getLevel(n).challenges.forEach((c) => { if (s.won[c.id]) consistent[c.id] = true; });
    }
    s.won = consistent;
    s.unlockedLevel = levels.unlockedLevel(s.won);

    // Mejor puntuación: solo para desafíos ganados, entero entre 0 y 100.
    Object.keys(s.won).forEach((id) => {
      const v = isObj(raw.best) ? Number(raw.best[id]) : NaN;
      s.best[id] = Number.isFinite(v) ? Math.min(100, Math.max(0, Math.floor(v))) : 0;
    });

    if (isObj(raw.attempted)) {
      Object.keys(raw.attempted).forEach((id) => {
        if (!levels.isValidId(id)) return;
        s.attempted[id] = toCounter(raw.attempted[id], s.won[id] ? 1 : 0);
      });
    }
    Object.keys(s.won).forEach((id) => { if (!s.attempted[id]) s.attempted[id] = 1; });

    if (isObj(raw.attemptsUsed)) {
      Object.keys(raw.attemptsUsed).forEach((id) => {
        if (!levels.isValidId(id)) return;
        const n = Math.floor(Number(raw.attemptsUsed[id]));
        if (Number.isFinite(n) && n >= 1 && n <= scoring.MAX_ATTEMPTS) s.attemptsUsed[id] = n;
      });
    }
    if (isObj(raw.hintsUsed)) {
      Object.keys(raw.hintsUsed).forEach((id) => {
        if (!levels.isValidId(id) || !isObj(raw.hintsUsed[id])) return;
        s.hintsUsed[id] = {
          concept: raw.hintsUsed[id].concept === true,
          advanced: raw.hintsUsed[id].advanced === true
        };
      });
    }

    s.streak = toCounter(raw.streak, 0);
    s.bestStreak = Math.max(s.streak, toCounter(raw.bestStreak, 0));

    s.last = levels.isValidId(raw.last) && levels.canStartChallenge(raw.last, s.won) ? raw.last : null;

    if (isObj(raw.prefs)) {
      s.prefs.colorblind = raw.prefs.colorblind === true;
      s.prefs.studyMode = raw.prefs.studyMode === true;
    }
    s.introSeen = raw.introSeen === true;
    s.session = sanitizeSession(raw.session, s.unlockedLevel);
    return s;
  }

  /** Almacenamiento en memoria usado como respaldo si localStorage no está disponible. */
  function createMemoryBackend() {
    const data = {};
    return {
      getItem: (k) => (Object.prototype.hasOwnProperty.call(data, k) ? data[k] : null),
      setItem: (k, v) => { data[k] = String(v); },
      removeItem: (k) => { delete data[k]; }
    };
  }

  /**
   * Crea un almacén. `backend` debe exponer getItem/setItem/removeItem
   * (por defecto, localStorage; si no está disponible, memoria).
   */
  function createStore(backend) {
    let persistent = true;
    let be = backend;
    if (!be) {
      try {
        be = g.localStorage;
        const probe = STORAGE_KEY + ':probe';
        be.setItem(probe, '1');
        be.removeItem(probe);
      } catch (e) {
        be = createMemoryBackend();
        persistent = false;
      }
    }

    function load() {
      try {
        const text = be.getItem(STORAGE_KEY);
        if (!text) return defaultState();
        return sanitizeState(JSON.parse(text));
      } catch (e) {
        return defaultState();
      }
    }
    function save(state) {
      try {
        be.setItem(STORAGE_KEY, JSON.stringify(sanitizeState(state)));
        return true;
      } catch (e) {
        return false;
      }
    }
    function reset(keepPrefs) {
      const fresh = defaultState();
      if (keepPrefs) {
        const old = load();
        fresh.prefs = old.prefs;
      }
      try { be.removeItem(STORAGE_KEY); } catch (e) { /* sin acción */ }
      save(fresh);
      return fresh;
    }
    return { load, save, reset, isPersistent: () => persistent };
  }

  const api = { STORAGE_KEY, VERSION, defaultState, sanitizeState, sanitizeAlias, createStore, createMemoryBackend };

  if (isNode) module.exports = api;
  else { g.LW = g.LW || {}; g.LW.storage = api; }
})(typeof window !== 'undefined' ? window : globalThis);
