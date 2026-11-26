// İlişki hikâyesi: olay haritaları (tanışma, ilk adım, ilk buluşma, başlangıç, ayrılık, barışma), iki doğum haritasının
// dürüst sinastrisi ve kompozit zamanlaması. Yapay zekâ değildir; kurallar "İlişki Astrolojisi Yorum Promptu"ndan gelir:
// zor göstergeler yumuşatılmaz, yapay denge kurulmaz, transit bahane edilmez, olay uydurulmaz, gelecek vaat edilmez.
import type { BodyId, Chart } from './astro';
import { computeChart, bodyLon, norm, angleDiff, PLANETS, SIGN_RULERS } from './astro';
import { compositeChart } from './techniques';
import { SIGNS } from '../content/base';

export type EvType = 'meet' | 'firstMove' | 'firstDate' | 'start' | 'breakup' | 'reunion';
export interface RelEvent { id: string; type: EvType; date: string; time?: string; place?: { label: string; lat: number; lon: number; tz: string } }
export interface Item { tech: string; text: string; voice?: string }
export interface Sec { emoji: string; title: string; items: Item[] }
export interface EventCard { emoji: string; title: string; opening: string; secs: Sec[]; note?: string; when: number }
export interface Reading { title: string; opening: string; secs: Sec[]; truths: string[]; summary: string; next: string; note?: string; theme?: string; events?: EventCard[]; links?: Item[] }
export interface Person { name: string; gender?: 'f' | 'm'; chart: Chart }

export const EV_LABEL: Record<EvType, string> = { meet: 'Tanışma', firstMove: 'İlk adım / ilk mesaj', firstDate: 'İlk buluşma', start: 'İlişkinin başlangıcı', breakup: 'Ayrılık', reunion: 'Barışma' };
const START_TYPES: EvType[] = ['meet', 'firstMove', 'firstDate', 'start', 'reunion'];

// ---------------- yardımcılar ----------------
// Türkçe ek uyumu (isim ve gezegen adlarına iyelik/ilgi/yönelme ekleri)
const VOW = 'aıoueiöü';
const lastV = (w: string) => { for (let i = w.length - 1; i >= 0; i--) { const ch = w[i].toLocaleLowerCase('tr'); if (VOW.includes(ch)) return ch; } return 'e'; };
const h4 = (w: string) => ({ a: 'ı', ı: 'ı', o: 'u', u: 'u', e: 'i', i: 'i', ö: 'ü', ü: 'ü' } as Record<string, string>)[lastV(w)];
const h2 = (w: string) => ('aıou'.includes(lastV(w)) ? 'a' : 'e');
const endsV = (w: string) => VOW.includes(w[w.length - 1].toLocaleLowerCase('tr'));
const acro = (w: string) => /^[A-Z]{2,}$/.test(w);
/** ilgi: Ayşe’nin, Can’ın */
export const gen = (w: string) => w + '’' + (endsV(w) ? 'n' : '') + h4(w) + 'n';
/** iyelik (3. tekil): Venüs’ü, Ay’ı, MC’si */
const poss = (w: string) => w.endsWith(')') || w.endsWith('sı') || w.endsWith('si') ? w : acro(w) ? w + '’si' : w + '’' + (endsV(w) ? 's' : '') + h4(w);
/** iyelik + yönelme: Mars’ına, Yükselen’ine */
const dat3 = (w: string) => (acro(w) ? w + '’sine' : poss(w) + 'n' + h2(poss(w)));

const NM: Record<string, string> = { sun: 'Güneş', moon: 'Ay', mercury: 'Merkür', venus: 'Venüs', mars: 'Mars', jupiter: 'Jüpiter', saturn: 'Satürn', uranus: 'Uranüs', neptune: 'Neptün', pluto: 'Plüton', node: 'Kuzey Ay Düğümü', chiron: 'Kiron', juno: 'Juno', asc: 'Yükselen', dsc: 'Alçalan', mc: 'MC', ic: 'IC' };
type Asp = 'conjunction' | 'opposition' | 'square' | 'trine' | 'sextile' | 'quincunx';
const ANG: Record<Asp, number> = { conjunction: 0, opposition: 180, square: 90, trine: 120, sextile: 60, quincunx: 150 };
const ASP_TR: Record<Asp, string> = { conjunction: 'kavuşum', opposition: 'karşıt', square: 'kare', trine: 'üçgen', sextile: 'altmışlık', quincunx: 'quincunx' };
const HARD: Asp[] = ['conjunction', 'opposition', 'square'];
const SOFT: Asp[] = ['trine', 'sextile'];
type Pt = BodyId | 'asc' | 'dsc' | 'mc' | 'ic';
const lonOf = (c: Chart, p: Pt): number | null => p === 'asc' ? c.asc : p === 'mc' ? c.mc : p === 'dsc' ? (c.asc === null ? null : norm(c.asc + 180)) : p === 'ic' ? (c.mc === null ? null : norm(c.mc + 180)) : c.positions[p]?.lon ?? null;
const timedOf = (c: Chart) => c.asc !== null && c.cusps.length === 12;
const deg = (lon: number) => `${SIGNS[Math.floor(lon / 30)].tr} ${Math.floor(lon % 30)}°`;
const where = (c: Chart, p: BodyId) => `${deg(c.positions[p].lon)}${timedOf(c) && c.positions[p].house ? `, ${c.positions[p].house}. ev` : ''}${c.positions[p].retro ? ' ℞' : ''}`;
function aspectOf(a: number, b: number, types: Asp[] = ['conjunction', 'opposition', 'square', 'trine', 'sextile', 'quincunx'], maxOrb = 6): { type: Asp; orb: number } | null {
  const d = angleDiff(a, b);
  let best: { type: Asp; orb: number } | null = null;
  for (const t of types) { const o = Math.abs(d - ANG[t]); if (o <= (t === 'quincunx' ? Math.min(3, maxOrb) : maxOrb) && (!best || o < best.orb)) best = { type: t, orb: o }; }
  return best;
}
const orbTxt = (o: number) => `${o < 1 ? o.toFixed(1) : Math.round(o)}°${o <= 2 ? ', tam' : ''}`;
interface A { a: Pt; b: Pt; type: Asp; orb: number }
function aspectsIn(c: Chart, pts: Pt[] = [...PLANETS, 'asc', 'mc']): A[] {
  const out: A[] = [];
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
    const x = lonOf(c, pts[i]), y = lonOf(c, pts[j]);
    if (x === null || y === null) continue;
    if ((pts[i] === 'asc' && pts[j] === 'mc')) continue;
    const r = aspectOf(x, y);
    if (r) out.push({ a: pts[i], b: pts[j], ...r });
  }
  return out.sort((p, q) => p.orb - q.orb);
}
function cross(c1: Chart, p1: Pt[], c2: Chart, p2: Pt[], types?: Asp[], orb = 6): A[] {
  const out: A[] = [];
  for (const a of p1) for (const b of p2) {
    const x = lonOf(c1, a), y = lonOf(c2, b);
    if (x === null || y === null) continue;
    const r = aspectOf(x, y, types, orb);
    if (r) out.push({ a, b, ...r });
  }
  return out.sort((p, q) => p.orb - q.orb);
}
const findA = (list: A[], a: Pt, b: Pt, types?: Asp[]) => list.find(x => ((x.a === a && x.b === b) || (x.a === b && x.b === a)) && (!types || types.includes(x.type)));
const aTxt = (x: A, c1 = '', c2 = '') => `${c1}${NM[x.a]} ${ASP_TR[x.type]} ${c2}${NM[x.b]} (${orbTxt(x.orb)})`;

function moonPhaseOf(c: Chart) {
  const a = norm(c.positions.moon.lon - c.positions.sun.lon);
  if (a < 45) return { key: 'new', name: 'yeni ay', a };
  if (a < 90) return { key: 'crescent', name: 'hilal', a };
  if (a < 135) return { key: 'first', name: 'ilk dördün', a };
  if (a < 180) return { key: 'gibbous', name: 'şişkin ay', a };
  if (a < 225) return { key: 'full', name: 'dolunay', a };
  if (a < 270) return { key: 'disseminating', name: 'yayılan ay', a };
  if (a < 315) return { key: 'last', name: 'son dördün', a };
  return { key: 'balsamic', name: 'balsamik ay', a };
}
const PHASE_MEAN: Record<string, string> = {
  new: 'Yeni ayda başlayan şeyler içgüdüyle, düşünmeden başlar; ilişki kendini zamanla tanır.',
  crescent: 'Hilal evresi: başlangıç heyecanı var ama eski alışkanlıklar geri çeker; ilk aylarda sınav gelir.',
  first: 'İlk dördün: kriz evresi. İlişki sürtünmeyle büyür; karar anları erken gelir.',
  gibbous: 'Şişkin ay: ince ayar evresi. İlişki “doğru mu yapıyoruz?” sorusuyla yaşanır.',
  full: 'Dolunay: her şey görünür. Yoğun ve aynalayan bir bağ; karşıtlıklar ya tamamlanır ya kopar.',
  disseminating: 'Yayılan ay: olgun bir evre; paylaşım öne çıkar ama başlangıç ateşi yoktur.',
  last: 'Son dördün: bir şeyin bırakılması gereken evre. İlişki bir inanç ya da alışkanlık krizini taşır.',
  balsamic: 'Balsamik ay: döngünün sonu. Bu evrede başlayan ilişkiler genelde eski bir hikâyeyi kapatan, kısa ama yoğun bağlardır.',
};
function station(id: BodyId, d: Date): 'retro' | 'direct' | 'stationRx' | 'stationD' {
  const sp = (t: Date) => { let x = norm(bodyLon(id, new Date(t.getTime() + 864e5 / 2)) - bodyLon(id, new Date(t.getTime() - 864e5 / 2))); if (x > 180) x -= 360; return x; };
  const before = sp(new Date(d.getTime() - 4 * 864e5)), after = sp(new Date(d.getTime() + 4 * 864e5)), now = sp(d);
  if (before > 0 && after < 0) return 'stationRx';
  if (before < 0 && after > 0) return 'stationD';
  return now < 0 ? 'retro' : 'direct';
}
export function parseEventDate(ev: RelEvent): { y: number; m: number; d: number; h: number; mi: number; timed: boolean } | null {
  const m = ev.date.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/) || ev.date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [y, mo, d] = ev.date.includes('-') && m[1].length === 4 ? [+m[1], +m[2], +m[3]] : [+m[3], +m[2], +m[1]];
  const t = ev.time?.match(/^(\d{1,2})[:.](\d{2})$/);
  return { y, m: mo, d, h: t ? +t[1] : 12, mi: t ? +t[2] : 0, timed: !!t };
}
export function eventChart(ev: RelEvent, place: { lat: number; lon: number; tz: string }): Chart | null {
  const p = parseEventDate(ev);
  if (!p) return null;
  try { return computeChart({ year: p.y, month: p.m, day: p.d, hour: p.h, minute: p.mi, timeKnown: p.timed, lat: place.lat, lon: place.lon, tz: place.tz }); } catch { return null; }
}

