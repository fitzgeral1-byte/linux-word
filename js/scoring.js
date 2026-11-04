/*
 * scoring.js
 * Puntuación por intento, penalización por pistas y registro de resultados.
 */
(function (g) {
  'use strict';

  const MAX_ATTEMPTS = 6;
  // Índice 0 = primer intento.
  const ATTEMPT_POINTS = [100, 80, 60, 40, 20, 10];
  const HINT_COST = { concept: 10, advanced: 15 };

  /**
   * Puntos de un desafío terminado.
   * @param {number|null} attempt  Intento (1-6) en el que se acertó; null si se perdió.
   * @param {{concept?:boolean, advanced?:boolean}} hints
   */
  function computeScore(attempt, hints) {
    if (!Number.isInteger(attempt) || attempt < 1 || attempt > MAX_ATTEMPTS) return 0;
    const h = hints || {};
    let score = ATTEMPT_POINTS[attempt - 1];
    if (h.concept) score -= HINT_COST.concept;
    if (h.advanced) score -= HINT_COST.advanced;
    return Math.max(0, score);
  }

  /** Suma de las mejores puntuaciones por desafío (no se duplica al repetir). */
  function totalScore(state) {
    let total = 0;
    const best = (state && state.best) || {};
    Object.keys(best).forEach((id) => {
      if (Number.isFinite(best[id]) && best[id] > 0) total += best[id];
    });
    return total;
  }

  /**
   * Registra el resultado de una partida terminada. No muta el estado original.
   * Devuelve { state, firstWin, improved, score }.
   *  - La mejor puntuación solo sube; repetir no suma de nuevo.
   *  - "won" es un conjunto: ganar de nuevo no genera una victoria adicional.
   *  - Perder no cuenta como victoria y reinicia la racha.
   */
  function recordOutcome(state, challengeId, outcome) {
    const s = JSON.parse(JSON.stringify(state));
    const won = !!outcome.won;
    const score = won ? computeScore(outcome.attempts, outcome.hints) : 0;

    s.attempted[challengeId] = (s.attempted[challengeId] || 0) + 1;
    s.attemptsUsed[challengeId] = Math.min(MAX_ATTEMPTS, Math.max(1, outcome.attempts || MAX_ATTEMPTS));
    s.hintsUsed[challengeId] = {
      concept: !!(outcome.hints && outcome.hints.concept),
      advanced: !!(outcome.hints && outcome.hints.advanced)
    };
    s.last = challengeId;

    let firstWin = false;
    let improved = false;
    if (won) {
      firstWin = !s.won[challengeId];
      s.won[challengeId] = true;
      if (s.best[challengeId] === undefined || score > s.best[challengeId]) {
        improved = s.best[challengeId] !== undefined;
        s.best[challengeId] = score;
      }
      s.streak += 1;
      if (s.streak > s.bestStreak) s.bestStreak = s.streak;
    } else {
      s.streak = 0;
    }
    return { state: s, firstWin, improved, score };
  }

  const api = { MAX_ATTEMPTS, ATTEMPT_POINTS, HINT_COST, computeScore, totalScore, recordOutcome };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else { g.LW = g.LW || {}; g.LW.scoring = api; }
})(typeof window !== 'undefined' ? window : globalThis);
