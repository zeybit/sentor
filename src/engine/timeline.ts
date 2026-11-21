// Hayat takvimi: önemli dönemlerin zamanlaması.
// Tek bir teknik yerine birkaç tekniğin aynı döneme işaret etmesi (yakınsama) aranır:
// yıllık profeksiyon (yılın teması), Jüpiter–Satürn ve dış gezegen transitleri, Ay düğümleri,
// tutulmalar, ikincil progresyon ve solar arc direksiyonları. Her ay için puan hesaplanır,
// eşiği aşan ardışık aylar bir "dönem" olarak birleştirilir.
import * as A from 'astronomy-engine';
import type { BodyId, Chart } from './astro';
import { bodyLon, houseOf, norm, angleDiff, lahiri, SIGN_RULERS } from './astro';
import { lots, solarReturnChart } from './techniques';
import { primaryDirections, Direction } from './primary';

export type Topic = 'love' | 'career' | 'home' | 'travel' | 'change';
export const TOPICS: Topic[] = ['love', 'career', 'home', 'travel', 'change'];
type L = { tr: string; en: string };
const l = (tr: string, en: string): L => ({ tr, en });

export interface Factor { id: string; w: number; text: L }
export interface Window {
  topic: Topic; start: Date; end: Date; peak: Date; score: number; reasons: Factor[]; gen?: boolean;
  /** Bu döneme işaret eden farklı teknik aileleri (transit, progresyon, solar arc, profeksiyon, tutulma, Güneş dönüşü) */
  techs: Tech[];
  /** Kişinin geçmiş olay tarihlerinde de etkin olmuş işaretler (kişisel ayar) */
  calib?: string[];
}
export type Tech = 'transit' | 'progression' | 'solarArc' | 'primary' | 'profection' | 'eclipse' | 'solarReturn';
/** Bir işaretin hangi teknikten geldiği */
export const techOf = (id: string): Tech => /^pd[A-Z]/.test(id) ? 'primary' : /^SR/.test(id) ? 'solarReturn' : /^sa/.test(id) ? 'solarArc' : /^p[A-Z]/.test(id) ? 'progression' : /^(prof|lord)/.test(id) ? 'profection' : /^E/.test(id) ? 'eclipse' : 'transit';
/** Kişiye özel ayarlar: cinsiyet (klasik eş göstergesi) ve geçmiş ilişki olaylarının tarihleri */
export interface PersonCtx { gender?: 'f' | 'm' | null; loveDates?: Date[] }
interface Ctx { pds: Direction[]; sig: BodyId[]; lotM: number | null; juno: number | null; vx: number | null; sr: (d: Date) => Chart | null; boost: Set<string> }
/** Kuşak etkileri: yaklaşık aynı yıllarda doğan herkeste aynı tarihlere denk gelir (Satürn dönüşü gibi). */
export const GEN_IDS = new Set(['Sret', 'Sopp', 'Uopp', 'Jret']);

const DAY = 864e5, YEAR = 365.2422 * DAY;
const near = (a: number, b: number, orb: number) => angleDiff(a, b) <= orb;
const hard = (a: number, b: number, orb: number) => [0, 90, 180].some(x => Math.abs(angleDiff(a, b) - x) <= orb);
const soft = (a: number, b: number, orb: number) => [60, 120].some(x => Math.abs(angleDiff(a, b) - x) <= orb);
const major = (a: number, b: number, orb: number) => hard(a, b, orb) || soft(a, b, orb);

interface Ecl { date: Date; lon: number; kind: 'solar' | 'lunar' }
function eclipses(from: Date, to: Date): Ecl[] {
  const out: Ecl[] = [];
  try {
    let s = A.SearchGlobalSolarEclipse(from);
    while (s.peak.date < to) { out.push({ date: s.peak.date, lon: bodyLon('sun', s.peak.date), kind: 'solar' }); s = A.NextGlobalSolarEclipse(s.peak); }
    let m = A.SearchLunarEclipse(from);
    while (m.peak.date < to) {
      if (m.kind !== 'penumbral') out.push({ date: m.peak.date, lon: bodyLon('moon', m.peak.date), kind: 'lunar' });
      m = A.NextLunarEclipse(m.peak);
    }
  } catch { /* tutulma araması başarısız olursa bu katman atlanır */ }
  return out;
}

