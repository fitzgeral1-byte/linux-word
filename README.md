# LINUX WORD — Adivina el comando

Videojuego educativo web para aprender comandos reales de **Linux Debian**. Cada desafío describe una situación de administración de sistemas; el jugador deduce el comando y lo escribe en un tablero de casillas (una por carácter), con seis intentos y retroalimentación por colores **y símbolos** (✓ verde, ↔ amarillo, ✕ gris).

Está inspirado en la mecánica de adivinanza por letras de los juegos tipo Wordle. La identidad visual, los textos y el código son propios; no se usan recursos de ninguna aplicación de terceros.

- **10 niveles × 5 desafíos = 50 comandos** (ver [docs/challenges.md](docs/challenges.md), solo para docentes).
- Sitio **100 % estático**: HTML + CSS + JavaScript, sin backend, sin dependencias, sin servicios externos.
- No ejecuta comandos ni usa `eval()`: solo se razona y se escribe.
- Progreso en `localStorage` (solo en el navegador; **no se sincroniza ni se envía a nadie**).

## Probar en local

Abre `index.html` en un navegador, o sirve la carpeta:

```bash
python3 -m http.server 8000   # y visita http://localhost:8000/
```

## Publicar en GitHub Pages

1. Crea un repositorio (p. ej. `linux-word`) y sube **el contenido de esta carpeta** a la rama `main` (`index.html` debe quedar en la raíz).
2. En GitHub: **Settings → Pages**.
3. En *Build and deployment* elige **Source: Deploy from a branch**, rama **`main`**, carpeta **`/ (root)`**, y pulsa **Save**.
4. Tras uno o dos minutos el juego estará en `https://USUARIO.github.io/linux-word/`.

Todas las rutas son relativas, así que funciona bajo la subruta del repositorio. No hace falta compilar nada.

## Estructura

```
index.html
css/   styles.css · board.css · responsive.css
js/    app.js (interfaz) · game-engine.js (colores e intentos) · word-validator.js (normalización y diccionario)
       keyboard.js · levels.js (niveles, desafíos, desbloqueo) · hints.js · scoring.js · storage.js · glossary.js
docs/  teacher-guide.md · testing.md · challenges.md
tests/ run-tests.js (lógica, Node) · e2e.js (interfaz, Playwright)
```

Las reglas (`game-engine`, `scoring`, `levels`, `word-validator`, `storage`) no tocan el DOM y se prueban directamente en Node.

## Reglas resumidas

- 6 intentos. Longitud incorrecta o palabra fuera del diccionario **no** consumen intento; un comando válido pero incorrecto **sí**.
- Colores con evaluación en dos pasadas (letras repetidas correctas) y teclado que conserva el mejor estado de cada letra.
- Puntos: 100 / 80 / 60 / 40 / 20 / 10 por intento de acierto; pista conceptual −10, avanzada −15 (mínimo 0). Se guarda la **mejor** puntuación por desafío; repetir no suma de nuevo.
- Un nivel se desbloquea al ganar sus 5 desafíos. Perder (y ver la respuesta) no cuenta como victoria.

## Pruebas

```bash
node tests/run-tests.js          # 91 pruebas de lógica, sin dependencias
node tests/e2e.js                # interfaz en navegador real (requiere Playwright)
```

Resultados reales y alcance: [docs/testing.md](docs/testing.md). Estado del desarrollo: [PROGRESS.md](PROGRESS.md).

## Limitaciones conocidas

- El diccionario (~390 comandos, solo letras y guiones) **no cubre todo Linux**: comandos con dígitos o guion bajo (p. ej. `md5sum`) no se pueden escribir en el teclado del juego.
- Solo se aceptan nombres de comando sin argumentos.
- Varias herramientas dependen de la versión o la configuración (systemd como init, `awk`=`mawk` en Debian, `scp` sobre SFTP en OpenSSH ≥ 9.0, `less`/`rsync` no siempre instalados, persistencia de `journalctl`); las explicaciones lo indican.
- Las pruebas en navegador se hicieron con Chrome/Chromium (emulando escritorio, tableta y celular), no en dispositivos físicos ni en Safari/Firefox.
- No se ha verificado en una URL publicada de GitHub Pages (no hay acceso desde este entorno); se comprobó con rutas relativas y servidor local/archivo.

## Licencia

MIT — ver [LICENSE](LICENSE).
