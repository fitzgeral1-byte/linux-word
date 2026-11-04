/*
 * tests/run-tests.js — pruebas automatizadas de la lógica (sin dependencias).
 * Uso:  node tests/run-tests.js
 */
'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const levels = require(path.join(root, 'js/levels.js'));
const validator = require(path.join(root, 'js/word-validator.js'));
const scoring = require(path.join(root, 'js/scoring.js'));
const engine = require(path.join(root, 'js/game-engine.js'));
const hints = require(path.join(root, 'js/hints.js'));
const storage = require(path.join(root, 'js/storage.js'));
const keyboard = require(path.join(root, 'js/keyboard.js'));
const glossary = require(path.join(root, 'js/glossary.js'));

let passed = 0;
let failed = 0;
const failures = [];
let currentGroup = '';

function group(name) { currentGroup = name; console.log('\n' + name); }
function test(name, fn) {
  try {
    fn();
    passed++;
    console.log('  ✓ ' + name);
  } catch (e) {
    failed++;
    failures.push(currentGroup + ' › ' + name + ': ' + e.message);
    console.log('  ✗ ' + name + '\n      ' + e.message.split('\n')[0]);
  }
}

// Lista oficial de la especificación (nivel → comandos, en orden).
const SPEC = [
  ['pwd', 'ls', 'cd', 'mkdir', 'touch'],
  ['cp', 'mv', 'rm', 'rmdir', 'find'],
  ['cat', 'less', 'head', 'tail', 'wc'],
  ['grep', 'sort', 'uniq', 'cut', 'tr'],
  ['tee', 'xargs', 'sed', 'awk', 'diff'],
  ['ps', 'top', 'pgrep', 'kill', 'nice'],
  ['uname', 'uptime', 'free', 'df', 'du'],
  ['whoami', 'id', 'chmod', 'chown', 'usermod'],
  ['systemctl', 'journalctl', 'systemd-analyze', 'hostnamectl', 'loginctl'],
  ['ssh', 'scp', 'sftp', 'rsync', 'tar']
];
const SPEC_NAMES = [
  'Explorador de archivos', 'Gestor de archivos', 'Lectura de información', 'Procesamiento de texto',
  'Procesamiento avanzado', 'Procesos', 'Diagnóstico del sistema', 'Usuarios y permisos',
  'Servicios y systemd', 'Administración remota'
];

function allWon(upToLevel) {
  const won = {};
  levels.CHALLENGES.forEach((c) => { if (c.level <= upToLevel) won[c.id] = true; });
  return won;
}
function memBackend() { return storage.createMemoryBackend(); }

/* ================================================================ */
group('1-3. Estructura: 10 niveles, 5 desafíos por nivel, 50 respuestas únicas');
test('existen exactamente diez niveles numerados del 1 al 10', () => {
  assert.strictEqual(levels.LEVELS.length, 10);
  levels.LEVELS.forEach((l, i) => assert.strictEqual(l.number, i + 1));
});
test('los nombres de nivel coinciden con la especificación', () => {
  levels.LEVELS.forEach((l, i) => assert.strictEqual(l.name, SPEC_NAMES[i]));
});
test('cada nivel contiene exactamente cinco desafíos', () => {
  levels.LEVELS.forEach((l) => assert.strictEqual(l.challenges.length, 5, 'nivel ' + l.number));
});
test('las respuestas coinciden exactamente (y en orden) con la lista de la especificación', () => {
  levels.LEVELS.forEach((l, i) => assert.deepStrictEqual(l.challenges.map((c) => c.answer), SPEC[i], 'nivel ' + l.number));
});
test('hay 50 respuestas únicas', () => {
  assert.strictEqual(levels.CHALLENGES.length, 50);
  assert.strictEqual(new Set(levels.CHALLENGES.map((c) => c.answer)).size, 50);
});
test('todas las respuestas son letras minúsculas con guiones internos (sin espacios ni argumentos)', () => {
  levels.CHALLENGES.forEach((c) => assert.ok(/^[a-z]+(-[a-z]+)*$/.test(c.answer), c.answer));
});

group('4. Longitud de cada respuesta = casillas del tablero');
test('challenge.length es igual a la longitud real de la respuesta', () => {
  levels.CHALLENGES.forEach((c) => assert.strictEqual(c.length, c.answer.length, c.answer));
});
test('ejemplos de la especificación: ls=2, grep=4, mkdir=5, systemctl=9, systemd-analyze=15', () => {
  const len = (id) => levels.getChallenge(id).length;
  assert.strictEqual(len('ls'), 2);
  assert.strictEqual(len('grep'), 4);
  assert.strictEqual(len('mkdir'), 5);
  assert.strictEqual(len('systemctl'), 9);
  assert.strictEqual(len('systemd-analyze'), 15);
});
test('el guion de systemd-analyze ocupa su propia casilla (posición 8)', () => {
  assert.strictEqual(Array.from('systemd-analyze')[7], '-');
});