/** Her ay için etkin faktörler */
function factorsAt(ch: Chart, d: Date, ecl: Ecl[], cx?: Ctx): Record<Topic, Factor[]> {
  const out: Record<Topic, Factor[]> = { love: [], career: [], home: [], travel: [], change: [] };
  const add = (t: Topic, id: string, w: number, tr: string, en: string) => out[t].push({ id, w: w + (t === 'love' && cx?.boost.has(id) ? 1 : 0), text: l(tr, en) });
  const ay = ch.zodiac === 'sidereal' ? lahiri(A.MakeTime(d)) : 0;
  const tr = (id: BodyId) => norm(bodyLon(id, d) - ay);
  const P = ch.positions;
  const hasAngles = ch.asc !== null && ch.mc !== null && ch.cusps.length === 12;
  const age = (d.getTime() - ch.utc.getTime()) / YEAR;
  const ASC = ch.asc ?? 0, MC = ch.mc ?? 0, DSC = norm(ASC + 180), IC = norm(MC + 180);
  const r7 = hasAngles ? SIGN_RULERS[Math.floor(ch.cusps[6] / 30)] : null;
  const r10 = hasAngles ? SIGN_RULERS[Math.floor(ch.cusps[9] / 30)] : null;
  const r4 = hasAngles ? SIGN_RULERS[Math.floor(ch.cusps[3] / 30)] : null;
  const r9 = hasAngles ? SIGN_RULERS[Math.floor(ch.cusps[8] / 30)] : null;

  // ---- Profeksiyon: yaşın teması (tam burç ev sistemiyle) ----
  if (hasAngles) {
    const house = (Math.floor(age) % 12) + 1;
    const lord = SIGN_RULERS[(Math.floor(ASC / 30) + Math.floor(age)) % 12];
    if (house === 7) add('love', 'prof7', 2, 'Bu yaşın teması ilişkiler: astrolojide her yaş bir eve denk gelir ve bu yıl evlilik evinin yılı.', 'This age’s theme is relationships: each year of life activates a house, and this is your marriage-house year.');
    if (house === 5) add('love', 'prof5', 1, 'Bu yaş aşk ve flört evinin yılı; romantik karşılaşmalara açık bir dönem.', 'This is your romance-house year, a time open to new attractions.');
    if (lord === 'venus' || lord === r7) add('love', 'lordV', 1, 'Yılın yöneticisi aşkı ve ortaklığı temsil eden gezegen; ilişki konuları bu yıl öne çıkar.', 'The ruler of the year is the planet of love and partnership, so relationship matters come forward.');
    if (house === 10) add('career', 'prof10', 2, 'Bu yaş kariyer evinin yılı: iş, statü ve hedefler hayatının merkezine geliyor.', 'This is your career-house year: work, status and goals move to the centre of your life.');
    if (lord === r10) add('career', 'lord10', 1, 'Yılın yöneticisi kariyer evinin gezegeni; iş kararları bu yıl ağırlık kazanır.', 'The ruler of the year governs your career house, so work decisions carry weight.');
    if (house === 4) add('home', 'prof4', 2, 'Bu yaş ev ve aile evinin yılı: yuva, taşınma ve aile konuları öne çıkar.', 'This is your home-house year: home, moving and family come forward.');
    if (lord === r4) add('home', 'lord4', 1, 'Yılın yöneticisi ev ve aile evinin gezegeni.', 'The ruler of the year governs your home house.');
    if (house === 9) add('travel', 'prof9', 2, 'Bu yaş yurt dışı, eğitim ve ufuk açan deneyimlerin yılı.', 'This is your year of travel abroad, study and horizon-widening experiences.');
    if (house === 3) add('travel', 'prof3', 1, 'Bu yaş öğrenme, yazma ve kısa yolculukların yılı.', 'This is a year of learning, writing and short trips.');
    if (house === 1) add('change', 'prof1', 1, 'Yeni bir 12 yıllık döngünün başı: kendini yeniden tanımladığın bir yıl.', 'The start of a new 12-year cycle: a year of redefining yourself.');
  }

  // ---- Transitler ----
  const J = tr('jupiter'), S = tr('saturn'), U = tr('uranus'), N = tr('neptune'), PL = tr('pluto'), ND = tr('node');
  if (hasAngles) {
    const hJ = houseOf(J, ch.cusps), hS = houseOf(S, ch.cusps);
    if (hJ === 7) add('love', 'J7', 2, 'Şans gezegeni Jüpiter evlilik evinden geçiyor: yeni bir ilişki ya da var olan ilişkinin büyümesi için en cömert dönemlerden biri.', 'Jupiter, the planet of luck, is moving through your marriage house: one of the most generous times for a new relationship or for a bond to grow.');
    if (near(J, DSC, 4)) add('love', 'Jdsc', 2, 'Jüpiter, haritanda partnerini temsil eden noktanın tam üzerinde.', 'Jupiter is right on the point of your chart that represents your partner.');
    if (near(S, DSC, 3)) add('love', 'Sdsc', 2, 'Satürn partner noktanın üzerinde: ilişkilerde ciddiyet, söz verme ve resmîleşme zamanı.', 'Saturn is on your partner point: a time for seriousness, commitment and making things official.');
    if (hS === 7 && !near(S, DSC, 3)) add('love', 'S7', 1, 'Satürn evlilik evinde: ilişkiler sınanır, kalıcı olanlar sağlamlaşır.', 'Saturn is in your marriage house: relationships are tested and the lasting ones become solid.');
    if (near(ND, ASC, 3) || near(ND, DSC, 3)) add('love', 'Nasc', 2, 'Ay düğümleri kimlik–ilişki ekseninden geçiyor: kader gibi hissedilen karşılaşmalar.', 'The lunar nodes cross your self–partner axis: meetings that feel fated.');
    if (hJ === 10) add('career', 'J10', 2, 'Jüpiter kariyer evinden geçiyor: terfi, tanınma ve yeni fırsatlar için güçlü bir dönem.', 'Jupiter is moving through your career house: a strong time for promotion, recognition and new openings.');
    if (near(J, MC, 4)) add('career', 'Jmc', 2, 'Jüpiter haritanın en tepe noktasında: kariyerinde görünürlüğün artıyor.', 'Jupiter is at the top of your chart: your visibility at work rises.');
    if (near(S, MC, 3)) add('career', 'Smc', 2, 'Satürn kariyer noktanın üzerinde: emeğinin karşılığını alma ya da ciddi bir sorumluluk üstlenme zamanı.', 'Saturn is on your career point: a time to reap what you worked for or take on serious responsibility.');
    if (hS === 10 && !near(S, MC, 3)) add('career', 'S10', 1, 'Satürn kariyer evinde: sabırla yükselme, uzun vadeli hedefler.', 'Saturn is in your career house: patient climbing and long-term goals.');
    if (hard(U, MC, 2)) add('career', 'Umc', 2, 'Uranüs kariyer noktana dokunuyor: ani iş değişiklikleri, beklenmedik fırsatlar ya da kendi yolunu çizme isteği.', 'Uranus touches your career point: sudden job changes, unexpected openings or the urge to go your own way.');
    if (near(ND, MC, 3) || near(ND, IC, 3)) add('career', 'Nmc', 1, 'Ay düğümleri kariyer–yuva ekseninde: hayat yönünü belirleyen kararlar.', 'The lunar nodes are on your career–home axis: decisions that set your direction.');
    if (hJ === 4 || near(J, IC, 4)) add('home', 'J4', 2, 'Jüpiter ev ve aile alanında: yeni bir ev, aileye katılım ya da yuvada genişleme.', 'Jupiter is in your home area: a new home, a new family member or more space at home.');
    if (near(S, IC, 3)) add('home', 'Sic', 2, 'Satürn köklerinin üzerinde: ev, aile ve yaşam düzeninde kalıcı kararlar.', 'Saturn is on your roots: lasting decisions about home, family and living arrangements.');
    if (hard(U, IC, 2)) add('home', 'Uic', 2, 'Uranüs ev noktana dokunuyor: taşınma ya da yaşam düzeninde ani değişiklikler.', 'Uranus touches your home point: moving or sudden changes in living arrangements.');
    if (hJ === 9) add('travel', 'J9', 2, 'Jüpiter yurt dışı ve eğitim evinden geçiyor: uzun yolculuk, okul veya yabancı bağlantılar için ideal.', 'Jupiter is moving through your travel and study house: ideal for long journeys, school or foreign ties.');
    if (r9 && near(J, P[r9].lon, 3)) add('travel', 'Jr9', 1, 'Jüpiter ufuklarını temsil eden gezegeni harekete geçiriyor.', 'Jupiter activates the planet of your horizons.');
    if (r7 && near(J, P[r7].lon, 3)) add('love', 'Jr7', 1, 'Jüpiter partnerini temsil eden gezegenin üzerinden geçiyor.', 'Jupiter passes over the planet that represents your partner.');
    if (r10 && near(J, P[r10].lon, 3)) add('career', 'Jr10', 1, 'Jüpiter kariyerini temsil eden gezegenin üzerinden geçiyor.', 'Jupiter passes over the planet that represents your career.');
    if (hard(PL, ASC, 2) || hard(PL, MC, 2)) add('change', 'Pang', 2, 'Plüton haritanın ana eksenlerinden birine dokunuyor: hayatının bir alanında köklü bir dönüşüm.', 'Pluto touches one of your chart’s main axes: a deep transformation in one area of life.');
    if (hard(U, ASC, 2)) add('change', 'Uasc', 2, 'Uranüs yükselenine dokunuyor: kendini yeniden keşfetme ve beklenmedik değişimler.', 'Uranus touches your ascendant: reinventing yourself and unexpected change.');
  }
  // Açılara dayalı transitler (doğum saati olmasa da çalışır)
  if (near(J, P.venus.lon, 3)) add('love', 'Jven', 2, 'Jüpiter, nasıl sevdiğini anlatan Venüs’ün üzerinden geçiyor: aşkta şans ve sıcaklık.', 'Jupiter passes over your Venus, the planet of how you love: luck and warmth in love.');
  else if (soft(J, P.venus.lon, 2)) add('love', 'Jven2', 1, 'Jüpiter Venüs’üne uyumlu açı yapıyor: sosyal hayat ve romantizm canlanır.', 'Jupiter makes a friendly aspect to your Venus: social life and romance perk up.');
  if (near(S, P.venus.lon, 2) || soft(S, P.venus.lon, 2)) add('love', 'Sven', 1, 'Satürn Venüs’üne değiyor: hafif ilişkiler yerine kalıcı bağ arayışı.', 'Saturn contacts your Venus: you seek lasting bonds rather than light affairs.');
  if (near(J, P.sun.lon, 3)) add('career', 'Jsun', 2, 'Jüpiter Güneş’inin üzerinden geçiyor: özgüvenin ve görünürlüğün artıyor.', 'Jupiter passes over your Sun: confidence and visibility increase.');
  else if (soft(J, P.sun.lon, 2)) add('career', 'Jsun2', 1, 'Jüpiter Güneş’ine uyumlu açı yapıyor: fırsatlar kolay geliyor.', 'Jupiter makes a friendly aspect to your Sun: opportunities come easily.');
  if (Math.abs(angleDiff(J, P.sun.lon) - 180) <= 3) add('love', 'JoSun', 1, 'Jüpiter Güneş’inin karşısında: hayatına cömert, ufuk açan insanlar giriyor.', 'Jupiter opposes your Sun: generous, horizon-widening people enter your life.');
  if (near(J, P.moon.lon, 3)) add('home', 'Jmoon', 2, 'Jüpiter Ay’ının üzerinden geçiyor: evde ve ailede bereket, içinde huzur.', 'Jupiter passes over your Moon: abundance at home and in the family, inner peace.');
  if (near(J, P.mercury.lon, 3)) add('travel', 'Jmer', 2, 'Jüpiter Merkür’ünün üzerinden geçiyor: eğitim, yazı, yolculuk ve yeni bağlantılar için şanslı.', 'Jupiter passes over your Mercury: lucky for study, writing, travel and new contacts.');
  if (near(J, P.mars.lon, 3)) add('career', 'Jmars', 1, 'Jüpiter Mars’ının üzerinden geçiyor: cesaret ve atılım enerjisi.', 'Jupiter passes over your Mars: courage and drive.');
  if (hard(S, P.sun.lon, 2)) { add('change', 'Ssun', 2, 'Satürn Güneş’ine dokunuyor: olgunlaşma, sorumluluk ve hayatını yeniden düzenleme zamanı.', 'Saturn touches your Sun: a time of maturing, responsibility and reorganising your life.'); add('career', 'Ssun', 1, 'Satürn Güneş’ine değerken işte emek ve sabır karşılığını bulur.', 'With Saturn on your Sun, effort and patience pay off at work.'); }
  if (near(S, P.moon.lon, 3) || Math.abs(angleDiff(S, P.moon.lon) - 180) <= 3) add('home', 'Smoon', 2, 'Satürn Ay’ına değiyor: ev, aile ve duygusal güvenlik konularında ciddi kararlar.', 'Saturn contacts your Moon: serious decisions about home, family and emotional security.');
  if (near(S, P.mercury.lon, 2)) add('travel', 'Smer', 1, 'Satürn Merkür’ünün üzerinden geçiyor: sınavlar, ciddi eğitim ve evrak işleri.', 'Saturn passes over your Mercury: exams, serious study and paperwork.');
  if (near(S, P.saturn.lon, 3)) { add('change', 'Sret', 3, 'Satürn dönüşü: Satürn doğduğun andaki yerine dönüyor. Yaklaşık 29 ve 58 yaşlarında yaşanan bu dönem, yetişkinliğin büyük eşiklerinden biridir.', 'Saturn return: Saturn comes back to where it was at your birth. Around ages 29 and 58, it is one of adulthood’s great thresholds.'); add('career', 'Sret', 1, 'Satürn dönüşü kariyerde de “ne inşa ediyorum?” sorusunu getirir.', 'The Saturn return also brings the question “what am I building?” to your career.'); }
  if (Math.abs(angleDiff(S, P.saturn.lon) - 180) <= 3) add('change', 'Sopp', 1, 'Satürn doğum konumunun karşısında: hayatının yarı yolunda bir değerlendirme.', 'Saturn opposes its birth position: a mid-cycle review of your life.');
  if (Math.abs(angleDiff(U, P.uranus.lon) - 180) <= 3) add('change', 'Uopp', 2, 'Uranüs karşıtlığı: 40’lı yaşların başındaki bu dönem özgürlük ve “şimdi değilse ne zaman” duygusu getirir.', 'Uranus opposition: this early-forties period brings a sense of freedom and “if not now, when?”');
  if (hard(U, P.sun.lon, 2) || hard(U, P.moon.lon, 2)) add('change', 'Ulum', 2, 'Uranüs Güneş’ine ya da Ay’ına dokunuyor: alışkanlıklarını kıran, özgürleştirici değişimler.', 'Uranus touches your Sun or Moon: liberating changes that break old habits.');
  if (hard(PL, P.sun.lon, 2) || hard(PL, P.moon.lon, 2)) add('change', 'Plum', 2, 'Plüton Güneş’ine ya da Ay’ına dokunuyor: derin, geri dönüşü olmayan bir içsel dönüşüm.', 'Pluto touches your Sun or Moon: a deep, irreversible inner transformation.');
  if (hard(N, P.sun.lon, 1.5)) add('change', 'Nsun', 1, 'Neptün Güneş’ine dokunuyor: hayallerin ve önceliklerin yeniden şekilleniyor.', 'Neptune touches your Sun: your dreams and priorities are reshaped.');
  if (near(J, P.jupiter.lon, 3)) add('travel', 'Jret', 1, 'Jüpiter dönüşü: yaklaşık 12 yılda bir gelen büyüme ve yeni başlangıç dönemi.', 'Jupiter return: the growth and fresh-start period that comes about every 12 years.');

  // ---- Tutulmalar (±3 ay) ----
  for (const e of ecl) {
    if (Math.abs(e.date.getTime() - d.getTime()) > 92 * DAY) continue;
    const el = norm(e.lon - ay);
    // Kuzey düğüme yakın Güneş tutulması (ya da Güney düğüme yakın Ay) büyüme, tersi bitiş temalıdır
    const nodeAt = norm(bodyLon('node', e.date) - ay);
    const sunAt = e.kind === 'solar' ? el : norm(el + 180);
    const north = angleDiff(sunAt, nodeAt) < 90;
    const NS = north ? 'N' : 'S';
    const pol = north ? l(' Kuzey düğüme yakın bu tutulma büyüme ve yeni başlangıç getirir.', ' Near the North Node, this eclipse brings growth and new beginnings.') : l(' Güney düğüme yakın bu tutulma bir şeyi bitirir ve bıraktırır.', ' Near the South Node, this eclipse ends something and asks you to let go.');
    if (hasAngles && (near(el, ASC, 4) || near(el, DSC, 4))) add('love', 'Eax' + NS, 2, 'Bir tutulma kimlik–ilişki eksenine düşüyor: ilişki hayatında dönüm noktası.' + pol.tr, 'An eclipse falls on your self–partner axis: a turning point in relationships.' + pol.en);
    if (near(el, P.venus.lon, 3)) add('love', 'Even' + NS, 1, 'Bir tutulma Venüs’üne düşüyor: aşk hayatında dönüm noktası.' + pol.tr, 'An eclipse falls on your Venus: a turning point in love.' + pol.en);
    if (hasAngles && (near(el, MC, 4) || near(el, IC, 4))) { add('career', 'Emc' + NS, 2, 'Bir tutulma kariyer–yuva eksenine düşüyor: iş veya ev hayatında yön değişikliği.' + pol.tr, 'An eclipse falls on your career–home axis: a change of direction at work or home.' + pol.en); add('home', 'Eic', 1, 'Tutulma ev ve aile konularını da hareketlendiriyor.', 'The eclipse also stirs home and family matters.'); }
    if (near(el, P.mercury.lon, 3)) add('travel', 'Emer' + NS, 1, 'Bir tutulma Merkür’üne düşüyor: eğitim, yolculuk ya da önemli bir haber.' + pol.tr, 'An eclipse falls on your Mercury: study, travel or important news.' + pol.en);
    if (near(el, P.mars.lon, 3)) add('change', 'Emar' + NS, 1, 'Bir tutulma Mars’ına düşüyor: harekete geçme ve cesur kararlar.' + pol.tr, 'An eclipse falls on your Mars: action and bold decisions.' + pol.en);
    if (near(el, P.sun.lon, 3) || near(el, P.moon.lon, 3)) add('change', 'Elum' + NS, 1, 'Bir tutulma Güneş’ine ya da Ay’ına düşüyor: kişisel bir dönüm noktası.' + pol.tr, 'An eclipse falls on your Sun or Moon: a personal turning point.' + pol.en);
  }

  // ---- İkincil progresyon (doğumdan sonraki her gün = hayatının bir yılı) ----
  const pd = new Date(ch.utc.getTime() + age * DAY);
  const pSun = norm(bodyLon('sun', pd) - ch.ayanamsa), pMoon = norm(bodyLon('moon', pd) - ch.ayanamsa), pVen = norm(bodyLon('venus', pd) - ch.ayanamsa);
  if (hasAngles) {
    const hM = houseOf(pMoon, ch.cusps);
    if (hM === 7) add('love', 'pM7', 1, 'İç dünyan (ilerletilmiş Ay) ilişki alanında: yaklaşık iki buçuk yıl boyunca birine bağlanma ihtiyacı artar.', 'Your inner world (the progressed Moon) is in the partnership area: for about two and a half years the need to bond grows.');
    if (near(pMoon, DSC, 1.5)) add('love', 'pMdsc', 2, 'İlerletilmiş Ay partner noktanın üzerinde: duygusal olarak birine hazır olduğun bir dönem.', 'The progressed Moon is on your partner point: a period when you are emotionally ready for someone.');
    if (hM === 10) add('career', 'pM10', 1, 'İlerletilmiş Ay kariyer alanında: işin duygusal olarak önem kazanıyor.', 'The progressed Moon is in your career area: work becomes emotionally important.');
    if (near(pMoon, MC, 1.5)) add('career', 'pMmc', 2, 'İlerletilmiş Ay kariyer noktanda: görünür olma ve yükselme zamanı.', 'The progressed Moon is on your career point: a time to be seen and to rise.');
    if (hM === 4 || near(pMoon, IC, 1.5)) add('home', 'pM4', near(pMoon, IC, 1.5) ? 2 : 1, 'İlerletilmiş Ay ev ve aile alanında: yuva kurma ve köklenme isteği.', 'The progressed Moon is in your home area: the wish to settle and put down roots.');
    if (hM === 9) add('travel', 'pM9', 1, 'İlerletilmiş Ay yurt dışı ve eğitim alanında.', 'The progressed Moon is in your travel and study area.');
    if (near(pSun, MC, 1)) add('career', 'pSmc', 2, 'İlerletilmiş Güneş kariyer noktana ulaşıyor: hayat yönünde belirleyici bir adım.', 'The progressed Sun reaches your career point: a defining step in your direction.');
    if (near(pVen, DSC, 1) || near(pVen, ASC, 1)) add('love', 'pVang', 2, 'İlerletilmiş Venüs kimlik–ilişki ekseninde: aşkın hayatına girdiği klasik bir işaret.', 'The progressed Venus is on your self–partner axis: a classic sign of love entering your life.');
  }
  if (near(pMoon, P.venus.lon, 1.5)) add('love', 'pMven', 2, 'İlerletilmiş Ay doğum Venüs’ünün üzerinden geçiyor: kalbin açılıyor.', 'The progressed Moon passes over your birth Venus: your heart opens.');
  if ([P.sun.lon, P.moon.lon, P.mars.lon].some(x => major(pVen, x, 1))) add('love', 'pVlum', 2, 'İlerletilmiş Venüs Güneş, Ay ya da Mars’ına açı yapıyor: güçlü bir romantik dönem.', 'The progressed Venus aspects your Sun, Moon or Mars: a strong romantic period.');
  if (major(pSun, P.venus.lon, 1)) add('love', 'pSven', 2, 'İlerletilmiş Güneş Venüs’üne açı yapıyor: aşk hayatında belirleyici bir yıl.', 'The progressed Sun aspects your Venus: a defining year for love.');

  // ---- Solar arc: her şey yılda yaklaşık 1° ilerler; köşelere değen direksiyonlar büyük olayları işaretler ----
  const arc = norm(pSun - P.sun.lon);
  const sa = (lon: number) => norm(lon + arc);
  // Doğum saati gerekmeyen direksiyonlar (Ay hariç): doğum gününe göre kişiye özel
  if ([P.sun.lon, P.mars.lon].some(x => near(sa(P.venus.lon), x, 1)) || near(sa(P.sun.lon), P.venus.lon, 1)) add('love', 'saVs', 2, 'Venüs ile Güneş ya da Mars ilerleyerek buluşuyor: kalbini hızlandıran bir dönem.', 'Venus and your Sun or Mars meet by direction: a period that quickens your heart.');
  if (near(sa(P.sun.lon), P.jupiter.lon, 1) || near(sa(P.jupiter.lon), P.sun.lon, 1)) add('career', 'saSj', 2, 'Güneş ile Jüpiter ilerleyerek buluşuyor: büyüme, terfi ve tanınma.', 'The Sun and Jupiter meet by direction: growth, promotion and recognition.');
  if (near(sa(P.mercury.lon), P.jupiter.lon, 1) || near(sa(P.jupiter.lon), P.mercury.lon, 1)) add('travel', 'saMj', 2, 'Merkür ile Jüpiter ilerleyerek buluşuyor: eğitim, yolculuk ve yayın için güçlü.', 'Mercury and Jupiter meet by direction: strong for study, travel and publishing.');
  if (near(sa(P.mars.lon), P.sun.lon, 1) || near(sa(P.sun.lon), P.mars.lon, 1) || near(sa(P.saturn.lon), P.sun.lon, 1)) add('change', 'saMs', 2, 'Mars ya da Satürn ilerleyerek Güneş’ine ulaşıyor: kararlı bir değişim ve yeni bir yön.', 'Mars or Saturn is directed onto your Sun: a decisive change and a new direction.');
  if (Math.floor(pSun / 30) !== Math.floor(norm(bodyLon('sun', new Date(pd.getTime() - DAY / 2)) - ch.ayanamsa) / 30)) add('change', 'pSsign', 3, 'İlerletilmiş Güneş burç değiştiriyor: yaklaşık 30 yılda bir yaşanan, kişiliğinde yeni bir dönemin başlangıcı.', 'Your progressed Sun changes sign: the start of a new chapter in your personality, about once every 30 years.');
  if (hasAngles) {
    const angles = [ASC, MC];
    const toAngle = (lon: number) => angles.some(a => hard(sa(lon), a, 1));
    if (toAngle(P.venus.lon)) add('love', 'saV', 3, 'Venüs ilerleyerek haritanın ana eksenlerinden birine ulaşıyor: astrolojide evlilik ve büyük aşk için en güçlü işaretlerden biri.', 'Venus is directed onto one of your chart’s main axes: one of the strongest signs for marriage and major love in astrology.');
    if ([P.venus.lon, P.jupiter.lon, P.sun.lon, P.moon.lon].some(x => near(sa(DSC), x, 1))) add('love', 'saDsc', 3, 'Partner noktan ilerleyerek önemli bir gezegene ulaşıyor: hayatına önemli birinin girmesi beklenir.', 'Your partner point is directed onto a key planet: someone important is likely to enter your life.');
    if (r7 && toAngle(P[r7].lon)) add('love', 'saR7', 2, 'Partnerini temsil eden gezegen ilerleyerek bir köşeye ulaşıyor.', 'The planet that represents your partner is directed onto an angle.');
    if (near(sa(P.jupiter.lon), P.venus.lon, 1) || near(sa(P.jupiter.lon), DSC, 1)) add('love', 'saJv', 2, 'Jüpiter ilerleyerek aşk noktalarına ulaşıyor: ilişkide bereket.', 'Jupiter is directed onto your love points: abundance in relationships.');
    if ([P.sun.lon, P.jupiter.lon, P.saturn.lon, ...(r10 ? [P[r10].lon] : [])].some(x => near(sa(MC), x, 1))) add('career', 'saMc', 3, 'Kariyer noktan ilerleyerek güçlü bir gezegene ulaşıyor: işte büyük bir adım.', 'Your career point is directed onto a strong planet: a big step at work.');
    if (near(sa(P.sun.lon), MC, 1) || near(sa(P.jupiter.lon), MC, 1)) add('career', 'saSmc', 3, 'Güneş ya da Jüpiter ilerleyerek kariyer noktana ulaşıyor: tanınma ve yükselme.', 'The Sun or Jupiter is directed onto your career point: recognition and advancement.');
    if (near(sa(P.saturn.lon), MC, 1)) add('career', 'saSat', 2, 'Satürn ilerleyerek kariyer noktana ulaşıyor: büyük sorumluluk ve kalıcı başarı.', 'Saturn is directed onto your career point: major responsibility and lasting achievement.');
    if ([P.moon.lon, P.venus.lon, P.jupiter.lon].some(x => near(sa(IC), x, 1)) || near(sa(P.moon.lon), IC, 1)) add('home', 'saIc', 2, 'Ev noktan ilerleyerek önemli bir gezegene ulaşıyor: yuva ve aile hayatında dönüm noktası.', 'Your home point is directed onto a key planet: a turning point in home and family life.');
    if (r9 && toAngle(P[r9].lon)) add('travel', 'saR9', 2, 'Ufuklarını temsil eden gezegen ilerleyerek bir köşeye ulaşıyor: taşınma, yurt dışı ya da eğitim.', 'The planet of your horizons is directed onto an angle: moving, going abroad or study.');
    if (near(sa(P.jupiter.lon), ASC, 1)) add('travel', 'saJasc', 1, 'Jüpiter ilerleyerek yükselenine ulaşıyor: genişleme ve yeni ufuklar.', 'Jupiter is directed onto your ascendant: expansion and new horizons.');
    if ((['sun', 'moon', 'mars', 'saturn', 'uranus', 'pluto'] as BodyId[]).some(x => near(sa(P[x].lon), ASC, 1))) add('change', 'saAsc', 2, 'Önemli bir gezegen ilerleyerek yükselenine ulaşıyor: kişisel hayatında belirgin bir değişim.', 'A key planet is directed onto your ascendant: a marked change in your personal life.');
  }

  // ---- Aşk ve evlilik: ek göstergeler (Juno, Vertex, klasik eş göstergesi, Evlilik noktası, Güneş dönüşü) ----
  if (cx) {
    // Primer direksiyonlar: gezegen köşeye ulaştığı yılın ±6 ayı
    const ageNow = (d.getTime() - ch.utc.getTime()) / YEAR;
    for (const pd of cx.pds) {
      if (Math.abs(pd.age - ageNow) > 0.5) continue;
      const t: Topic = pd.prom === 'venus' && pd.angle !== 'mc' ? 'love' : PD_TOPIC[pd.angle];
      const nm = PD_NM[pd.prom] ?? [pd.prom, pd.prom];
      add(t, `pd${pd.angle.toUpperCase()}`, 3, `Primer direksiyon: ${nm[0]} doğum haritanın ${PD_ANG[pd.angle][0]} noktasına ulaşıyor. Klasik astrolojide hayatın büyük olaylarını zamanlamak için kullanılan en eski tekniklerden biri.`, `Primary direction: ${nm[1]} reaches your ${PD_ANG[pd.angle][1]}. One of the oldest classical techniques for timing major life events.`);
      if (pd.prom === 'venus' && pd.angle === 'mc') add('love', 'pdVEN', 1, 'Venüs MC’ye ulaşıyor: aşk hayatın görünür hâle gelir.', 'Venus reaches the MC: your love life becomes visible.');
    }
    const { juno, vx, lotM, sig } = cx;
    if (juno !== null) {
      if (near(J, juno, 3)) add('love', 'Jjuno', 2, 'Jüpiter evlilik asteroidi Juno’nun üzerinden geçiyor: bağlılık ve evlilik için en olumlu geçişlerden biri.', 'Jupiter passes over Juno, the asteroid of marriage: one of the most favourable passages for commitment.');
      if (near(S, juno, 2)) add('love', 'Sjuno', 2, 'Satürn Juno’nun üzerinde: ilişkiyi resmîleştirme, söz verme ve kalıcı bağ zamanı.', 'Saturn is on Juno: a time to make it official, to promise and to commit.');
      if (near(pMoon, juno, 1.5)) add('love', 'pMjuno', 2, 'İlerletilmiş Ay Juno’nun üzerinde: içinden gelen bağlanma isteği güçleniyor.', 'The progressed Moon is on Juno: your inner wish to commit grows.');
      if (near(sa(P.venus.lon), juno, 1) || near(sa(juno), P.venus.lon, 1) || near(sa(P.sun.lon), juno, 1)) add('love', 'saJuno', 2, 'Venüs ya da Güneş ilerleyerek Juno ile buluşuyor: evlilik temalı bir dönem.', 'Venus or the Sun is directed onto Juno: a marriage-themed period.');
      for (const e of ecl) if (Math.abs(e.date.getTime() - d.getTime()) <= 92 * DAY && near(norm(e.lon - ay), juno, 3)) { add('love', 'Ejuno', 1, 'Bir tutulma Juno’ya düşüyor: bağlılık konusunda dönüm noktası.', 'An eclipse falls on Juno: a turning point in commitment.'); break; }
    }
    if (vx !== null) {
      if (near(ND, vx, 3) || near(norm(ND + 180), vx, 3)) add('love', 'Nvx', 2, 'Ay düğümleri kader noktan Vertex’ten geçiyor: “kader” gibi hissettiren bir karşılaşma.', 'The lunar nodes cross your Vertex, the point of fate: a meeting that feels destined.');
      if (near(J, vx, 3)) add('love', 'Jvx', 1, 'Jüpiter kader noktan Vertex’in üzerinde: hayatını genişleten biriyle karşılaşma.', 'Jupiter is on your Vertex: meeting someone who widens your life.');
      if (near(pMoon, vx, 1.5)) add('love', 'pMvx', 2, 'İlerletilmiş Ay Vertex’e ulaşıyor: duygusal olarak kader gibi bir bağa hazırsın.', 'The progressed Moon reaches your Vertex: you are emotionally ready for a fated bond.');
      if (near(sa(P.venus.lon), vx, 1) || near(sa(vx), P.venus.lon, 1)) add('love', 'saVvx', 2, 'Venüs ilerleyerek Vertex ile buluşuyor: kader gibi bir aşk.', 'Venus is directed onto your Vertex: a fated-feeling love.');
      for (const e of ecl) if (Math.abs(e.date.getTime() - d.getTime()) <= 92 * DAY && near(norm(e.lon - ay), vx, 3)) { add('love', 'Evx', 2, 'Bir tutulma Vertex’e düşüyor: hayatına önemli birinin girmesi için klasik bir işaret.', 'An eclipse falls on your Vertex: a classic sign of someone important entering your life.'); break; }
    }
    if (lotM !== null) {
      if (near(J, lotM, 3)) add('love', 'Jlot', 2, 'Jüpiter Evlilik noktanın üzerinden geçiyor: evlilik için açılan bir kapı.', 'Jupiter passes over your Lot of Marriage: a door opening for marriage.');
      if (near(S, lotM, 2)) add('love', 'Slot', 1, 'Satürn Evlilik noktanda: ilişkide ciddi ve kalıcı kararlar.', 'Saturn is on your Lot of Marriage: serious, lasting decisions in a relationship.');
      if (near(sa(P.venus.lon), lotM, 1) || near(sa(lotM), P.venus.lon, 1)) add('love', 'saVlot', 2, 'Venüs ilerleyerek Evlilik noktana ulaşıyor: evlilik için güçlü bir işaret.', 'Venus is directed onto your Lot of Marriage: a strong sign for marriage.');
    }
    for (const g of sig) {
      if (near(J, P[g].lon, 3)) { add('love', 'Jsig', 1, 'Jüpiter, klasik astrolojide eşini temsil eden gezegenin üzerinden geçiyor.', 'Jupiter passes over the planet that classically represents your spouse.'); break; }
    }
    for (const g of sig) {
      if (near(S, P[g].lon, 2)) { add('love', 'Ssig', 1, 'Satürn, eşini temsil eden gezegene değiyor: ilişkide ciddiyet ve söz.', 'Saturn touches the planet of your spouse: seriousness and commitment.'); break; }
    }
    if (sig.some(g => near(pMoon, P[g].lon, 1.5))) add('love', 'pMsig', 1, 'İlerletilmiş Ay eşini temsil eden gezegenin üzerinde.', 'The progressed Moon is on the planet that represents your spouse.');
    if (hasAngles && sig.some(g => near(sa(P[g].lon), DSC, 1) || near(sa(P[g].lon), ASC, 1))) add('love', 'saSig', 2, 'Eşini temsil eden gezegen ilerleyerek kimlik–ilişki eksenine ulaşıyor: evlilik için klasik bir işaret.', 'The planet of your spouse is directed onto your self–partner axis: a classic sign of marriage.');
    if (hasAngles && r7 && near(S, P[r7].lon, 2)) add('love', 'Sr7', 2, 'Satürn partnerini temsil eden gezegenin üzerinde: ilişkiyi resmîleştirme zamanı. Evlilikler çoğu zaman Jüpiter kadar Satürn geçişlerinde de gerçekleşir.', 'Saturn is on the planet that represents your partner: time to make it official. Marriages happen under Saturn as often as under Jupiter.');
    if (hard(U, P.venus.lon, 2) || (hasAngles && near(U, DSC, 2))) add('love', 'Uven', 1, 'Uranüs aşk noktalarına dokunuyor: ani başlayan ya da ani değişen ilişkiler.', 'Uranus touches your love points: relationships that start or change suddenly.');
    const sr = cx.sr(d);
    if (sr && sr.asc !== null && sr.mc !== null) {
      const v = sr.positions.venus.lon;
      if ([sr.asc, sr.mc, norm(sr.asc + 180), norm(sr.mc + 180)].some(a => near(v, a, 6)) || sr.positions.venus.house === 7) add('love', 'SRven', 2, 'Bu yılın Güneş dönüşü haritasında Venüs öne çıkıyor: aşk ve ilişki yılı.', 'In this year’s solar return chart Venus is prominent: a year of love and relationships.');
      if (hasAngles && Math.floor(sr.asc / 30) === Math.floor(ch.cusps[6] / 30)) add('love', 'SR7', 1, 'Bu yılın Güneş dönüşü yükseleni doğum haritandaki evlilik evinin burcunda.', 'This year’s solar return ascendant is in the sign of your birth marriage house.');
    }
  }
  return out;
}

