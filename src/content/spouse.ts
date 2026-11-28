// Gelecekteki eş tahmini: haritanın evlilik göstergelerinden akıcı bir portre.
// Kullanılan göstergeler: 7. ev burcu (partner noktası), 7. evin yönetici gezegeni (burcu ve evi),
// 7. evdeki gezegenler, Venüs (kadın ve erkek haritası farkı gözetmeden), Juno, Vertex ve Satürn bağlantıları.
// Metinler özgündür; kesin hüküm değil, eğilim anlatır.
import type { BodyId, Chart } from '../engine/astro';
import { SIGN_RULERS, angleDiff, houseOf, norm } from '../engine/astro';
import { lots } from '../engine/techniques';
import { L, SIGNS, HOUSES, SIGN_ADVERB } from './base';
import { LILLY_SIGN_FORM, LILLY_PLANET_FORM } from './lilly';
import { lifeTimeline, Window, PersonCtx } from '../engine/timeline';

const l = (tr: string, en: string): L => ({ tr, en });
type Lang = 'tr' | 'en';
const low = (s: string, lang: Lang) => (lang === 'tr' ? (s[0] === 'İ' ? 'i' : s[0] === 'I' ? 'ı' : s[0].toLocaleLowerCase('tr')) + s.slice(1) : s[0].toLowerCase() + s.slice(1));

export interface SpouseSection { id: string; title: L; text: L; why: L }

/** Partnerin karakteri: 7. ev burcu */
export const CHAR: L[] = [
  l('enerjik, cesur ve girişken; kararlarını hızlı veren, rekabeti seven ve seni harekete geçiren biri', 'energetic, brave and enterprising; quick to decide, fond of a challenge and someone who gets you moving'),
  l('sakin, sadık ve güven veren; sözünün eri, konforu ve güzel şeyleri seven, acele etmeyen biri', 'calm, loyal and reassuring; true to their word, fond of comfort and beautiful things, never in a hurry'),
  l('zeki, konuşkan ve meraklı; esprili, genç ruhlu ve seninle her konuda sohbet edebilen biri', 'clever, talkative and curious; witty, young at heart and able to talk with you about anything'),
  l('şefkatli, koruyucu ve aile odaklı; duygularını önemseyen, evini ve sevdiklerini kollayan biri', 'caring, protective and family-minded; someone who values feelings and looks after home and loved ones'),
  l('sıcak, cömert ve karizmatik; girdiği ortamda fark edilen, sevgisini gösterişli jestlerle ifade eden biri', 'warm, generous and charismatic; noticed in every room and expressing love with grand gestures'),
  l('düzenli, yardımsever ve titiz; sevgisini küçük ama anlamlı işlerle gösteren, sorumluluk sahibi biri', 'organised, helpful and careful; showing love through small but meaningful acts, a responsible person'),
  l('zarif, nazik ve uyumlu; adaleti önemseyen, estetik zevki gelişmiş ve kavgadan hoşlanmayan biri', 'graceful, kind and agreeable; someone who values fairness, has refined taste and dislikes conflict'),
  l('yoğun, tutkulu ve derin; az konuşan ama çok hisseden, sadakati her şeyin üstünde tutan biri', 'intense, passionate and deep; says little but feels a lot, putting loyalty above everything'),
  l('iyimser, özgür ruhlu ve maceracı; seyahati, öğrenmeyi ve hayatın anlamını konuşmayı seven biri', 'optimistic, free-spirited and adventurous; someone who loves travel, learning and talking about life'),
  l('ciddi, hırslı ve güvenilir; hedefleri olan, sorumluluk alan ve zamanla daha da değerlenen biri', 'serious, ambitious and dependable; someone with goals who takes responsibility and grows in worth over time'),
  l('özgün, bağımsız ve arkadaş canlısı; sıra dışı fikirleri olan ve sana alan tanıyan biri', 'original, independent and friendly; someone with unusual ideas who gives you space'),
  l('hassas, romantik ve sezgisel; sanata, müziğe ya da maneviyata yakın, empati yeteneği yüksek biri', 'sensitive, romantic and intuitive; close to art, music or spirituality, with great empathy'),
];