group('5. Pistas: completas, distintas y sin revelar la respuesta');
const FORBIDDEN_FRAGMENTS = {
  'systemd-analyze': ['systemd', 'analyze', 'analyse'],
  systemctl: ['systemd', 'systemctl'],
  journalctl: ['journal'],
  hostnamectl: ['hostname', 'hostnamectl'],
  loginctl: ['login'],
  usermod: ['usermod', 'usermod'],
  uptime: ['uptime'],
  rsync: ['rsync'],
  pgrep: ['pgrep', 'grep'],
  nice: ['nice'],
  kill: ['kill'],
  touch: ['touch'],
  whoami: ['whoami']
};
test('los 50 desafíos tienen pista principal, conceptual, avanzada y explicación no vacías', () => {
  levels.CHALLENGES.forEach((c) => {
    assert.ok(c.clue && c.clue.length > 40, 'clue ' + c.id);
    assert.ok(c.explanation && c.explanation.length > 60, 'explicación ' + c.id);
    assert.ok(hints.getHintText(c.id, 'concept'), 'concept ' + c.id);
    assert.ok(hints.getHintText(c.id, 'advanced'), 'advanced ' + c.id);
  });
  assert.strictEqual(Object.keys(hints.HINTS).length, 50);
});
test('las pistas son distintas entre sí (50 principales, 50 conceptuales y 50 avanzadas únicas)', () => {
  assert.strictEqual(new Set(levels.CHALLENGES.map((c) => c.clue)).size, 50);
  assert.strictEqual(new Set(levels.CHALLENGES.map((c) => hints.getHintText(c.id, 'concept'))).size, 50);
  assert.strictEqual(new Set(levels.CHALLENGES.map((c) => hints.getHintText(c.id, 'advanced'))).size, 50);
});
test('ninguna pista (principal, conceptual, avanzada) contiene el nombre del comando', () => {
  levels.CHALLENGES.forEach((c) => {
    const texts = [c.clue, hints.getHintText(c.id, 'concept'), hints.getHintText(c.id, 'advanced')];
    texts.forEach((t) => {
      const tokens = t.toLowerCase().split(/[^a-z0-9ñáéíóúü]+/).filter(Boolean);
      // La respuesta completa (y sus partes separadas por guion) no puede aparecer como palabra.
      assert.ok(!tokens.includes(c.answer), c.id + ' aparece como palabra en: ' + t);
      c.answer.split('-').forEach((part) => {
        if (part.length >= 3) assert.ok(!tokens.includes(part), c.id + ': parte «' + part + '» en: ' + t);
      });
      // Para nombres de 4+ letras tampoco puede aparecer como subcadena.
      if (c.answer.length >= 4) assert.ok(!t.toLowerCase().includes(c.answer), c.id + ' (subcadena) en: ' + t);
    });
  });
});
test('las pistas no contienen fragmentos literales delicados del nombre (lista revisada)', () => {
  Object.keys(FORBIDDEN_FRAGMENTS).forEach((id) => {
    const c = levels.getChallenge(id);
    const all = [c.clue, hints.getHintText(id, 'concept'), hints.getHintText(id, 'advanced')].join(' ').toLowerCase();
    FORBIDDEN_FRAGMENTS[id].forEach((frag) => assert.ok(!all.includes(frag), id + ' contiene «' + frag + '»'));
  });
});
test('las pistas no anuncian la inicial ni la primera letra', () => {
  const re = /(inicial|primera letra|empieza con|comienza con|empieza por|comienza por)/i;
  levels.CHALLENGES.forEach((c) => {
    [c.clue, hints.getHintText(c.id, 'concept'), hints.getHintText(c.id, 'advanced')].forEach((t) => {
      // «iniciales de sus tres autores» (awk) describe el origen del nombre, no la inicial de la respuesta.
      if (c.id === 'awk') return;
      assert.ok(!re.test(t), c.id + ': ' + t);
    });
  });
});
test('las pistas no empiezan con las fórmulas vetadas tipo «Sirve para…»', () => {
  levels.CHALLENGES.forEach((c) => {
    [c.clue, hints.getHintText(c.id, 'concept')].forEach((t) => assert.ok(!/^sirve para/i.test(t), c.id));
  });
});
test('la explicación final menciona la solución', () => {
  levels.CHALLENGES.forEach((c) => assert.ok(c.explanation.toLowerCase().includes(c.answer), c.id));
});

