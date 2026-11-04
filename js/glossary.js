/*
 * glossary.js
 * Glosario de los 50 comandos con buscador. Por defecto solo muestra las fichas de
 * desafíos ya ganados; el «modo de consulta educativa» muestra todas.
 */
(function (g) {
  'use strict';

  const isNode = typeof module === 'object' && module.exports;
  const levels = isNode ? require('./levels.js') : g.LW.levels;

  // [función, sintaxis, ejemplo, diferencias con herramientas similares, precauciones]
  const DATA = {
    pwd: ['Imprime la ruta absoluta del directorio de trabajo actual.', 'pwd [-L | -P]', 'pwd', 'cd cambia de directorio; ls lista su contenido. pwd solo informa de dónde estás.', 'Con enlaces simbólicos, -L (por defecto) y -P pueden mostrar rutas distintas.'],
    ls: ['Lista el contenido de directorios.', 'ls [opciones] [ruta...]', 'ls -lah /var/log', 'find recorre recursivamente y filtra; ls muestra un nivel (salvo -R). tree dibuja el árbol.', 'Los archivos ocultos solo aparecen con -a. La salida de ls no es adecuada para procesarla en scripts.'],
    cd: ['Cambia el directorio de trabajo de la sesión.', 'cd [directorio]', 'cd /var/log', 'pwd consulta el directorio; cd lo cambia. Es una orden interna del intérprete, no un programa.', 'En un script, cd solo afecta al propio script, no a la terminal que lo lanzó.'],
    mkdir: ['Crea directorios.', 'mkdir [-p] [-m modo] directorio...', 'mkdir -p proyectos/2026/informes', 'touch crea archivos; mkdir crea carpetas. rmdir hace lo contrario.', 'Sin -p falla si el padre no existe. Con -m el modo no se ve afectado por la máscara de permisos.'],
    touch: ['Crea archivos vacíos o actualiza sus marcas de tiempo.', 'touch [-d fecha] archivo...', 'touch registro.log', 'mkdir crea directorios; cat > archivo sobrescribe contenido, touch no.', 'Cambiar fechas puede interferir con herramientas que dependen de ellas (copias incrementales, make).'],
    cp: ['Duplica archivos y directorios.', 'cp [-ar] origen... destino', 'cp -a /etc/ssh /tmp/ssh.bak', 'mv traslada (no deja el original); rsync copia de forma incremental; scp copia entre máquinas.', 'Sobrescribe el destino sin preguntar (usa -i para confirmar). Sin -r no copia directorios.'],
    mv: ['Mueve o renombra archivos y directorios.', 'mv [-i] origen... destino', 'mv informe.pdf ~/Documentos/', 'cp deja el original; mv no. Entre sistemas de archivos distintos copia y luego borra.', 'Sobrescribe el destino salvo con -i o -n.'],
    rm: ['Elimina archivos (y directorios con -r).', 'rm [-rfi] ruta...', 'rm -i temporal.txt', 'rmdir solo borra directorios vacíos; rm -r borra árboles completos.', 'No hay papelera: el borrado es definitivo. Evita rm -rf con variables sin comprobar y con comodines amplios.'],
    rmdir: ['Elimina directorios vacíos.', 'rmdir [-p] directorio...', 'rmdir carpeta_vacia', 'rm -r borra con su contenido; rmdir se niega si hay algo dentro, por lo que es más seguro.', 'Falla con «Directory not empty» si el directorio tiene contenido.'],
    find: ['Busca archivos recorriendo un árbol según criterios.', 'find [ruta] [criterios] [acción]', 'find /etc -name "*.conf" -mtime -7', 'locate usa una base de datos (rápido, puede estar desactualizado); find consulta el disco en vivo. ls no es recursivo.', '-exec ... \\; y -delete son potentes: prueba primero el criterio sin acción.'],
    cat: ['Escribe archivos en la salida estándar, en orden.', 'cat [-n] [archivo...]', 'cat /etc/os-release', 'less pagina; head/tail muestran partes; cat lo vuelca todo.', 'Con archivos binarios o muy grandes puede saturar la terminal.'],
    less: ['Visor paginado interactivo de texto.', 'less [opciones] archivo', 'less /var/log/syslog', 'cat vuelca todo de golpe; more solo avanza; less permite retroceder y buscar.', 'Puede no estar instalado en contenedores mínimos. Sal con q.'],
    head: ['Muestra las primeras líneas de un archivo o flujo.', 'head [-n N] [archivo...]', 'head -n 5 datos.csv', 'tail muestra el final; sed -n "1,5p" también puede mostrar un rango.', 'Con -n -N omite las últimas N líneas (comportamiento de GNU).'],
    tail: ['Muestra las últimas líneas; puede seguir un archivo.', 'tail [-n N] [-f|-F] archivo', 'tail -f /var/log/syslog', 'head muestra el comienzo; less +F también sigue archivos pero de forma interactiva.', 'Con archivos rotados, -f puede perder el seguimiento: usa -F.'],
    wc: ['Cuenta líneas, palabras, caracteres y bytes.', 'wc [-lwcm] [archivo...]', 'wc -l usuarios.txt', 'grep -c cuenta solo las líneas que coinciden; wc cuenta todas.', 'Las columnas de la salida dependen de las opciones; wc -l cuenta saltos de línea.'],
    grep: ['Filtra líneas que coinciden con un patrón.', 'grep [opciones] patrón [archivo...]', 'grep -rin "error" /var/log/', 'find busca por nombre/metadatos; grep busca dentro del contenido. sed y awk además transforman.', 'Los caracteres especiales del patrón pueden requerir comillas o -F para búsqueda literal.'],
    sort: ['Ordena líneas de texto.', 'sort [-nrku] [archivo...]', 'sort -n -k2 ventas.txt', 'sort -u elimina repetidos; uniq solo agrupa adyacentes y puede contar.', 'El orden depende de la configuración regional (LC_ALL=C da orden por bytes).'],
    uniq: ['Elimina o cuenta líneas repetidas consecutivas.', 'uniq [-cdu] [entrada]', 'sort visitas.log | uniq -c', 'sort -u solo deduplica; uniq -c cuenta apariciones.', 'Solo detecta duplicados adyacentes: ordena antes.'],
    cut: ['Extrae campos o columnas de cada línea.', 'cut -d DELIM -f CAMPOS [archivo]', 'cut -d":" -f1 /etc/passwd', 'awk admite separadores variables y lógica; cut es más simple y rápido.', 'No gestiona varios espacios consecutivos como un solo separador.'],
    tr: ['Sustituye o elimina caracteres de la entrada estándar.', 'tr [-dsc] conjunto1 [conjunto2]', 'tr "a-z" "A-Z" < texto.txt', 'sed trabaja con patrones de cadenas; tr con caracteres sueltos.', 'No acepta archivos como argumentos: usa redirección o tuberías.'],
    tee: ['Duplica un flujo hacia un archivo y la salida estándar.', 'orden | tee [-a] archivo', 'make 2>&1 | tee compilacion.log', 'La redirección > no muestra por pantalla; tee sí.', 'Sin -a sobrescribe el archivo. Es el truco habitual para escribir como root: echo x | sudo tee archivo.'],
    xargs: ['Construye y ejecuta órdenes con argumentos leídos de la entrada.', 'xargs [-0] [-n N] [-I {}] orden', 'find . -name "*.tmp" -print0 | xargs -0 rm', 'find -exec ejecuta una orden por archivo (o por lote con +); $(...) puede superar el límite de argumentos.', 'Los nombres con espacios requieren -0 junto con -print0.'],
    sed: ['Editor de flujo para transformar texto línea a línea.', 'sed [-i] "s/patrón/reemplazo/g" archivo', 'sed -i.bak "s/localhost/10.0.0.5/g" app.conf', 'tr cambia caracteres; awk trabaja por campos; sed por patrones de línea.', 'Con -i modifica el original: usa un sufijo de copia (-i.bak) o prueba antes sin -i.'],
    awk: ['Lenguaje de procesamiento por registros y campos.', 'awk \'patrón { acción }\' archivo', 'awk \'$2 > 10 { s += $3 } END { print s }\' datos.txt', 'cut solo extrae columnas; awk añade condiciones, variables y cálculos.', 'En Debian, awk suele ser mawk; hay funciones exclusivas de gawk.'],
    diff: ['Compara archivos línea a línea.', 'diff [-u] [-r] viejo nuevo', 'diff -u config.old config.new', 'cmp compara byte a byte; comm compara listas ordenadas; diff describe los cambios.', 'Código de salida 1 cuando hay diferencias: cuidado con scripts con "set -e".'],
    ps: ['Muestra una instantánea de los procesos.', 'ps [aux | -ef]', 'ps aux --sort=-%mem | head', 'top se actualiza en vivo; pgrep devuelve solo PID por patrón.', 'ps aux | grep nombre se incluye a sí mismo; usa pgrep.'],
    top: ['Monitor interactivo de procesos en tiempo real.', 'top [-u usuario]', 'top -u www-data', 'ps es una foto estática; top se refresca. Hay alternativas más visuales que requieren instalación.', 'Desde top, k envía señales: confirma el PID antes de terminar un proceso.'],
    pgrep: ['Devuelve los PID de procesos que coinciden con un patrón.', 'pgrep [-u usuario] [-f] patrón', 'pgrep -u www-data -l nginx', 'pkill usa el mismo criterio para enviar señales; ps | grep no se excluye a sí mismo.', 'Sin -f solo compara con el nombre del proceso (limitado a 15 caracteres).'],
    kill: ['Envía una señal a un proceso por su PID.', 'kill [-SEÑAL] PID...', 'kill -15 4321', 'pkill/killall seleccionan por nombre; kill por PID.', 'SIGKILL (-9) no permite limpieza al proceso: úsala solo si SIGTERM no funciona.'],
    nice: ['Inicia un programa con una prioridad de CPU ajustada.', 'nice -n VALOR orden', 'nice -n 10 tar czf copia.tgz datos/', 'renice cambia la prioridad de procesos ya en marcha; ionice hace algo parecido con el disco.', 'Solo root puede bajar el valor por debajo de 0. Solo importa si hay competencia por CPU.'],
    uname: ['Muestra información del sistema y del núcleo.', 'uname [-a | -r | -m | -n]', 'uname -r', 'hostnamectl muestra más datos y permite cambiarlos; /etc/os-release identifica la distribución.', 'No indica la versión de Debian, solo la del núcleo.'],
    uptime: ['Muestra el tiempo encendido, usuarios y carga media.', 'uptime [-p | -s]', 'uptime -p', 'w añade la lista de sesiones; who -b da el último arranque.', 'La carga media debe interpretarse respecto al número de CPU.'],
    free: ['Muestra la memoria física y el intercambio.', 'free [-h]', 'free -h', 'df/du miden disco; top muestra memoria por proceso.', 'No te alarmes si «free» es bajo: observa la columna «available».'],
    df: ['Informa del espacio en sistemas de archivos montados.', 'df [-hTi] [ruta]', 'df -hT', 'du suma lo que ocupan archivos y directorios; df consulta el sistema de archivos.', 'Un archivo borrado pero abierto por un proceso sigue ocupando espacio en df.'],
    du: ['Estima el espacio usado por archivos y directorios.', 'du [-sh] [--max-depth=N] [ruta]', 'du -h --max-depth=1 /var | sort -h', 'df informa de capacidad por sistema de archivos; du, del contenido de un árbol.', 'Recorrer árboles grandes puede ser lento y generar carga de disco.'],
    whoami: ['Imprime el nombre del usuario efectivo.', 'whoami', 'sudo whoami', 'id da UID, GID y grupos; who lista usuarios con sesión.', 'Muestra el usuario efectivo, no necesariamente el que inició sesión.'],
    id: ['Muestra UID, GID y grupos de un usuario.', 'id [-u|-g|-G] [-n] [usuario]', 'id ana', 'whoami solo da el nombre; groups solo los grupos.', 'Los cambios de grupo no se reflejan en sesiones ya abiertas.'],
    chmod: ['Cambia los permisos de archivos y directorios.', 'chmod [-R] modo archivo...', 'chmod u+x script.sh', 'chown cambia propietario y grupo, no permisos. umask define permisos por defecto.', 'Evita chmod -R 777: concede acceso total a cualquiera.'],
    chown: ['Cambia el propietario y/o grupo de archivos.', 'chown [-R] usuario[:grupo] archivo...', 'sudo chown -R www-data:www-data /var/www/app', 'chmod cambia permisos; chgrp cambia solo el grupo.', 'Requiere privilegios; un -R mal dirigido sobre / puede dañar el sistema.'],
    usermod: ['Modifica una cuenta de usuario existente.', 'usermod [opciones] usuario', 'sudo usermod -aG docker ana', 'useradd crea cuentas; adduser es un asistente de Debian; passwd cambia contraseñas.', 'Omitir -a con -G reemplaza todos los grupos suplementarios. Reside en /usr/sbin.'],
    systemctl: ['Controla el gestor de servicios systemd.', 'systemctl <acción> [unidad]', 'systemctl status nginx', 'journalctl lee registros; service es una capa de compatibilidad.', 'Requiere systemd como init (no está en la mayoría de contenedores). enable no inicia el servicio, salvo con --now.'],
    journalctl: ['Consulta el registro de systemd-journald.', 'journalctl [-u unidad] [-b] [--since X]', 'journalctl -u nginx --since "1 hour ago"', 'cat/tail sobre /var/log leen texto plano; journalctl lee un formato binario indexado.', 'Sin almacenamiento persistente, el registro se pierde al reiniciar. Requiere permisos para ver todos los mensajes.'],
    'systemd-analyze': ['Examina el rendimiento del arranque.', 'systemd-analyze [time|blame|critical-chain|verify]', 'systemd-analyze blame', 'journalctl -b muestra mensajes; uptime solo el tiempo encendido.', 'Requiere systemd. El nombre incluye un guion.'],
    hostnamectl: ['Consulta y modifica el nombre de la máquina y sus metadatos.', 'hostnamectl [set-hostname NOMBRE]', 'sudo hostnamectl set-hostname servidor1', 'hostname solo cambia el nombre transitorio; uname -n solo lo muestra.', 'Cambiar el nombre puede afectar a certificados, /etc/hosts y la red.'],
    loginctl: ['Gestiona sesiones y usuarios con systemd-logind.', 'loginctl <acción> [objetivo]', 'loginctl list-sessions', 'who y w solo leen; systemctl gestiona unidades, no sesiones.', 'terminate-user cierra todas las sesiones y procesos del usuario.'],
    ssh: ['Abre una sesión remota cifrada.', 'ssh [-p puerto] [-i clave] usuario@servidor', 'ssh ana@servidor.ejemplo.org', 'scp y sftp transfieren archivos; telnet no cifra.', 'Verifica la huella del servidor la primera vez y protege tu clave privada.'],
    scp: ['Copia archivos entre máquinas por un canal cifrado.', 'scp [-r] origen usuario@servidor:destino', 'scp informe.pdf ana@servidor:/tmp/', 'rsync es incremental; sftp es interactivo; cp es local.', 'Sobrescribe sin avisar. Desde OpenSSH 9.0 usa SFTP internamente.'],
    sftp: ['Cliente interactivo de transferencia de archivos cifrada.', 'sftp usuario@servidor', 'sftp ana@servidor  →  get informe.pdf', 'scp es no interactivo; ftp no cifra; rsync sincroniza.', 'No confundir con FTPS (FTP sobre TLS), que es otro protocolo.'],
    rsync: ['Sincroniza archivos de forma incremental, local o remota.', 'rsync [-avz] [--delete] origen/ destino/', 'rsync -avzn --delete datos/ ana@respaldo:/srv/datos/', 'cp y scp copian todo cada vez; rsync solo lo que cambió.', 'La barra final del origen cambia el resultado; --delete puede borrar datos: prueba primero con -n.'],
    tar: ['Empaqueta (y opcionalmente comprime) archivos.', 'tar [c|x|t]vf archivo.tar [opciones] [rutas]', 'tar czf copia.tar.gz carpeta/', 'zip empaqueta y comprime a la vez; gzip comprime un solo archivo.', 'Extrae solo archivos de confianza: pueden contener rutas absolutas o ".." (revisa con t antes de x).']
  };

  const ENTRIES = levels.CHALLENGES.map((c) => {
    const d = DATA[c.id];
    return {
      id: c.id,
      name: c.answer,
      level: c.level,
      category: levels.getLevel(c.level).name,
      func: d[0], syntax: d[1], example: d[2], similar: d[3], caution: d[4]
    };
  });

  function normalizeQuery(q) { return String(q || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }

  /**
   * Devuelve las entradas visibles para una búsqueda.
   * Cada elemento: { entry, locked }. Las entradas bloqueadas (desafío no ganado y sin
   * modo de consulta) NO se buscan por nombre ni contenido; solo por categoría, y se
   * devuelven con locked = true para que la interfaz oculte su contenido.
   */
  function search(query, won, studyMode) {
    const q = normalizeQuery(query);
    const out = [];
    ENTRIES.forEach((entry) => {
      const unlocked = studyMode || (won && won[entry.id] === true);
      const cat = normalizeQuery(entry.category);
      if (unlocked) {
        const hay = normalizeQuery([entry.name, entry.category, entry.func, entry.syntax, entry.similar].join(' '));
        if (!q || hay.indexOf(q) >= 0) out.push({ entry, locked: false });
      } else if (!q || cat.indexOf(q) >= 0) {
        out.push({ entry, locked: true });
      }
    });
    return out;
  }

  function field(parent, label, text, cls) {
    const row = document.createElement('div');
    row.className = 'gl-field' + (cls ? ' ' + cls : '');
    const b = document.createElement('span');
    b.className = 'gl-label';
    b.textContent = label;
    const v = document.createElement('span');
    v.className = 'gl-text';
    v.textContent = text;
    row.appendChild(b);
    row.appendChild(v);
    parent.appendChild(row);
  }

  /** Dibuja la lista en `container` (usa textContent: nunca interpreta HTML). */
  function render(container, query, won, studyMode) {
    container.textContent = '';
    const results = search(query, won, studyMode);
    if (results.length === 0) {
      const p = document.createElement('p');
      p.className = 'gl-empty';
      p.textContent = 'No hay resultados. Recuerda que solo se muestran los comandos de desafíos que ya ganaste.';
      container.appendChild(p);
      return results.length;
    }
    results.forEach(({ entry, locked }) => {
      const card = document.createElement('article');
      card.className = 'gl-card' + (locked ? ' locked' : '');
      const head = document.createElement('header');
      head.className = 'gl-head';
      const name = document.createElement('h3');
      name.className = 'gl-name';
      name.textContent = locked ? '🔒 ' + '•'.repeat(4) : entry.name;
      const cat = document.createElement('span');
      cat.className = 'gl-cat';
      cat.textContent = 'Nivel ' + entry.level + ' · ' + entry.category;
      head.appendChild(name);
      head.appendChild(cat);
      card.appendChild(head);
      if (locked) {
        const p = document.createElement('p');
        p.className = 'gl-locked-text';
        p.textContent = 'Gana este desafío para ver su ficha.';
        card.appendChild(p);
      } else {
        field(card, 'Función', entry.func);
        field(card, 'Sintaxis', entry.syntax, 'mono');
        field(card, 'Ejemplo', entry.example, 'mono');
        field(card, 'Diferencias', entry.similar);
        field(card, 'Precauciones', entry.caution, 'caution');
      }
      container.appendChild(card);
    });
    return results.length;
  }

  const api = { ENTRIES, search, render, normalizeQuery };

  if (isNode) module.exports = api;
  else { g.LW = g.LW || {}; g.LW.glossary = api; }
})(typeof window !== 'undefined' ? window : globalThis);
