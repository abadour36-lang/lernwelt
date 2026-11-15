// Alle Inhalte selbst erstellt. Bilder: Emoji (bis Unicode 11, läuft auch auf älteren Fire-Tablets) oder eigene Zeichnungen (svg:...).

// Eigene Zeichnungen (Rahmen 0 0 100 100)
const BILDER = {
  esel: '<g fill="#9e9e9e" stroke="#555" stroke-width="2"><ellipse cx="45" cy="55" rx="28" ry="16"/><rect x="22" y="64" width="7" height="26" rx="2"/><rect x="34" y="64" width="7" height="26" rx="2"/><rect x="52" y="64" width="7" height="26" rx="2"/><rect x="63" y="64" width="7" height="26" rx="2"/><path d="M64 46 L76 30 L86 34 L78 54 Z"/><path d="M74 31 L70 6 L80 28 Z"/><path d="M80 30 L86 7 L86 31 Z"/><ellipse cx="86" cy="42" rx="9" ry="11"/></g><circle cx="85" cy="37" r="2" fill="#000"/><ellipse cx="90" cy="49" rx="4" ry="3" fill="#666"/><path d="M18 50 Q8 58 12 72" stroke="#555" stroke-width="3" fill="none" stroke-linecap="round"/>',
  kuehlschrank: '<rect x="25" y="6" width="50" height="88" rx="7" fill="#eef3f7" stroke="#556" stroke-width="3"/><line x1="25" y1="38" x2="75" y2="38" stroke="#556" stroke-width="3"/><rect x="63" y="16" width="5" height="14" rx="2" fill="#556"/><rect x="63" y="48" width="5" height="22" rx="2" fill="#556"/>',
  ofen: '<rect x="12" y="18" width="76" height="74" rx="6" fill="#e3e3e3" stroke="#444" stroke-width="3"/><rect x="22" y="40" width="56" height="42" rx="4" fill="#333"/><rect x="28" y="46" width="44" height="30" rx="3" fill="#f39c12" opacity=".7"/><circle cx="25" cy="29" r="4" fill="#444"/><circle cx="38" cy="29" r="4" fill="#444"/><rect x="58" y="26" width="24" height="6" rx="2" fill="#444"/>',
  decke: '<path d="M10 28 Q50 14 90 28 L90 78 Q50 64 10 78 Z" fill="#6aa7e0" stroke="#2c5d8a" stroke-width="3"/><path d="M10 45 Q50 31 90 45 M10 62 Q50 48 90 62" stroke="#fff" stroke-width="4" fill="none"/><path d="M14 80 l0 8 M24 77 l0 8 M34 75 l0 8 M66 75 l0 8 M76 77 l0 8 M86 80 l0 8" stroke="#2c5d8a" stroke-width="3"/>',
  tisch: '<rect x="8" y="34" width="84" height="11" rx="3" fill="#a0522d"/><rect x="16" y="45" width="8" height="46" rx="2" fill="#8b4513"/><rect x="76" y="45" width="8" height="46" rx="2" fill="#8b4513"/>',
  stuhl: '<rect x="28" y="8" width="8" height="84" rx="2" fill="#8b4513"/><rect x="28" y="50" width="44" height="9" rx="2" fill="#a0522d"/><rect x="64" y="59" width="8" height="33" rx="2" fill="#8b4513"/><rect x="36" y="16" width="0" height="0"/><rect x="28" y="16" width="8" height="8" fill="#a0522d"/>',
  fenster: '<rect x="15" y="10" width="70" height="80" fill="#bfe3ff" stroke="#8b5a2b" stroke-width="6"/><line x1="50" y1="10" x2="50" y2="90" stroke="#8b5a2b" stroke-width="5"/><line x1="15" y1="50" x2="85" y2="50" stroke="#8b5a2b" stroke-width="5"/>',
  lampe: '<path d="M30 12 L70 12 L84 44 L16 44 Z" fill="#f5c542" stroke="#a07a00" stroke-width="3"/><rect x="47" y="44" width="6" height="40" fill="#666"/><rect x="28" y="84" width="44" height="8" rx="3" fill="#666"/>',
  // Formen
  kreis: '<circle cx="50" cy="50" r="38" fill="#e74c3c"/>',
  quadrat: '<rect x="14" y="14" width="72" height="72" fill="#3498db"/>',
  dreieck: '<path d="M50 10 L90 86 L10 86 Z" fill="#2ecc71"/>',
  rechteck: '<rect x="6" y="28" width="88" height="46" fill="#f1c40f"/>',
  stern: '<path d="M50 6 L61 38 L95 38 L67 58 L78 92 L50 71 L22 92 L33 58 L5 38 L39 38 Z" fill="#f39c12"/>',
  herz: '<path d="M50 88 L14 52 Q2 36 14 22 Q30 8 50 28 Q70 8 86 22 Q98 36 86 52 Z" fill="#e84393"/>',
  oval: '<ellipse cx="50" cy="50" rx="42" ry="28" fill="#9b59b6"/>',
};

