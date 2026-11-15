'use strict';
// ---------- Grundlagen ----------
const $ = s => document.querySelector(s);
const app = $('#app');
const NS = 'http://www.w3.org/2000/svg';
const zufall = n => Math.floor(Math.random() * n);
const nimm = a => a[zufall(a.length)];
const mische = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = zufall(i + 1); const t = a[i]; a[i] = a[j]; a[j] = t; } return a; };
const heute = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };

// ---------- Speicher (nur auf diesem Gerät) ----------
const GRUND = { name: '', sterne: 0, konto: 0, tag: { datum: '', sterne: 0 }, tagesziel: 15, zahlenraum: 20, stufen: {}, statistik: {}, kamil: { gefuettert: '', sachen: [], an: [] }, stimme: '', tempo: 0.85 };
let S;
try { S = Object.assign({}, GRUND, JSON.parse(localStorage.getItem('lernwelt') || '{}')); } catch (e) { S = Object.assign({}, GRUND); }
function sichern() { try { localStorage.setItem('lernwelt', JSON.stringify(S)); } catch (e) {} }

// ---------- Sprache und Töne ----------
let stimmen = [];
function ladeStimmen() { try { stimmen = speechSynthesis.getVoices() || []; } catch (e) {} }
if ('speechSynthesis' in window) { ladeStimmen(); try { speechSynthesis.onvoiceschanged = ladeStimmen; } catch (e) {} }
function sprich(text, lang) {
  lang = lang || 'de-DE';
  if (!text || !('speechSynthesis' in window)) return;
  try {
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang; u.rate = S.tempo;
    const kurz = lang.slice(0, 2);
    let v = null;
    if (kurz === 'de' && S.stimme) v = stimmen.find(x => x.name === S.stimme);
    if (!v) v = stimmen.find(x => (x.lang || '').replace('_', '-').toLowerCase().indexOf(kurz) === 0);
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  } catch (e) {}
}
let ac = null;
function ton(folge) {
  try {
    ac = ac || new (window.AudioContext || window.webkitAudioContext)();
    let t = ac.currentTime;
    folge.forEach(([f, d]) => {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.18, t); g.gain.exponentialRampToValueAtTime(0.001, t + d);
      o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d);
      t += d * 0.85;
    });
  } catch (e) {}
}
const TON_RICHTIG = [[660, .12], [880, .22]], TON_FALSCH = [[240, .25]], TON_JUBEL = [[523, .13], [659, .13], [784, .13], [1046, .35]], TON_KLICK = [[700, .06]];

// ---------- Ablauf ----------
let uhrwerk = [];
function spaeter(fn, ms) { uhrwerk.push(setTimeout(fn, ms)); }
function stoppeAlles() { uhrwerk.forEach(clearTimeout); uhrwerk = []; try { speechSynthesis.cancel(); } catch (e) {} }

function kopf(titel) {
  if (titel !== undefined) $('#titel').textContent = titel;
  $('#sterne').textContent = '⭐ ' + S.konto;
  const t = S.tag.datum === heute() ? S.tag.sterne : 0;
  $('#ziel').style.width = Math.min(100, t / S.tagesziel * 100) + '%';
}
function hinweis(text, ms) {
  const h = $('#hinweis'); h.innerHTML = text; h.classList.add('an');
  clearTimeout(hinweis.t); hinweis.t = setTimeout(() => h.classList.remove('an'), ms || 1800);
}
function stern(anzahl) {
  anzahl = anzahl || 1;
  if (S.tag.datum !== heute()) S.tag = { datum: heute(), sterne: 0 };
  const vorher = S.tag.sterne;
  S.sterne += anzahl; S.konto += anzahl; S.tag.sterne += anzahl;
  sichern(); kopf();
  if (vorher < S.tagesziel && S.tag.sterne >= S.tagesziel) {
    setTimeout(() => { ton(TON_JUBEL); hinweis('🏆 Tagesziel geschafft!', 3000); sprich('Mascha Allah, ' + S.name + '! Du hast dein Tagesziel geschafft!'); }, 1200);
  }
}
function stufe(spiel) { return S.stufen[spiel] || 1; }
function werte(spiel, richtig) {
  let st = S.statistik[spiel];
  if (!st) st = S.statistik[spiel] = { r: 0, f: 0, folge: 0, fehler: 0 };
  if (richtig) {
    st.r++; st.folge++; st.fehler = 0;
    if (st.folge >= 5 && stufe(spiel) < 3) { S.stufen[spiel] = stufe(spiel) + 1; st.folge = 0; spaeter(() => hinweis('⬆️ Nächste Stufe!'), 900); }
  } else {
    st.f++; st.folge = 0; st.fehler++;
    if (st.fehler >= 3 && stufe(spiel) > 1) { S.stufen[spiel] = stufe(spiel) - 1; st.fehler = 0; }
  }
  sichern();
}
const LOB = ['Super!', 'Toll gemacht!', 'Klasse!', 'Richtig!', 'Mascha Allah!', 'Prima!', 'Sehr gut!', 'Wunderbar!'];
const lob = () => zufall(4) === 0 && S.name ? 'Super, ' + S.name + '!' : nimm(LOB);

function bild(b) {
  if (b.indexOf('svg:') === 0) return '<svg viewBox="0 0 100 100" class="svgbild">' + BILDER[b.slice(4)] + '</svg>';
  return '<span class="emoji">' + b + '</span>';
}

let aktWelt = null;
// Zeigt eine Spielfläche mit Zurück- und Vorlese-Knopf; die Ansage wird automatisch gesprochen.
function zeige(html, ansage, sprache, zurueck) {
  stoppeAlles();
  app.innerHTML = '<div class="werkzeug"><button class="rund" id="zurueck" aria-label="Zurück">⬅️</button>' +
    (ansage ? '<button class="rund" id="hoeren" aria-label="Vorlesen">🔊</button>' : '') + '</div>' + html;
  $('#zurueck').onclick = () => { ton(TON_KLICK); (zurueck || (() => aktWelt ? welt(aktWelt) : start()))(); };
  if (ansage) { $('#hoeren').onclick = () => sprich(ansage, sprache); spaeter(() => sprich(ansage, sprache), 300); }
  window.scrollTo(0, 0);
}

// ---------- Startseite ----------
const WELTEN = [
  { id: 'name', name: 'Mein Name', em: '✍️', farbe: '#ffccbc', spiele: [['mein-name', 'Name nachspuren', '✍️'], ['name-legen', 'Name legen', '🧩'], ['name-schreiben', 'Name ganz schreiben', '🖊️']] },
  { id: 'buchstaben', name: 'Buchstaben', em: '🔤', farbe: '#b3e5fc', spiele: [['tafel', 'Buchstaben-Tafel', '📋'], ['kennen', 'Buchstaben finden', '🔎'], ['gross-klein', 'Groß und klein', '🔠'], ['anlaut', 'Womit fängt es an?', '👂'], ['spur-gross', 'GROSSE nachspuren', '✏️'], ['spur-klein', 'kleine nachspuren', '✏️']] },
  { id: 'lesen', name: 'Lesen', em: '📖', farbe: '#c8e6c9', spiele: [['silben', 'Silben hören', '🗣️'], ['lesen-bild', 'Wort lesen', '📖'], ['wort-legen', 'Wort legen', '🧩']] },
  { id: 'zahlen', name: 'Zahlen', em: '🔢', farbe: '#fff9c4', spiele: [['zahl-finden', 'Zahlen finden', '🔎'], ['zaehlen', 'Zählen', '🍎'], ['spur-zahl', 'Zahlen nachspuren', '✏️'], ['vergleichen', 'Mehr oder weniger', '⚖️'], ['fehlt', 'Welche Zahl fehlt?', '❓']] },
  { id: 'rechnen', name: 'Rechnen', em: '➕', farbe: '#ffe0b2', spiele: [['plus', 'Plus', '➕'], ['minus', 'Minus', '➖']] },
  { id: 'uhr', name: 'Uhr', em: '🕐', farbe: '#e1bee7', spiele: [['uhr-spielen', 'Uhr kennenlernen', '🕐'], ['uhr-lesen', 'Wie spät ist es?', '⏰']] },
  { id: 'woerter', name: 'Wörter', em: '🗂️', farbe: '#b2dfdb', spiele: [['karten', 'Wörter-Karten', '🗂️'], ['wort-finden', 'Wo ist ...?', '👉'], ['artikel', 'der, die, das', '💬']] },
  { id: 'farben', name: 'Farben und Formen', em: '🎨', farbe: '#f8bbd0', spiele: [['farben', 'Farben finden', '🎨'], ['farbe-von', 'Welche Farbe?', '🍌'], ['formen', 'Formen finden', '🔺']] },
  { id: 'englisch', name: 'Englisch', em: '🇬🇧', farbe: '#c5cae9', spiele: [['en-hoeren', 'Englisch hören', '👂'], ['en-woerter', 'Was heißt das?', '💬'], ['en-zahlen', 'Zahlen auf Englisch', '🔢']] },
  { id: 'arabisch', name: 'Arabisch', em: '🌙', farbe: '#dcedc8', spiele: [['ar-tafel', 'Buchstaben ansehen', '📋'], ['ar-quiz', 'Buchstaben raten', '❓']] },
  { id: 'malen', name: 'Malen', em: '🖍️', farbe: '#ffecb3' },
  { id: 'kamil', name: 'Kamil das Kamel', em: '🐪', farbe: '#d7ccc8' },
];
const SPIEL_NAMEN = {};
WELTEN.forEach(w => (w.spiele || []).forEach(s => { SPIEL_NAMEN[s[0]] = w.name + ': ' + s[1]; }));