group('6-7. Algoritmo de colores (letras repetidas y guiones)');
const C = 'correct', P = 'present', A = 'absent';
test('acierto total: todo verde', () => assert.deepStrictEqual(engine.evaluateGuess('pwd', 'pwd'), [C, C, C]));
test('todo ausente: todo gris', () => assert.deepStrictEqual(engine.evaluateGuess('cat', 'pwd'), [A, A, A]));
test('intento con más apariciones que la respuesta: «sss» frente a «ssh» → V V G', () => {
  assert.deepStrictEqual(engine.evaluateGuess('sss', 'ssh'), [C, C, A]);
});
test('una sola aparición en la respuesta, tres en el intento: solo una se marca', () => {
  // respuesta «sed» (una «e»), intento «eee»: solo la «e» de la posición 2 es correcta.
  assert.deepStrictEqual(engine.evaluateGuess('eee', 'sed'), [A, C, A]);
  // respuesta «cut» (una «c»), intento «ccc»: solo la primera.
  assert.deepStrictEqual(engine.evaluateGuess('ccc', 'cut'), [C, A, A]);
});
test('una letra en posición incorrecta pero disponible → amarillo, y la repetida sobrante → gris', () => {
  // respuesta «cut» (una «c»), intento «tcc»: la primera «c» (pos 1) es amarilla; la de pos 2, gris.
  assert.deepStrictEqual(engine.evaluateGuess('tcc', 'cut'), [P, P, A]);
});
test('el verde tiene prioridad sobre el amarillo aunque aparezca antes la letra mal colocada', () => {
  // respuesta «free», intento «eeee»: dos «e» en la respuesta, en pos 2 y 3 → V V; el resto gris.
  assert.deepStrictEqual(engine.evaluateGuess('eeee', 'free'), [A, A, C, C]);
  // respuesta «free», intento «feer»: f=V, e(1)=A?  Respuesta f r e e: e en pos 2 y 3.
  assert.deepStrictEqual(engine.evaluateGuess('feer', 'free'), [C, P, C, P]);
});
test('letras repetidas con amarillos limitados por las apariciones disponibles', () => {
  // «ssls» vs «less»: solo la última «s» es verde; la primera «s» toma la aparición restante (amarilla), la segunda queda gris; «l» es amarilla.
  assert.deepStrictEqual(engine.evaluateGuess('ssls', 'less'), [P, A, P, C]);
  assert.deepStrictEqual(engine.evaluateGuess('sssl', 'less'), [P, A, C, P]);
});
test('guiones: se evalúan como cualquier otro carácter (posición exacta)', () => {
  const guess = 'systemd-analyze';
  assert.deepStrictEqual(engine.evaluateGuess(guess, 'systemd-analyze'), new Array(15).fill(C));
});
test('guiones: con dos guiones en el intento y uno en la respuesta, solo uno cuenta', () => {
  const res = engine.evaluateGuess('-systemd-analyz', 'systemd-analyze');
  const hyphenIdx = [0, 8];
  const marked = hyphenIdx.filter((i) => res[i] !== A).length;
  assert.strictEqual(marked, 1, JSON.stringify(res));
  assert.strictEqual(res[0], P);
  assert.strictEqual(res[8], A);
});
test('guion en la posición exacta es verde; guion fuera de lugar es amarillo', () => {
  assert.strictEqual(engine.evaluateGuess('aaaaaaa-aaaaaaa', 'systemd-analyze')[7], C);
  assert.strictEqual(engine.evaluateGuess('-aaaaaaaaaaaaaa', 'systemd-analyze')[0], P);
});
test('propiedad: nunca hay más verdes+amarillos de un carácter que apariciones en la respuesta (aleatorio)', () => {
  let seed = 12345;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  const alphabet = 'abcst-e';
  for (let k = 0; k < 3000; k++) {
    const c = levels.CHALLENGES[Math.floor(rnd() * levels.CHALLENGES.length)];
    let guess = '';
    for (let i = 0; i < c.length; i++) guess += alphabet[Math.floor(rnd() * alphabet.length)];
    const res = engine.evaluateGuess(guess, c.answer);
    const counts = {};
    Array.from(guess).forEach((ch, i) => { if (res[i] !== A) counts[ch] = (counts[ch] || 0) + 1; });
    Object.keys(counts).forEach((ch) => {
      const inAnswer = c.answer.split(ch).length - 1;
      assert.ok(counts[ch] <= inAnswer, guess + ' vs ' + c.answer + ' carácter ' + ch);
    });
    Array.from(guess).forEach((ch, i) => { if (ch === c.answer[i]) assert.strictEqual(res[i], C); });
  }
});
test('longitudes distintas lanzan error (no se puede evaluar)', () => {
  assert.throws(() => engine.evaluateGuess('ls', 'pwd'));
});

group('9. Normalización y validación');
test('recorta espacios y pasa a minúsculas', () => {
  assert.strictEqual(validator.normalize('  LS \n'), 'ls');
  assert.strictEqual(validator.normalize('  SystemD-Analyze'), 'systemd-analyze');
});
test('conserva los guiones y los caracteres internos', () => {
  assert.strictEqual(validator.normalize('systemd-analyze'), 'systemd-analyze');
  assert.strictEqual(validator.normalize('a b'), 'a b');
  assert.strictEqual(validator.normalize('x_y'), 'x_y');
});
test('entradas nulas o indefinidas devuelven cadena vacía', () => {
  assert.strictEqual(validator.normalize(null), '');
  assert.strictEqual(validator.normalize(undefined), '');
});
test('valida la longitud exacta', () => {
  assert.strictEqual(validator.hasValidLength('ls', 2), true);
  assert.strictEqual(validator.hasValidLength('ls', 3), false);
  assert.strictEqual(validator.hasValidLength('systemd-analyze', 15), true);
});
test('validateGuess: códigos y mensajes exigidos', () => {
  assert.strictEqual(validator.validateGuess('', 3).code, 'empty');
  assert.strictEqual(validator.validateGuess('ls', 3).code, 'length');
  const nd = validator.validateGuess('zzz', 3);
  assert.strictEqual(nd.code, 'not-in-dictionary');
  assert.strictEqual(nd.message, 'Esta palabra no está incluida en el diccionario del juego. Prueba con otro comando.');
  assert.strictEqual(validator.validateGuess(' CAT ', 3).code, 'ok');
  assert.strictEqual(validator.MESSAGES.validButWrong, 'El comando es válido, pero no corresponde a la solución de este desafío.');
});
test('el diccionario contiene los 50 objetivos y es bastante más amplio', () => {
  levels.CHALLENGES.forEach((c) => assert.ok(validator.isInDictionary(c.answer), c.answer));
  assert.ok(validator.dictionarySize() >= 300, 'tamaño ' + validator.dictionarySize());
});
test('todas las palabras del diccionario usan solo a-z y guiones internos', () => {
  validator.DICTIONARY.forEach((w) => assert.ok(/^[a-z]+(-[a-z]+)*$/.test(w), w));
});
test('para cada longitud objetivo hay alternativas válidas (hipótesis razonables)', () => {
  const lens = new Set(levels.CHALLENGES.map((c) => c.length));
  lens.forEach((len) => {
    const same = Array.from(validator.DICTIONARY).filter((w) => w.length === len);
    const targets = levels.CHALLENGES.filter((c) => c.length === len).length;
    assert.ok(same.length > targets, 'longitud ' + len + ': ' + same.length + ' palabras');
  });
});

