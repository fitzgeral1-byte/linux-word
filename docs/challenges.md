# Listado de los 50 desafíos

> Documento para docentes: **contiene todas las respuestas**. Generado a partir de `js/levels.js` y `js/hints.js`.

## Nivel 1 — Explorador de archivos

_Orientarse en el árbol de directorios y crear la estructura básica._

### 1.1 `pwd` (3 casillas)

- **Pista principal:** Te conectaste a un servidor y, tras saltar entre varias carpetas, ya no recuerdas dónde estás parado dentro del árbol de directorios. Necesitas imprimir la ruta completa, desde la raíz, del lugar donde trabajas ahora.
- **Pista conceptual:** Es una consulta sin efectos secundarios: no lista contenido ni cambia nada, solo informa de tu ubicación actual.
- **Pista avanzada:** Su nombre abrevia una frase inglesa de tres palabras. Existe como orden interna del intérprete y como programa independiente; con la opción -P resuelve los enlaces simbólicos.
- **Explicación:** La respuesta es pwd (print working directory). Imprime la ruta absoluta del directorio de trabajo. Sintaxis: pwd [-L|-P]. Por defecto (-L) muestra la ruta lógica; con -P resuelve los enlaces simbólicos. A diferencia de ls, no lista contenido; a diferencia de cd, no cambia nada: solo informa. Existe como orden interna de bash y también como programa independiente.

### 1.2 `ls` (2 casillas)

- **Pista principal:** Acabas de entrar en una carpeta desconocida y quieres ver qué archivos y subcarpetas contiene, incluyendo, si hiciera falta, sus permisos, tamaños y fechas de modificación en un formato detallado.
- **Pista conceptual:** Es la herramienta de inventario del contenido de un directorio; su salida puede ser mínima o muy detallada según las opciones.
- **Pista avanzada:** Con -a incluye los elementos ocultos (los que empiezan por un punto) y con -l añade columnas de permisos, propietario, tamaño y fecha. Su nombre tiene solo dos letras.
- **Explicación:** La respuesta es ls (list). Lista el contenido de un directorio. Sintaxis: ls [opciones] [ruta]. ls -la muestra todo en formato largo, ocultos incluidos. A diferencia de find, solo mira un nivel (salvo con -R) y no filtra con criterios complejos; a diferencia de pwd, informa del contenido y no de la ubicación.

### 1.3 `cd` (2 casillas)

- **Pista principal:** Necesitas pasar de /home/ana a /var/log para empezar a revisar archivos allí, sin abrir otra terminal. Lo que buscas modifica el lugar desde el que se ejecutarán tus siguientes órdenes.
- **Pista conceptual:** No es un programa independiente: lo resuelve el propio intérprete de órdenes porque debe alterar el estado de la sesión actual.
- **Pista avanzada:** Sin argumentos te lleva al directorio personal; con un guion como argumento vuelves al directorio anterior y con dos puntos subes un nivel.
- **Explicación:** La respuesta es cd (change directory). Cambia el directorio de trabajo de la sesión. Sintaxis: cd [ruta]. Es una orden interna del intérprete (no hay un programa /usr/bin/cd): un proceso hijo no podría alterar el directorio de su padre. cd sin argumentos va al directorio personal, cd - vuelve al anterior y cd .. sube un nivel.

### 1.4 `mkdir` (5 casillas)

- **Pista principal:** Vas a organizar un proyecto y necesitas crear la estructura vacía proyectos/2026/informes de una sola vez, incluyendo las carpetas intermedias que todavía no existen.
- **Pista conceptual:** Construye contenedores de archivos: carpetas nuevas, sin tocar ficheros.
- **Pista avanzada:** La opción -p crea toda la cadena de padres y evita errores si el directorio ya existe; falla si no tienes permiso de escritura en el directorio superior.
- **Explicación:** La respuesta es mkdir (make directory). Crea directorios. Sintaxis: mkdir [-p] ruta... Con -p crea toda la cadena de padres y no da error si ya existe. Se diferencia de touch en que crea carpetas, no archivos, y de rmdir en que construye en lugar de eliminar.

### 1.5 `touch` (5 casillas)

- **Pista principal:** Un script espera encontrar un archivo llamado registro.log aunque todavía esté vacío, y además necesitas actualizar la marca de tiempo de modificación de otro archivo ya existente sin alterar su contenido.
- **Pista conceptual:** Sirve tanto para crear ficheros vacíos como para modificar sus fechas de acceso y modificación.
- **Pista avanzada:** Si el archivo no existe lo genera con tamaño cero; si existe, solo cambia sus sellos temporales. Con -d o -t puedes fijar una fecha concreta.
- **Explicación:** La respuesta es touch. Crea archivos vacíos si no existen y, si existen, actualiza sus fechas de acceso y modificación. Sintaxis: touch [opciones] archivo... Con -d o -t se fija una fecha concreta. Se diferencia de mkdir (crea directorios) y de cat > archivo, que sí destruiría un contenido previo.

## Nivel 2 — Gestor de archivos

_Duplicar, mover, eliminar y localizar archivos y directorios._

### 2.1 `cp` (2 casillas)

- **Pista principal:** Antes de editar un archivo de configuración crítico, quieres conservar un duplicado idéntico con otro nombre, dejando el original en su lugar.
- **Pista conceptual:** Genera un duplicado: el origen permanece intacto y el destino contiene el mismo contenido.
- **Pista avanzada:** Para duplicar carpetas completas necesita la opción recursiva -r (o -a para preservar además los atributos); sin ella rechaza los directorios.
- **Explicación:** La respuesta es cp (copy). Duplica archivos y directorios. Sintaxis: cp [-r] origen destino. Sin -r rechaza los directorios; -a es recursivo y preserva atributos; -i pregunta antes de sobrescribir. A diferencia de mv, el original se conserva.

