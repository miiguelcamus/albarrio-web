// Menú móvil
(function () {
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.navlinks');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
})();

// Horario semanal y estado "abierto ahora" (hora de Madrid)
(function () {
  // 0 = domingo ... 6 = sábado. Minutos desde las 0:00. null = cerrado.
  var OPEN = 12 * 60, CLOSE = 24 * 60;
  var hours = { 0: [OPEN, CLOSE], 1: [OPEN, CLOSE], 2: null, 3: null, 4: [OPEN, CLOSE], 5: [OPEN, CLOSE], 6: [OPEN, CLOSE] };
  var order = [1, 2, 3, 4, 5, 6, 0];
  var names = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  var lower = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

  function fmt(m) { return m >= 1440 ? '24:00' : Math.floor(m / 60) + ':' + String(m % 60).padStart(2, '0'); }
  function label(d) { var h = hours[d]; return h ? fmt(h[0]) + ' – ' + fmt(h[1]) : 'Cerrado'; }

  function now() {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Madrid', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date());
    function get(t) { return parts.filter(function (p) { return p.type === t; })[0].value; }
    var day = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[get('weekday')];
    return { day: day, min: (parseInt(get('hour'), 10) % 24) * 60 + parseInt(get('minute'), 10) };
  }

  function state() {
    var n = now(), h = hours[n.day];
    if (h && n.min >= h[0] && n.min < h[1]) return { open: true, text: 'Abierto ahora · hasta las ' + fmt(h[1]) };
    if (h && n.min < h[0]) return { open: false, text: 'Cerrado ahora · abre hoy a las ' + fmt(h[0]) };
    for (var i = 1; i <= 7; i++) {
      var d = (n.day + i) % 7;
      if (hours[d]) return { open: false, text: 'Cerrado ahora · abre ' + (i === 1 ? 'mañana' : 'el ' + lower[d]) + ' a las ' + fmt(hours[d][0]) };
    }
    return { open: false, text: 'Cerrado ahora' };
  }

  function paint() {
    var n = now(), s = state();
    document.querySelectorAll('[data-open-badge]').forEach(function (b) {
      b.textContent = s.text;
      b.classList.toggle('is-open', s.open);
      b.classList.toggle('is-closed', !s.open);
    });
    var list = document.querySelector('[data-week-list]');
    var table = document.querySelector('[data-week-table]');
    if (list) list.innerHTML = order.map(function (d) {
      return '<li class="' + (d === n.day ? 'is-today ' : '') + (hours[d] ? '' : 'is-closed') + '"><span>' + names[d] + '</span><span>' + label(d) + '</span></li>';
    }).join('');
    if (table) table.innerHTML = order.map(function (d) {
      return '<tr class="' + (d === n.day ? 'is-today ' : '') + (hours[d] ? '' : 'is-closed') + '"><td>' + names[d] + '</td><td>' + label(d) + '</td></tr>';
    }).join('');
  }
  paint();
  setInterval(paint, 60000);
})();
