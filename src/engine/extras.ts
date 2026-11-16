// Az bilinen, kişiye özel hesaplar:
// - Doğum anının gizli işaretleri (doğum öncesi yeni/dolunay, doğum öncesi tutulmalar, doğduğun gezegen günü ve saati,
//   sabah/akşam yıldızı Venüs ve Merkür, doğarken durağan gezegenler, boşta Ay ile doğmak)
// - Kişisel Ay döngüsü (gökteki Ay ile doğum Güneşin arasındaki açı)
// - Kişiye özel en iyi günler (aşk / iş): Ay'ın doğum haritasına açıları, retrolar ve boşta Ay elenerek
// - Gökyüzü yaşın: doğduğundan beri yaşanan dolunaylar, Güneş turları, gezegen dönüşleri ve sıradaki kilometre taşları
import * as A from 'astronomy-engine';
import type { BodyId, Chart } from './astro';
import { bodyLon, norm, angleDiff, houseOf } from './astro';
import { planetaryHours, voidOfCourse } from './techniques';
import { nextAspect, signExit, SEVEN } from './horary';
import { SIGNS, BODIES } from '../content/base';
import type { L } from '../content/base';

const l = (tr: string, en: string): L => ({ tr, en });
const DAY = 864e5, YEAR = 365.2422 * DAY, SYNODIC = 29.530589;
const signed = (a: number, b: number) => { let d = norm(a - b); if (d > 180) d -= 360; return d; };
const speed = (id: BodyId, d: Date) => signed(bodyLon(id, new Date(d.getTime() + DAY / 2)), bodyLon(id, new Date(d.getTime() - DAY / 2)));

export interface Secret { id: string; title: L; text: L }

function tzOffsetMin(tz: string, d: Date): number {
  try {
    const p = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(d);
    const g = (t: string) => Number(p.find(x => x.type === t)?.value);
    return (Date.UTC(g('year'), g('month') - 1, g('day'), g('hour'), g('minute')) - Math.floor(d.getTime() / 60000) * 60000) / 60000;
  } catch { return 0; }
}

const LUNATION_HOUSE: L[] = [
  l('kimliğin ve kendini ortaya koyma biçimin', 'your identity and how you put yourself forward'),
  l('para, yetenekler ve öz değer', 'money, talents and self-worth'),
  l('iletişim, öğrenme ve yakın çevre', 'communication, learning and your close circle'),
  l('aile, ev ve kökler', 'family, home and roots'),
  l('yaratıcılık, aşk ve kendini ifade', 'creativity, love and self-expression'),
  l('iş, düzen ve başkalarına hizmet', 'work, routine and service'),
  l('ilişkiler ve ortaklıklar', 'relationships and partnerships'),
  l('derin bağlar, dönüşüm ve ortak kaynaklar', 'deep bonds, transformation and shared resources'),
  l('inanç, yolculuk ve anlam arayışı', 'faith, travel and the search for meaning'),
  l('kariyer ve hayattaki yerin', 'career and your place in the world'),
  l('arkadaşlar, topluluklar ve hayaller', 'friends, communities and dreams'),
  l('iç dünya, sezgi ve görünmeyen alanlar', 'your inner world, intuition and the unseen'),
];
const HOUR_MEANING: Partial<Record<BodyId, L>> = {
  sun: l('Güneş: görünür olmak, liderlik ve onur senin için doğal', 'the Sun: being seen, leadership and honour come naturally'),
  moon: l('Ay: duyarlılık, insanlarla bağ kurma ve uyum yeteneği', 'the Moon: sensitivity, bonding with people and adaptability'),
  mars: l('Mars: cesaret, rekabet ve harekete geçme gücü', 'Mars: courage, competition and the drive to act'),
  mercury: l('Merkür: zekâ, konuşma, ticaret ve öğrenme merakı', 'Mercury: wit, speech, trade and curiosity'),
  jupiter: l('Jüpiter: iyimserlik, şans ve öğretme isteği', 'Jupiter: optimism, luck and the wish to teach'),
  venus: l('Venüs: güzellik, uyum, sanat ve sevgi', 'Venus: beauty, harmony, art and love'),
  saturn: l('Satürn: sabır, disiplin ve uzun vadeli başarı', 'Saturn: patience, discipline and long-term achievement'),
};