### 2.2 `mv` (2 casillas)

- **Pista principal:** Descargaste informe.pdf en la carpeta equivocada y necesitas trasladarlo a Documentos; con la misma orden podrías también cambiarle el nombre sin crear una segunda versión.
- **Pista conceptual:** Una única herramienta cubre dos tareas aparentemente distintas: cambiar de ubicación y cambiar de nombre.
- **Pista avanzada:** Dentro del mismo sistema de archivos solo reescribe la entrada del directorio, por lo que es casi instantáneo aunque el archivo sea enorme; entre sistemas distintos duplica y luego borra el origen.
- **Explicación:** La respuesta es mv (move). Mueve o renombra. Sintaxis: mv origen destino. Dentro del mismo sistema de archivos solo reescribe la entrada del directorio, por eso es casi instantáneo; entre sistemas distintos copia y luego borra. A diferencia de cp, no deja el original. Sobrescribe el destino salvo que uses -i o -n.

### 2.3 `rm` (2 casillas)

- **Pista principal:** Tras una prueba quedaron archivos temporales sin valor y quieres eliminarlos de forma definitiva; no existe papelera, así que un error en la ruta podría ser irreversible.
- **Pista conceptual:** Desvincula nombres de archivo del sistema de archivos; no los manda a ninguna papelera.
- **Pista avanzada:** Con -r actúa sobre directorios completos y con -i pide confirmación en cada elemento. Combinar -r y -f sobre una ruta mal escrita es una causa clásica de desastres.
- **Explicación:** La respuesta es rm (remove). Elimina nombres de archivo. Sintaxis: rm [-rfi] ruta... Con -r actúa sobre directorios y su contenido. No hay papelera ni deshacer. A diferencia de rmdir, borra archivos y árboles completos, no solo directorios vacíos.

### 2.4 `rmdir` (5 casillas)

- **Pista principal:** Reorganizando un servidor encontraste carpetas que quedaron vacías y quieres eliminarlas, con la garantía de que el sistema se negará a hacerlo si contienen algo.
- **Pista conceptual:** Es la versión prudente de borrar carpetas: solo funciona sobre directorios sin contenido.
- **Pista avanzada:** Con -p elimina también los directorios padre que queden vacíos tras borrar el hijo. Su error típico es «Directory not empty».
- **Explicación:** La respuesta es rmdir (remove directory). Elimina directorios vacíos. Sintaxis: rmdir [-p] directorio... Falla si el directorio no está vacío, lo que lo hace más seguro que rm -r. Con -p borra también los padres que queden vacíos.

### 2.5 `find` (4 casillas)

- **Pista principal:** Sabes que existe un archivo de configuración con extensión .conf en algún lugar de /etc, pero no recuerdas en qué subcarpeta; necesitas recorrer el árbol aplicando criterios como nombre, tamaño o fecha de modificación.
- **Pista conceptual:** Recorre jerarquías de directorios evaluando condiciones en tiempo real, sin depender de un índice previo.
- **Pista avanzada:** Admite criterios como -name, -mtime, -size o -type y acciones sobre los resultados mediante -exec. A diferencia de locate, no usa una base de datos precalculada.
- **Explicación:** La respuesta es find. Recorre árboles de directorios evaluando condiciones. Sintaxis: find ruta [criterios] [acción]; ejemplo: find /etc -name "*.conf". A diferencia de ls, filtra y es recursivo; a diferencia de locate, consulta el disco en vivo (más lento, pero siempre actualizado) en lugar de una base de datos precalculada. Pertenece al paquete findutils.

## Nivel 3 — Lectura de información

_Inspeccionar el contenido de archivos y flujos sin editarlos._

### 3.1 `cat` (3 casillas)

- **Pista principal:** Tienes un archivo de texto corto y quieres volcar su contenido completo en la pantalla; también podrías enlazar varios archivos en un único flujo de salida.
- **Pista conceptual:** Escribe en la salida estándar el contenido de uno o más ficheros, en orden y sin paginar.
- **Pista avanzada:** Con -n numera las líneas; con varios argumentos enlaza los ficheros uno tras otro. Es muy usado (a veces innecesariamente) al inicio de tuberías.
- **Explicación:** La respuesta es cat (concatenate). Escribe en la salida estándar el contenido de uno o más archivos, en orden. Sintaxis: cat [-n] archivo... Es adecuado para archivos cortos; con los largos conviene less. Se diferencia de head/tail en que muestra todo, y de less en que no pagina.

### 3.2 `less` (4 casillas)

- **Pista principal:** Abriste un registro de miles de líneas con una orden que lo volcó entero y se te perdió el inicio. Necesitas visualizarlo página por página, retroceder y buscar texto sin cargar todo en memoria.
- **Pista conceptual:** Es un visor paginado e interactivo para texto que permite avanzar y retroceder.
- **Pista avanzada:** Se maneja con la barra espaciadora y las flechas, q para salir y / para buscar hacia adelante. Su nombre bromea con el de un paginador más antiguo, de capacidades más limitadas.
- **Explicación:** La respuesta es less. Es un paginador interactivo. Sintaxis: less archivo. Teclas: espacio avanza, b retrocede, /texto busca, n repite la búsqueda y q sale. Se diferencia de cat en que no vuelca todo de golpe, y de su antecesor more en que permite retroceder. Con F sigue el archivo como tail -f. En contenedores mínimos puede no estar instalado.

### 3.3 `head` (4 casillas)

