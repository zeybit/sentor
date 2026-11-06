// Hayat takvimi: önemli dönemlerin zamanlaması.
// Tek bir teknik yerine birkaç tekniğin aynı döneme işaret etmesi (yakınsama) aranır:
// yıllık profeksiyon (yılın teması), Jüpiter–Satürn ve dış gezegen transitleri, Ay düğümleri,
// tutulmalar, ikincil progresyon ve solar arc direksiyonları. Her ay için puan hesaplanır,
// eşiği aşan ardışık aylar bir "dönem" olarak birleştirilir.
import * as A from 'astronomy-engine';
import type { BodyId, Chart } from './astro';
import { bodyLon, houseOf, norm, angleDiff, lahiri, SIGN_RULERS } from './astro';

export type Topic = 'love' | 'career' | 'home' | 'travel' | 'change';
export const TOPICS: Topic[] = ['love', 'career', 'home', 'travel', 'change'];
type L = { tr: string; en: string };
const l = (tr: string, en: string): L => ({ tr, en });

export interface Factor { id: string; w: number; text: L }
export interface Window { topic: Topic; start: Date; end: Date; peak: Date; score: number; reasons: Factor[] }

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
function factorsAt(ch: Chart, d: Date, ecl: Ecl[]): Record<Topic, Factor[]> {
  const out: Record<Topic, Factor[]> = { love: [], career: [], home: [], travel: [], change: [] };
  const add = (t: Topic, id: string, w: number, tr: string, en: string) => out[t].push({ id, w, text: l(tr, en) });
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
  if (near(J, P.sun.lon, 3)) add('career', 'Jsun', 1, 'Jüpiter Güneş’inin üzerinden geçiyor: özgüvenin ve görünürlüğün artıyor.', 'Jupiter passes over your Sun: confidence and visibility increase.');
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
    if (hasAngles && (near(el, ASC, 4) || near(el, DSC, 4))) add('love', 'Eax', 2, 'Bir tutulma kimlik–ilişki eksenine düşüyor: ilişki hayatında başlangıçlar ya da bitişler.', 'An eclipse falls on your self–partner axis: beginnings or endings in relationships.');
    if (near(el, P.venus.lon, 3)) add('love', 'Even', 1, 'Bir tutulma Venüs’üne düşüyor: aşk hayatında dönüm noktası.', 'An eclipse falls on your Venus: a turning point in love.');
    if (hasAngles && (near(el, MC, 4) || near(el, IC, 4))) { add('career', 'Emc', 2, 'Bir tutulma kariyer–yuva eksenine düşüyor: iş veya ev hayatında yön değişikliği.', 'An eclipse falls on your career–home axis: a change of direction at work or home.'); add('home', 'Eic', 1, 'Tutulma ev ve aile konularını da hareketlendiriyor.', 'The eclipse also stirs home and family matters.'); }
    if (near(el, P.sun.lon, 3) || near(el, P.moon.lon, 3)) add('change', 'Elum', 1, 'Bir tutulma Güneş’ine ya da Ay’ına düşüyor: kişisel bir dönüm noktası.', 'An eclipse falls on your Sun or Moon: a personal turning point.');
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
  return out;
}

const THRESH: Record<Topic, number> = { love: 5, career: 5, home: 4, travel: 4, change: 3 };
const MIN_AGE: Record<Topic, number> = { love: 17, career: 18, home: 18, travel: 16, change: 16 };

const CACHE = new WeakMap<Chart, Map<string, Window[]>>();
export function lifeTimeline(ch: Chart, opts: { fromAge?: number; toAge?: number } = {}): Window[] {
  const fromAge = opts.fromAge ?? 16, toAge = opts.toAge ?? 75;
  const key = `${fromAge}-${toAge}`;
  const hit = CACHE.get(ch)?.get(key);
  if (hit) return hit;
  const res = computeTimeline(ch, fromAge, toAge);
  if (!CACHE.has(ch)) CACHE.set(ch, new Map());
  CACHE.get(ch)!.set(key, res);
  return res;
}
function computeTimeline(ch: Chart, fromAge: number, toAge: number): Window[] {
  const start = new Date(ch.utc.getTime() + fromAge * YEAR), end = new Date(ch.utc.getTime() + toAge * YEAR);
  const ecl = eclipses(new Date(start.getTime() - 100 * DAY), new Date(end.getTime() + 100 * DAY));
  const months: { d: Date; f: Record<Topic, Factor[]> }[] = [];
  for (let d = new Date(start); d < end; d = new Date(d.getTime() + YEAR / 12)) months.push({ d, f: factorsAt(ch, d, ecl) });
  const out: Window[] = [];
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
        out.push({ topic: t, start: months[cur.s].d, end: new Date(months[cur.e].d.getTime() + YEAR / 12), peak: months[best].d, score: bestScore, reasons });
      }
      cur = null;
    };
    months.forEach((m, i) => {
      const sc = m.f[t].reduce((a, b) => a + b.w, 0);
      if (sc >= THRESH[t]) { if (cur && i - cur.e <= 4) cur.e = i; else { flush(); cur = { s: i, e: i }; } }
    });
    flush();
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime());
}

export const strengthOf = (score: number) => (score >= 9 ? 3 : score >= 6 ? 2 : 1);