/** Doğum anının çoğu uygulamada bulunmayan ayrıntıları */
export function birthSecrets(ch: Chart): Secret[] {
  const out: Secret[] = [];
  const b = ch.utc, P = ch.positions, ay = ch.ayanamsa;
  const timed = ch.asc !== null && ch.cusps.length === 12;
  const hs = (lon: number) => (timed ? houseOf(lon, ch.cusps) : 0);

  // 1. Doğum öncesi yeni ay ya da dolunay (Batlamyus'un "prenatal syzygy"si)
  try {
    let last: { d: Date; full: boolean } | null = null;
    for (const [ph, full] of [[0, false], [180, true]] as const) {
      const t = A.SearchMoonPhase(ph, A.MakeTime(new Date(b.getTime() - 32 * DAY)), 33);
      if (t && t.date < b && (!last || t.date > last.d)) last = { d: t.date, full };
      // aynı fazın bir sonraki tekrarı da doğumdan önce olabilir
      if (t) { const t2 = A.SearchMoonPhase(ph, t.AddDays(1), 31); if (t2 && t2.date < b && (!last || t2.date > last.d)) last = { d: t2.date, full }; }
    }
    if (last) {
      const lon = norm(bodyLon(last.full ? 'moon' : 'sun', last.d) - ay), sg = Math.floor(lon / 30), h = hs(lon);
      const days = Math.round((b.getTime() - last.d.getTime()) / DAY);
      out.push({ id: 'syzygy', title: l('Doğumundan önceki son ' + (last.full ? 'dolunay' : 'yeni ay'), 'The last ' + (last.full ? 'full moon' : 'new moon') + ' before your birth'),
        text: l(`Sen doğmadan ${days} gün önce ${SIGNS[sg].tr} burcunda bir ${last.full ? 'dolunay' : 'yeni ay'} oldu. Antik astrologlar bu noktayı ruhun dünyaya gelmeden önceki “ayarı” sayar. ${last.full ? 'Dolunay öncesi doğanlar ilişkiler ve denge üzerinden olgunlaşır; hayatları başkalarının aynasında şekillenir.' : 'Yeni ay öncesi doğanlar kendi yolunu çizen, sezgisiyle başlayan ve sıfırdan kuran insanlardır.'}${h ? ` Bu nokta haritanın ${h}. evine düşüyor: ${LUNATION_HOUSE[h - 1].tr} hayatının görünmez motoru.` : ''}`,
          `${days} days before you were born there was a ${last.full ? 'full moon' : 'new moon'} in ${SIGNS[sg].en}. Ancient astrologers saw this as the soul’s “tuning” before birth. ${last.full ? 'Those born after a full moon mature through relationships and balance; their lives take shape in the mirror of others.' : 'Those born after a new moon carve their own path, start on instinct and build from scratch.'}${h ? ` It falls in house ${h}: ${LUNATION_HOUSE[h - 1].en} is the hidden engine of your life.` : ''}`) });
    }
  } catch { /* faz araması başarısızsa atla */ }

  // 2. Doğum öncesi tutulmalar
  try {
    let sol: Date | null = null, lun: Date | null = null;
    let s = A.SearchGlobalSolarEclipse(new Date(b.getTime() - 400 * DAY));
    while (s.peak.date < b) { sol = s.peak.date; s = A.NextGlobalSolarEclipse(s.peak); }
    let m = A.SearchLunarEclipse(new Date(b.getTime() - 400 * DAY));
    while (m.peak.date < b) { if (m.kind !== 'penumbral') lun = m.peak.date; m = A.NextLunarEclipse(m.peak); }
    const parts: string[] = [], partsEn: string[] = [];
    if (sol) { const lon = norm(bodyLon('sun', sol) - ay), h = hs(lon); parts.push(`Güneş tutulması ${SIGNS[Math.floor(lon / 30)].tr} burcunda${h ? ` (${h}. ev: ${LUNATION_HOUSE[h - 1].tr})` : ''}`); partsEn.push(`a solar eclipse in ${SIGNS[Math.floor(lon / 30)].en}${h ? ` (house ${h}: ${LUNATION_HOUSE[h - 1].en})` : ''}`); }
    if (lun) { const lon = norm(bodyLon('moon', lun) - ay), h = hs(lon); parts.push(`Ay tutulması ${SIGNS[Math.floor(lon / 30)].tr} burcunda${h ? ` (${h}. ev: ${LUNATION_HOUSE[h - 1].tr})` : ''}`); partsEn.push(`a lunar eclipse in ${SIGNS[Math.floor(lon / 30)].en}${h ? ` (house ${h}: ${LUNATION_HOUSE[h - 1].en})` : ''}`); }
    if (parts.length) out.push({ id: 'pecl', title: l('Doğumundan önceki tutulmalar', 'The eclipses before your birth'),
      text: l(`Doğumundan önceki son tutulmalar: ${parts.join('; ')}. Bu noktalar hayat boyu sürecek bir “kader teması” gibi okunur; o burçlardan geçen gezegenler ve yeni tutulmalar hayatında dönüm noktalarını tetikler.`, `The last eclipses before your birth: ${partsEn.join('; ')}. These points read like a lifelong “theme of fate”; planets and new eclipses passing through them trigger turning points in your life.`) });
  } catch { /* tutulma araması başarısızsa atla */ }

  // 3. Doğduğun gezegen günü ve saati
  try {
    const off = tzOffsetMin(ch.input.tz, b);
    let ph = planetaryHours(b, ch.input.lat, ch.input.lon, off);
    if (ph && b < ph.sunrise) ph = planetaryHours(new Date(b.getTime() - DAY), ch.input.lat, ch.input.lon, off);
    const hr = ph?.hours.find(h => b >= h.start && b < h.end);
    if (ph && hr) {
      out.push({ id: 'phour', title: l('Doğduğun gezegen günü ve saati', 'Your planetary day and hour of birth'),
        text: l(`${BODIES[ph.dayRuler].name.tr} gününde, ${BODIES[hr.ruler].name.tr} saatinde doğdun. Eski geleneğe göre doğum saatinin gezegeni, karakterine ikinci bir imza atar: ${HOUR_MEANING[hr.ruler]!.tr}. Önemli işlerini kendi gezegeninin saatlerinde (Bugün ekranındaki gezegen saatleri) yapmak sana şans getirir.${ch.input.timeKnown ? '' : ' Doğum saatin bilinmediği için bu bilgi yaklaşık.'}`,
          `You were born on a ${BODIES[ph.dayRuler].name.en} day, in a ${BODIES[hr.ruler].name.en} hour. In old tradition the hour’s planet adds a second signature to your character: ${HOUR_MEANING[hr.ruler]!.en}. Doing important things in your planet’s hours (see planetary hours on Today) brings you luck.${ch.input.timeKnown ? '' : ' Your birth time is unknown, so this is approximate.'}`) });
    }
  } catch { /* atla */ }

  // 4. Sabah ya da akşam yıldızı: Venüs ve Merkür
  for (const id of ['venus', 'mercury'] as BodyId[]) {
    const d = signed(P[id].lon, P.sun.lon);
    const dist = Math.abs(d);
    const morning = d < 0;
    const nm = BODIES[id].name;
    let tr: string, en: string;
    if (dist < 8) { tr = `${nm.tr} doğduğun anda Güneş’e çok yakındı (görünmezdi): bu yanın içe dönük ve gizli çalışır, zamanla ortaya çıkar.`; en = `${nm.en} was very close to the Sun at your birth (invisible): this side of you works inwardly and emerges with time.`; }
    else if (id === 'venus') { tr = morning ? 'Venüs doğduğunda sabah yıldızıydı: Güneş’ten önce doğuyordu. Aşkta atılgan, ilk adımı atan, tutkusunu açıkça gösteren birisin; eski metinlerde “savaşçı Venüs” denir.' : 'Venüs doğduğunda akşam yıldızıydı: Güneş battıktan sonra parlıyordu. Aşkta seçici, bekleyen, uyum ve zarafet arayan birisin; ilişkiler sende zamanla derinleşir.'; en = morning ? 'Venus was a morning star at your birth, rising before the Sun. In love you are bold, take the first step and show passion openly; old texts call it the “warrior Venus”.' : 'Venus was an evening star at your birth, shining after sunset. In love you are selective, patient and seek harmony and grace; relationships deepen with time.'; }
    else { tr = morning ? 'Merkür doğduğunda sabah yıldızıydı: düşüncen hızlı, sezgisel ve ileriye dönük; önce konuşup sonra düşünebilirsin.' : 'Merkür doğduğunda akşam yıldızıydı: düşüncen derin, temkinli ve geriye dönük; konuşmadan önce tartar, geçmişten ders çıkarırsın.'; en = morning ? 'Mercury was a morning star at your birth: your thinking is quick, intuitive and forward-looking; you may speak before you think.' : 'Mercury was an evening star at your birth: your thinking is deep, careful and reflective; you weigh before speaking and learn from the past.'; }
    out.push({ id: 'star-' + id, title: l(`${nm.tr}: sabah mı akşam yıldızı mı?`, `${nm.en}: morning or evening star?`), text: l(tr, en) });
  }

  // 5. Doğarken durağan (istasyonda) gezegenler
  const stat: BodyId[] = [];
  for (const id of ['mercury', 'venus', 'mars', 'jupiter', 'saturn'] as BodyId[]) {
    const a = speed(id, new Date(b.getTime() - 3 * DAY)), c = speed(id, new Date(b.getTime() + 3 * DAY));
    if (Math.sign(a) !== Math.sign(c)) stat.push(id);
  }
  if (stat.length) out.push({ id: 'station', title: l('Doğduğun gün durağan gezegen', 'A stationary planet at your birth'),
    text: l(`${stat.map(x => BODIES[x].name.tr).join(' ve ')} doğduğun günlerde yön değiştiriyordu, yani gökyüzünde “durmuştu”. Durağan gezegen haritadaki en güçlü gezegenlerden biri sayılır ve hayatında takıntı derecesinde önemli bir tema olur. Bu, çok az insanın haritasında görülen bir işarettir.`,
      `${stat.map(x => BODIES[x].name.en).join(' and ')} was changing direction around your birth, “standing still” in the sky. A stationary planet counts among the strongest in a chart and becomes an almost obsessive theme in life. Few people have this.`) });

  // 6. Boşta Ay ile doğmak
  try {
    const exit = signExit('moon', b, 3);
    const any = SEVEN.filter(p => p !== 'moon').some(p => nextAspect('moon', p, b, exit));
    if (!any) out.push({ id: 'void', title: l('Boşta Ay ile doğdun', 'You were born with a void Moon'),
      text: l('Doğduğun anda Ay, burç değiştirmeden önce hiçbir gezegenle açı yapmıyordu (boşta Ay). Bu nadir bir durumdur: başkalarının beklentilerine göre değil, kendi iç ritmine göre yaşarsın; plan yapmaktan çok akışa güvenirsin ve çoğu şey sana “kendiliğinden” gelir.', 'At your birth the Moon made no aspect before leaving its sign (a void Moon). It is rare: you live by your own inner rhythm rather than others’ expectations, trust flow over plans, and many things come to you “by themselves”.') });
  } catch { /* atla */ }

  return out;
}