function start() {
  stoppeAlles(); aktWelt = null; kopf('Lernwelt');
  if (!S.name) return einrichten();
  app.innerHTML = '<div class="gruss"><span class="maskottchen">🐪</span><span>Salam, ' + S.name + '!<br><small style="font-size:.6em">Was möchtest du lernen?</small></span></div>' +
    '<div class="raster">' + WELTEN.map(w => '<button class="kachel" style="background:' + w.farbe + '" data-w="' + w.id + '"><span class="em">' + w.em + '</span>' + w.name + '</button>').join('') + '</div>' +
    '<button class="eltern-knopf" id="eltern">👪 Für Eltern</button>';
  app.querySelectorAll('.kachel').forEach(b => b.onclick = () => { ton(TON_KLICK); welt(b.dataset.w); });
  $('#eltern').onclick = elternTor;
}

function welt(id) {
  const w = WELTEN.find(x => x.id === id);
  aktWelt = id; kopf(w.name);
  if (id === 'malen') return malen();
  if (id === 'kamil') return kamil();
  zeige('<div class="raster">' + w.spiele.map(s => '<button class="kachel" style="background:' + w.farbe + '" data-s="' + s[0] + '"><span class="em">' + s[2] + '</span>' + s[1] +
    (SPIELE_MIT_STUFE[s[0]] ? '<small>Stufe ' + stufe(s[0]) + '</small>' : '') + '</button>').join('') + '</div>', w.name, null, start);
  app.querySelectorAll('.kachel').forEach(b => b.onclick = () => { ton(TON_KLICK); spiel(b.dataset.s); });
}

// ---------- Fragespiel (für alle Auswahl-Aufgaben) ----------
// erzeuge(stufe) liefert { frage, sprich, sprache, loesung, optionen:[{html,wert,bild}], schluessel, nachher, nachherSprache, klasse }
function quiz(spielId, erzeuge, runde) {
  runde = runde || 8;
  let nr = 0, letzte = null;
  function naechste() {
    if (nr >= runde) return rundeGeschafft(() => quiz(spielId, erzeuge, runde));
    let a, n = 0;
    do { a = erzeuge(stufe(spielId)); } while (a.schluessel !== undefined && a.schluessel === letzte && ++n < 15);
    letzte = a.schluessel;
    nr++;
    let ersterVersuch = true, fehler = 0;
    const punkte = '<div class="fortschritt">' + Array.from({ length: runde }, (_, i) => '<i class="' + (i < nr - 1 ? 'an' : '') + '"></i>').join('') + '</div>';
    zeige(punkte + '<div class="frage">' + a.frage + '</div><div class="lob" id="lob"></div>' +
      '<div class="antworten ' + (a.klasse || '') + '">' + a.optionen.map((o, i) => '<button class="antwort' + (o.bild ? ' bild' : '') + '" data-i="' + i + '">' + o.html + '</button>').join('') + '</div>',
      a.sprich, a.sprache);
    const knoepfe = Array.from(app.querySelectorAll('.antwort'));
    knoepfe.forEach(b => b.onclick = () => {
      const o = a.optionen[+b.dataset.i];
      if (o.wert === a.loesung) {
        knoepfe.forEach(k => { k.disabled = k !== b; k.classList.remove('zeigen'); k.onclick = null; });
        b.classList.add('richtig'); ton(TON_RICHTIG);
        if (ersterVersuch) { werte(spielId, true); stern(); }
        const l = lob(); $('#lob').textContent = l + ' 🌟';
        if (a.nachher && a.nachherSprache) sprich(a.nachher, a.nachherSprache);
        else sprich(l + (a.nachher ? ' ' + a.nachher : ''));
        spaeter(naechste, a.nachher ? 2300 : 1500);
      } else {
        if (ersterVersuch) { werte(spielId, false); ersterVersuch = false; }
        fehler++;
        b.classList.add('falsch', 'wackeln'); b.disabled = true; ton(TON_FALSCH);
        $('#lob').textContent = 'Versuch es nochmal 🙂';
        sprich(a.hilfe || 'Versuch es nochmal.');
        if (fehler >= 2) knoepfe.forEach((k, i) => { if (a.optionen[i].wert === a.loesung) k.classList.add('zeigen'); });
      }
    });
  }
  naechste();
}

function rundeGeschafft(nochmal) {
  stoppeAlles(); stern(); ton(TON_JUBEL);
  zeige('<div class="ende"><div class="em">🏆</div><div class="text">Runde geschafft!<br>Du bekommst einen Extra-Stern ⭐</div><br>' +
    '<div class="knoepfe"><button class="knopf gruen" id="nochmal">🔁 Nochmal</button><button class="knopf" id="fertig">✅ Fertig</button></div></div>');
  sprich('Mascha Allah! Runde geschafft. Du bekommst einen Extra-Stern.');
  $('#nochmal').onclick = nochmal;
  $('#fertig').onclick = () => welt(aktWelt);
}

// ---------- Hilfen für Aufgaben ----------
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const nameVon = c => BUCHSTABEN_NAMEN[c.toUpperCase()] || c;
const opt = (werte, darstellung) => werte.map(w => ({ html: darstellung ? darstellung(w) : String(w), wert: w }));
function zahlOptionen(l, min, max, n) {
  n = Math.min(n || 4, max - min + 1);
  const s = new Set([l]); let v = 0;
  while (s.size < n) { const x = v++ < 40 ? l + zufall(7) - 3 : min + zufall(max - min + 1); if (x >= min && x <= max) s.add(x); }
  return mische(Array.from(s));
}
function menge(n, t, klein, weg) {
  weg = weg || 0;
  return '<span class="menge' + (klein ? ' klein' : '') + '">' + Array.from({ length: n }, (_, i) => '<span class="' + (i >= n - weg ? 'weg' : '') + '">' + t + '</span>').join('') + '</span>';
}
const DINGE = ['🍎', '⭐', '🐟', '🚗', '🌷', '🐤', '⚽', '🍓', '🎈', '🦋'];
const zahlBereich = s => s === 1 ? [0, 10] : s === 2 ? [0, 20] : [0, Math.max(20, S.zahlenraum)];
const NUR_BUCHSTABEN = /^[A-Za-zÄÖÜäöüß]+$/;
const LESE_WOERTER = WOERTER.filter(w => NUR_BUCHSTABEN.test(w[2]) && w[2] !== 'LKW');
const ANLAUT_WOERTER = LESE_WOERTER.filter(w => !/^(Sch|Ch|Sp|St|Ei|Eu|Au|Pf|Qu)/.test(w[2]));
const FARB_DINGE = [['🍌', 'die Banane', 'gelb'], ['🍅', 'die Tomate', 'rot'], ['🥒', 'die Gurke', 'grün'], ['🥕', 'die Karotte', 'orange'], ['🍇', 'die Weintraube', 'lila'],
  ['🐘', 'der Elefant', 'grau'], ['🐻', 'der Bär', 'braun'], ['🍓', 'die Erdbeere', 'rot'], ['🍋', 'die Zitrone', 'gelb'], ['🐸', 'der Frosch', 'grün'], ['🍊', 'die Orange', 'orange'], ['🌳', 'der Baum', 'grün']];