- **Pista principal:** Recibes un CSV gigantesco y solo necesitas confirmar rápidamente cómo se llaman las columnas mirando las primeras filas, sin abrir el archivo completo.
- **Pista conceptual:** Extrae el comienzo de un archivo o de una salida; por defecto, una cantidad fija de líneas.
- **Pista avanzada:** Muestra diez líneas por defecto; -n cambia la cantidad y, con un número negativo, descarta ese número de líneas del final. Su complemento muestra la parte opuesta.
- **Explicación:** La respuesta es head. Muestra el comienzo de un archivo (10 líneas por defecto). Sintaxis: head [-n N] [archivo]. Con -c N trabaja por bytes y con -n -N omite las últimas N líneas. Es el complemento de tail, que muestra el final.

### 3.4 `tail` (4 casillas)

- **Pista principal:** Una aplicación web está fallando y quieres observar en tiempo real las últimas entradas que va añadiendo a su registro, sin volver a abrirlo cada pocos segundos.
- **Pista conceptual:** Muestra el final de un archivo y puede quedarse esperando nuevos datos.
- **Pista avanzada:** Con -f sigue el archivo y muestra las líneas conforme se agregan; -F además lo reabre si es rotado. Por defecto devuelve diez líneas.
- **Explicación:** La respuesta es tail. Muestra el final de un archivo (10 líneas por defecto). Sintaxis: tail [-n N] [-f] archivo. Con -f sigue el archivo en vivo y con -F lo reabre si es rotado. Es el complemento de head.

### 3.5 `wc` (2 casillas)

- **Pista principal:** Necesitas saber cuántas líneas tiene una lista de usuarios exportada, o cuántas palabras tiene un texto, sin contarlas manualmente.
- **Pista conceptual:** Cuantifica el contenido de un flujo de texto: líneas, palabras y bytes.
- **Pista avanzada:** Con -l solo cuenta líneas, con -w palabras, con -c bytes y con -m caracteres; su salida por defecto muestra tres columnas más el nombre del archivo. Es habitual al final de una tubería.
- **Explicación:** La respuesta es wc (word count). Cuenta líneas, palabras y bytes. Sintaxis: wc [-lwcm] [archivo]. Ejemplo: ls | wc -l cuenta las entradas de un directorio. A diferencia de grep -c, cuenta todas las líneas del flujo y no solo las que coinciden con un patrón.

## Nivel 4 — Procesamiento de texto

_Filtrar, ordenar, contar repeticiones y extraer columnas: la base de las tuberías._

### 4.1 `grep` (4 casillas)

- **Pista principal:** Entre cientos de miles de líneas de un registro de autenticación, necesitas aislar solo aquellas que contienen la cadena «Failed password».
- **Pista conceptual:** Filtra líneas de texto según un patrón y muestra solo las coincidentes.
- **Pista avanzada:** Soporta expresiones regulares; -i ignora mayúsculas, -v invierte la selección, -r recorre directorios y -n muestra el número de línea.
- **Explicación:** La respuesta es grep. Filtra líneas que coinciden con un patrón. Sintaxis: grep [opciones] patrón [archivo...]. Opciones útiles: -i (ignora mayúsculas), -v (invierte), -r (recursivo), -n (número de línea), -E (expresiones regulares extendidas). A diferencia de find, busca dentro del contenido y no por nombre; a diferencia de sed o awk, solo selecciona líneas, no las transforma.

### 4.2 `sort` (4 casillas)

- **Pista principal:** Tienes una lista de nombres de clientes desordenada y necesitas presentarla alfabéticamente, o bien ordenar por valor numérico una columna de importes.
- **Pista conceptual:** Reorganiza las líneas de un flujo según un criterio de ordenación.
- **Pista avanzada:** Con -n compara numéricamente, con -r invierte el orden, con -k elige la columna clave y con -u elimina repetidos. Es el paso previo habitual cuando se quieren agrupar líneas iguales.
- **Explicación:** La respuesta es sort. Ordena líneas. Sintaxis: sort [-nrku] [archivo]. El orden alfabético depende de la configuración regional (LC_COLLATE), por lo que puede variar entre sistemas; -n compara numéricamente y -u elimina repetidos. Es el paso previo habitual de uniq, que solo detecta duplicados adyacentes.

### 4.3 `uniq` (4 casillas)

- **Pista principal:** Después de ordenar un registro de visitas, necesitas colapsar las líneas idénticas consecutivas y, además, saber cuántas veces se repitió cada una.
- **Pista conceptual:** Detecta repeticiones contiguas en un flujo de texto: las elimina o las cuenta.
- **Pista avanzada:** Solo reconoce duplicados en líneas adyacentes, por eso suele ir tras un ordenamiento; -c antepone el contador, -d muestra solo las repetidas y -u solo las únicas.
- **Explicación:** La respuesta es uniq. Filtra o cuenta líneas repetidas consecutivas. Sintaxis: sort archivo | uniq -c. Se diferencia de sort -u en que puede contar (-c) y mostrar solo las repetidas (-d) o solo las únicas (-u), pero únicamente ve duplicados adyacentes.

### 4.4 `cut` (3 casillas)

- **Pista principal:** De un archivo de cuentas del sistema necesitas extraer únicamente la primera columna (los nombres de usuario), tomando los dos puntos como separador.
- **Pista conceptual:** Recorta porciones verticales de cada línea: campos o rangos de caracteres.
- **Pista avanzada:** Con -d define el delimitador y con -f selecciona los campos; también opera por posición con -c o -b. No sabe tratar delimitadores de longitud variable, como varios espacios seguidos.
- **Explicación:** La respuesta es cut. Extrae porciones de cada línea. Sintaxis: cut -d":" -f1 /etc/passwd. Se diferencia de awk en que no admite separadores de longitud variable (como varios espacios) ni lógica condicional: es más simple y rápido.

### 4.5 `tr` (2 casillas)