group('8, 10-11. Intentos: qué consume y cuáles no, máximo seis');
function newSession(id) { return engine.createSession(levels.getChallenge(id)); }
test('longitud incorrecta NO consume intento', () => {
  const s = newSession('pwd');
  const r = engine.submitGuess(s, 'ls');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.code, 'length');
  assert.strictEqual(s.guesses.length, 0);
  assert.strictEqual(engine.attemptsLeft(s), 6);
});
test('entrada vacía NO consume intento ni registra filas vacías', () => {
  const s = newSession('pwd');
  const r = engine.submitGuess(s, '   ');
  assert.strictEqual(r.code, 'empty');
  assert.strictEqual(s.guesses.length, 0);
});
test('palabra fuera del diccionario NO consume intento', () => {
  const s = newSession('pwd');
  const r = engine.submitGuess(s, 'zzz');
  assert.strictEqual(r.code, 'not-in-dictionary');
  assert.strictEqual(s.guesses.length, 0);
});
test('comando válido pero incorrecto SÍ consume un intento y muestra el aviso neutral', () => {
  const s = newSession('pwd');
  const r = engine.submitGuess(s, 'cat');
  assert.strictEqual(r.ok, true);
  assert.strictEqual(s.guesses.length, 1);
  assert.strictEqual(engine.attemptsLeft(s), 5);
  assert.strictEqual(r.notice, 'El comando es válido, pero no corresponde a la solución de este desafío.');
  assert.strictEqual(r.won, false);
});
test('no registra dos veces la misma fila', () => {
  const s = newSession('pwd');
  engine.submitGuess(s, 'cat');
  const r = engine.submitGuess(s, 'CAT');
  assert.strictEqual(r.ok, false);
  assert.strictEqual(r.code, 'repeated');
  assert.strictEqual(s.guesses.length, 1);
});
test('seis intentos como máximo: el séptimo se rechaza y la partida está perdida', () => {
  const s = newSession('pwd');
  ['cat', 'cut', 'tee', 'sed', 'awk', 'ssh'].forEach((g, i) => {
    const r = engine.submitGuess(s, g);
    assert.strictEqual(r.ok, true, g);
    assert.strictEqual(s.guesses.length, i + 1);
  });
  assert.strictEqual(s.status, 'lost');
  const r7 = engine.submitGuess(s, 'scp');
  assert.strictEqual(r7.ok, false);
  assert.strictEqual(r7.code, 'finished');
  assert.strictEqual(s.guesses.length, 6);
});
test('acertar termina la partida con victoria en el intento correspondiente', () => {
  const s = newSession('pwd');
  engine.submitGuess(s, 'cat');
  const r = engine.submitGuess(s, ' PWD ');
  assert.strictEqual(r.won, true);
  assert.strictEqual(s.status, 'won');
  assert.strictEqual(s.attemptsUsed, 2);
  assert.strictEqual(s.score, 80);
});
test('se puede acertar en el sexto intento', () => {
  const s = newSession('pwd');
  ['cat', 'cut', 'tee', 'sed', 'awk'].forEach((g) => engine.submitGuess(s, g));
  const r = engine.submitGuess(s, 'pwd');
  assert.strictEqual(r.won, true);
  assert.strictEqual(s.score, 10);
});
test('un desafío ganado no admite más intentos', () => {
  const s = newSession('ls');
  engine.submitGuess(s, 'ls');
  assert.strictEqual(engine.submitGuess(s, 'cd').code, 'finished');
});
test('restaurar una sesión guardada reproduce intentos, colores y ayudas', () => {
  const ch = levels.getChallenge('pwd');
  const s = engine.createSession(ch, { guesses: ['cat', 'cut'], hints: { concept: true } });
  assert.strictEqual(s.guesses.length, 2);
  assert.strictEqual(s.results.length, 2);
  assert.strictEqual(s.hints.concept, true);
  assert.strictEqual(s.status, 'playing');
});

