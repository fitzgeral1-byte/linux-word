/*
 * hints.js
 * Pistas progresivas (conceptual y avanzada) de los 50 desafíos y su lógica.
 * Ninguna pista contiene el nombre del comando ni una parte literal de él.
 */
(function (g) {
  'use strict';

  const isNode = typeof module === 'object' && module.exports;
  const scoring = isNode ? require('./scoring.js') : g.LW.scoring;
  const engine = isNode ? require('./game-engine.js') : g.LW.engine;

  const HINT_TYPES = ['concept', 'advanced'];
  const HINT_LABELS = { concept: 'Pista conceptual', advanced: 'Pista avanzada' };

  const HINTS = {
    // ── Nivel 1 ──
    pwd: {
      concept: 'Es una consulta sin efectos secundarios: no lista contenido ni cambia nada, solo informa de tu ubicación actual.',
      advanced: 'Su nombre abrevia una frase inglesa de tres palabras. Existe como orden interna del intérprete y como programa independiente; con la opción -P resuelve los enlaces simbólicos.'
    },
    ls: {
      concept: 'Es la herramienta de inventario del contenido de un directorio; su salida puede ser mínima o muy detallada según las opciones.',
      advanced: 'Con -a incluye los elementos ocultos (los que empiezan por un punto) y con -l añade columnas de permisos, propietario, tamaño y fecha. Su nombre tiene solo dos letras.'
    },
    cd: {
      concept: 'No es un programa independiente: lo resuelve el propio intérprete de órdenes porque debe alterar el estado de la sesión actual.',
      advanced: 'Sin argumentos te lleva al directorio personal; con un guion como argumento vuelves al directorio anterior y con dos puntos subes un nivel.'
    },
    mkdir: {
      concept: 'Construye contenedores de archivos: carpetas nuevas, sin tocar ficheros.',
      advanced: 'La opción -p crea toda la cadena de padres y evita errores si el directorio ya existe; falla si no tienes permiso de escritura en el directorio superior.'
    },
    touch: {
      concept: 'Sirve tanto para crear ficheros vacíos como para modificar sus fechas de acceso y modificación.',
      advanced: 'Si el archivo no existe lo genera con tamaño cero; si existe, solo cambia sus sellos temporales. Con -d o -t puedes fijar una fecha concreta.'
    },

    // ── Nivel 2 ──
    cp: {
      concept: 'Genera un duplicado: el origen permanece intacto y el destino contiene el mismo contenido.',
      advanced: 'Para duplicar carpetas completas necesita la opción recursiva -r (o -a para preservar además los atributos); sin ella rechaza los directorios.'
    },
    mv: {
      concept: 'Una única herramienta cubre dos tareas aparentemente distintas: cambiar de ubicación y cambiar de nombre.',
      advanced: 'Dentro del mismo sistema de archivos solo reescribe la entrada del directorio, por lo que es casi instantáneo aunque el archivo sea enorme; entre sistemas distintos duplica y luego borra el origen.'
    },
    rm: {
      concept: 'Desvincula nombres de archivo del sistema de archivos; no los manda a ninguna papelera.',
      advanced: 'Con -r actúa sobre directorios completos y con -i pide confirmación en cada elemento. Combinar -r y -f sobre una ruta mal escrita es una causa clásica de desastres.'
    },
    rmdir: {
      concept: 'Es la versión prudente de borrar carpetas: solo funciona sobre directorios sin contenido.',
      advanced: 'Con -p elimina también los directorios padre que queden vacíos tras borrar el hijo. Su error típico es «Directory not empty».'
    },
    find: {
      concept: 'Recorre jerarquías de directorios evaluando condiciones en tiempo real, sin depender de un índice previo.',
      advanced: 'Admite criterios como -name, -mtime, -size o -type y acciones sobre los resultados mediante -exec. A diferencia de locate, no usa una base de datos precalculada.'
    },

    // ── Nivel 3 ──
    cat: {
      concept: 'Escribe en la salida estándar el contenido de uno o más ficheros, en orden y sin paginar.',
      advanced: 'Con -n numera las líneas; con varios argumentos enlaza los ficheros uno tras otro. Es muy usado (a veces innecesariamente) al inicio de tuberías.'
    },
    less: {
      concept: 'Es un visor paginado e interactivo para texto que permite avanzar y retroceder.',
      advanced: 'Se maneja con la barra espaciadora y las flechas, q para salir y / para buscar hacia adelante. Su nombre bromea con el de un paginador más antiguo, de capacidades más limitadas.'
    },
    head: {
      concept: 'Extrae el comienzo de un archivo o de una salida; por defecto, una cantidad fija de líneas.',
      advanced: 'Muestra diez líneas por defecto; -n cambia la cantidad y, con un número negativo, descarta ese número de líneas del final. Su complemento muestra la parte opuesta.'
    },
    tail: {
      concept: 'Muestra el final de un archivo y puede quedarse esperando nuevos datos.',
      advanced: 'Con -f sigue el archivo y muestra las líneas conforme se agregan; -F además lo reabre si es rotado. Por defecto devuelve diez líneas.'
    },
    wc: {
      concept: 'Cuantifica el contenido de un flujo de texto: líneas, palabras y bytes.',
      advanced: 'Con -l solo cuenta líneas, con -w palabras, con -c bytes y con -m caracteres; su salida por defecto muestra tres columnas más el nombre del archivo. Es habitual al final de una tubería.'
    },

    // ── Nivel 4 ──
    grep: {
      concept: 'Filtra líneas de texto según un patrón y muestra solo las coincidentes.',
      advanced: 'Soporta expresiones regulares; -i ignora mayúsculas, -v invierte la selección, -r recorre directorios y -n muestra el número de línea.'
    },
    sort: {
      concept: 'Reorganiza las líneas de un flujo según un criterio de ordenación.',
      advanced: 'Con -n compara numéricamente, con -r invierte el orden, con -k elige la columna clave y con -u elimina repetidos. Es el paso previo habitual cuando se quieren agrupar líneas iguales.'
    },
    uniq: {
      concept: 'Detecta repeticiones contiguas en un flujo de texto: las elimina o las cuenta.',
      advanced: 'Solo reconoce duplicados en líneas adyacentes, por eso suele ir tras un ordenamiento; -c antepone el contador, -d muestra solo las repetidas y -u solo las únicas.'
    },
    cut: {
      concept: 'Recorta porciones verticales de cada línea: campos o rangos de caracteres.',
      advanced: 'Con -d define el delimitador y con -f selecciona los campos; también opera por posición con -c o -b. No sabe tratar delimitadores de longitud variable, como varios espacios seguidos.'
    },
    tr: {
      concept: 'Reemplaza o suprime caracteres individuales de un flujo; no recibe archivos como argumento.',
      advanced: 'Su sintaxis recibe conjuntos de caracteres (rangos o clases) y solo lee de la entrada estándar; -d elimina, -s comprime repeticiones y -c usa el complemento del conjunto.'
    },

    // ── Nivel 5 ──
    tee: {
      concept: 'Bifurca un flujo de datos: lo reenvía hacia dos destinos a la vez.',
      advanced: 'Con -a añade al final en lugar de sobrescribir. Combinado con elevación de privilegios en el extremo receptor de una tubería, permite escribir en archivos protegidos.'
    },
    xargs: {
      concept: 'Convierte líneas de entrada en argumentos de otra herramienta.',
      advanced: 'Divide la lista en lotes para no superar el límite de argumentos; -0 acepta separadores nulos (compatible con -print0 del buscador de archivos) y -I permite sustituir un marcador por cada elemento.'
    },
    sed: {
      concept: 'Es un editor no interactivo: aplica transformaciones a las líneas a medida que pasan.',
      advanced: 'Su comando más conocido es s/patrón/reemplazo/. Con -i modifica el archivo directamente y -n combinado con p imprime solo lo seleccionado.'
    },
    awk: {
      concept: 'Es un lenguaje de procesamiento por patrones y acciones, orientado a registros y campos.',
      advanced: 'Referencia campos como $1, $2 y $NF, mantiene variables y permite condiciones y bucles. Su nombre procede de las iniciales de sus tres autores. En Debian la implementación predeterminada suele ser mawk.'
    },
    diff: {
      concept: 'Compara dos entradas y describe las discrepancias línea por línea.',
      advanced: 'Con -u produce el formato unificado que consumen los parches y los sistemas de control de versiones; con -r compara directorios completos.'
    },

    // ── Nivel 6 ──
    ps: {
      concept: 'Captura una fotografía estática de los procesos; no se actualiza de forma continua.',
      advanced: 'Acepta estilos de opciones BSD y UNIX; las combinaciones aux y -ef son las más utilizadas para listar todos los procesos del sistema.'
    },
    top: {
      concept: 'Es un monitor interactivo en tiempo real, no una instantánea.',
      advanced: 'Su cabecera muestra carga media, tareas y memoria; las teclas M y P ordenan por memoria o por CPU, k envía una señal y q sale. Su nombre tiene tres letras.'
    },
    pgrep: {
      concept: 'Busca procesos por patrón y devuelve únicamente sus identificadores.',
      advanced: 'Con -u filtra por usuario, con -f busca en la línea de órdenes completa y con -l añade el nombre. Existe una pareja que, con el mismo criterio de selección, envía señales en lugar de listar.'
    },
    kill: {
      concept: 'Envía señales a procesos; terminar es solo su uso más frecuente.',
      advanced: 'Por defecto envía la señal 15 (terminación ordenada); con -9 envía la señal que el proceso no puede ignorar y con -l lista todas las señales. Existe como orden interna del intérprete y como programa independiente.'
    },
    nice: {
      concept: 'Ajusta la prioridad de CPU de un proceso frente al planificador en el momento de iniciarlo.',
      advanced: 'Su valor va de -20 (más prioridad) a 19 (menos); solo root puede asignar valores negativos. Para un proceso ya iniciado se usa una herramienta hermana.'
    },

    // ── Nivel 7 ──
    uname: {
      concept: 'Informa de la identidad básica del sistema: núcleo, nombre de la máquina y arquitectura.',
      advanced: 'Con -r muestra la versión del kernel, con -m la arquitectura y con -a reúne todo en una sola línea.'
    },
    uptime: {
      concept: 'Resume en una sola línea la actividad temporal del sistema.',
      advanced: 'Muestra tres valores de carga media (1, 5 y 15 minutos) y con -p ofrece el tiempo encendido en formato legible. Su información procede de un pseudoarchivo del directorio /proc.'
    },
    free: {
      concept: 'Resume el estado de la memoria física y del área de intercambio.',
      advanced: 'Con -h usa unidades legibles. La columna «available» estima la memoria utilizable sin recurrir al intercambio, y es más fiable que la columna que solo cuenta las páginas completamente sin usar.'
    },
    df: {
      concept: 'Informa a nivel de sistema de archivos o partición, no de carpetas concretas.',
      advanced: 'Con -h usa unidades legibles, con -T añade el tipo de sistema de archivos y con -i muestra el uso de inodos; su columna «Mounted on» indica el punto de montaje.'
    },
    du: {
      concept: 'Estima el espacio consumido por archivos y directorios recorriendo su contenido.',
      advanced: 'Con -s resume un total por argumento, con -h usa unidades legibles y con --max-depth limita la profundidad. Combinado con una ordenación numérica permite crear un ranking de los mayores consumidores.'
    },

    // ── Nivel 8 ──
    whoami: {
      concept: 'Responde con una sola palabra: el usuario efectivo de la sesión.',
      advanced: 'Equivale a una consulta más general con las opciones -un. Invocado tras elevar privilegios con sudo, responde root.'
    },
    id: {
      concept: 'Muestra las identidades numéricas y los grupos de un usuario.',
      advanced: 'Con -u imprime solo el UID, con -g el GID principal y con -G todos los grupos; sin argumentos describe al usuario que lo ejecuta y con un nombre consulta a otro. Su nombre tiene solo dos letras.'
    },
    chmod: {
      concept: 'Cambia el modo de acceso de archivos y directorios: lectura, escritura y ejecución.',
      advanced: 'Admite notación simbólica (u+x, go-w) y octal (755, 640); con -R se aplica de forma recursiva.'
    },
    chown: {
      concept: 'Transfiere la titularidad de archivos a otro usuario o grupo; requiere privilegios.',
      advanced: 'Usa la forma usuario:grupo, con -R recorre directorios y con --reference toma la propiedad de otro archivo. Normalmente solo root puede cambiar el propietario.'
    },
    usermod: {
      concept: 'Modifica atributos de una cuenta de usuario existente; no la crea ni la elimina.',
      advanced: 'La combinación -aG añade grupos suplementarios sin reemplazar los existentes (omitir -a los sobrescribe); -s cambia el intérprete de órdenes y -L bloquea la cuenta. Se ubica en /usr/sbin (según la versión de Debian, puede no estar en tu PATH) y requiere privilegios.'
    },

    // ── Nivel 9 ──
    systemctl: {
      concept: 'Es la interfaz de control del administrador de servicios principal de Debian.',
      advanced: 'Sus subcomandos status, start, stop, restart, enable y disable operan sobre unidades; con list-units enumera las cargadas y con --failed filtra las que fallaron. Tiene nueve letras.'
    },
    journalctl: {
      concept: 'Lee el registro binario estructurado que mantiene el gestor de servicios; no es un archivo de texto plano.',
      advanced: 'Con -u filtra por unidad, con -b limita al arranque actual, con -f sigue en vivo, con -p filtra por prioridad y con --since o --until acota fechas. Si no existe el directorio de almacenamiento persistente, el registro se pierde al reiniciar.'
    },
    'systemd-analyze': {
      concept: 'Examina los tiempos del arranque del gestor de servicios y qué unidades lo retrasan.',
      advanced: 'Sus subcomandos blame y critical-chain ordenan las unidades por tiempo y por cadena crítica; verify comprueba la sintaxis de archivos de unidad y security evalúa su nivel de endurecimiento. Su nombre contiene un guion.'
    },
    hostnamectl: {
      concept: 'Consulta y modifica la identidad de la máquina: nombres y metadatos de despliegue.',
      advanced: 'Con el subcomando de asignación de nombre fija el nombre estático, y distingue entre nombre estático, transitorio y «bonito». Sin argumentos muestra un resumen de estado.'
    },
    loginctl: {
      concept: 'Controla el gestor de sesiones de usuario del sistema: sesiones, asientos y usuarios conectados.',
      advanced: 'Sus subcomandos list-sessions, show-user, terminate-session y lock-session operan sobre sesiones y usuarios; permite además activar la persistencia de procesos de un usuario tras cerrar su sesión (linger).'
    },

    // ── Nivel 10 ──
    ssh: {
      concept: 'Cliente de conexión remota con cifrado, sucesor seguro de las herramientas históricas que enviaban todo en claro.',
      advanced: 'Usa por defecto el puerto 22, se identifica con claves guardadas en un directorio oculto de tu usuario y permite túneles con -L y -D; con -i selecciona la clave privada y con -p el puerto. Tiene tres letras.'
    },
    scp: {
      concept: 'Duplica archivos entre máquinas con la lógica de origen y destino de la orden de duplicado local.',
      advanced: 'El destino remoto se escribe usuario@servidor:ruta; con -r transfiere directorios y con -P (mayúscula) indica el puerto. En versiones recientes de OpenSSH usa internamente el protocolo SFTP.'
    },
    sftp: {
      concept: 'Cliente interactivo de transferencia de archivos, con órdenes propias para subir y bajar ficheros.',
      advanced: 'Ofrece un prompt con órdenes get, put, ls, cd y lcd (cambiar el directorio local). No es el FTP clásico: viaja sobre el canal cifrado, sin necesidad de abrir otro puerto.'
    },
    rsync: {
      concept: 'Sincroniza árboles de archivos usando un algoritmo de diferencias para minimizar los datos transferidos.',
      advanced: 'Con -a conserva permisos, fechas y enlaces; --delete elimina en el destino lo que ya no existe en el origen, -n simula la operación y --progress muestra el avance. Una barra final en el origen cambia lo que se copia.'
    },
    tar: {
      concept: 'Agrupa muchos archivos en uno solo; por sí mismo no comprime.',
      advanced: 'Opciones esenciales: c crea, x extrae, t lista, f nombra el archivo y z, j o J activan gzip, bzip2 o xz. Heredó su nombre de los respaldos en cinta magnética.'
    }
  };

  function hasHints(id) { return Object.prototype.hasOwnProperty.call(HINTS, id); }

  /** Texto de una pista, o null si no existe. No altera ninguna sesión. */
  function getHintText(id, type) {
    if (!hasHints(id) || HINT_TYPES.indexOf(type) < 0) return null;
    return HINTS[id][type];
  }

  /**
   * Revela una pista en una sesión en curso. Registra su uso (que resta puntos al
   * calcular la puntuación) y devuelve { text, cost, firstUse }, o null si no es posible.
   */
  function revealHint(session, type) {
    if (session.status !== 'playing') return null;
    const text = getHintText(session.id, type);
    if (text === null) return null;
    const firstUse = engine.markHint(session, type);
    return { text, cost: scoring.HINT_COST[type], firstUse };
  }

  const api = { HINTS, HINT_TYPES, HINT_LABELS, getHintText, revealHint };

  if (isNode) module.exports = api;
  else { g.LW = g.LW || {}; g.LW.hints = api; }
})(typeof window !== 'undefined' ? window : globalThis);
