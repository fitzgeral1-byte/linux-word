/*
 * game-engine.js
 * Reglas de adivinanza: evaluación de colores (dos pasadas, letras repetidas)
 * y sesión de juego con control de intentos. No toca el DOM.
 */
(function (g) {
  'use strict';

  const isNode = typeof module === 'object' && module.exports;
  const validator = isNode ? require('./word-validator.js') : g.LW.validator;
  const scoring = isNode ? require('./scoring.js') : g.LW.scoring;

  const MAX_ATTEMPTS = scoring.MAX_ATTEMPTS;

  /**
   * Evaluación equivalente a Wordle, en dos pasadas.
   * 1) Marca las posiciones exactas (correct) y cuenta, de la respuesta,
   *    las apariciones de cada carácter que NO fueron acertadas.
   * 2) Recorre el resto de posiciones: marca present solo si todavía queda una
   *    aparición disponible de ese carácter; si no, absent.
   * @returns {Array<'correct'|'present'|'absent'>}
   */
  function evaluateGuess(guess, answer) {
    const gs = Array.from(guess);
    const as = Array.from(answer);
    if (gs.length !== as.length) throw new Error('La hipótesis y la respuesta deben tener la misma longitud');
    const result = new Array(gs.length).fill('absent');
    const remaining = Object.create(null);

    for (let i = 0; i < gs.length; i++) {
      if (gs[i] === as[i]) result[i] = 'correct';
      else remaining[as[i]] = (remaining[as[i]] || 0) + 1;
    }
    for (let i = 0; i < gs.length; i++) {
      if (result[i] === 'correct') continue;
      if (remaining[gs[i]] > 0) {
        result[i] = 'present';
        remaining[gs[i]] -= 1;
      }
    }
    return result;
  }

  /**
   * Crea una sesión para un desafío. `saved` permite restaurar una partida
   * en curso: { guesses: string[], hints: {concept, advanced} }.
   */
  function createSession(challenge, saved) {
    const session = {
      id: challenge.id,
      answer: challenge.answer,
      length: Array.from(challenge.answer).length,
      guesses: [],
      results: [],
      hints: { concept: false, advanced: false },
      status: 'playing', // 'playing' | 'won' | 'lost'
      attemptsUsed: 0,
      score: 0
    };
    if (saved && Array.isArray(saved.guesses)) {
      saved.guesses.forEach((guess) => {
        if (session.status === 'playing') applyGuess(session, guess);
      });
    }
    if (saved && saved.hints) {
      session.hints.concept = !!saved.hints.concept;
      session.hints.advanced = !!saved.hints.advanced;
    }
    return session;
  }

  // Aplica una hipótesis ya validada (sin comprobaciones de vocabulario).
  function applyGuess(session, guess) {
    const result = evaluateGuess(guess, session.answer);
    session.guesses.push(guess);
    session.results.push(result);
    session.attemptsUsed = session.guesses.length;
    if (guess === session.answer) {
      session.status = 'won';
      session.score = scoring.computeScore(session.attemptsUsed, session.hints);
    } else if (session.attemptsUsed >= MAX_ATTEMPTS) {
      session.status = 'lost';
      session.score = 0;
    }
    return result;
  }

  /**
   * Envía una hipótesis. Solo se consume un intento si la entrada es válida
   * (longitud correcta y presente en el diccionario) y no repetida.
   * Devuelve { ok, code, message, result?, row?, won?, lost?, notice? }.
   * Códigos: 'finished' | 'empty' | 'length' | 'not-in-dictionary' | 'repeated' | 'accepted'
   */
  function submitGuess(session, raw) {
    if (session.status !== 'playing') {
      return { ok: false, code: 'finished', message: 'Este desafío ya terminó.' };
    }
    const v = validator.validateGuess(raw, session.length);
    if (!v.valid) return { ok: false, code: v.code, message: v.message };
    if (session.guesses.includes(v.guess)) {
      return { ok: false, code: 'repeated', message: validator.MESSAGES.repeated };
    }
    const result = applyGuess(session, v.guess);
    const won = session.status === 'won';
    const lost = session.status === 'lost';
    return {
      ok: true,
      code: 'accepted',
      message: '',
      guess: v.guess,
      result,
      row: session.guesses.length - 1,
      won,
      lost,
      notice: won ? '' : validator.MESSAGES.validButWrong
    };
  }

  /** Intentos que quedan. */
  function attemptsLeft(session) {
    return MAX_ATTEMPTS - session.guesses.length;
  }

  /** Marca una ayuda como usada. Devuelve true si se aplicó ahora (primera vez, partida en curso). */
  function markHint(session, type) {
    if (session.status !== 'playing') return false;
    if (type !== 'concept' && type !== 'advanced') return false;
    if (session.hints[type]) return false;
    session.hints[type] = true;
    return true;
  }

  const api = { MAX_ATTEMPTS, evaluateGuess, createSession, submitGuess, attemptsLeft, markHint };

  if (isNode) module.exports = api;
  else { g.LW = g.LW || {}; g.LW.engine = api; }
})(typeof window !== 'undefined' ? window : globalThis);
