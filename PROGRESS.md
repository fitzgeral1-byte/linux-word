# PROGRESS — LINUX WORD

Última actualización: 2026-11-04. Estado: **producto completo y funcional** (no es una maqueta).

## Funcionalidades terminadas (verificadas)
- 10 niveles × 5 desafíos = 50 comandos exactamente como la especificación (`js/levels.js`), con pista principal, conceptual, avanzada y explicación; todas distintas y sin revelar el comando (probado automáticamente).
- Tablero adaptable (2 a 15 casillas, guiones en casilla propia), sin desbordamiento a 360 px.
- Colores verde/amarillo/gris con algoritmo de dos pasadas y símbolos ✓ ↔ ✕; paleta de alto contraste opcional.
- Teclado virtual (A-Z, guion, ⌫, Enter) y físico; el teclado conserva el mejor estado.
- Validación: normalización, longitud exacta, diccionario (~390 comandos); entradas inválidas o repetidas no consumen intento; mensajes exactos de la especificación.
- Seis intentos, puntuación 100/80/60/40/20/10, pistas −10/−15, mejor puntuación por desafío, sin duplicar al repetir; derrota ≠ victoria.
- Desbloqueo progresivo verificado en la lógica (`canStartChallenge`) antes de iniciar cualquier desafío y recalculado al cargar el almacenamiento; animación y explicación al completar un nivel.
- `localStorage` con validación estricta, partida en curso restaurable, reinicio con confirmación, aviso si el navegador no permite guardar.
- Pantalla de inicio (alias, Jugar, Continuar, Seleccionar nivel, Cómo jugar, Glosario, progreso, ganados de 50, puntuación, racha), niveles, glosario con buscador y modo de consulta educativa.
- Documentación: README, guía docente, testing, listado de 50 desafíos, LICENSE (MIT); ZIP de entrega.

## Pendiente / limitaciones conocidas
- Probar en dispositivos físicos, Safari/Firefox y con un lector de pantalla real.
- Verificar la publicación real en GitHub Pages (sin acceso desde este entorno).
- Revisión técnica de las 50 pistas por un docente/administrador Debian independiente.
- El diccionario no cubre todo Linux ni comandos con dígitos o guion bajo.
- Sin sonidos, sin ranking compartido, sin exportar/importar progreso (decisión consciente: no hay backend).

## Archivos de esta sesión
Creados: todo el proyecto (`index.html`, `css/*`, `js/*`, `docs/*`, `tests/*`, `README.md`, `LICENSE`, este archivo).
Modificados tras las pruebas: `css/styles.css` (outline de foco), `css/responsive.css` (tecla Enter), `js/levels.js` y `js/hints.js` (matiz de `/usr/sbin`), `js/word-validator.js` (retirado `md5sum`), `tests/run-tests.js` (expectativas corregidas), `tests/e2e.js` (añadida prueba de recarga).

## Errores encontrados y corregidos
Ver `docs/testing.md` §4 (diccionario con dígito, outline cian, Enter recortado, expectativas de pruebas, afirmación sobre PATH).

## Pruebas ejecutadas (resultados reales)
- `node tests/run-tests.js`: 91/91.
- `node tests/e2e.js` (Chrome, escritorio/celular/tableta): 70/70, 0 errores de consola.

## Próximos pasos recomendados
1. Publicar en GitHub Pages y repetir `tests/e2e.js` apuntando a la URL.
2. Que un docente revise `docs/challenges.md`.
3. Pilotar con un grupo y ajustar dificultad de las pistas según los aciertos.
4. Valorar exportar/importar progreso como archivo y más comandos en el diccionario.

## Cómo continuar sin rehacer nada
Los desafíos viven en `js/levels.js` (+ `hints.js`, `glossary.js`). No reescribas módulos: ejecuta `node tests/run-tests.js` tras cada cambio.