function zeitText(h, m) {
  const n = h % 12 + 1;
  if (m === 0) return h + ' Uhr';
  if (m === 30) return 'halb ' + n;
  if (m === 15) return 'Viertel nach ' + h;
  return 'Viertel vor ' + n;
}
function uhrSvg(h, m) {
  let z = '';
  for (let i = 1; i <= 12; i++) { const w = i * Math.PI / 6; z += '<text x="' + (50 + 36 * Math.sin(w)).toFixed(1) + '" y="' + (50 - 36 * Math.cos(w) + 4).toFixed(1) + '" text-anchor="middle" font-size="11" font-weight="bold">' + i + '</text>'; }
  for (let i = 0; i < 60; i++) { const w = i * Math.PI / 30, r1 = i % 5 ? 45 : 43; z += '<line x1="' + (50 + r1 * Math.sin(w)).toFixed(1) + '" y1="' + (50 - r1 * Math.cos(w)).toFixed(1) + '" x2="' + (50 + 47 * Math.sin(w)).toFixed(1) + '" y2="' + (50 - 47 * Math.cos(w)).toFixed(1) + '" stroke="#555" stroke-width="' + (i % 5 ? .5 : 1.2) + '"/>'; }
  const hw = ((h % 12) + m / 60) * 30, mw = m * 6;
  return '<svg viewBox="0 0 100 100" class="uhr"><circle cx="50" cy="50" r="48" fill="#fff" stroke="#333" stroke-width="3"/>' + z +
    '<line x1="50" y1="54" x2="50" y2="27" stroke="#e53935" stroke-width="5" stroke-linecap="round" transform="rotate(' + hw + ' 50 50)"/>' +
    '<line x1="50" y1="55" x2="50" y2="11" stroke="#1e88e5" stroke-width="3" stroke-linecap="round" transform="rotate(' + mw + ' 50 50)"/><circle cx="50" cy="50" r="3.5" fill="#333"/></svg>';
}