/** 7. ev yöneticisinin bulunduğu ev: partnerin hayatı ve nerede tanışırsınız */
const RULER_HOUSE: { life: L; meet: L }[] = [
  { life: l('Partnerin hayatına çok güçlü bir şekilde girer ve senin kimliğini de etkiler; birbirinize benzediğiniz söylenebilir.', 'Your partner enters your life strongly and shapes your identity too; people may say you resemble each other.'),
    meet: l('Tanışmanız çok doğal olur; büyük ihtimalle onu sen fark edersin ya da sen bir adım atarsın.', 'You meet in a very natural way; most likely you notice them or take the first step.') },
  { life: l('Partnerin maddi güvenliğe önem veren biridir; para, birikim ya da ticaretle ilgili bir işi olabilir.', 'Your partner values financial security; they may work with money, savings or trade.'),
    meet: l('Alışveriş, iş anlaşmaları, sanat ya da yeme-içme ortamlarında tanışma ihtimali yüksek.', 'You are likely to meet through shopping, business deals, art or dining.') },
  { life: l('Partnerin iletişimle, yazıyla, eğitimle, satışla ya da ulaşımla ilgili bir işte olabilir.', 'Your partner may work in communication, writing, teaching, sales or transport.'),
    meet: l('Yakın çevren, okul, kurs, mahalle, sosyal medya ya da bir kardeşin aracılığıyla tanışabilirsin.', 'You may meet through your neighbourhood, school, a course, social media or a sibling.') },
  { life: l('Partnerin aile bağları güçlü, evine düşkün biridir; emlak, gıda ya da aile işiyle ilgili olabilir.', 'Your partner has strong family ties and loves home; they may be in real estate, food or a family business.'),
    meet: l('Aile çevresi, akrabalar ya da ev ortamı aracılığıyla tanışma ihtimali yüksek.', 'You are likely to meet through family, relatives or a home setting.') },
  { life: l('Partnerin yaratıcı, eğlenceli ve çocuklarla arası iyi biridir; sanat, eğlence, spor ya da eğitimle ilgili olabilir.', 'Your partner is creative, fun and good with children; they may be in art, entertainment, sport or education.'),
    meet: l('Bir etkinlikte, partide, hobi kursunda ya da tatilde, flört havasında tanışırsınız.', 'You meet at an event, a party, a hobby class or on holiday, in a flirtatious mood.') },
  { life: l('Partnerin çalışkan, düzenli ve hizmet odaklıdır; sağlık, bakım, teknik ya da ofis işlerinde olabilir.', 'Your partner is hard-working, orderly and service-minded; they may work in health, care, technical or office jobs.'),
    meet: l('İş yerinde, spor salonunda ya da günlük rutininin içinde, yavaş yavaş gelişen bir tanışma.', 'You meet at work, the gym or in your daily routine, with a slowly growing connection.') },
  { life: l('Partnerin ilişkiye ve ortaklığa çok değer veren biridir; danışmanlık, hukuk, tasarım ya da insan ilişkileri gerektiren bir işte olabilir.', 'Your partner values partnership deeply; they may work in consulting, law, design or people-facing roles.'),
    meet: l('Biri sizi tanıştırabilir ya da iş birliği, ortaklık gibi bire bir bir ilişki içinde tanışırsınız.', 'Someone may introduce you, or you meet in a one-on-one setting such as a collaboration.') },
  { life: l('Partnerin derin, gizemli ve güçlü biridir; finans, psikoloji, araştırma ya da kriz yönetimi gibi alanlarda olabilir.', 'Your partner is deep, mysterious and strong; they may work in finance, psychology, research or crisis management.'),
    meet: l('Yoğun bir dönemde, bir değişim ya da kriz anında, hayatını dönüştüren bir karşılaşma.', 'During an intense time, a change or a crisis, in a meeting that transforms your life.') },
  { life: l('Partnerin farklı bir şehirden, kültürden ya da ülkeden olabilir; eğitimli, gezgin ve fikir sahibi biridir.', 'Your partner may be from another city, culture or country; educated, well-travelled and opinionated.'),
    meet: l('Seyahatte, yurt dışında, üniversitede ya da bir eğitim ortamında tanışma ihtimali yüksek.', 'You are likely to meet while travelling, abroad, at university or in an educational setting.') },
  { life: l('Partnerin kariyer sahibi, statüsü ve toplumsal saygınlığı olan biridir; kendi alanında tanınabilir.', 'Your partner has a career, status and public respect; they may be well known in their field.'),
    meet: l('İş çevresinde, kariyerinle ilgili bir ortamda ya da profesyonel bir etkinlikte tanışırsınız.', 'You meet through work, a career-related setting or a professional event.') },
  { life: l('Partnerin geniş bir sosyal çevresi olan, ideallerine bağlı ve arkadaş gibi biridir; teknoloji ya da topluluk işleriyle ilgili olabilir.', 'Your partner has a wide social circle, is loyal to ideals and is friend-like; they may work in tech or community work.'),
    meet: l('Arkadaş grubu, ortak tanıdıklar, online platformlar ya da bir topluluk aracılığıyla; çoğu zaman arkadaşlıktan aşka.', 'Through friends, mutual acquaintances, online platforms or a community; often friends first.') },
  { life: l('Partnerin hassas, içe dönük ve ruhsal yanı güçlü biridir; sağlık, sanat, yardım kuruluşları ya da perde arkası işlerde olabilir.', 'Your partner is sensitive, private and spiritual; they may work in health, art, charities or behind the scenes.'),
    meet: l('Beklenmedik, neredeyse gizli bir şekilde tanışırsınız; ilişki başta sessiz ilerleyebilir.', 'You meet unexpectedly, almost secretly; the relationship may move quietly at first.') },
];

export function ageHint(ch: Chart, r7: BodyId, s7: number): L | null {
  const P = ch.positions;
  const satIn7 = P.saturn.house === 7, satRules = r7 === 'saturn' || s7 === 9 || s7 === 10;
  const satVenus = [0, 90, 180].some(x => Math.abs(angleDiff(P.saturn.lon, P.venus.lon) - x) <= 6);
  if (satIn7 || satRules) return l('Eşinin senden yaşça büyük ya da yaşından olgun biri olma ihtimali yüksek. Ciddi bir bağlılık için acele etmezsin; evlilik genellikle hayatın biraz daha oturduğu yıllarda gelir.', 'Your partner is likely older than you or mature beyond their years. You don’t rush serious commitment; marriage tends to come once life is more settled.');
  if (r7 === 'mercury' || s7 === 2 || s7 === 5 || P.mercury.house === 7) return l('Eşin yaşıtın ya da senden biraz genç olabilir; genç ruhlu, öğrenmeye açık biri.', 'Your partner may be your age or a little younger; young at heart and eager to learn.');
  if (satVenus) return l('Aşkta ciddiyet ve güven ararsın; ilişkilerin yavaş başlar ama kalıcı olur. Kendinden büyük birine çekilme eğilimin olabilir.', 'You look for seriousness and trust in love; relationships start slowly but last. You may be drawn to someone older.');
  return null;
}
function foreignHint(ch: Chart, r7: BodyId, s7: number): L | null {
  const P = ch.positions;
  if (s7 === 8 || P[r7].house === 9 || P.jupiter.house === 7 || r7 === 'jupiter') return l('Eşinle aranızda kültür, şehir ya da yaşam tarzı farkı olabilir; ilişki sana yeni ufuklar açar.', 'There may be a difference in culture, city or lifestyle between you; the relationship widens your horizons.');
  if (P.uranus.house === 7 || s7 === 10) return l('Sıra dışı, alışılmadık bir ilişki yaşayabilirsin; partnerin çevrene göre “farklı” biri olabilir.', 'You may have an unconventional relationship; your partner may seem “different” to those around you.');
  return null;
}

