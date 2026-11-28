// Gelecekteki eş: popüler uygulamalarda görülmeyen klasik ve Vedik teknikler.
// Kaynaklar: Batlamyus, Tetrabiblos IV.5 "Evlilik Üzerine"; Jaimini sutraları (Darakaraka, Upapada);
// Parashara (Navamsa / D9); William Lilly, Christian Astrology (yönler, mesafe, Ptolemy terimleri).
import * as A from 'astronomy-engine';
import type { BodyId, Chart } from '../engine/astro';
import { lahiri, SIGN_RULERS } from '../engine/astro';
import { BODIES, SIGNS } from './base';
import { termRuler } from './lillyDignity';
import type { SpouseSection } from './spouse';

type L = { tr: string; en: string };
const l = (tr: string, en: string): L => ({ tr, en });
const norm = (x: number) => ((x % 360) + 360) % 360;
const SEVEN: BodyId[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const nm = (b: BodyId) => BODIES[b].name;

/** Sidereal (Lahiri) boylam: harita tropikalse ayanamsa çıkarılır */
function sid(ch: Chart, lon: number): number {
  if (ch.zodiac === 'sidereal') return norm(lon);
  return norm(lon - lahiri(A.MakeTime(ch.utc)));
}
const navamsa = (sidLon: number) => Math.floor((sidLon * 9) / 30) % 12;

// ---------- Batlamyus: kocayı / karıyı anlatan gezegen ----------
const PTOL_WIFE: Record<string, L> = {
  saturn: l('çalışkan, ciddi ve sert', 'hard-working, serious and stern'),
  jupiter: l('ağırbaşlı, onurlu ve evi iyi yöneten', 'dignified and a good manager of the home'),
  mars: l('cesur, atak ve zapt edilmesi zor', 'bold, daring and hard to rein in'),
  venus: l('neşeli, güzel ve çekici', 'cheerful, beautiful and charming'),
  mercury: l('zeki, keskin ve hazırcevap', 'intelligent, sharp and quick-witted'),
};
const PTOL_HUSB: Record<string, L> = {
  saturn: l('ağırbaşlı, sakin ve çalışkan', 'sedate, calm and industrious'),
  jupiter: l('onurlu, cömert ve saygın', 'dignified, generous and respected'),
  mars: l('hareketli, iş bitirici ama sevgisini göstermekte zorlanan', 'a man of action who struggles to show affection'),
  venus: l('bakımlı, şık ve yakışıklı', 'well-groomed, stylish and handsome'),
  mercury: l('tutumlu, pratik ve becerikli', 'thrifty, practical and capable'),
};
const BICORP = [2, 8, 11]; // İkizler, Yay, Balık: çift bedenli burçlar

function applying(ch: Chart, from: BodyId, cand: BodyId[], orb = 10): BodyId[] {
  const f = ch.positions[from];
  const out: { b: BodyId; d: number }[] = [];
  for (const b of cand) {
    if (b === from) continue;
    const p = ch.positions[b];
    for (const ang of [0, 60, 90, 120, 180]) for (const sgn of [1, -1]) {
      const target = norm(p.lon + sgn * ang);
      const rel = (f.speed ?? 0) - (p.speed ?? 0);
      const gap = norm(target - f.lon); // ileride mi?
      const d = rel >= 0 ? gap : 360 - gap;
      if (d > 0 && d <= orb) out.push({ b, d });
    }
  }
  return [...new Map(out.sort((a, b) => a.d - b.d).map(x => [x.b, x])).values()].map(x => x.b);
}

export function ptolemyMarriage(ch: Chart, gender: 'f' | 'm'): SpouseSection {
  const sig: BodyId = gender === 'm' ? 'moon' : 'sun';
  const P = ch.positions[sig];
  const parts: L[] = [], why: L[] = [];
  const timed = ch.cusps.length > 0;
  if (timed) {
    const h = P.house;
    const east = [10, 11, 12, 4, 5, 6].includes(h);
    parts.push(east
      ? l('Hayatına erken yaşta ciddi bir bağ girmeye ya da kendinden genç biriyle yakınlaşmaya yatkınsın; bu kural özellikle ilk ciddi bağın zamanını anlatır.', 'You tend to form a serious bond early, or with someone younger; this rule speaks mainly of the first serious bond.')
      : l('Geç evlenmeye ya da kendinden büyük biriyle evlenmeye yatkınsın.', 'You tend to marry late, or to marry someone older than you.'));
    why.push(l(`${nm(sig).tr} ${h}. evde, yani haritanın ${east ? 'doğu' : 'batı'} çeyreğinde.`, `${nm(sig).en} is in house ${h}, the ${east ? 'eastern' : 'western'} quadrant.`));
  }
  const app = applying(ch, sig, ['saturn', 'jupiter', 'mars', 'venus', 'mercury'].filter(b => b !== sig) as BodyId[], gender === 'm' ? 12 : 8);
  const sameSign = app.filter(b => ch.positions[b].sign === P.sign).length >= 2;
  const multi = BICORP.includes(P.sign) || sameSign;
  parts.push(multi
    ? l('Hayatında birden fazla ciddi evlilik ya da evlilik kadar derin bağ olabilir; ilk bağ çoğu zaman son bağ olmaz.', 'There may be more than one marriage, or more than one bond as deep as marriage; the first is often not the last.')
    : l('Haritan tek ve kalıcı bir evliliği tarif ediyor.', 'Your chart describes one lasting marriage.'));
  why.push(BICORP.includes(P.sign)
    ? l(`${nm(sig).tr} çift bedenli ${SIGNS[P.sign].tr} burcunda.`, `${nm(sig).en} is in the double-bodied sign ${SIGNS[P.sign].en}.`)
    : sameSign ? l(`${nm(sig).tr} aynı burçtaki birden fazla gezegene ilerliyor.`, `${nm(sig).en} applies to several planets in one sign.`)
      : l(`${nm(sig).tr} tek bedenli ${SIGNS[P.sign].tr} burcunda.`, `${nm(sig).en} is in the single-bodied sign ${SIGNS[P.sign].en}.`));
  const T = gender === 'm' ? PTOL_WIFE : PTOL_HUSB;
  const first = app.find(b => T[b]);
  if (first) {
    parts.push(l(`Eşin ${T[first].tr} biri olarak tarif ediliyor.`, `Your spouse is described as ${T[first].en}.`));
    why.push(l(`${nm(sig).tr} ilk olarak ${nm(first).tr} ile açı yapmaya ilerliyor.`, `${nm(sig).en} first applies to ${nm(first).en}.`));
  }
  if (gender === 'm') {
    const dSun = Math.abs(((P.lon - ch.positions.sun.lon + 540) % 360) - 180);
    if (dSun < 15 && app.includes('saturn')) {
      parts.push(l('Batlamyus bu yerleşimi evliliğin çok geciktiği ya da zorlukla geldiği işaretlerden sayar; acele etmeyen, olgun bir bağ sana daha uygun.', 'Ptolemy counts this as a sign of a much-delayed or hard-won marriage; a mature, unhurried bond suits you better.'));
      why.push(l('Ay, Güneş’in ışınları altında ve Satürn’le açıda.', 'The Moon is under the Sun’s beams and in aspect with Saturn.'));
    }
  }
  return {
    id: 'ptolemy', title: l('Batlamyus’un kuralı: ne zaman, kaç kez, nasıl biri?', 'Ptolemy’s rule: when, how many times, what kind of person?'),
    text: l(parts.map(p => p.tr).join(' '), parts.map(p => p.en).join(' ')),
    why: l(`Batlamyus’un 2. yüzyılda yazdığı Tetrabiblos’taki “Evlilik Üzerine” bölümüne göre ${gender === 'm' ? 'erkek haritasında eşi Ay' : 'kadın haritasında eşi Güneş'} anlatır. ${why.map(w => w.tr).join(' ')}`,
      `Per the chapter “Of Marriage” in Ptolemy’s 2nd-century Tetrabiblos, ${gender === 'm' ? 'in a man’s chart the Moon' : 'in a woman’s chart the Sun'} describes the spouse. ${why.map(w => w.en).join(' ')}`),
  };
}

// ---------- Jaimini: Darakaraka ----------
const DK: Record<string, { who: L; work: L }> = {
  sun: { who: l('onurlu, kendinden emin, ilkeli ve sadık; zaman zaman katı', 'dignified, self-assured, principled and loyal; sometimes rigid'), work: l('devlet, yönetim, üst düzey yöneticilik, hukuk ya da siyaset', 'government, administration, senior management, law or politics') },
  moon: { who: l('duygusal zekâsı yüksek, şefkatli, aileye düşkün; stres altında alıngan', 'emotionally intelligent, caring and family-centred; moody under stress'), work: l('sağlık, çocuklarla çalışma, yeme-içme, misafirlik, psikolojik danışmanlık ya da halkla ilişkiler', 'healthcare, working with children, food, hospitality, counselling or public-facing roles') },
  mars: { who: l('dolaysız, enerjik, cesur ve koruyucu; lafını esirgemeyen', 'direct, energetic, brave and protective; blunt'), work: l('askerlik, emniyet, cerrahi, mühendislik, inşaat, spor ya da girişimcilik', 'the military, police, surgery, engineering, construction, sport or entrepreneurship') },
  mercury: { who: l('hızlı düşünen, meraklı, konuşkan ve genç ruhlu; duygularını kolay açmayan', 'quick, curious, articulate and youthful; not quick to open up emotionally'), work: l('yazarlık, gazetecilik, öğretmenlik, yazılım, veri, muhasebe ya da ticaret; çoğu zaman aynı anda birkaç iş', 'writing, journalism, teaching, software, data, accounting or trade; often several roles at once') },
  jupiter: { who: l('cömert, ilkeli, bilge ve iyimser; bazen fazla söz veren', 'generous, principled, wise and optimistic; may overcommit'), work: l('akademi, hukuk, tıp, yöneticilik, finansal danışmanlık ya da manevi rehberlik', 'academia, law, medicine, management, financial advice or spiritual guidance') },
  venus: { who: l('çekici, estetik duygusu güçlü, romantik ve sosyal; tartışmadan kaçan', 'charming, aesthetic, romantic and sociable; avoids conflict'), work: l('sanat, müzik, film, moda, tasarım, güzellik ya da diplomasi', 'art, music, film, fashion, design, beauty or diplomacy') },
  saturn: { who: l('ciddi, disiplinli, güvenilir, duygularını tutan; yaşından olgun ya da senden büyük', 'serious, disciplined, reliable and reserved; mature for their age or older than you'), work: l('kamu, hukuk, mühendislik, inşaat, sosyal hizmet ya da uzun soluklu kurumsal işler', 'civil service, law, engineering, construction, social work or long-term institutional roles') },
};
export function darakarakaOf(ch: Chart): { planet: BodyId; who: { tr: string; en: string } } {
  const d = SEVEN.map(b => ({ b, d: sid(ch, ch.positions[b].lon) % 30 })).sort((a, b) => a.d - b.d)[0].b;
  return { planet: d, who: DK[d].who };
}
export function darakarakaJob(ch: Chart): SpouseSection {
  const d = darakarakaOf(ch).planet;
  return { id: 'dkjob', title: l('Darakaraka’ya göre mesleği', 'Work, from the Darakaraka'), text: l(`Meslekte ${DK[d].work.tr} gibi alanlar ona yakın.`, `Fields such as ${DK[d].work.en} suit them.`), why: l(`Vedik astrolojide eşi gösteren gezegen (Darakaraka) senin haritanda ${nm(d).tr}; bu gezegenin konuları eşinin iş hayatına da yansır.`, `Your Darakaraka is ${nm(d).en}; its themes reflect in your spouse’s work too.`) };
}
export function darakaraka(ch: Chart): SpouseSection {
  const deg = SEVEN.map(b => ({ b, d: sid(ch, ch.positions[b].lon) % 30 })).sort((a, b) => a.d - b.d);
  const dk = deg[0].b, s = Math.floor(sid(ch, ch.positions[dk].lon) / 30);
  const x = DK[dk];
  return {
    id: 'darakaraka', title: l('Darakaraka: Vedik astrolojiye göre eşin', 'Darakaraka: your spouse in Vedic astrology'),
    text: l(`Eşin ${x.who.tr} biri. Bu gezegen Vedik haritanda ${SIGNS[s].tr} burcunda; eşinde bu burcun tonu da hissedilir.`,
      `Your spouse is ${x.who.en}. Fields such as ${x.work.en} suit them. This planet sits in ${SIGNS[s].en} in your Vedic chart, so that sign colours them too.`),
    why: l(`Jaimini sisteminde gezegenler burç içindeki derecelerine göre sıralanır; en düşük derecedeki gezegen eşi gösterir (Darakaraka). Senin haritanda bu ${nm(dk).tr} (${deg[0].d.toFixed(1)}°). Hesap, Vedik astrolojideki gibi sidereal (Lahiri) zodyakla yapıldı.`,
      `In the Jaimini system planets are ranked by degree within their sign; the lowest one shows the spouse (Darakaraka). In your chart it is ${nm(dk).en} (${deg[0].d.toFixed(1)}°), computed in the sidereal (Lahiri) zodiac as in Vedic astrology.`),
  };
}

// ---------- Burçlara göre eş tonu (D9 7. ev ve Upapada için) ----------
const SIGN_SPOUSE: L[] = [
  l('atak, rekabetçi, bağımsız ve hızlı karar veren', 'bold, competitive, independent and quick to decide'),
  l('sakin, sadık, konforuna ve parasına düşkün', 'calm, loyal and fond of comfort and financial security'),
  l('konuşkan, esprili, meraklı ve hareketli', 'talkative, witty, curious and on the move'),
  l('şefkatli, ailesine bağlı, korumacı ve duygusal', 'caring, family-bound, protective and emotional'),
  l('gururlu, cömert, dikkat çeken ve sıcak', 'proud, generous, striking and warm'),
  l('titiz, çalışkan, yardımsever ve eleştirel', 'meticulous, hard-working, helpful and critical'),
  l('zarif, uyumlu, adil ve ilişkiye önem veren', 'graceful, harmonious, fair and relationship-minded'),
  l('yoğun, tutkulu, sır saklayan ve sahiplenici', 'intense, passionate, private and possessive'),
  l('özgür ruhlu, iyimser, gezgin ve felsefi', 'free-spirited, optimistic, well-travelled and philosophical'),
  l('ciddi, hırslı, sorumluluk sahibi ve statü bilinci yüksek', 'serious, ambitious, responsible and status-aware'),
  l('özgün, arkadaş canlısı, sıra dışı ve özgürlüğüne düşkün', 'original, friendly, unconventional and freedom-loving'),
  l('hassas, hayalperest, sezgileri güçlü ve fedakâr', 'sensitive, dreamy, intuitive and self-giving'),
];

export function navamsaSpouse(ch: Chart): SpouseSection {
  const vSid = sid(ch, ch.positions.venus.lon);
  const v9 = navamsa(vSid), v1 = Math.floor(vSid / 30);
  const parts: L[] = [l(`Navamsa’da Venüs’ün ${SIGNS[v9].tr} burcunda: evlilikte aradığın sevgi ${SIGN_SPOUSE[v9].tr} bir tarzda.`, `Your Navamsa Venus is in ${SIGNS[v9].en}: the love you seek in marriage is ${SIGN_SPOUSE[v9].en} in style.`)];
  const why: L[] = [];
  if (v9 === v1) parts.push(l('Venüs’ün iki haritada da aynı burçta (vargottama): aşk ve evlilik konusunda içgüdülerin çok güçlü ve güvenilir.', 'Venus is in the same sign in both charts (vargottama): your instincts in love and marriage are strong and reliable.'));
  if (ch.asc !== null) {
    const a9 = navamsa(sid(ch, ch.asc)), d9 = (a9 + 6) % 12, r = SIGN_RULERS[d9];
    parts.unshift(l(`Evlilik haritanın 7. evi ${SIGNS[d9].tr}: eşin ${SIGN_SPOUSE[d9].tr} biri. Bu evin yöneticisi ${nm(r).tr}; evlilikten sonra hayatında ${nm(r).tr} temaları güçlenir.`, `The 7th house of your marriage chart is ${SIGNS[d9].en}: your spouse is ${SIGN_SPOUSE[d9].en}. Its ruler is ${nm(r).en}; its themes grow in your life after marriage.`));
    why.push(l(`Navamsa yükselenin ${SIGNS[a9].tr}, 7. evi ${SIGNS[d9].tr}.`, `Navamsa Ascendant ${SIGNS[a9].en}, 7th house ${SIGNS[d9].en}.`));
  }
  return {
    id: 'navamsa', title: l('Navamsa (D9): evlilik haritan', 'Navamsa (D9): your marriage chart'),
    text: l(parts.map(p => p.tr).join(' '), parts.map(p => p.en).join(' ')),
    why: l(`Vedik astrolojide her burç dokuza bölünerek evliliği ve eşi anlatan ayrı bir harita çıkarılır (Navamsa). Doğum haritası söz verir, Navamsa sonucu gösterir. ${why.map(w => w.tr).join(' ')}`,
      `In Vedic astrology each sign is divided into nine to draw a separate chart for marriage and the spouse (Navamsa). The birth chart makes the promise, the Navamsa shows the result. ${why.map(w => w.en).join(' ')}`),
  };
}

// ---------- Jaimini: Upapada Lagna ----------
const BENEFIC: BodyId[] = ['jupiter', 'venus', 'mercury', 'moon'];
const MALEFIC: BodyId[] = ['saturn', 'mars', 'sun'];
export function upapada(ch: Chart): SpouseSection | null {
  if (ch.asc === null) return null;
  const lag = Math.floor(sid(ch, ch.asc) / 30), h12 = (lag + 11) % 12;
  const lord = SIGN_RULERS[h12];
  const ls = Math.floor(sid(ch, ch.positions[lord].lon) / 30);
  const n = ((ls - h12 + 12) % 12) + 1;
  let ul = (ls + n - 1) % 12;
  if (ul === h12) ul = (h12 + 9) % 12; else if (ul === (h12 + 6) % 12) ul = (h12 + 3) % 12;
  const sgn = (b: BodyId) => Math.floor(sid(ch, ch.positions[b].lon) / 30);
  const inUL = SEVEN.filter(b => sgn(b) === ul), in2 = SEVEN.filter(b => sgn(b) === (ul + 1) % 12);
  const parts: L[] = [l(`Evliliğinin dışarıdan görünen yüzü ${SIGNS[ul].tr}: eşin ve onun ailesi ${SIGN_SPOUSE[ul].tr} bir havada.`, `The public face of your marriage is ${SIGNS[ul].en}: your spouse and their family carry a ${SIGN_SPOUSE[ul].en} air.`)];
  const IN_UL: Partial<Record<BodyId, L>> = { jupiter: l('Jüpiter bu noktada: evliliğe destek, iyi niyet ve uzun ömür getirir.', 'Jupiter sits here: support, goodwill and longevity for the marriage.'), venus: l('Venüs bu noktada: evlilik sevgi dolu, uyumlu ve keyifli olur.', 'Venus sits here: a loving, harmonious marriage.') };
  const ulB = inUL.filter(b => IN_UL[b]);
  if (ulB.length === 2) parts.push(l('Jüpiter ve Venüs ikisi de bu noktada: evlilik için çok güçlü bir destek; sevgi dolu ve uzun ömürlü bir bağ.', 'Both Jupiter and Venus sit here: strong support for a loving, long-lived marriage.'));
  else if (ulB.length === 1) parts.push(IN_UL[ulB[0]]!);
  const IN2: Record<string, L> = { venus: l('Venüs evliliği tatlandırır', 'Venus sweetens it'), jupiter: l('Jüpiter onu korur ve büyütür', 'Jupiter protects and grows it'), mercury: l('Merkür sorunları konuşarak çözmeyi sağlar', 'Mercury helps you talk things through'), moon: l('Ay duygusal yakınlık getirir', 'the Moon brings emotional closeness'), mars: l('Mars tartışma ve sabırsızlık getirir', 'Mars brings arguments and impatience'), saturn: l('Satürn mesafe ve sorumluluk yükü getirir', 'Saturn brings distance and duty'), sun: l('Güneş ego çatışmasına yol açabilir', 'the Sun can bring clashes of ego') };
  const g = in2.filter(b => BENEFIC.includes(b)).length, b = in2.filter(x => MALEFIC.includes(x)).length;
  const list = (lang: 'tr' | 'en') => { const xs = in2.map(x => IN2[x][lang]); return xs.length > 1 ? xs.slice(0, -1).join(', ') + (lang === 'tr' ? ', ' : ', while ') + xs[xs.length - 1] : xs[0]; };
  if (in2.length) {
    const tail = g && !b ? l('bağ zamanla güçlenen, uzun soluklu bir yapı.', 'a long-lasting bond that grows stronger.') : b && !g ? l('evlilik emek ister; sınavlardan geçerek oturur.', 'the marriage takes work and settles through tests.') : l('iyi dönemlerle sınavlar iç içe.', 'good periods and tests alternate.');
    const t = list('tr');
    parts.push(l(`Evliliği ayakta tutan alanda ${t}: ${tail.tr}`, `Where the marriage is sustained, ${list('en')}: ${tail.en}`));
  } else parts.push(l('Evliliği taşıyan alan boş: kalıcılığı belirleyen, o alanın yöneticisinin durumu ve ikinizin emeği.', 'The house that sustains the marriage is empty; its ruler and your shared effort decide how lasting it is.'));
  return {
    id: 'upapada', title: l('Upapada: evliliğin kendisi', 'Upapada: the marriage itself'),
    text: l(parts.map(p => p.tr).join(' '), parts.map(p => p.en).join(' ')),
    why: l(`Jaimini’nin Upapada Lagna’sı eşi değil evliliğin kendisini gösterir: 12. evin yöneticisinin uzaklığı kadar ondan ileri sayılarak bulunur. Senin Upapada’n ${SIGNS[ul].tr}${inUL.length ? `; içinde ${inUL.map(x => nm(x).tr).join(', ')}` : ''}${in2.length ? `; ondan sonraki burçta ${in2.map(x => nm(x).tr).join(', ')}` : ''}.`,
      `Jaimini’s Upapada Lagna shows the marriage itself rather than the spouse: count from the 12th house to its ruler, then the same distance again. Your Upapada is ${SIGNS[ul].en}${inUL.length ? `, holding ${inUL.map(x => nm(x).en).join(', ')}` : ''}${in2.length ? `; the next sign holds ${in2.map(x => nm(x).en).join(', ')}` : ''}.`),
  };
}

// ---------- Evliliğin özeti: teknikleri birleştirir ----------
const THEME: Partial<Record<BodyId, L>> = {
  saturn: l('ciddi, olgun, sorumluluk sahibi bir eş ve zamanla güçlenen, kalıcı bir evlilik', 'a serious, mature, responsible spouse and a marriage that strengthens with time'),
  venus: l('sevgi dolu, uyumlu ve keyifli bir evlilik', 'a loving, harmonious, pleasant marriage'),
  jupiter: l('cömert, ufuk açan ve şanslı bir evlilik', 'a generous, horizon-widening, fortunate marriage'),
  mars: l('tutkulu, canlı ama zaman zaman tartışmalı bir evlilik', 'a passionate, lively but sometimes argumentative marriage'),
  mercury: l('konuşmanın ve ortak fikirlerin merkezde olduğu bir evlilik', 'a marriage centred on talk and shared ideas'),
  moon: l('duygusal, yuva ve aile odaklı bir evlilik', 'an emotional, home- and family-centred marriage'),
  sun: l('güçlü, gururlu ve çevrede görünür bir evlilik', 'a strong, proud, visible marriage'),
};
export function marriageSummary(ch: Chart, gender?: 'f' | 'm' | null): SpouseSection | null {
  if (ch.asc === null || !ch.cusps.length) return null;
  const P = ch.positions;
  const votes: { b: BodyId; why: string }[] = [];
  const s7 = Math.floor(ch.cusps[6] / 30), r7 = SIGN_RULERS[s7];
  votes.push({ b: r7, why: `yedinci ev ${SIGNS[s7].tr}` });
  for (const b of SEVEN) if (P[b].house === 7 && b !== r7) votes.push({ b, why: `yedinci evde ${nm(b).tr}` });
  if (P.juno) votes.push({ b: SIGN_RULERS[P.juno.sign], why: `Juno ${SIGNS[P.juno.sign].tr}` });
  const d9 = (navamsa(sid(ch, ch.asc)) + 6) % 12; votes.push({ b: SIGN_RULERS[d9], why: `Navamsa’nın 7. evi ${SIGNS[d9].tr}` });
  const up = upapada(ch); const ulS = up ? SIGNS.findIndex(x => up.why.tr.includes(`Upapada’n ${x.tr}`)) : -1;
  if (ulS >= 0) votes.push({ b: SIGN_RULERS[ulS], why: `Upapada ${SIGNS[ulS].tr}` });
  const cnt = new Map<BodyId, string[]>(); for (const v of votes) cnt.set(v.b, [...(cnt.get(v.b) ?? []), v.why]);
  const top = [...cnt.entries()].sort((a, b) => b[1].length - a[1].length)[0];
  // zamanlama
  const satIn7 = P.saturn.house === 7, satRules = r7 === 'saturn' || s7 === 9 || s7 === 10;
  const sig: BodyId | null = gender ? (gender === 'm' ? 'moon' : 'sun') : null;
  const east = sig ? [10, 11, 12, 4, 5, 6].includes(P[sig].house) : null;
  const multi = sig ? BICORP.includes(P[sig].sign) : false;
  const late = satIn7 || satRules || east === false, early = east === true;
  const timing = early && late
    ? `Zamanlama konusunda teknikler ikiye ayrılıyor ama birbirini tamamlıyor: hayatına erken yaşta ciddi bir bağ girebilir${multi ? ' ve bu çoğu zaman son bağ olmaz' : ''}; kalıcı evlilik ise daha geç ve daha olgun biriyle gelir.`
    : late ? 'Evlilik acele etmeden, hayatın oturduğu yıllarda gelir.' : early ? `Ciddi bağlar hayatına erken girer${multi ? '; ama ilk bağ çoğu zaman son bağ olmaz' : ''}.` : multi ? 'Hayatında birden fazla derin bağ olabilir.' : '';
  const theme = top && top[1].length >= 2 && THEME[top[0]] ? `Tekniklerin en çok buluştuğu nokta: ${THEME[top[0]]!.tr}. Bu tema ${top[1].length} ayrı yerde tekrar ediyor (${top[1].join(', ')}); haritandaki en güvenilir evlilik bilgisi bu.` : 'Teknikler farklı tonlar gösteriyor; evliliğin tek bir kalıba sığmayan, çok yönlü bir bağ olur.';
  const whyT = [early && late ? `Batlamyus’un kuralı ${nm(sig!).tr} doğu çeyreğinde olduğu için erken bağı, ${satIn7 ? 'yedinci evdeki Satürn' : 'Satürn’ün yedinci eve hükmetmesi'} geç ve olgun evliliği gösteriyor.` : '', 'Yedinci ev, Juno, Navamsa, Upapada ve Batlamyus’un kuralı birlikte tarandı; aynı gezegenin birden fazla teknikte öne çıkması o konuyu güçlendirir.'].filter(Boolean).join(' ');
  return { id: 'msum', title: l('Kısaca evliliğin', 'Your marriage in short'), text: l(`${timing} ${theme}`.trim(), `${theme}`), why: l(whyT, 'Seventh house, Juno, Navamsa, Upapada and Ptolemy’s rule read together.') };
}

// ---------- Alçalanın terim yöneticisi ----------
const TERM_TONE: Record<string, L> = {
  saturn: l('içten içe ağırbaşlı, sabırlı ve sözünün eri; ilk izlenimde mesafeli', 'quietly serious, patient and true to their word; distant at first'),
  jupiter: l('içinde cömert, iyi niyetli ve öğretici bir taraf taşıyan', 'carrying a generous, well-meaning and teaching side'),
  mars: l('içinde savaşçı bir taraf taşıyan, kıskanç ve korumacı', 'carrying a fighter inside; jealous and protective'),
  venus: l('içinde yumuşak, romantik ve zevk sahibi bir taraf taşıyan', 'carrying a soft, romantic and tasteful side'),
  mercury: l('içinde zeki, hesaplı ve oyunbaz bir taraf taşıyan', 'carrying a clever, calculating and playful side'),
};
export function descBound(ch: Chart): SpouseSection | null {
  if (!ch.cusps.length) return null;
  const dsc = ch.cusps[6], tr = termRuler(dsc);
  const tone = TERM_TONE[tr];
  if (!tone) return null;
  const deg = Math.floor(dsc % 30);
  return {
    id: 'bound', title: l('Eşinin gizli tarafı', 'Your spouse’s hidden side'),
    text: l(`Dışarıdan görünenin altında, eşin ${tone.tr} biri. Bu yan, ilişki ilerledikçe ortaya çıkar.`, `Beneath what shows, your spouse is ${tone.en}. This side emerges as the relationship deepens.`),
    why: l(`Alçalanın ${SIGNS[Math.floor(dsc / 30)].tr} burcunun ${deg}. derecesinde. Klasik astrolojide her burç “terim” denen beş parçaya bölünür; alçalanın düştüğü terimin yöneticisi (${nm(tr).tr}) eşin ilk bakışta görünmeyen tonunu verir. Tablo: Batlamyus terimleri (Lilly).`,
      `Your Descendant is ${SIGNS[Math.floor(dsc / 30)].en} ${deg}°. In classical astrology each sign is split into five “terms”; the ruler of the term holding the Descendant (${nm(tr).en}) gives the spouse’s hidden tone. Table: Ptolemaic terms (Lilly).`),
  };
}

// ---------- Lilly: yön ve mesafe ----------
const DIR: L[] = [
  l('doğu', 'east'), l('güney, biraz doğu', 'south by east'), l('batı, biraz güney', 'west by south'), l('kuzey', 'north'),
  l('doğu, biraz kuzey', 'east by north'), l('güney, biraz batı', 'south by west'), l('batı', 'west'), l('kuzey, biraz doğu', 'north by east'),
  l('doğu, biraz güney', 'east by south'), l('güney', 'south'), l('batı, biraz kuzey', 'west by north'), l('kuzey, biraz batı', 'north by west'),
];
export function spouseDirection(ch: Chart): SpouseSection | null {
  if (!ch.cusps.length) return null;
  const s7 = Math.floor(ch.cusps[6] / 30), r = SIGN_RULERS[s7], h = ch.positions[r].house;
  const ang = [1, 4, 7, 10].includes(h), suc = [2, 5, 8, 11].includes(h);
  const far = [3, 9, 12].includes(h);
  const dist = ang ? l('yakın çevrenden, aynı şehirden ya da sık gittiğin bir yerden', 'from close by: your own city or a place you often go')
    : suc ? l('orta mesafeden: aynı ülkenin başka bir şehrinden ya da ortak bir çevreden', 'from a middle distance: another city in your country, or a shared circle')
      : l('uzaktan: başka bir şehirden ya da ülkeden', 'from far away: another city or country');
  return {
    id: 'direction', title: l('Hangi yönden, ne kadar uzaktan?', 'From which direction, how far?'),
    text: l(`Eşin doğduğun yere göre ${DIR[s7].tr} yönünden ve ${dist.tr} çıkar.${far ? ' Yabancı biri ya da farklı bir kültürden gelmesi de mümkün.' : ''}`,
      `Your spouse comes from the ${DIR[s7].en} of where you were born, and ${dist.en}.${far ? ' They may also be a foreigner or from another culture.' : ''}`),
    why: l(`William Lilly’nin kuralı: yönü 7. evin burcu (${SIGNS[s7].tr}), mesafeyi 7. evin yöneticisinin (${nm(r).tr}) bulunduğu ev (${h}. ev, ${ang ? 'köşe ev: yakın' : suc ? 'ardıl ev: orta' : 'düşen ev: uzak'}) verir.`,
      `William Lilly’s rule: the sign on the 7th (${SIGNS[s7].en}) gives the direction, and the house of its ruler (${nm(r).en}, house ${h}, ${ang ? 'angular: near' : suc ? 'succedent: middle' : 'cadent: far'}) gives the distance.`),
  };
}

/** Bölümün tamamı: sırasıyla gösterilecek derin bölümler */
export function deepSpouse(ch: Chart, gender?: 'f' | 'm' | null): SpouseSection[] {
  const out: (SpouseSection | null)[] = [
    gender ? ptolemyMarriage(ch, gender) : null,
    darakaraka(ch),
    darakarakaJob(ch),
    navamsaSpouse(ch),
    upapada(ch),
    descBound(ch),
    spouseDirection(ch),
  ];
  return out.filter((x): x is SpouseSection => !!x);
}
