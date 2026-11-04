/*
 * app.js
 * Interfaz y flujo del juego: pantallas, tablero, teclado, ayudas, resultados,
 * niveles, glosario y preferencias. Las reglas viven en los demás módulos.
 */
(function () {
  'use strict';

  const LW = window.LW;
  const { levels, engine, hints, scoring, storage, keyboard, glossary } = LW;

  const $ = (id) => document.getElementById(id);
  const store = storage.createStore();
  let state = store.load();

  let screen = 'home';
  let session = null;       // sesión del motor (desafío en curso)
  let challenge = null;     // desafío actual
  let typed = '';           // texto de la fila en edición
  let keyStates = {};       // mejor estado por tecla
  let busy = false;         // true mientras se anima el revelado de una fila
  let rows = [];            // [{ el, tiles: [] }]
  let selectedLevel = null; // nivel abierto en la pantalla de niveles
  let pendingLevel = null;  // nivel al que ir desde el aviso de desbloqueo
  let helpFrom = 'home';

  const WIN_WORDS = ['¡Genial!', '¡Impresionante!', '¡Excelente!', '¡Muy bien!', '¡Bien!', '¡Justo a tiempo!'];
  const BASE_TAGLINE = 'Lee la pista, razona qué herramienta de Linux Debian resuelve el problema y escribe su nombre en seis intentos.';

  const reducedMotion = () => !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- utilidades ---------- */
  function persist() { store.save(state); }

  function toast(text, ms) {
    const region = $('toast-region');
    const t = document.createElement('div');
    t.className = 'toast';
    t.setAttribute('aria-hidden', 'true');
    t.textContent = text;
    region.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, ms || 1800);
  }

  function announce(text) {
    const el = $('sr-status');
    el.textContent = '';
    setTimeout(() => { el.textContent = text; }, 30);
  }

  function setMessage(text, kind) {
    const m = $('message');
    m.textContent = text || '';
    m.className = 'message' + (kind ? ' ' + kind : '');
  }

  function modalOpen() { return !!document.querySelector('.modal:not([hidden])'); }

  function totalWon() { return Object.keys(state.won).length; }

  /* ---------- modales ---------- */
  let lastFocus = null;
  function openModal(id, focusId) {
    lastFocus = document.activeElement;
    $(id).hidden = false;
    const target = $(focusId);
    if (target) target.focus();
  }
  function closeModal(id) {
    $(id).hidden = true;
    if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
  }

  function confirmDialog(title, text, okLabel) {
    return new Promise((resolve) => {
      $('confirm-title').textContent = title;
      $('confirm-text').textContent = text;
      $('confirm-ok').textContent = okLabel || 'Confirmar';
      openModal('confirm-modal', 'confirm-cancel');
      const done = (value) => {
        $('confirm-ok').onclick = null;
        $('confirm-cancel').onclick = null;
        document.removeEventListener('keydown', onEsc, true);
        closeModal('confirm-modal');
        resolve(value);
      };
      const onEsc = (e) => { if (e.key === 'Escape') { e.preventDefault(); done(false); } };
      document.addEventListener('keydown', onEsc, true);
      $('confirm-ok').onclick = () => done(true);
      $('confirm-cancel').onclick = () => done(false);
    });
  }

  /* ---------- navegación ---------- */
  const SCREENS = ['home', 'help', 'levels', 'game', 'glossary'];
  function showScreen(name) {
    screen = name;
    SCREENS.forEach((s) => { $('screen-' + s).hidden = s !== name; });
    $('nav-levels').removeAttribute('aria-current');
    $('nav-glossary').removeAttribute('aria-current');
    $('nav-help').removeAttribute('aria-current');
    if (name === 'levels') $('nav-levels').setAttribute('aria-current', 'page');
    if (name === 'glossary') $('nav-glossary').setAttribute('aria-current', 'page');
    if (name === 'help') $('nav-help').setAttribute('aria-current', 'page');
    if (name === 'home') refreshHome();
    if (name === 'levels') renderLevels();
    if (name === 'glossary') renderGlossary();
    window.scrollTo(0, 0);
    $('main').focus({ preventScroll: true });
  }

  /* ---------- inicio ---------- */
  function refreshTopbar() {
    $('top-score').textContent = scoring.totalScore(state);
    $('top-streak').textContent = state.streak;
  }

  function refreshHome() {
    const won = totalWon();
    const pct = Math.round((won / levels.CHALLENGES.length) * 100);
    $('stat-won').textContent = won;
    $('stat-score').textContent = scoring.totalScore(state);
    $('stat-streak').textContent = state.streak;
    $('stat-best-streak').textContent = state.bestStreak;
    $('total-pct').textContent = pct + ' %';
    $('total-fill').style.width = pct + '%';
    $('total-bar').setAttribute('aria-valuenow', String(pct));
    $('alias').value = state.alias;
    $('pref-colorblind').checked = !!state.prefs.colorblind;
    $('pref-study').checked = !!state.prefs.studyMode;
    $('btn-continue').disabled = !(state.session || Object.keys(state.attempted).length > 0);
    $('screen-home').querySelector('.tagline').textContent = (state.alias ? 'Hola, ' + state.alias + '. ' : '') + BASE_TAGLINE;
    if (!store.isPersistent()) {
      $('storage-note').textContent = 'Aviso: este navegador no permite guardar datos locales; el progreso se perderá al cerrar la página.';
    }
    refreshTopbar();
  }

  function applyPrefs() {
    if (state.prefs.colorblind) document.documentElement.setAttribute('data-contrast', 'high');
    else document.documentElement.removeAttribute('data-contrast');
  }

  function nextPending() {
    const top = levels.unlockedLevel(state.won);
    return levels.CHALLENGES.find((c) => c.level <= top && !state.won[c.id]) || null;
  }

  function play() {
    if (!state.introSeen) { helpFrom = 'home'; showScreen('help'); return; }
    continueGame(true);
  }

  function continueGame(preferNext) {
    if (state.session && levels.canStartChallenge(state.session.id, state.won)) {
      startChallenge(state.session.id);
      return;
    }
    const next = nextPending();
    if (next) { startChallenge(next.id); return; }
    toast('¡Ganaste todos los desafíos! Repite cualquiera para mejorar tu puntuación.', 2600);
    showScreen('levels');
    void preferNext;
  }

  /* ---------- niveles ---------- */
  function renderLevels() {
    const grid = $('level-grid');
    grid.textContent = '';
    const top = levels.unlockedLevel(state.won);
    if (selectedLevel === null || !levels.isLevelUnlocked(selectedLevel, state.won)) selectedLevel = null;

    levels.LEVELS.forEach((level) => {
      const unlocked = levels.isLevelUnlocked(level.number, state.won);
      const wins = levels.levelWins(level.number, state.won);
      const pct = levels.levelProgress(level.number, state.won);
      const complete = wins === level.challenges.length;

      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'level-card' + (unlocked ? '' : ' locked') + (selectedLevel === level.number ? ' selected' : '');
      card.dataset.level = String(level.number);
      if (!unlocked) card.setAttribute('aria-disabled', 'true');

      const topRow = document.createElement('div');
      topRow.className = 'level-top';
      const num = document.createElement('span');
      num.className = 'level-num';
      num.textContent = 'NIVEL ' + level.number;
      const badge = document.createElement('span');
      badge.className = 'badge' + (complete ? ' done' : unlocked ? ' ok' : '');
      badge.textContent = complete ? '✓ Completado' : unlocked ? 'Disponible' : '🔒 Bloqueado';
      topRow.appendChild(num);
      topRow.appendChild(badge);

      const name = document.createElement('span');
      name.className = 'level-name';
      name.textContent = level.name;

      const bar = document.createElement('div');
      bar.className = 'progress';
      bar.setAttribute('role', 'progressbar');
      bar.setAttribute('aria-valuemin', '0');
      bar.setAttribute('aria-valuemax', '100');
      bar.setAttribute('aria-valuenow', String(pct));
      bar.setAttribute('aria-label', 'Progreso del nivel ' + level.number);
      const fill = document.createElement('div');
      fill.className = 'progress-fill';
      fill.style.width = pct + '%';
      bar.appendChild(fill);

      const meta = document.createElement('div');
      meta.className = 'level-meta';
      const w = document.createElement('span');
      w.textContent = wins + '/' + level.challenges.length + ' ganados · ' + pct + ' %';
      const best = document.createElement('span');
      best.textContent = 'Mejor: ' + levels.levelBestScore(level.number, state.best) + ' pts';
      meta.appendChild(w);
      meta.appendChild(best);

      card.append(topRow, name, bar, meta);
      card.addEventListener('click', () => openLevel(level.number));
      grid.appendChild(card);
    });

    if (selectedLevel !== null) renderLevelDetail(selectedLevel);
    else $('level-detail').hidden = true;
    void top;
  }

  function openLevel(number) {
    // La comprobación se hace aquí con la lógica, no con el estado del DOM.
    if (!levels.isLevelUnlocked(number, state.won)) {
      toast('Nivel bloqueado: gana los 5 desafíos del nivel anterior.', 2200);
      return;
    }
    selectedLevel = number;
    renderLevels();
    $('level-detail').scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
  }

  function renderLevelDetail(number) {
    const level = levels.getLevel(number);
    $('level-detail').hidden = false;
    $('detail-title').textContent = 'Nivel ' + number + ' · ' + level.name;
    $('detail-desc').textContent = level.description;
    const list = $('challenge-list');
    list.textContent = '';
    level.challenges.forEach((c) => {
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'challenge-item';
      const n = document.createElement('span');
      n.className = 'challenge-num';
      n.textContent = String(c.index);
      const label = document.createElement('span');
      label.textContent = 'Desafío ' + c.index + ' · ' + c.length + ' casillas';
      const st = document.createElement('span');
      st.className = 'challenge-state';
      if (state.won[c.id]) {
        st.classList.add('won');
        st.textContent = '✓ Ganado · mejor ' + (state.best[c.id] || 0) + ' pts';
      } else if (state.attempted[c.id]) {
        st.textContent = 'Intentado';
      } else {
        st.textContent = 'Pendiente';
      }
      btn.append(n, label, st);
      btn.addEventListener('click', () => startChallenge(c.id));
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  /* ---------- tablero ---------- */
  function buildBoard(n) {
    const board = $('board');
    board.textContent = '';
    board.style.setProperty('--n', String(n));
    board.classList.toggle('dense', n > 9);
    rows = [];
    for (let r = 0; r < scoring.MAX_ATTEMPTS; r++) {
      const row = document.createElement('div');
      row.className = 'row';
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', 'Intento ' + (r + 1));
      const tiles = [];
      for (let i = 0; i < n; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        const ch = document.createElement('span');
        ch.className = 'tile-char';
        const badge = document.createElement('span');
        badge.className = 'tile-badge';
        badge.setAttribute('aria-hidden', 'true');
        tile.append(ch, badge);
        tile.style.setProperty('--i', String(i));
        row.appendChild(tile);
        tiles.push(tile);
      }
      board.appendChild(row);
      rows.push({ el: row, tiles });
    }
  }

  function paintTile(tile, ch, result) {
    tile.querySelector('.tile-char').textContent = ch;
    tile.classList.remove('correct', 'present', 'absent', 'filled');
    const badge = tile.querySelector('.tile-badge');
    badge.textContent = '';
    if (result) {
      tile.classList.add(result);
      badge.textContent = keyboard.SYMBOL[result];
      tile.setAttribute('aria-label', 'Carácter ' + (ch === '-' ? 'guion' : ch) + ': ' + keyboard.LABEL[result]);
    } else {
      tile.removeAttribute('aria-label');
      if (ch) tile.classList.add('filled');
    }
  }

  function paintTyped() {
    if (!session || session.status !== 'playing') return;
    const r = rows[session.guesses.length];
    if (!r) return;
    const chars = Array.from(typed);
    r.tiles.forEach((tile, i) => paintTile(tile, chars[i] || '', null));
  }

  function rowSummary(guess, result, attemptNo) {
    const parts = Array.from(guess).map((ch, i) => (ch === '-' ? 'guion' : ch) + ' ' + keyboard.LABEL[result[i]]);
    return 'Intento ' + attemptNo + ': ' + parts.join(', ') + '.';
  }

  /* ---------- desafío ---------- */
  function startChallenge(id) {
    // Verificación de desbloqueo antes de iniciar cualquier desafío.
    if (!levels.canStartChallenge(id, state.won)) {
      toast('Este desafío está bloqueado: gana los 5 desafíos del nivel anterior.', 2400);
      showScreen('levels');
      return false;
    }
    challenge = levels.getChallenge(id);
    const saved = state.session && state.session.id === id ? state.session : null;
    session = engine.createSession(challenge, saved);
    typed = '';
    busy = false;
    keyStates = keyboard.buildKeyStates(session.guesses, session.results);

    state.session = { id, guesses: session.guesses.slice(), hints: Object.assign({}, session.hints) };
    state.last = id;
    persist();

    const level = levels.getLevel(challenge.level);
    $('game-title').textContent = 'Nivel ' + level.number + ' · ' + level.name;
    $('game-sub').textContent = 'Desafío ' + challenge.index + ' de ' + level.challenges.length + ' · ' + challenge.length + ' casillas';
    $('clue-text').textContent = challenge.clue;

    buildBoard(challenge.length);
    session.guesses.forEach((g, r) => {
      Array.from(g).forEach((ch, i) => paintTile(rows[r].tiles[i], ch, session.results[r][i]));
    });
    keyboard.renderKeyboard($('keyboard'), onKey);
    keyboard.updateKeyboard($('keyboard'), keyStates);

    $('hints').textContent = '';
    hints.HINT_TYPES.forEach((t) => { if (session.hints[t]) renderHintItem(t); });
    refreshHintButtons();
    refreshAttempts();
    setMessage('', '');
    $('result').hidden = true;
    $('keyboard').hidden = false;
    $('result').className = 'result';

    showScreen('game');
    return true;
  }

  function refreshAttempts() {
    const used = session.guesses.length;
    const left = engine.attemptsLeft(session);
    const dots = $('attempts-dots');
    dots.textContent = '';
    for (let i = 0; i < scoring.MAX_ATTEMPTS; i++) {
      const d = document.createElement('i');
      if (i < used) d.className = 'used';
      dots.appendChild(d);
    }
    $('attempts-num').textContent = String(left);
    $('attempts').setAttribute('aria-label', left + ' intentos restantes');
    const playing = session.status === 'playing';
    $('potential-num').textContent = playing ? String(scoring.computeScore(used + 1, session.hints)) : String(session.score);
  }

  function refreshHintButtons() {
    const playing = session && session.status === 'playing';
    hints.HINT_TYPES.forEach((t) => {
      const btn = $('btn-hint-' + t);
      const used = session.hints[t];
      btn.textContent = hints.HINT_LABELS[t] + (used ? ' ✓' : ' (−' + scoring.HINT_COST[t] + ' pts)');
      btn.classList.toggle('used', !!used);
      btn.disabled = !playing || !!used;
    });
  }

  function renderHintItem(type) {
    const item = document.createElement('div');
    item.className = 'hint-item';
    item.dataset.type = type;
    const title = document.createElement('strong');
    title.textContent = hints.HINT_LABELS[type];
    const text = document.createElement('span');
    text.textContent = hints.getHintText(session.id, type);
    item.append(title, text);
    $('hints').appendChild(item);
  }

  function useHint(type) {
    if (!session || session.status !== 'playing' || busy) return;
    const r = hints.revealHint(session, type);
    if (!r) return;
    if (r.firstUse) {
      renderHintItem(type);
      state.session = { id: session.id, guesses: session.guesses.slice(), hints: Object.assign({}, session.hints) };
      persist();
      toast('Pista usada: −' + r.cost + ' puntos', 1500);
      announce(hints.HINT_LABELS[type] + ': ' + r.text);
    }
    refreshHintButtons();
    refreshAttempts();
    $('btn-hint-' + type).blur();
  }

  /* ---------- entrada de teclado ---------- */
  function onKey(key) {
    if (screen !== 'game' || modalOpen() || !session) return;
    if (session.status !== 'playing') {
      if (key === 'enter' && !$('result').hidden) {
        const next = $('btn-next');
        (next.hidden ? $('btn-retry') : next).click();
      }
      return;
    }
    if (busy) return;
    if (key === 'enter') { submit(); return; }
    if (key === 'back') { typed = Array.from(typed).slice(0, -1).join(''); paintTyped(); return; }
    if (Array.from(typed).length < session.length) {
      typed += key;
      paintTyped();
    }
  }

  function invalidFeedback(message) {
    setMessage(message, 'error');
    toast(message, 2000);
    announce(message);
    const r = rows[session.guesses.length];
    if (r) {
      r.el.classList.remove('shake');
      void r.el.offsetWidth;
      r.el.classList.add('shake');
      setTimeout(() => r.el.classList.remove('shake'), 500);
    }
  }

  function submit() {
    const res = engine.submitGuess(session, typed);
    if (!res.ok) {
      // Longitud o vocabulario inválidos (o repetido): no se consume ningún intento.
      invalidFeedback(res.message);
      return;
    }

    busy = true;
    setMessage('', '');
    const r = rows[res.row];
    const n = session.length;
    const guess = res.guess;
    Array.from(guess).forEach((ch, i) => {
      const tile = r.tiles[i];
      paintTile(tile, ch, res.result[i]);
      if (!reducedMotion()) tile.classList.add('reveal');
    });
    announce(rowSummary(guess, res.result, res.row + 1));

    // La partida se guarda de inmediato (antes de la animación) para que recargar no devuelva el intento.
    let outcome = null;
    if (res.won || res.lost) outcome = finalizeGame(res.won);
    else {
      state.session = { id: session.id, guesses: session.guesses.slice(), hints: Object.assign({}, session.hints) };
      persist();
    }

    const wait = reducedMotion() ? 0 : (n - 1) * 120 + 560;
    setTimeout(() => {
      keyStates = keyboard.mergeKeyStates(keyStates, guess, res.result);
      keyboard.updateKeyboard($('keyboard'), keyStates);
      Array.from(r.tiles).forEach((t) => t.classList.remove('reveal'));
      typed = '';
      busy = false;
      refreshAttempts();
      if (outcome) showResult(res, outcome, r);
      else if (res.notice) setMessage(res.notice, 'info');
    }, wait);
  }

  /* ---------- fin de partida ---------- */
  function finalizeGame(won) {
    const result = scoring.recordOutcome(state, session.id, {
      won, attempts: session.attemptsUsed, hints: session.hints
    });
    const completedLevel = won && result.firstWin && levels.levelWins(challenge.level, result.state.won) === levels.getLevel(challenge.level).challenges.length
      ? challenge.level : null;
    state = result.state;
    state.session = null;
    persist();
    refreshTopbar();
    return { won, score: result.score, firstWin: result.firstWin, improved: result.improved, completedLevel };
  }

  function showResult(res, outcome, rowObj) {
    const panel = $('result');
    panel.hidden = false;
    panel.className = 'result ' + (outcome.won ? 'win' : 'lose');
    $('keyboard').hidden = true;
    refreshHintButtons();

    const banner = $('result-banner');
    const scoreLine = $('result-score');
    if (outcome.won) {
      banner.textContent = WIN_WORDS[Math.min(session.attemptsUsed, 6) - 1] + ' Lo descubriste en ' + session.attemptsUsed + (session.attemptsUsed === 1 ? ' intento.' : ' intentos.');
      const hintsUsed = (session.hints.concept ? 1 : 0) + (session.hints.advanced ? 1 : 0);
      let text = '+' + outcome.score + ' puntos' + (hintsUsed ? ' (con ' + hintsUsed + (hintsUsed === 1 ? ' pista' : ' pistas') + ')' : ' (sin pistas)') + '.';
      if (!outcome.firstWin) {
        const best = state.best[session.id];
        text += outcome.improved ? ' ¡Nueva mejor puntuación!' : ' Tu mejor puntuación en este desafío sigue siendo ' + best + '; repetirlo no suma puntos de nuevo.';
      }
      scoreLine.textContent = text;
      if (rowObj && !reducedMotion()) {
        rowObj.el.classList.add('win');
        setTimeout(() => rowObj.el.classList.remove('win'), 1200);
      }
    } else {
      banner.textContent = 'Te quedaste sin intentos.';
      scoreLine.textContent = '0 puntos. Ver la respuesta no cuenta como victoria: puedes repetir el desafío.';
    }
    $('result-answer').textContent = challenge.answer;
    $('result-explain').textContent = challenge.explanation;

    const next = levels.nextChallenge(challenge.id);
    const canNext = !!next && levels.canStartChallenge(next.id, state.won);
    $('btn-next').hidden = !canNext;
    $('btn-next').textContent = next && next.level !== challenge.level ? 'Primer desafío del nivel ' + next.level : 'Siguiente desafío';
    announce(banner.textContent + ' ' + scoreLine.textContent + ' El comando era ' + challenge.answer + '.');
    panel.scrollIntoView({ behavior: reducedMotion() ? 'auto' : 'smooth', block: 'nearest' });
    panel.focus({ preventScroll: true });

    if (outcome.completedLevel) {
      setTimeout(() => showUnlock(outcome.completedLevel), reducedMotion() ? 0 : 900);
    }
  }

  function showUnlock(completed) {
    const done = levels.getLevel(completed);
    const next = levels.getLevel(completed + 1);
    if (next) {
      pendingLevel = next.number;
      $('unlock-title').textContent = '¡Nivel ' + completed + ' completado!';
      $('unlock-text').textContent = 'Ganaste los 5 desafíos de «' + done.name + '». Se desbloquea el nivel ' + next.number + ' — «' + next.name + '»: ' + next.description;
      $('unlock-go').textContent = 'Ir al nivel ' + next.number;
      $('unlock-go').hidden = false;
    } else {
      pendingLevel = null;
      $('unlock-title').textContent = '¡Completaste los diez niveles!';
      $('unlock-text').textContent = 'Resolviste todos los desafíos de «' + done.name + '» y de los niveles anteriores. Puedes repetir cualquier desafío para mejorar tu puntuación o repasar el glosario.';
      $('unlock-go').hidden = true;
    }
    // Reinicia la animación del candado
    const anim = document.querySelector('.unlock-anim');
    anim.textContent = '';
    const a = document.createElement('span'); a.className = 'unlock-lock'; a.textContent = '🔒';
    const b = document.createElement('span'); b.className = 'unlock-open'; b.textContent = '🔓';
    anim.append(a, b);
    openModal('unlock-modal', next ? 'unlock-go' : 'unlock-later');
  }

  /* ---------- glosario ---------- */
  function renderGlossary() {
    $('glossary-note').textContent = state.prefs.studyMode
      ? 'Modo de consulta educativa activado: se muestran todas las fichas, incluidas las de desafíos sin completar.'
      : 'Aquí aparecen los comandos de los desafíos que ya ganaste. Las demás fichas están bloqueadas para no revelar respuestas; puedes activar el modo de consulta educativa en «Preferencias y datos» del inicio.';
    const count = glossary.render($('glossary-list'), $('glossary-search').value, state.won, state.prefs.studyMode);
    $('glossary-count').textContent = count + (count === 1 ? ' ficha' : ' fichas');
  }

  /* ---------- eventos ---------- */
  function bind() {
    $('btn-brand').addEventListener('click', () => showScreen('home'));
    $('nav-levels').addEventListener('click', () => showScreen('levels'));
    $('nav-glossary').addEventListener('click', () => showScreen('glossary'));
    $('nav-help').addEventListener('click', () => { helpFrom = screen === 'game' ? 'game' : 'home'; showScreen('help'); });

    $('btn-play').addEventListener('click', play);
    $('btn-continue').addEventListener('click', () => continueGame(false));
    $('btn-levels').addEventListener('click', () => showScreen('levels'));
    $('btn-how').addEventListener('click', () => { helpFrom = 'home'; showScreen('help'); });
    $('btn-glossary').addEventListener('click', () => showScreen('glossary'));

    $('btn-help-start').addEventListener('click', () => {
      state.introSeen = true;
      persist();
      continueGame(true);
    });
    $('btn-help-back').addEventListener('click', () => {
      if (helpFrom === 'game' && session && challenge) showScreen('game');
      else showScreen('home');
    });

    $('btn-levels-home').addEventListener('click', () => showScreen('home'));
    $('btn-detail-close').addEventListener('click', () => { selectedLevel = null; renderLevels(); });
    $('btn-glossary-home').addEventListener('click', () => showScreen('home'));
    $('glossary-search').addEventListener('input', renderGlossary);

    $('btn-game-back').addEventListener('click', () => {
      selectedLevel = challenge ? challenge.level : null;
      showScreen('levels');
    });
    $('btn-hint-concept').addEventListener('click', () => useHint('concept'));
    $('btn-hint-advanced').addEventListener('click', () => useHint('advanced'));

    $('btn-next').addEventListener('click', () => {
      const next = levels.nextChallenge(challenge.id);
      if (next) startChallenge(next.id);
    });
    $('btn-retry').addEventListener('click', () => {
      state.session = null;
      startChallenge(challenge.id);
    });
    $('btn-result-levels').addEventListener('click', () => {
      selectedLevel = challenge.level;
      showScreen('levels');
    });

    $('alias').addEventListener('input', (e) => {
      state.alias = storage.sanitizeAlias(e.target.value);
      persist();
      $('screen-home').querySelector('.tagline').textContent = (state.alias ? 'Hola, ' + state.alias + '. ' : '') + BASE_TAGLINE;
    });
    $('pref-colorblind').addEventListener('change', (e) => { state.prefs.colorblind = e.target.checked; applyPrefs(); persist(); });
    $('pref-study').addEventListener('change', (e) => { state.prefs.studyMode = e.target.checked; persist(); });

    $('btn-reset').addEventListener('click', async () => {
      const ok = await confirmDialog(
        '¿Reiniciar la partida?',
        'Se borrarán el alias, las victorias, las puntuaciones, la racha y el progreso de este navegador. Esta acción no se puede deshacer.',
        'Sí, reiniciar'
      );
      if (!ok) return;
      state = store.reset(true);
      session = null;
      challenge = null;
      selectedLevel = null;
      applyPrefs();
      showScreen('home');
      toast('Partida reiniciada.', 2000);
    });

    $('unlock-later').addEventListener('click', () => closeModal('unlock-modal'));
    $('unlock-go').addEventListener('click', () => {
      closeModal('unlock-modal');
      if (pendingLevel) { selectedLevel = pendingLevel; showScreen('levels'); }
    });
    $('unlock-modal').addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal('unlock-modal'); });

    keyboard.bindPhysicalKeyboard(onKey);
  }

  function init() {
    applyPrefs();
    bind();
    // Si la partida guardada ya no es válida o ya no es accesible, el almacenamiento la descartó al cargar.
    showScreen('home');
    window.LW.app = {
      getState: () => state,
      getSession: () => session,
      startChallenge,
      onKey
    };
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
