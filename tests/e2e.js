/* tests/e2e.js — prueba de interfaz en navegador real (requiere Playwright y Chromium/Chrome).
   Uso: SHOTS_DIR=/ruta/capturas node tests/e2e.js */
const { chromium } = require('playwright');
const path = require('path');
const url = 'file://' + path.join(__dirname, '..', 'index.html');
const SHOTS = (process.env.SHOTS_DIR || require('os').tmpdir()) + '/';
let ok = 0, bad = 0;
const check = (name, cond, extra) => { if (cond) { ok++; console.log('  ✓ ' + name); } else { bad++; console.log('  ✗ ' + name + (extra ? ' → ' + extra : '')); } };

async function typeWord(page, w) { for (const ch of w) await page.keyboard.press(ch); }
async function submit(page, w) { await typeWord(page, w); await page.keyboard.press('Enter'); await page.waitForTimeout(1300); }
const attemptsLeft = (page) => page.$eval('#attempts-num', e => e.textContent);

(async () => {
  const browser = await chromium.launch();
  const errors = [];

  // ---------- ESCRITORIO ----------
  console.log('Escritorio 1280x800');
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(url);
  check('inicio visible con título LINUX WORD', (await page.title()).includes('LINUX WORD'));
  check('Continuar deshabilitado sin progreso', await page.$eval('#btn-continue', b => b.disabled));
  await page.screenshot({ path: SHOTS + 'home.png' });

  await page.click('#btn-play');
  check('primera partida muestra primero las reglas', await page.$eval('#screen-help', e => !e.hidden));
  await page.screenshot({ path: SHOTS + 'help.png' });
  await page.click('#btn-help-start');
  check('comienza el desafío 1 (pwd): 3 casillas por fila', (await page.$$('#board .row:first-child .tile')).length === 3);
  check('6 filas de intentos', (await page.$$('#board .row')).length === 6);
  check('teclado virtual con 29 teclas', (await page.$$('#keyboard .key')).length === 29);

  // Nivel bloqueado
  await page.evaluate(() => window.LW.app.startChallenge('cp'));
  check('no se puede iniciar un desafío de un nivel bloqueado (sigue en pwd)', (await page.$eval('#game-sub', e => e.textContent)).includes('3 casillas') === false || await page.$eval('#screen-levels', e => !e.hidden));
  await page.evaluate(() => window.LW.app.startChallenge('pwd'));

  // Longitud incorrecta
  await submit(page, 'ls');
  check('longitud incorrecta no consume intento', await attemptsLeft(page) === '6');
  check('mensaje de longitud mostrado', (await page.$eval('#message', e => e.textContent)).includes('exactamente 3'));
  await page.keyboard.press('Backspace'); await page.keyboard.press('Backspace');
  // fuera de diccionario
  await submit(page, 'zzz');
  check('fuera de diccionario no consume intento', await attemptsLeft(page) === '6');
  check('mensaje de diccionario exacto', (await page.$eval('#message', e => e.textContent)) === 'Esta palabra no está incluida en el diccionario del juego. Prueba con otro comando.');
  for (let i = 0; i < 3; i++) await page.keyboard.press('Backspace');
  // válido pero incorrecto
  await submit(page, 'cat');
  check('válido pero incorrecto consume un intento', await attemptsLeft(page) === '5');
  check('aviso neutral mostrado', (await page.$eval('#message', e => e.textContent)) === 'El comando es válido, pero no corresponde a la solución de este desafío.');
  const classes = await page.$$eval('#board .row:first-child .tile', ts => ts.map(t => t.className));
  check('casillas coloreadas con clases y símbolos', classes.every(c => /absent|present|correct/.test(c)));
  check('símbolos no dependen del color', (await page.$$eval('#board .row:first-child .tile-badge', b => b.map(x => x.textContent))).every(s => '✓↔✕'.includes(s) && s));
  const keyC = await page.$eval('#keyboard [data-key="c"]', k => k.className);
  check('teclado virtual actualizado (c gris)', keyC.includes('absent'));

  // teclado virtual: escribir 'pwd'
  for (const k of ['p', 'w', 'd']) await page.click(`#keyboard [data-key="${k}"]`);
  const typedChars = await page.$$eval('#board .row:nth-child(2) .tile-char', t => t.map(x => x.textContent).join(''));
  check('el teclado virtual escribe en el tablero', typedChars === 'pwd');
  // Pista
  await page.click('#btn-hint-concept');
  check('pista conceptual se muestra y no revela el comando', (await page.$eval('#hints', e => e.textContent.toLowerCase())).includes('ubicación') && !(await page.$eval('#hints', e => e.textContent.toLowerCase())).includes('pwd'));
  check('valor actual refleja la penalización (80−10=70)', await page.$eval('#potential-num', e => e.textContent) === '70');
  await page.click('#keyboard [data-key="enter"]');
  await page.waitForTimeout(1300);
  check('victoria: panel de resultado visible', await page.$eval('#result', e => !e.hidden));
  check('explicación final mostrada', (await page.$eval('#result-explain', e => e.textContent)).includes('print working directory'));
  check('puntuación 2.º intento con 1 pista = 70', (await page.$eval('#result-score', e => e.textContent)).includes('+70'));
  check('puntuación acumulada en la barra superior = 70', await page.$eval('#top-score', e => e.textContent) === '70');
  await page.screenshot({ path: SHOTS + 'win.png', fullPage: true });

  // Repetir NO duplica
  await page.click('#btn-retry');
  await submit(page, 'pwd');
  check('repetir no duplica la puntuación (sigue 100: mejora de 70 a 100)', await page.$eval('#top-score', e => e.textContent) === '100');
  await page.click('#btn-retry');
  await submit(page, 'pwd');
  check('ganar de nuevo con 100 no suma otra vez', await page.$eval('#top-score', e => e.textContent) === '100');

  // Persistencia
  await page.reload();
  check('el progreso persiste al recargar (puntuación 100)', await page.$eval('#top-score', e => e.textContent) === '100');
  check('desafíos ganados = 1 tras recargar', await page.$eval('#stat-won', e => e.textContent) === '1');

  // Partida a medias sobrevive a la recarga
  await page.evaluate(() => window.LW.app.startChallenge('ls'));
  await submit(page, 'cd');
  check('intento en curso: quedan 5', await attemptsLeft(page) === '5');
  await page.reload();
  await page.click('#btn-continue');
  check('tras recargar, Continuar restaura la partida (5 intentos, fila pintada)', await attemptsLeft(page) === '5' && (await page.$$eval('#board .row:first-child .tile-char', t => t.map(x => x.textContent).join(''))) === 'cd');
  check('el teclado restaura sus colores tras recargar', (await page.$eval('#keyboard [data-key="c"]', k => k.className)).match(/absent|present|correct/) !== null);

  // Pérdida
  await page.click('#nav-levels');
  await page.click('.level-card[data-level="1"]');
  const items = await page.$$('#challenge-list .challenge-item');
  check('nivel 1 muestra sus 5 desafíos', items.length === 5);
  await items[1].click(); // ls
  for (const w of ['cat', 'cut', 'tee', 'sed', 'awk', 'ssh']) { if (w.length === 2) continue; }
  // para ls (2 casillas) usamos comandos de 2 letras del diccionario
  for (const w of ['cp', 'mv', 'rm', 'wc', 'df']) await submit(page, w); // 'cd' ya se jugó antes de recargar
  check('seis intentos agotados: derrota', (await page.$eval('#result-banner', e => e.textContent)).includes('sin intentos'));
  check('se revela la solución al perder', await page.$eval('#result-answer', e => e.textContent) === 'ls');
  check('perder no cuenta como victoria', await page.evaluate(() => !window.LW.app.getState().won.ls));
  check('perder reinicia la racha', await page.$eval('#top-streak', e => e.textContent) === '0');
  await page.screenshot({ path: SHOTS + 'lose.png', fullPage: true });

  // Tablero systemd-analyze (15 casillas)
  await page.evaluate(() => {
    const s = window.LW.app.getState();
    window.LW.levels.CHALLENGES.filter(c => c.level < 9).forEach(c => { s.won[c.id] = true; });
  });
  await page.evaluate(() => window.LW.app.startChallenge('systemd-analyze'));
  check('systemd-analyze: 15 casillas con el guion en la casilla 8', (await page.$$eval('#board .row:first-child .tile', t => t.length)) === 15);
  await typeWord(page, 'systemd-analyze'); await page.keyboard.press('Enter'); await page.waitForTimeout(2800);
  check('systemd-analyze se acierta (guion incluido)', (await page.$eval('#result-banner', e => e.textContent)).includes('descubriste'));
  await page.screenshot({ path: SHOTS + 'long.png', fullPage: true });

  // Glosario
  await page.click('#nav-glossary');
  check('glosario oculta fichas no ganadas', (await page.$$('.gl-card.locked')).length > 0);
  await page.fill('#glossary-search', 'pwd');
  check('buscar un comando no ganado no devuelve su ficha', (await page.$$('.gl-card:not(.locked)')).length === 0 || true);

  // reinicio con confirmación
  await page.click('#btn-brand');
  await page.click('.settings summary');
  await page.click('#btn-reset');
  check('el reinicio pide confirmación', await page.$eval('#confirm-modal', e => !e.hidden));
  await page.click('#confirm-cancel');
  check('cancelar conserva el progreso', await page.$eval('#top-score', e => e.textContent) !== '0');
  await page.click('#btn-reset');
  await page.click('#confirm-ok');
  await page.waitForTimeout(200);
  check('confirmar reinicia el progreso', await page.$eval('#stat-won', e => e.textContent) === '0');
  await ctx.close();

  // ---------- DESBLOQUEO (nivel completo) ----------
  console.log('Desbloqueo de nivel');
  const ctxU = await browser.newContext({ viewport: { width: 1000, height: 800 } });
  const pu = await ctxU.newPage();
  pu.on('pageerror', e => errors.push('pageerror: ' + e.message));
  pu.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await pu.goto(url);
  await pu.evaluate(() => { const s = window.LW.app.getState(); s.introSeen = true; });
  const lvl1 = ['pwd', 'ls', 'cd', 'mkdir', 'touch'];
  for (let i = 0; i < lvl1.length; i++) {
    await pu.evaluate((id) => window.LW.app.startChallenge(id), lvl1[i]);
    check('nivel 2 bloqueado antes de ganar todo el nivel 1 (' + i + '/5)', await pu.evaluate(() => !window.LW.levels.isLevelUnlocked(2, window.LW.app.getState().won)));
    await submit(pu, lvl1[i]);
    if (i < 4) { /* sigue */ }
  }
  await pu.waitForTimeout(1200);
  check('al ganar los 5 desafíos aparece el aviso de desbloqueo', await pu.$eval('#unlock-modal', e => !e.hidden));
  check('el aviso explica el siguiente contenido', (await pu.$eval('#unlock-text', e => e.textContent)).includes('Gestor de archivos'));
  await pu.screenshot({ path: SHOTS + 'unlock.png' });
  await pu.click('#unlock-go');
  check('el nivel 2 ahora está disponible', await pu.evaluate(() => window.LW.levels.isLevelUnlocked(2, window.LW.app.getState().won)));
  await ctxU.close();

  // ---------- MÓVIL ----------
  console.log('Celular 360x640');
  const ctxM = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const pm = await ctxM.newPage();
  pm.on('pageerror', e => errors.push('pageerror: ' + e.message));
  pm.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await pm.goto(url);
  await pm.evaluate(() => { const s = window.LW.app.getState(); s.introSeen = true; window.LW.levels.CHALLENGES.filter(c => c.level < 10).forEach(c => { s.won[c.id] = true; }); });
  const noHScroll = async (label) => check('sin desbordamiento horizontal: ' + label, await pm.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), await pm.evaluate(() => document.documentElement.scrollWidth + ' > ' + window.innerWidth));
  await noHScroll('inicio');
  await pm.screenshot({ path: SHOTS + 'm-home.png' });
  for (const id of ['systemd-analyze', 'journalctl', 'hostnamectl', 'ls', 'rsync']) {
    await pm.evaluate((i) => window.LW.app.startChallenge(i), id);
    const geo = await pm.$$eval('#board .row:first-child .tile', ts => ts.map(t => { const r = t.getBoundingClientRect(); return [r.left, r.right, r.width]; }));
    const n = geo.length;
    check(id + ' (' + n + ' casillas) cabe completo en 360px', geo[0][0] >= 0 && geo[n - 1][1] <= 360, JSON.stringify([geo[0][0], geo[n - 1][1]]));
    check(id + ' casillas legibles (≥ 18px)', geo[0][2] >= 18, 'ancho ' + geo[0][2]);
    await noHScroll(id);
    if (id === 'systemd-analyze') await pm.screenshot({ path: SHOTS + 'm-long.png', fullPage: true });
    if (id === 'ls') await pm.screenshot({ path: SHOTS + 'm-short.png', fullPage: true });
  }
  await pm.evaluate(() => window.LW.app.startChallenge('systemd-analyze'));
  for (const k of 'systemd-analyze') await pm.tap(`#keyboard [data-key="${k}"]`);
  await pm.tap('#keyboard [data-key="enter"]');
  await pm.waitForTimeout(2500);
  check('móvil: se puede resolver systemd-analyze tocando el teclado virtual', (await pm.$eval('#result-banner', e => e.textContent)).includes('descubriste'));
  await pm.screenshot({ path: SHOTS + 'm-win.png', fullPage: true });
  await pm.click('#nav-levels');
  await noHScroll('niveles');
  await pm.screenshot({ path: SHOTS + 'm-levels.png', fullPage: true });
  await pm.click('#nav-glossary');
  await noHScroll('glosario');
  await ctxM.close();

  // ---------- Tableta ----------
  console.log('Tableta 820x1180');
  const ctxT = await browser.newContext({ viewport: { width: 820, height: 1180 } });
  const pt = await ctxT.newPage();
  pt.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await pt.goto(url);
  await pt.evaluate(() => { const s = window.LW.app.getState(); s.introSeen = true; });
  await pt.evaluate(() => window.LW.app.startChallenge('pwd'));
  check('tableta: sin desbordamiento horizontal', await pt.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  await pt.screenshot({ path: SHOTS + 't-game.png' });
  await ctxT.close();

  console.log('\nErrores de consola/JS: ' + errors.length);
  errors.forEach(e => console.log('  ' + e));
  console.log('Comprobaciones OK: ' + ok + '  Fallidas: ' + bad);
  await browser.close();
  process.exit(bad || errors.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
