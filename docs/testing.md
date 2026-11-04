# Pruebas — LINUX WORD

Resultados de las ejecuciones reales realizadas durante el desarrollo (no se listan pruebas que no se hayan ejecutado).

## 1. Pruebas de lógica (Node, sin dependencias)
`node tests/run-tests.js` → **91 superadas, 0 fallidas.**

| Requisito | Qué se comprueba |
|---|---|
| 1-3 Estructura | 10 niveles; 5 desafíos por nivel; nombres de nivel y respuestas idénticos (y en el mismo orden) a la especificación; 50 respuestas únicas, solo `a-z` y guiones |
| 4 Longitudes | `length` = longitud real; `ls`=2, `grep`=4, `mkdir`=5, `systemctl`=9, `systemd-analyze`=15 (guion en la casilla 8) |
| 5 Pistas | 50 pistas principales, conceptuales, avanzadas y explicaciones, **todas distintas**; ninguna contiene el nombre del comando (palabra o subcadena), partes de los nombres con guion ni fórmulas «Sirve para…» ni «primera letra…» |
| 6-7 Colores | acierto, todo ausente, `sss` vs `ssh`, una sola aparición frente a varias, prioridad del verde, amarillos limitados por apariciones disponibles, guiones (verde, amarillo, ausente), 3 000 casos aleatorios que verifican la invariante del algoritmo |
| 9 Normalización | recorte, minúsculas, guiones y caracteres internos conservados, longitud exacta, mensajes exactos de la especificación, diccionario ≥ 300 palabras con alternativas para cada longitud |
| 8, 10-11 Intentos | longitud, vacío, fuera de diccionario y repetido **no** consumen; válido incorrecto **sí**; máximo 6; séptimo rechazado; acierto en el 6.º |
| 13 Teclado | prioridad verde > amarillo > gris, el gris nunca degrada, reconstrucción desde intentos guardados, 29 teclas (A-Z, guion, retroceso, Enter) |
| 14-16 Puntuación | tabla 100/80/60/40/20/10/0, penalizaciones de pistas sin negativos, derrota ≠ victoria, repetir no duplica, mejor puntuación solo sube, estado inmutable |
| 12 Desbloqueo | nivel 1 abierto; el siguiente solo con 5 victorias; no se saltan niveles; `canStartChallenge` rechaza niveles bloqueados; perder no desbloquea |
| 17 Almacenamiento | ida y vuelta; JSON corrupto; identificadores y tipos inválidos; puntuaciones manipuladas acotadas; victorias inconsistentes descartadas; nivel recalculado (no se confía en el guardado); sesión en curso validada; reinicio; fallo de cuota sin excepción |
| Glosario | 50 fichas completas; sin victorias no se filtra ningún nombre por búsqueda; modo de consulta |
| 3, 19-20 Seguridad/Pages | sin `eval`, `new Function`, `innerHTML`, `document.write`; sin `fetch`/XHR/URLs externas; rutas relativas y archivos existentes; sin scripts ni manejadores en línea |

## 2. Pruebas de interfaz en navegador real
`node tests/e2e.js` (Playwright + Chrome) → **70 comprobaciones superadas, 0 fallidas, 0 errores de consola o de página.**

- **Escritorio 1280×800**: reglas antes de la primera partida; intento con longitud incorrecta y con palabra fuera del diccionario (6 intentos intactos, mensajes exactos); válido incorrecto (−1 intento y aviso neutral); colores con símbolos; teclado virtual y físico; pista (−10) reflejada en el valor actual; victoria con explicación y puntuación 70; repetir sube a 100 y volver a ganar no suma; persistencia tras recargar; **partida a medias restaurada** (intentos, fila y colores del teclado); derrota a los 6 intentos revelando la respuesta, sin victoria y con racha a 0; `systemd-analyze` (15 casillas, guion) resuelto; glosario con fichas bloqueadas; reinicio con confirmación (cancelar conserva, confirmar borra); intento de iniciar un desafío bloqueado rechazado.
- **Desbloqueo**: el nivel 2 sigue bloqueado tras 1, 2, 3 y 4 victorias; al 5.º aparece el aviso con el contenido del siguiente nivel y queda disponible.
- **Celular 360×640 (táctil)**: sin desbordamiento horizontal en inicio, juego, niveles y glosario; `systemd-analyze`, `journalctl`, `hostnamectl`, `rsync` y `ls` caben completos con casillas ≥ 18 px; se resuelve `systemd-analyze` tocando el teclado virtual.
- **Tableta 820×1180**: sin desbordamiento.

Se revisaron además capturas de pantalla de inicio, juego, victoria, móvil y teclado.

## 3. Lo que NO se ha probado
- Dispositivos físicos, Safari, Firefox y lectores de pantalla reales (solo se aplicaron atributos ARIA y regiones `aria-live`, sin verificarlos con un lector).
- La URL publicada en GitHub Pages (el entorno no tiene acceso); se probó abriendo `index.html` como archivo y con rutas relativas verificadas estáticamente.
- Pruebas con usuarios o estudiantes reales.
- Revisión técnica de pistas por un especialista independiente: las pistas fueron redactadas y revisadas por el desarrollador; se recomienda una revisión docente.

## 4. Errores encontrados y corregidos durante las pruebas
- Expectativas erróneas en dos pruebas unitarias (cálculo manual incorrecto de colores con letras repetidas); el algoritmo era correcto y se verificó a mano.
- `md5sum` en el diccionario (contiene un dígito, imposible de teclear): eliminado y añadida una prueba que lo impide.
- Línea cian a los lados de la pantalla (outline de foco en `<main>`): corregido.
- Tecla «Enter» recortada en celulares: corregido.
- Afirmación sobre `/usr/sbin` en el PATH matizada según versión de Debian.