// ---------------- Kişisel Ay döngüsü ----------------
const PHASES: { name: L; text: L }[] = [
  { name: l('Kişisel yeni ay', 'Personal new moon'), text: l('Senin için yeni bir aylık döngü başlıyor: niyet koymak, yeni bir şeye başlamak ve kendini dinlemek için en iyi günler.', 'A new monthly cycle starts for you: the best days to set intentions, start something and listen to yourself.') },
  { name: l('Kişisel hilal', 'Personal crescent'), text: l('Başladığın şeyi büyütme zamanı; küçük adımlar at, cesaret topla.', 'Time to grow what you started; take small steps and gather courage.') },
  { name: l('Kişisel ilk dördün', 'Personal first quarter'), text: l('Engeller ve kararlar dönemi: harekete geç, ertelediğin konuşmayı yap.', 'A time of hurdles and decisions: act and have the talk you postponed.') },
  { name: l('Kişisel şişkin ay', 'Personal gibbous'), text: l('İnce ayar zamanı: planını düzelt, detaylara bak, yardım iste.', 'Time to fine-tune: adjust your plan, check details, ask for help.') },
  { name: l('Kişisel dolunay', 'Personal full moon'), text: l('Ayın zirvesi: sonuçlar görünür, duygular yoğunlaşır; ilişkilerde netleşme ve tamamlanma.', 'The month’s peak: results show, emotions intensify; clarity and completion in relationships.') },
  { name: l('Kişisel yayılan ay', 'Personal disseminating'), text: l('Paylaşma zamanı: öğrendiklerini anlat, emeğinin karşılığını topla.', 'Time to share: tell what you learned and collect what you earned.') },
  { name: l('Kişisel son dördün', 'Personal last quarter'), text: l('Bırakma zamanı: işe yaramayanı bırak, ortalığı topla, gereksiz yükleri azalt.', 'Time to let go: drop what doesn’t work, tidy up and lighten the load.') },
  { name: l('Kişisel balzamik ay', 'Personal balsamic'), text: l('Dinlenme ve iç dünyaya dönme günleri: yeni döngüden önce enerjini topla, büyük kararları birkaç gün ertele.', 'Days to rest and turn inward: gather energy before the new cycle and postpone big decisions a few days.') },
];
/** Gökteki Ay ile doğum Güneşin arasındaki açıdan çıkan, sana özel aylık enerji döngüsü */
export function personalLunarPhase(ch: Chart, now = new Date()) {
  const ang = norm(norm(bodyLon('moon', now) - ch.ayanamsa) - ch.positions.sun.lon);
  const idx = Math.floor(((ang + 22.5) % 360) / 45);
  const toNew = (360 - ang) / (360 / SYNODIC), toFull = ang <= 180 ? (180 - ang) / (360 / SYNODIC) : (540 - ang) / (360 / SYNODIC);
  return { angle: ang, phase: PHASES[idx], idx, daysToNew: toNew, daysToFull: toFull };
}