// ---------------- kişinin aşk kalıpları (doğum haritası) ----------------
interface Pattern { w: number; tech: string; text: string; voice?: string; truth?: string; good?: boolean }
export function lovePatterns(p: Person): Pattern[] {
  const c = p.chart, N = p.name || 'Bu kişi';
  const asp = aspectsIn(c, [...PLANETS, 'chiron', 'node', 'asc']);
  const out: Pattern[] = [];
  const hit = (a: Pt, b: Pt, types: Asp[], mk: (x: A) => Pattern) => { const x = findA(asp, a, b, types); if (x) out.push(mk(x)); };
  hit('venus', 'saturn', HARD, x => ({ w: 3, tech: aTxt(x), text: 'Sevgiyi göstermekte zorlanır; yakınlık arttıkça soğuklaşır ve mesafe koyar. Reddedilme korkusu sevgiyi hesaba çevirir.', voice: 'Fazla açılırsam kaybederim.', truth: `${N} sevgiyi göstermekte cimridir. Bu soğukluk karşısındakinden değil, kendi korkusundan gelir ve kendiliğinden geçmez.` }));
  hit('venus', 'uranus', HARD, x => ({ w: 3, tech: aTxt(x), text: 'Bağlanma ile özgürlük arasında gider gelir. İlişki ciddileştiği anda soğur ya da ani bir kopuş yaratır.', voice: 'Boğuluyorum, nefes almam lazım.', truth: `${N} bağlandıkça kaçar. Bu bir dönem meselesi değil, doğuştan gelen kalıbı.` }));
  hit('moon', 'uranus', HARD, x => ({ w: 3, tech: aTxt(x), text: 'Duygusal baskı hissettiğinde kaçar; bir gün çok yakın, ertesi gün ulaşılmaz.', voice: 'Bana bu kadar yüklenme.', truth: `${N} baskı altında kalınca kaçar. Bu karşısındakinin suçu değil, onun kalıbı; tekrar eder.` }));
  hit('venus', 'neptune', [...HARD, 'quincunx'], x => ({ w: 3, tech: aTxt(x), text: 'Sevdiğini idealize eder; gerçek kişiyi değil, kafasındaki kişiyi sever. Hayal kırıklığı bu açının kaderidir.', voice: 'Aslında öyle biri değil, değişecek.', truth: `${N} karşısındakini olduğu kişi olarak değil, olmasını istediği kişi olarak sever.` }));
  hit('venus', 'pluto', HARD, x => ({ w: 3, tech: aTxt(x), text: 'Ya hep ya hiç. Sevdiğinde sahiplenir, kıskanır, kontrol etmek ister; ayrılıkları da yakıp yıkarak yaşar.', voice: 'Ya tamamen benimsin ya hiç.', truth: `${N} sevdiğinde kontrol eder. Kıskançlık bu ilişkide yan etki değil, merkezde.` }));
  hit('moon', 'pluto', HARD, x => ({ w: 3, tech: aTxt(x), text: 'Duyguları yoğun ve takıntılı; terk edilme korkusu güç mücadelesine dönüşür.', voice: 'Beni bırakmadan ben bırakmalıyım.', truth: `${N} terk edilmekten korktuğu için önce kendisi güç kurar; bu da ilişkiyi zehirler.` }));
  hit('mars', 'pluto', HARD, x => ({ w: 2, tech: aTxt(x), text: 'Öfkesi derin ve patlayıcı; tartışmalar kolayca güç savaşına döner, kimse geri adım atmaz.', truth: `${N} kavgada kazanmak ister; uzlaşma onun için yenilgi gibidir.` }));
  hit('mars', 'saturn', HARD, x => ({ w: 2, tech: aTxt(x), text: 'İsteğini bastırır, sonra sertleşir; inisiyatif almakta tıkanır, adım atması geç gelir.', voice: 'Yanlış adım atmaktansa hiç atmayayım.' }));
  hit('moon', 'saturn', HARD, x => ({ w: 2, tech: aTxt(x), text: 'Duygusal ihtiyaçlarını gizler, “iyiyim” der. Güvence bekler ama istemeyi bilmez; içindeki yalnızlığı kimseye göstermez.', voice: 'Kimseye yük olmamalıyım.', truth: `${N} ihtiyacını söylemez, sonra anlaşılmadığı için küser.` }));
  hit('sun', 'neptune', HARD, x => ({ w: 2, tech: aTxt(x), text: 'Ne istediğini net söylemez; kaçamak, belirsiz, kolayca kaybolan biri.', truth: `${N} netlik vermez; belirsizliği bir korunma yöntemi olarak kullanır.` }));
  hit('venus', 'mars', ['conjunction', 'square', 'opposition'], x => ({ w: 1, tech: aTxt(x), text: x.type === 'conjunction' ? 'Tutku ve sevgi iç içe; çekici ve atılgan.' : 'Sevgi ile arzu arasında çatışma; çekim yüksek, istikrar düşük.' }));
  hit('venus', 'jupiter', [...SOFT, 'conjunction'], x => ({ w: 1, good: true, tech: aTxt(x), text: 'Sevgiyi cömertçe verir; ilişkide iyimser ve affedicidir.' }));
  hit('moon', 'venus', [...SOFT, 'conjunction'], x => ({ w: 1, good: true, tech: aTxt(x), text: 'Duygu ile sevgi uyumlu; yanında olmak kolaydır, şefkatlidir.' }));
  for (const k of ['venus', 'moon'] as BodyId[]) {
    const ch = findA(asp, k, 'chiron', ['conjunction', 'square', 'opposition']);
    if (ch) out.push({ w: 2, tech: aTxt(ch), text: 'Aşkta eski bir yara taşır; reddedilmeye aşırı duyarlıdır, küçük bir soğukluğu terk edilme gibi yaşar.', voice: 'Yine sevilmeyeceğim.' });
  }
  const V = c.positions.venus, M = c.positions.moon, Ma = c.positions.mars;
  if (V.retro) out.push({ w: 2, tech: `Doğumda retro Venüs (${where(c, 'venus')})`, text: 'Eski hikâyeleri kapatmakta zorlanır; geçmişe döner, eskiyle kıyaslar.', truth: `${N} geçmişi tam kapatmaz; eskiler hep bir köşede durur.` });
  if (angleDiff(V.lon, c.positions.sun.lon) < 8) out.push({ w: 1, tech: `Yanık Venüs (Güneş’e ${angleDiff(V.lon, c.positions.sun.lon).toFixed(1)}°)`, text: 'Aşkta kendi isteğini görünür kılamaz ya da sevgiyi egosuyla karıştırır.' });
  const sv = V.sign, sm = M.sign, sma = Ma.sign;
  if (sv === 5) out.push({ w: 1, tech: `Venüs Başak’ta (düşüşte)`, text: 'Sevgiyi eleştiriyle karıştırır; kusur bulur, mükemmeli bekler.' });
  if (sv === 7) out.push({ w: 1, tech: `Venüs Akrep’te (zararda)`, text: 'Sahiplenici ve şüpheci sever; güvenmek zaman alır.' });
  if (sv === 0) out.push({ w: 1, tech: `Venüs Koç’ta (zararda)`, text: 'Çabuk alevlenir, çabuk söner; kovalamayı yakalamaktan çok sever.' });
  if ([2, 8, 10].includes(sv) || [8, 10].includes(sm)) out.push({ w: 1, tech: `${[2, 8, 10].includes(sv) ? `Venüs ${SIGNS[sv].tr}` : `Ay ${SIGNS[sm].tr}`}’da`, text: 'Özgürlük ihtiyacı yüksek; yakınlık bir noktadan sonra dar gelir.' });
  if (sm === 7) out.push({ w: 1, tech: 'Ay Akrep’te (düşüşte)', text: 'Duyguları derin ama kapalı; kıskançlığı ve kinini içinde büyütür.' });
  if (sm === 9) out.push({ w: 1, tech: 'Ay Oğlak’ta (zararda)', text: 'Duygusal olarak kontrollü, soğuk görünür; sevgiyi sorumluluk alarak gösterir.' });
  if (sma === 3) out.push({ w: 1, tech: 'Mars Yengeç’te (düşüşte)', text: 'Öfkesini doğrudan söylemez; pasif agresif davranır, küser.' });
  if (sma === 6) out.push({ w: 1, tech: 'Mars Terazi’de (zararda)', text: 'Kavgadan kaçar, kararsız kalır; sorunu konuşmak yerine erteler.' });
  if (timedOf(c)) {
    if (c.positions.saturn.house === 7) out.push({ w: 2, tech: `Satürn 7. evde (${where(c, 'saturn')})`, text: 'İlişkiyi bir yük ve sınav gibi yaşar; geç bağlanır, bağlandığında ağır bağlanır.', truth: `${N} için ilişki hafif bir şey değildir; ya ciddi ya hiç.` });
    if (c.positions.node.house === 7) out.push({ w: 1, tech: 'Kuzey Ay Düğümü 7. evde', text: 'İlişki bu kişinin hayat dersidir: “ben” yerine “biz” demeyi öğrenmesi gerekir.' });
  }
  return out.sort((a, b) => b.w - a.w);
}

