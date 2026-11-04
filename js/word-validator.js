/*
 * word-validator.js
 * Normalización, validación de longitud y diccionario de comandos admitidos.
 * Funciona en el navegador (window.LW.validator) y en Node (require).
 */
(function (g) {
  'use strict';

  // Diccionario ampliado: comandos reales de Linux/Debian formados solo por
  // letras a-z y guiones (el teclado del juego no tiene dígitos ni guion bajo).
  // NO es exhaustivo: ver docs/teacher-guide.md (limitaciones).
  const EXTRA_COMMANDS = `
    addgroup adduser alias apropos apt apt-cache apt-file apt-get apt-key apt-mark aptitude
    ar arch aspell at atq atrm badblocks base basename bash batch bc bg bind blkid bzip bunzip
    bzcat bzip cal cat chage chattr chgrp chmod chpasswd chroot chsh chvt cksum clear cmp col
    column comm command compgen complete cpio cron crontab csplit curl cut date dd deluser
    depmod dig dir dircolors dirname dmesg dnsdomainname dpkg dpkg-deb dpkg-query dpkg-reconfigure
    dumpe echo ed egrep eject env ethtool exec exit expand export expr factor fallocate false
    fc fdisk fg fgrep file fmt fold fsck ftp function fuser gawk gcc getconf getent getfacl
    getopts gpasswd gpg grep groupadd groupdel groupmod groups grub-install gunzip gzip halt
    hash hdparm help hexdump history host hostid hostname htop hwclock iconv iftop ifconfig
    ifdown ifup init insmod install ionice iostat ip iptables iwconfig jobs join journal
    kdump killall last lastb lastlog ldconfig ldd let link ln locale locate logger login logname
    logout logrotate losetup ls lsattr lsblk lscpu lsmod lsof lspci lsusb lsb-release m make
    man mesg mkdir mkfifo mkfs mknod mkswap mktemp modinfo modprobe more mount mountpoint
    mpstat mtr nano nc ncdu neofetch netcat netstat newgrp nft nl nm nmap nmcli nohup nologin
    nproc nslookup objdump od openssl passwd paste patch pathchk perl pidof pidstat ping pinky
    pkill pmap popd poweroff pr printenv printf ptx pushd pstree pwck pwgen python rar read
    readelf readlink realpath reboot rename renice reset resize restore rev rgrep rlogin rm
    rmmod route rpm rsyslogd run-parts runlevel scp screen script sdiff seq service setfacl
    set setsid sg sh sha-sum shred shuf shutdown size skill sleep slabtop slogin snice socat
    source split ss ssh-add ssh-agent ssh-copy-id ssh-keygen ssh-keyscan sshd stat stdbuf strace
    strings strip stty su sudo sum suspend swapoff swapon sync sysctl systemd-run tac tailf
    talk tcpdump telnet test tftp time timedatectl timeout times tload tmux touch tput tracepath
    traceroute trap tree true truncate tset tsort tty type udevadm ulimit umask umount unalias
    uname unexpand unlink unrar unset unshare unxz unzip update-alternatives update-grub
    update-initramfs update-rc update-rc-d updatedb useradd userdel usleep vdir vi vigr vim
    vipw visudo vmstat w wait wall watch wdctl wget whatis whereis which who write xxd xz xzcat
    yes zcat zdiff zgrep zip zipinfo zless zmore zsh
    busctl bootctl coredumpctl localectl machinectl networkctl oomctl portablectl resolvectl
    systemd-cgls systemd-cgtop systemd-detect-virt systemd-escape systemd-inhibit systemd-mount
    systemd-path systemd-resolve systemd-tmpfiles systemd-umount
  `.split(/\s+/).filter(Boolean);

  // Palabras de la lista anterior que NO son comandos (fragmentos usados como ayuda
  // de escritura) se eliminan para mantener un diccionario honesto.
  const NOT_COMMANDS = new Set([
    'base', 'bzip', 'dumpe', 'm', 'sha-sum', 'journal', 'update-rc', 'function', 'size', 'kdump',
    'lsb-release', 'update-rc-d', 'tailf', 'apt-file', 'sum', 'set', 'run-parts',
    'bunzip', 'python', 'talk', 'slogin', 'rlogin', 'rar', 'unrar', 'restore', 'sg', 'tset',
    'chvt', 'pwck', 'ptx', 'tload', 'wdctl', 'kdump', 'apt-key', 'bind'
  ]);

  // Comandos que ya están como objetivos del juego (se completan en levels.js al
  // construir el diccionario; aquí se incluyen para poder usar el validador solo).
  const TARGET_COMMANDS = [
    'pwd', 'ls', 'cd', 'mkdir', 'touch', 'cp', 'mv', 'rm', 'rmdir', 'find',
    'cat', 'less', 'head', 'tail', 'wc', 'grep', 'sort', 'uniq', 'cut', 'tr',
    'tee', 'xargs', 'sed', 'awk', 'diff', 'ps', 'top', 'pgrep', 'kill', 'nice',
    'uname', 'uptime', 'free', 'df', 'du', 'whoami', 'id', 'chmod', 'chown', 'usermod',
    'systemctl', 'journalctl', 'systemd-analyze', 'hostnamectl', 'loginctl',
    'ssh', 'scp', 'sftp', 'rsync', 'tar'
  ];

  const DICTIONARY = new Set();
  EXTRA_COMMANDS.forEach((w) => { if (!NOT_COMMANDS.has(w)) DICTIONARY.add(w); });
  TARGET_COMMANDS.forEach((w) => DICTIONARY.add(w));

  const MESSAGES = {
    length: (n) => 'El comando debe tener exactamente ' + n + ' caracteres.',
    notInDictionary: 'Esta palabra no está incluida en el diccionario del juego. Prueba con otro comando.',
    validButWrong: 'El comando es válido, pero no corresponde a la solución de este desafío.',
    empty: 'Escribe un comando antes de confirmar.',
    repeated: 'Ya probaste ese comando en este desafío.'
  };

  /** Quita espacios en los extremos y pasa a minúsculas. Conserva guiones y caracteres internos. */
  function normalize(raw) {
    if (raw === null || raw === undefined) return '';
    return String(raw).normalize('NFC').trim().toLowerCase();
  }

  /** Longitud en caracteres (cada guion cuenta como una casilla). */
  function lengthOf(word) {
    return Array.from(word).length;
  }

  function hasValidLength(word, expected) {
    return lengthOf(word) === expected;
  }

  function isInDictionary(word) {
    return DICTIONARY.has(normalize(word));
  }

  /**
   * Valida una hipótesis frente a la longitud esperada y al diccionario.
   * Devuelve { valid, code, guess, message }.
   *   code: 'empty' | 'length' | 'not-in-dictionary' | 'ok'
   */
  function validateGuess(raw, expectedLength) {
    const guess = normalize(raw);
    if (guess.length === 0) return { valid: false, code: 'empty', guess, message: MESSAGES.empty };
    if (!hasValidLength(guess, expectedLength)) {
      return { valid: false, code: 'length', guess, message: MESSAGES.length(expectedLength) };
    }
    if (!DICTIONARY.has(guess)) {
      return { valid: false, code: 'not-in-dictionary', guess, message: MESSAGES.notInDictionary };
    }
    return { valid: true, code: 'ok', guess, message: '' };
  }

  const api = {
    DICTIONARY, MESSAGES, normalize, lengthOf, hasValidLength, isInDictionary, validateGuess,
    dictionarySize: () => DICTIONARY.size
  };

  if (typeof module === 'object' && module.exports) module.exports = api;
  else { g.LW = g.LW || {}; g.LW.validator = api; }
})(typeof window !== 'undefined' ? window : globalThis);