const PD_TOPIC: Record<string, Topic> = { asc: 'change', mc: 'career', dsc: 'love', ic: 'home' };
const PD_ANG: Record<string, [string, string]> = { asc: ['Yükselen', 'Ascendant'], mc: ['MC (kariyer)', 'MC (career)'], dsc: ['Alçalan (ilişki)', 'Descendant (partnership)'], ic: ['IC (ev ve aile)', 'IC (home and family)'] };
const PD_NM: Record<string, [string, string]> = { sun: ['Güneş', 'The Sun'], moon: ['Ay', 'The Moon'], mercury: ['Merkür', 'Mercury'], venus: ['Venüs', 'Venus'], mars: ['Mars', 'Mars'], jupiter: ['Jüpiter', 'Jupiter'], saturn: ['Satürn', 'Saturn'], uranus: ['Uranüs', 'Uranus'], neptune: ['Neptün', 'Neptune'], pluto: ['Plüton', 'Pluto'] };
const THRESH: Record<Topic, number> = { love: 7, career: 5, home: 4, travel: 4, change: 3 };
const MIN_AGE: Record<Topic, number> = { love: 17, career: 18, home: 18, travel: 16, change: 16 };

const CACHE = new WeakMap<Chart, Map<string, Window[]>>();
export function lifeTimeline(ch: Chart, opts: { fromAge?: number; toAge?: number } & PersonCtx = {}): Window[] {
  const fromAge = opts.fromAge ?? 16, toAge = opts.toAge ?? 75;
  const dates = (opts.loveDates ?? []).filter(x => !isNaN(x.getTime()));
  const key = `${fromAge}-${toAge}-${opts.gender ?? ''}-${dates.map(x => x.getTime()).join(',')}`;
  const hit = CACHE.get(ch)?.get(key);
  if (hit) return hit;
  const res = computeTimeline(ch, fromAge, toAge, { gender: opts.gender, loveDates: dates });
  if (!CACHE.has(ch)) CACHE.set(ch, new Map());
  CACHE.get(ch)!.set(key, res);
  return res;
}