group('13. Teclado: conserva el mejor estado de color');
test('verde > amarillo > gris', () => {
  assert.strictEqual(keyboard.bestState('absent', 'present'), 'present');
  assert.strictEqual(keyboard.bestState('present', 'correct'), 'correct');
  assert.strictEqual(keyboard.bestState('correct', 'absent'), 'correct');
  assert.strictEqual(keyboard.bestState('present', 'absent'), 'present');
});
test('gris nunca reemplaza a una letra ya confirmada como amarilla o verde', () => {
  let st = keyboard.mergeKeyStates({}, 'sss', engine.evaluateGuess('sss', 'ssh')); // s: verde
  assert.strictEqual(st.s, 'correct');
  st = keyboard.mergeKeyStates(st, 'cat', engine.evaluateGuess('cat', 'pwd')); // c,a,t grises
  assert.strictEqual(st.c, 'absent');
  st = keyboard.mergeKeyStates(st, 'xss', engine.evaluateGuess('xss', 'ssh')); // más «s»
  assert.strictEqual(st.s, 'correct');
  // Un intento con la letra repetida en gris tras haber sido amarilla:
  let st2 = keyboard.mergeKeyStates({}, 'tcc', engine.evaluateGuess('tcc', 'cut')); // c: amarilla (y una gris)
  assert.strictEqual(st2.c, 'present');
});
test('el estado de la tecla dentro de un mismo intento usa el mejor de sus apariciones', () => {
  const st = keyboard.mergeKeyStates({}, 'sss', engine.evaluateGuess('sss', 'ssh'));
  assert.strictEqual(st.s, 'correct'); // dos verdes y una gris → verde
  assert.strictEqual(st.s === 'absent', false);
});
test('buildKeyStates reproduce el estado a partir de intentos guardados', () => {
  const s = engine.createSession(levels.getChallenge('pwd'), { guesses: ['pwd'] });
  const st = keyboard.buildKeyStates(s.guesses, s.results);
  assert.deepStrictEqual(st, { p: 'correct', w: 'correct', d: 'correct' });
});
test('el teclado virtual incluye A-Z, guion, retroceso y Enter', () => {
  const keys = [].concat.apply([], keyboard.ROWS);
  'abcdefghijklmnopqrstuvwxyz'.split('').forEach((ch) => assert.ok(keys.includes(ch), ch));
  ['-', 'back', 'enter'].forEach((k) => assert.ok(keys.includes(k), k));
  assert.strictEqual(keys.length, 29);
});

group('14-16. Puntuación y victorias');
test('tabla de puntos: 100, 80, 60, 40, 20, 10 y 0 si se pierde', () => {
  [100, 80, 60, 40, 20, 10].forEach((p, i) => assert.strictEqual(scoring.computeScore(i + 1, {}), p));
  assert.strictEqual(scoring.computeScore(null, {}), 0);
});
test('cada ayuda resta una cantidad moderada y nunca se baja de cero', () => {
  assert.strictEqual(scoring.computeScore(1, { concept: true }), 90);
  assert.strictEqual(scoring.computeScore(1, { advanced: true }), 85);
  assert.strictEqual(scoring.computeScore(1, { concept: true, advanced: true }), 75);
  assert.strictEqual(scoring.computeScore(6, { concept: true, advanced: true }), 0);
  assert.ok(scoring.computeScore(6, { concept: true, advanced: true }) >= 0);
});
test('una victoria con ayudas sigue contando como victoria', () => {
  const st = storage.defaultState();
  const out = scoring.recordOutcome(st, 'pwd', { won: true, attempts: 6, hints: { concept: true, advanced: true } });
  assert.strictEqual(out.state.won.pwd, true);
  assert.strictEqual(out.score, 0);
});
test('perder no cuenta como victoria, reinicia la racha y no suma puntos', () => {
  let st = storage.defaultState();
  st = scoring.recordOutcome(st, 'pwd', { won: true, attempts: 1, hints: {} }).state;
  assert.strictEqual(st.streak, 1);
  const lost = scoring.recordOutcome(st, 'ls', { won: false, attempts: 6, hints: {} });
  assert.strictEqual(lost.state.won.ls, undefined);
  assert.strictEqual(lost.state.streak, 0);
  assert.strictEqual(lost.state.bestStreak, 1);
  assert.strictEqual(scoring.totalScore(lost.state), 100);
  assert.strictEqual(lost.state.attempted.ls, 1);
});
test('repetir un desafío ganado NO duplica la puntuación ni genera victorias nuevas', () => {
  let st = storage.defaultState();
  let o = scoring.recordOutcome(st, 'pwd', { won: true, attempts: 3, hints: {} }); // 60
  st = o.state;
  assert.strictEqual(o.firstWin, true);
  assert.strictEqual(scoring.totalScore(st), 60);
  o = scoring.recordOutcome(st, 'pwd', { won: true, attempts: 3, hints: {} });
  st = o.state;
  assert.strictEqual(o.firstWin, false);
  assert.strictEqual(scoring.totalScore(st), 60);
  assert.strictEqual(Object.keys(st.won).length, 1);
});
test('repetir mejora la mejor puntuación solo si es mayor; si es menor no la baja', () => {
  let st = storage.defaultState();
  st = scoring.recordOutcome(st, 'pwd', { won: true, attempts: 3, hints: {} }).state; // 60
  let o = scoring.recordOutcome(st, 'pwd', { won: true, attempts: 1, hints: {} }); // 100
  assert.strictEqual(o.improved, true);
  assert.strictEqual(o.state.best.pwd, 100);
  o = scoring.recordOutcome(o.state, 'pwd', { won: true, attempts: 5, hints: {} }); // 20
  assert.strictEqual(o.improved, false);
  assert.strictEqual(o.state.best.pwd, 100);
  assert.strictEqual(scoring.totalScore(o.state), 100);
});
test('perder al repetir un desafío ya ganado no quita la victoria ni la puntuación', () => {
  let st = scoring.recordOutcome(storage.defaultState(), 'pwd', { won: true, attempts: 2, hints: {} }).state;
  st = scoring.recordOutcome(st, 'pwd', { won: false, attempts: 6, hints: {} }).state;
  assert.strictEqual(st.won.pwd, true);
  assert.strictEqual(st.best.pwd, 80);
});
test('recordOutcome no muta el estado recibido', () => {
  const st = storage.defaultState();
  const copy = JSON.stringify(st);
  scoring.recordOutcome(st, 'pwd', { won: true, attempts: 1, hints: {} });
  assert.strictEqual(JSON.stringify(st), copy);
});
test('las pistas usadas reducen los puntos en una partida real', () => {
  const s = newSession('pwd');
  assert.ok(hints.revealHint(s, 'concept'));
  engine.submitGuess(s, 'pwd');
  assert.strictEqual(s.score, 90);
});
test('revelar una pista dos veces solo se penaliza una vez; en partida terminada no hace nada', () => {
  const s = newSession('pwd');
  assert.strictEqual(hints.revealHint(s, 'advanced').firstUse, true);
  assert.strictEqual(hints.revealHint(s, 'advanced').firstUse, false);
  engine.submitGuess(s, 'pwd');
  assert.strictEqual(hints.revealHint(s, 'concept'), null);
  assert.strictEqual(s.score, 85);
});