// ---------- Aufgaben ----------
const AUFGABEN = {
  'kennen': s => {
    const gross = s === 1 || (s === 3 && zufall(2) === 0);
    const B = nimm(ALPHABET), z = gross ? B : B.toLowerCase();
    const andere = mische(ALPHABET.filter(x => x !== B)).slice(0, 3).map(x => gross ? x : x.toLowerCase());
    return { frage: '<div class="gross">👂</div>', sprich: 'Wo ist das ' + (gross ? 'große ' : 'kleine ') + nameVon(B) + '?', loesung: z,
      optionen: opt(mische([z].concat(andere)), c => '<span class="buchstabe">' + c + '</span>'), schluessel: B };
  },
  'gross-klein': s => {
    const B = nimm(ALPHABET), k = B.toLowerCase();
    const andere = mische(ALPHABET.filter(x => x !== B)).slice(0, s === 1 ? 2 : 3).map(x => x.toLowerCase());
    return { frage: '<div class="gross">' + B + '</div><div class="text">Finde das kleine ' + B + '</div>', sprich: 'Das ist das große ' + nameVon(B) + '. Wo ist das kleine ' + nameVon(B) + '?',
      loesung: k, optionen: opt(mische([k].concat(andere)), c => '<span class="buchstabe">' + c + '</span>'), schluessel: B, klasse: s === 1 ? 'drei' : '' };
  },
  'anlaut': s => {
    const w = nimm(ANLAUT_WOERTER), B = w[2][0];
    const andere = mische(ALPHABET.filter(x => x !== B)).slice(0, s === 1 ? 2 : 3);
    return { frage: '<div class="bildgross">' + bild(w[0]) + '</div>', sprich: w[1] + ' ' + w[2] + '. Womit fängt ' + w[2] + ' an?', loesung: B,
      optionen: opt(mische([B].concat(andere)), c => '<span class="buchstabe">' + c + '</span>'), schluessel: w[2], nachher: w[2] + ' fängt mit ' + nameVon(B) + ' an.', klasse: s === 1 ? 'drei' : '' };
  },
  'silben': s => {
    const K = [['M', 'L', 'S', 'N', 'R'], ['M', 'L', 'S', 'N', 'R', 'T', 'B', 'D', 'F', 'W'], ['M', 'L', 'S', 'N', 'R', 'T', 'B', 'D', 'F', 'W', 'H', 'K', 'P', 'G']][s - 1];
    const V = s === 1 ? ['a', 'o', 'i'] : ['a', 'e', 'i', 'o', 'u'];
    const silbe = nimm(K) + nimm(V);
    const o = new Set([silbe]); o.add(nimm(K) + silbe[1]); o.add(silbe[0] + nimm(V));
    while (o.size < 4) o.add(nimm(K) + nimm(V));
    return { frage: '<div class="gross">👂</div>', sprich: 'Hör genau: ' + silbe + '. Wo steht ' + silbe + '?', loesung: silbe,
      optionen: opt(mische(Array.from(o)), x => '<span class="buchstabe">' + x + '</span>'), schluessel: silbe };
  },
  'lesen-bild': s => {
    const max = [4, 6, 30][s - 1];
    const w = nimm(LESE_WOERTER.filter(x => x[2].length <= max));
    const andere = mische(LESE_WOERTER.filter(x => x[2] !== w[2])).slice(0, s === 3 ? 3 : 2);
    return { frage: '<div class="lesewort">' + w[2] + '</div>', sprich: 'Lies das Wort. Welches Bild passt?', loesung: w[2],
      optionen: mische([w].concat(andere)).map(x => ({ html: bild(x[0]), wert: x[2], bild: true })), schluessel: w[2], nachher: w[1] + ' ' + w[2] + '.', klasse: s === 3 ? '' : 'drei' };
  },
  'zahl-finden': s => {
    const [lo, hi] = zahlBereich(s), z = lo + zufall(hi - lo + 1);
    return { frage: '<div class="gross">👂</div>', sprich: 'Wo ist die ' + z + '?', loesung: z, optionen: opt(zahlOptionen(z, lo, hi)), schluessel: z };
  },
  'zaehlen': s => {
    const max = [5, 10, 20][s - 1], n = 1 + zufall(max), t = nimm(DINGE);
    return { frage: menge(n, t), sprich: 'Wie viele sind es? Zähl mit dem Finger.', loesung: n, optionen: opt(zahlOptionen(n, 1, max)), schluessel: n, nachher: 'Es sind ' + n + '.' };
  },
  'vergleichen': s => {
    const max = [5, 10, 15][s - 1], a = 1 + zufall(max); let b; do { b = 1 + zufall(max); } while (b === a);
    const mehr = s < 3 || zufall(2) === 0, t = nimm(DINGE), frage = mehr ? 'Wo sind mehr?' : 'Wo sind weniger?';
    return { frage: '<div class="text">' + frage + '</div>', sprich: frage, loesung: (mehr ? a > b : a < b) ? 'L' : 'R',
      optionen: [{ html: menge(a, t, true), wert: 'L', bild: true }, { html: menge(b, t, true), wert: 'R', bild: true }], klasse: 'zwei', schluessel: a * 100 + b };
  },
  'fehlt': s => {
    const [lo, hi] = zahlBereich(s), anfang = lo + zufall(hi - lo - 2), luecke = zufall(4);
    const reihe = [0, 1, 2, 3].map(i => anfang + i), l = reihe[luecke];
    return { frage: '<div class="reihe">' + reihe.map((z, i) => i === luecke ? '<b class="luecke">?</b>' : '<b>' + z + '</b>').join('') + '</div>',
      sprich: 'Welche Zahl fehlt?', loesung: l, optionen: opt(zahlOptionen(l, lo, hi + 3)), schluessel: anfang * 10 + luecke };
  },
  'plus': s => {
    const max = s === 1 ? 5 : s === 2 ? 10 : Math.max(10, S.zahlenraum), a = zufall(max + 1), b = zufall(max - a + 1);
    const bildchen = s < 3 ? '<div class="rechenbild">' + menge(a, '🍎', true) + '<b>+</b>' + menge(b, '🍏', true) + '</div>' : '';
    return { frage: '<div class="gross">' + a + ' + ' + b + ' = ?</div>' + bildchen, sprich: 'Wie viel ist ' + a + ' plus ' + b + '?', loesung: a + b,
      optionen: opt(zahlOptionen(a + b, 0, max)), schluessel: a * 1000 + b, nachher: a + ' plus ' + b + ' ist ' + (a + b) + '.' };
  },
  'minus': s => {
    const max = s === 1 ? 5 : s === 2 ? 10 : Math.max(10, S.zahlenraum), a = zufall(max + 1), b = zufall(a + 1);
    const bildchen = s < 3 ? '<div class="rechenbild">' + menge(a, '🍎', true, b) + '</div>' : '';
    return { frage: '<div class="gross">' + a + ' − ' + b + ' = ?</div>' + bildchen, sprich: 'Wie viel ist ' + a + ' minus ' + b + '?', loesung: a - b,
      optionen: opt(zahlOptionen(a - b, 0, max)), schluessel: a * 1000 + b, nachher: a + ' minus ' + b + ' ist ' + (a - b) + '.' };
  },
  'uhr-lesen': s => {
    const ms = s === 1 ? [0] : s === 2 ? [0, 30] : [0, 15, 30, 45];
    const h = 1 + zufall(12), m = nimm(ms), l = zeitText(h, m);
    const o = new Set([l]);
    if (m === 30) o.add('halb ' + h);           // typischer Fehler: halb mit der falschen Stunde
    if (m === 15) o.add('Viertel vor ' + h);
    if (m === 45) o.add('Viertel nach ' + (h % 12 + 1));
    while (o.size < 4) o.add(zeitText(1 + zufall(12), nimm(ms)));
    return { frage: uhrSvg(h, m), sprich: 'Wie spät ist es?', loesung: l, optionen: opt(mische(Array.from(o))), schluessel: l, nachher: 'Es ist ' + l + '.' };
  },
  'artikel': s => {
    const w = nimm(WOERTER);
    return { frage: '<div class="bildgross">' + bild(w[0]) + '</div><div class="lesewort klein">' + w[2] + '</div>', sprich: 'Heißt es der, die oder das ' + w[2] + '?',
      loesung: w[1], optionen: opt(['der', 'die', 'das']), schluessel: w[2], nachher: w[1] + ' ' + w[2] + '.', klasse: 'drei' };
  },
  'farben': s => {
    const auswahl = mische(FARBEN).slice(0, s === 1 ? 3 : 4), f = auswahl[0];
    return { frage: '<div class="gross">🎨</div>', sprich: 'Wo ist ' + f[0] + '?', loesung: f[0],
      optionen: mische(auswahl).map(x => ({ html: '<span class="farbklecks" style="background:' + x[1] + '"></span>', wert: x[0], bild: true })), schluessel: f[0], nachher: 'Das ist ' + f[0] + '.', klasse: s === 1 ? 'drei' : '' };
  },
  'farbe-von': s => {
    const d = nimm(FARB_DINGE), andere = mische(FARBEN.filter(x => x[0] !== d[2])).slice(0, 3), f = FARBEN.find(x => x[0] === d[2]);
    return { frage: '<div class="bildgross">' + d[0] + '</div>', sprich: 'Welche Farbe hat ' + d[1] + '?', loesung: d[2],
      optionen: mische([f].concat(andere)).map(x => ({ html: '<span class="farbklecks" style="background:' + x[1] + '"></span>', wert: x[0], bild: true })), schluessel: d[0], nachher: d[1] + ' ist ' + d[2] + '.' };
  },
  'formen': s => {
    const auswahl = mische(FORMEN).slice(0, s === 1 ? 3 : 4), f = auswahl[0];
    return { frage: '<div class="gross">🔺</div>', sprich: 'Wo ist ' + f[0] + ' ' + f[1] + '?', loesung: f[1],
      optionen: mische(auswahl).map(x => ({ html: bild('svg:' + x[2]), wert: x[1], bild: true })), schluessel: f[1], nachher: 'Das ist ' + f[0] + ' ' + f[1] + '.', klasse: s === 1 ? 'drei' : '' };
  },
  'en-hoeren': s => {
    const w = nimm(WOERTER), andere = mische(WOERTER.filter(x => x[4] !== w[4] && x[0] !== w[0])).slice(0, s === 1 ? 2 : 3);
    return { frage: '<div class="gross">👂🇬🇧</div>', sprich: w[4], sprache: 'en-GB', loesung: w[4],
      optionen: mische([w].concat(andere)).map(x => ({ html: bild(x[0]), wert: x[4], bild: true })), schluessel: w[4], nachher: w[4], nachherSprache: 'en-GB', klasse: s === 1 ? 'drei' : '' };
  },
  'en-woerter': s => {
    const w = nimm(WOERTER), andere = mische(WOERTER.filter(x => x[4] !== w[4])).slice(0, s === 1 ? 2 : 3).map(x => x[4]);
    return { frage: '<div class="bildgross">' + bild(w[0]) + '</div>', sprich: 'Was heißt ' + w[2] + ' auf Englisch?', loesung: w[4],
      optionen: opt(mische([w[4]].concat(andere))), schluessel: w[4], nachher: w[4], nachherSprache: 'en-GB', klasse: s === 1 ? 'drei' : '' };
  },
  'en-zahlen': s => {
    const max = s === 1 ? 5 : 10, z = zufall(max + 1);
    return { frage: '<div class="gross">👂🇬🇧</div>', sprich: ZAHLWORTE_EN[z], sprache: 'en-GB', loesung: z, optionen: opt(zahlOptionen(z, 0, max)), schluessel: z, nachher: ZAHLWORTE_EN[z], nachherSprache: 'en-GB' };
  },
  'ar-quiz': s => {
    const pool = ARABISCH.slice(0, [10, 20, 28][s - 1]), a = nimm(pool), andere = mische(pool.filter(x => x[1] !== a[1])).slice(0, 3).map(x => x[1]);
    return { frage: '<div class="gross" style="font-size:clamp(80px,22vmin,160px)">' + a[0] + '</div>', sprich: 'Wie heißt dieser Buchstabe?', loesung: a[1],
      optionen: opt(mische([a[1]].concat(andere))), schluessel: a[1], nachher: 'Das ist ' + a[1] + '.' };
  },
};
const SPIELE_MIT_STUFE = Object.assign({ 'wort-legen': 1 }, AUFGABEN);
// Die Uhr-Aufgabe braucht vier verschiedene Antworten; die Liste oben kann bei Stufe 1 schon vier enthalten.

function spiel(id) {
  const w = WELTEN.find(x => x.id === aktWelt);
  const s = w && w.spiele.find(x => x[0] === id);
  kopf(s ? s[1] : 'Lernwelt');
  if (AUFGABEN[id]) return quiz(id, AUFGABEN[id]);
  switch (id) {
    case 'mein-name': return meinName(0);
    case 'name-legen': return legen(S.name, { titel: 'Leg deinen Namen', ansage: 'Leg deinen Namen. Tippe die Buchstaben der Reihe nach.', vorlage: stufe('name-legen') === 1, spielId: 'name-legen', weiter: () => spiel('name-legen') });
    case 'name-schreiben': return nameSchreiben();
    case 'tafel': return tafel();
    case 'spur-gross': return spurWahl(ALPHABET.concat(['Ä', 'Ö', 'Ü']), 'spur-gross');
    case 'spur-klein': return spurWahl('abcdefghijklmnopqrstuvwxyzäöü'.split(''), 'spur-klein');
    case 'spur-zahl': return spurWahl('0123456789'.split(''), 'spur-zahl');
    case 'wort-legen': return wortLegen(0);
    case 'uhr-spielen': return uhrSpielen(3, 0);
    case 'karten': return bereichWahl(b => karten(b, 0));
    case 'wort-finden': return bereichWahl(b => quiz('wort-finden', wortFinden(b)));
    case 'ar-tafel': return arTafel();
  }
}