// ---------------- Kişiye özel en iyi günler ----------------
export type DayKind = 'love' | 'career';
export interface GoodDay { date: Date; score: number; reasons: L[] }
const HARM = [0, 60, 120];
const asp = (a: number, b: number, set: number[], orb: number) => set.some(x => Math.abs(angleDiff(a, b) - x) <= orb);

export function bestDays(ch: Chart, kind: DayKind, days = 45, from = new Date()): GoodDay[] {
  const P = ch.positions, ay = ch.ayanamsa;
  const timed = ch.asc !== null && ch.cusps.length === 12;
  // Boşta Ay aralıkları
  const voids: { s: number; e: number }[] = [];
  try {
    let t = new Date(from.getTime() - DAY);
    for (let k = 0; k < Math.ceil(days / 2.2) + 2; k++) {
      const v = voidOfCourse(t);
      if (!v) break;
      voids.push({ s: v.start.getTime(), e: v.end.getTime() });
      t = new Date(v.end.getTime() + DAY / 4);
      if (t.getTime() > from.getTime() + (days + 2) * DAY) break;
    }
  } catch { /* atla */ }
  const out: GoodDay[] = [];
  let start = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate(), 10));
  if (start < from) start = new Date(start.getTime() + DAY);
  for (let i = 0; i < days; i++) {
    const d = new Date(start.getTime() + i * DAY);
    if (voids.some(v => d.getTime() >= v.s && d.getTime() <= v.e)) continue;
    const tl = (id: BodyId) => norm(bodyLon(id, d) - ay);
    const M = tl('moon'), S = tl('sun'), V = tl('venus'), Ma = tl('mars'), Sa = tl('saturn'), J = tl('jupiter');
    const waxing = norm(M - S) < 180;
    const rs: L[] = []; let sc = 0;
    const add = (w: number, r: L) => { sc += w; if (w > 0) rs.push(r); };
    if (asp(M, Ma, [0, 90, 180], 6) || asp(M, Sa, [0, 90, 180], 6)) sc -= 3;
    if (waxing) add(1, l('Ay büyüyor: başlangıçlar için uygun', 'Waxing Moon: good for beginnings'));
    if (asp(M, J, HARM, 6)) add(1, l('Ay ile Jüpiter uyumlu: iyimser hava', 'Moon and Jupiter in harmony: an optimistic mood'));
    const mh = timed ? houseOf(M, ch.cusps) : 0;
    if (kind === 'love') {
      if (speed('venus', d) < 0) sc -= 4;
      if (asp(M, P.venus.lon, HARM, 5)) add(3, l('Ay, doğum Venüs’ünle uyumlu: kalbin açık, çekiciliğin yüksek', 'The Moon harmonises your birth Venus: an open heart and high charm'));
      if (asp(M, P.moon.lon, HARM, 5)) add(1, l('Ay kendi doğum Ay’ınla uyumlu: kendini rahat hissedersin', 'The Moon harmonises your birth Moon: you feel at ease'));
      if (asp(M, P.mars.lon, [0, 60, 120], 4)) add(1, l('Ay doğum Mars’ınla uyumlu: tutku ve cesaret', 'The Moon harmonises your birth Mars: passion and courage'));
      if (mh === 5 || mh === 7) add(2, mh === 5 ? l('Ay flört ve aşk evinde', 'The Moon is in your romance house') : l('Ay ilişki evinde', 'The Moon is in your partnership house'));
      if (asp(V, P.sun.lon, HARM, 3) || asp(V, P.venus.lon, HARM, 3)) add(1, l('Gökteki Venüs haritana uyumlu bakıyor', 'Venus in the sky looks kindly on your chart'));
    } else {
      if (speed('mercury', d) < 0) sc -= 4;
      if (asp(M, P.sun.lon, HARM, 5)) add(2, l('Ay doğum Güneş’inle uyumlu: kendini iyi ifade edersin', 'The Moon harmonises your birth Sun: you express yourself well'));
      if (asp(M, P.jupiter.lon, HARM, 5)) add(2, l('Ay doğum Jüpiter’inle uyumlu: şans ve destek', 'The Moon harmonises your birth Jupiter: luck and support'));
      if (asp(M, P.mercury.lon, HARM, 5)) add(1, l('Ay doğum Merkür’ünle uyumlu: net düşünce ve iyi konuşma', 'The Moon harmonises your birth Mercury: clear thinking and good speech'));
      if (timed && asp(M, ch.mc!, HARM, 5)) add(2, l('Ay kariyer noktana uyumlu: görünür olursun', 'The Moon harmonises your career point: you get noticed'));
      if (mh === 10 || mh === 6 || mh === 2) add(1, l('Ay iş ve kazanç evlerinden birinde', 'The Moon is in one of your work or income houses'));
    }
    if (sc >= 4 && rs.length >= 2) out.push({ date: d, score: sc, reasons: rs });
  }
  return out.sort((a, b) => b.score - a.score).slice(0, 5).sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ---------------- Gökyüzü yaşın ----------------
