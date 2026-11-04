# Guía docente — LINUX WORD

## Objetivo pedagógico
Que el estudiante asocie **problemas reales de administración** con la herramienta adecuada y distinga comandos parecidos (`df`/`du`, `cp`/`mv`/`rsync`, `ps`/`top`/`pgrep`, `chmod`/`chown`, `scp`/`sftp`/`rsync`, `cat`/`less`/`head`/`tail`…). No se evalúa memoria de opciones, sino criterio.

## Cómo está construido cada desafío
1. **Pista principal**: una situación concreta, sin nombrar el comando ni sus fragmentos.
2. **Pista conceptual** (−10 pts): tipo de herramienta.
3. **Pista avanzada** (−15 pts): rasgo técnico distintivo.
4. **Explicación final** (solo al terminar): solución, sintaxis y diferencias con comandos similares.
El glosario añade ejemplo de uso y precauciones; solo muestra las fichas de desafíos ya ganados (salvo el «modo de consulta educativa», que lo activa el propio jugador en *Preferencias y datos*).

## Sugerencias de uso en clase
- **Pares**: uno lee la pista en voz alta y el otro propone; deben justificar la elección antes de teclear.
- **Descartar por longitud**: el número de casillas es una pista; pedir al grupo que liste candidatos de esa longitud.
- **Cierre**: tras cada nivel, comparar con la explicación y pedir un ejemplo propio de uso en una terminal real (el juego no ejecuta nada).
- **Evaluación formativa**: pedir captura de la pantalla de niveles, o que expliquen oralmente tres desafíos con pistas usadas.

## Datos y privacidad
El progreso se guarda **solo en el navegador de cada estudiante** (`localStorage`). No hay cuentas, servidor ni envío de resultados al docente. Navegar en modo privado o borrar datos del sitio elimina el progreso. El botón *Reiniciar partida* (con confirmación) borra todo.

## Accesibilidad
Los resultados usan símbolos además de color (✓ ↔ ✕); hay una paleta azul/naranja de alto contraste; el tablero y el teclado se anuncian a lectores de pantalla; se respeta «reducir movimiento».

## Particularidades técnicas que conviene aclarar
- `cd` es una orden interna del intérprete; `pwd` y `kill` existen como internas y como programas.
- `awk` en Debian suele ser `mawk`; algunas extensiones son de `gawk`.
- `systemctl`, `journalctl`, `systemd-analyze`, `hostnamectl` y `loginctl` requieren systemd como init (habitual en Debian, no en la mayoría de contenedores).
- `journalctl` solo conserva el registro tras reiniciar si el almacenamiento es persistente.
- Desde OpenSSH 9.0, `scp` usa SFTP internamente.
- `less`, `rsync` y `openssh-client` pueden faltar en instalaciones mínimas.
- `usermod` reside en `/usr/sbin`, que según la versión puede no estar en el PATH de un usuario normal.
- El orden de `sort` depende de la configuración regional.

## Ampliar el juego
Los desafíos están en `js/levels.js`, las pistas en `js/hints.js`, las fichas del glosario en `js/glossary.js` y el diccionario en `js/word-validator.js`. Tras cambiar algo, ejecuta `node tests/run-tests.js`: verifica estructura, longitudes, unicidad y que ninguna pista contenga el nombre del comando.

Listado completo de desafíos y pistas: [challenges.md](challenges.md).