// ---------- Nachspuren ----------
function nachspuren(zeichen, titelHtml, ansage, spielId, weiter, zurueck) {
  const pfade = GLYPHEN[zeichen];
  if (!pfade) return weiter();
  const klein = /[a-zäöü]/.test(zeichen), ziffer = /[0-9]/.test(zeichen);
  const linien = ziffer ? [[80, false]] : klein ? [[10, true], [45, true], [80, false], [99, true]] : [[10, true], [80, false]];
  zeige('<div class="spur-titel">' + titelHtml + '</div><div class="spur" id="spur"><svg viewBox="-5 -5 110 110" id="vorlage">' +
    linien.map(l => '<line x1="-5" x2="105" y1="' + l[0] + '" y2="' + l[0] + '" class="hilfslinie' + (l[1] ? ' gestrichelt' : '') + '"/>').join('') +
    pfade.map(d => '<path d="' + d + '" class="spur-pfad"/>').join('') + '<g id="punkte"></g><g id="demo"></g></svg><canvas id="leinwand"></canvas></div>' +
    '<div class="knoepfe"><button class="knopf" id="zeig">👆 Zeig mal</button><button class="knopf" id="leer">↺ Nochmal</button></div><div class="lob" id="lob"></div>', ansage, null, zurueck);
  const svg = $('#vorlage'), els = Array.from(svg.querySelectorAll('.spur-pfad'));
  // Startpunkte mit Nummer
  $('#punkte').innerHTML = els.map((p, i) => { const q = p.getPointAtLength(0); return '<g class="startpunkt"><circle cx="' + q.x + '" cy="' + q.y + '" r="4.5"/><text x="' + q.x + '" y="' + (q.y + 2) + '" text-anchor="middle">' + (i + 1) + '</text></g>'; }).join('');
  // Prüfpunkte entlang der Vorlage
  const proben = [];
  els.forEach(p => { const L = p.getTotalLength(), n = Math.max(2, Math.ceil(L / 3)); for (let i = 0; i <= n; i++) { const q = p.getPointAtLength(L * i / n); proben.push([q.x, q.y]); } });
  const cv = $('#leinwand'), ctx = cv.getContext('2d');
  let skal = 1;
  function groesse() { const r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1; cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); skal = r.width / 110; malNeu(); }
  let striche = [], aktuell = null, fertig = false, gewertet = false;
  function stil() { ctx.lineWidth = 9 * skal; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#1e88e5'; ctx.fillStyle = '#1e88e5'; }
  function px(p) { return [(p[0] + 5) * skal, (p[1] + 5) * skal]; }
  function malNeu() { ctx.clearRect(0, 0, cv.width, cv.height); stil(); striche.forEach(st => { ctx.beginPath(); const a = px(st[0]); ctx.arc(a[0], a[1], 4.5 * skal, 0, 7); ctx.fill(); ctx.beginPath(); ctx.moveTo(a[0], a[1]); st.forEach(p => { const q = px(p); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); }); }
  const einheit = e => { const b = cv.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * 110 - 5, (e.clientY - b.top) / b.height * 110 - 5]; };
  cv.onpointerdown = e => { if (fertig) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (x) {} const p = einheit(e); aktuell = [p]; striche.push(aktuell); stil(); const q = px(p); ctx.beginPath(); ctx.arc(q[0], q[1], 4.5 * skal, 0, 7); ctx.fill(); };
  cv.onpointermove = e => {
    if (!aktuell) return; e.preventDefault();
    const p = einheit(e), v = aktuell[aktuell.length - 1], d = Math.hypot(p[0] - v[0], p[1] - v[1]), n = Math.ceil(d / 2);
    for (let i = 1; i <= n; i++) aktuell.push([v[0] + (p[0] - v[0]) * i / n, v[1] + (p[1] - v[1]) * i / n]);
    const a = px(v), b = px(p); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
  };
  cv.onpointerup = cv.onpointercancel = () => { if (!aktuell) return; aktuell = null; pruefe(); };
  function pruefe() {
    const alle = [].concat.apply([], striche);
    let gedeckt = 0;
    proben.forEach(([x, y]) => { if (alle.some(([a, b]) => (a - x) * (a - x) + (b - y) * (b - y) <= 81)) gedeckt++; });
    let draussen = 0;
    alle.forEach(([a, b]) => { if (!proben.some(([x, y]) => (a - x) * (a - x) + (b - y) * (b - y) <= 196)) draussen++; });
    if (alle.length > 25 && draussen / alle.length > 0.3) {
      if (!gewertet) { werte(spielId, false); gewertet = true; }
      ton(TON_FALSCH); $('#lob').textContent = 'Bleib auf dem grauen Weg 🙂'; sprich('Bleib auf dem grauen Weg. Versuch es nochmal.');
      striche = []; spaeter(malNeu, 400);
      return;
    }
    if (gedeckt / proben.length >= 0.85) {
      fertig = true;
      if (!gewertet) werte(spielId, true);
      svg.classList.add('geschafft'); ton(TON_RICHTIG); stern();
      const l = lob(); $('#lob').textContent = l + ' 🌟'; sprich(l);
      spaeter(weiter, 1600);
    }
  }
  function zeigVor() {
    const g = $('#demo'); g.innerHTML = '';
    const hand = document.createElementNS(NS, 'text'); hand.textContent = '👆'; hand.setAttribute('font-size', '16'); g.appendChild(hand);
    let i = 0;
    (function strich() {
      if (i >= els.length || !document.body.contains(g)) { spaeter(() => { g.innerHTML = ''; }, 500); return; }
      const p = els[i++], L = p.getTotalLength(), k = p.cloneNode();
      k.setAttribute('class', 'demo-pfad'); k.style.strokeDasharray = L + 1; k.style.strokeDashoffset = L + 1; g.insertBefore(k, hand);
      const dauer = Math.max(450, L * 16), t0 = performance.now();
      (function schritt(t) {
        if (!document.body.contains(k)) return;
        const f = Math.min(1, (t - t0) / dauer); k.style.strokeDashoffset = (L + 1) * (1 - f);
        const q = p.getPointAtLength(L * f); hand.setAttribute('x', q.x - 5); hand.setAttribute('y', q.y + 15);
        if (f < 1) requestAnimationFrame(schritt); else spaeter(strich, 300);
      })(t0);
    })();
  }
  $('#zeig').onclick = zeigVor;
  $('#leer').onclick = () => { striche = []; fertig = false; svg.classList.remove('geschafft'); malNeu(); };
  window.onresize = () => { if (document.body.contains(cv)) groesse(); };
  groesse();
  spaeter(zeigVor, 900);
}

function spurWahl(zeichen, spielId) {
  zeige('<div class="raster" style="grid-template-columns:repeat(auto-fill,minmax(80px,1fr))">' + zeichen.map(c => '<button class="kachel" data-c="' + c + '"><span class="buchstabe">' + c + '</span></button>').join('') + '</div>',
    'Welchen möchtest du schreiben?');
  app.querySelectorAll('.kachel').forEach(b => b.onclick = () => spurFolge(zeichen, zeichen.indexOf(b.dataset.c), spielId));
}
function spurFolge(zeichen, i, spielId) {
  const c = zeichen[i], ziffer = /[0-9]/.test(c);
  const ansage = ziffer ? 'Das ist die ' + c + '. Fahr mit dem Finger nach. Fang beim grünen Punkt an.' : 'Das ist das ' + (c === c.toUpperCase() ? 'große ' : 'kleine ') + nameVon(c) + '. Fahr mit dem Finger nach. Fang beim grünen Punkt an.';
  nachspuren(c, c, ansage, spielId, () => spurFolge(zeichen, (i + 1) % zeichen.length, spielId), () => spurWahl(zeichen, spielId));
}