/** Kişiye özel bağlam: Juno, Vertex, Evlilik noktası, eş göstergesi, Güneş dönüşleri ve geçmiş olaylardan öğrenilen işaretler */
function buildCtx(ch: Chart, person: PersonCtx, ecl: Ecl[]): Ctx {
  const timed = ch.asc !== null && ch.cusps.length === 12;
  const P = ch.positions;
  let lotM: number | null = null;
  if (timed) {
    if (person.gender === 'f') lotM = norm(ch.asc! + P.saturn.lon - P.venus.lon);
    else lotM = lots(ch).find(x => x.id === 'marriage')?.lon ?? null;
  }
  const srCache = new Map<number, Chart | null>();
  const opts = { houseSystem: ch.houseSystem, zodiac: ch.zodiac } as any;
  const sr = (d: Date): Chart | null => {
    if (!timed) return null;
    const y = Math.floor((d.getTime() - ch.utc.getTime()) / YEAR);
    if (!srCache.has(y)) {
      try { srCache.set(y, solarReturnChart(ch, new Date(ch.utc.getTime() + (y + 0.5) * YEAR), opts)); } catch { srCache.set(y, null); }
    }
    return srCache.get(y)!;
  };
  const cx: Ctx = {
    sig: person.gender === 'f' ? ['sun', 'mars'] : person.gender === 'm' ? ['moon'] : [],
    pds: primaryDirections(ch), lotM, juno: P.juno ? P.juno.lon : null, vx: timed ? ch.vertex : null, sr, boost: new Set(),
  };
  // Kişisel ayar: geçmiş ilişki olaylarının (±3 ay) etrafında etkin olan işaretler bu kişide "tutmuş" sayılır
  for (const ev of person.loveDates ?? []) {
    for (const off of [-2, 0, 2]) {
      const f = factorsAt(ch, new Date(ev.getTime() + off * YEAR / 12), ecl, { ...cx, boost: new Set() });
      f.love.forEach(x => cx.boost.add(x.id));
    }
  }
  return cx;
}