group('12. Niveles y desbloqueo');
test('el nivel 1 está desbloqueado desde el inicio y los demás no', () => {
  assert.strictEqual(levels.isLevelUnlocked(1, {}), true);
  for (let n = 2; n <= 10; n++) assert.strictEqual(levels.isLevelUnlocked(n, {}), false, 'nivel ' + n);
  assert.strictEqual(levels.unlockedLevel({}), 1);
});
test('el nivel siguiente solo se desbloquea al ganar los cinco desafíos del anterior', () => {
  const won = {};
  ['pwd', 'ls', 'cd', 'mkdir'].forEach((id) => { won[id] = true; });
  assert.strictEqual(levels.isLevelUnlocked(2, won), false);
  won.touch = true;
  assert.strictEqual(levels.isLevelUnlocked(2, won), true);
  assert.strictEqual(levels.unlockedLevel(won), 2);
});
test('avance completo: ganar niveles 1..k desbloquea hasta k+1', () => {
  for (let k = 0; k < 10; k++) assert.strictEqual(levels.unlockedLevel(allWon(k)), Math.min(10, k + 1));
});
test('no se salta niveles: ganar solo el nivel 2 no desbloquea el 3', () => {
  const won = {};
  levels.getLevel(2).challenges.forEach((c) => { won[c.id] = true; });
  assert.strictEqual(levels.isLevelUnlocked(3, won), false);
  assert.strictEqual(levels.unlockedLevel(won), 1);
});
test('canStartChallenge rechaza desafíos de niveles bloqueados y acepta los disponibles', () => {
  assert.strictEqual(levels.canStartChallenge('pwd', {}), true);
  assert.strictEqual(levels.canStartChallenge('cp', {}), false);
  assert.strictEqual(levels.canStartChallenge('tar', allWon(9)), true);
  assert.strictEqual(levels.canStartChallenge('tar', allWon(8)), false);
  assert.strictEqual(levels.canStartChallenge('inexistente', allWon(10)), false);
});
test('revelar la respuesta tras perder no cuenta: los niveles no avanzan', () => {
  let st = storage.defaultState();
  levels.getLevel(1).challenges.forEach((c) => {
    st = scoring.recordOutcome(st, c.id, { won: false, attempts: 6, hints: {} }).state;
  });
  assert.strictEqual(levels.unlockedLevel(st.won), 1);
});
test('progreso por nivel y mejor puntuación', () => {
  const won = { pwd: true, ls: true };
  assert.strictEqual(levels.levelWins(1, won), 2);
  assert.strictEqual(levels.levelProgress(1, won), 40);
  assert.strictEqual(levels.levelBestScore(1, { pwd: 100, ls: 60 }), 160);
});