// ---------- Mein Name ----------
function nameTitel(i) { return Array.from(S.name).map((c, j) => '<span class="' + (j === i ? 'jetzt' : j < i ? 'fertig' : '') + '">' + c + '</span>').join(''); }
function meinName(i) {
  const name = Array.from(S.name);
  if (i >= name.length) {
    stoppeAlles(); stern(2); ton(TON_JUBEL);
    zeige('<div class="ende"><div class="em">🎉</div><div class="lesewort">' + S.name + '</div><br><div class="text">So schreibt man deinen Namen!</div><br>' +
      '<div class="knoepfe"><button class="knopf gruen" id="nochmal">🔁 Nochmal</button><button class="knopf" id="fertig">✅ Fertig</button></div></div>');
    sprich('Mascha Allah! So schreibt man ' + S.name + '. Du bekommst zwei Sterne.');
    $('#nochmal').onclick = () => meinName(0); $('#fertig').onclick = () => welt('name');
    return;
  }
  const c = name[i];
  const ansage = (i === 0 ? 'Wir schreiben deinen Namen: ' + S.name + '. ' : '') + 'Jetzt kommt das ' + (c === c.toUpperCase() ? 'große ' : 'kleine ') + nameVon(c) + '. Fahr mit dem Finger nach.';
  nachspuren(c, nameTitel(i), ansage, 'mein-name', () => meinName(i + 1));
}
// Ganzen Namen frei schreiben: Vorlage aller Buchstaben nebeneinander
function nameSchreiben() {
  const name = Array.from(S.name).filter(c => GLYPHEN[c]);
  const breite = 70, w = name.length * breite + 40;
  const pfade = name.map((c, i) => GLYPHEN[c].map(d => '<path d="' + d + '" class="spur-pfad" transform="translate(' + (i * breite - 10) + ' 0)"/>').join('')).join('');
  const bw = app.clientWidth, bh = Math.min(bw * 110 / w, window.innerHeight - 260);
  zeige('<div class="spur-titel">' + S.name + '</div><div id="namefeld" style="position:relative;margin:6px auto;width:' + bh * w / 110 + 'px;height:' + bh + 'px;background:#fff;border-radius:18px;box-shadow:var(--schatten)">' +
    '<svg viewBox="-5 -5 ' + w + ' 110" style="position:absolute;inset:0;width:100%;height:100%"><line x1="-5" x2="' + w + '" y1="45" y2="45" class="hilfslinie gestrichelt"/><line x1="-5" x2="' + w + '" y1="80" y2="80" class="hilfslinie"/><line x1="-5" x2="' + w + '" y1="10" y2="10" class="hilfslinie gestrichelt"/>' + pfade + '</svg>' +
    '<canvas id="frei" style="position:absolute;inset:0;width:100%;height:100%;touch-action:none"></canvas></div><div class="knoepfe"><button class="knopf" id="leer">↺ Nochmal</button><button class="knopf gruen" id="ok">✅ Fertig geschrieben</button></div><div class="lob" id="lob"></div>',
    'Schreib jetzt deinen ganzen Namen: ' + S.name + '. Fahr alle Buchstaben nach.');
  const cv = $('#frei'), ctx = cv.getContext('2d'), r = cv.getBoundingClientRect(), dpr = window.devicePixelRatio || 1;
  cv.width = r.width * dpr; cv.height = r.height * dpr; ctx.scale(dpr, dpr);
  ctx.lineWidth = Math.max(6, r.height / 14); ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = '#1e88e5';
  let zieht = false, last = null, menge = 0;
  const pos = e => { const b = cv.getBoundingClientRect(); return [e.clientX - b.left, e.clientY - b.top]; };
  cv.onpointerdown = e => { zieht = true; last = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} };
  cv.onpointermove = e => { if (!zieht) return; const p = pos(e); ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); menge += Math.hypot(p[0] - last[0], p[1] - last[1]); last = p; };
  cv.onpointerup = cv.onpointercancel = () => { zieht = false; };
  $('#leer').onclick = () => { ctx.clearRect(0, 0, cv.width, cv.height); menge = 0; };
  $('#ok').onclick = () => {
    if (menge < r.width * 0.8) { sprich('Fahr erst alle Buchstaben nach.'); $('#lob').textContent = 'Fahr erst alle Buchstaben nach ✏️'; return; }
    werte('name-schreiben', true); stern(2); ton(TON_JUBEL); sprich('Mascha Allah! Du hast ' + S.name + ' geschrieben!');
    $('#lob').textContent = 'Toll geschrieben! ⭐⭐'; spaeter(() => welt('name'), 2200);
  };
}

// ---------- Legen (Name und Wörter) ----------
function legen(ziel, o) {
  const b = Array.from(ziel);
  let pos = 0, gewertet = false;
  const steine = mische(b.map((c, i) => ({ c: c, i: i })));
  zeige((o.bild ? '<div class="frage"><div class="bildgross">' + bild(o.bild) + '</div></div>' : '<div class="spur-titel">' + (o.titel || '') + '</div>') +
    '<div class="slots">' + b.map((c, i) => '<span class="slot" id="slot' + i + '">' + (o.vorlage ? '<em>' + c + '</em>' : '') + '</span>').join('') + '</div>' +
    '<div class="steine">' + steine.map((s, k) => '<button class="stein" data-k="' + k + '">' + s.c + '</button>').join('') + '</div><div class="lob" id="lob"></div>', o.ansage, null, o.zurueck);
  app.querySelectorAll('.stein').forEach(knopf => knopf.onclick = () => {
    const s = steine[+knopf.dataset.k];
    if (s.c === b[pos]) {
      const slot = $('#slot' + pos); slot.textContent = s.c; slot.classList.add('voll');
      knopf.classList.add('weg'); pos++; ton(TON_KLICK); sprich(nameVon(s.c));
      if (pos === b.length) {
        if (!gewertet) werte(o.spielId, true);
        stern(); ton(TON_JUBEL);
        const l = lob(); $('#lob').textContent = l + ' 🌟'; sprich(l + ' ' + (o.fertigText || ziel));
        spaeter(o.weiter, 2300);
      }
    } else {
      if (!gewertet) { werte(o.spielId, false); gewertet = true; }
      knopf.classList.remove('wackeln'); void knopf.offsetWidth; knopf.classList.add('wackeln'); ton(TON_FALSCH);
      $('#lob').textContent = 'Welcher Buchstabe kommt jetzt? 🤔'; sprich('Hör genau. Jetzt kommt das ' + nameVon(b[pos]) + '.');
    }
  });
}
function wortLegen(nr) {
  if (nr >= 5) return rundeGeschafft(() => wortLegen(0));
  const s = stufe('wort-legen'), max = [4, 6, 30][s - 1];
  const w = nimm(LESE_WOERTER.filter(x => x[2].length <= max));
  legen(w[2], { bild: w[0], ansage: w[1] + ' ' + w[2] + '. Leg das Wort ' + w[2] + '.', vorlage: s === 1, spielId: 'wort-legen', fertigText: w[1] + ' ' + w[2], weiter: () => wortLegen(nr + 1) });
}