// [Bild, Artikel, Wort, Bereich, Englisch]
const WOERTER = [
  // Fahrzeuge
  ['🚗','das','Auto','fahrzeuge','car'], ['🚚','der','LKW','fahrzeuge','truck'], ['🚜','der','Traktor','fahrzeuge','tractor'],
  ['🚌','der','Bus','fahrzeuge','bus'], ['🚆','der','Zug','fahrzeuge','train'], ['✈️','das','Flugzeug','fahrzeuge','plane'],
  ['🚲','das','Fahrrad','fahrzeuge','bike'], ['🚢','das','Schiff','fahrzeuge','ship'], ['🚁','der','Hubschrauber','fahrzeuge','helicopter'],
  ['🏍️','das','Motorrad','fahrzeuge','motorbike'], ['🚒','das','Feuerwehrauto','fahrzeuge','fire engine'], ['🚓','das','Polizeiauto','fahrzeuge','police car'],
  ['🚑','der','Krankenwagen','fahrzeuge','ambulance'], ['🚀','die','Rakete','fahrzeuge','rocket'], ['🛴','der','Roller','fahrzeuge','scooter'],
  ['🏗️','der','Kran','fahrzeuge','crane'], ['⛵','das','Boot','fahrzeuge','boat'],
  // Tiere
  ['🐶','der','Hund','tiere','dog'], ['🐱','die','Katze','tiere','cat'], ['🐴','das','Pferd','tiere','horse'], ['🐮','die','Kuh','tiere','cow'],
  ['🐑','das','Schaf','tiere','sheep'], ['🐐','die','Ziege','tiere','goat'], ['🐔','das','Huhn','tiere','chicken'], ['🐓','der','Hahn','tiere','rooster'],
  ['🐤','das','Küken','tiere','chick'], ['🦆','die','Ente','tiere','duck'], ['svg:esel','der','Esel','tiere','donkey'], ['🐪','das','Kamel','tiere','camel'],
  ['🦁','der','Löwe','tiere','lion'], ['🐯','der','Tiger','tiere','tiger'], ['🐘','der','Elefant','tiere','elephant'], ['🦒','die','Giraffe','tiere','giraffe'],
  ['🐒','der','Affe','tiere','monkey'], ['🐻','der','Bär','tiere','bear'], ['🐰','der','Hase','tiere','rabbit'], ['🐭','die','Maus','tiere','mouse'],
  ['🐟','der','Fisch','tiere','fish'], ['🐬','der','Delfin','tiere','dolphin'], ['🐳','der','Wal','tiere','whale'], ['🐦','der','Vogel','tiere','bird'],
  ['🦋','der','Schmetterling','tiere','butterfly'], ['🐝','die','Biene','tiere','bee'], ['🐢','die','Schildkröte','tiere','turtle'], ['🐸','der','Frosch','tiere','frog'],
  ['🐌','die','Schnecke','tiere','snail'], ['🐧','der','Pinguin','tiere','penguin'], ['🦊','der','Fuchs','tiere','fox'], ['🦔','der','Igel','tiere','hedgehog'],
  ['🦉','die','Eule','tiere','owl'], ['🐊','das','Krokodil','tiere','crocodile'],
  // Zuhause
  ['🏠','das','Haus','zuhause','house'], ['🚪','die','Tür','zuhause','door'], ['svg:fenster','das','Fenster','zuhause','window'], ['🛏️','das','Bett','zuhause','bed'],
  ['🛋️','das','Sofa','zuhause','sofa'], ['svg:tisch','der','Tisch','zuhause','table'], ['svg:stuhl','der','Stuhl','zuhause','chair'], ['svg:decke','die','Decke','zuhause','blanket'],
  ['svg:kuehlschrank','der','Kühlschrank','zuhause','fridge'], ['svg:ofen','der','Ofen','zuhause','oven'], ['svg:lampe','die','Lampe','zuhause','lamp'], ['🔑','der','Schlüssel','zuhause','key'],
  ['🥄','der','Löffel','zuhause','spoon'], ['🍽️','der','Teller','zuhause','plate'], ['☕','die','Tasse','zuhause','cup'], ['🕯️','die','Kerze','zuhause','candle'],
  ['🚽','die','Toilette','zuhause','toilet'], ['🛁','die','Badewanne','zuhause','bathtub'], ['🧼','die','Seife','zuhause','soap'], ['✂️','die','Schere','zuhause','scissors'],
  ['📖','das','Buch','zuhause','book'], ['☎️','das','Telefon','zuhause','phone'], ['📺','der','Fernseher','zuhause','TV'], ['🧹','der','Besen','zuhause','broom'],
  ['🕌','die','Moschee','zuhause','mosque'],
  // Natur
  ['☀️','die','Sonne','natur','sun'], ['🌙','der','Mond','natur','moon'], ['⭐','der','Stern','natur','star'], ['☁️','die','Wolke','natur','cloud'],
  ['🌧️','der','Regen','natur','rain'], ['❄️','die','Schneeflocke','natur','snowflake'], ['🌈','der','Regenbogen','natur','rainbow'], ['⚡','der','Blitz','natur','lightning'],
  ['🌷','die','Blume','natur','flower'], ['🌻','die','Sonnenblume','natur','sunflower'], ['🌹','die','Rose','natur','rose'], ['🌳','der','Baum','natur','tree'],
  ['🌴','die','Palme','natur','palm tree'], ['🍁','das','Blatt','natur','leaf'], ['🍄','der','Pilz','natur','mushroom'], ['🌵','der','Kaktus','natur','cactus'],
  ['🏔️','der','Berg','natur','mountain'], ['🌊','die','Welle','natur','wave'], ['🔥','das','Feuer','natur','fire'], ['🌍','die','Erde','natur','earth'],
  // Essen
  ['🍎','der','Apfel','essen','apple'], ['🍌','die','Banane','essen','banana'], ['🍐','die','Birne','essen','pear'], ['🍓','die','Erdbeere','essen','strawberry'],
  ['🍇','die','Weintraube','essen','grapes'], ['🍋','die','Zitrone','essen','lemon'], ['🍊','die','Orange','essen','orange'], ['🍒','die','Kirsche','essen','cherry'],
  ['🍉','die','Melone','essen','melon'], ['🥕','die','Karotte','essen','carrot'], ['🍅','die','Tomate','essen','tomato'], ['🥒','die','Gurke','essen','cucumber'],
  ['🥔','die','Kartoffel','essen','potato'], ['🌽','der','Mais','essen','corn'], ['🍞','das','Brot','essen','bread'], ['🥨','die','Brezel','essen','pretzel'],
  ['🧀','der','Käse','essen','cheese'], ['🥚','das','Ei','essen','egg'], ['🥛','die','Milch','essen','milk'], ['💧','das','Wasser','essen','water'],
  ['🍰','der','Kuchen','essen','cake'], ['🍦','das','Eis','essen','ice cream'], ['🍯','der','Honig','essen','honey'], ['🍚','der','Reis','essen','rice'],
  // Körper
  ['👁️','das','Auge','koerper','eye'], ['👂','das','Ohr','koerper','ear'], ['👃','die','Nase','koerper','nose'], ['👄','der','Mund','koerper','mouth'],
  ['✋','die','Hand','koerper','hand'], ['🦶','der','Fuß','koerper','foot'], ['🦷','der','Zahn','koerper','tooth'], ['🦵','das','Bein','koerper','leg'], ['💪','der','Arm','koerper','arm'],
  // Kleidung
  ['👕','das','T-Shirt','kleidung','T-shirt'], ['👖','die','Hose','kleidung','trousers'], ['👗','das','Kleid','kleidung','dress'], ['👟','der','Schuh','kleidung','shoe'],
  ['👢','der','Stiefel','kleidung','boot'], ['🧢','die','Kappe','kleidung','cap'], ['🧦','die','Socke','kleidung','sock'], ['🧤','der','Handschuh','kleidung','glove'],
  ['🧣','der','Schal','kleidung','scarf'], ['👓','die','Brille','kleidung','glasses'], ['🧥','die','Jacke','kleidung','jacket'], ['🎩','der','Hut','kleidung','hat'],
  // Spielzeug
  ['⚽','der','Ball','spielzeug','ball'], ['🧸','der','Teddy','spielzeug','teddy'], ['🎲','der','Würfel','spielzeug','dice'], ['🎈','der','Luftballon','spielzeug','balloon'],
  ['🥁','die','Trommel','spielzeug','drum'], ['🎁','das','Geschenk','spielzeug','present'], ['🧩','das','Puzzle','spielzeug','puzzle'],
];

