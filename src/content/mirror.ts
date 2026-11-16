// "Seni anlatan cümleler": tek tek konum yorumları yerine, haritadaki birleşimlerden çıkan somut, gündelik davranış cümleleri.
// Her cümle bir ya da birkaç koşula bağlıdır (burç, ev, açı, baskın element/nitelik, durağan/retro gezegen).
// Ağırlık: nadir ve güçlü birleşimler (açılar, evler) önce gösterilir. "Neden" satırı cümlenin haritanın neresinden geldiğini söyler.
import type { BodyId, Chart } from '../engine/astro';
import { angleDiff, houseOf } from '../engine/astro';
import type { L } from './base';

export type MirrorCat = 'self' | 'love' | 'social' | 'work' | 'home' | 'inner' | 'daily';
export const MIRROR_CATS: { key: MirrorCat; label: L }[] = [
  { key: 'self', label: { tr: 'Kişilik', en: 'Personality' } },
  { key: 'love', label: { tr: 'Aşk', en: 'Love' } },
  { key: 'social', label: { tr: 'Arkadaşlık', en: 'Friends' } },
  { key: 'work', label: { tr: 'İş ve para', en: 'Work & money' } },
  { key: 'home', label: { tr: 'Aile ve ev', en: 'Family & home' } },
  { key: 'inner', label: { tr: 'İç dünyan', en: 'Inner world' } },
  { key: 'daily', label: { tr: 'Günlük hayat', en: 'Daily life' } },
];
export interface MirrorLine { id: string; cat: MirrorCat; w: number; text: L; why: L }

type P = BodyId | 'asc' | 'mc';
const FIRE = [0, 4, 8], EARTH = [1, 5, 9], AIR = [2, 6, 10], WATER = [3, 7, 11];
const SN_TR = ['Koç', 'Boğa', 'İkizler', 'Yengeç', 'Aslan', 'Başak', 'Terazi', 'Akrep', 'Yay', 'Oğlak', 'Kova', 'Balık'];
const SN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const NM: Record<string, [string, string]> = {
  sun: ['Güneş', 'Sun'], moon: ['Ay', 'Moon'], mercury: ['Merkür', 'Mercury'], venus: ['Venüs', 'Venus'], mars: ['Mars', 'Mars'], jupiter: ['Jüpiter', 'Jupiter'],
  saturn: ['Satürn', 'Saturn'], uranus: ['Uranüs', 'Uranus'], neptune: ['Neptün', 'Neptune'], pluto: ['Plüton', 'Pluto'], chiron: ['Kiron', 'Chiron'], node: ['Kuzey Ay Düğümü', 'North Node'], lilith: ['Lilith', 'Lilith'],
  asc: ['Yükselen', 'Ascendant'], mc: ['MC', 'MC'],
};
type Asp = 'conj' | 'opp' | 'sq' | 'tri' | 'sex';
const ANG: Record<Asp, [number, number]> = { conj: [0, 8], opp: [180, 8], sq: [90, 7], tri: [120, 7], sex: [60, 4] };
const ASP_TR: Record<Asp, string> = { conj: 'kavuşum', opp: 'karşıt', sq: 'kare', tri: 'üçgen', sex: 'altmışlık' };
const ASP_EN: Record<Asp, string> = { conj: 'conjunction', opp: 'opposition', sq: 'square', tri: 'trine', sex: 'sextile' };

class Ctx {
  timed: boolean;
  constructor(public ch: Chart) { this.timed = ch.asc !== null && ch.cusps.length === 12; }
  lon(p: P): number | null { if (p === 'asc') return this.ch.asc; if (p === 'mc') return this.ch.mc; return this.ch.positions[p]?.lon ?? null; }
  sign(p: P) { const v = this.lon(p); return v === null ? -1 : Math.floor(v / 30); }
  house(p: P) { if (!this.timed) return 0; const v = this.lon(p); return v === null ? 0 : houseOf(v, this.ch.cusps); }
  retro(p: BodyId) { return !!this.ch.positions[p]?.retro; }
  asp(a: P, b: P, types: Asp[], orbMul = 1): Asp | null {
    const x = this.lon(a), y = this.lon(b);
    if (x === null || y === null) return null;
    const d = angleDiff(x, y);
    for (const t of types) if (Math.abs(d - ANG[t][0]) <= ANG[t][1] * orbMul) return t;
    return null;
  }
  /** Bir evdeki ya da burçtaki kişisel/sosyal gezegen sayısı */
  inHouse(h: number) { return this.timed ? (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as BodyId[]).filter(p => this.house(p) === h).length : 0; }
  elemScore(set: number[]) {
    const W: [P, number][] = [['sun', 3], ['moon', 3], ['asc', 3], ['mercury', 1], ['venus', 1], ['mars', 1], ['jupiter', 0.5], ['saturn', 0.5]];
    return W.reduce((a, [p, w]) => a + (set.includes(this.sign(p)) ? w : 0), 0);
  }
  modScore(mod: 0 | 1 | 2) {
    const W: [P, number][] = [['sun', 3], ['moon', 3], ['asc', 3], ['mercury', 1], ['venus', 1], ['mars', 1]];
    return W.reduce((a, [p, w]) => a + (this.sign(p) >= 0 && this.sign(p) % 3 === mod ? w : 0), 0);
  }
}

// "Neden" metni üreticileri
const inSign = (p: P, s: number[]) => ({ tr: `${NM[p][0]} ${s.map(i => SN_TR[i]).join(' / ')} burcunda`, en: `${NM[p][1]} in ${s.map(i => SN_EN[i]).join(' / ')}` });
const inHouse = (p: P, h: number) => ({ tr: `${NM[p][0]} ${h}. evde`, en: `${NM[p][1]} in house ${h}` });
const aspWhy = (a: P, b: P, t: Asp) => ({ tr: `${NM[a][0]}–${NM[b][0]} ${ASP_TR[t]}`, en: `${NM[a][1]}–${NM[b][1]} ${ASP_EN[t]}` });
const ELEM_TR = ['ateş', 'toprak', 'hava', 'su'], ELEM_EN = ['fire', 'earth', 'air', 'water'];
const elemOf = (s: number) => (FIRE.includes(s) ? 0 : EARTH.includes(s) ? 1 : AIR.includes(s) ? 2 : 3);

interface Rule { id: string; cat: MirrorCat; w: number; tr: string; en: string; test: (c: Ctx) => L | null }
const R = (id: string, cat: MirrorCat, w: number, tr: string, en: string, test: (c: Ctx) => L | null): Rule => ({ id, cat, w, tr, en, test });
const sgn = (p: P, s: number[]) => (c: Ctx) => (s.includes(c.sign(p)) ? inSign(p, s.filter(x => x === c.sign(p))) : null);
const hs = (p: P, hh: number[]) => (c: Ctx) => { const h = c.house(p); return h && hh.includes(h) ? inHouse(p, h) : null; };
const as = (a: P, b: P, types: Asp[], mul = 1) => (c: Ctx) => { const t = c.asp(a, b, types, mul); return t ? aspWhy(a, b, t) : null; };
const any = (...fs: ((c: Ctx) => L | null)[]) => (c: Ctx) => { for (const f of fs) { const r = f(c); if (r) return r; } return null; };
const HARD: Asp[] = ['conj', 'sq', 'opp'];