// ---------- Buchstaben-Tafel ----------
function tafel() {
  zeige('<div class="raster" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr))">' + ALPHABET.concat(['Ä', 'Ö', 'Ü']).map(c => '<button class="kachel" data-c="' + c + '"><span class="buchstabe">' + c + c.toLowerCase() + '</span></button>').join('') + '</div>', 'Tippe auf einen Buchstaben.');
  app.querySelectorAll('.kachel').forEach(b => b.onclick = () => {
    const c = b.dataset.c, w = ANLAUT_WOERTER.find(x => x[2][0] === c);
    zeige('<div class="karte"><div class="gross" style="font-size:clamp(70px,18vmin,140px)">' + c + ' ' + c.toLowerCase() + '</div>' + (w ? '<div class="bildgross">' + bild(w[0]) + '</div><div class="wort">' + w[2] + '</div>' : '') + '</div>' +
      '<div class="knoepfe"><button class="knopf blau" id="schreib">✏️ Schreiben üben</button></div>', nameVon(c) + (w ? '. ' + nameVon(c) + ' wie ' + w[2] + '.' : '.'), null, tafel);
    $('#schreib').onclick = () => nachspuren(c, c, 'Fahr das große ' + nameVon(c) + ' nach.', 'spur-gross', () => nachspuren(c.toLowerCase(), c.toLowerCase(), 'Und jetzt das kleine ' + nameVon(c) + '.', 'spur-klein', tafel, tafel), tafel);
  });
}

// ---------- Wörter ----------
function bereichWahl(weiter) {
  const liste = Object.keys(BEREICHE).map(k => [k, BEREICHE[k][0], BEREICHE[k][1]]).concat([['alle', 'Alle Wörter', '🌍']]);
  zeige('<div class="raster">' + liste.map(b => '<button class="kachel" data-b="' + b[0] + '"><span class="em">' + b[2] + '</span>' + b[1] + '</button>').join('') + '</div>', 'Was möchtest du lernen?');
  app.querySelectorAll('.kachel').forEach(k => k.onclick = () => weiter(k.dataset.b));
}
function wortListe(b) { return b === 'alle' ? WOERTER : WOERTER.filter(w => w[3] === b); }
function karten(b, i) {
  const liste = wortListe(b), w = liste[(i + liste.length) % liste.length];
  zeige('<div class="karte" id="karte"><div class="bildgross">' + bild(w[0]) + '</div><div class="wort"><small>' + w[1] + '</small> ' + w[2] + '</div></div>' +
    '<div class="knoepfe"><button class="knopf" id="vor">⬅️</button><span class="text">' + ((i % liste.length + liste.length) % liste.length + 1) + ' / ' + liste.length + '</span><button class="knopf" id="nach">➡️</button><button class="knopf" id="en">🇬🇧</button></div>',
    w[1] + ' ' + w[2], null, () => bereichWahl(x => karten(x, 0)));
  $('#karte').onclick = () => sprich(w[1] + ' ' + w[2]);
  $('#vor').onclick = () => karten(b, i - 1);
  $('#nach').onclick = () => karten(b, i + 1);
  $('#en').onclick = () => sprich(w[4], 'en-GB');
}
function wortFinden(b) {
  return s => {
    const pool = wortListe(b), w = nimm(pool), andere = mische(pool.filter(x => x[2] !== w[2])).slice(0, s === 1 ? 2 : 3);
    return { frage: '<div class="gross">👂</div>', sprich: 'Wo ist ' + w[1] + ' ' + w[2] + '?', loesung: w[2],
      optionen: mische([w].concat(andere)).map(x => ({ html: bild(x[0]), wert: x[2], bild: true })), schluessel: w[2], klasse: s === 1 ? 'drei' : '' };
  };
}

// ---------- Uhr kennenlernen ----------
function uhrSpielen(h, m, kurz) {
  const t = zeitText(h, m);
  zeige('<div class="frage">' + uhrSvg(h, m) + '<div class="lesewort klein">' + t + '</div></div>' +
    '<div class="knoepfe"><button class="knopf" id="hm">➖ 1 Stunde</button><button class="knopf blau" id="hp">➕ 1 Stunde</button><button class="knopf" id="mm">➖ Viertel</button><button class="knopf blau" id="mp">➕ Viertel</button></div>' +
    '<p class="text" style="text-align:center;font-size:18px">🔴 Kurzer roter Zeiger: Stunde · 🔵 Langer blauer Zeiger: Minuten</p>',
    (kurz ? '' : 'Der kurze rote Zeiger zeigt die Stunde. Der lange blaue Zeiger zeigt die Minuten. ') + 'Es ist ' + t + '.');
  const neu = (dh, dm) => { let min = (h % 12) * 60 + m + dh * 60 + dm; min = (min + 720) % 720; let nh = Math.floor(min / 60); if (nh === 0) nh = 12; uhrSpielen(nh, min % 60, true); };
  $('#hm').onclick = () => neu(-1, 0); $('#hp').onclick = () => neu(1, 0); $('#mm').onclick = () => neu(0, -15); $('#mp').onclick = () => neu(0, 15);
}

// ---------- Arabisch ----------
function arTafel() {
  zeige('<div class="raster" style="grid-template-columns:repeat(auto-fill,minmax(90px,1fr));direction:rtl">' + ARABISCH.map((a, i) => '<button class="kachel" data-i="' + i + '"><span class="buchstabe">' + a[0] + '</span><small>' + a[1] + '</small></button>').join('') + '</div>',
    'Tippe auf einen Buchstaben.');
  app.querySelectorAll('.kachel').forEach(b => b.onclick = () => { const a = ARABISCH[+b.dataset.i]; ton(TON_KLICK); sprich(a[1]); hinweis('<span style="font-size:90px">' + a[0] + '</span><br>' + a[1], 2200); });
}

// ---------- Malen ----------
function malen() {
  const farben = FARBEN.map(f => f[1]);
  zeige('<div class="palette">' + farben.map((f, i) => '<button data-f="' + f + '" style="background:' + f + '" class="' + (i === 1 ? 'an' : '') + '"></button>').join('') +
    '<button data-f="radierer" style="background:#fff;font-size:22px">🧽</button><button id="dick" style="background:#eee;font-size:20px">●</button><button id="weg" style="background:#eee;font-size:22px">🗑️</button></div><canvas id="malflaeche"></canvas>', null, null, start);
  const cv = $('#malflaeche'), ctx = cv.getContext('2d'), dpr = window.devicePixelRatio || 1;
  const bw = Math.min(app.clientWidth - 8, 1000), bh = Math.max(240, window.innerHeight - cv.getBoundingClientRect().top - 24);
  cv.style.width = bw + 'px'; cv.style.height = bh + 'px'; cv.width = bw * dpr; cv.height = bh * dpr; ctx.scale(dpr, dpr);
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, bw, bh);
  let farbe = farben[1], dicke = 10, last = null;
  ctx.lineCap = ctx.lineJoin = 'round';
  app.querySelectorAll('.palette button[data-f]').forEach(b => b.onclick = () => { app.querySelectorAll('.palette button').forEach(x => x.classList.remove('an')); b.classList.add('an'); farbe = b.dataset.f === 'radierer' ? '#ffffff' : b.dataset.f; });
  $('#dick').onclick = () => { dicke = dicke === 10 ? 24 : dicke === 24 ? 4 : 10; $('#dick').style.fontSize = (dicke === 4 ? 12 : dicke === 10 ? 20 : 32) + 'px'; };
  $('#weg').onclick = () => { if (confirm('Bild löschen?')) { ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, bw, bh); } };
  const pos = e => { const r = cv.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  cv.onpointerdown = e => { last = pos(e); try { cv.setPointerCapture(e.pointerId); } catch (x) {} ctx.fillStyle = farbe; ctx.beginPath(); ctx.arc(last[0], last[1], dicke / 2, 0, 7); ctx.fill(); };
  cv.onpointermove = e => { if (!last) return; const p = pos(e); ctx.strokeStyle = farbe; ctx.lineWidth = dicke; ctx.beginPath(); ctx.moveTo(last[0], last[1]); ctx.lineTo(p[0], p[1]); ctx.stroke(); last = p; };
  cv.onpointerup = cv.onpointercancel = () => { last = null; };
}