- **Pista principal:** Necesitas convertir todo un texto de minúsculas a mayúsculas, o eliminar los retornos de carro de un archivo creado en otro sistema operativo, leyendo solo desde la entrada estándar.
- **Pista conceptual:** Reemplaza o suprime caracteres individuales de un flujo; no recibe archivos como argumento.
- **Pista avanzada:** Su sintaxis recibe conjuntos de caracteres (rangos o clases) y solo lee de la entrada estándar; -d elimina, -s comprime repeticiones y -c usa el complemento del conjunto.
- **Explicación:** La respuesta es tr (translate). Reemplaza o elimina caracteres de la entrada estándar. Sintaxis: tr "a-z" "A-Z" < archivo. -d borra caracteres y -s comprime repeticiones. A diferencia de sed, opera carácter a carácter (no con patrones de cadenas) y no acepta nombres de archivo como argumentos.

## Nivel 5 — Procesamiento avanzado

_Bifurcar flujos, construir órdenes dinámicas, editar en bloque y comparar._

### 5.1 `tee` (3 casillas)

- **Pista principal:** Ejecutas una instalación larga y quieres ver su salida en pantalla y, al mismo tiempo, guardarla en un archivo de registro, sin repetir la operación.
- **Pista conceptual:** Bifurca un flujo de datos: lo reenvía hacia dos destinos a la vez.
- **Pista avanzada:** Con -a añade al final en lugar de sobrescribir. Combinado con elevación de privilegios en el extremo receptor de una tubería, permite escribir en archivos protegidos.
- **Explicación:** La respuesta es tee. Copia la entrada estándar a un archivo y a la salida estándar. Sintaxis: orden | tee [-a] archivo. Truco clásico: echo "x" | sudo tee /etc/archivo, porque sudo echo x > archivo falla (la redirección la hace tu shell sin privilegios). A diferencia de la redirección >, también muestra la salida por pantalla.

### 5.2 `xargs` (5 casillas)

- **Pista principal:** Una búsqueda devolvió miles de nombres de archivo y necesitas aplicarles a todos otra orden que espera los nombres como argumentos, no como texto por la entrada estándar.
- **Pista conceptual:** Convierte líneas de entrada en argumentos de otra herramienta.
- **Pista avanzada:** Divide la lista en lotes para no superar el límite de argumentos; -0 acepta separadores nulos (compatible con -print0 del buscador de archivos) y -I permite sustituir un marcador por cada elemento.
- **Explicación:** La respuesta es xargs. Construye y ejecuta órdenes a partir de la entrada estándar. Sintaxis: find . -name "*.tmp" -print0 | xargs -0 rm. Divide en lotes para no superar el límite de argumentos. Se diferencia de la sustitución $(...) en que gestiona ese límite, y de find -exec en que puede agrupar muchos archivos por ejecución. Pertenece a findutils.

### 5.3 `sed` (3 casillas)

- **Pista principal:** Debes reemplazar la cadena «localhost» por una dirección IP en un archivo de configuración enorme, de manera automática y sin abrir un editor interactivo.
- **Pista conceptual:** Es un editor no interactivo: aplica transformaciones a las líneas a medida que pasan.
- **Pista avanzada:** Su comando más conocido es s/patrón/reemplazo/. Con -i modifica el archivo directamente y -n combinado con p imprime solo lo seleccionado.
- **Explicación:** La respuesta es sed (stream editor). Transforma texto línea a línea. Sintaxis: sed "s/viejo/nuevo/g" archivo. Con -i modifica el archivo en su sitio (conviene -i.bak para dejar copia). Se diferencia de tr (caracteres sueltos) y de awk (columnas y lógica de programación).

### 5.4 `awk` (3 casillas)

- **Pista principal:** Tienes un registro con columnas separadas por espacios y necesitas sumar los valores de la tercera columna, mostrando solo las filas donde la segunda supere cierto umbral.
- **Pista conceptual:** Es un lenguaje de procesamiento por patrones y acciones, orientado a registros y campos.
- **Pista avanzada:** Referencia campos como $1, $2 y $NF, mantiene variables y permite condiciones y bucles. Su nombre procede de las iniciales de sus tres autores. En Debian la implementación predeterminada suele ser mawk.
- **Explicación:** La respuesta es awk. Es un lenguaje de procesamiento por patrones y acciones. Sintaxis: awk "$2 > 10 { suma += $3 } END { print suma }" archivo. Se diferencia de cut en que admite condiciones, variables y aritmética. Particularidad en Debian: awk suele ser mawk por defecto; algunas extensiones de gawk (por ejemplo, ciertas funciones de tiempo) no existen en mawk, salvo que instales gawk.

### 5.5 `diff` (4 casillas)

- **Pista principal:** Dos versiones de un archivo de configuración se comportan distinto y necesitas ver exactamente qué líneas fueron añadidas, eliminadas o cambiadas entre ellas.
- **Pista conceptual:** Compara dos entradas y describe las discrepancias línea por línea.
- **Pista avanzada:** Con -u produce el formato unificado que consumen los parches y los sistemas de control de versiones; con -r compara directorios completos.
- **Explicación:** La respuesta es diff. Compara archivos línea a línea. Sintaxis: diff [-u] viejo nuevo. Con -u produce el formato unificado y con -r compara directorios. Código de salida 0 si son iguales y 1 si difieren. Se diferencia de cmp (compara byte a byte, ideal para binarios) y de comm (requiere entradas ordenadas).

## Nivel 6 — Procesos

_Observar, buscar, señalizar y priorizar procesos en ejecución._

### 6.1 `ps` (2 casillas)