group('17. Almacenamiento y validación de datos guardados');
test('guarda y recupera el progreso (ida y vuelta)', () => {
  const be = memBackend();
  const store = storage.createStore(be);
  let st = store.load();
  st.alias = 'Ana';
  st = scoring.recordOutcome(st, 'pwd', { won: true, attempts: 2, hints: { concept: true } }).state;
  st.prefs.colorblind = true;
  assert.ok(store.save(st));
  const again = storage.createStore(be).load();
  assert.strictEqual(again.alias, 'Ana');
  assert.strictEqual(again.won.pwd, true);
  assert.strictEqual(again.best.pwd, 70);
  assert.strictEqual(again.streak, 1);
  assert.strictEqual(again.last, 'pwd');
  assert.strictEqual(again.prefs.colorblind, true);
  assert.deepStrictEqual(again.hintsUsed.pwd, { concept: true, advanced: false });
  assert.strictEqual(again.attemptsUsed.pwd, 2);
  assert.strictEqual(again.unlockedLevel, 1);
});
test('JSON corrupto o ausente devuelve un estado inicial limpio', () => {
  const be = memBackend();
  be.setItem(storage.STORAGE_KEY, '{no es json');
  assert.deepStrictEqual(storage.createStore(be).load(), storage.defaultState());
  assert.deepStrictEqual(storage.createStore(memBackend()).load(), storage.defaultState());
  [null, 5, 'x', [], true].forEach((v) => assert.deepStrictEqual(storage.sanitizeState(v), storage.defaultState()));
});
test('ignora identificadores inventados y valores de tipos incorrectos', () => {
  const st = storage.sanitizeState({
    won: { pwd: true, hackeado: true, ls: 'sí' }, best: { pwd: 'mucho', hackeado: 500 },
    attempted: { pwd: -4, nada: 1 }, streak: 'x', bestStreak: -2
  });
  assert.deepStrictEqual(Object.keys(st.won), ['pwd']);
  assert.strictEqual(st.best.pwd, 0);
  assert.strictEqual(st.best.hackeado, undefined);
  assert.strictEqual(st.attempted.pwd, 1);
  assert.strictEqual(st.streak, 0);
  assert.strictEqual(st.bestStreak, 0);
});
test('las puntuaciones manipuladas se acotan a 0-100', () => {
  const st = storage.sanitizeState({ won: { pwd: true, ls: true }, best: { pwd: 99999, ls: -50 } });
  assert.strictEqual(st.best.pwd, 100);
  assert.strictEqual(st.best.ls, 0);
});
test('no se aceptan victorias de niveles inaccesibles (estado inconsistente)', () => {
  const st = storage.sanitizeState({ won: { cp: true, tar: true, pwd: true } });
  assert.deepStrictEqual(Object.keys(st.won), ['pwd']);
  assert.strictEqual(st.unlockedLevel, 1);
});
test('el nivel desbloqueado se recalcula a partir de las victorias (no se confía en el valor guardado)', () => {
  const st = storage.sanitizeState({ unlockedLevel: 10, won: { pwd: true } });
  assert.strictEqual(st.unlockedLevel, 1);
  const st2 = storage.sanitizeState({ won: allWon(3) });
  assert.strictEqual(st2.unlockedLevel, 4);
});
test('el último desafío visitado debe existir y estar accesible', () => {
  assert.strictEqual(storage.sanitizeState({ last: 'tar' }).last, null);
  assert.strictEqual(storage.sanitizeState({ last: 'zzz' }).last, null);
  assert.strictEqual(storage.sanitizeState({ last: 'ls' }).last, 'ls');
});
test('alias: se recorta, se limpian caracteres de control y símbolos < >', () => {
  assert.strictEqual(storage.sanitizeAlias('  <b>Ana</b>\u0000 '), 'bAna/b');
  assert.strictEqual(storage.sanitizeAlias('x'.repeat(50)).length, 20);
  assert.strictEqual(storage.sanitizeAlias(42), '');
});
test('partida en curso: se restaura si es válida', () => {
  const st = storage.sanitizeState({ session: { id: 'pwd', guesses: ['cat', 'cut'], hints: { concept: true } } });
  assert.deepStrictEqual(st.session, { id: 'pwd', guesses: ['cat', 'cut'], hints: { concept: true, advanced: false } });
});
test('partida en curso: se descarta si es inválida (longitud, diccionario, repetidos, ya ganada, bloqueada, 6 intentos)', () => {
  const bad = [
    { id: 'pwd', guesses: ['ls'] },
    { id: 'pwd', guesses: ['zzz'] },
    { id: 'pwd', guesses: ['cat', 'cat'] },
    { id: 'pwd', guesses: ['pwd'] },
    { id: 'cp', guesses: [] },
    { id: 'pwd', guesses: ['cat', 'cut', 'tee', 'sed', 'awk', 'ssh'] },
    { id: 'pwd', guesses: [5] },
    { id: 'nada', guesses: [] },
    { id: 'pwd', guesses: 'cat' },
    { id: 'pwd', guesses: ['CAT'] }
  ];
  bad.forEach((s, i) => assert.strictEqual(storage.sanitizeState({ session: s }).session, null, 'caso ' + i));
});
test('reset borra el progreso y puede conservar las preferencias', () => {
  const be = memBackend();
  const store = storage.createStore(be);
  let st = store.load();
  st.alias = 'Ana';
  st.prefs.studyMode = true;
  st = scoring.recordOutcome(st, 'pwd', { won: true, attempts: 1, hints: {} }).state;
  store.save(st);
  const fresh = store.reset(true);
  assert.strictEqual(fresh.alias, '');
  assert.deepStrictEqual(fresh.won, {});
  assert.strictEqual(fresh.prefs.studyMode, true);
  assert.deepStrictEqual(store.load().won, {});
});
test('si el almacenamiento falla al guardar, no lanza excepciones', () => {
  const broken = { getItem: () => null, setItem: () => { throw new Error('cuota'); }, removeItem: () => {} };
  const store = storage.createStore(broken);
  assert.strictEqual(store.save(storage.defaultState()), false);
});