export function skyAge(ch: Chart, now = new Date()) {
  const ms = now.getTime() - ch.utc.getTime();
  const days = ms / DAY, years = ms / YEAR;
  const next = (unitDays: number, count: number) => new Date(ch.utc.getTime() + count * unitDays * DAY);
  const roundUp = (x: number, step: number) => Math.ceil((x + 0.0001) / step) * step;
  const nDay = roundUp(days, 1000), nMoon = roundUp(days / SYNODIC, 50), nSec = roundUp(ms / 1000, 1e9);
  return {
    days: Math.floor(days), years,
    fullMoons: Math.floor(days / SYNODIC),
    lunarReturns: Math.floor(days / 27.321661),
    km: years * 940e6,
    jupiter: Math.floor(years / 11.862), saturn: Math.floor(years / 29.457),
    venusCycles: Math.floor(days / 583.92),
    milestones: [
      { what: l(`${nDay.toLocaleString('tr-TR')}. günün`, `Your ${nDay.toLocaleString('en-GB')}th day`), date: next(1, nDay) },
      { what: l(`${nMoon}. dolunayın`, `Your ${nMoon}th full moon`), date: next(SYNODIC, nMoon) },
      { what: l(`${nSec / 1e9}. milyar saniyen`, `Your ${nSec / 1e9} billionth second`), date: new Date(ch.utc.getTime() + nSec * 1000) },
    ].sort((a, b) => a.date.getTime() - b.date.getTime()),
  };
}
