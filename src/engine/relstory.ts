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
export interface Reading { title: string; opening: string; secs: Sec[]; truths: string[]; summary: string; next: string; note?: string }
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
export function readEvent(ev: RelEvent, ec: Chart, me: Person, partner: Person | null, all: { ev: RelEvent; c: Chart }[]): Reading {
  const secs: Sec[] = [], truths: string[] = [];
  const timed = timedOf(ec);
  const P = ec.positions;
  const asp = aspectsIn(ec);
  const isStart = START_TYPES.includes(ev.type);
  const woman = [me, partner].find(x => x?.gender === 'f') ?? null, man = [me, partner].find(x => x?.gender === 'm') ?? null;
  const ph = moonPhaseOf(ec);

  // Ana tema: en sıkı açı ve ağır gezegenlerin kişisel noktalara teması
  const personal: Pt[] = ['sun', 'moon', 'venus', 'mars'];
  const heavy = asp.filter(x => (['pluto', 'saturn', 'uranus', 'neptune'].includes(x.a as string) || ['pluto', 'saturn', 'uranus', 'neptune'].includes(x.b as string)) && (personal.includes(x.a) || personal.includes(x.b)) && x.orb <= 4);
  const outer = heavy[0] ? (['pluto', 'saturn', 'uranus', 'neptune'].find(o => o === heavy[0].a || o === heavy[0].b) as string) : (findA(asp, 'venus', 'mars', HARD) ? 'mars' : '');
  const theme: Item[] = [];
  if (asp[0]) theme.push({ tech: `En sıkı açı: ${aTxt(asp[0])}`, text: asp[0].orb <= 2 ? 'Haritanın omurgası bu: olayın asıl dili burada.' : 'Haritanın en güçlü bağlantısı bu.' });
  for (const h of heavy.filter(h => h !== asp[0]).slice(0, 3)) theme.push({ tech: aTxt(h), text: OUTER_THEME[(['pluto', 'saturn', 'uranus', 'neptune'].find(o => o === h.a || o === h.b))!].text });
  // T-kare
  for (const o of asp.filter(x => x.type === 'opposition')) {
    const apex = (PLANETS as Pt[]).find(p => p !== o.a && p !== o.b && findA(asp, p, o.a, ['square']) && findA(asp, p, o.b, ['square']));
    if (apex) { theme.push({ tech: `T-kare: ${NM[o.a]}–${NM[o.b]} karşıtlığı, tepe noktası ${NM[apex]}`, text: `Bütün gerilim ${NM[apex]} üzerinde toplanıyor; olay bu gezegenin konusu üzerinden patlamış.` }); break; }
  }
  if (timed) for (const p of PLANETS) for (const ax of ['asc', 'dsc', 'mc', 'ic'] as Pt[]) { const L = lonOf(ec, ax)!; if (angleDiff(P[p].lon, L) <= 5) theme.push({ tech: `${NM[p]} ${NM[ax]} üzerinde (${angleDiff(P[p].lon, L).toFixed(1)}°)`, text: `Eksene oturan gezegen olayın görünür yüzü: ${p === 'saturn' ? 'ağırlık ve mesafe' : p === 'pluto' ? 'güç ve kesinlik' : p === 'uranus' ? 'ani kopuş' : p === 'neptune' ? 'sis ve kaçış' : p === 'venus' ? 'sevgi ve çekim' : p === 'mars' ? 'öfke ve hareket' : 'olayın ana konusu'}.` }); }
  secs.push({ emoji: '🔥', title: 'Haritanın ana teması', items: theme });

  // Kadın ve erkek nasıl hissetmiş (olay haritasında kadın: Ay + Venüs, erkek: Güneş + Mars)
  const feel = (id: BodyId) => {
    const xs = asp.filter(x => (x.a === id || x.b === id) && x.orb <= 5).slice(0, 2);
    return xs.map(x => ({ tech: `${NM[id]} ${where(ec, id)}: ${aTxt(x)}`, text: describe(id, x) }));
  };
  const seenA = new Set<string>();
  const uniq = (xs: Item[]) => xs.filter(i => { const k = i.tech.split(': ').slice(1).join(': '); if (seenA.has(k)) return false; seenA.add(k); return true; });
  const withVoice = (xs: Item[], v: string) => xs.map((i, k) => (k === 0 ? { ...i, voice: i.voice ?? v } : i));
  const wItems: Item[] = uniq([...feel('moon'), ...feel('venus')]);
  if (!wItems.length) wItems.push({ tech: `Ay ${where(ec, 'moon')}, Venüs ${where(ec, 'venus')}`, text: 'Kadın tarafında sıkı bir açı yok; duygusal tepki sessiz ve içe dönük.' });
  if (woman) { const tr = transitsTo(ec, woman.chart); if (tr) wItems.push(tr); }
  secs.push({ emoji: '👩', title: `${woman ? woman.name : 'Kadın'} nasıl hissetmiş?`, items: withVoice(wItems, voiceFor('f', ev.type, outer)) });
  seenA.clear();
  const mItems: Item[] = uniq([...feel('sun'), ...feel('mars')]);
  if (!mItems.length) mItems.push({ tech: `Güneş ${where(ec, 'sun')}, Mars ${where(ec, 'mars')}`, text: 'Erkek tarafında sıkı bir açı yok; olayı dışarıdan sakin yaşamış görünür.' });
  if (man) { const tr = transitsTo(ec, man.chart); if (tr) mItems.push(tr); }
  secs.push({ emoji: '👨', title: `${man ? man.name : 'Erkek'} nasıl hissetmiş?`, items: withVoice(mItems, voiceFor('m', ev.type, outer)) });

  // O anda gökyüzü: retrolar, duraklar, Ay fazı, 1. ve 7. ev yöneticileri
  const now: Item[] = [];
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
      hits.forEach(h => seeds.push({ tech: `Ayrılık ${poss(NM[h.a])} ${ASP_TR[h.type]} başlangıç ${poss(NM[h.b])} (${orbTxt(h.orb)})`, text: 'Başlangıçta duran nokta ayrılıkta tetiklenmiş: sorun baştan beri oradaydı.' }));
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
  const harsh = heavy.length >= 2 || seeds.length >= 2 || ph.key === 'balsamic';
  const opening = ev.type === 'breakup'
    ? `Bu harita, ayrılığın ${outer ? OUTER_THEME[outer].open : 'sessiz bir tükenme'} ile geldiğini söylüyor.${seeds.length && !isStart ? ' Ve sorun yeni değil: başlangıçta duran noktalar tetiklenmiş.' : ''}`
    : `Bu ${EV_LABEL[ev.type].toLocaleLowerCase('tr')} haritası, ${harsh ? 'güçlü ama sorunlu bir başlangıcı' : 'akışı olan bir başlangıcı'} gösteriyor${outer ? `; ${OUTER_THEME[outer].open} baştan masada` : ''}.`;
  if (ev.type === 'breakup') {
    if (outer === 'pluto') truths.push('Plüton’lu ayrılıklar geri dönüşsüzdür: dönülse bile aynı ilişkiye değil, başka bir şeye dönülür.');
    if (outer === 'uranus') truths.push('Bu kopuş ani görünse de birinin içinde çoktan başlamıştı.');
    if (outer === 'saturn') truths.push('Bu ayrılık bir kaprisi değil, birikmiş bir yükü gösteriyor; “bir daha deneyelim” aynı yükü geri getirir.');
    if (outer === 'neptune') truths.push('Bu ilişkide gerçek ile hayal karışmış; ayrılık sisin dağılmasıdır.');
  } else {
    if (ph.key === 'balsamic') truths.push('Bu, uzun ömürlü bir ilişkinin başlangıç haritasına benzemiyor.');
    if (seeds.length >= 2) truths.push('Sorunların tohumu ilk günden ekili; ilişki ilerledikçe büyür, kaybolmaz.');
  }
  return { title: `${EV_LABEL[ev.type]} · ${ev.date}${ev.time ? ' ' + ev.time : ''}`, opening, secs, truths, summary: '', next: '', note: timed ? undefined : 'Saat girilmediği için öğlen 12:00 varsaydım ve evleri yorumlamadım.' };
}
function describe(id: BodyId, x: A): string {
  const o = (x.a === id ? x.b : x.a) as string;
  const hard = HARD.includes(x.type) && !(x.type === 'conjunction' && ['venus', 'jupiter'].includes(o));
  const M: Record<string, [string, string]> = {
    saturn: ['ağırlık, mesafe ve yetersizlik', 'olgunluk ve sorumluluk'], pluto: ['güç, kontrol ve yıkım', 'derin bağ ve dönüşüm'], uranus: ['ani kopuş ve huzursuzluk', 'heyecan ve yenilik'],
    neptune: ['belirsizlik ve hayal kırıklığı', 'romantizm ve şefkat'], mars: ['öfke ve sabırsızlık', 'arzu ve cesaret'], venus: ['sevgi ile gerilim', 'sevgi ve uyum'], jupiter: ['abartı ve aşırılık', 'umut ve cömertlik'],
    sun: ['ego çatışması', 'netlik'], moon: ['duygusal dalga', 'duygusal yakınlık'], mercury: ['yanlış anlaşılma', 'iyi iletişim'],
  };
  const m = M[o] ?? ['gerilim', 'akış'];
  return hard ? `Bu noktada ${m[0]} baskın; o an içten içe sarsılmış.` : `Bu noktada ${m[1]} var; o an bir yanı umutluymuş.`;
}
function transitsTo(ec: Chart, natal: Chart): Item | null {
  const h = cross(ec, ['saturn', 'pluto', 'uranus', 'neptune', 'mars', 'venus', 'jupiter'], natal, ['sun', 'moon', 'venus', 'mars', ...(timedOf(natal) ? ['asc', 'dsc'] as Pt[] : [])], ['conjunction', 'opposition', 'square', 'trine'], 3)[0];
  if (!h) return null;
  const heavy = ['saturn', 'pluto', 'uranus', 'neptune'].includes(h.a as string);
  return { tech: `O gün transit ${NM[h.a]}, doğum ${dat3(NM[h.b])} ${ASP_TR[h.type]} (${orbTxt(h.orb)})`, text: heavy ? 'Bu transit zamanlamayı açıklar; davranışın kökü yine de doğum haritasındadır. Transit geçer, kalıp kalır.' : 'O gün bu kişinin içinde bir kıpırtı vardı; olay onu doğrudan etkilemiş.' };
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
  // Olaylar: en yeni olay en üstte; açılış, acı gerçekler ve özet önce olaylardan beslenir
  const evSecs: Sec[] = [], evTruths: string[] = [];
  const sorted = [...events].sort((a, b) => b.c.utc.getTime() - a.c.utc.getTime());
  const reads = sorted.map(e => ({ e, r: readEvent(e.ev, e.c, me, partner, events) }));
  for (const { e, r } of reads) {
    evSecs.push({ emoji: e.ev.type === 'breakup' ? '💥' : e.ev.type === 'reunion' ? '🔁' : '🌱', title: r.title, items: [{ tech: 'Bu anın özü', text: r.opening }] });
    for (const sc of r.secs) evSecs.push({ ...sc, title: `${sc.title} (${EV_LABEL[e.ev.type].toLocaleLowerCase('tr')})` });
    for (const t of r.truths) if (!evTruths.includes(t)) evTruths.push(t);
  }
  if (reads.length) {
    const last = reads[0];
    opening = `${EV_LABEL[last.e.ev.type]} (${last.e.ev.date}): ${last.r.opening}` + (reads.length > 1 ? ` Toplam ${reads.length} olay haritasını birlikte okudum.` : '');
    secs.splice(0, 0, ...evSecs);
    truths.splice(0, 0, ...evTruths);
  }
  // Bundan sonrası
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
  const evLine = reads.length ? ` En son eklediğin ${EV_LABEL[reads[0].e.ev.type].toLocaleLowerCase('tr')} haritası da şunu söylüyor: ${reads[0].r.opening.split(/(?<=[.!?])\s/)[0]}` : '';
  const missing: [EvType, string][] = [['firstDate', 'İlk buluşmanın tarihini eklersen ilişkinin baştan beri taşıdığı sorun tohumlarını bulurum.'], ['breakup', 'Ayrılık tarihini eklersen kopuşun asıl sebebini haritadan okurum.'], ['start', 'İlişkinin başladığı günü eklersen ilişkinin “doğum karakterini” çıkarırım.'], ['meet', 'Tanıştığınız günü eklersen kaderin sizi nasıl karşılaştırdığına bakarım.']];
  const nextTip = missing.find(([t]) => !has(t))?.[1];
  const summary0 = partner && syn
    ? (syn.rs > syn.ps ? 'Özetle: bu bağın çekimi gerçek, ama haritalar uzun vadede yıpratan bir yapı gösteriyor. Kalıplar değişmedikçe sonuç değişmez.' : 'Özetle: aranızda gerçek bir çekim var; ilişkinin kaderini çekim değil, yukarıdaki kalıplarla ne yaptığınız belirler.')
    : 'Özetle: ilişkilerinde tekrar eden şey karşındaki kişiler değil, yukarıdaki kalıplar. Onları görmeden kurulan her bağ benzer yerde zorlanır.';
  const summary = summary0 + evLine;
  const next = !partner ? 'Karşı tarafın doğum bilgisini eklersen sinastri ve kompozit zamanlamayı da okuyayım.' : nextTip ?? 'Barışma ya da yeni bir dönüm noktası olursa onu da ekle; haritaları birbirine bağlayayım.';
  return { title: partner ? `${me.name} & ${partner.name}` : me.name, opening, secs, truths: top, summary, next };
}