/** Evlilik zamanına dair en güçlü gelecek dönemler */
export function marriageWindows(ch: Chart, now = new Date(), n = 3, all?: Window[], person: PersonCtx = {}): Window[] {
  const list = (all ?? lifeTimeline(ch, { fromAge: 16, toAge: 75, ...person })).filter(w => w.topic === 'love' && w.end > now);
  const horizon = now.getTime() + 20 * 365.25 * 864e5;
  const near = list.filter(w => w.start.getTime() < horizon);
  // Önce kaç tekniğin buluştuğu, sonra puan: birden çok yöntemin aynı döneme işaret etmesi en güvenilir göstergedir
  const rank = (w: Window) => w.techs.length * 4 + w.score + (w.calib?.length ?? 0) * 2;
  return (near.length ? near : list).sort((a, b) => rank(b) - rank(a)).slice(0, n).sort((a, b) => a.start.getTime() - b.start.getTime());
}

/** Kader noktası (Vertex) ve Evlilik noktası (Arap noktası): doğum saati gerekir */
export function fateSections(ch: Chart, gender?: 'f' | 'm' | null): SpouseSection[] {
  if (ch.asc === null || !ch.cusps.length) return [];
  const out: SpouseSection[] = [];
  if (ch.vertex !== null) {
    const sg = Math.floor(ch.vertex / 30), h = houseOf(ch.vertex, ch.cusps);
    const meet = RULER_HOUSE[h - 1]?.meet;
    out.push({ id: 'vertex', title: l('Kader gibi karşılaşmaların', 'Your fated meetings'),
      text: l(`Vertex, astrolojide “hayatın karşına çıkardığı kişiler” noktası olarak bilinir. Senin Vertex’in ${SIGNS[sg].tr} burcunda: hayatını değiştiren karşılaşmalar çoğu zaman ${CHAR[sg].tr.split(';')[0]} insanlarla olur.${meet ? ` Bu nokta ${h}. evinde, yani böyle karşılaşmalar şöyle gelişir: ${low(meet.tr, 'tr')}` : ''}`,
        `The Vertex is known in astrology as the point of “the people life brings to you”. Yours is in ${SIGNS[sg].en}: life-changing meetings often happen with people who are ${CHAR[sg].en.split(';')[0]}.${meet ? ` It sits in house ${h}, so such meetings tend to unfold like this: ${low(meet.en, 'en')}` : ''}`),
      why: l('Vertex, doğum yeri ve saatine göre hesaplanan bir eksen noktasıdır; Ay düğümleri, tutulmalar ya da Venüs bu noktaya değdiğinde önemli tanışmalar beklenir. Bu tarihler “Ne zaman?” bölümünde hesaba katılır.', 'The Vertex is an axis point calculated from your birth place and time; important meetings are expected when the nodes, eclipses or Venus touch it. These dates are included under “When?”.') });
  }
  const P = ch.positions;
  const lot = gender === 'f' ? norm(ch.asc + P.saturn.lon - P.venus.lon) : lots(ch).find(x => x.id === 'marriage')?.lon;
  if (lot !== undefined) {
    const sg = Math.floor(lot / 30), h = houseOf(lot, ch.cusps);
    out.push({ id: 'lot', title: l('Evlilik noktan', 'Your Lot of Marriage'),
      text: l(`Antik astrolojide evliliği gösteren özel bir nokta vardır. Seninki ${SIGNS[sg].tr} burcunda: evliliğini ${SIGN_ADVERB[sg].tr} bir biçimde yaşarsın. Bu nokta ${h}. evinde; evlilik konusu hayatında en çok ${HOUSES[h - 1].area.tr} ile bağlantılıdır.`,
        `Ancient astrology uses a special point for marriage. Yours is in ${SIGNS[sg].en}: you live marriage ${SIGN_ADVERB[sg].en}. It sits in house ${h}, so marriage is linked most with ${HOUSES[h - 1].area.en} in your life.`),
      why: l(gender === 'f' ? 'Kadın haritasında Yükselen + Satürn − Venüs formülüyle hesaplanır (Valens). Jüpiter ya da Venüs bu noktaya ulaştığında evlilik için güçlü bir dönem sayılır.' : 'Yükselen + Venüs − Satürn formülüyle hesaplanır (Valens; kadın haritasında formül ters çevrilir, cinsiyet eklersen ona göre hesaplanır). Jüpiter ya da Venüs bu noktaya ulaştığında evlilik için güçlü bir dönem sayılır.',
        gender === 'f' ? 'In a woman’s chart it is Ascendant + Saturn − Venus (Valens). When Jupiter or Venus reaches it, it counts as a strong time for marriage.' : 'Calculated as Ascendant + Venus − Saturn (Valens; reversed for a woman’s chart, so adding gender refines it). When Jupiter or Venus reaches it, it counts as a strong time for marriage.') });
  }
  return out;
}