- **Pista principal:** Sospechas que un programa quedó colgado y deseas obtener una instantánea, en un momento dado, de los procesos activos: quién los ejecuta, su identificador y cuánta memoria consumen.
- **Pista conceptual:** Captura una fotografía estática de los procesos; no se actualiza de forma continua.
- **Pista avanzada:** Acepta estilos de opciones BSD y UNIX; las combinaciones aux y -ef son las más utilizadas para listar todos los procesos del sistema.
- **Explicación:** La respuesta es ps (process status). Muestra una instantánea de los procesos. Sintaxis: ps aux o ps -ef. A diferencia de top, no se actualiza sola; a diferencia de pgrep, por sí mismo no filtra por nombre. Pertenece al paquete procps.

### 6.2 `top` (3 casillas)

- **Pista principal:** Un servidor va lento y quieres una pantalla que se refresque sola mostrando qué procesos consumen más procesador y memoria en este instante, con la posibilidad de ordenarlos o terminarlos desde ahí.
- **Pista conceptual:** Es un monitor interactivo en tiempo real, no una instantánea.
- **Pista avanzada:** Su cabecera muestra carga media, tareas y memoria; las teclas M y P ordenan por memoria o por CPU, k envía una señal y q sale. Su nombre tiene tres letras.
- **Explicación:** La respuesta es top. Es un monitor interactivo en tiempo real. Teclas: M ordena por memoria, P por CPU, k envía una señal, 1 despliega los núcleos y q sale. A diferencia de ps, se actualiza continuamente. Pertenece al paquete procps.

### 6.3 `pgrep` (5 casillas)

- **Pista principal:** Un script necesita obtener solo los números de identificación de los procesos de un servicio concreto, buscándolos por su nombre, sin tener que filtrar una tabla completa con otra herramienta.
- **Pista conceptual:** Busca procesos por patrón y devuelve únicamente sus identificadores.
- **Pista avanzada:** Con -u filtra por usuario, con -f busca en la línea de órdenes completa y con -l añade el nombre. Existe una pareja que, con el mismo criterio de selección, envía señales en lugar de listar.
- **Explicación:** La respuesta es pgrep. Devuelve los PID de los procesos cuyo nombre coincide con un patrón. Sintaxis: pgrep [-u usuario] [-f] patrón. Se diferencia de ps | grep en que no se encuentra a sí mismo y su salida son solo números. Su pareja pkill usa los mismos criterios para enviar señales.

### 6.4 `kill` (4 casillas)

- **Pista principal:** Un proceso no responde y debes pedirle que termine usando su identificador numérico; si ignora la petición amable, deberás recurrir a una señal que no se puede interceptar.
- **Pista conceptual:** Envía señales a procesos; terminar es solo su uso más frecuente.
- **Pista avanzada:** Por defecto envía la señal 15 (terminación ordenada); con -9 envía la señal que el proceso no puede ignorar y con -l lista todas las señales. Existe como orden interna del intérprete y como programa independiente.
- **Explicación:** La respuesta es kill. Envía una señal a un proceso identificado por su PID. Sintaxis: kill [-señal] PID. Sin opciones envía SIGTERM (15), un cierre ordenado; -9 (SIGKILL) fuerza la terminación sin posibilidad de limpieza. A diferencia de pkill y killall, selecciona por PID y no por nombre. Es orden interna de bash y existe además como programa independiente.

### 6.5 `nice` (4 casillas)

- **Pista principal:** Lanzarás una compresión muy pesada en un servidor compartido y quieres que ceda el procesador a otras tareas más importantes, iniciándola con una prioridad de planificación reducida.
- **Pista conceptual:** Ajusta la prioridad de CPU de un proceso frente al planificador en el momento de iniciarlo.
- **Pista avanzada:** Su valor va de -20 (más prioridad) a 19 (menos); solo root puede asignar valores negativos. Para un proceso ya iniciado se usa una herramienta hermana.
- **Explicación:** La respuesta es nice. Inicia un programa con una prioridad de planificación ajustada. Sintaxis: nice -n 10 orden. El rango va de -20 (más prioridad) a 19 (menos); solo root puede usar valores negativos. Para un proceso ya iniciado se usa renice. No limita la CPU: solo influye cuando hay competencia por ella.

## Nivel 7 — Diagnóstico del sistema

_Identificar el núcleo, la carga, la memoria y el uso de disco._

### 7.1 `uname` (5 casillas)

- **Pista principal:** Antes de instalar un controlador necesitas conocer la versión exacta del núcleo en ejecución y la arquitectura del procesador de la máquina.
- **Pista conceptual:** Informa de la identidad básica del sistema: núcleo, nombre de la máquina y arquitectura.
- **Pista avanzada:** Con -r muestra la versión del kernel, con -m la arquitectura y con -a reúne todo en una sola línea.
- **Explicación:** La respuesta es uname (unix name). Imprime información básica del sistema. Sintaxis: uname [-a|-r|-m|-n]. -r da la versión del kernel y -m la arquitectura. No informa de la distribución: para eso existe /etc/os-release. hostnamectl muestra datos similares y además permite modificarlos.

### 7.2 `uptime` (6 casillas)

- **Pista principal:** Quieres saber cuánto tiempo lleva encendido el servidor desde el último arranque, cuántos usuarios hay conectados y qué carga media tuvo en los últimos minutos.
- **Pista conceptual:** Resume en una sola línea la actividad temporal del sistema.
- **Pista avanzada:** Muestra tres valores de carga media (1, 5 y 15 minutos) y con -p ofrece el tiempo encendido en formato legible. Su información procede de un pseudoarchivo del directorio /proc.
- **Explicación:** La respuesta es uptime. Resume en una línea la hora, el tiempo encendido, los usuarios y la carga media (1, 5 y 15 minutos). Una carga sostenida mayor que el número de CPU sugiere saturación. Se diferencia de w (que además lista sesiones) y de who -b (que solo da la fecha del arranque).