// ---------------- dürüst sinastri ----------------
export function synastryHonest(A: Person, B: Person) {
  const ptsP: Pt[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'];
  const pa = timedOf(A.chart) ? [...ptsP, 'asc' as Pt] : ptsP, pb = timedOf(B.chart) ? [...ptsP, 'asc' as Pt] : ptsP;
  const x = cross(A.chart, pa, B.chart, pb);
  const pull: Item[] = [], rub: Item[] = [];
  let ps = 0, rs = 0;
  const each = (a: Pt, b: Pt, types: Asp[], fn: (h: A, aIsA: boolean) => void) => {
    for (const h of x) { if (!types.includes(h.type)) continue; if (h.a === a && h.b === b) fn(h, true); else if (h.a === b && h.b === a) fn({ a: h.b, b: h.a, type: h.type, orb: h.orb }, false); }
  };
  const nameOf = (isA: boolean) => (isA ? A.name : B.name), other = (isA: boolean) => (isA ? B.name : A.name);
  const T = (h: A, isA: boolean) => `${gen(nameOf(isA))} ${poss(NM[h.a])} ${ASP_TR[h.type]} ${gen(other(isA))} ${poss(NM[h.b])} (${orbTxt(h.orb)})`;
  each('moon', 'sun', ['conjunction', 'opposition', 'trine', 'sextile'], (h, i) => { ps += 3; pull.push({ tech: T(h, i), text: h.type === 'opposition' ? 'Klasik “evlilik açısı”. Biri diğerinin eksik yarısı gibi hissetmiş; çekim güçlü.' : 'Duygu ile kimlik birbirini tanıyor; birbirlerinin yanında “evde” hissetmişler.' }); });
  each('venus', 'mars', ['conjunction', 'opposition', 'square', 'trine', 'sextile'], (h, i) => { ps += 3; pull.push({ tech: T(h, i), text: h.type === 'square' || h.type === 'opposition' ? 'Fiziksel çekim yüksek ama sürtünmeli; tutku ile kavga aynı kaynaktan.' : 'Güçlü romantik ve fiziksel çekim; birbirlerini arzu etmişler.' }); });
  each('venus', 'jupiter', ['conjunction', 'trine', 'sextile', 'opposition'], (h, i) => { ps += 2; pull.push({ tech: T(h, i), text: 'Biri diğerini cömertçe sevmiş; birlikteyken hayat daha büyük görünmüş.' }); });
  each('asc', 'sun', ['conjunction'], (h, i) => { ps += 2; pull.push({ tech: T(h, i), text: 'İlk bakışta tanıdıklık; biri diğerinin kimliğine doğrudan dokunmuş.' }); });
  each('asc', 'venus', ['conjunction'], (h, i) => { ps += 2; pull.push({ tech: T(h, i), text: 'Biri diğerini ilk andan güzel bulmuş; görünüşe dayalı güçlü çekim.' }); });
  each('node', 'sun', ['conjunction'], (h, i) => { ps += 2; pull.push({ tech: T(h, i), text: 'Ay Düğümü bağlantısı: “kader” hissi veren, kolay kopmayan bir bağ.' }); });
  each('node', 'moon', ['conjunction'], (h, i) => { ps += 2; pull.push({ tech: T(h, i), text: 'Ay Düğümü bağlantısı: duygusal olarak “daha önce tanışmışız” hissi.' }); });
  each('node', 'venus', ['conjunction'], (h, i) => { ps += 2; pull.push({ tech: T(h, i), text: 'Ay Düğümü–Venüs: aşkın kaderle ilgili hissettirdiği bir bağ.' }); });
  each('moon', 'moon', ['square', 'opposition'], (h, i) => { if (!i) return; rs += 3; rub.push({ tech: T(h, i), text: 'Duygusal ritimler uyumsuz: biri yakınlık isterken diğeri alan istiyor. Gündelik hayatta sürekli “beni anlamıyorsun” hissi.' }); });
  each('saturn', 'sun', HARD, (h, i) => { rs += 3; rub.push({ tech: T(h, i), text: `${nameOf(i)} farkında olmadan ${other(i)} için eleştirel ve kısıtlayıcı olur; ${other(i)} yanında küçüldüğünü hisseder.`, voice: 'Ne yapsam yetmiyor.' }); });
  each('saturn', 'moon', HARD, (h, i) => { rs += 3; rub.push({ tech: T(h, i), text: `${nameOf(i)}, ${gen(other(i))} duygularına soğuk ve mesafeli karşılık verir; ${other(i)} duygusal olarak aç kalır.` }); });
  each('saturn', 'venus', HARD, (h, i) => { rs += 3; rub.push({ tech: T(h, i), text: `${nameOf(i)} sevgiyi koşullara bağlar; ${other(i)} sevildiğinden emin olamaz. Bağ ağır ve yorucudur.` }); });
  each('neptune', 'venus', [...HARD], (h, i) => { rs += 2; rub.push({ tech: T(h, i), text: `${other(i)}, ${nameOf(i)} hakkında bir hayal kurar; gerçek ortaya çıktıkça hayal kırıklığı ve “kandırıldım” hissi gelir.` }); });
  each('neptune', 'moon', [...HARD], (h, i) => { rs += 2; rub.push({ tech: T(h, i), text: 'Duygusal sis: ne hissettikleri, ne yaşadıkları belirsiz; yanlış anlamalar yalan gibi algılanır.' }); });
  each('mars', 'pluto', HARD, (h, i) => { rs += 3; rub.push({ tech: T(h, i), text: 'Güç savaşı. Kavgalar sertleşir, kimse geri adım atmaz; tutkulu ama yıpratıcı.' }); });
  each('uranus', 'venus', HARD, (h, i) => { rs += 2; rub.push({ tech: T(h, i), text: `${nameOf(i)} ilişkiyi sürekli sarsar; ani mesafe, ani kopuş, ani dönüş.` }); });
  each('uranus', 'moon', HARD, (h, i) => { rs += 2; rub.push({ tech: T(h, i), text: `${other(i)} yanında hiç güvende hissetmez; ${nameOf(i)}’in ne yapacağı belli değildir.` }); });
  each('mars', 'mars', ['square', 'opposition'], (h, i) => { if (!i) return; rs += 2; rub.push({ tech: T(h, i), text: 'İkisinin de harekete geçme biçimi çatışıyor; küçük konular kavgaya döner.' }); });
  return { pull, rub, ps, rs };
}

// ---------------- kompozit zamanlama ----------------
export interface Timing { start: Date; end: Date; label: 'destekleyici' | 'sınav' | 'nostalji/temas'; tech: string }
export function compositeTiming(A: Chart, B: Chart, months = 12, from = new Date()): { comp: Chart; list: Timing[]; venusRx: { start: Date; end: Date } | null } {
  const comp = compositeChart(A, B, { houseSystem: A.houseSystem, zodiac: A.zodiac } as any);
  const targets: BodyId[] = ['sun', 'moon', 'venus'];
  const movers: BodyId[] = ['venus', 'jupiter', 'saturn'];
  const runs = new Map<string, { s: number; e: number }>();
  const out: Timing[] = [];
  const day = 864e5, ay = A.ayanamsa;
  let vr: { start: Date; end: Date } | null = null, vrS = 0;
  let prevV = norm(bodyLon('venus', from) - ay);
  for (let i = 0; i <= months * 30.5; i++) {
    const d = new Date(from.getTime() + i * day);
    for (const m of movers) {
      const L = norm(bodyLon(m, d) - ay);
      for (const t of targets) {
        const r = aspectOf(L, comp.positions[t].lon, ['conjunction', 'opposition', 'square', 'trine'], m === 'venus' ? 1 : 1.2);
        const key = `${m}|${t}|${r?.type ?? ''}`;
        if (r) { const run = runs.get(key); if (run && d.getTime() - run.e <= 2 * day) run.e = d.getTime(); else runs.set(key, { s: d.getTime(), e: d.getTime() }); }
      }
    }
    const v = norm(bodyLon('venus', d) - ay); let dv = norm(v - prevV); if (dv > 180) dv -= 360; prevV = v;
    if (i > 0 && dv < 0 && !vrS) vrS = d.getTime();
    if (i > 0 && dv >= 0 && vrS && !vr) vr = { start: new Date(vrS), end: d };
  }
  for (const [k, r] of runs) {
    const [m, t, type] = k.split('|') as [BodyId, BodyId, Asp];
    const label: Timing['label'] = m === 'jupiter' ? (type === 'square' || type === 'opposition' ? 'destekleyici' : 'destekleyici') : m === 'saturn' ? 'sınav' : type === 'conjunction' ? 'nostalji/temas' : type === 'trine' ? 'destekleyici' : 'sınav';
    out.push({ start: new Date(r.s), end: new Date(r.e), label, tech: `Transit ${NM[m]} ${ASP_TR[type]} kompozit ${NM[t]}` });
  }
  out.sort((a, b) => a.start.getTime() - b.start.getTime());
  return { comp, list: out, venusRx: vr };
}
const MON = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
export const halfMonth = (d: Date) => `${MON[d.getMonth()]} ${d.getFullYear()}’nin ${d.getDate() <= 15 ? 'ilk' : 'ikinci'} yarısı`;

// ---------------- olay haritası yorumu ----------------
const OUTER_THEME: Record<string, { open: string; text: string }> = {
  pluto: { open: 'güç mücadelesi ve geri dönüşsüzlük', text: 'Plüton devrede: olay bir güç meselesi. Bir şey kalıcı olarak değişiyor; eskiye dönmek kolay değil.' },
  saturn: { open: 'baskı, sorumluluk ve tükenmişlik', text: 'Satürn devrede: yük, mesafe ve “bu böyle gitmez” kararı. Duygudan çok gerçeklik konuşuyor.' },
  uranus: { open: 'ani kopuş ve özgürlük ihtiyacı', text: 'Uranüs devrede: beklenmedik, ani, sarsıcı. Biri nefes alamadığını hissetmiş.' },
  neptune: { open: 'belirsizlik ve hayal kırıklığı', text: 'Neptün devrede: sis. Kimin ne istediği net değil; yanlış anlamalar ve kırık beklentiler.' },
  mars: { open: 'öfke ve çatışma', text: 'Mars devrede: tartışma, sabırsızlık, sert sözler.' },
};
const OUTER_START: Record<string, { open: string; text: string }> = {
  pluto: { open: 'yoğun çekim, takıntı ve güç dengesi', text: 'Plüton devrede: bağ ilk andan yoğun; çekim güçlü ama kimin kimi yönlendireceği sorusu baştan var.' },
  saturn: { open: 'ciddiyet, yük ve zamanlama sorunu', text: 'Satürn devrede: ilişki hafif başlamıyor; sorumluluk, mesafe ya da “doğru zaman mı?” sorusu baştan masada.' },
  uranus: { open: 'heyecanlı ama istikrarsız bir enerji', text: 'Uranüs devrede: beklenmedik, elektrikli bir başlangıç; heyecan yüksek ama süreklilik zayıf.' },
  neptune: { open: 'romantik bir sis ve idealize etme', text: 'Neptün devrede: büyülü ama bulanık; ikiniz de karşınızdakini biraz hayal ettiğiniz gibi görüyorsunuz.' },
  mars: { open: 'tutku ve sürtüşme', text: 'Mars devrede: çekim fiziksel ve hızlı; sabırsızlık ve küçük kavgalar da aynı anda başlıyor.' },
};
const OUTER_SOFT: Record<string, string> = {
  pluto: 'Plüton uyumlu açıda: derin ve kalıcı bir bağ destekleniyor; yoğunluk korkutmuyor, besliyor.',
  saturn: 'Satürn uyumlu açıda: ciddiyet ve sorumluluk destekleyici; bağ zamanla sağlamlaşabilir.',
  uranus: 'Uranüs uyumlu açıda: yenilik ve heyecan akışla geliyor; özgürlük alanı var.',
  neptune: 'Neptün uyumlu açıda: sezgi, şefkat ve romantizm var; idealize etme riski hafif.',
};
const SUSPECT_TIMES = ['00:00', '00:01', '12:00', '23:59', '23:58'];
export function readEvent(ev: RelEvent, ec: Chart, me: Person, partner: Person | null, all: { ev: RelEvent; c: Chart }[]): Reading {
  const secs: Sec[] = [], truths: string[] = [];
  const timed = timedOf(ec);
  const P = ec.positions;
  const asp = aspectsIn(ec);
  const isStart = START_TYPES.includes(ev.type);
  const TH = isStart ? OUTER_START : OUTER_THEME;
  let woman = [me, partner].find(x => x?.gender === 'f') ?? null, man = [me, partner].find(x => x?.gender === 'm') ?? null;
  // 3) cinsiyeti girilmemiş kişi: diğeri biliniyorsa boş kalan tarafa yerleştir ve bunu söyle
  let assumed: Person | null = null;
  const unk = [me, partner].filter((x): x is Person => !!x && !x.gender);
  if (!woman && man && unk.length === 1) { woman = unk[0]; assumed = woman; }
  else if (!man && woman && unk.length === 1) { man = unk[0]; assumed = man; }
  const mercRx = P.mercury.retro;
  const ph = moonPhaseOf(ec);

  // Ana tema: en sıkı açı ve ağır gezegenlerin kişisel noktalara teması
  const personal: Pt[] = ['sun', 'moon', 'venus', 'mars'];
  const heavy = asp.filter(x => (['pluto', 'saturn', 'uranus', 'neptune'].includes(x.a as string) || ['pluto', 'saturn', 'uranus', 'neptune'].includes(x.b as string)) && (personal.includes(x.a) || personal.includes(x.b)) && x.orb <= 4);
  const heavyHard = heavy.filter(x => HARD.includes(x.type) || x.type === 'quincunx');
  const outer = heavyHard[0] ? (['pluto', 'saturn', 'uranus', 'neptune'].find(o => o === heavyHard[0].a || o === heavyHard[0].b) as string) : (findA(asp, 'venus', 'mars', HARD) ? 'mars' : '');
  const theme: Item[] = [];
  if (asp[0]) theme.push({ tech: `En sıkı açı: ${aTxt(asp[0])}`, text: asp[0].orb <= 2 ? 'Haritanın omurgası bu: olayın asıl dili burada.' : 'Haritanın en güçlü bağlantısı bu.' });
  for (const h of heavy.filter(h => h !== asp[0]).slice(0, 3)) { const ok = (['pluto', 'saturn', 'uranus', 'neptune'].find(o => o === h.a || o === h.b))!; theme.push({ tech: aTxt(h), text: HARD.includes(h.type) || h.type === 'quincunx' ? TH[ok].text : OUTER_SOFT[ok] }); }
  // T-kare
  for (const o of asp.filter(x => x.type === 'opposition')) {
    const apex = (PLANETS as Pt[]).find(p => p !== o.a && p !== o.b && findA(asp, p, o.a, ['square']) && findA(asp, p, o.b, ['square']));
    if (apex) { theme.push({ tech: `T-kare: ${NM[o.a]}–${NM[o.b]} karşıtlığı, tepe noktası ${NM[apex]}`, text: isStart ? `Bütün gerilim ${NM[apex]} üzerinde toplanıyor; ilişkinin ana sınavı bu gezegenin konusu olacak.` : `Bütün gerilim ${NM[apex]} üzerinde toplanıyor; olay bu gezegenin konusu üzerinden patlamış.` }); break; }
  }
  if (timed) for (const p of PLANETS) for (const ax of ['asc', 'dsc', 'mc', 'ic'] as Pt[]) { const L = lonOf(ec, ax)!; if (angleDiff(P[p].lon, L) <= 5) theme.push({ tech: `${NM[p]} ${NM[ax]} üzerinde (${angleDiff(P[p].lon, L).toFixed(1)}°)`, text: `Eksene oturan gezegen olayın görünür yüzü: ${p === 'saturn' ? 'ağırlık ve mesafe' : p === 'pluto' ? 'güç ve kesinlik' : p === 'uranus' ? 'ani kopuş' : p === 'neptune' ? 'sis ve kaçış' : p === 'venus' ? 'sevgi ve çekim' : p === 'mars' ? 'öfke ve hareket' : p === 'moon' ? 'duygular, ev ve aidiyet' : p === 'sun' ? 'kimlik ve gurur' : p === 'mercury' ? 'konuşmalar ve mesajlar' : p === 'jupiter' ? 'umut ve büyüme' : 'olayın ana konusu'}.` }); }
  secs.push({ emoji: '🔥', title: 'Haritanın ana teması', items: theme });

  // Kadın ve erkek nasıl hissetmiş (olay haritasında kadın: Ay + Venüs, erkek: Güneş + Mars)
  const feel = (id: BodyId) => {
    const xs = asp.filter(x => (x.a === id || x.b === id) && x.orb <= 5).slice(0, 2);
    return xs.map(x => ({ tech: `${NM[id]} ${where(ec, id)}: ${aTxt(x)}`, text: describe(id, x, mercRx) }));
  };
  const seenA = new Set<string>();
  const uniq = (xs: Item[]) => xs.filter(i => { const k = i.tech.split(': ').slice(1).join(': '); if (seenA.has(k)) return false; seenA.add(k); return true; });
  const withVoice = (xs: Item[], v: string) => xs.map((i, k) => (k === 0 ? { ...i, voice: i.voice ?? v } : i));
  const wItems: Item[] = uniq([...feel('moon'), ...feel('venus')]);
  if (!wItems.length) wItems.push({ tech: `Ay ${where(ec, 'moon')}, Venüs ${where(ec, 'venus')}`, text: `${woman ? woman.name : 'Kadın taraf'} için sıkı bir açı yok; duygusal tepki sessiz ve içe dönük.` });
  if (woman) { const tr = transitsTo(ec, woman.chart, woman.name); if (tr) wItems.push(tr); }
  if (assumed && assumed === woman) wItems.push({ tech: 'Not', text: `${gen(assumed.name)} cinsiyeti girilmediği için onu Ay ve Venüs üzerinden okudum. Ayarlar’dan cinsiyet eklersen yorum netleşir.` });
  secs.push({ emoji: '👩', title: `${woman ? woman.name : 'Kadın taraf'} nasıl hissetmiş?`, items: withVoice(wItems, voiceFor('f', ev.type, outer)) });
  seenA.clear();
  const mItems: Item[] = uniq([...feel('sun'), ...feel('mars')]);
  if (!mItems.length) mItems.push({ tech: `Güneş ${where(ec, 'sun')}, Mars ${where(ec, 'mars')}`, text: `${man ? man.name : 'Erkek taraf'} için sıkı bir açı yok; olayı dışarıdan sakin yaşamış görünür.` });
  if (man) { const tr = transitsTo(ec, man.chart, man.name); if (tr) mItems.push(tr); }
  if (assumed && assumed === man) mItems.push({ tech: 'Not', text: `${gen(assumed.name)} cinsiyeti girilmediği için onu Güneş ve Mars üzerinden okudum. Ayarlar’dan cinsiyet eklersen yorum netleşir.` });
  secs.push({ emoji: '👨', title: `${man ? man.name : 'Erkek taraf'} nasıl hissetmiş?`, items: withVoice(mItems, voiceFor('m', ev.type, outer)) });

  // O anda gökyüzü: retrolar, duraklar, Ay fazı, 1. ve 7. ev yöneticileri
  const now: Item[] = [];
  const tNorm = ev.time ? ev.time.replace('.', ':').padStart(5, '0') : '';
  const suspect = timed && SUSPECT_TIMES.includes(tNorm);
  if (suspect) now.push({ tech: `Saat ${tNorm}: kesin mi?`, text: 'Bu saat yuvarlak ya da “gün sonu” gibi görünüyor. Yükselen her 4 dakikada yaklaşık 1° kayar; aşağıdaki ev ve eksen yorumları bu saate çok duyarlı. Emin değilsen saati boş bırak.' });
  for (const id of ['venus', 'mercury', 'mars'] as BodyId[]) {
    const s = station(id, ec.utc);
    if (s === 'stationRx') now.push({ tech: `${NM[id]} retroya dönüyor (durağan)`, text: id === 'venus' ? 'Aşk gezegeni durmuş ve geri dönmeye başlıyor: değerler sorgulanıyor, bir şey yarım kalıyor.' : id === 'mercury' ? 'İletişim duruyor: söylenenler yanlış anlaşılıyor, mesajlar havada kalıyor.' : 'Enerji içe dönüyor: öfke bastırılıyor, adım atılamıyor.' });
    else if (s === 'stationD') now.push({ tech: `${NM[id]} düz harekete dönüyor (durağan)`, text: 'Uzun süre bekleyen bir konu harekete geçiyor; karar netleşiyor.' });
    else if (s === 'retro') now.push({ tech: `${NM[id]} retro`, text: id === 'venus' ? 'Retro Venüs: yarım kalmışlık. Bu dönemde başlayan ya da biten aşklar genelde yeniden gündeme gelir.' : id === 'mercury' ? 'Retro Merkür: iletişim kopuklukları, eski konuların geri gelmesi.' : 'Retro Mars: öfke ve istek içe dönük; hareket gecikmeli.' });
  }
  now.push({ tech: `Ay fazı: ${ph.name} (${Math.round(ph.a)}°)`, text: PHASE_MEAN[ph.key] });
  if (timed) {
    const r1 = SIGN_RULERS[Math.floor(ec.cusps[0] / 30)], r7 = SIGN_RULERS[Math.floor(ec.cusps[6] / 30)];
    const x = r1 !== r7 ? aspectOf(P[r1].lon, P[r7].lon) : null;
    now.push({ tech: `1. ev yöneticisi ${NM[r1]} (olayı yaşayan), 7. ev yöneticisi ${NM[r7]} (karşı taraf)${x ? `: ${ASP_TR[x.type]} (${orbTxt(x.orb)})` : ''}`, text: !x ? 'İki taraf arasında doğrudan bir bağ yok; herkes kendi yolunda.' : HARD.includes(x.type) && x.type !== 'conjunction' ? 'Taraflar karşı karşıya; uzlaşma zor.' : x.type === 'conjunction' ? 'Taraflar iç içe; olay ikisini de aynı noktada buluşturuyor.' : 'Taraflar arasında akış var; iletişim kapısı kapanmamış.' });
  } else now.push({ tech: 'Saat girilmedi', text: 'Saat bilinmediği için evleri ve eksenleri yorumlamadım; ancak gezegen konumları ve açılar geçerli.' });
  secs.push({ emoji: ev.type === 'breakup' ? '💔' : '✨', title: ev.type === 'breakup' ? 'Ayrılık anında neler oluyordu?' : `${EV_LABEL[ev.type]} anında gökyüzü`, items: now });

  // Başlangıç haritası: karakter ve sorun tohumları
  const seeds: Item[] = [];
  if (isStart) {
    const ch: Item[] = [];
    if (timed) ch.push({ tech: `Yükselen ${deg(ec.asc!)}`, text: `İlişkinin dışarıya görünen yüzü ${SIGNS[Math.floor(ec.asc! / 30)].tr} tarzında.` });
    const V = P.venus, comb = angleDiff(V.lon, P.sun.lon);
    ch.push({ tech: `Venüs ${where(ec, 'venus')}${comb < 8 ? ` (yanık, Güneş’e ${comb.toFixed(1)}°)` : ''}`, text: comb < 8 ? 'Yanık Venüs: aşk egonun gölgesinde; ilişki “ben” ile başlamış.' : V.retro ? 'Retro Venüs ile başlayan aşk: geçmişten bir şey taşıyor, ya da kendisi geçmişe dönecek.' : 'Venüs kendi hâlinde; aşk dili bu burcun tarzında.' });
    if (timed) for (const h of [5, 7]) { const r = SIGN_RULERS[Math.floor(ec.cusps[h - 1] / 30)]; ch.push({ tech: `${h}. ev ${SIGNS[Math.floor(ec.cusps[h - 1] / 30)].tr}, yöneticisi ${NM[r]} ${where(ec, r)}`, text: h === 5 ? 'Flört ve keyif tarafı bu yöneticinin durumuna göre akar.' : 'Bağlılık ve ortaklık tarafı bu yöneticinin durumuna göre şekillenir.' }); }
    secs.push({ emoji: '🌱', title: 'Başlangıç anının haritası', items: ch });
    for (const o of ['saturn', 'pluto', 'uranus', 'neptune', 'mars'] as BodyId[]) { const x = findA(asp, 'venus', o, HARD); if (x) seeds.push({ tech: aTxt(x), text: o === 'saturn' ? 'Venüs’e Satürn: sevgi baştan yük ve mesafeyle sınanıyor.' : o === 'pluto' ? 'Venüs’e Plüton: baştan güç ve kıskançlık tohumu.' : o === 'uranus' ? 'Venüs’e Uranüs: istikrarsızlık tohumu; ani kopuşlar.' : o === 'neptune' ? 'Venüs’e Neptün: idealize etme ve hayal kırıklığı tohumu.' : 'Venüs’e Mars: tutku ile kavga aynı anda başlamış.' }); }
    const mm = findA(asp, 'moon', 'saturn', HARD); if (mm) seeds.push({ tech: aTxt(mm), text: 'Ay’a Satürn: duygusal soğukluk ve güvensizlik baştan var.' });
    if (timed && [0, 6].some(i => angleDiff(P.saturn.lon, ec.cusps[i]) <= 5)) seeds.push({ tech: 'Satürn Yükselen/Alçalan ekseninde', text: 'İlişkinin temelinde ağırlık ve “bu zor olacak” duygusu var.' });
    if (ph.key === 'balsamic') seeds.push({ tech: 'Balsamik Ay’da başlangıç', text: 'Bu fazda başlayan bağlar genelde eski bir hikâyeyi kapatmak için gelir: kısa ama yoğun.' });
  } else {
    const start = all.filter(x => START_TYPES.includes(x.ev.type) && x.c.utc < ec.utc).sort((a, b) => b.c.utc.getTime() - a.c.utc.getTime())[0];
    if (start) {
      const hits = cross(ec, ['saturn', 'pluto', 'uranus', 'neptune', 'mars', 'venus', 'sun', 'moon'], start.c, ['sun', 'moon', 'venus', 'mars', ...(timedOf(start.c) ? ['asc', 'dsc'] as Pt[] : [])], HARD, 3).slice(0, 4);
      hits.forEach(h => seeds.push({ tech: `Ayrılık ${poss(NM[h.a])} ${ASP_TR[h.type]} ${EV_LABEL[start.ev.type].toLocaleLowerCase('tr')} ${poss(NM[h.b])} (${orbTxt(h.orb)})`, text: `${EV_LABEL[start.ev.type]} anında duran nokta ayrılıkta tetiklenmiş: sorun baştan beri oradaydı.` }));
      if (!hits.length) seeds.push({ tech: `${EV_LABEL[start.ev.type]} haritasıyla karşılaştırma`, text: 'Ayrılık, başlangıç haritasının ana noktalarına sıkı değmiyor; bu ayrılık baştan yazılı bir kader değil, sonradan biriken bir yorgunluk.' });
    }
  }
  if (seeds.length) secs.push({ emoji: '⚠️', title: 'Baştan beri duran sorun tohumları', items: seeds });

  // Kader işaretleri: aynı derecenin birden fazla haritada tekrarlanması
  const fate: Item[] = [];
  const evPts: Pt[] = ['sun', 'moon', 'venus', ...(timed ? ['asc'] as Pt[] : [])];
  for (const ps of [me, partner].filter(Boolean) as Person[]) {
    const tg: Pt[] = ['sun', 'moon', 'venus', 'mars', ...(timedOf(ps.chart) ? ['asc', 'dsc', 'mc'] as Pt[] : [])];
    for (const h of cross(ec, evPts, ps.chart, tg, ['conjunction'], 1.5)) fate.push({ tech: `Olay ${poss(NM[h.a])} = ${gen(ps.name)} doğum ${poss(NM[h.b])} (${orbTxt(h.orb)})`, text: 'Aynı derece iki haritada buluşuyor: kader işareti. Bu olay o kişinin özüne dokunmuş.' });
  }
  if (fate.length) secs.push({ emoji: '🧿', title: 'Kader işaretleri', items: fate.slice(0, 4) });

  // Açılış ve acı gerçekler
  const harsh = heavyHard.length >= 2 || seeds.length >= 2 || ph.key === 'balsamic';
  const opening = ev.type === 'breakup'
    ? `Bu harita, ayrılığın ${outer ? OUTER_THEME[outer].open : 'sessiz bir tükenme'} ile geldiğini söylüyor.${seeds.length && !isStart ? ' Ve sorun yeni değil: başlangıçta duran noktalar tetiklenmiş.' : ''}`
    : `Bu ${EV_LABEL[ev.type].toLocaleLowerCase('tr')} haritası, ${harsh ? 'güçlü ama sorunlu bir başlangıcı' : 'akışı olan bir başlangıcı'} gösteriyor${outer ? `; ${OUTER_START[outer].open} baştan masada` : ''}.`;
  if (ev.type === 'breakup') {
    if (outer === 'pluto') truths.push('Plüton’lu ayrılıklar geri dönüşsüzdür: dönülse bile aynı ilişkiye değil, başka bir şeye dönülür.');
    if (outer === 'uranus') truths.push('Bu kopuş ani görünse de birinin içinde çoktan başlamıştı.');
    if (outer === 'saturn') truths.push('Bu ayrılık bir kaprisi değil, birikmiş bir yükü gösteriyor; “bir daha deneyelim” aynı yükü geri getirir.');
    if (outer === 'neptune') truths.push('Bu ilişkide gerçek ile hayal karışmış; ayrılık sisin dağılmasıdır.');
  } else {
    if (ph.key === 'balsamic') truths.push('Bu, uzun ömürlü bir ilişkinin başlangıç haritasına benzemiyor.');
    if (seeds.length >= 2) truths.push('Sorunların tohumu ilk günden ekili; ilişki ilerledikçe büyür, kaybolmaz.');
  }
  return { title: `${EV_LABEL[ev.type]} · ${ev.date}${ev.time ? ' ' + ev.time : ''}`, opening, secs, truths, summary: '', next: '', theme: outer ? TH[outer].open : '', note: timed ? (suspect ? `Saat ${tNorm} kesin değilse ev yorumlarını temkinli oku.` : undefined) : 'Saat girilmediği için öğlen 12:00 varsaydım ve evleri yorumlamadım.' };
}
const SUBJ: Record<string, string> = { moon: 'Duygusal ihtiyaçları', venus: 'Sevgi ve değer görme isteği', sun: 'Kendini ortaya koyma isteği', mars: 'Arzusu ve harekete geçme isteği' };
// [sert, uyumlu, iç ses, nötr kavuşum]
const OBJ: Record<string, [string, string, string, string]> = {
  saturn: ['mesafe, yük ve yetersizlik duygusuyla', 'olgunluk ve sorumlulukla', '“Yetmiyorum” ya da “bu kolay olmayacak” hissi geçmiş olabilir.', ''],
  pluto: ['güç, kontrol ve kıskançlıkla', 'derin bir bağ ve dönüşümle', 'Kontrolü kaybetme ya da kaptırılma korkusu yaşanmış olabilir.', ''],
  uranus: ['belirsizlik ve ani değişimle', 'heyecan ve yenilikle', 'Ne olacağını bilememenin huzursuzluğu var.', ''],
  neptune: ['sis, idealize etme ve belirsizlikle', 'romantizm ve şefkatle', 'Gördüğüyle gerçek arasında fark olabileceğini sezmiş ama bakmak istememiş olabilir.', ''],
  mars: ['öfke ve sabırsızlıkla', 'arzu ve cesaretle', 'İçinde biriken bir gerginlik var.', ''],
  venus: ['sevgi ile beklenti arasındaki gerilimle', 'sevgi ve uyumla', 'Sevgisini gösterirken karşılık beklemiş.', ''],
  jupiter: ['abartı ve fazla beklentiyle', 'umut ve cömertlikle', 'Beklentisi gerçeğin önüne geçmiş olabilir.', ''],
  sun: ['ego ve irade çatışmasıyla', 'netlik ve görünürlükle', '“Kim haklı?” sorusu içini meşgul etmiş.', 'iradesiyle'],
  moon: ['duygusal dalgalanmayla', 'duygusal yakınlıkla', 'Duyguları hızla değişmiş.', 'duygularıyla'],
  mercury: ['yanlış anlaşılmalarla', 'iyi bir iletişimle', 'Söylemek istediğini tam anlatamamış.', 'düşünceleri ve sözleriyle'],
  asc: ['dışarıya gösterdiğiyle içinden geçen arasındaki farkla', 'kendini rahatça ifade etmeyle', 'Dışarıdan sakin görünse de içi öyle değil.', 'dış görünüşüyle'],
  dsc: ['karşısındakiyle çekişmeyle', 'karşısındakiyle uyumla', 'Karşı taraf ona ayna tutmuş.', 'karşısındakiyle'],
  mc: ['hedefler ve sorumluluklarla', 'hedefleriyle uyumla', 'İlişki ile hayattaki yönü çekişmiş.', 'hedefleriyle'],
  ic: ['aile ve ev meseleleriyle', 'aile ve güvenlik duygusuyla', 'İçindeki güvenlik ihtiyacı tetiklenmiş.', 'ailesiyle'],
};
function describe(id: BodyId, x: A, mercRx = false): string {
  const o = (x.a === id ? x.b : x.a) as string;
  const sub = SUBJ[id] ?? 'Bu nokta';
  const ob = OBJ[o] ?? ['gerilimle', 'akışla', '', 'başka bir noktayla'];
  const rxNote = mercRx && (o === 'mercury' || id === 'mercury') ? ' Merkür retro olduğu için söylenenler yanlış anlaşılmaya açık.' : '';
  if (x.type === 'quincunx') return `${sub} ile ${ob[0].replace(/yla$|yle$|la$|le$/, '')} arasında uyumsuzluk var: ikisi aynı dili konuşmuyor, sürekli ayar gerektiren, tam oturmayan bir his.${rxNote}`;
  if (x.type === 'conjunction') {
    if (['saturn', 'pluto', 'uranus', 'neptune', 'mars'].includes(o)) return `${sub} ${ob[0]} iç içe geçmiş; yoğun bir an. ${ob[2]}${rxNote}`;
    if (['venus', 'jupiter'].includes(o)) return `${sub} ${ob[1]} birleşiyor; o an içi ısınmış.${rxNote}`;
    return `${sub} ${ob[3] || ob[1]} iç içe: o an çok düşünmüş, kendini anlatmaya çalışmış.${rxNote}`;
  }
  if (HARD.includes(x.type)) return `${sub} ${ob[0]} sınanıyor. ${ob[2]}${rxNote}`;
  return `${sub} ${ob[1]} destekleniyor; o an içinde bir açıklık var.${rxNote}`;
}
function transitsTo(ec: Chart, natal: Chart, name?: string): Item | null {
  const h = cross(ec, ['saturn', 'pluto', 'uranus', 'neptune', 'mars', 'venus', 'jupiter'], natal, ['sun', 'moon', 'venus', 'mars', ...(timedOf(natal) ? ['asc', 'dsc'] as Pt[] : [])], ['conjunction', 'opposition', 'square', 'trine'], 3)[0];
  if (!h) return null;
  const heavy = ['saturn', 'pluto', 'uranus', 'neptune'].includes(h.a as string);
  return { tech: `O gün transit ${NM[h.a]}, ${name ? gen(name) + ' ' : ''}doğum ${dat3(NM[h.b])} ${ASP_TR[h.type]} (${orbTxt(h.orb)})`, text: heavy ? 'Bu transit zamanlamayı açıklar; davranışın kökü yine de doğum haritasındadır. Transit geçer, kalıp kalır.' : 'O gün bu kişinin içinde bir kıpırtı vardı; olay onu doğrudan etkilemiş.' };
}
function voiceFor(g: 'f' | 'm', t: EvType, outer: string): string {
  if (t === 'breakup') return g === 'f' ? (outer === 'saturn' ? 'Ben hep taşıdım, artık taşıyamıyorum.' : outer === 'uranus' ? 'Bir anda her şey bitti, nasıl?' : 'Yeterince sevilmedim.') : (outer === 'saturn' ? 'Hem buna hem ilişkiye yetemiyorum.' : outer === 'pluto' ? 'Kontrol bende değilse burada olmam.' : 'Nefes alamıyorum.');
  return g === 'f' ? 'Bu sefer farklı olabilir mi?' : 'Bunu istiyorum ama nereye gidecek?';
}

/** Tüm hikâye: kişiler, sinastri, olaylar ve zamanlama tek raporda */
export function fullStory(me: Person, partner: Person | null, events: { ev: RelEvent; c: Chart }[]): Reading {
  const secs: Sec[] = [], truths: string[] = [];
  const pats: { p: Person; list: Pattern[] }[] = [me, partner].filter(Boolean).map(p => ({ p: p!, list: lovePatterns(p!) }));
  for (const { p, list } of pats) {
    secs.push({ emoji: '🧭', title: `${p.name}: aşkta nasıl biri?`, items: list.slice(0, 5).map(x => ({ tech: x.tech, text: x.text, voice: x.voice })) });
  }
  let opening = '';
  let syn: ReturnType<typeof synastryHonest> | null = null;
  if (partner) {
    syn = synastryHonest(me, partner);
    secs.push({ emoji: '💞', title: 'İkisi arasındaki çekim', items: syn.pull.length ? syn.pull.slice(0, 5) : [{ tech: 'Belirgin çekim açısı yok', text: 'Klasik çekim açıları zayıf; bu bağ daha çok koşullar ve alışkanlıkla yürümüş.' }] });
    secs.push({ emoji: '⚡', title: 'Sürtüşme noktaları', items: syn.rub.length ? syn.rub.slice(0, 5) : [{ tech: 'Ağır sürtüşme açısı yok', text: 'Haritalar arasında yıkıcı bir açı görünmüyor; sorunlar daha çok kişisel kalıplardan geliyor.' }] });
    const hv = (l: Pattern[]) => l.filter(x => !x.good).reduce((a, b) => a + b.w, 0);
    const [a, b] = pats.map(x => hv(x.list));
    if (Math.abs(a - b) >= 3) { const w = a > b ? me : partner; truths.push(`${gen(w.name)} haritasındaki aşk kalıpları belirgin şekilde daha ağır. “İkiniz de eşit sorumlusunuz” demek dürüst olmaz; ilişkiyi asıl zorlayan kalıplar onda.`); }
    for (const x of pats) for (const pt of x.list) if (pt.truth && truths.length < 5) truths.push(pt.truth);
    if (syn.ps >= syn.rs + 4) opening = 'Çekim güçlü; ama aşağıdaki kalıplar okunmadan bu bağın yönü anlaşılmaz.';
    else if (syn.rs >= syn.ps + 4) opening = 'Bu iki harita arasında sürtüşme, çekimden ağır basıyor. Bağ var ama bedeli yüksek.';
    else opening = 'Çekim de sürtüşme de güçlü: bu tür bağlar kolay bitmez ama sürekli acıtır, bir ayrılıp bir barışılan ilişkiler olur.';
  } else {
    opening = '';
    for (const pt of pats[0].list) if (pt.truth && truths.length < 4) truths.push(pt.truth);
  }
  // Olaylar: her biri kendi kartında (en yeni tarihli en üstte); açılış ve acı gerçekler önce olaylardan
  const sorted = [...events].sort((a, b) => b.c.utc.getTime() - a.c.utc.getTime());
  const reads = sorted.map(e => ({ e, r: readEvent(e.ev, e.c, me, partner, events) }));
  const cards: EventCard[] = [], evTruths: string[] = [], links: Item[] = [];
  for (const { e, r } of reads) {
    const secsE = r.secs.filter(sc => sc.title !== 'Kader işaretleri' && sc.title !== 'Baştan beri duran sorun tohumları');
    cards.push({ emoji: e.ev.type === 'breakup' ? '💥' : e.ev.type === 'reunion' ? '🔁' : '🌱', title: r.title, opening: r.opening, secs: secsE, note: r.note, when: e.c.utc.getTime() });
    for (const t of r.truths) if (!evTruths.includes(t)) evTruths.push(t);
    // olayların birbirine ve kişilere bağları tek bölümde
    for (const sc of r.secs) if (sc.title === 'Baştan beri duran sorun tohumları' || sc.title === 'Kader işaretleri') for (const it of sc.items) links.push({ ...it, tech: `${EV_LABEL[e.ev.type]}: ${it.tech}` });
  }
  // olay haritaları arasında aynı derece (kader işareti)
  for (let i = 0; i < sorted.length; i++) for (let j = i + 1; j < sorted.length; j++) {
    const A1 = sorted[i], B1 = sorted[j];
    for (const h of cross(A1.c, ['sun', 'moon', 'venus', 'mars'], B1.c, ['sun', 'moon', 'venus', 'mars'], ['conjunction', 'opposition'], 1.5).slice(0, 2))
      links.push({ tech: `${EV_LABEL[A1.ev.type]} ${poss(NM[h.a])} ${h.type === 'conjunction' ? '=' : 'karşısında'} ${EV_LABEL[B1.ev.type].toLocaleLowerCase('tr')} ${poss(NM[h.b])} (${orbTxt(h.orb)})`, text: h.type === 'conjunction' ? 'İki olay haritasında aynı derece: kader işareti. Bu iki an birbirine bağlı.' : 'İki olayın aynı noktası birbirine bakıyor: biri diğerinin karşılığı gibi.' });
  }
  if (reads.length) {
    const last = reads[0];
    opening = `${EV_LABEL[last.e.ev.type]} (${last.e.ev.date}): ${last.r.opening}` + (reads.length > 1 ? ` ${reads.length} olay haritasını birlikte okudum.` : '');
    truths.splice(0, 0, ...evTruths);
  }  // Bundan sonrası
  if (partner) {
    const tm = compositeTiming(me.chart, partner.chart);
    const items: Item[] = tm.list.slice(0, 6).map(t => ({ tech: `${halfMonth(t.start)} · ${t.label}`, text: t.tech + (t.label === 'sınav' ? ': ilişki zorlanır, kararlar netleşir.' : t.label === 'destekleyici' ? ': temas ve yakınlaşma için açık bir pencere.' : ': eski duygular yüzeye çıkar, bir mesaj ya da karşılaşma olabilir.') }));
    if (tm.venusRx) items.push({ tech: `Venüs retrosu: ${halfMonth(tm.venusRx.start)} – ${halfMonth(tm.venusRx.end)}`, text: 'Eski aşkların geri döndüğü klasik dönem. Bir temas olabilir; bu bir değişim değil, nostaljidir.' });
    const broke = events.some(e => e.ev.type === 'breakup') && !events.some(e => e.ev.type === 'reunion' && events.find(b => b.ev.type === 'breakup')!.c.utc < e.c.utc);
    const change = tm.list.some(t => t.tech.includes('Jüpiter'));
    if (broke) items.unshift({ tech: 'Geri dönüş ihtimali', text: change ? 'Önümüzdeki aylarda kompozite Jüpiter değiyor: bir yakınlaşma penceresi var. Ama kişisel kalıplar değişmeden dönülürse aynı döngü tekrar eder.' : 'Kompozit haritada değişim gösteren güçlü bir transit yok. Dönerseniz büyük ihtimalle aynı döngü tekrar eder.' });
    secs.push({ emoji: '🔄', title: broke ? 'Geri dönüş ihtimali ve bundan sonrası' : 'Bundan sonrası: önümüzdeki 12 ay', items: items.length ? items : [{ tech: 'Önümüzdeki 12 ay', text: 'Kompozit haritaya değen belirgin bir transit yok; ilişki için sakin bir dönem.' }] });
  }
  const top = [...new Set(truths)].slice(0, 6);
  const has = (t: EvType) => events.some(e => e.ev.type === t);
  // özet: açılıştaki cümleyi tekrarlamak yerine olaylarda tekrar eden temayı söyle
  const themes = reads.map(x => x.r.theme).filter(Boolean) as string[];
  const counts = themes.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>());
  const rep2 = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const evLine = reads.length > 1 ? (rep2 && rep2[1] >= 2 ? ` ${rep2[1]} olay haritasında aynı tema tekrar ediyor (${rep2[0]}); bu tesadüf değil, ilişkinin ana dersi.` : ' Olay haritaları farklı temalar gösteriyor: ilişki tek bir sorundan değil, birikimden zorlanmış.') : '';
  const missing: [EvType, string][] = [['firstDate', 'İlk buluşmanın tarihini eklersen ilişkinin baştan beri taşıdığı sorun tohumlarını bulurum.'], ['breakup', 'Ayrılık tarihini eklersen kopuşun asıl sebebini haritadan okurum.'], ['start', 'İlişkinin başladığı günü eklersen ilişkinin “doğum karakterini” çıkarırım.'], ['meet', 'Tanıştığınız günü eklersen kaderin sizi nasıl karşılaştırdığına bakarım.']];
  const nextTip = missing.find(([t]) => !has(t))?.[1];
  const summary0 = partner && syn
    ? (syn.rs > syn.ps ? 'Özetle: bu bağın çekimi gerçek, ama haritalar uzun vadede yıpratan bir yapı gösteriyor. Kalıplar değişmedikçe sonuç değişmez.' : 'Özetle: aranızda gerçek bir çekim var; ilişkinin kaderini çekim değil, yukarıdaki kalıplarla ne yaptığınız belirler.')
    : 'Özetle: ilişkilerinde tekrar eden şey karşındaki kişiler değil, yukarıdaki kalıplar. Onları görmeden kurulan her bağ benzer yerde zorlanır.';
  const summary = summary0 + evLine;
  const next = !partner ? 'Karşı tarafın doğum bilgisini eklersen sinastri ve kompozit zamanlamayı da okuyayım.' : nextTip ?? 'Barışma ya da yeni bir dönüm noktası olursa onu da ekle; haritaları birbirine bağlayayım.';
  return { title: partner ? `${me.name} & ${partner.name}` : me.name, opening, secs, truths: top, summary, next, events: cards, links: links.slice(0, 8) };
}