// ---------- Kamil das Kamel (Belohnung) ----------
const LADEN = [
  { id: 'wasser', em: '💧', name: 'Wasser', preis: 1, essen: true }, { id: 'apfel', em: '🍎', name: 'Apfel', preis: 2, essen: true }, { id: 'karotte', em: '🥕', name: 'Karotte', preis: 2, essen: true },
  { id: 'schleife', em: '🎀', name: 'Schleife', preis: 8 }, { id: 'hut', em: '🎩', name: 'Hut', preis: 10 }, { id: 'brille', em: '🕶️', name: 'Sonnenbrille', preis: 10 },
  { id: 'schal', em: '🧣', name: 'Schal', preis: 12 }, { id: 'ball', em: '⚽', name: 'Ball', preis: 15 }, { id: 'krone', em: '👑', name: 'Krone', preis: 25 },
];
function kamil(text) {
  const k = S.kamil, satt = k.gefuettert === heute();
  const sagt = text || (satt ? 'Danke, ' + S.name + '! Mir geht es super! 😊' : 'Ich habe Hunger! Lerne und gib mir etwas zu essen. 🥺');
  zeige('<div class="buehne"><div class="kamil" id="kamil"><div class="sachen">' + k.an.map(id => (LADEN.find(x => x.id === id) || {}).em || '').join('') + '</div>🐪</div><br><div class="blase">' + sagt + '</div>' +
    '<div class="text">Du hast ⭐ ' + S.konto + '</div></div><div class="laden">' +
    LADEN.map(x => { const hat = k.sachen.indexOf(x.id) >= 0, an = k.an.indexOf(x.id) >= 0; return '<button data-id="' + x.id + '" class="' + (an ? 'an' : '') + '"><span class="em">' + x.em + '</span>' + x.name + '<br>' + (x.essen ? '⭐ ' + x.preis : hat ? (an ? 'abnehmen' : 'anziehen') : '⭐ ' + x.preis) + '</button>'; }).join('') +
    '</div>', sagt.replace(/[^\p{L}\p{N} ,.!?]/gu, ''), null, start);
  app.querySelectorAll('.laden button').forEach(b => b.onclick = () => {
    const x = LADEN.find(y => y.id === b.dataset.id), hat = k.sachen.indexOf(x.id) >= 0;
    if (!x.essen && hat) { const i = k.an.indexOf(x.id); if (i >= 0) k.an.splice(i, 1); else k.an.push(x.id); sichern(); ton(TON_KLICK); return kamil('So sehe ich toll aus! 😎'); }
    if (S.konto < x.preis) { ton(TON_FALSCH); return kamil('Du brauchst ' + x.preis + ' Sterne. Lerne weiter, dann klappt es! 💪'); }
    S.konto -= x.preis;
    if (x.essen) k.gefuettert = heute(); else { k.sachen.push(x.id); k.an.push(x.id); }
    sichern(); kopf(); ton(TON_JUBEL);
    kamil(x.essen ? 'Mjam! Danke, ' + S.name + '! 😋' : 'Wow, danke für ' + (x.id === 'brille' || x.id === 'krone' || x.id === 'schleife' ? 'die ' : 'den ') + x.name + '! 🥰');
    const el = $('#kamil'); if (el) el.classList.add('huepfen');
  });
}

// ---------- Eltern ----------
function einrichten() {
  kopf('Willkommen');
  app.innerHTML = '<div class="eltern"><h2>👪 Einrichtung (für Eltern)</h2><label>Name des Kindes (so, wie es ihn schreiben lernen soll):<br><input id="nm" maxlength="20" autocomplete="off"></label>' +
    '<button class="knopf gruen" id="los">Los geht\'s</button><p style="font-size:15px;color:#666">Alles bleibt nur auf diesem Gerät gespeichert.</p></div>';
  $('#los').onclick = () => { const n = $('#nm').value.trim(); if (!n) return; S.name = n; sichern(); start(); };
}
function elternTor() {
  const a = 6 + zufall(4), b = 6 + zufall(4); let eingabe = '';
  zeige('<div class="eltern" style="text-align:center"><h2>Nur für Eltern</h2><div class="text">' + a + ' × ' + b + ' = <b id="ein">?</b></div><div class="tasten">' +
    [1, 2, 3, 4, 5, 6, 7, 8, 9, '⌫', 0, '✔'].map(t => '<button>' + t + '</button>').join('') + '</div></div>', null, null, start);
  app.querySelectorAll('.tasten button').forEach(k => k.onclick = () => {
    const t = k.textContent;
    if (t === '⌫') eingabe = eingabe.slice(0, -1); else if (t === '✔') { if (+eingabe === a * b) return eltern(); eingabe = ''; ton(TON_FALSCH); } else if (eingabe.length < 3) eingabe += t;
    $('#ein').textContent = eingabe || '?';
  });
}
function eltern() {
  kopf('Eltern-Bereich');
  ladeStimmen();
  const de = stimmen.filter(v => (v.lang || '').toLowerCase().indexOf('de') === 0);
  const zeilen = Object.keys(S.statistik).map(k => { const s = S.statistik[k]; return '<tr><td>' + (SPIEL_NAMEN[k] || k) + '</td><td>' + s.r + '</td><td>' + s.f + '</td><td>' + stufe(k) + '</td></tr>'; }).join('');
  zeige('<div class="eltern"><h2>👪 Eltern-Bereich</h2>' +
    '<label>Name: <input id="nm" value="' + S.name.replace(/"/g, '') + '" maxlength="20"></label>' +
    '<label>Tagesziel (Sterne): <select id="ziel">' + [10, 15, 20, 30, 50].map(z => '<option' + (z === S.tagesziel ? ' selected' : '') + '>' + z + '</option>').join('') + '</select></label>' +
    '<label>Zahlenraum ab Stufe 3: <select id="raum">' + [20, 50, 100].map(z => '<option' + (z === S.zahlenraum ? ' selected' : '') + '>' + z + '</option>').join('') + '</select></label>' +
    '<label>Sprechtempo: <input type="range" id="tempo" min="0.6" max="1.2" step="0.05" value="' + S.tempo + '"></label>' +
    '<label>Stimme: <select id="stimme"><option value="">automatisch</option>' + de.map(v => '<option' + (v.name === S.stimme ? ' selected' : '') + '>' + v.name + '</option>').join('') + '</select> <button class="knopf" id="test">🔊 Test</button></label>' +
    (de.length ? '' : '<p style="color:#c62828">Keine deutsche Stimme gefunden. Auf dem Tablet: Einstellungen › Bedienungshilfen › Text-in-Sprache, deutsche Sprache laden.</p>') +
    '<p>Gesamt gesammelt: ⭐ ' + S.sterne + ' · Kontostand: ⭐ ' + S.konto + '</p>' +
    '<h3>Fortschritt</h3><table><tr><th>Übung</th><th>richtig</th><th>falsch</th><th>Stufe</th></tr>' + (zeilen || '<tr><td colspan="4">noch nichts geübt</td></tr>') + '</table><br>' +
    '<div class="knoepfe"><button class="knopf" id="stufen">Stufen zurücksetzen</button><button class="knopf" id="alles">Alles zurücksetzen</button><button class="knopf gruen" id="fertig">✅ Speichern</button></div></div>', null, null, start);
  $('#test').onclick = () => { S.stimme = $('#stimme').value; S.tempo = +$('#tempo').value; sprich('Salam ' + ($('#nm').value || '') + '! So klinge ich.'); };
  $('#stufen').onclick = () => { if (confirm('Alle Stufen auf 1 setzen?')) { S.stufen = {}; sichern(); eltern(); } };
  $('#alles').onclick = () => { if (confirm('Wirklich alles löschen (Sterne, Fortschritt, Kamil)?')) { const n = S.name; S = Object.assign({}, GRUND, { name: n, kamil: { gefuettert: '', sachen: [], an: [] }, tag: { datum: '', sterne: 0 }, stufen: {}, statistik: {} }); sichern(); eltern(); } };
  $('#fertig').onclick = () => { S.name = $('#nm').value.trim() || S.name; S.tagesziel = +$('#ziel').value; S.zahlenraum = +$('#raum').value; S.tempo = +$('#tempo').value; S.stimme = $('#stimme').value; sichern(); start(); };
}

// ---------- Start ----------
$('#heim').onclick = () => { ton(TON_KLICK); start(); };
if ('serviceWorker' in navigator && location.protocol === 'https:') { navigator.serviceWorker.register('sw.js').catch(() => {}); }
kopf(); start();