group('Glosario');
test('contiene las 50 fichas con todos los campos', () => {
  assert.strictEqual(glossary.ENTRIES.length, 50);
  glossary.ENTRIES.forEach((e) => {
    ['name', 'category', 'func', 'syntax', 'example', 'similar', 'caution'].forEach((f) => assert.ok(e[f] && e[f].length >= 2, e.name + '.' + f));
  });
});
test('sin victorias, las fichas no se pueden encontrar por nombre ni exponen contenido', () => {
  const r = glossary.search('pwd', {}, false);
  assert.strictEqual(r.length, 0);
  const all = glossary.search('', {}, false);
  assert.strictEqual(all.length, 50);
  all.forEach((x) => assert.strictEqual(x.locked, true));
});
test('solo se desbloquean las fichas de desafíos ganados', () => {
  const r = glossary.search('', { pwd: true }, false).filter((x) => !x.locked);
  assert.deepStrictEqual(r.map((x) => x.entry.name), ['pwd']);
});
test('el buscador funciona por nombre, categoría y palabra clave (fichas desbloqueadas)', () => {
  const won = allWon(10);
  assert.ok(glossary.search('grep', won, false).some((x) => x.entry.name === 'grep'));
  assert.ok(glossary.search('Procesos', won, false).length >= 5);
  assert.ok(glossary.search('systemd', won, false).some((x) => x.entry.name === 'systemctl'));
  assert.ok(glossary.search('PERMISOS', won, false).some((x) => x.entry.name === 'chmod'));
});
test('el modo de consulta educativa muestra todas las fichas', () => {
  const r = glossary.search('', {}, true);
  assert.strictEqual(r.length, 50);
  r.forEach((x) => assert.strictEqual(x.locked, false));
});

group('3, 19-20. Seguridad y compatibilidad con GitHub Pages (revisión estática)');
function read(p) { return fs.readFileSync(path.join(root, p), 'utf8'); }
const jsFiles = fs.readdirSync(path.join(root, 'js')).filter((f) => f.endsWith('.js'));
test('ningún script usa eval(), new Function ni innerHTML/document.write', () => {
  jsFiles.forEach((f) => {
    const src = read('js/' + f);
    assert.ok(!/\beval\s*\(/.test(src), f + ' usa eval');
    assert.ok(!/new\s+Function\s*\(/.test(src), f + ' usa new Function');
    assert.ok(!/innerHTML|outerHTML|document\.write|insertAdjacentHTML/.test(src), f + ' inserta HTML dinámico');
  });
});
test('los scripts no hacen peticiones de red ni usan servicios externos', () => {
  jsFiles.forEach((f) => {
    const src = read('js/' + f);
    assert.ok(!/\bfetch\s*\(|XMLHttpRequest|WebSocket|sendBeacon|https?:\/\//.test(src), f);
  });
});
test('index.html usa solo rutas relativas y carga todos los módulos existentes', () => {
  const html = read('index.html');
  const refs = [];
  html.replace(/(?:src|href)="([^"]+)"/g, (m, u) => { refs.push(u); return m; });
  refs.forEach((u) => {
    if (u.startsWith('#') || u.startsWith('data:')) return;
    assert.ok(!/^(\/|[a-z]+:)/i.test(u), 'ruta no relativa: ' + u);
    assert.ok(fs.existsSync(path.join(root, u)), 'no existe: ' + u);
  });
  ['levels', 'word-validator', 'scoring', 'game-engine', 'hints', 'storage', 'keyboard', 'glossary', 'app'].forEach((m) => {
    assert.ok(html.includes('js/' + m + '.js'), m);
  });
});
test('el HTML no contiene scripts ni estilos en línea con datos', () => {
  const html = read('index.html');
  assert.ok(!/<script(?![^>]*\bsrc=)/.test(html), 'script en línea');
  assert.ok(!/\son[a-z]+="/i.test(html), 'manejadores en línea');
});
test('las hojas de estilo no importan recursos externos ni usan rutas absolutas', () => {
  ['css/styles.css', 'css/board.css', 'css/responsive.css'].forEach((f) => {
    const css = read(f);
    assert.ok(!/@import|url\(\s*['"]?(https?:|\/)/i.test(css), f);
  });
});
test('existen los archivos exigidos por la estructura del proyecto', () => {
  ['index.html', 'README.md', 'LICENSE', 'css/styles.css', 'css/board.css', 'css/responsive.css',
    'js/app.js', 'js/game-engine.js', 'js/word-validator.js', 'js/keyboard.js', 'js/levels.js',
    'js/hints.js', 'js/scoring.js', 'js/storage.js', 'js/glossary.js',
    'docs/teacher-guide.md', 'docs/testing.md'].forEach((f) => {
    assert.ok(fs.existsSync(path.join(root, f)), 'falta ' + f);
  });
});

/* ================================================================ */
console.log('\n────────────────────────────────────────');
console.log('Pruebas superadas: ' + passed + '   Fallidas: ' + failed + '   Total: ' + (passed + failed));
if (failed) {
  console.log('\nFallos:');
  failures.forEach((f) => console.log(' - ' + f));
  process.exit(1);
}