### 7.3 `free` (4 casillas)

- **Pista principal:** Un servicio se cierra por falta de memoria y necesitas ver cuánta RAM y cuánta área de intercambio están en uso, y cuánta se encuentra disponible para nuevas aplicaciones.
- **Pista conceptual:** Resume el estado de la memoria física y del área de intercambio.
- **Pista avanzada:** Con -h usa unidades legibles. La columna «available» estima la memoria utilizable sin recurrir al intercambio, y es más fiable que la columna que solo cuenta las páginas completamente sin usar.
- **Explicación:** La respuesta es free. Muestra la memoria física y el intercambio (swap). Sintaxis: free [-h]. La columna «available» es la estimación realista de memoria utilizable: Linux emplea la RAM sobrante como caché, así que una columna «free» baja no es un problema por sí sola. Se diferencia de df/du (disco) y de top (consumo por proceso).

### 7.4 `df` (2 casillas)

- **Pista principal:** Un servidor está quedándose sin espacio y necesitas conocer la capacidad, el uso y el espacio restante de cada sistema de archivos montado, sin calcular individualmente el tamaño de los directorios.
- **Pista conceptual:** Informa a nivel de sistema de archivos o partición, no de carpetas concretas.
- **Pista avanzada:** Con -h usa unidades legibles, con -T añade el tipo de sistema de archivos y con -i muestra el uso de inodos; su columna «Mounted on» indica el punto de montaje.
- **Explicación:** La respuesta es df (disk free). Informa del espacio por sistema de archivos montado. Sintaxis: df [-hTi]. Se diferencia de du: df pregunta al sistema de archivos (capacidad, usado, disponible) mientras que du suma el tamaño de lo que encuentra al recorrer el árbol. Pueden discrepar, por ejemplo, con archivos borrados pero aún abiertos por un proceso.

### 7.5 `du` (2 casillas)

- **Pista principal:** Un directorio ocupa demasiado almacenamiento y necesitas averiguar cuánto espacio consumen sus subcarpetas para localizar dónde se concentra el problema.
- **Pista conceptual:** Estima el espacio consumido por archivos y directorios recorriendo su contenido.
- **Pista avanzada:** Con -s resume un total por argumento, con -h usa unidades legibles y con --max-depth limita la profundidad. Combinado con una ordenación numérica permite crear un ranking de los mayores consumidores.
- **Explicación:** La respuesta es du (disk usage). Estima el espacio usado por archivos y directorios. Sintaxis: du [-sh] [--max-depth=N] ruta. Ejemplo de ranking: du -h --max-depth=1 /var | sort -h. Se diferencia de df, que informa de la capacidad del sistema de archivos completo y no de directorios concretos.

## Nivel 8 — Usuarios y permisos

_Identidades, grupos, permisos de acceso y propiedad de archivos._

### 8.1 `whoami` (6 casillas)

- **Pista principal:** Trabajas en una sesión con varias elevaciones de privilegios y necesitas confirmar, con la salida más corta posible, bajo qué nombre de usuario efectivo se ejecutan tus órdenes.
- **Pista conceptual:** Responde con una sola palabra: el usuario efectivo de la sesión.
- **Pista avanzada:** Equivale a una consulta más general con las opciones -un. Invocado tras elevar privilegios con sudo, responde root.
- **Explicación:** La respuesta es whoami. Imprime el nombre del usuario efectivo. Sintaxis: whoami. Tras un sudo muestra root. Se diferencia de id (UID, GID y grupos) y de who/logname (usuarios con sesión abierta y usuario original de la sesión).

### 8.2 `id` (2 casillas)

- **Pista principal:** Un usuario no puede escribir en un directorio compartido y necesitas ver su identificador numérico, su grupo principal y la lista completa de grupos a los que pertenece.
- **Pista conceptual:** Muestra las identidades numéricas y los grupos de un usuario.
- **Pista avanzada:** Con -u imprime solo el UID, con -g el GID principal y con -G todos los grupos; sin argumentos describe al usuario que lo ejecuta y con un nombre consulta a otro. Su nombre tiene solo dos letras.
- **Explicación:** La respuesta es id. Muestra UID, GID y grupos. Sintaxis: id [-u|-g|-G] [-n] [usuario]. Se diferencia de whoami (solo el nombre) y de groups (solo los grupos). Tras añadir a alguien a un grupo, la sesión abierta no lo refleja hasta volver a iniciarla.

### 8.3 `chmod` (5 casillas)

- **Pista principal:** Un script recién descargado responde «Permission denied» al ejecutarlo; necesitas habilitar el bit de ejecución para su propietario sin modificar el resto de los permisos.
- **Pista conceptual:** Cambia el modo de acceso de archivos y directorios: lectura, escritura y ejecución.
- **Pista avanzada:** Admite notación simbólica (u+x, go-w) y octal (755, 640); con -R se aplica de forma recursiva.
- **Explicación:** La respuesta es chmod (change mode). Cambia los permisos de archivos y directorios. Sintaxis: chmod u+x script.sh o chmod 640 archivo. Admite notación simbólica y octal; -R es recursivo. Se diferencia de chown, que cambia el propietario. Precaución: chmod -R 777 es mala práctica porque da acceso total a todos.

### 8.4 `chown` (5 casillas)