// =====================================================================
// Perdelerle ilişki hikâyesi (kurallarla, yapay zekâsız)
// Olaylar eskiden yeniye sıralanır; aynı gündekiler tek perdede birleşir; ana metinde astroloji terimi geçmez,
// teknik bilgiler "Astrolojik detaylar" altında durur.
// =====================================================================
export interface Act { act: number; title: string; summary: string; paras: string[]; notes: string[] }
export interface Story { badge: string; title: string; acts: Act[]; core: string[]; future: string[]; truths: string[]; empty: boolean }

type Cls = 'hard' | 'soft' | 'mis' | 'conj';
const clsOf = (t: Asp): Cls => (t === 'quincunx' ? 'mis' : t === 'conjunction' ? 'conj' : HARD.includes(t) ? 'hard' : 'soft');
// iki gezegenin buluşmasını bir sahneye çeviren cümleler: [sert, uyumlu, uyumsuz, kavuşum]
const SCENE: Record<string, [string, string, string, string]> = {
  'venus|mars': ['Çekimle sürtüşme aynı anda geldi: yakınlaşmak isterken birbirinizin sınırına bastınız.', 'Birbirinizin varlığını bir anda çok yoğun hissettiğiniz, merakla arzunun birbirini beslediği bir çekim vardı.', 'Arzu ile sevgi aynı ritimde değildi; biri hızlanırken diğeri yavaşlamak istedi.', 'Karşı tarafın varlığını bir anda çok yoğun hissettiğiniz, merakın ve tenin birbirini beslediği, kontrol etmesi zor bir çekim başladı.'],
  'venus|saturn': ['Sevgi bir sınavla geldi: biri kendini korumaya alıp mesafe koydu, diğeri yeterince değer görmediğini hissetti.', 'Çekim hızlı değil ama sağlamdı; ciddiye alınmanın verdiği bir güven hissi vardı.', 'Sevmek ile kendini korumak arasında bir ayar sorunu vardı; yakınlık hep bir adım geride kaldı.', 'Sevgi ağırbaşlı ve temkinli geldi; içten içe “bu kolay olmayacak” duygusu da onunla birlikteydi.'],
  'moon|saturn': ['Söylenmeyenlerin biriktiği, birinin kendini korumak için duvar ördüğü ve kelimelerin boğazda düğümlendiği soğuk bir mesafe girdi.', 'Duygular kontrollüydü ama güven vericiydi; kimse acele etmedi.', 'Duygular ile sorumluluklar aynı dili konuşmadı; içinden gelen ile yapman gereken ayrı düştü.', 'Duygular bir ağırlığın altında kaldı; yalnızlık hissi sessizce masaya oturdu.'],
  'mercury|saturn': ['Mesajlar kısaldı, cümleler tartıldı; söylenmesi gerekenler ertelendi.', 'Konuşmalar ciddi ve netti; verilen sözler önemsendi.', 'Söylenenle kastedilen arasında hep bir kayma vardı.', 'Kelimeler azaldı ama her biri ağırlaştı.'],
  'sun|saturn': ['Biri sorumlulukların ağırlığı altında ezildi; ilişki bir yük gibi hissettirmeye başladı.', 'Olgun, ayakları yere basan bir an; kimse kendini kandırmadı.', 'Hayatın gerçekleri ile kalbin istediği ayrı yönlere çekti.', 'Gerçekler bütün çıplaklığıyla ortadaydı; “şimdi değil” duygusu ağır bastı.'],
  'mars|saturn': ['Harekete geçmek isteyen bir taraf, frene basan diğer tarafla çarpıştı.', 'Kararlı ve sabırlı bir adım atıldı; acele edilmedi.', 'İstek vardı ama zamanlama hep ters düştü.', 'Bir adım atılmak istendi ama biri durdurdu; bastırılmış bir öfke kaldı.'],
  'venus|pluto': ['Sevgiyle kontrol iç içe geçti; kıskançlık ve kaybetme korkusu çekimin bir parçası oldu.', 'Yüzeyde kalmayan, birbirinizin içini gören derin ve dönüştürücü bir yakınlık vardı.', 'Çekim derindi ama rahatsız ediciydi: yakınlaştıkça kontrol kaygısı da büyüdü.', 'Bırakması zor, takıntıya varan bir çekim başladı; bu bağ sizi değiştirecekti.'],
  'moon|pluto': ['Duygular bir anda dipten yükseldi; kaybetme korkusu sahneye girdi.', 'Duygular derin ve dürüsttü; maskeler düştü.', 'Hissettikleriniz ile göstermeye cesaret ettikleriniz aynı değildi.', 'Duygular çok yoğundu; geri dönüşü olmayan bir şey içten içe başladı.'],
  'mars|pluto': ['Güç meselesi ortaya çıktı: kim haklı, kim geri adım atacak sorusu her şeyin önüne geçti.', 'Kararlılık yüksekti; istenen şey için sonuna kadar gidildi.', 'Güç ile istek arasında sinsi bir gerilim vardı; kimse açıkça söylemedi.', 'Yoğun, sert bir enerji; ya hep ya hiç havası.'],
  'venus|uranus': ['Heyecan da huzursuzluk da aynı anda geldi: elektrik gibi bir çekim ama ayağın yere basmadığı bir zemin.', 'Sıra dışı, ferahlatıcı bir çekim; kalıpların dışına çıkıldı.', 'Yakınlık isteğiyle özgürlük ihtiyacı birbirini itti.', 'Beklenmedik, şimşek gibi bir çekim; ne kadar süreceği belirsiz.'],
  'moon|uranus': ['Duygular ani iniş çıkışlar yaptı; bir an yakın, bir an uzak.', 'Duygusal bir ferahlık; içinden geleni rahatça yaşayabildin.', 'İçindeki huzursuzluğun adını koyamadın.', 'Duygular aniden değişti; dün hissettiğin bugün geçerli değildi.'],
  'mars|uranus': ['Kimsenin beklemediği bir anda gelen, özgürlük ihtiyacıyla panik duygusunun karıştığı ani bir fren ve kopuş yaşandı.', 'Cesur, beklenmedik bir adım atıldı; içgüdüye güvenildi.', 'Hareket etme isteği vardı ama nereye gidileceği belli değildi.', 'Düşünmeden atılan ani bir adım; sonrası belirsiz.'],
  'sun|uranus': ['Biri kendine alan açmak için aniden geri çekildi.', 'Kendin olabildiğin, kalıpları kırdığın bir an.', 'Kim olduğunla ilişkinin senden istediği arasında sıkıştın.', 'Hayatın aniden yön değiştirdi.'],
  'venus|neptune': ['Karşınızdakini olduğu gibi değil, görmek istediğiniz gibi gördüğünüz bir sis vardı.', 'Masalsı, şefkatli bir yakınlık; kelimelere gerek kalmadan anlaşıldığınız hissi.', 'Hayal ettiğin ile yaşadığın arasında küçük ama sürekli bir boşluk vardı.', 'Büyülü ama bulanık bir an; ne yaşadığını sonradan anlayacaktın.'],
  'moon|neptune': ['Neyin gerçek neyin hayal olduğu karıştı; duygular bulanıklaştı.', 'Sezgilerin çok güçlüydü; söylenmeyeni hissettin.', 'Ne hissettiğini tam bilemedin.', 'Duygular sis gibi her yere yayıldı.'],
  'mercury|neptune': ['Söylenenler yanlış anlaşıldı; mesajlar farklı yorumlandı.', 'Kelimeler şiir gibiydi; söylenenden fazlası anlaşıldı.', 'Ne dendiği ile ne anlaşıldığı ayrı kaldı.', 'Konuşmalar belirsizdi; kimse net konuşmadı.'],
  'sun|moon': ['İstekler ile ihtiyaçlar çatıştı; biri bir şey isterken diğeri başka bir şeye ihtiyaç duydu.', 'İçinle dışın uyumluydu; ne istediğini biliyordun.', 'Ne istediğinle neye ihtiyaç duyduğun arasında bir ayar sorunu vardı.', 'Yeni bir döngü başlıyordu; her şey tohum hâlindeydi.'],
  'venus|jupiter': ['Beklentiler gerçeğin önüne geçti; fazla umut yüklendi.', 'Umut ve cömertlik havadaydı; her şey olduğundan daha güzel görünüyordu.', 'Umut büyüktü ama gerçekle tam örtüşmedi.', 'Bolluk ve neşe hissi; kalbin genişledi.'],
  'moon|mars': ['Duygular kısa sürede öfkeye dönüştü; küçük şeyler büyüdü.', 'Duygularını cesurca gösterdin.', 'Hissettiğin ile yaptığın birbirini tutmadı.', 'Duygular ateşlendi; tepkiler hızlıydı.'],
  'mercury|mars': ['Sözler keskinleşti; söylenen bir cümle aklında kaldı.', 'Açık ve doğrudan konuşuldu.', 'Konuşmalarda bir gerginlik vardı ama adı konmadı.', 'Hızlı, ateşli konuşmalar.'],
  'moon|venus': ['Sevgi verip almak arasında bir dengesizlik hissettin.', 'Sıcak, şefkatli bir yakınlık; birbirinizin yanında rahat ettiniz.', 'Sevgiyi ifade etme biçimleriniz farklıydı.', 'Kalbin yumuşadı; yakınlık kendiliğinden geldi.'],
  'sun|venus': ['Gurur ile sevgi çekişti.', 'Sevildiğini hissettin; görünür oldun.', 'Sevmek ile kendin olmak arasında küçük bir ayar gerekti.', 'Kendini güzel ve değerli hissettin.'],
};
const SC_KEY = (a: string, b: string) => { const order = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']; return [a, b].sort((x, y) => order.indexOf(x) - order.indexOf(y)).join('|'); };
const JARGON = /Venüs|Mars|Satürn|Jüpiter|Plüton|Neptün|Uranüs|Merkür|Güneş|Ay’|Ay |kavuşum|kare|karşıt|üçgen|altmışlık|quincunx|retro|transit|yükselen|Yükselen|\d+\. ev|MC|IC|Kiron|Düğüm/;
const PHASE_SCENE: Record<string, string> = {
  new: 'Gökyüzünde her şeyin sıfırdan başladığı bir andı; olanlar içgüdüyle, düşünmeden gelişti.',
  crescent: 'Yeni bir heyecan doğuyordu ama eski alışkanlıklar hâlâ geri çekiyordu.',
  first: 'Karar anıydı: ya ileri gidilecek ya da geri çekilinecekti.',
  gibbous: '“Doğru mu yapıyoruz?” sorusunun içten içe sorulduğu bir dönemdi.',
  full: 'Her şeyin görünür olduğu, duyguların açığa çıktığı bir andı; saklanan ne varsa yüzeye çıktı.',
  disseminating: 'Yaşananların sindirildiği, paylaşılmak istendiği olgun bir evreydi.',
  last: 'Bir şeyin bırakılması gerektiği hissedilen bir evreydi.',
  balsamic: 'Bir döngünün kapanmak üzere olduğu bir andı; böyle anlarda başlayan bağlar çoğu zaman eski bir hikâyeyi kapatmak için gelir: kısa ama yoğun.',
};
const NATAL_SPOT: Record<string, string> = { sun: 'kim olduğun ve gururun', moon: 'güvende hissetme ihtiyacın', venus: 'nasıl sevdiğin ve neyi değerli bulduğun', mars: 'isteklerin ve öfken', asc: 'dışarıya gösterdiğin yüz', dsc: 'ilişkilerde aradığın kişi', mc: 'hayattaki yönün', ic: 'evin ve kökün' };
const NATAL_SPOT3: Record<string, string> = { sun: 'kimliği ve gururu', moon: 'güvende hissetme ihtiyacı', venus: 'sevme biçimi', mars: 'istekleri ve öfkesi', asc: 'dışarıya gösterdiği yüz', dsc: 'ilişkide aradığı şey', mc: 'hayattaki yönü', ic: 'evi ve kökü' };
const ACT_INTRO: Record<EvType, [string, string]> = {
  meet: ['Her şey bir karşılaşmayla başladı.', 'Bir karşılaşma daha oldu.'],
  firstMove: ['İlk adım atıldı: o ilk mesaj, o ilk cesaret.', 'Bir adım daha atıldı.'],
  firstDate: ['İlk buluşma: ilk kıvılcımın, ilk gözlemin günü.', 'Bu buluşma asıl dönüm noktasıydı: kıvılcım bu kez gerçekten tutuştu.'],
  start: ['İlişki adını koydu ve resmen başladı.', 'İlişki bir kez daha, yeni bir sayfayla başladı.'],
  breakup: ['Ve ayrılık geldi.', 'Bir ayrılık daha yaşandı; bu kez öncekinden farklı bir yerden kırıldı.'],
  reunion: ['Yollar yeniden kesişti.', 'Bir kez daha geri dönüldü.'],
};
const ACT_TITLE: Record<EvType, string[]> = {
  meet: ['Görünmez Temas', 'İkinci Karşılaşma'], firstMove: ['İlk Cesaret', 'Yeni Bir Adım'], firstDate: ['İlk Kıvılcım', 'Asıl Dönüm Noktası'],
  start: ['Adı Konan Bağ', 'Yeni Bir Sayfa'], breakup: ['Kırılma', 'İkinci Kırılma'], reunion: ['Geri Dönüş', 'Bir Kez Daha'],
};
const timeMood = (t?: string) => {
  if (!t) return '';
  const h = parseInt(t, 10);
  if (isNaN(h)) return '';
  if (h < 5) return 'Gecenin en sessiz saatlerindeydi; dünyadan saklı, yoğun ve biraz yalnız bir an.';
  if (h < 10) return 'Sabahın erken saatindeydi; günün henüz başlamadığı, kararların net olduğu bir an.';
  if (h < 18) return 'Gün ışığındaydı; açık, sosyal, ayakları yere basan bir an.';
  if (h < 22) return 'Akşamın yumuşak saatlerindeydi; günün yükünün bırakıldığı, kalbin açıldığı bir an.';
  return 'Gece yarısına doğruydu; gizli, yoğun ve dışarıya kapalı bir an.';
};
const nightOf = (t?: string) => { const h = t ? parseInt(t, 10) : NaN; return !isNaN(h) && (h >= 22 || h < 5); };
const STORY_TITLE: Record<string, string> = { pluto: 'Bırakamadığın Çekim', saturn: 'Yanlış Zamanda Doğru Kişi', uranus: 'Fren ve Kıvılcım', neptune: 'Sisin İçindeki Yüz', mars: 'Ateşle Kurulan Köprü', '': 'Sessiz Bir Hikâye' };
const LESSON: Record<string, string> = {
  pluto: 'Bu ilişkinin dersi kontrol ve güven: biri diğerini kaybetme korkusuyla sıkı tuttukça bağ boğulur.',
  saturn: 'Bu ilişkinin dersi zamanlama ve sorumluluk: acele etmeden, kimsenin kendini yük gibi hissetmediği bir düzen kurulamazsa aynı duvar tekrar örülür.',
  uranus: 'Bu ilişkinin dersi özgürlük ile bağlılığı aynı anda taşıyabilmek: biri nefes alamadıkça ani frenler tekrar eder.',
  neptune: 'Bu ilişkinin dersi gerçekçilik: karşındakini olduğu gibi görmeden kurulan her yakınlık hayal kırıklığıyla biter.',
  mars: 'Bu ilişkinin dersi öfkeyi konuşmaya çevirebilmek: kavga, çekimin diğer yüzü olarak kalırsa ilişkiyi yorar.',
  '': 'Bu ilişkinin dersi, sessizce biriken küçük şeyleri zamanında konuşabilmek.',
};
const lowFirst = (x: string) => x.charAt(0).toLocaleLowerCase('tr') + x.slice(1);
const TOUCH_ME = ['Bu an, senin en hassas yerine dokundu: {s}.', 'Bu kez dokunulan yer {s} oldu.', 'Burada doğrudan {s} sınandı.', 'Yine senin içinde bir yere dokunuldu: {s}.'];
const LINK_OPEN = ['Bu tesadüf değildi:', 'Hikâye geriye bağlanıyordu:', 'Geçmiş burada yeniden konuştu:', 'Bir önceki perdeden kalan iz buradaydı:'];
const START_OVERRIDE: Record<string, string> = { 'mars|uranus': 'Ani, sarsıcı bir enerji vardı: düşünmeden tepki verildi, sonrası belirsiz kaldı.' };
const firstSent = (x: string) => (x.match(/[^.!?]+[.!?]+/) ?? [x])[0].trim();

export function storyActs(me: Person, partner: Person | null, events: { ev: RelEvent; c: Chart }[]): Story {
  const sorted = [...events].sort((a, b) => a.c.utc.getTime() - b.c.utc.getTime());
  // aynı gün → tek perde
  const groups: { ev: RelEvent; c: Chart }[][] = [];
  for (const e of sorted) { const g = groups[groups.length - 1]; if (g && g[0].ev.date === e.ev.date) g.push(e); else groups.push([e]); }
  const seenType: Record<string, number> = {};
  const themes: string[] = [];
  const acts: Act[] = [];
  const truths: string[] = [];
  const persons = [me, partner].filter(Boolean) as Person[];
  groups.forEach((g, gi) => {
    const paras: string[] = [], notes: string[] = [];
    const titles: string[] = [], intros: string[] = [];
    const p1: string[] = [], p2: string[] = [], p3: string[] = [];
    for (const [ei, { ev, c }] of g.entries()) {
      const k = seenType[ev.type] = (seenType[ev.type] ?? 0) + 1;
      titles.push(ACT_TITLE[ev.type][Math.min(k, 2) - 1]);
      p1.push(ei > 0 ? 'Aynı gün, saatler sonra: ' + lowFirst(ACT_INTRO[ev.type][Math.min(k, 2) - 1]) : ACT_INTRO[ev.type][Math.min(k, 2) - 1]);
      const timed = timedOf(c);
      const pts: Pt[] = timed ? [...PLANETS, 'asc', 'mc'] : [...PLANETS];
      const asp = aspectsIn(c, pts).filter(x => x.orb <= (timed ? 4 : 3));
      const personalSet = ['sun', 'moon', 'mercury', 'venus', 'mars'];
      const keyAsp = asp.filter(x => personalSet.includes(x.a as string) || personalSet.includes(x.b as string)).filter(x => SCENE[SC_KEY(x.a, x.b)]);
      const mood = timeMood(timed ? ev.time : undefined);
      if (mood) p1.push(mood);
      const used = new Set<string>();
      let lastSoft: boolean | null = null;
      for (const x of keyAsp) { const key = SC_KEY(x.a, x.b); if (used.has(key) || used.size >= 3) continue; used.add(key); const cl = clsOf(x.type); let sc = SCENE[key][cl === 'hard' ? 0 : cl === 'soft' ? 1 : cl === 'mis' ? 2 : 3]; if (START_TYPES.includes(ev.type) && cl === 'hard' && START_OVERRIDE[key]) sc = START_OVERRIDE[key]; if (ev.type === 'breakup' && (cl === 'soft' || (cl === 'conj' && /çekim|yakınlık/.test(sc)))) sc = 'Ayrılırken bile ' + lowFirst(sc); const soft = cl === 'soft' || (cl === 'conj' && !/mesafe|ağır|yük|takıntı|öfke/.test(sc)); if (lastSoft !== null && lastSoft !== soft) sc = 'Öte yandan ' + lowFirst(sc); lastSoft = soft; (used.size === 1 ? p1 : p2).push(sc); notes.push(`${EV_LABEL[ev.type]}: ${aTxt(x)}`); }
      // tema (ağır gezegen)
      const hv = asp.filter(x => (['pluto', 'saturn', 'uranus', 'neptune'].includes(x.a as string) || ['pluto', 'saturn', 'uranus', 'neptune'].includes(x.b as string)) && (HARD.includes(x.type) || x.type === 'quincunx') && (personalSet.includes(x.a as string) || personalSet.includes(x.b as string)));
      if (hv[0]) themes.push((['pluto', 'saturn', 'uranus', 'neptune'].find(o => o === hv[0].a || o === hv[0].b))!);
      // ay evresi ve geri hareketler
      const ph = moonPhaseOf(c);
      p2.push(PHASE_SCENE[ph.key]); notes.push(`Ay fazı: ${ph.name} (${Math.round(ph.a)}°)`);
      const vs = station('venus', c.utc), ms = station('mercury', c.utc);
      if (vs === 'retro' || vs === 'stationRx') { p2.push('Aşkın geriye baktığı bir dönemdi: geçmişten bir şey taşıyan, yarım kalmışlık hissi veren.'); notes.push('Venüs retro'); }
      if (ms === 'retro' || ms === 'stationRx') { p2.push('Mesajların havada kaldığı, eski konuşmaların geri geldiği bir dönemdi.'); notes.push('Merkür retro'); }
      // doğum haritalarına dokunuş
      for (const ps of persons) {
        const tg: Pt[] = ['sun', 'moon', 'venus', 'mars', ...(timedOf(ps.chart) ? ['asc', 'dsc'] as Pt[] : [])];
        const h = cross(c, ['sun', 'moon', 'venus', 'mars', 'saturn', 'pluto', 'uranus', 'neptune'], ps.chart, tg, ['conjunction', 'opposition', 'square', 'trine'], 2)[0];
        if (!h) continue;
        const you = ps === me;
        const spot = NATAL_SPOT[h.b as string] ?? 'özün';
        const hardH = HARD.includes(h.type);
        p3.push(you ? `${TOUCH_ME[gi % TOUCH_ME.length].replace('{s}', spot)} ${hardH ? 'O yüzden yaşananlar sana olduğundan daha büyük geldi.' : 'O yüzden bu an sende iz bıraktı, ama iyi bir iz.'}` : `${ps.name} için de sıradan bir an değildi: ${NATAL_SPOT3[h.b as string] ?? 'özü'} doğrudan etkilendi${hardH ? '; tepkisi bu yüzden sert ya da kapalı olmuş olabilir.' : '.'}`);
        notes.push(`${EV_LABEL[ev.type]}: olay ${poss(NM[h.a])} ${ASP_TR[h.type]} ${gen(ps.name)} doğum ${poss(NM[h.b])} (${orbTxt(h.orb)})`);
      }
      // önceki perdelerle sebep–sonuç bağı
      const prev = sorted.filter(x => x.c.utc < c.utc && x.ev.date !== ev.date);
      for (const pv of prev.slice(-3).reverse()) {
        const h = cross(c, ['sun', 'moon', 'venus', 'mars', 'saturn', 'pluto', 'uranus', 'neptune'], pv.c, ['sun', 'moon', 'venus', 'mars', ...(timedOf(pv.c) ? ['asc'] as Pt[] : [])], ['conjunction', 'opposition', 'square'], 2)[0];
        if (!h) continue;
        const what = (h.b === 'venus' ? 'kıvılcımı yakan çekim' : h.b === 'moon' ? 'o günkü duygular' : h.b === 'sun' ? 'o gün verilen karar' : h.b === 'mars' ? 'o günkü istek' : 'o günün havası');
        p3.push(`${LINK_OPEN[gi % LINK_OPEN.length]} ${EV_LABEL[pv.ev.type].toLocaleLowerCase('tr')} gününde ${what}, bu kez ${h.type === 'conjunction' ? 'aynı noktada yeniden canlandı' : 'baskı altına girdi'}. ${h.type === 'conjunction' ? 'Hikâye kendini tekrar ediyordu.' : 'O gün ekilen tohum burada filizlendi.'}`);
        notes.push(`${EV_LABEL[ev.type]} ${poss(NM[h.a])} ${ASP_TR[h.type]} ${EV_LABEL[pv.ev.type].toLocaleLowerCase('tr')} ${poss(NM[h.b])} (${orbTxt(h.orb)})`);
        break;
      }
      if (!timed) notes.push(`${EV_LABEL[ev.type]}: saat girilmediği için evler ve eksenler kullanılmadı`);
      else if (SUSPECT_TIMES.includes((ev.time ?? '').replace('.', ':').padStart(5, '0'))) notes.push(`${EV_LABEL[ev.type]}: saat ${ev.time} kesin değilse eksen yorumları temkinli okunmalı`);
      if (ev.type === 'breakup') { const t = themes[themes.length - 1]; if (t === 'pluto') truths.push('Bu kopuş geri dönüşü zor bir yerden geldi: dönülse bile aynı ilişkiye dönülmez.'); if (t === 'uranus') truths.push('Ayrılık ani göründü ama birinin içinde çoktan başlamıştı.'); if (t === 'saturn') truths.push('Bu ayrılık bir kapris değil, biriken bir yükün sonucuydu.'); if (t === 'neptune') truths.push('Bu ilişkide gerçek ile hayal karışmıştı; ayrılık sisin dağılmasıydı.'); }
      if (START_TYPES.includes(ev.type) && ph.key === 'balsamic' && !truths.some(t => t.includes('kapatmak'))) truths.push('Bu bağ, eski bir hikâyeyi kapatmak için gelen türden: yoğun ama kısa ömürlü olma eğiliminde.');
    }
    const dd = (xs: string[]) => [...new Set(xs)];
    paras.push(dd(p1).join(' '));
    if (p2.length) paras.push(dd(p2).slice(0, 3).join(' '));
    if (p3.length) paras.push(dd(p3).slice(0, 3).join(' '));
    const ttl = [...new Set(titles)].join(' ve ');
    const summary = g.map(({ ev }) => `${EV_LABEL[ev.type]} · ${ev.date}${ev.time ? ' ' + ev.time : ''}${ev.place ? ' · ' + ev.place.label.split(',')[0] : ''}`).join('  |  ');
    acts.push({ act: gi + 1, title: `${gi + 1}. Perde: ${ttl}`, summary, paras: paras.map(p => p.trim()).filter(Boolean), notes });
  });

  // genel sentez
  const cnt = themes.reduce((m, t) => m.set(t, (m.get(t) ?? 0) + 1), new Map<string, number>());
  const dom = [...cnt.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const core: string[] = [];
  const pats = persons.map(p => ({ p, list: lovePatterns(p).filter(x => !JARGON.test(x.text)) }));
  const meLine = pats[0]?.list.slice(0, 2).map(x => firstSent(x.text)).join(' ');
  if (partner) {
    const syn = synastryHonest(me, partner);
    const pLine = pats[1]?.list.slice(0, 2).map(x => firstSent(x.text)).join(' ');
    core.push(`${syn.ps >= syn.rs + 4 ? 'Aranızdaki çekim gerçek ve güçlü; sizi birbirinize iten şey sıradan bir merak değil.' : syn.rs >= syn.ps + 4 ? 'Aranızda çekimden çok sürtünme var; birbirinize dokundukça bir yerler acıyor.' : 'Aranızda hem güçlü bir çekim hem de güçlü bir sürtünme var: böyle bağlar kolay bitmez ama sürekli acıtır.'} ${meLine ? `${me.name} tarafında: ${meLine}` : ''} ${pLine ? `${partner.name} tarafında: ${pLine}` : ''}`.trim());
  } else if (meLine) core.push(`Bu hikâyede değişmeyen şey senin aşk kalıbın: ${meLine} Karşına kim çıkarsa çıksın, bu kalıp hikâyeye yön veriyor.`);
  const nights = sorted.filter(e => timedOf(e.c) && nightOf(e.ev.time)).length;
  const c2: string[] = [];
  if (acts.length) c2.push(dom ? `Perdeler boyunca tekrar eden tema belli: ${({ pluto: 'yoğunluk, kontrol ve bırakamamak', saturn: 'mesafe, yük ve zamanlama', uranus: 'ani frenler ve özgürlük ihtiyacı', neptune: 'sis, idealleştirme ve hayal kırıklığı', mars: 'tutku ile öfkenin iç içeliği' } as Record<string, string>)[dom]}.` : 'Perdeler boyunca tek bir ağır tema öne çıkmıyor; ilişki büyük kırılmalardan çok küçük birikimlerle şekillenmiş.');
  if (nights >= 2) c2.push('Bu ilişkinin dönüm noktaları hep geceye düşmüş: gizli, yoğun, dünyadan saklı anlar. Gün ışığında aynı rahatlıkla yaşanamayan bir bağın işareti olabilir.');
  if (c2.length) core.push(c2.join(' '));
  const future: string[] = [];
  if (partner) {
    const tm = compositeTiming(me.chart, partner.chart);
    const win = [...new Set(tm.list.slice(0, 6).map(t => `${halfMonth(t.start)} ${t.label === 'sınav' ? 'zorlayıcı, kararların netleştiği' : t.label === 'destekleyici' ? 'yakınlaşmaya açık' : 'eski duyguların yüzeye çıktığı'} bir dönem`))].slice(0, 3);
    future.push(win.length ? `Önümüzdeki aylarda öne çıkan pencereler: ${win.join('; ')}.${tm.venusRx ? ` ${halfMonth(tm.venusRx.start)} civarı eski aşkların geri döndüğü klasik bir dönem; bir temas olabilir ama bu bir değişim değil, nostaljidir.` : ''}` : 'Önümüzdeki aylarda ilişkiye değen belirgin bir dönem görünmüyor; sakin bir dönem.');
  }
  future.push(`${LESSON[dom]} Bunlar kesinlik değil, eğilim: ne olacağını haritalar değil, ${partner ? 'ikinizin' : 'senin'} bu kalıplarla ne yaptığın${partner ? '' : ''} belirler.`.replace('ikinizin bu kalıplarla ne yaptığın', 'ikinizin bu kalıplarla ne yaptığı'));
  for (const x of pats) for (const pt of x.list) if (pt.truth && truths.length < 5 && !JARGON.test(pt.truth)) truths.push(pt.truth);
  return { badge: partner ? 'Çift harita + an haritaları' : 'Tek harita + an haritaları', title: STORY_TITLE[dom] ?? STORY_TITLE[''], acts, core, future, truths: [...new Set(truths)].slice(0, 5), empty: !events.length };
}