function computeTimeline(ch: Chart, fromAge: number, toAge: number, person: PersonCtx): Window[] {
  const start = new Date(ch.utc.getTime() + fromAge * YEAR), end = new Date(ch.utc.getTime() + toAge * YEAR);
  const evs = person.loveDates ?? [];
  const eFrom = Math.min(start.getTime(), ...evs.map(x => x.getTime() - YEAR / 2)), eTo = Math.max(end.getTime(), ...evs.map(x => x.getTime() + YEAR / 2));
  const ecl = eclipses(new Date(eFrom - 100 * DAY), new Date(eTo + 100 * DAY));
  const cx = buildCtx(ch, person, ecl);
  const months: { d: Date; f: Record<Topic, Factor[]> }[] = [];
  for (let d = new Date(start); d < end; d = new Date(d.getTime() + YEAR / 12)) months.push({ d, f: factorsAt(ch, d, ecl, cx) });
  const out: Window[] = [];
  const timed = ch.asc !== null && ch.cusps.length === 12;
  const thr: Record<Topic, number> = timed ? THRESH : { love: 3, career: 3, home: 3, travel: 3, change: 3 };
  for (const t of TOPICS) {
    let cur: { s: number; e: number } | null = null;
    const flush = () => {
      if (!cur) return;
      let best = cur.s, bestScore = -1;
      for (let i = cur.s; i <= cur.e; i++) { const sc = months[i].f[t].reduce((a, b) => a + b.w, 0); if (sc > bestScore) { bestScore = sc; best = i; } }
      const ageAt = (months[best].d.getTime() - ch.utc.getTime()) / YEAR;
      if (ageAt >= MIN_AGE[t]) {
        const seen = new Set<string>();
        const reasons = months[best].f[t].filter(x => (seen.has(x.id) ? false : (seen.add(x.id), true))).sort((a, b) => b.w - a.w);
        const personal = reasons.filter(r => !GEN_IDS.has(r.id)).reduce((a, b) => a + b.w, 0);
        // Teknikler: en güçlü ayın çevresinde (±3 ay) görülen farklı teknik aileleri
        const techs = new Set<Tech>();
        for (let i = Math.max(cur.s, best - 3); i <= Math.min(cur.e, best + 3); i++) months[i].f[t].forEach(x => techs.add(techOf(x.id)));
        const calib = t === 'love' && cx.boost.size ? reasons.filter(r => cx.boost.has(r.id)).map(r => r.id) : undefined;
        out.push({ topic: t, start: months[cur.s].d, end: new Date(months[cur.e].d.getTime() + YEAR / 12), peak: months[best].d, score: bestScore, reasons, gen: personal < 2, techs: [...techs], calib: calib?.length ? calib : undefined });
      }
      cur = null;
    };
    months.forEach((m, i) => {
      const sc = m.f[t].reduce((a, b) => a + b.w, 0);
      if (sc >= thr[t]) { if (cur && i - cur.e <= (t === 'love' ? 2 : 4)) cur.e = i; else { flush(); cur = { s: i, e: i }; } }
    });
    flush();
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const strengthOf = (score: number) => (score >= 9 ? 3 : score >= 6 ? 2 : 1);

// ---------------- Tek tek gökyüzü olayları ----------------
// Dönemlerin arasını doldurmak için: yavaş gezegenlerin doğum noktalarına yaptığı her kavuşum ve
// sert/uyumlu açı, tutulmalar ve ilerletilmiş Ay kavuşumları ayrı ayrı listelenir.
export type Pt = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'asc' | 'mc' | 'dsc' | 'ic';
export type SkyKind = 'transit' | 'eclipse' | 'pmoon' | 'pmsign' | 'pssign' | 'prog' | 'psign' | 'pstation' | 'primary';
/** İlerletilmiş haritada hareket eden noktalar: gezegenler + (doğum saati varsa) ilerletilmiş yükselen ve MC */
export type PBody = BodyId | 'pasc' | 'pmc';
export interface SkyEvent { id: string; kind: SkyKind; t?: BodyId; p?: PBody; n?: Pt; angle?: 'asc' | 'mc' | 'dsc' | 'ic'; type?: 'conjunction' | 'opposition' | 'square' | 'trine'; start: Date; end: Date; peak: Date; topic: Topic; sign?: number; north?: boolean; retro?: boolean; w: number }

const PT_TOPIC: Record<Pt, Topic> = { venus: 'love', dsc: 'love', sun: 'career', mc: 'career', moon: 'home', ic: 'home', mercury: 'travel', jupiter: 'travel', mars: 'change', saturn: 'change', asc: 'change' };
const T_W: Partial<Record<BodyId, number>> = { pluto: 5, neptune: 4, uranus: 4, saturn: 4, jupiter: 3, node: 2 };
const T_ORB: Partial<Record<BodyId, number>> = { jupiter: 1.5, saturn: 1.5, uranus: 1.2, neptune: 1.2, pluto: 1.2, node: 1.5 };
const ASP = { conjunction: 0, opposition: 180, square: 90, trine: 120 } as const;

const SKY_CACHE = new WeakMap<Chart, SkyEvent[]>();
export function skyEvents(ch: Chart): SkyEvent[] {
  const hit = SKY_CACHE.get(ch);
  if (hit) return hit;
  const now = Date.now();
  const from = new Date(now - 5 * YEAR), to = new Date(now + 12 * YEAR);
  const P = ch.positions;
  const hasAngles = ch.asc !== null && ch.mc !== null;
  const pts: [Pt, number][] = (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as Pt[]).map(p => [p, P[p as BodyId].lon] as [Pt, number]);
  if (hasAngles) pts.push(['asc', ch.asc!], ['mc', ch.mc!], ['dsc', norm(ch.asc! + 180)], ['ic', norm(ch.mc! + 180)]);
  const aspFor = (t: BodyId, n: Pt): (keyof typeof ASP)[] => {
    if (t === 'node') return ['conjunction'];
    if (n === 'dsc' || n === 'ic') return ['conjunction'];
    if (n === 'asc' || n === 'mc') return ['conjunction', 'square'];
    if (t === 'neptune') return ['conjunction', 'opposition', 'square'];
    return ['conjunction', 'opposition', 'square', 'trine'];
  };
  const out: SkyEvent[] = [];
  const ayAt = (d: Date) => (ch.zodiac === 'sidereal' ? lahiri(A.MakeTime(d)) : 0);

  // Transitler: haftalık tarama, aynı olayın retro geçişleri (≤ 9 ay arayla) tek olayda birleşir
  const STEP = 7 * DAY;
  for (const t of ['jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node'] as BodyId[]) {
    const runs = new Map<string, { s: number; e: number; peak: number; orb: number }[]>();
    for (let ms = from.getTime(); ms <= to.getTime(); ms += STEP) {
      const d = new Date(ms);
      const lon = norm(bodyLon(t, d) - ayAt(d));
      for (const [n, nl] of pts) {
        for (const a of aspFor(t, n)) {
          const orb = Math.abs(angleDiff(lon, nl) - ASP[a]);
          if (orb > T_ORB[t]!) continue;
          const key = `${n}|${a}`;
          const arr = runs.get(key) ?? [];
          const last = arr[arr.length - 1];
          if (last && ms - last.e <= 270 * DAY) { last.e = ms; if (orb < last.orb) { last.orb = orb; last.peak = ms; } }
          else arr.push({ s: ms, e: ms, peak: ms, orb });
          runs.set(key, arr);
        }
      }
    }
    for (const [key, arr] of runs) {
      const [n, a] = key.split('|') as [Pt, keyof typeof ASP];
      for (const r of arr) out.push({ id: `${t}-${key}-${r.s}`, kind: 'transit', t, n, type: a, start: new Date(r.s), end: new Date(r.e + STEP), peak: new Date(r.peak), topic: PT_TOPIC[n], w: (T_W[t] ?? 1) + (a === 'conjunction' ? 1 : 0) });
    }
  }

  // Tutulmalar doğum noktalarına
  for (const e of eclipses(from, to)) {
    const ay = ayAt(e.date);
    const el = norm(e.lon - ay);
    const nodeAt = norm(bodyLon('node', e.date) - ay);
    const north = angleDiff(e.kind === 'solar' ? el : norm(el + 180), nodeAt) < 90;
    for (const [n, nl] of pts) {
      if (n === 'jupiter' || n === 'saturn') continue;
      if (angleDiff(el, nl) <= 3) out.push({ id: `ecl-${n}-${e.date.getTime()}`, kind: 'eclipse', n, start: e.date, end: new Date(e.date.getTime() + 30 * DAY), peak: e.date, topic: PT_TOPIC[n], north, w: 3 });
    }
  }

  // İkincil progresyon (doğumdan sonraki her gün = hayatının bir yılı), tüm gezegenler:
  // - ilerletilmiş Ay: doğum noktalarına kavuşum + karşıt açı, burç değişimi
  // - ilerletilmiş Güneş, Merkür, Venüs, Mars (+ doğum saati varsa ilerletilmiş yükselen/MC): doğum noktalarına
  //   kavuşum, karşıt, kare, üçgen açılar ve burç değişimleri
  // - tüm gezegenlerin ilerletilmiş haritada yön değiştirmesi (geri/ileri dönüş): onlarca yılda bir yaşanan dönüm noktası
  const FAST: BodyId[] = ['sun', 'mercury', 'venus', 'mars'];
  const STATIONERS: BodyId[] = ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];
  const P_W: Record<string, number> = { sun: 4, mercury: 2, venus: 3, mars: 3, pasc: 3, pmc: 3 };
  const P_STEP = YEAR / 24;
  const runs = new Map<string, { s: number; e: number; peak: number; orb: number }>();
  const flush = (key: string, r: { s: number; e: number; peak: number }) => {
    const [kind, b, n, a] = key.split('|');
    const birthAge = (r.s - ch.utc.getTime()) / YEAR;
    if (kind !== 'pm' && birthAge < 1) return; // doğumda zaten var olan açı: olay değil, doğum haritasının parçası
    if (kind === 'pm') out.push({ id: `pm-${n}-${a}-${r.s}`, kind: 'pmoon', n: n as Pt, type: a as keyof typeof ASP, start: new Date(r.s), end: new Date(r.e + P_STEP), peak: new Date(r.peak), topic: PT_TOPIC[n as Pt], w: a === 'conjunction' ? 2 : 1 });
    else {
      const topic: Topic = b === 'venus' ? 'love' : b === 'pmc' ? 'career' : PT_TOPIC[n as Pt];
      out.push({ id: `pp-${b}-${n}-${a}-${r.s}`, kind: 'prog', p: b as PBody, n: n as Pt, type: a as keyof typeof ASP, start: new Date(r.s), end: new Date(r.e + P_STEP), peak: new Date(r.peak), topic, w: (P_W[b] ?? 2) + (a === 'conjunction' ? 1 : 0) });
    }
  };
  const track = (key: string, orb: number, lim: number, ms: number, gap: number) => {
    const r = runs.get(key);
    if (orb <= lim) {
      if (r && ms - r.e <= gap) { r.e = ms; if (orb < r.orb) { r.orb = orb; r.peak = ms; } }
      else { if (r) flush(key, r); runs.set(key, { s: ms, e: ms, peak: ms, orb }); }
    } else if (r && ms - r.e > gap) { flush(key, r); runs.delete(key); }
  };
  const SIGN_TOPIC: Partial<Record<BodyId, Topic>> = { mercury: 'travel', venus: 'love', mars: 'change' };
  const prevSign = new Map<string, number>(), prevLon = new Map<BodyId, number>(), prevDir = new Map<BodyId, number>();
  for (let ms = from.getTime() - P_STEP; ms <= to.getTime(); ms += P_STEP) {
    const age = (ms - ch.utc.getTime()) / YEAR;
    if (age < 0) continue;
    const pd = new Date(ch.utc.getTime() + age * DAY);
    const pl = (b: BodyId) => norm(bodyLon(b, pd) - ch.ayanamsa);
    const inRange = ms >= from.getTime();
    const pMoon = pl('moon'), pSun = pl('sun');
    const arc = norm(pSun - P.sun.lon);
    const movers: [PBody, number][] = FAST.map(b => [b, b === 'sun' ? pSun : pl(b)] as [PBody, number]);
    if (hasAngles) movers.push(['pasc', norm(ch.asc! + arc)], ['pmc', norm(ch.mc! + arc)]);
    // burç değişimleri
    for (const [b, lon] of [['moon', pMoon], ['sun', pSun], ...movers.filter(m => m[0] === 'mercury' || m[0] === 'venus' || m[0] === 'mars')] as [string, number][]) {
      const sg = Math.floor(lon / 30), prev = prevSign.get(b);
      if (inRange && prev !== undefined && sg !== prev) {
        if (b === 'moon') out.push({ id: `pms-${ms}`, kind: 'pmsign', start: new Date(ms), end: new Date(ms + 2.5 * YEAR), peak: new Date(ms), topic: 'home', sign: sg, w: 2 });
        else if (b === 'sun') out.push({ id: `pss-${ms}`, kind: 'pssign', start: new Date(ms), end: new Date(ms + YEAR), peak: new Date(ms), topic: 'change', sign: sg, w: 4 });
        else out.push({ id: `psg-${b}-${ms}`, kind: 'psign', p: b as BodyId, start: new Date(ms), end: new Date(ms + YEAR), peak: new Date(ms), topic: SIGN_TOPIC[b as BodyId]!, sign: sg, w: 2 });
      }
      prevSign.set(b, sg);
    }
    // yön değiştirme (istasyon)
    for (const b of STATIONERS) {
      const lon = b === 'mercury' || b === 'venus' || b === 'mars' ? movers.find(m => m[0] === b)![1] : pl(b);
      const pv = prevLon.get(b);
      if (pv !== undefined) {
        const d = ((lon - pv + 540) % 360) - 180;
        const dir = d > 0 ? 1 : d < 0 ? -1 : 0;
        const pdir = prevDir.get(b);
        if (inRange && dir && pdir && dir !== pdir && age >= 1) {
          out.push({ id: `pst-${b}-${ms}`, kind: 'pstation', p: b, start: new Date(ms), end: new Date(ms + 2 * YEAR), peak: new Date(ms), topic: SIGN_TOPIC[b] ?? (b === 'jupiter' ? 'travel' : 'change'), retro: dir < 0, w: b === 'mercury' || b === 'venus' || b === 'mars' ? 3 : 2 });
        }
        if (dir) prevDir.set(b, dir);
      }
      prevLon.set(b, lon);
    }
    if (!inRange) continue;
    // ilerletilmiş Ay: kavuşum ve karşıt açı (1°)
    for (const [n, nl] of pts) for (const a of ['conjunction', 'opposition'] as const) {
      if (a === 'opposition' && (n === 'dsc' || n === 'ic' || n === 'asc' || n === 'mc')) continue; // eksenin karşı ucu zaten kavuşum olarak sayılıyor
      track(`pm|moon|${n}|${a}`, Math.abs(angleDiff(pMoon, nl) - ASP[a]), 1, ms, YEAR / 12 + 1);
    }
    // diğer ilerletilmiş noktalar: dört ana açı (1°); kendi doğum konumuna açı sayılmaz
    for (const [b, lon] of movers) for (const [n, nl] of pts) {
      if (b === n || (b === 'pasc' && (n === 'asc' || n === 'dsc')) || (b === 'pmc' && (n === 'mc' || n === 'ic'))) continue;
      const angle = n === 'asc' || n === 'mc' || n === 'dsc' || n === 'ic';
      for (const a of (angle ? ['conjunction'] : ['conjunction', 'opposition', 'square', 'trine']) as (keyof typeof ASP)[]) {
        track(`pp|${b}|${n}|${a}`, Math.abs(angleDiff(lon, nl) - ASP[a]), 1, ms, 2 * YEAR);
      }
    }
  }
  for (const [key, r] of runs) flush(key, r);
  // Primer direksiyonlar (doğum saati gerekir)
  for (const pd of primaryDirections(ch)) {
    if (pd.date < from || pd.date > to) continue;
    out.push({ id: `pd-${pd.prom}-${pd.angle}`, kind: 'primary', p: pd.prom, angle: pd.angle, start: new Date(pd.date.getTime() - YEAR / 2), end: new Date(pd.date.getTime() + YEAR / 2), peak: pd.date, topic: pd.prom === 'venus' && pd.angle !== 'mc' ? 'love' : PD_TOPIC[pd.angle], w: 4 });
  }

  out.sort((a, b) => a.peak.getTime() - b.peak.getTime());
  SKY_CACHE.set(ch, out);
  return out;
}