- **Pista principal:** Tras restaurar una copia de seguridad, los archivos de la aplicación pertenecen a root y el servicio, que corre con otro usuario, no puede escribir en ellos; necesitas reasignar el propietario y el grupo.
- **Pista conceptual:** Transfiere la titularidad de archivos a otro usuario o grupo; requiere privilegios.
- **Pista avanzada:** Usa la forma usuario:grupo, con -R recorre directorios y con --reference toma la propiedad de otro archivo. Normalmente solo root puede cambiar el propietario.
- **Explicación:** La respuesta es chown (change owner). Cambia el propietario y el grupo. Sintaxis: chown usuario:grupo archivo; -R es recursivo. Normalmente requiere privilegios de root. Se diferencia de chmod (permisos) y de chgrp (solo el grupo).

### 8.5 `usermod` (7 casillas)

- **Pista principal:** Una empleada ya tiene cuenta en el sistema y debes añadirla a un grupo adicional sin quitarle los que ya posee, o cambiar su intérprete de órdenes por defecto.
- **Pista conceptual:** Modifica atributos de una cuenta de usuario existente; no la crea ni la elimina.
- **Pista avanzada:** La combinación -aG añade grupos suplementarios sin reemplazar los existentes (omitir -a los sobrescribe); -s cambia el intérprete de órdenes y -L bloquea la cuenta. Se ubica en /usr/sbin (según la versión de Debian, puede no estar en tu PATH) y requiere privilegios.
- **Explicación:** La respuesta es usermod. Modifica una cuenta de usuario existente. Sintaxis: usermod -aG grupo usuario. Sin -a, la opción -G reemplaza todos los grupos suplementarios. Se diferencia de useradd (crea cuentas), de adduser (script interactivo propio de Debian) y de passwd (contraseña). Reside en /usr/sbin, que según la versión de Debian puede no estar en el PATH de un usuario normal.

## Nivel 9 — Servicios y systemd

_Gestionar servicios, leer registros, medir el arranque y manejar sesiones._

### 9.1 `systemctl` (9 casillas)

- **Pista principal:** Tras un reinicio, el servidor web no atiende peticiones. Necesitas comprobar si su unidad de servicio está activa o fallida, y disponer de operaciones para iniciarla, detenerla, recargarla o habilitarla en el arranque.
- **Pista conceptual:** Es la interfaz de control del administrador de servicios principal de Debian.
- **Pista avanzada:** Sus subcomandos status, start, stop, restart, enable y disable operan sobre unidades; con list-units enumera las cargadas y con --failed filtra las que fallaron. Tiene nueve letras.
- **Explicación:** La respuesta es systemctl. Controla el gestor de servicios systemd. Sintaxis: systemctl status|start|stop|restart|enable|disable unidad. Se diferencia de journalctl (que lee registros) y de service (capa de compatibilidad). Depende de que el sistema use systemd como init: es lo habitual en Debian, pero no en la mayoría de los contenedores.

### 9.2 `journalctl` (10 casillas)

- **Pista principal:** Un servicio falló hace una hora y no dejó ningún archivo de texto con sus mensajes; necesitas consultar el registro binario centralizado del sistema, filtrando por unidad y por intervalo de tiempo.
- **Pista conceptual:** Lee el registro binario estructurado que mantiene el gestor de servicios; no es un archivo de texto plano.
- **Pista avanzada:** Con -u filtra por unidad, con -b limita al arranque actual, con -f sigue en vivo, con -p filtra por prioridad y con --since o --until acota fechas. Si no existe el directorio de almacenamiento persistente, el registro se pierde al reiniciar.
- **Explicación:** La respuesta es journalctl. Consulta el registro de systemd-journald. Sintaxis: journalctl -u unidad --since "1 hour ago". En Debian, que el registro persista tras reiniciar depende de que exista /var/log/journal (o de configurar Storage=persistent). Se diferencia de leer /var/log con cat o tail, que son archivos de texto plano, por ejemplo los de rsyslog.

### 9.3 `systemd-analyze` (15 casillas)

- **Pista principal:** Tu servidor tarda varios minutos en arrancar y quieres saber cuánto pasó en el núcleo, cuánto en el espacio de usuario y qué unidades retrasaron más el proceso.
- **Pista conceptual:** Examina los tiempos del arranque del gestor de servicios y qué unidades lo retrasan.
- **Pista avanzada:** Sus subcomandos blame y critical-chain ordenan las unidades por tiempo y por cadena crítica; verify comprueba la sintaxis de archivos de unidad y security evalúa su nivel de endurecimiento. Su nombre contiene un guion.
- **Explicación:** La respuesta es systemd-analyze (incluye el guion). Examina el rendimiento del arranque. Sintaxis: systemd-analyze [time|blame|critical-chain|verify|security]. Se diferencia de journalctl -b (mensajes del arranque) y de uptime (solo el tiempo encendido). Requiere systemd como init.

### 9.4 `hostnamectl` (11 casillas)

- **Pista principal:** Necesitas consultar y cambiar de forma persistente el nombre de la máquina, y ver además datos como el chasis, el sistema operativo y el núcleo, mediante la interfaz del gestor de servicios.
- **Pista conceptual:** Consulta y modifica la identidad de la máquina: nombres y metadatos de despliegue.
- **Pista avanzada:** Con el subcomando de asignación de nombre fija el nombre estático, y distingue entre nombre estático, transitorio y «bonito». Sin argumentos muestra un resumen de estado.
- **Explicación:** La respuesta es hostnamectl. Consulta y modifica el nombre de la máquina y sus metadatos. Sintaxis: hostnamectl [set-hostname NOMBRE]. Se diferencia de hostname, que cambia solo el nombre transitorio y no persiste al reiniciar, y de uname -n, que solo lo muestra. Requiere systemd.

### 9.5 `loginctl` (8 casillas)