const BEREICHE = {
  fahrzeuge:['Fahrzeuge','🚗'], tiere:['Tiere','🐶'], zuhause:['Zuhause','🏠'], natur:['Natur','🌻'], essen:['Essen','🍎'],
  koerper:['Körper','✋'], kleidung:['Kleidung','👕'], spielzeug:['Spielzeug','⚽'],
};

const FARBEN = [['rot','#e53935'],['blau','#1e88e5'],['gelb','#fdd835'],['grün','#43a047'],['orange','#fb8c00'],['lila','#8e24aa'],
  ['rosa','#f48fb1'],['braun','#795548'],['schwarz','#212121'],['weiß','#ffffff'],['grau','#9e9e9e']];
const FORMEN = [['der','Kreis','kreis'],['das','Quadrat','quadrat'],['das','Dreieck','dreieck'],['das','Rechteck','rechteck'],['der','Stern','stern'],['das','Herz','herz'],['das','Oval','oval']];

const BUCHSTABEN_NAMEN = { A:'A',B:'Be',C:'Ze',D:'De',E:'E',F:'Eff',G:'Ge',H:'Ha',I:'I',J:'Jott',K:'Ka',L:'Ell',M:'Emm',N:'Enn',O:'O',P:'Pe',Q:'Ku',R:'Err',S:'Ess',T:'Te',U:'U',V:'Vau',W:'We',X:'Ix',Y:'Üpsilon',Z:'Zett',Ä:'Ä',Ö:'Ö',Ü:'Ü' };

