/*
 * levels.js
 * 10 niveles × 5 desafíos = 50 desafíos. Incluye la pista principal y la
 * explicación final de cada uno, y la lógica de desbloqueo.
 * (Las pistas conceptual y avanzada están en hints.js; el glosario, en glossary.js.)
 */
(function (g) {
  'use strict';

  const LEVELS = [
    {
      number: 1, name: 'Explorador de archivos',
      description: 'Orientarse en el árbol de directorios y crear la estructura básica.',
      challenges: [
        {
          answer: 'pwd',
          clue: 'Te conectaste a un servidor y, tras saltar entre varias carpetas, ya no recuerdas dónde estás parado dentro del árbol de directorios. Necesitas imprimir la ruta completa, desde la raíz, del lugar donde trabajas ahora.',
          explanation: 'La respuesta es pwd (print working directory). Imprime la ruta absoluta del directorio de trabajo. Sintaxis: pwd [-L|-P]. Por defecto (-L) muestra la ruta lógica; con -P resuelve los enlaces simbólicos. A diferencia de ls, no lista contenido; a diferencia de cd, no cambia nada: solo informa. Existe como orden interna de bash y también como programa independiente.'
        },
        {
          answer: 'ls',
          clue: 'Acabas de entrar en una carpeta desconocida y quieres ver qué archivos y subcarpetas contiene, incluyendo, si hiciera falta, sus permisos, tamaños y fechas de modificación en un formato detallado.',
          explanation: 'La respuesta es ls (list). Lista el contenido de un directorio. Sintaxis: ls [opciones] [ruta]. ls -la muestra todo en formato largo, ocultos incluidos. A diferencia de find, solo mira un nivel (salvo con -R) y no filtra con criterios complejos; a diferencia de pwd, informa del contenido y no de la ubicación.'
        },
        {
          answer: 'cd',
          clue: 'Necesitas pasar de /home/ana a /var/log para empezar a revisar archivos allí, sin abrir otra terminal. Lo que buscas modifica el lugar desde el que se ejecutarán tus siguientes órdenes.',
          explanation: 'La respuesta es cd (change directory). Cambia el directorio de trabajo de la sesión. Sintaxis: cd [ruta]. Es una orden interna del intérprete (no hay un programa /usr/bin/cd): un proceso hijo no podría alterar el directorio de su padre. cd sin argumentos va al directorio personal, cd - vuelve al anterior y cd .. sube un nivel.'
        },
        {
          answer: 'mkdir',
          clue: 'Vas a organizar un proyecto y necesitas crear la estructura vacía proyectos/2026/informes de una sola vez, incluyendo las carpetas intermedias que todavía no existen.',
          explanation: 'La respuesta es mkdir (make directory). Crea directorios. Sintaxis: mkdir [-p] ruta... Con -p crea toda la cadena de padres y no da error si ya existe. Se diferencia de touch en que crea carpetas, no archivos, y de rmdir en que construye en lugar de eliminar.'
        },
        {
          answer: 'touch',
          clue: 'Un script espera encontrar un archivo llamado registro.log aunque todavía esté vacío, y además necesitas actualizar la marca de tiempo de modificación de otro archivo ya existente sin alterar su contenido.',
          explanation: 'La respuesta es touch. Crea archivos vacíos si no existen y, si existen, actualiza sus fechas de acceso y modificación. Sintaxis: touch [opciones] archivo... Con -d o -t se fija una fecha concreta. Se diferencia de mkdir (crea directorios) y de cat > archivo, que sí destruiría un contenido previo.'
        }
      ]
    },
    {
      number: 2, name: 'Gestor de archivos',
      description: 'Duplicar, mover, eliminar y localizar archivos y directorios.',
      challenges: [
        {
          answer: 'cp',
          clue: 'Antes de editar un archivo de configuración crítico, quieres conservar un duplicado idéntico con otro nombre, dejando el original en su lugar.',
          explanation: 'La respuesta es cp (copy). Duplica archivos y directorios. Sintaxis: cp [-r] origen destino. Sin -r rechaza los directorios; -a es recursivo y preserva atributos; -i pregunta antes de sobrescribir. A diferencia de mv, el original se conserva.'
        },
        {
          answer: 'mv',
          clue: 'Descargaste informe.pdf en la carpeta equivocada y necesitas trasladarlo a Documentos; con la misma orden podrías también cambiarle el nombre sin crear una segunda versión.',
          explanation: 'La respuesta es mv (move). Mueve o renombra. Sintaxis: mv origen destino. Dentro del mismo sistema de archivos solo reescribe la entrada del directorio, por eso es casi instantáneo; entre sistemas distintos copia y luego borra. A diferencia de cp, no deja el original. Sobrescribe el destino salvo que uses -i o -n.'
        },
        {
          answer: 'rm',
          clue: 'Tras una prueba quedaron archivos temporales sin valor y quieres eliminarlos de forma definitiva; no existe papelera, así que un error en la ruta podría ser irreversible.',
          explanation: 'La respuesta es rm (remove). Elimina nombres de archivo. Sintaxis: rm [-rfi] ruta... Con -r actúa sobre directorios y su contenido. No hay papelera ni deshacer. A diferencia de rmdir, borra archivos y árboles completos, no solo directorios vacíos.'
        },
        {
          answer: 'rmdir',
          clue: 'Reorganizando un servidor encontraste carpetas que quedaron vacías y quieres eliminarlas, con la garantía de que el sistema se negará a hacerlo si contienen algo.',
          explanation: 'La respuesta es rmdir (remove directory). Elimina directorios vacíos. Sintaxis: rmdir [-p] directorio... Falla si el directorio no está vacío, lo que lo hace más seguro que rm -r. Con -p borra también los padres que queden vacíos.'
        },
        {
          answer: 'find',
          clue: 'Sabes que existe un archivo de configuración con extensión .conf en algún lugar de /etc, pero no recuerdas en qué subcarpeta; necesitas recorrer el árbol aplicando criterios como nombre, tamaño o fecha de modificación.',
          explanation: 'La respuesta es find. Recorre árboles de directorios evaluando condiciones. Sintaxis: find ruta [criterios] [acción]; ejemplo: find /etc -name "*.conf". A diferencia de ls, filtra y es recursivo; a diferencia de locate, consulta el disco en vivo (más lento, pero siempre actualizado) en lugar de una base de datos precalculada. Pertenece al paquete findutils.'
        }
      ]
    },
    {
      number: 3, name: 'Lectura de información',
      description: 'Inspeccionar el contenido de archivos y flujos sin editarlos.',
      challenges: [
        {
          answer: 'cat',
          clue: 'Tienes un archivo de texto corto y quieres volcar su contenido completo en la pantalla; también podrías enlazar varios archivos en un único flujo de salida.',
          explanation: 'La respuesta es cat (concatenate). Escribe en la salida estándar el contenido de uno o más archivos, en orden. Sintaxis: cat [-n] archivo... Es adecuado para archivos cortos; con los largos conviene less. Se diferencia de head/tail en que muestra todo, y de less en que no pagina.'
        },
        {
          answer: 'less',
          clue: 'Abriste un registro de miles de líneas con una orden que lo volcó entero y se te perdió el inicio. Necesitas visualizarlo página por página, retroceder y buscar texto sin cargar todo en memoria.',
          explanation: 'La respuesta es less. Es un paginador interactivo. Sintaxis: less archivo. Teclas: espacio avanza, b retrocede, /texto busca, n repite la búsqueda y q sale. Se diferencia de cat en que no vuelca todo de golpe, y de su antecesor more en que permite retroceder. Con F sigue el archivo como tail -f. En contenedores mínimos puede no estar instalado.'
        },
        {
          answer: 'head',
          clue: 'Recibes un CSV gigantesco y solo necesitas confirmar rápidamente cómo se llaman las columnas mirando las primeras filas, sin abrir el archivo completo.',
          explanation: 'La respuesta es head. Muestra el comienzo de un archivo (10 líneas por defecto). Sintaxis: head [-n N] [archivo]. Con -c N trabaja por bytes y con -n -N omite las últimas N líneas. Es el complemento de tail, que muestra el final.'
        },
        {
          answer: 'tail',
          clue: 'Una aplicación web está fallando y quieres observar en tiempo real las últimas entradas que va añadiendo a su registro, sin volver a abrirlo cada pocos segundos.',
          explanation: 'La respuesta es tail. Muestra el final de un archivo (10 líneas por defecto). Sintaxis: tail [-n N] [-f] archivo. Con -f sigue el archivo en vivo y con -F lo reabre si es rotado. Es el complemento de head.'
        },
        {
          answer: 'wc',
          clue: 'Necesitas saber cuántas líneas tiene una lista de usuarios exportada, o cuántas palabras tiene un texto, sin contarlas manualmente.',
          explanation: 'La respuesta es wc (word count). Cuenta líneas, palabras y bytes. Sintaxis: wc [-lwcm] [archivo]. Ejemplo: ls | wc -l cuenta las entradas de un directorio. A diferencia de grep -c, cuenta todas las líneas del flujo y no solo las que coinciden con un patrón.'
        }
      ]
    },
    {
      number: 4, name: 'Procesamiento de texto',
      description: 'Filtrar, ordenar, contar repeticiones y extraer columnas: la base de las tuberías.',
      challenges: [
        {
          answer: 'grep',
          clue: 'Entre cientos de miles de líneas de un registro de autenticación, necesitas aislar solo aquellas que contienen la cadena «Failed password».',
          explanation: 'La respuesta es grep. Filtra líneas que coinciden con un patrón. Sintaxis: grep [opciones] patrón [archivo...]. Opciones útiles: -i (ignora mayúsculas), -v (invierte), -r (recursivo), -n (número de línea), -E (expresiones regulares extendidas). A diferencia de find, busca dentro del contenido y no por nombre; a diferencia de sed o awk, solo selecciona líneas, no las transforma.'
        },
        {
          answer: 'sort',
          clue: 'Tienes una lista de nombres de clientes desordenada y necesitas presentarla alfabéticamente, o bien ordenar por valor numérico una columna de importes.',
          explanation: 'La respuesta es sort. Ordena líneas. Sintaxis: sort [-nrku] [archivo]. El orden alfabético depende de la configuración regional (LC_COLLATE), por lo que puede variar entre sistemas; -n compara numéricamente y -u elimina repetidos. Es el paso previo habitual de uniq, que solo detecta duplicados adyacentes.'
        },
        {
          answer: 'uniq',
          clue: 'Después de ordenar un registro de visitas, necesitas colapsar las líneas idénticas consecutivas y, además, saber cuántas veces se repitió cada una.',
          explanation: 'La respuesta es uniq. Filtra o cuenta líneas repetidas consecutivas. Sintaxis: sort archivo | uniq -c. Se diferencia de sort -u en que puede contar (-c) y mostrar solo las repetidas (-d) o solo las únicas (-u), pero únicamente ve duplicados adyacentes.'
        },
        {
          answer: 'cut',
          clue: 'De un archivo de cuentas del sistema necesitas extraer únicamente la primera columna (los nombres de usuario), tomando los dos puntos como separador.',
          explanation: 'La respuesta es cut. Extrae porciones de cada línea. Sintaxis: cut -d":" -f1 /etc/passwd. Se diferencia de awk en que no admite separadores de longitud variable (como varios espacios) ni lógica condicional: es más simple y rápido.'
        },
        {
          answer: 'tr',
          clue: 'Necesitas convertir todo un texto de minúsculas a mayúsculas, o eliminar los retornos de carro de un archivo creado en otro sistema operativo, leyendo solo desde la entrada estándar.',
          explanation: 'La respuesta es tr (translate). Reemplaza o elimina caracteres de la entrada estándar. Sintaxis: tr "a-z" "A-Z" < archivo. -d borra caracteres y -s comprime repeticiones. A diferencia de sed, opera carácter a carácter (no con patrones de cadenas) y no acepta nombres de archivo como argumentos.'
        }
      ]
    },
    {
      number: 5, name: 'Procesamiento avanzado',
      description: 'Bifurcar flujos, construir órdenes dinámicas, editar en bloque y comparar.',
      challenges: [
        {
          answer: 'tee',
          clue: 'Ejecutas una instalación larga y quieres ver su salida en pantalla y, al mismo tiempo, guardarla en un archivo de registro, sin repetir la operación.',
          explanation: 'La respuesta es tee. Copia la entrada estándar a un archivo y a la salida estándar. Sintaxis: orden | tee [-a] archivo. Truco clásico: echo "x" | sudo tee /etc/archivo, porque sudo echo x > archivo falla (la redirección la hace tu shell sin privilegios). A diferencia de la redirección >, también muestra la salida por pantalla.'
        },
        {
          answer: 'xargs',
          clue: 'Una búsqueda devolvió miles de nombres de archivo y necesitas aplicarles a todos otra orden que espera los nombres como argumentos, no como texto por la entrada estándar.',
          explanation: 'La respuesta es xargs. Construye y ejecuta órdenes a partir de la entrada estándar. Sintaxis: find . -name "*.tmp" -print0 | xargs -0 rm. Divide en lotes para no superar el límite de argumentos. Se diferencia de la sustitución $(...) en que gestiona ese límite, y de find -exec en que puede agrupar muchos archivos por ejecución. Pertenece a findutils.'
        },
        {
          answer: 'sed',
          clue: 'Debes reemplazar la cadena «localhost» por una dirección IP en un archivo de configuración enorme, de manera automática y sin abrir un editor interactivo.',
          explanation: 'La respuesta es sed (stream editor). Transforma texto línea a línea. Sintaxis: sed "s/viejo/nuevo/g" archivo. Con -i modifica el archivo en su sitio (conviene -i.bak para dejar copia). Se diferencia de tr (caracteres sueltos) y de awk (columnas y lógica de programación).'
        },
        {
          answer: 'awk',
          clue: 'Tienes un registro con columnas separadas por espacios y necesitas sumar los valores de la tercera columna, mostrando solo las filas donde la segunda supere cierto umbral.',
          explanation: 'La respuesta es awk. Es un lenguaje de procesamiento por patrones y acciones. Sintaxis: awk "$2 > 10 { suma += $3 } END { print suma }" archivo. Se diferencia de cut en que admite condiciones, variables y aritmética. Particularidad en Debian: awk suele ser mawk por defecto; algunas extensiones de gawk (por ejemplo, ciertas funciones de tiempo) no existen en mawk, salvo que instales gawk.'
        },
        {
          answer: 'diff',
          clue: 'Dos versiones de un archivo de configuración se comportan distinto y necesitas ver exactamente qué líneas fueron añadidas, eliminadas o cambiadas entre ellas.',
          explanation: 'La respuesta es diff. Compara archivos línea a línea. Sintaxis: diff [-u] viejo nuevo. Con -u produce el formato unificado y con -r compara directorios. Código de salida 0 si son iguales y 1 si difieren. Se diferencia de cmp (compara byte a byte, ideal para binarios) y de comm (requiere entradas ordenadas).'
        }
      ]
    },
    {
      number: 6, name: 'Procesos',
      description: 'Observar, buscar, señalizar y priorizar procesos en ejecución.',
      challenges: [
        {
          answer: 'ps',
          clue: 'Sospechas que un programa quedó colgado y deseas obtener una instantánea, en un momento dado, de los procesos activos: quién los ejecuta, su identificador y cuánta memoria consumen.',
          explanation: 'La respuesta es ps (process status). Muestra una instantánea de los procesos. Sintaxis: ps aux o ps -ef. A diferencia de top, no se actualiza sola; a diferencia de pgrep, por sí mismo no filtra por nombre. Pertenece al paquete procps.'
        },
        {
          answer: 'top',
          clue: 'Un servidor va lento y quieres una pantalla que se refresque sola mostrando qué procesos consumen más procesador y memoria en este instante, con la posibilidad de ordenarlos o terminarlos desde ahí.',
          explanation: 'La respuesta es top. Es un monitor interactivo en tiempo real. Teclas: M ordena por memoria, P por CPU, k envía una señal, 1 despliega los núcleos y q sale. A diferencia de ps, se actualiza continuamente. Pertenece al paquete procps.'
        },
        {
          answer: 'pgrep',
          clue: 'Un script necesita obtener solo los números de identificación de los procesos de un servicio concreto, buscándolos por su nombre, sin tener que filtrar una tabla completa con otra herramienta.',
          explanation: 'La respuesta es pgrep. Devuelve los PID de los procesos cuyo nombre coincide con un patrón. Sintaxis: pgrep [-u usuario] [-f] patrón. Se diferencia de ps | grep en que no se encuentra a sí mismo y su salida son solo números. Su pareja pkill usa los mismos criterios para enviar señales.'
        },
        {
          answer: 'kill',
          clue: 'Un proceso no responde y debes pedirle que termine usando su identificador numérico; si ignora la petición amable, deberás recurrir a una señal que no se puede interceptar.',
          explanation: 'La respuesta es kill. Envía una señal a un proceso identificado por su PID. Sintaxis: kill [-señal] PID. Sin opciones envía SIGTERM (15), un cierre ordenado; -9 (SIGKILL) fuerza la terminación sin posibilidad de limpieza. A diferencia de pkill y killall, selecciona por PID y no por nombre. Es orden interna de bash y existe además como programa independiente.'
        },
        {
          answer: 'nice',
          clue: 'Lanzarás una compresión muy pesada en un servidor compartido y quieres que ceda el procesador a otras tareas más importantes, iniciándola con una prioridad de planificación reducida.',
          explanation: 'La respuesta es nice. Inicia un programa con una prioridad de planificación ajustada. Sintaxis: nice -n 10 orden. El rango va de -20 (más prioridad) a 19 (menos); solo root puede usar valores negativos. Para un proceso ya iniciado se usa renice. No limita la CPU: solo influye cuando hay competencia por ella.'
        }
      ]
    },
    {
      number: 7, name: 'Diagnóstico del sistema',
      description: 'Identificar el núcleo, la carga, la memoria y el uso de disco.',
      challenges: [
        {
          answer: 'uname',
          clue: 'Antes de instalar un controlador necesitas conocer la versión exacta del núcleo en ejecución y la arquitectura del procesador de la máquina.',
          explanation: 'La respuesta es uname (unix name). Imprime información básica del sistema. Sintaxis: uname [-a|-r|-m|-n]. -r da la versión del kernel y -m la arquitectura. No informa de la distribución: para eso existe /etc/os-release. hostnamectl muestra datos similares y además permite modificarlos.'
        },
        {
          answer: 'uptime',
          clue: 'Quieres saber cuánto tiempo lleva encendido el servidor desde el último arranque, cuántos usuarios hay conectados y qué carga media tuvo en los últimos minutos.',
          explanation: 'La respuesta es uptime. Resume en una línea la hora, el tiempo encendido, los usuarios y la carga media (1, 5 y 15 minutos). Una carga sostenida mayor que el número de CPU sugiere saturación. Se diferencia de w (que además lista sesiones) y de who -b (que solo da la fecha del arranque).'
        },
        {
          answer: 'free',
          clue: 'Un servicio se cierra por falta de memoria y necesitas ver cuánta RAM y cuánta área de intercambio están en uso, y cuánta se encuentra disponible para nuevas aplicaciones.',
          explanation: 'La respuesta es free. Muestra la memoria física y el intercambio (swap). Sintaxis: free [-h]. La columna «available» es la estimación realista de memoria utilizable: Linux emplea la RAM sobrante como caché, así que una columna «free» baja no es un problema por sí sola. Se diferencia de df/du (disco) y de top (consumo por proceso).'
        },
        {
          answer: 'df',
          clue: 'Un servidor está quedándose sin espacio y necesitas conocer la capacidad, el uso y el espacio restante de cada sistema de archivos montado, sin calcular individualmente el tamaño de los directorios.',
          explanation: 'La respuesta es df (disk free). Informa del espacio por sistema de archivos montado. Sintaxis: df [-hTi]. Se diferencia de du: df pregunta al sistema de archivos (capacidad, usado, disponible) mientras que du suma el tamaño de lo que encuentra al recorrer el árbol. Pueden discrepar, por ejemplo, con archivos borrados pero aún abiertos por un proceso.'
        },
        {
          answer: 'du',
          clue: 'Un directorio ocupa demasiado almacenamiento y necesitas averiguar cuánto espacio consumen sus subcarpetas para localizar dónde se concentra el problema.',
          explanation: 'La respuesta es du (disk usage). Estima el espacio usado por archivos y directorios. Sintaxis: du [-sh] [--max-depth=N] ruta. Ejemplo de ranking: du -h --max-depth=1 /var | sort -h. Se diferencia de df, que informa de la capacidad del sistema de archivos completo y no de directorios concretos.'
        }
      ]
    },
    {
      number: 8, name: 'Usuarios y permisos',
      description: 'Identidades, grupos, permisos de acceso y propiedad de archivos.',
      challenges: [
        {
          answer: 'whoami',
          clue: 'Trabajas en una sesión con varias elevaciones de privilegios y necesitas confirmar, con la salida más corta posible, bajo qué nombre de usuario efectivo se ejecutan tus órdenes.',
          explanation: 'La respuesta es whoami. Imprime el nombre del usuario efectivo. Sintaxis: whoami. Tras un sudo muestra root. Se diferencia de id (UID, GID y grupos) y de who/logname (usuarios con sesión abierta y usuario original de la sesión).'
        },
        {
          answer: 'id',
          clue: 'Un usuario no puede escribir en un directorio compartido y necesitas ver su identificador numérico, su grupo principal y la lista completa de grupos a los que pertenece.',
          explanation: 'La respuesta es id. Muestra UID, GID y grupos. Sintaxis: id [-u|-g|-G] [-n] [usuario]. Se diferencia de whoami (solo el nombre) y de groups (solo los grupos). Tras añadir a alguien a un grupo, la sesión abierta no lo refleja hasta volver a iniciarla.'
        },
        {
          answer: 'chmod',
          clue: 'Un script recién descargado responde «Permission denied» al ejecutarlo; necesitas habilitar el bit de ejecución para su propietario sin modificar el resto de los permisos.',
          explanation: 'La respuesta es chmod (change mode). Cambia los permisos de archivos y directorios. Sintaxis: chmod u+x script.sh o chmod 640 archivo. Admite notación simbólica y octal; -R es recursivo. Se diferencia de chown, que cambia el propietario. Precaución: chmod -R 777 es mala práctica porque da acceso total a todos.'
        },
        {
          answer: 'chown',
          clue: 'Tras restaurar una copia de seguridad, los archivos de la aplicación pertenecen a root y el servicio, que corre con otro usuario, no puede escribir en ellos; necesitas reasignar el propietario y el grupo.',
          explanation: 'La respuesta es chown (change owner). Cambia el propietario y el grupo. Sintaxis: chown usuario:grupo archivo; -R es recursivo. Normalmente requiere privilegios de root. Se diferencia de chmod (permisos) y de chgrp (solo el grupo).'
        },
        {
          answer: 'usermod',
          clue: 'Una empleada ya tiene cuenta en el sistema y debes añadirla a un grupo adicional sin quitarle los que ya posee, o cambiar su intérprete de órdenes por defecto.',
          explanation: 'La respuesta es usermod. Modifica una cuenta de usuario existente. Sintaxis: usermod -aG grupo usuario. Sin -a, la opción -G reemplaza todos los grupos suplementarios. Se diferencia de useradd (crea cuentas), de adduser (script interactivo propio de Debian) y de passwd (contraseña). Reside en /usr/sbin, que según la versión de Debian puede no estar en el PATH de un usuario normal.'
        }
      ]
    },
    {
      number: 9, name: 'Servicios y systemd',
      description: 'Gestionar servicios, leer registros, medir el arranque y manejar sesiones.',
      challenges: [
        {
          answer: 'systemctl',
          clue: 'Tras un reinicio, el servidor web no atiende peticiones. Necesitas comprobar si su unidad de servicio está activa o fallida, y disponer de operaciones para iniciarla, detenerla, recargarla o habilitarla en el arranque.',
          explanation: 'La respuesta es systemctl. Controla el gestor de servicios systemd. Sintaxis: systemctl status|start|stop|restart|enable|disable unidad. Se diferencia de journalctl (que lee registros) y de service (capa de compatibilidad). Depende de que el sistema use systemd como init: es lo habitual en Debian, pero no en la mayoría de los contenedores.'
        },
        {
          answer: 'journalctl',
          clue: 'Un servicio falló hace una hora y no dejó ningún archivo de texto con sus mensajes; necesitas consultar el registro binario centralizado del sistema, filtrando por unidad y por intervalo de tiempo.',
          explanation: 'La respuesta es journalctl. Consulta el registro de systemd-journald. Sintaxis: journalctl -u unidad --since "1 hour ago". En Debian, que el registro persista tras reiniciar depende de que exista /var/log/journal (o de configurar Storage=persistent). Se diferencia de leer /var/log con cat o tail, que son archivos de texto plano, por ejemplo los de rsyslog.'
        },
        {
          answer: 'systemd-analyze',
          clue: 'Tu servidor tarda varios minutos en arrancar y quieres saber cuánto pasó en el núcleo, cuánto en el espacio de usuario y qué unidades retrasaron más el proceso.',
          explanation: 'La respuesta es systemd-analyze (incluye el guion). Examina el rendimiento del arranque. Sintaxis: systemd-analyze [time|blame|critical-chain|verify|security]. Se diferencia de journalctl -b (mensajes del arranque) y de uptime (solo el tiempo encendido). Requiere systemd como init.'
        },
        {
          answer: 'hostnamectl',
          clue: 'Necesitas consultar y cambiar de forma persistente el nombre de la máquina, y ver además datos como el chasis, el sistema operativo y el núcleo, mediante la interfaz del gestor de servicios.',
          explanation: 'La respuesta es hostnamectl. Consulta y modifica el nombre de la máquina y sus metadatos. Sintaxis: hostnamectl [set-hostname NOMBRE]. Se diferencia de hostname, que cambia solo el nombre transitorio y no persiste al reiniciar, y de uname -n, que solo lo muestra. Requiere systemd.'
        },
        {
          answer: 'loginctl',
          clue: 'Quieres ver quién tiene sesiones abiertas en el equipo, a qué asiento pertenecen y terminar de golpe todas las sesiones de un usuario, usando la interfaz del gestor de sesiones.',
          explanation: 'La respuesta es loginctl. Gestiona sesiones, asientos y usuarios de systemd-logind. Sintaxis: loginctl list-sessions | terminate-user USUARIO | enable-linger USUARIO. Se diferencia de who y w, que solo leen, y de systemctl, que gestiona unidades. Requiere systemd.'
        }
      ]
    },
    {
      number: 10, name: 'Administración remota',
      description: 'Conexión cifrada, transferencia, sincronización y empaquetado de datos.',
      challenges: [
        {
          answer: 'ssh',
          clue: 'Debes administrar un servidor situado en otro continente: necesitas abrir una sesión interactiva de órdenes en él a través de un canal cifrado, autenticándote con tu clave.',
          explanation: 'La respuesta es ssh (secure shell). Abre una sesión remota cifrada. Sintaxis: ssh [-p puerto] [-i clave] usuario@servidor. Admite túneles con -L y -D. Se diferencia de telnet (sin cifrado) y de scp/sftp (que transfieren archivos). Viene en el paquete openssh-client, que puede faltar en instalaciones mínimas.'
        },
        {
          answer: 'scp',
          clue: 'Necesitas enviar un archivo local a otro servidor con una sola línea, sin abrir una sesión interactiva, utilizando el mismo canal cifrado de la administración remota.',
          explanation: 'La respuesta es scp (secure copy). Duplica archivos entre máquinas. Sintaxis: scp [-r] [-P puerto] origen usuario@servidor:destino. Se diferencia de rsync (transferencia incremental) y de sftp (interactivo). Particularidad: desde OpenSSH 9.0 scp usa por defecto el protocolo SFTP internamente, y su documentación recomienda sftp o rsync para usos nuevos.'
        },
        {
          answer: 'sftp',
          clue: 'Necesitas explorar el sistema de archivos de un servidor remoto de forma interactiva: listar directorios, navegar, descargar y subir ficheros dentro de un mismo canal cifrado.',
          explanation: 'La respuesta es sftp (secure file transfer protocol). Es un cliente interactivo de transferencia. Sintaxis: sftp usuario@servidor; dentro: ls, cd, lcd, get, put. No es el FTP clásico ni FTPS: viaja por el canal cifrado, sin abrir otro puerto. Se diferencia de scp (una sola línea, no interactivo) y de ftp (sin cifrado).'
        },
        {
          answer: 'rsync',
          clue: 'Debes mantener sincronizada una carpeta de 200 GB con un servidor de respaldo; tras la primera copia, cada ejecución debería transferir únicamente lo que cambió y poder reanudarse si se corta.',
          explanation: 'La respuesta es rsync (remote sync). Sincroniza de forma incremental. Sintaxis: rsync -avz --progress origen/ usuario@servidor:destino/. Una barra final en el origen copia su contenido; sin ella, copia la carpeta misma. --delete borra en destino lo que ya no existe en origen: pruébalo antes con -n (simulación). Se diferencia de cp/scp, que copian todo siempre. En Debian no siempre viene instalado (apt install rsync).'
        },
        {
          answer: 'tar',
          clue: 'Necesitas empaquetar un directorio completo en un solo archivo, comprimiéndolo con gzip, para enviarlo por correo; luego, en otro equipo, extraer su contenido conservando permisos.',
          explanation: 'La respuesta es tar (tape archive). Agrupa muchos archivos en uno solo. Sintaxis: tar czf copia.tar.gz carpeta/ (crear), tar xzf copia.tar.gz (extraer), tar tf copia.tar.gz (listar). Por sí mismo no comprime: z, j y J delegan en gzip, bzip2 y xz. Se diferencia de zip (empaqueta y comprime a la vez) y de gzip (comprime un solo archivo, sin agrupar).'
        }
      ]
    }
  ];

  // Añade id, número de nivel y posición a cada desafío.
  const CHALLENGES = [];
  LEVELS.forEach((level) => {
    level.challenges.forEach((c, i) => {
      c.id = c.answer;
      c.level = level.number;
      c.index = i + 1;
      c.length = Array.from(c.answer).length;
      CHALLENGES.push(c);
    });
  });

  const BY_ID = Object.create(null);
  CHALLENGES.forEach((c) => { BY_ID[c.id] = c; });

  function getChallenge(id) { return BY_ID[id] || null; }
  function getLevel(number) { return LEVELS.find((l) => l.number === number) || null; }
  function isValidId(id) { return typeof id === 'string' && BY_ID[id] !== undefined; }

  /** Cantidad de desafíos ganados de un nivel. `won` es un objeto { id: true }. */
  function levelWins(number, won) {
    const level = getLevel(number);
    if (!level) return 0;
    return level.challenges.filter((c) => won && won[c.id] === true).length;
  }

  /** El nivel N está disponible si es el 1 o si los 5 desafíos del nivel N-1 están ganados. */
  function isLevelUnlocked(number, won) {
    if (!Number.isInteger(number) || number < 1 || number > LEVELS.length) return false;
    if (number === 1) return true;
    return levelWins(number - 1, won) === getLevel(number - 1).challenges.length && isLevelUnlocked(number - 1, won);
  }

  /** Nivel más alto desbloqueado (1-10), calculado a partir de las victorias. */
  function unlockedLevel(won) {
    let n = 1;
    while (n < LEVELS.length && isLevelUnlocked(n + 1, won)) n++;
    return n;
  }

  /** Comprueba el requisito de desbloqueo antes de permitir iniciar un desafío. */
  function canStartChallenge(id, won) {
    const c = getChallenge(id);
    return !!c && isLevelUnlocked(c.level, won);
  }

  function levelProgress(number, won) {
    const level = getLevel(number);
    if (!level) return 0;
    return Math.round((levelWins(number, won) / level.challenges.length) * 100);
  }

  /** Mejor puntuación acumulada de un nivel (suma de los mejores de sus desafíos). */
  function levelBestScore(number, best) {
    const level = getLevel(number);
    if (!level) return 0;
    return level.challenges.reduce((sum, c) => sum + ((best && Number.isFinite(best[c.id])) ? best[c.id] : 0), 0);
  }

  function nextChallenge(id) {
    const i = CHALLENGES.findIndex((c) => c.id === id);
    return i >= 0 && i + 1 < CHALLENGES.length ? CHALLENGES[i + 1] : null;
  }

  const api = {
    LEVELS, CHALLENGES, getChallenge, getLevel, isValidId, levelWins, isLevelUnlocked,
    unlockedLevel, canStartChallenge, levelProgress, levelBestScore, nextChallenge
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else { g.LW = g.LW || {}; g.LW.levels = api; }
})(typeof window !== 'undefined' ? window : globalThis);