const RULES: Rule[] = [
  // ---------------- Kişilik ----------------
  R('sunmer', 'self', 2, 'Bir konuda fikrin sorulduğunda kısa cevap veremezsin; anlatırken düşünür, düşünürken anlatırsın. Fikirlerine itiraz edilince kendine itiraz edilmiş gibi hissedersin.', 'You can’t give a short answer when asked your opinion; you think while you talk. When your ideas are challenged, it feels personal.', as('sun', 'mercury', ['conj'], 0.9)),
  R('mismatch', 'self', 2, 'İnsanlar seni ilk tanıdıklarında başka biri sanır. Seni gerçekten tanıyanlar bir gün mutlaka “Aslında hiç göründüğün gibi değilmişsin” der.', 'People who first meet you think you’re someone else. Those who truly know you eventually say, “You’re nothing like I thought.”',
    c => { if (!c.timed) return null; const a = elemOf(c.sign('asc')), s = elemOf(c.sign('sun')), m = elemOf(c.sign('moon')); return a !== s && a !== m ? { tr: `Yükselen ${ELEM_TR[a]} grubunda, Güneş ve Ay başka elementlerde`, en: `Ascendant in ${ELEM_EN[a]}, Sun and Moon in other elements` } : null; }),
  R('satsun', 'self', 3, 'Küçükken yaşından büyük davranman beklendi ya da sen öyle hissettin. Hâlâ dinlenirken bile içinden “boşa vakit mi geçiriyorum” diye bir ses geçer.', 'As a child you were expected to act older, or felt you had to. Even resting, a voice asks, “Am I wasting time?”', as('saturn', 'sun', HARD, 0.8)),
  R('marsasc', 'self', 3, 'Sabırsızlığın yüzüne yansır: sıra beklerken ya da yavaş yürüyen birinin arkasında kaldığında içten içe kaynarsın.', 'Your impatience shows on your face: waiting in line or stuck behind a slow walker, you quietly boil.', any(as('mars', 'asc', ['conj'], 1), hs('mars', [1]))),
  R('jupasc', 'self', 3, 'Tanımadığın insanlar bile sana içini döker; otobüste yanına oturan biri birkaç dakikada sana hayat hikâyesini anlatabilir.', 'Even strangers open up to you; someone next to you on the bus can tell you their life story within minutes.', any(as('jupiter', 'asc', ['conj'], 1), hs('jupiter', [1]))),
  R('merrx', 'self', 2, 'Konuşmadan önce cümleyi kafanda birkaç kez kurarsın; gönderdiğin mesajı sonradan tekrar tekrar okursun.', 'You rehearse sentences in your head before speaking and reread messages after sending them.', c => (c.retro('mercury') ? { tr: 'Merkür doğumda retro', en: 'Mercury retrograde at birth' } : null)),
  R('sun12', 'self', 3, 'Övüldüğünde ne diyeceğini bilemezsin. Sahnede olmaktan çok perde arkasında işi çeviren olmayı seversin.', 'You don’t know what to say when praised. You prefer running things backstage to being on stage.', hs('sun', [12])),
  R('sun10', 'self', 2, 'Seni tanıyanlar önce ne iş yaptığını, neyi başardığını bilir; kimliğin ile işin iç içe geçmiştir.', 'People know you first by what you do and achieve; your identity and your work are intertwined.', hs('sun', [10])),
  R('leoasc', 'self', 2, 'İyi çıkmadığın fotoğraf paylaşılmaz. Bir ortama girdiğinde fark edilmek istersin, fark edilmeyince bozulursun.', 'A photo you don’t look good in doesn’t get posted. You want to be noticed when you walk in, and it stings when you aren’t.', any(sgn('asc', [4]), sgn('sun', [4]))),
  R('virgo', 'self', 2, 'Bir yere girdiğinde gözün önce kusuru görür: eğri duran tablo, yazım hatası, lekeli bardak.', 'When you enter a room your eye catches the flaw first: a crooked frame, a typo, a smudged glass.', any(sgn('moon', [5]), sgn('asc', [5]), sgn('mercury', [5]))),
  R('scorpmoon', 'self', 3, 'Seni kıran birini affetsen bile unutmazsın. “Tamam, geçti” dersin ama o dosya arşivde durur.', 'You may forgive someone who hurt you, but you don’t forget. You say “it’s fine,” but the file stays in the archive.', any(sgn('moon', [7]), as('moon', 'pluto', ['conj', 'sq', 'opp'], 0.8))),
  R('sag', 'self', 1, 'Bir yere bağlı kalmak seni boğar. Plan iptal olunca üzülmek yerine “O zaman başka yere gidelim” dersin.', 'Being tied down suffocates you. When plans fall through you say, “Then let’s go somewhere else.”', any(sgn('sun', [8]), sgn('moon', [8]), sgn('asc', [8]))),
  R('capmoon', 'self', 3, 'Duygularını göstermek sana zayıflık gibi gelir. En zor gününde bile “iyiyim” dersin ve çoğu insan buna inanır.', 'Showing emotion feels like weakness. On your worst day you say “I’m fine,” and most people believe you.', any(sgn('moon', [9]), as('moon', 'saturn', ['conj', 'sq', 'opp'], 0.8))),
  R('aqua', 'self', 1, 'Herkes bir şeyi sevmeye başlayınca sen ondan biraz soğursun; kalabalığın gittiği yolda yürümek istemezsin.', 'When everyone starts loving something, you cool off a little; you don’t want to walk the crowd’s road.', any(sgn('sun', [10]), sgn('asc', [10]))),
  R('piscmoon', 'self', 2, 'Bir şarkı, bir film sahnesi ya da bir koku seni birden yıllar öncesine götürür; bazen sebepsiz yere gözlerin dolar.', 'A song, a scene or a smell can take you back years in an instant; sometimes your eyes fill up for no reason.', any(sgn('moon', [11]), as('moon', 'neptune', ['conj', 'sq', 'opp'], 0.8))),
  R('ariesmoon', 'self', 2, 'Öfken çabuk gelir, çabuk gider. Kavgadan beş dakika sonra her şey normalmiş gibi davranırsın; karşındaki ise hâlâ kırgındır.', 'Your anger flares and fades fast. Five minutes after a fight you act as if nothing happened, while the other person is still hurt.', any(sgn('moon', [0]), as('moon', 'mars', ['conj', 'sq', 'opp'], 0.8))),
  R('taurmoon', 'self', 1, 'Değişiklik sana zor gelir: aynı kafeye gider, aynı yemeği sipariş eder, sevdiğin diziyi baştan izlersin.', 'Change is hard for you: same café, same order, rewatching the show you love.', any(sgn('moon', [1]), sgn('venus', [1]))),
  R('libra', 'self', 1, 'Karar verirken herkesin fikrini sorarsın; sonunda yine kararsız kalır, “Sen seç” dersin.', 'You ask everyone’s opinion before deciding, then still can’t choose and say, “You pick.”', any(sgn('moon', [6]), sgn('sun', [6]), sgn('asc', [6]))),
  R('cancer', 'self', 1, 'Eski fotoğrafları, mektupları, biletleri saklarsın; telefonun galerisi doludur ama silmeye kıyamazsın.', 'You keep old photos, letters and tickets; your phone gallery is full but you can’t bring yourself to delete.', any(sgn('moon', [3]), sgn('sun', [3]), hs('moon', [4]))),
  R('satasc', 'self', 3, 'İnsanlar seni hep yaşından olgun bulur. Gençken “çok ciddisin” denirdi; yaşın ilerledikçe daha genç görünür, daha rahat olursun.', 'People always find you older than your age. Young, you were “too serious”; as you age you look younger and loosen up.', any(as('saturn', 'asc', ['conj'], 1), hs('saturn', [1]))),
  R('fire', 'self', 1, 'Bir şeye karar verdiğinde hemen başlamak istersin; beklemek senin için en zor iş.', 'Once you decide, you want to start right away; waiting is the hardest thing for you.', c => (c.elemScore(FIRE) >= 7 ? { tr: 'Haritada ateş elementi baskın', en: 'Fire dominates your chart' } : null)),
  R('earth', 'self', 1, 'Gördüğüne inanırsın; soyut fikirler ve belirsiz planlar seni gerer.', 'You believe what you can see; abstract ideas and vague plans make you tense.', c => (c.elemScore(EARTH) >= 7 ? { tr: 'Haritada toprak elementi baskın', en: 'Earth dominates your chart' } : null)),
  R('fixed', 'self', 1, 'Bir kere karar verdin mi seni vazgeçirmek neredeyse imkânsız. “İnatçı” derler, sen “tutarlıyım” dersin.', 'Once you decide, changing your mind is nearly impossible. They call it stubborn; you call it consistent.', c => (c.modScore(1) >= 7 ? { tr: 'Haritada sabit burçlar baskın', en: 'Fixed signs dominate your chart' } : null)),
  R('mutable', 'self', 1, 'Planların sık değişir ve bu seni pek rahatsız etmez; son dakika kararları tam senlik.', 'Your plans change often and it barely bothers you; last-minute decisions are so you.', c => (c.modScore(2) >= 7 ? { tr: 'Haritada değişken burçlar baskın', en: 'Mutable signs dominate your chart' } : null)),
  R('cardinal', 'self', 1, 'Bir şeyi başlatan hep sensin; ama bitirme kısmını çoğu zaman başkasına bırakırsın.', 'You’re always the one who starts things, but you often leave the finishing to someone else.', c => (c.modScore(0) >= 8 ? { tr: 'Haritada öncü burçlar baskın', en: 'Cardinal signs dominate your chart' } : null)),

  // ---------------- Aşk ----------------
  R('ven12', 'love', 3, 'Gizli hayranlıklar senin hikâyen: biri seni sevdiğini çoğu zaman aylar sonra söyler, ya da sen birini uzaktan uzun süre sevmişsindir.', 'Secret crushes are your story: people often confess months later, or you’ve loved someone from afar for a long time.', any(hs('venus', [12]), as('venus', 'neptune', ['conj', 'sq', 'opp'], 0.8))),
  R('venfire', 'love', 1, 'Birinden hoşlandığında saklayamazsın: ya ilk adımı sen atarsın ya da çevrendeki herkes anlar.', 'You can’t hide a crush: either you make the first move or everyone around you figures it out.', sgn('venus', FIRE)),
  R('venearth', 'love', 1, 'Sevgi senin için sözle değil davranışla gösterilir: yemek yapmak, bir işini halletmek, sözünü tutmak.', 'Love, for you, is shown in actions, not words: cooking, sorting something out, keeping a promise.', sgn('venus', EARTH)),
  R('venair', 'love', 1, 'Seni etkilemenin yolu zihninden geçer; iyi sohbet edemeyen biri ne kadar çekici olursa olsun ilgini kaybeder.', 'The way to you is through your mind; someone who can’t hold a conversation loses you, however attractive.', sgn('venus', AIR)),
  R('venwater', 'love', 1, 'Bir ilişki bittiğinde bunu aylarca içinde yaşarsın; şarkılar, sokaklar, kokular sana hep onu hatırlatır.', 'When a relationship ends you carry it for months; songs, streets and smells keep reminding you.', sgn('venus', WATER)),
  R('vensat', 'love', 3, 'Sevildiğine inanmak sana zor gelir; biri sana ilgi gösterdiğinde önce içinden “Neden?” diye sorarsın.', 'Believing you’re loved is hard; when someone shows interest, your first thought is “Why?”', as('venus', 'saturn', HARD, 0.8)),
  R('venura', 'love', 3, 'Sıradan ilişkiler seni sıkar. Hayatına giren en önemli insanlar hep beklenmedik bir anda, beklenmedik bir yerden çıkar.', 'Ordinary relationships bore you. The most important people always appear unexpectedly, from unexpected places.', as('venus', 'uranus', HARD, 0.8)),
  R('venplu', 'love', 3, 'Ya hiç ya tamamen: yarım yamalak ilişkiler sana göre değil. Bağlandığında derin bağlanırsın ve kıskançlığı da iyi tanırsın.', 'All or nothing: half-hearted relationships aren’t for you. You bond deeply when you bond, and you know jealousy well.', as('venus', 'pluto', HARD, 0.8)),
  R('venmars', 'love', 2, 'Flört senin için bir oyun gibidir: bakışmalar, imalı mesajlar, kovalamaca. İlişkinin en sevdiğin kısmı başlangıcıdır.', 'Flirting is a game to you: glances, loaded texts, the chase. The beginning is your favourite part.', any(as('venus', 'mars', ['conj'], 1), hs('venus', [5]), hs('mars', [5]))),
  R('venrx', 'love', 3, 'Eski sevgililer hayatından tamamen çıkmaz; yıllar sonra bir mesaj gelir ya da sen onları düşünürken bulursun kendini.', 'Exes never fully leave your life; years later a message arrives, or you catch yourself thinking of them.', c => (c.retro('venus') ? { tr: 'Venüs doğumda retro', en: 'Venus retrograde at birth' } : null)),
  R('mars7', 'love', 3, 'Güçlü, iddialı, hatta biraz zor insanlardan etkilenirsin; ilişkide hiç tartışma yoksa tutku da yokmuş gibi gelir.', 'You’re drawn to strong, assertive, even difficult people; a relationship without arguments feels passionless.', hs('mars', [7])),
  R('sat7', 'love', 3, 'Ciddi ilişki konusunda temkinlisin; “Yanlış kişiyle olmaktansa yalnız olurum” dersin ve bunu gerçekten yaparsın.', 'You’re cautious about commitment; you say “better alone than with the wrong person,” and you mean it.', hs('saturn', [7])),
  R('moon7', 'love', 3, 'Yalnız kalmak sana uzun süre iyi gelmez; ruh hâlin büyük ölçüde yanındaki kişiye bağlıdır.', 'Being alone doesn’t suit you for long; your mood depends a lot on the person beside you.', hs('moon', [7])),
  R('venscorp', 'love', 2, 'Birini çözmeden ona güvenmezsin; sosyal medyasını, geçmişini, arkadaşlarını sessizce incelersin.', 'You don’t trust someone until you’ve figured them out; you quietly study their socials, past and friends.', sgn('venus', [7])),
  R('vengem', 'love', 2, 'Mesajlaşma senin için ilişkinin yarısıdır; iyi mesaj atamayan biriyle yürütemezsin.', 'Texting is half the relationship for you; it can’t work with someone who texts badly.', sgn('venus', [2])),
  R('vencap', 'love', 2, 'Ciddi düşünmediğin biriyle vakit harcamazsın; ilk buluşmada bile “Bu insanla bir gelecek olur mu?” diye bakarsın.', 'You don’t waste time on someone you aren’t serious about; even on a first date you ask yourself, “Is there a future here?”', sgn('venus', [9])),
  R('venaries', 'love', 2, 'Çabuk alevlenip çabuk sönebilirsin; ulaşılması zor insanlar ilgini daha çok çeker.', 'You can flare up and burn out fast; hard-to-get people intrigue you more.', sgn('venus', [0])),
  R('venleo', 'love', 2, 'Sevildiğini görmek istersin: sürprizler, jestler, herkesin önünde gösterilen sevgi. Unutulan bir özel gün seni çok kırar.', 'You want to see that you’re loved: surprises, gestures, love shown in public. A forgotten anniversary really hurts.', sgn('venus', [4])),
  R('venpisc', 'love', 2, 'Partnerini olduğundan iyi görürsün; gerçek yüzünü gördüğünde bile “Aslında iyi biri” dersin.', 'You see your partner as better than they are; even after seeing their true face you say, “Deep down they’re good.”', sgn('venus', [11])),
  R('venvirgo', 'love', 2, 'Sevgini küçük ayrıntılarla gösterirsin: kahvesini nasıl içtiğini hatırlarsın, hasta olduğunda ilacını sorarsın.', 'You show love in details: you remember how they take their coffee and ask about their medicine when they’re ill.', sgn('venus', [5])),
  R('venaqua', 'love', 2, 'Önce arkadaş olmak istersin; aşkın en güzel hâli sana göre en iyi arkadaşınla sevgili olmaktır.', 'You want friendship first; to you the best kind of love is being with your best friend.', sgn('venus', [10])),
  R('vensag', 'love', 2, 'Seni güldüren ve yeni yerler keşfettiren biri kalbini kazanır; kısıtlanmak ise ilişkiyi bitirir.', 'Someone who makes you laugh and explore wins your heart; feeling restricted ends it.', sgn('venus', [8])),
  R('vencan', 'love', 2, 'Sevdiğin insanı beslemek, korumak, kollamak istersin; ilişkide aradığın şey “ev” hissidir.', 'You want to feed, protect and look after the one you love; what you seek in a relationship is the feeling of home.', sgn('venus', [3])),
  R('venlib', 'love', 1, 'İlişkide estetik önemlidir: güzel bir akşam yemeği, özenle giyinmiş biri, kibar bir davranış seni hemen etkiler.', 'Aesthetics matter in love: a lovely dinner, someone well dressed, a polite gesture wins you over.', sgn('venus', [1, 6])),
  R('love5', 'love', 2, 'Aşık olmayı, aşkın kendisini seversin; hayatının dönemlerini o dönemde yaşadığın aşklarla hatırlarsın.', 'You love being in love; you remember chapters of your life by who you loved then.', c => (c.inHouse(5) >= 2 || c.house('sun') === 5 ? { tr: 'Güneş ya da birden çok gezegen 5. evde', en: 'Sun or several planets in house 5' } : null)),
  R('moonven', 'love', 2, 'İnsanlar senin yanında kendilerini rahat hisseder; çok kolay sevilen birisin.', 'People feel at ease around you; you are very easy to love.', as('moon', 'venus', ['conj', 'tri'], 1)),

  // ---------------- Arkadaşlık ve sosyal hayat ----------------
  R('h11', 'social', 3, 'Arkadaş grubunun organizatörü sensin; buluşmaları sen ayarlarsın, grubu bir arada tutan sensin.', 'You’re the organiser of your friend group; you set up the meetups and hold everyone together.', c => (c.inHouse(11) >= 2 || c.house('sun') === 11 ? { tr: 'Güneş ya da birden çok gezegen 11. evde', en: 'Sun or several planets in house 11' } : null)),
  R('moon11', 'social', 3, 'Arkadaşların senin ailen gibidir; kötü günde ilk aradığın kişi çoğu zaman ailenden değil arkadaşlarındandır.', 'Your friends are like family; on a bad day the first person you call is usually a friend.', hs('moon', [11])),
  R('sat11', 'social', 3, 'Arkadaş çevren küçük ama sağlamdır; yıllar içinde çok insan gider, birkaç kişi kalır ve onlar senin için her şeydir.', 'Your circle is small but solid; over the years many leave, a few stay, and they mean everything.', hs('saturn', [11])),
  R('mer3', 'social', 2, 'Herkesin haberi sende biter: kim ne yaptı, nereye gitti, kim kimden ayrıldı.', 'All the news ends up with you: who did what, who went where, who broke up.', any(hs('mercury', [3]), c => (c.inHouse(3) >= 2 ? { tr: 'Birden çok gezegen 3. evde', en: 'Several planets in house 3' } : null))),
  R('ura1', 'social', 3, 'Seni bir kalıba sokamazlar; çevrendeki insanlar senden bahsederken hep “O farklı” der.', 'People can’t fit you into a box; when they talk about you they always say, “They’re different.”', any(as('uranus', 'asc', ['conj'], 1), hs('uranus', [1]))),
  R('nep1', 'social', 3, 'İnsanlar sana kendi görmek istediklerini yansıtır; herkes seni biraz farklı tanır.', 'People project onto you what they want to see; everyone knows a slightly different you.', any(as('neptune', 'asc', ['conj'], 1), hs('neptune', [1]))),
  R('plu1', 'social', 3, 'Tek kelime etmeden bile ortamda ağırlığın hissedilir; bazı insanlar nedenini bilmeden senden çekinir.', 'Even silent, your presence is felt in the room; some people are wary of you without knowing why.', any(as('pluto', 'asc', ['conj'], 1), hs('pluto', [1]))),
  R('jup11', 'social', 2, 'Hayatındaki şansın çoğu arkadaşlar üzerinden gelir: iş, ev, hatta partner bile çoğu zaman bir arkadaş aracılığıyla.', 'Much of your luck comes through friends: a job, a home, even a partner often arrives via a friend.', hs('jupiter', [11])),
  R('air', 'social', 1, 'Sessizlik seni rahatsız eder; ortamda konuşma kesildiğinde ilk sen bir şey söylersin.', 'Silence makes you uneasy; when conversation stops, you’re the first to say something.', c => (c.elemScore(AIR) >= 7 ? { tr: 'Haritada hava elementi baskın', en: 'Air dominates your chart' } : null)),
  R('water', 'social', 1, 'Kalabalık bir ortamdan sonra kendini toparlamak için yalnız kalmaya ihtiyaç duyarsın.', 'After a crowd you need time alone to recharge.', c => (c.elemScore(WATER) >= 7 ? { tr: 'Haritada su elementi baskın', en: 'Water dominates your chart' } : null)),

  // ---------------- İş ve para ----------------
  R('boss', 'work', 2, 'Birinin emrinde çalışmak seni yorar; ya kendi işini istersin ya da kendi alanında söz sahibi olmayı.', 'Working under someone wears you out; you want your own business or the final say in your field.', any(hs('mars', [10]), c => (c.timed && FIRE.includes(c.sign('mc')) ? inSign('mc', [c.sign('mc')]) : null))),
  R('sat10', 'work', 3, 'Başarı sana geç ama sağlam gelir. Yaşıtların öne geçtiğinde sabırsızlanırsın; sonra bir bakarsın ki hepsini geçmişsin.', 'Success comes late but solid. You get impatient when peers get ahead, then one day you’ve passed them all.', hs('saturn', [10])),
  R('money2', 'work', 2, 'Para bir şekilde gelir; zor anlarda hep bir kapı açılır. Ama gelen parayı tutmak ayrı bir hikâye.', 'Money finds a way to come; a door always opens in hard times. Holding on to it is another story.', any(hs('jupiter', [2]), hs('venus', [2]))),
  R('sat2', 'work', 3, 'Para konusunda kaygılısın; hesabını sık sık kontrol eder, “Ya bir şey olursa” diye kenara bir şeyler koyarsın.', 'You worry about money; you check your balance often and put something aside “just in case.”', hs('saturn', [2])),
  R('mars6', 'work', 3, 'İşte en hızlı ve en çok çalışan sensin; sonra neden bu kadar yorulduğunu merak edersin.', 'At work you’re the fastest and hardest-working, then you wonder why you’re so tired.', hs('mars', [6])),
  R('lists', 'work', 2, 'Liste yapmadan güne başlayamazsın; işler kafanda değil, kâğıtta ya da telefonda durmalı.', 'You can’t start the day without a list; tasks belong on paper or in your phone, not in your head.', any(c => (c.inHouse(6) >= 2 ? { tr: 'Birden çok gezegen 6. evde', en: 'Several planets in house 6' } : null), sgn('sun', [5]))),
  R('nep10', 'work', 3, 'Ne olmak istediğini bulman uzun sürdü ya da hâlâ sürüyor; hayalindeki iş birkaç kez değişti.', 'Figuring out what you want to be took a long time, or still does; your dream job has changed several times.', hs('neptune', [10])),
  R('ura10', 'work', 3, 'Kariyer yolun düz bir çizgi değil; ani iş değişiklikleri ve beklenmedik meslekler senin hikâyende var.', 'Your career isn’t a straight line; sudden job changes and unexpected professions are part of your story.', hs('uranus', [10])),
  R('sunjup', 'work', 2, 'Büyük düşünürsün; küçük hedefler seni heyecanlandırmaz.', 'You think big; small goals don’t excite you.', as('sun', 'jupiter', ['conj', 'sq', 'opp', 'tri'], 0.8)),
  R('mersat', 'work', 2, 'Bir konuyu iyice öğrenmeden konuşmazsın; ama öğrendiğinde kimse senin kadar derin bilmez.', 'You don’t speak on a topic until you’ve mastered it, but once you have, nobody knows it as deeply.', as('mercury', 'saturn', ['conj', 'sq', 'opp', 'tri'], 0.8)),
  R('ven10', 'work', 3, 'İş hayatında sevilirsin; çoğu kapı yeteneğinden çok insanlarla kurduğun ilişkiler sayesinde açılır.', 'You’re well liked at work; many doors open more through your relationships than your skills.', hs('venus', [10])),
  R('h8', 'work', 2, 'Başkalarının parası, sırları ya da krizleri bir şekilde senin önüne düşer; insanlar sana en derin dertlerini anlatır.', 'Other people’s money, secrets or crises somehow land with you; people tell you their deepest troubles.', any(hs('sun', [8]), hs('moon', [8]), hs('venus', [8]))),

  // ---------------- Aile ve ev ----------------
  R('sat4', 'home', 3, 'Çocukluğunda bir eksiklik, katılık ya da erken yüklenen bir sorumluluk vardı; bu yüzden kendi düzenini, kendi evini kurmak senin için çok önemli.', 'There was some lack, strictness or early responsibility in childhood, so building your own home and order matters a lot.', hs('saturn', [4])),
  R('moonsat', 'home', 3, 'Ailende duygular pek açık konuşulmazdı; sevgi vardı ama sıcaklığı bazen eksik kaldı. Sen de sevgini sözden çok sorumluluk alarak gösterirsin.', 'Feelings weren’t talked about openly in your family; love was there, but warmth sometimes fell short. You show love by taking responsibility more than with words.', as('moon', 'saturn', HARD, 0.8)),
  R('ura4', 'home', 3, 'Çocukluğunda çok taşındın ya da evde beklenmedik değişiklikler oldu; bir yere kök salmak sana kolay gelmez.', 'You moved a lot as a child or home life changed unexpectedly; putting down roots doesn’t come easily.', hs('uranus', [4])),
  R('jup4', 'home', 2, 'Evin senin sığınağın; geniş, ferah, misafir ağırlayabileceğin bir ev hayal edersin.', 'Home is your sanctuary; you dream of a spacious, airy home where you can host.', hs('jupiter', [4])),
  R('home4', 'home', 2, 'Ev yemeği, aile sofrası ve kendi yatağın: uzun bir yolculuktan dönünce en çok bunları özlersin.', 'Home cooking, the family table and your own bed: that’s what you miss most after a long trip.', any(hs('moon', [4]), c => (c.inHouse(4) >= 2 ? { tr: 'Birden çok gezegen 4. evde', en: 'Several planets in house 4' } : null))),
  R('sun4', 'home', 3, 'Dışarıda sessiz olan sen evde bambaşka birisin; kendini en iyi kendi evinde ifade edersin.', 'Quiet outside, you’re someone else at home; you express yourself best in your own space.', hs('sun', [4])),
  R('mars4', 'home', 3, 'Evdeki tartışmalar seni çok yorar; ama kendi evinde son sözün sende olmasını da istersin.', 'Arguments at home drain you, yet in your own home you want the last word.', hs('mars', [4])),
  R('plu4', 'home', 3, 'Ailenin sende bıraktığı izleri anlamak için çok düşündün; geçmişinde aile sırları ya da derin değişimler var.', 'You’ve thought hard about the marks your family left; there are family secrets or deep changes in your past.', hs('pluto', [4])),

  // ---------------- İç dünya ----------------
  R('h12', 'inner', 3, 'Kimseye söylemediğin bir iç dünyan var; en büyük duygularını genelde yalnızken yaşarsın.', 'You have an inner world you share with no one; you feel your biggest feelings mostly alone.', any(hs('moon', [12]), c => (c.inHouse(12) >= 2 ? { tr: 'Birden çok gezegen 12. evde', en: 'Several planets in house 12' } : null))),
  R('nepstrong', 'inner', 3, 'Rüyaların çok canlıdır; bazen bir şeyi olmadan önce hissettiğini fark edersin.', 'Your dreams are vivid; sometimes you realise you sensed something before it happened.', any(as('neptune', 'sun', ['conj'], 1), as('neptune', 'moon', ['conj'], 1))),
  R('plulum', 'inner', 3, 'Hayatında birkaç kez “Eski ben öldü” diyebileceğin dönüşümler yaşadın; her krizden başka biri olarak çıktın.', 'You’ve gone through transformations where you could say “the old me died”; every crisis made you someone new.', any(as('pluto', 'sun', HARD, 0.8))),
  R('chiron', 'inner', 2, 'En çok acıtan yaran, başkalarına en iyi yardım edebildiğin alana dönüşür; insanlar dertlerini anlatmak için seni seçer.', 'Your deepest wound becomes where you help others best; people choose you to confide in.', any(as('chiron', 'sun', ['conj'], 1), as('chiron', 'moon', ['conj'], 1), as('chiron', 'asc', ['conj'], 1))),
  R('marsrx', 'inner', 3, 'Öfkeni içine atarsın; dışarıdan sakin görünürsün ama içinde biriken şey bir gün beklenmedik anda patlar.', 'You swallow anger; you look calm, but what builds up bursts out at an unexpected moment.', c => (c.retro('mars') ? { tr: 'Mars doğumda retro', en: 'Mars retrograde at birth' } : null)),
  R('merpisc', 'inner', 2, 'Kelimeler bazen ağzından istediğin gibi çıkmaz ama sezgilerin nadiren yanılır.', 'Words don’t always come out as you mean them, but your intuition is rarely wrong.', any(sgn('mercury', [11]), as('mercury', 'neptune', ['conj', 'sq', 'opp'], 0.8))),
  R('moonura', 'inner', 3, 'Duyguların hızla değişir; sabah çok mutluyken öğlen her şeyden sıkılmış olabilirsin. Kısıtlandığını hissedince nefes alamazsın.', 'Your feelings change fast; happy in the morning, bored of everything by noon. Feeling restricted, you can’t breathe.', as('moon', 'uranus', HARD, 0.8)),
  R('node7', 'inner', 2, 'Hayat seni “Ben tek başıma hallederim” alışkanlığından çıkarıp başkalarıyla birlikte olmayı öğrenmeye zorlar.', 'Life keeps pushing you out of “I’ll handle it alone” and into learning to share.', hs('node', [7])),
  R('node1', 'inner', 2, 'Başkalarını memnun etmeyi bırakıp kendi isteğini açıkça söylemeyi öğrenmek, senin hayat dersin.', 'Learning to stop pleasing others and say what you want is your life lesson.', hs('node', [1])),
  R('node10', 'inner', 2, 'Konfor alanından çıkıp görünür olmak senin yolun; saklandıkça hayat seni sahneye iter.', 'Stepping out of comfort and being seen is your path; the more you hide, the more life pushes you on stage.', hs('node', [10])),
  R('node4', 'inner', 2, 'Dışarıdaki başarı kadar iç huzurunu ve aileni beslemek senin asıl yolun.', 'Nourishing your inner peace and family, as much as outer success, is your real path.', hs('node', [4])),
  R('newmoon', 'inner', 2, 'Ne istediğini bilirsin ve iç dünyanla dış dünyan arasında pek çatışma yoktur; ama başkalarının bakış açısını anlamak sana zor gelebilir.', 'You know what you want, with little conflict between inner and outer you; seeing others’ viewpoints can be hard.', c => (c.sign('sun') === c.sign('moon') ? { tr: 'Güneş ve Ay aynı burçta', en: 'Sun and Moon in the same sign' } : null)),
  R('fullmoon', 'inner', 3, 'İçinde sürekli iki ses vardır: biri bir şey ister, diğeri tam tersini. Bu yüzden önemli kararlarda zorlanırsın.', 'There are always two voices inside you: one wants something, the other the opposite. Big decisions are hard.', as('sun', 'moon', ['opp'], 1)),
  R('sqmoon', 'inner', 3, 'Kendinle sık sık tartışırsın; mutlu olduğun anda bile “Bir şey eksik” hissi gelebilir.', 'You argue with yourself a lot; even when happy, a feeling of “something’s missing” can creep in.', as('sun', 'moon', ['sq'], 1)),

  // ---------------- Günlük hayat ----------------
  R('routine', 'daily', 1, 'Uyku ve yemek düzenin bozulunca bütün günün bozulur.', 'When your sleep or meals are off, your whole day is off.', any(sgn('moon', [1, 5]), sgn('mars', [1]))),
  R('merfire', 'daily', 1, 'Sözünü sakınmazsın; düşündüğünü olduğu gibi söylersin, sonra da “Acaba kırdım mı?” diye düşünürsün.', 'You don’t mince words; you say what you think, then wonder, “Did I hurt them?”', sgn('mercury', FIRE)),
  R('ven6', 'daily', 2, 'Güzel bir masa, güzel bir kupa, düzenli bir çalışma alanı: iş yaparken bile estetik istersin.', 'A nice desk, a pretty mug, a tidy workspace: you want beauty even while working.', hs('venus', [6])),
  R('moonmer', 'daily', 2, 'Duygularını yazarak ya da konuşarak çözersin; içini dökemediğin gün içinde kalır.', 'You work through feelings by writing or talking; a day you can’t let it out stays with you.', as('moon', 'mercury', ['conj'], 1)),
  R('moonjup', 'daily', 2, 'Cömertsin; birine bir şey alırken kendine bir şey aldığından daha çok mutlu olursun.', 'You’re generous; buying for someone else makes you happier than buying for yourself.', as('moon', 'jupiter', ['conj', 'tri'], 1)),
  R('gemmer', 'daily', 1, 'Aynı anda birkaç sekme açıktır: hem dizi izlersin, hem telefona bakarsın, hem de birine mesaj yazarsın.', 'Several tabs are always open: watching a show, scrolling, and texting someone at once.', any(sgn('mercury', [2]), sgn('moon', [2]))),

  // ---------------- Geniş kapsam: her haritada her kategoriye cümle düşsün diye burç ve ev bazlı cümleler ----------------
  // Güneş burcu (kişilik)
  R('sun0', 'self', 1, 'Bir yarışma, bir iddia ya da “Yapamazsın” cümlesi seni anında harekete geçirir.', 'A contest, a bet or “you can’t” sets you off instantly.', sgn('sun', [0])),
  R('sun1', 'self', 1, 'Rahatın kaçınca huysuzlaşırsın; güzel bir yemek ve sessiz bir akşam çoğu sorunu çözer.', 'You get grumpy when your comfort is disturbed; a good meal and a quiet evening fix most things.', sgn('sun', [1])),
  R('sun2', 'self', 1, 'Bir konuya çabuk ilgi duyar, çabuk sıkılırsın; yarım kalmış kitapların, hobilerin listesi uzundur.', 'You get interested fast and bored fast; your list of half-read books and abandoned hobbies is long.', sgn('sun', [2])),
  R('sun3', 'self', 1, 'Sevdiklerin üzüldüğünde onlardan önce sen üzülürsün; kırılınca kabuğuna çekilirsin.', 'You hurt for loved ones before they do; when hurt, you retreat into your shell.', sgn('sun', [3])),
  R('sun5', 'self', 1, 'Yardım istemek sana zor gelir; “Ben yaparım, en iyisi böyle” dersin ve genelde de haklısındır.', 'Asking for help is hard; you say “I’ll do it, it’s best this way,” and you’re usually right.', sgn('sun', [5])),
  R('sun7', 'self', 1, 'İnsanları tek bakışta okursun; yalan söyleyen birini yüzünden anlarsın.', 'You read people at a glance; you can tell a liar by their face.', sgn('sun', [7])),
  R('sun9', 'self', 1, 'Hedefin yoksa kendini boşlukta hissedersin; tatilde bile bir plan yaparsın.', 'Without a goal you feel adrift; you make plans even on holiday.', sgn('sun', [9])),
  R('sun11', 'self', 1, 'Başkalarının acısını kendi acın gibi hissedersin; haberleri izlemek bile seni yorabilir.', 'You feel others’ pain as your own; even watching the news can drain you.', sgn('sun', [11])),
  // Ay burcu (iç dünya)
  R('moon4', 'inner', 1, 'Fark edilmediğinde, takdir görmediğinde içten içe kırılırsın ama bunu kimseye göstermezsin.', 'When you go unnoticed or unappreciated you’re quietly hurt, but you never show it.', sgn('moon', [4])),
  R('moon10', 'inner', 1, 'Duygularına biraz mesafeden bakarsın; çok duygusal sahnelerde kendini gözlemci gibi hissedebilirsin.', 'You look at your feelings from a distance; in very emotional moments you can feel like an observer.', sgn('moon', [10])),
  R('moon2', 'inner', 1, 'Huzursuz olduğunda konuşmak, yazmak ya da bir şeyler okumak istersin; zihnin durmayınca uyuyamazsın.', 'When restless you need to talk, write or read; you can’t sleep when your mind won’t stop.', sgn('moon', [2])),
  R('moon8', 'inner', 1, 'Moralin bozulunca dört duvar arasında kalamazsın; dışarı çıkmak, yol, yeni bir yer sana iyi gelir.', 'When you’re down you can’t stay inside; going out, the road, somewhere new helps.', sgn('moon', [8])),
  R('moon6', 'inner', 1, 'Huzurun için ilişkilerinin düzgün gitmesi gerekir; biriyle küs kalmak bütün gününü zehirler.', 'Your peace needs your relationships to be okay; being on bad terms with someone poisons your day.', sgn('moon', [6])),
  R('moon1', 'inner', 1, 'Güvende hissetmek için elle tutulur şeylere ihtiyacın var: bir birikim, bir ev, sevdiğin eşyalar.', 'To feel safe you need tangible things: savings, a home, belongings you love.', sgn('moon', [1])),
  // Ay elementi (aile ve ev)
  R('mhome-f', 'home', 1, 'Evde enerji ve hareket istersin; çok sessiz, çok düzenli bir ev sana ruhsuz gelir.', 'You want energy and movement at home; a very quiet, very tidy house feels lifeless.', sgn('moon', FIRE)),
  R('mhome-e', 'home', 1, 'Evin düzenli olmadan rahatlayamazsın; her şeyin bir yeri vardır ve yerinde durmalıdır.', 'You can’t relax until home is in order; everything has a place and belongs there.', sgn('moon', EARTH)),
  R('mhome-a', 'home', 1, 'Evde de kendine ait bir alana ihtiyacın var; herkesin her şeyine karıştığı bir aile ortamı seni bunaltır.', 'Even at home you need your own space; a family where everyone meddles in everything smothers you.', sgn('moon', AIR)),
  R('mhome-w', 'home', 1, 'Ailenle aranda güçlü bir duygusal bağ var; uzakta olsan bile onların ruh hâlini hissedersin.', 'You have a strong emotional bond with family; even far away you sense their mood.', sgn('moon', WATER)),
  // Merkür elementi (arkadaşlık: konuşma tarzı)
  R('mer-f', 'social', 1, 'Konuşurken heyecanlanırsın, sesin yükselir, ellerin konuşur; hikâyeleri biraz abartarak anlatırsın.', 'You get excited when you talk, your voice rises, your hands join in; you tell stories with a little exaggeration.', sgn('mercury', FIRE)),
  R('mer-e', 'social', 1, 'Az ve öz konuşursun; boş muhabbetten sıkılır, “Sadede gel” demek istersin.', 'You speak briefly and to the point; small talk bores you and you want to say “get to the point.”', sgn('mercury', EARTH)),
  R('mer-a', 'social', 1, 'Herkesle konuşacak bir konu bulursun; espri anlayışın ve hazırcevaplığın ortamı canlandırır.', 'You find something to talk about with anyone; your wit and quick comebacks liven things up.', sgn('mercury', AIR)),
  R('mer-w', 'social', 1, 'İnsanlar sana kolayca açılır çünkü sadece sözlerini değil ses tonunu ve susuşlarını da dinlersin.', 'People open up easily because you hear not just their words but their tone and silences.', sgn('mercury', WATER)),
  // Mars elementi (günlük hayat: enerji)
  R('mars-f', 'daily', 1, 'Enerjin patlamalı gelir: bir gün her şeyi halledersin, ertesi gün yataktan çıkmak istemezsin.', 'Your energy comes in bursts: one day you do everything, the next you don’t want to leave bed.', sgn('mars', FIRE)),
  R('mars-e', 'daily', 1, 'Yavaş başlarsın ama bir kere başladın mı bitirmeden bırakmazsın.', 'You start slow, but once you start you don’t stop until it’s done.', sgn('mars', EARTH)),
  R('mars-a', 'daily', 1, 'Fiziksel yorgunluktan çok zihinsel yorgunluk seni çökertir; spor yaparken bile müzik ya da podcast açarsın.', 'Mental fatigue floors you more than physical; you play music or a podcast even while working out.', sgn('mars', AIR)),
  R('mars-w', 'daily', 1, 'Enerjin ruh hâline bağlıdır; moralin yerindeyken dağları devirirsin, değilken en küçük iş bile ağır gelir.', 'Your energy follows your mood; in good spirits you move mountains, in low spirits the smallest task feels heavy.', sgn('mars', WATER)),
  // Mars elementi (aşk: arzu)
  R('lmars-f', 'love', 1, 'İlgini çeken birine karşı sabırsızsın; uzun süre mesajlaşmak yerine bir an önce buluşmak istersin.', 'You’re impatient with someone you like; rather than texting for ages, you want to meet right away.', sgn('mars', FIRE)),
  R('lmars-e', 'love', 1, 'Tutkun yavaş ısınır ama uzun sürer; güven duymadığın birine kendini açmazsın.', 'Your passion warms slowly but lasts; you don’t open up to someone you don’t trust.', sgn('mars', EARTH)),
  R('lmars-a', 'love', 1, 'Zekâ seni tahrik eder; iyi bir tartışma ya da espri, fiziksel çekimden daha çok etkiler.', 'Intelligence turns you on; a good debate or joke does more than looks.', sgn('mars', AIR)),
  R('lmars-w', 'love', 1, 'Duygusal bağ kurmadan tutku hissetmezsin; ilişkide sessizce kırılır, sonra mesafe koyarsın.', 'Without an emotional bond there’s no passion; in relationships you get hurt quietly, then pull away.', sgn('mars', WATER)),
  // Satürn elementi (iş)
  R('sat-f', 'work', 1, 'Kendi başına inisiyatif alamadığın işlerde sönersin; liderlik etmen gerektiğinde ise başta çekinir, sonra en iyisini yaparsın.', 'You wilt where you can’t take initiative; when you must lead, you hesitate at first, then do it best.', sgn('saturn', FIRE)),
  R('sat-e', 'work', 1, 'Maddi güvenlik senin için önemlidir; riskli bir işe girmeden önce her ihtimali hesaplarsın.', 'Financial security matters; you calculate every outcome before taking a risk.', sgn('saturn', EARTH)),
  R('sat-a', 'work', 1, 'Bilgi senin sermayendir; yeni bir şey öğrenmediğin bir işte uzun süre kalamazsın.', 'Knowledge is your capital; you can’t stay long in a job where you don’t learn.', sgn('saturn', AIR)),
  R('sat-w', 'work', 1, 'İşte de duygusal olarak bağlanırsın; çalıştığın yere ve ekibe sadakatin yüzünden bazen fırsatları kaçırırsın.', 'You bond emotionally at work too; loyalty to your workplace and team sometimes costs you opportunities.', sgn('saturn', WATER)),
  // Yükselen (ilk izlenim, arkadaşlık)
  R('asc0', 'social', 2, 'İlk tanışmada biraz sert ya da aceleci görünebilirsin; insanlar senin ne kadar korumacı olduğunu sonra anlar.', 'At first you can seem blunt or rushed; people later see how protective you are.', sgn('asc', [0])),
  R('asc1', 'social', 2, 'İnsanlar sende bir sakinlik ve güven görür; kriz anlarında herkes sana bakar.', 'People see calm and reliability in you; in a crisis everyone looks to you.', sgn('asc', [1])),
  R('asc2', 'social', 2, 'Olduğundan genç görünürsün ve her ortama uyum sağlarsın; aynı gün üç farklı grupla takılabilirsin.', 'You look younger than you are and fit in anywhere; you can hang out with three different groups in one day.', sgn('asc', [2])),
  R('asc3', 'social', 2, 'İlk tanışmada çekingen olursun; ama birini sevdin mi onu aileden biri gibi kollarsın.', 'You’re shy at first, but once you like someone you look after them like family.', sgn('asc', [3])),
  R('asc5', 'social', 2, 'İnsanlar seni mesafeli ve mükemmeliyetçi sanır; aslında sadece önce ortamı tartıyorsundur.', 'People think you’re distant and perfectionist; you’re really just sizing up the room first.', sgn('asc', [5])),
  R('asc6', 'social', 2, 'Gülümsemen ve nezaketin kapıları açar; ama hayır demekte zorlanır, sonra pişman olursun.', 'Your smile and courtesy open doors, but you struggle to say no and regret it later.', sgn('asc', [6])),
  R('asc7', 'social', 2, 'Bakışların yoğundur; insanlar senin yanında ya çok rahatlar ya da gerilir, ortası yoktur.', 'Your gaze is intense; people either relax completely around you or tense up, nothing in between.', sgn('asc', [7])),
  R('asc8', 'social', 2, 'Neşen bulaşıcıdır; ama bazen düşünmeden söylediğin bir şaka birini kırabilir.', 'Your cheer is contagious, though a careless joke can sometimes hurt someone.', sgn('asc', [8])),
  R('asc9', 'social', 2, 'İlk izlenimde ciddi ve ulaşılmaz görünürsün; yakınların ise ne kadar komik olduğunu bilir.', 'At first you seem serious and unreachable; those close to you know how funny you are.', sgn('asc', [9])),
  R('asc10', 'social', 2, 'Herkesle arkadaş olursun ama gerçekten yakın olduğun insan sayısı azdır.', 'You’re friends with everyone, but truly close to very few.', sgn('asc', [10])),
  R('asc11', 'social', 2, 'Yüzünde hep biraz dalgın bir ifade vardır; insanlar sana dertlerini anlatmak için seni seçer.', 'There’s a dreamy look on your face; people pick you to share their troubles.', sgn('asc', [11])),
  // MC elementi (iş)
  R('mc-e', 'work', 1, 'Somut sonuç göremediğin bir işte mutlu olamazsın; emeğinin karşılığını elle tutmak istersin.', 'You can’t be happy where you don’t see concrete results; you want to hold the fruit of your work.', c => (c.timed && EARTH.includes(c.sign('mc')) ? inSign('mc', [c.sign('mc')]) : null)),
  R('mc-a', 'work', 1, 'İletişim, fikir ve insanlarla dolu işlerde parlarsın; tek başına sessiz bir masa işi seni söndürür.', 'You shine in work full of communication, ideas and people; a silent solo desk job dims you.', c => (c.timed && AIR.includes(c.sign('mc')) ? inSign('mc', [c.sign('mc')]) : null)),
  R('mc-w', 'work', 1, 'İşinin bir anlamı olmalı; insanlara dokunmayan, sadece para kazandıran bir iş seni tatmin etmez.', 'Your work must mean something; a job that only pays and touches no one doesn’t satisfy you.', c => (c.timed && WATER.includes(c.sign('mc')) ? inSign('mc', [c.sign('mc')]) : null)),
  // Venüs evleri (aşk)
  R('ven1', 'love', 2, 'Hoşlanılan, beğenilen biri olmaya alışkınsın; birinin seni sevmemesi seni gerçekten şaşırtır.', 'You’re used to being liked; someone not liking you genuinely surprises you.', hs('venus', [1])),
  R('ven7', 'love', 2, 'İlişki içindeyken kendini daha iyi hissedersin; uzun süre yalnız kalmak sana göre değil.', 'You feel better in a relationship; staying single for long isn’t for you.', hs('venus', [7])),
  R('ven11', 'love', 2, 'Aşkların çoğu arkadaşlıktan başlar; en iyi arkadaşına aşık olma ihtimalin yüksek.', 'Most of your loves start as friendships; you’re likely to fall for a best friend.', hs('venus', [11])),
  R('ven9', 'love', 2, 'Farklı kültürden, farklı şehirden ya da senden çok farklı biri seni çeker; uzak mesafe ilişkisi bile yaşayabilirsin.', 'Someone from another culture, city or very unlike you attracts you; you might even do long distance.', hs('venus', [9])),
  R('ven3', 'love', 2, 'Sohbet senin için ön sevişme gibidir; mesajlaşmalar, uzun telefon konuşmaları ilişkinin kalbidir.', 'Conversation is foreplay to you; texting and long calls are the heart of a relationship.', hs('venus', [3])),
  R('ven4', 'love', 2, 'Sevdiğin kişiyle bir yuva kurma hayali erken başlar; partnerini ailene ne zaman tanıtacağını düşünürsün.', 'Dreaming of a home with the one you love starts early; you wonder when to introduce them to family.', hs('venus', [4])),
  R('ven8', 'love', 2, 'Yüzeysel ilişkiler sana anlamsız gelir; biriyle sırlarını paylaşmadan gerçekten yakın hissetmezsin.', 'Shallow relationships feel meaningless; you don’t feel close to someone until you share secrets.', hs('venus', [8])),
  // Ay evleri (aile, iç dünya)
  R('moon10h', 'home', 2, 'Ailende senden hep bir şeyler beklendi; başarıların ailenin gururu oldu, bu da bazen bir yük gibi geldi.', 'Your family always expected things of you; your achievements became their pride, which sometimes felt like a burden.', hs('moon', [10])),
  R('moon9h', 'home', 2, 'Doğduğun yerde kalmak sana dar gelir; kendini en çok evinden uzaktayken özgür hissedersin.', 'Staying where you were born feels narrow; you feel freest far from home.', hs('moon', [9])),
  R('moon1h', 'inner', 2, 'Ne hissettiğin yüzünden okunur; saklamaya çalışsan da herkes ruh hâlini anlar.', 'Your feelings show on your face; even when you try to hide it, everyone reads your mood.', hs('moon', [1])),
  R('moon5h', 'inner', 2, 'Bir şey üretirken, oynarken, eğlenirken kendini en iyi hissedersin; içindeki çocuk hâlâ çok canlı.', 'You feel best when creating, playing, having fun; your inner child is still very alive.', hs('moon', [5])),
  R('moon6h', 'daily', 2, 'Stres doğrudan bedenine yansır: mide, uyku ya da cilt; iyi hissetmek için düzenli bir rutine ihtiyacın var.', 'Stress goes straight to your body: stomach, sleep or skin; you need a steady routine to feel good.', hs('moon', [6])),
  R('moon2h', 'daily', 2, 'Moralin bozulunca alışverişe ya da güzel bir yemeğe yönelirsin; kendini şımartmak sana iyi gelir.', 'When you’re down you turn to shopping or good food; treating yourself helps.', hs('moon', [2])),
  // Güneş evleri
  R('sun1h', 'self', 2, 'Nereye girersen gir varlığın hissedilir; kendini ifade etmeden duramazsın.', 'Wherever you go, your presence is felt; you can’t help expressing yourself.', hs('sun', [1])),
  R('sun7h', 'love', 2, 'Kendini en çok yanındaki kişinin aynasında tanırsın; hayatının dönüm noktaları hep bir ilişkiyle gelir.', 'You know yourself best in a partner’s mirror; your turning points always come through a relationship.', hs('sun', [7])),
  R('sun9h', 'self', 2, 'Hayatın anlamını sorgulamadan duramazsın; seyahat, okumak ve öğrenmek seni besler.', 'You can’t stop questioning life’s meaning; travel, reading and learning feed you.', hs('sun', [9])),
  R('sun6h', 'work', 2, 'İşe yaradığını hissetmediğin bir gün boşa geçmiş gibidir; çalışırken kendini en çok sen gibi hissedersin.', 'A day you don’t feel useful feels wasted; you feel most yourself while working.', hs('sun', [6])),
  R('sun2h', 'work', 2, 'Kendi paranı kazanmak sana özgüven verir; maddi bağımsızlık senin için bir kimlik meselesi.', 'Earning your own money gives you confidence; financial independence is part of your identity.', hs('sun', [2])),
  R('sun3h', 'social', 2, 'Yakın çevrende ve kardeşlerinle ilişkin hayatında büyük yer tutar; mahallenin, sınıfın, grubun sesi sensin.', 'Your close circle and siblings take a big place; you’re the voice of your neighbourhood, class or group.', hs('sun', [3])),
  R('sun5h', 'daily', 2, 'Hayatında eğlence ve yaratıcılık olmazsa sönersin; bir hobin ya da sahne alabileceğin bir alan şart.', 'Without fun and creativity you fade; a hobby or a stage of your own is a must.', hs('sun', [5])),
  // Jüpiter evleri
  R('jup10', 'work', 2, 'Kariyerde şanslısın; doğru zamanda doğru yerde olur, büyük fırsatları yakalarsın.', 'You’re lucky in career; you’re in the right place at the right time and catch big chances.', hs('jupiter', [10])),
  R('jup7', 'love', 2, 'Partnerlerin hayatına bir şey katar; ilişkiler seni büyütür ve şans getirir.', 'Your partners add something to your life; relationships help you grow and bring luck.', hs('jupiter', [7])),
  R('jup9', 'social', 2, 'Yabancılarla, farklı kültürden insanlarla kolay arkadaş olursun; yolculuklarda hayat boyu sürecek dostluklar kurarsın.', 'You befriend foreigners and people from other cultures easily; journeys bring you lifelong friends.', hs('jupiter', [9])),
  R('jup6', 'daily', 2, 'İşini sevdiğin sürece yorgunluk hissetmezsin; çalışma ortamında hep bir şans ya da destek bulursun.', 'As long as you love your work you don’t feel tired; you always find luck or support at work.', hs('jupiter', [6])),
  R('jup12', 'inner', 2, 'Zor anlarda görünmez bir el sana yardım ediyormuş gibi hissedersin; en kötü anda bir çıkış yolu hep belirir.', 'In hard times it feels like an unseen hand helps you; at the worst moment a way out always appears.', hs('jupiter', [12])),
  // Venüs elementi (ev: zevk ve dekor)
  R('vhome-f', 'home', 1, 'Evinde canlı renkler, cesur parçalar ve biraz dağınıklık olur; müzesi gibi bir ev sana göre değil.', 'Your home has bold colours, statement pieces and a bit of mess; a museum-like home isn’t you.', sgn('venus', FIRE)),
  R('vhome-e', 'home', 1, 'Evine kaliteli, uzun ömürlü şeyler alırsın; yumuşak bir koltuk ve güzel bir mutfak senin için lüks değil ihtiyaç.', 'You buy quality, long-lasting things for home; a soft sofa and a good kitchen are needs, not luxuries.', sgn('venus', EARTH)),
  R('vhome-a', 'home', 1, 'Ferah, aydınlık ve sade bir ev istersin; çok eşya seni boğar, sık sık mobilyaların yerini değiştirirsin.', 'You want an airy, bright, simple home; too much stuff suffocates you and you often rearrange furniture.', sgn('venus', AIR)),
  R('vhome-w', 'home', 1, 'Evin anılarla doludur: fotoğraflar, hediyeler, kokulu mumlar; her eşyanın bir hikâyesi vardır.', 'Your home is full of memories: photos, gifts, scented candles; every object has a story.', sgn('venus', WATER)),
  // Jüpiter elementi (iç dünya: umut ve inanç)
  R('jin-f', 'inner', 1, 'Umudunu kaybetmek sana zor gelir; en kötü günde bile içinden “Bir şekilde olacak” diye bir ses gelir.', 'Losing hope is hard for you; even on the worst day a voice says, “It’ll work out somehow.”', sgn('jupiter', FIRE)),
  R('jin-e', 'inner', 1, 'İnancın somut şeylere dayanır; emek verdiğin şeyin karşılığını alacağına güvenirsin.', 'Your faith rests on concrete things; you trust that effort will be rewarded.', sgn('jupiter', EARTH)),
  R('jin-a', 'inner', 1, 'Bir şeye inanmak için onu anlaman gerekir; sorgulamadan kabul ettiğin pek az şey vardır.', 'To believe something you need to understand it; you accept very little without questioning.', sgn('jupiter', AIR)),
  R('jin-w', 'inner', 1, 'Sezgilerine ve işaretlere inanırsın; tesadüf denilen şeylerin çoğu sana anlamlı gelir.', 'You trust intuition and signs; most so-called coincidences feel meaningful to you.', sgn('jupiter', WATER)),
  // Lilith elementi (iç dünya: saklı yan)
  R('lil-f', 'inner', 1, 'İçinde kimsenin bilmediği bir öfke ya da hırs var; haksızlığa uğradığında o yan birden ortaya çıkar.', 'There’s an anger or ambition inside no one knows about; injustice brings it out suddenly.', sgn('lilith', FIRE)),
  R('lil-e', 'inner', 1, 'Kontrolü kaybetmekten korkarsın; her şeyi kendin halletmek istemen aslında bu korkudan gelir.', 'You fear losing control; wanting to handle everything yourself really comes from that fear.', sgn('lilith', EARTH)),
  R('lil-a', 'inner', 1, 'Kimseye bağımlı olmamak için duygularını mantıkla bastırırsın; yakınlık bazen seni korkutur.', 'To avoid depending on anyone you override feelings with logic; closeness sometimes scares you.', sgn('lilith', AIR)),
  R('lil-w', 'inner', 1, 'Duygusal olarak terk edilmekten korkarsın; bu yüzden bazen sevdiklerine ihtiyacın olduğunu söyleyemezsin.', 'You fear emotional abandonment, so sometimes you can’t tell loved ones you need them.', sgn('lilith', WATER)),
];

/** Haritaya uyan bütün cümleler, ağırlığa göre sıralı */
export function mirrorLines(ch: Chart): MirrorLine[] {
  const c = new Ctx(ch);
  const out: MirrorLine[] = [];
  for (const r of RULES) {
    let why: L | null = null;
    try { why = r.test(c); } catch { why = null; }
    if (why) out.push({ id: r.id, cat: r.cat, w: r.w, text: { tr: r.tr, en: r.en }, why });
  }
  return out.sort((a, b) => b.w - a.w);
}