export function spouseProfile(ch: Chart, lang: Lang): SpouseSection[] | null {
  if (!ch.cusps.length) return null;
  const P = ch.positions;
  const s7 = Math.floor(ch.cusps[6] / 30);
  const r7 = SIGN_RULERS[s7];
  const rp = P[r7];
  const in7 = (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'] as BodyId[]).filter(p => P[p].house === 7);
  const out: SpouseSection[] = [];
  const name = (id: BodyId) => ({ sun: l('Güneş', 'the Sun'), moon: l('Ay', 'the Moon'), mercury: l('Merkür', 'Mercury'), venus: l('Venüs', 'Venus'), mars: l('Mars', 'Mars'), jupiter: l('Jüpiter', 'Jupiter'), saturn: l('Satürn', 'Saturn'), uranus: l('Uranüs', 'Uranus'), neptune: l('Neptün', 'Neptune'), pluto: l('Plüton', 'Pluto') } as Record<string, L>)[id] ?? l(id, id);

  // 1. Nasıl biri?
  const mix = s7 !== rp.sign ? (lang === 'tr' ? ` Buna ${SIGNS[rp.sign].tr} burcunun tonu da karışır: ${CHAR[rp.sign].tr.split(';')[0]}.` : ` The tone of ${SIGNS[rp.sign].en} blends in too: ${CHAR[rp.sign].en.split(';')[0]}.`) : '';
  out.push({ id: 'who', title: l('Yedinci evin anlattığı kişi: ilk izlenim', 'The person your seventh house describes: first impression'),
    text: l(`Haritan, hayatına girecek ciddi partnerin ${CHAR[s7].tr} olacağını gösteriyor.${mix}`, `Your chart suggests your serious partner will be ${CHAR[s7].en}.${mix}`),
    why: l(`Partnerini temsil eden yedinci evin ${SIGNS[s7].tr} burcuyla başlaması ve bu evin gezegeninin (${name(r7).tr}) ${SIGNS[rp.sign].tr} burcunda olması.`, `Your seventh house, which represents your partner, begins in ${SIGNS[s7].en}, and its planet (${name(r7).en}) is in ${SIGNS[rp.sign].en}.`) });

  // 2. Görünüşü
  const strip = (x?: string) => (x ?? '').replace(/^[^:]{2,20}:\s*/, '');
  const signLook = strip(LILLY_SIGN_FORM[s7][lang]), planetLook = strip(LILLY_PLANET_FORM[r7]?.[lang]);
  const lk = mergeLook(strip(LILLY_SIGN_FORM[s7].tr), strip(LILLY_PLANET_FORM[r7]?.tr));
  if (signLook) out.push({ id: 'look', title: l('Görünüşü', 'Their appearance'),
    text: l(`Partnerin için öne çıkan tarif: ${lk.text}.${lk.agree.length ? ` İki kaynağın da aynı şeyi söylediği, en güvenilir özellikler: ${lk.agree.join(', ')}.` : ''}${lk.conflict ? ' Boy konusunda kaynaklar ayrıldığı için ortalamayı aldım.' : ''}`,
      `In traditional astrology a partner’s looks are read from the seventh house sign and that house’s planet. For your chart this description stands out: ${low(signLook, 'en').replace(/\.$/, '')}.${planetLook ? ` The planet that represents your partner adds: ${low(planetLook, 'en')}` : ''}`),
    why: l(`Geleneksel astrolojide partnerin görünüşü yedinci evin burcundan (${SIGNS[s7].tr}) ve o evin yöneticisinden (${name(r7).tr}) okunur; iki tarif birleştirildi. Tarifler eğilim gösterir: gerçek kişi bunların hepsini değil, bir kısmını taşır.`, `In traditional astrology a partner’s looks are read from the seventh house sign (${SIGNS[s7].en}) and its ruler (${name(r7).en}); both descriptions are combined. They show tendencies: the real person carries some of these traits, not all.`) });

  // 3. Hayatı ve işi
  if (rp.house) out.push({ id: 'life', title: l('Hayat tarzı', 'Their way of life'),
    text: RULER_HOUSE[rp.house - 1].life,
    why: l(`Partnerini temsil eden gezegen (${name(r7).tr}) haritanın ${rp.house}. evinde duruyor.`, `The planet that represents your partner (${name(r7).en}) sits in house ${rp.house} of your chart.`) });

  // 4. Nerede tanışırsınız
  if (rp.house) out.push({ id: 'meet', title: l('Nerede tanışırsınız?', 'Where will you meet?'),
    text: RULER_HOUSE[rp.house - 1].meet,
    why: l('Tanışma yeri, partnerini temsil eden gezegenin bulunduğu evden okunur.', 'The meeting place is read from the house of the planet that represents your partner.') });

  // 5. Yaş, kültür, ilişkinin rengi
  const age = ageHint(ch, r7, s7);
  const extra = [age, foreignHint(ch, r7, s7)].filter(Boolean) as L[];
  const in7t: Partial<Record<BodyId, L>> = {
    sun: l('Eşin güçlü bir kişiliğe sahip, kendine güvenen ve parlayan biri olur.', 'Your partner has a strong, confident, radiant personality.'),
    moon: l('Eşinle aranızda derin bir duygusal bağ olur; ilişki ruh hâlini çok etkiler.', 'You share a deep emotional bond; the relationship strongly affects your mood.'),
    mercury: l('Konuşabildiğin, zihnen uyuştuğun biriyle evlenme eğilimin var.', 'You tend to marry someone you can talk to and who matches your mind.'),
    venus: l('Evlilik için çok uyumlu bir işaret: ilişkin sevgi dolu ve uyumlu olur.', 'A very harmonious sign for marriage: your relationship is loving and agreeable.'),
    mars: l('Tutkulu ama zaman zaman tartışmalı bir ilişki; eşin güçlü ve iddialı biri.', 'A passionate but sometimes argumentative relationship; your partner is strong and assertive.'),
    jupiter: l('Evlilikte şanslı sayılırsın; eşin cömert, bilge ve hayatını genişleten biri.', 'You are considered lucky in marriage; your partner is generous, wise and broadens your life.'),
    saturn: l('Evlilik geç ama sağlam gelir; zamanla güçlenen, kalıcı bir bağ.', 'Marriage comes later but solidly; a lasting bond that grows stronger with time.'),
    uranus: l('İlişki beklenmedik bir şekilde başlar; özgürlüğüne saygı duyan biri gerekir.', 'The relationship starts unexpectedly; you need someone who respects your freedom.'),
    neptune: l('Ruh eşi gibi hissettiren bir bağ; eşini idealize etmemeye dikkat et.', 'A soulmate-like bond; be careful not to idealise your partner.'),
    pluto: l('Kader gibi hissettiren, seni derinden dönüştüren yoğun bir ilişki.', 'An intense, fated-feeling relationship that transforms you deeply.'),
  };
  const ageSat = ch.positions.saturn.house === 7 || r7 === 'saturn' || s7 === 9 || s7 === 10;
  in7.forEach(p => { if (p === 'saturn' && ageSat) { const k = age ? extra.indexOf(age) : -1; const m = l('Eşinin senden yaşça büyük ya da yaşından olgun biri olma ihtimali yüksek. Evlilik geç ama sağlam gelir: acele etmezsin, bağ zamanla güçlenir ve kalıcı olur.', 'Your spouse is likely older or mature for their age. Marriage comes late but solidly: you don’t rush, and the bond grows stronger and lasts.'); if (k >= 0) extra[k] = m; else extra.unshift(m); return; } if (in7t[p]) extra.push(in7t[p]!); });
  if (P.juno) extra.push(l(`Uzun süreli bağlılıkta aradığın şeyi gösteren Juno ${SIGNS[P.juno.sign].tr} burcunda: eşinde ${CHAR[P.juno.sign].tr.split(';')[0]} birini ararsın.`, `Juno, which shows what you seek in commitment, is in ${SIGNS[P.juno.sign].en}: you look for someone ${CHAR[P.juno.sign].en.split(';')[0]}.`));
  if (extra.some(x => x.tr)) out.push({ id: 'colour', title: l('İlişkinin rengi', 'The colour of the relationship'),
    text: { tr: extra.filter(x => x.tr).map(x => x.tr).join(' '), en: extra.filter(x => x.en).map(x => x.en).join(' ') },
    why: l(`Yedinci evdeki gezegenler${in7.length ? ` (${in7.map(p => name(p).tr).join(', ')})` : ''}, Satürn ve Jüpiter bağlantıları ile Juno’nun burcu.`, `Planets in the seventh house${in7.length ? ` (${in7.map(p => name(p).en).join(', ')})` : ''}, Saturn and Jupiter links, and Juno’s sign.`) });

  return out;
}

// ---------------- Eş arketipi: kadın haritasında Güneş, erkek haritasında Ay ----------------
// Klasik astrolojide eşi temsil eden "ışık" kadın haritasında Güneş, erkek haritasında Ay'dır.
// Burcu eşin karakterini ve meslek eğilimlerini, evi ise eşin hayatının hangi alanında etkili olacağını anlatır.
export const SPOUSE_ARCH: { char: L; jobs: L }[] = [
  { char: l('cesur, girişken ve rekabetçi; kararlarını hızlı veren, korumacı ve lider ruhlu biri', 'brave, enterprising and competitive; quick to decide, protective and a natural leader'),
    jobs: l('spor, askerlik veya güvenlik, mühendislik, cerrahi, acil sağlık hizmetleri ya da kendi işini kurmak', 'sport, the military or security, engineering, surgery, emergency services or running their own business') },
  { char: l('sakin, sadık ve güven veren; maddi güvenliğe önem veren, keyif ve konforu seven biri', 'calm, loyal and reassuring; values financial security and enjoys comfort'),
    jobs: l('bankacılık, finans, gayrimenkul, tarım, gastronomi, mimari, güzellik ya da sanatla ilgili işler', 'banking, finance, real estate, farming, food, architecture, beauty or the arts') },
  { char: l('zeki, konuşkan ve meraklı; esprili, hareketli ve çok yönlü biri', 'clever, talkative and curious; witty, lively and versatile'),
    jobs: l('medya, iletişim, satış, pazarlama, eğitim, yazarlık, ulaşım ya da teknoloji', 'media, communications, sales, marketing, teaching, writing, transport or technology') },
  { char: l('duygusal, korumacı, ailesine düşkün ve şefkatli; sevdiklerine sahip çıkan, ilişkide güven ve aidiyet arayan biri', 'emotional, protective, devoted to family and caring; stands by loved ones and seeks trust and belonging'),
    jobs: l('aile işletmeleri, gayrimenkul, gastronomi, psikoloji, sağlık, otelcilik ya da emlak', 'family businesses, real estate, food, psychology, health, hospitality or property') },
  { char: l('karizmatik, cömert ve gururlu; sevgisini büyük jestlerle gösteren, girdiği ortamda fark edilen biri', 'charismatic, generous and proud; shows love with grand gestures and stands out in any room'),
    jobs: l('yöneticilik, sahne ve eğlence sektörü, sanat, moda, organizasyon, çocuklarla çalışma ya da kendi markası', 'management, stage and entertainment, art, fashion, events, working with children or their own brand') },
  { char: l('düzenli, çalışkan ve yardımsever; sevgisini küçük ama anlamlı işlerle gösteren, detaycı biri', 'orderly, hard-working and helpful; shows love through small but meaningful acts, detail-minded'),
    jobs: l('sağlık, eczacılık, beslenme, muhasebe, analiz, editörlük, idari işler ya da teknik uzmanlık', 'health, pharmacy, nutrition, accounting, analysis, editing, administration or technical expertise') },
  { char: l('zarif, nazik ve uyumlu; adaleti önemseyen, estetik zevki gelişmiş ve kavgadan hoşlanmayan biri', 'graceful, kind and agreeable; values fairness, has refined taste and avoids conflict'),
    jobs: l('hukuk, diplomasi, danışmanlık, tasarım, moda, güzellik, insan kaynakları ya da halkla ilişkiler', 'law, diplomacy, consulting, design, fashion, beauty, human resources or public relations') },
  { char: l('yoğun, tutkulu ve kararlı; az konuşan ama çok hisseden, sadakati her şeyin üstünde tutan biri', 'intense, passionate and determined; says little but feels deeply, putting loyalty above all'),
    jobs: l('finans, yatırım, psikoloji, araştırma, cerrahi, güvenlik, sigortacılık ya da kriz yönetimi', 'finance, investment, psychology, research, surgery, security, insurance or crisis management') },
  { char: l('iyimser, özgür ruhlu ve maceracı; seyahati, öğrenmeyi ve hayatın anlamını konuşmayı seven biri', 'optimistic, free-spirited and adventurous; loves travel, learning and talking about life'),
    jobs: l('akademi, eğitim, hukuk, yayıncılık, turizm, dış ticaret, spor ya da yurt dışıyla bağlantılı işler', 'academia, teaching, law, publishing, tourism, foreign trade, sport or work linked to abroad') },
  { char: l('ciddi, hırslı ve sorumluluk sahibi; hedefleri olan, güven veren ve zamanla daha da değerlenen biri', 'serious, ambitious and responsible; goal-driven, reassuring and growing in worth over time'),
    jobs: l('yöneticilik, kamu kurumları, mühendislik, inşaat, finans, hukuk ya da köklü şirketlerde kariyer', 'management, public institutions, engineering, construction, finance, law or a career in established firms') },
  { char: l('özgün, bağımsız ve arkadaş canlısı; sıra dışı fikirleri olan, özgürlüğüne düşkün biri', 'original, independent and friendly; full of unusual ideas and fond of freedom'),
    jobs: l('teknoloji, yazılım, bilim, havacılık, sosyal girişimcilik, sivil toplum ya da dijital medya', 'technology, software, science, aviation, social enterprise, non-profits or digital media') },
  { char: l('hassas, romantik ve sezgisel; empati yeteneği yüksek, sanata ya da maneviyata yakın biri', 'sensitive, romantic and intuitive; highly empathetic, close to art or spirituality'),
    jobs: l('sağlık, psikoloji, müzik, sinema, fotoğraf, denizcilik, yardım kuruluşları ya da şifa alanları', 'health, psychology, music, film, photography, maritime work, charities or healing fields') },
];
const ARCH_HOUSE: L[] = [
  l('Eşin kimliğini ve dış görünüşünü güçlü biçimde etkiler; çevren sizi bir bütün olarak görür.', 'Your spouse strongly shapes your identity and image; people see you as a unit.'),
  l('Eşin maddi hayatında belirleyici olur; birlikte birikim yapmak ve güvence kurmak öne çıkar.', 'Your spouse plays a decisive role in your finances; building savings and security together comes first.'),
  l('Eşinle iletişim çok önemli olur; yakın çevre, okul ya da günlük hayat üzerinden hayatına girer.', 'Communication with your spouse matters a lot; they enter your life through your circle, school or daily routine.'),
  l('Eşin ev ve aile hayatının merkezinde olur; yuva kurmak ilişkinin ana amacıdır.', 'Your spouse is at the heart of your home life; building a home is the relationship’s main aim.'),
  l('Eşin hayatına neşe, romantizm ve yaratıcılık getirir; çocuklar konusu ilişkide önemli yer tutar.', 'Your spouse brings joy, romance and creativity; children may play an important role.'),
  l('Eşin günlük düzenini ve iş hayatını etkiler; iş ortamında ya da rutinin içinde tanışabilirsiniz.', 'Your spouse affects your daily routine and work; you may meet at work or in your routine.'),
  l('Evlilik hayatında çok belirleyici bir yer tutar; ortaklık ve eşitlik ilişkinin temeli olur.', 'Marriage holds a defining place in your life; partnership and equality are the foundation.'),
  l('Eşinle derin ve dönüştürücü bir bağ kurarsın; ortak para ve güven konuları öne çıkar.', 'You form a deep, transforming bond; shared money and trust matter.'),
  l('Eşin ufkunu genişletir; farklı bir şehirden ya da kültürden olabilir, birlikte seyahat edebilirsiniz.', 'Your spouse widens your horizons; they may come from another city or culture, and you may travel together.'),
  l('Eşin kariyerini ve toplumdaki yerini etkiler; statülü biri olabilir ya da iş çevrende tanışabilirsiniz.', 'Your spouse influences your career and standing; they may have status, or you may meet through work.'),
  l('Eşin arkadaşın gibi olur; arkadaş çevresi ya da online ortamlar üzerinden tanışabilirsiniz.', 'Your spouse is also your friend; you may meet through friends or online.'),
  l('Eşinle ruhsal bir bağ kurarsın; ilişki başta sessiz ya da gizli ilerleyebilir.', 'You form a spiritual bond; the relationship may move quietly or privately at first.'),
];

/** Eş arketipi: kadınsa Güneş, erkekse Ay. Karakter, meslek ve tanışma ayrı maddelerdir (ayrı kartlarda durur). */
export function spouseArchetypeParts(ch: Chart, gender: 'f' | 'm'): SpouseSection[] {
  const id: BodyId = gender === 'f' ? 'sun' : 'moon';
  const p = ch.positions[id];
  const a = SPOUSE_ARCH[p.sign];
  const planet = gender === 'f' ? l('Güneş', 'the Sun') : l('Ay', 'the Moon');
  const pTr = planet.tr + (gender === 'f' ? '’in' : '’ın');
  const house = p.house ? ARCH_HOUSE[p.house - 1] : null;
  const why = l(`Klasik astrolojide ${gender === 'f' ? 'kadın' : 'erkek'} haritasında eşi ${planet.tr} temsil eder. Senin ${pTr} ${SIGNS[p.sign].tr} burcunda${p.house ? ` ve ${p.house}. evde` : ''}.`,
    `In classical astrology ${planet.en} represents the spouse in a ${gender === 'f' ? 'woman’s' : 'man’s'} chart. Yours is in ${SIGNS[p.sign].en}${p.house ? `, house ${p.house}` : ''}.`);
  const out: SpouseSection[] = [
    { id: 'arch', title: l(`${pTr} anlattığı kişi: yakından tanıdıkça`, `What ${planet.en} describes: up close`), text: l(`Eşin büyük ihtimalle ${a.char.tr} olacak.`, `Your spouse is likely to be ${a.char.en}.`), why },
    { id: 'archjob', title: l(`${planet.tr}${gender === 'f' ? '’e' : '’a'} göre mesleği`, `Work, from ${planet.en}`), text: l(`Mesleği ${a.jobs.tr} gibi alanlarda olabilir.`, `They may work in fields like ${a.jobs.en}.`), why },
  ];
  if (house) out.push({ id: 'archmeet', title: l('Hayatına nasıl girer?', 'How they enter your life'), text: house, why });
  return out;
}

const ELEM = ['fire', 'earth', 'air', 'water'] as const;
const TONE: Record<string, L> = { fire: l('enerjik ve hareketli', 'energetic and active'), earth: l('ayakları yere basan ve güven veren', 'grounded and reassuring'), air: l('konuşkan, meraklı ve sosyal', 'talkative, curious and social'), water: l('duygusal, şefkatli ve koruyucu', 'emotional, caring and protective') };
const DK_ELEM: Record<string, string> = { sun: 'fire', mars: 'fire', jupiter: 'fire', moon: 'water', venus: 'air', mercury: 'air', saturn: 'earth' };
const two = (x: string) => { const w = x.split(';')[0].split(/, | ve /).map(t => t.trim()).filter(Boolean); return w.slice(0, 2).join(' ve '); };
/** Teknikleri birleştiren kısa özet: ilk izlenim (7. ev), yakından (Güneş/Ay), zihin (Darakaraka) ve ortak ton */
export function spouseSummary(ch: Chart, gender: 'f' | 'm' | null | undefined, dk?: { planet: BodyId; who: L }): SpouseSection | null {
  const parts: string[] = [], why: string[] = [], els: string[] = [];
  if (ch.cusps.length) {
    const s7 = Math.floor(ch.cusps[6] / 30), rp = ch.positions[SIGN_RULERS[s7]];
    parts.push(`ilk tanıştığınızda ${two(CHAR[s7].tr)} biri gibi görünür`); why.push('yedinci ev ilk izlenimi');
    els.push(ELEM[s7 % 4], ELEM[rp.sign % 4]);
  }
  if (gender) {
    const p = ch.positions[gender === 'f' ? 'sun' : 'moon'];
    parts.push(`yakından tanıdıkça ${two(SPOUSE_ARCH[p.sign].char.tr)} yanı ortaya çıkar`); why.push(`${gender === 'f' ? 'Güneş' : 'Ay'} yakından tanınan karakteri`);
    els.push(ELEM[p.sign % 4]);
  }
  if (dk) { parts.push(`düşünme ve konuşma biçimi ${two(dk.who.tr)}`); why.push('Darakaraka zihni ve konuşmayı'); els.push(DK_ELEM[dk.planet] ?? 'air'); }
  if (parts.length < 2) return null;
  const cnt = els.reduce((m, e) => m.set(e, (m.get(e) ?? 0) + 1), new Map<string, number>());
  const top = [...cnt.entries()].sort((a, b) => b[1] - a[1]);
  const tone = top[0][1] >= 2 && (!top[1] || top[1][1] < top[0][1])
    ? `Tekniklerin en çok buluştuğu ton: ${TONE[top[0][0]].tr}. Bunu eşinin en belirgin özelliği olarak düşünebilirsin.`
    : top[1] && top[0][1] === top[1][1] && top[0][1] >= 2
      ? `Haritanda iki ton eşit güçte: ${TONE[top[0][0]].tr} bir yan ile ${TONE[top[1][0]].tr} bir yan. Bu bir çelişki değil; eşin çok yönlü biri olur, bir yüzünü dışarıda, diğerini evde gösterir.`
      : 'Teknikler farklı tonlar gösteriyor; eşin tek bir kalıba sığmayan, çok yönlü biri olur.';
  const txt = parts.join('; ');
  return { id: 'sum', title: l('Kısaca eşin', 'Your spouse in short'),
    text: l(`${txt.charAt(0).toLocaleUpperCase('tr') + txt.slice(1)}. ${tone}`, `${txt}. ${tone}`),
    why: l(`Her teknik eşin başka bir yüzünü anlatır: ${why.join(', ')}. Aşağıda her birini ayrı ayrı okuyabilirsin.`, 'Each technique describes a different side of your spouse; read each one below.') };
}

/** Görünüş: burç ve yönetici tariflerini çelişmeyecek şekilde birleştirir (yalnız Türkçe metin) */
function mergeLook(sign: string, planet: string): { text: string; agree: string[]; conflict: boolean } {
  const seg = (x: string) => x.replace(/\.$/, '').replace(/;/g, ',').split(/,\s*/).map(t => t.trim()).filter(Boolean);
  const isH = (t: string) => /boy|kısa|ufak|^uzun( ve| değil|$)|^dik\b|^(düzgün|dik), uzun/i.test(t);
  const height = (xs: string[]) => { const h = xs.filter(isH).join(' ').toLocaleLowerCase('tr'); if (!h) return ''; if (/kısa|ufak|değil|aşmayan/.test(h)) return 'short'; if (/üst|uzun/.test(h)) return 'tall'; return 'mid'; };
  const KEYS: [string, RegExp][] = [['ten', /\bten|tenli/], ['yüz', /yüz/], ['göz', /göz/], ['saç', /saç/], ['beden', /beden|yapılı|yapı\b/]];
  const keyOf = (t: string) => KEYS.find(([, r]) => r.test(t))?.[0];
  const a = seg(sign), b = seg(planet);
  const hA = height(a), hB = height(b);
  const conflict = !!hA && !!hB && ((hA === 'short' && hB === 'tall') || (hA === 'tall' && hB === 'short'));
  const agree = a.filter(x => b.some(y => y.toLocaleLowerCase('tr') === x.toLocaleLowerCase('tr')) && !isH(x)).map(x => x.toLocaleLowerCase('tr'));
  const out: string[] = [];
  if (conflict) out.push('boyu ortalama civarında');
  for (const x of a) { if (conflict && isH(x)) continue; out.push(x); }
  const have = new Set(a.map(keyOf).filter(Boolean));
  for (const y of b) {
    if (isH(y)) { if (!hA && !conflict) out.push(y); continue; }
    const k = keyOf(y); if (k && have.has(k)) continue;
    if (out.some(o => o.toLocaleLowerCase('tr') === y.toLocaleLowerCase('tr'))) continue;
    out.push(y);
  }
  const t = out.join(', ');
  return { text: t.charAt(0).toLocaleLowerCase('tr') + t.slice(1), agree, conflict };
}

/** Eşin mesleği: eşin 10. evi, türetilmiş ev tekniğiyle senin 4. evindir (7. evden 10 ev ileri) */
export function spouseJob(ch: Chart): SpouseSection | null {
  if (!ch.cusps.length) return null;
  const s4 = Math.floor(ch.cusps[3] / 30);
  const in4 = (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as BodyId[]).filter(p => ch.positions[p].house === 4);
  const JOB_PLANET: Partial<Record<BodyId, L>> = {
    sun: l('yöneticilik veya görünür bir pozisyon', 'management or a visible role'), moon: l('halkla ilişkiler, gıda, bakım veya ev ile ilgili işler', 'public-facing work, food, care or home-related work'),
    mercury: l('iletişim, ticaret, yazı veya eğitim', 'communication, trade, writing or teaching'), venus: l('sanat, güzellik, tasarım veya moda', 'art, beauty, design or fashion'),
    mars: l('mühendislik, spor, güvenlik veya teknik işler', 'engineering, sport, security or technical work'), jupiter: l('hukuk, akademi, eğitim veya yurt dışıyla bağlantılı işler', 'law, academia, teaching or work linked to abroad'),
    saturn: l('kamu kurumları, inşaat, yönetim veya uzun soluklu bir kariyer', 'public institutions, construction, management or a long career'),
  };
  const extra = in4.map(p => JOB_PLANET[p]!).filter(Boolean);
  return {
    id: 'job', title: l('Eşinin mesleği', 'Your spouse’s profession'),
    text: l(`Eşinin kariyerine bakmak için haritanın dördüncü evine bakılır, çünkü yedinci evden on ev ileri saydığında eşinin kariyer evine ulaşırsın. Senin dördüncü evin ${SIGNS[s4].tr} burcunda başlıyor; bu, eşinin ${SPOUSE_ARCH[s4].jobs.tr} gibi alanlarda çalışabileceğini gösterir.${extra.length ? ` Bu evdeki gezegenler ${extra.map(x => x.tr).join(', ')} ihtimalini de ekliyor.` : ''}`,
      `To see your spouse’s career, astrology looks at your fourth house: counting ten houses on from the seventh lands on your spouse’s career house. Your fourth house begins in ${SIGNS[s4].en}, suggesting your spouse may work in fields like ${SPOUSE_ARCH[s4].jobs.en}.${extra.length ? ` Planets in this house add ${extra.map(x => x.en).join(', ')}.` : ''}`),
    why: l('Türetilmiş evler tekniği: bir kişinin evlerini, o kişiyi temsil eden evden başlayarak sayarsın.', 'Derived houses: you count a person’s houses starting from the house that represents them.'),
  };
}