const ARABISCH = [['ا','Alif'],['ب','Ba'],['ت','Ta'],['ث','Tha'],['ج','Dschim'],['ح','Ha'],['خ','Cha'],['د','Dal'],['ذ','Dhal'],['ر','Ra'],['ز','Zay'],['س','Sin'],['ش','Schin'],['ص','Sad'],['ض','Dad'],['ط','Ta (dick)'],['ظ','Za (dick)'],['ع','Ain'],['غ','Ghain'],['ف','Fa'],['ق','Qaf'],['ك','Kaf'],['ل','Lam'],['م','Mim'],['ن','Nun'],['ه','Ha (weich)'],['و','Waw'],['ي','Ya']];

const ZAHLWORTE_EN = ['zero','one','two','three','four','five','six','seven','eight','nine','ten'];

// Schreibschrift zum Nachspuren: Striche in Schreibreihenfolge (Rahmen -5 -5 110 110; Grundlinie y=80, Mittellinie y=45, Oberlinie y=10, Unterlinie y=99)
const BOGEN_L = (cx) => `M${cx+18} 62.5 A18 17.5 0 0 0 ${cx-18} 62.5 A18 17.5 0 0 0 ${cx+18} 62.5`; // Kreis links herum (a, d, g, q)
const BOGEN_R = (x) => `M${x} 62.5 A18 17.5 0 0 1 ${x+36} 62.5 A18 17.5 0 0 1 ${x} 62.5`;    // Kreis rechts herum (b, p)
const GLYPHEN = {
  a:[BOGEN_L(50),'M68 45 L68 80'], b:['M32 10 L32 80',BOGEN_R(32)], c:['M66 50 A18 17.5 0 1 0 66 75'], d:[BOGEN_L(50),'M68 10 L68 80'],
  e:['M33 62 L67 62 A17 17.5 0 1 0 63 75'], f:['M64 15 C58 7 44 8 44 22 L44 80','M32 45 L58 45'], g:[BOGEN_L(50),'M68 45 L68 88 Q68 99 52 99 Q40 99 35 93'],
  h:['M32 10 L32 80','M32 60 Q34 45 50 45 Q68 45 68 60 L68 80'], i:['M50 45 L50 80','M50 30 L50 31'], j:['M56 45 L56 90 Q56 99 44 99 Q36 99 33 94','M56 30 L56 31'],
  k:['M34 10 L34 80','M64 45 L34 66 L66 80'], l:['M50 10 L50 80'], m:['M24 45 L24 80','M24 58 Q25 45 37 45 Q50 45 50 58 L50 80','M50 58 Q51 45 63 45 Q76 45 76 58 L76 80'],
  n:['M32 45 L32 80','M32 60 Q34 45 50 45 Q68 45 68 60 L68 80'], o:['M50 45 A18 17.5 0 0 0 50 80 A18 17.5 0 0 0 50 45'], p:['M32 45 L32 99',BOGEN_R(32)],
  q:[BOGEN_L(50),'M68 45 L68 99'], r:['M34 45 L34 80','M34 60 Q38 45 54 45 Q62 45 66 49'],
  s:['M65 50 Q60 45 50 45 Q35 45 35 53 Q35 61 50 62.5 Q65 64 65 72 Q65 80 50 80 Q40 80 34 74'], t:['M46 18 L46 72 Q46 80 56 80 Q62 80 65 77','M32 45 L62 45'],
  u:['M32 45 L32 66 Q32 80 50 80 Q68 80 68 66','M68 45 L68 80'], v:['M32 45 L50 80 L68 45'], w:['M22 45 L36 80 L50 52 L64 80 L78 45'],
  x:['M34 45 L66 80','M66 45 L34 80'], y:['M32 45 L50 78','M68 45 L40 99'], z:['M34 45 L66 45 L34 80 L66 80'],
  A:['M50 10 L26 80','M50 10 L74 80','M34 56 L66 56'], B:['M30 10 L30 80','M30 10 L52 10 Q68 10 68 27 Q68 44 52 44 L30 44','M30 44 L55 44 Q72 44 72 62 Q72 80 55 80 L30 80'],
  C:['M72 22 Q62 10 50 10 Q24 10 24 45 Q24 80 50 80 Q62 80 72 68'], D:['M30 10 L30 80','M30 10 L46 10 Q72 10 72 45 Q72 80 46 80 L30 80'],
  E:['M32 10 L32 80','M32 10 L68 10','M32 45 L62 45','M32 80 L68 80'], F:['M32 10 L32 80','M32 10 L68 10','M32 45 L62 45'],
  G:['M72 22 Q62 10 50 10 Q24 10 24 45 Q24 80 50 80 Q72 80 72 58 L72 48 L54 48'], H:['M30 10 L30 80','M70 10 L70 80','M30 45 L70 45'], I:['M50 10 L50 80'],
  J:['M62 10 L62 62 Q62 80 46 80 Q34 80 30 70'], K:['M32 10 L32 80','M68 10 L32 50','M44 38 L70 80'], L:['M34 10 L34 80 L68 80'],
  M:['M24 80 L24 10 L50 55 L76 10 L76 80'], N:['M30 80 L30 10 L70 80 L70 10'], O:['M50 10 Q24 10 24 45 Q24 80 50 80 Q76 80 76 45 Q76 10 50 10'],
  P:['M32 10 L32 80','M32 10 L52 10 Q70 10 70 28 Q70 46 52 46 L32 46'], Q:['M50 10 Q24 10 24 45 Q24 80 50 80 Q76 80 76 45 Q76 10 50 10','M56 62 L76 84'],
  R:['M32 10 L32 80','M32 10 L52 10 Q70 10 70 28 Q70 46 52 46 L32 46','M48 46 L70 80'],
  S:['M68 20 Q62 10 50 10 Q30 10 30 27 Q30 42 50 45 Q70 48 70 63 Q70 80 50 80 Q36 80 30 70'], T:['M26 10 L74 10','M50 10 L50 80'],
  U:['M30 10 L30 58 Q30 80 50 80 Q70 80 70 58 L70 10'], V:['M26 10 L50 80 L74 10'], W:['M18 10 L34 80 L50 30 L66 80 L82 10'],
  X:['M28 10 L72 80','M72 10 L28 80'], Y:['M28 10 L50 45','M72 10 L50 45 L50 80'], Z:['M28 10 L72 10 L28 80 L72 80'],
  '0':['M50 10 Q28 10 28 45 Q28 80 50 80 Q72 80 72 45 Q72 10 50 10'], '1':['M36 24 L56 10 L56 80'], '2':['M30 24 Q34 10 50 10 Q68 10 68 27 Q68 40 30 80 L70 80'],
  '3':['M32 18 Q40 10 50 10 Q68 10 68 27 Q68 44 48 44 Q70 44 70 62 Q70 80 50 80 Q38 80 30 72'], '4':['M58 10 L28 58 L74 58','M60 36 L60 80'],
  '5':['M66 10 L36 10 L33 42 Q40 37 50 37 Q70 37 70 58 Q70 80 50 80 Q38 80 30 72'], '6':['M64 14 Q58 10 50 10 Q28 10 28 50 Q28 80 50 80 Q70 80 70 61 Q70 43 50 43 Q34 43 28 56'],
  '7':['M30 10 L70 10 L42 80'], '8':['M50 44 Q32 42 32 27 Q32 10 50 10 Q68 10 68 27 Q68 42 50 44 Q30 46 30 62 Q30 80 50 80 Q70 80 70 62 Q70 46 50 44'],
  '9':['M70 32 Q70 54 50 54 Q30 54 30 32 Q30 10 50 10 Q70 10 70 32 L70 50 Q70 80 46 80 Q36 80 32 74'],
};
// Umlaute = Grundbuchstabe + zwei Punkte
GLYPHEN['ä'] = [...GLYPHEN.a,'M42 32 L42 33','M58 32 L58 33']; GLYPHEN['ö'] = [...GLYPHEN.o,'M42 32 L42 33','M58 32 L58 33']; GLYPHEN['ü'] = [...GLYPHEN.u,'M42 32 L42 33','M58 32 L58 33'];
GLYPHEN['Ä'] = [...GLYPHEN.A,'M40 0 L40 1','M60 0 L60 1']; GLYPHEN['Ö'] = [...GLYPHEN.O,'M40 0 L40 1','M60 0 L60 1']; GLYPHEN['Ü'] = [...GLYPHEN.U,'M40 0 L40 1','M60 0 L60 1'];