- **Pista principal:** Quieres ver quién tiene sesiones abiertas en el equipo, a qué asiento pertenecen y terminar de golpe todas las sesiones de un usuario, usando la interfaz del gestor de sesiones.
- **Pista conceptual:** Controla el gestor de sesiones de usuario del sistema: sesiones, asientos y usuarios conectados.
- **Pista avanzada:** Sus subcomandos list-sessions, show-user, terminate-session y lock-session operan sobre sesiones y usuarios; permite además activar la persistencia de procesos de un usuario tras cerrar su sesión (linger).
- **Explicación:** La respuesta es loginctl. Gestiona sesiones, asientos y usuarios de systemd-logind. Sintaxis: loginctl list-sessions | terminate-user USUARIO | enable-linger USUARIO. Se diferencia de who y w, que solo leen, y de systemctl, que gestiona unidades. Requiere systemd.

## Nivel 10 — Administración remota

_Conexión cifrada, transferencia, sincronización y empaquetado de datos._

### 10.1 `ssh` (3 casillas)

- **Pista principal:** Debes administrar un servidor situado en otro continente: necesitas abrir una sesión interactiva de órdenes en él a través de un canal cifrado, autenticándote con tu clave.
- **Pista conceptual:** Cliente de conexión remota con cifrado, sucesor seguro de las herramientas históricas que enviaban todo en claro.
- **Pista avanzada:** Usa por defecto el puerto 22, se identifica con claves guardadas en un directorio oculto de tu usuario y permite túneles con -L y -D; con -i selecciona la clave privada y con -p el puerto. Tiene tres letras.
- **Explicación:** La respuesta es ssh (secure shell). Abre una sesión remota cifrada. Sintaxis: ssh [-p puerto] [-i clave] usuario@servidor. Admite túneles con -L y -D. Se diferencia de telnet (sin cifrado) y de scp/sftp (que transfieren archivos). Viene en el paquete openssh-client, que puede faltar en instalaciones mínimas.

### 10.2 `scp` (3 casillas)

- **Pista principal:** Necesitas enviar un archivo local a otro servidor con una sola línea, sin abrir una sesión interactiva, utilizando el mismo canal cifrado de la administración remota.
- **Pista conceptual:** Duplica archivos entre máquinas con la lógica de origen y destino de la orden de duplicado local.
- **Pista avanzada:** El destino remoto se escribe usuario@servidor:ruta; con -r transfiere directorios y con -P (mayúscula) indica el puerto. En versiones recientes de OpenSSH usa internamente el protocolo SFTP.
- **Explicación:** La respuesta es scp (secure copy). Duplica archivos entre máquinas. Sintaxis: scp [-r] [-P puerto] origen usuario@servidor:destino. Se diferencia de rsync (transferencia incremental) y de sftp (interactivo). Particularidad: desde OpenSSH 9.0 scp usa por defecto el protocolo SFTP internamente, y su documentación recomienda sftp o rsync para usos nuevos.

### 10.3 `sftp` (4 casillas)

- **Pista principal:** Necesitas explorar el sistema de archivos de un servidor remoto de forma interactiva: listar directorios, navegar, descargar y subir ficheros dentro de un mismo canal cifrado.
- **Pista conceptual:** Cliente interactivo de transferencia de archivos, con órdenes propias para subir y bajar ficheros.
- **Pista avanzada:** Ofrece un prompt con órdenes get, put, ls, cd y lcd (cambiar el directorio local). No es el FTP clásico: viaja sobre el canal cifrado, sin necesidad de abrir otro puerto.
- **Explicación:** La respuesta es sftp (secure file transfer protocol). Es un cliente interactivo de transferencia. Sintaxis: sftp usuario@servidor; dentro: ls, cd, lcd, get, put. No es el FTP clásico ni FTPS: viaja por el canal cifrado, sin abrir otro puerto. Se diferencia de scp (una sola línea, no interactivo) y de ftp (sin cifrado).

### 10.4 `rsync` (5 casillas)

- **Pista principal:** Debes mantener sincronizada una carpeta de 200 GB con un servidor de respaldo; tras la primera copia, cada ejecución debería transferir únicamente lo que cambió y poder reanudarse si se corta.
- **Pista conceptual:** Sincroniza árboles de archivos usando un algoritmo de diferencias para minimizar los datos transferidos.
- **Pista avanzada:** Con -a conserva permisos, fechas y enlaces; --delete elimina en el destino lo que ya no existe en el origen, -n simula la operación y --progress muestra el avance. Una barra final en el origen cambia lo que se copia.
- **Explicación:** La respuesta es rsync (remote sync). Sincroniza de forma incremental. Sintaxis: rsync -avz --progress origen/ usuario@servidor:destino/. Una barra final en el origen copia su contenido; sin ella, copia la carpeta misma. --delete borra en destino lo que ya no existe en origen: pruébalo antes con -n (simulación). Se diferencia de cp/scp, que copian todo siempre. En Debian no siempre viene instalado (apt install rsync).

### 10.5 `tar` (3 casillas)

- **Pista principal:** Necesitas empaquetar un directorio completo en un solo archivo, comprimiéndolo con gzip, para enviarlo por correo; luego, en otro equipo, extraer su contenido conservando permisos.
- **Pista conceptual:** Agrupa muchos archivos en uno solo; por sí mismo no comprime.
- **Pista avanzada:** Opciones esenciales: c crea, x extrae, t lista, f nombra el archivo y z, j o J activan gzip, bzip2 o xz. Heredó su nombre de los respaldos en cinta magnética.
- **Explicación:** La respuesta es tar (tape archive). Agrupa muchos archivos en uno solo. Sintaxis: tar czf copia.tar.gz carpeta/ (crear), tar xzf copia.tar.gz (extraer), tar tf copia.tar.gz (listar). Por sí mismo no comprime: z, j y J delegan en gzip, bzip2 y xz. Se diferencia de zip (empaqueta y comprime a la vez) y de gzip (comprime un solo archivo, sin agrupar).

