// Gelecekteki eş tahmini: haritanın evlilik göstergelerinden akıcı bir portre.
// Kullanılan göstergeler: 7. ev burcu (partner noktası), 7. evin yönetici gezegeni (burcu ve evi),
// 7. evdeki gezegenler, Venüs (kadın ve erkek haritası farkı gözetmeden), Juno, Vertex ve Satürn bağlantıları.
// Metinler özgündür; kesin hüküm değil, eğilim anlatır.
import type { BodyId, Chart } from '../engine/astro';
import { SIGN_RULERS, angleDiff } from '../engine/astro';
import { L, SIGNS } from './base';
import { LILLY_SIGN_FORM, LILLY_PLANET_FORM } from './lilly';
import { lifeTimeline, Window } from '../engine/timeline';

const l = (tr: string, en: string): L => ({ tr, en });
type Lang = 'tr' | 'en';
const low = (s: string, lang: Lang) => (lang === 'tr' ? (s[0] === 'İ' ? 'i' : s[0] === 'I' ? 'ı' : s[0].toLocaleLowerCase('tr')) + s.slice(1) : s[0].toLowerCase() + s.slice(1));

export interface SpouseSection { id: string; title: L; text: L; why: L }

/** Partnerin karakteri: 7. ev burcu */
const CHAR: L[] = [
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

function ageHint(ch: Chart, r7: BodyId, s7: number): L | null {
  const P = ch.positions;
  const satIn7 = P.saturn.house === 7, satRules = r7 === 'saturn' || s7 === 9 || s7 === 10;
  const satVenus = [0, 90, 180].some(x => Math.abs(angleDiff(P.saturn.lon, P.venus.lon) - x) <= 6);
  if (satIn7 || satRules) return l('Partnerinin senden yaşça büyük ya da yaşından olgun biri olma ihtimali yüksek. Ciddi bir bağlılık için acele etmezsin; evlilik genellikle hayatın biraz daha oturduğu yıllarda gelir.', 'Your partner is likely older than you or mature beyond their years. You don’t rush serious commitment; marriage tends to come once life is more settled.');
  if (r7 === 'mercury' || s7 === 2 || s7 === 5 || P.mercury.house === 7) return l('Partnerin yaşıtın ya da senden biraz genç olabilir; genç ruhlu, öğrenmeye açık biri.', 'Your partner may be your age or a little younger; young at heart and eager to learn.');
  if (satVenus) return l('Aşkta ciddiyet ve güven ararsın; ilişkilerin yavaş başlar ama kalıcı olur. Kendinden büyük birine çekilme eğilimin olabilir.', 'You look for seriousness and trust in love; relationships start slowly but last. You may be drawn to someone older.');
  return null;
}
function foreignHint(ch: Chart, r7: BodyId, s7: number): L | null {
  const P = ch.positions;
  if (s7 === 8 || P[r7].house === 9 || P.jupiter.house === 7 || r7 === 'jupiter') return l('Partnerinle aranızda kültür, şehir ya da yaşam tarzı farkı olabilir; ilişki sana yeni ufuklar açar.', 'There may be a difference in culture, city or lifestyle between you; the relationship widens your horizons.');
  if (P.uranus.house === 7 || s7 === 10) return l('Sıra dışı, alışılmadık bir ilişki yaşayabilirsin; partnerin çevrene göre “farklı” biri olabilir.', 'You may have an unconventional relationship; your partner may seem “different” to those around you.');
  return null;
}

/** Evlilik zamanına dair en güçlü gelecek dönemler */
export function marriageWindows(ch: Chart, now = new Date(), n = 3, all?: Window[]): Window[] {
  const list = (all ?? lifeTimeline(ch, { fromAge: 16, toAge: 75 })).filter(w => w.topic === 'love' && w.end > now);
  const horizon = now.getTime() + 20 * 365.25 * 864e5;
  const near = list.filter(w => w.start.getTime() < horizon);
  return (near.length ? near : list).sort((a, b) => b.score - a.score).slice(0, n).sort((a, b) => a.start.getTime() - b.start.getTime());
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
  out.push({ id: 'who', title: l('Nasıl biri?', 'What are they like?'),
    text: l(`Haritan, hayatına girecek ciddi partnerin ${CHAR[s7].tr} olacağını gösteriyor.${mix}`, `Your chart suggests your serious partner will be ${CHAR[s7].en}.${mix}`),
    why: l(`Partnerini temsil eden yedinci evin ${SIGNS[s7].tr} burcuyla başlaması ve bu evin gezegeninin (${name(r7).tr}) ${SIGNS[rp.sign].tr} burcunda olması.`, `Your seventh house, which represents your partner, begins in ${SIGNS[s7].en}, and its planet (${name(r7).en}) is in ${SIGNS[rp.sign].en}.`) });

  // 2. Görünüşü
  const strip = (x?: string) => (x ?? '').replace(/^[^:]{2,20}:\s*/, '');
  const signLook = strip(LILLY_SIGN_FORM[s7][lang]), planetLook = strip(LILLY_PLANET_FORM[r7]?.[lang]);
  if (signLook) out.push({ id: 'look', title: l('Görünüşü', 'Their appearance'),
    text: l(`Geleneksel astrolojide partnerin dış görünüşü yedinci evin burcundan ve o evin gezegeninden okunur. Senin haritana göre partnerin için şu tarif öne çıkıyor: ${low(signLook, 'tr').replace(/\.$/, '')}.${planetLook ? ` Partnerini temsil eden gezegen de şu özellikleri ekler: ${low(planetLook, 'tr')}` : ''}`,
      `In traditional astrology a partner’s looks are read from the seventh house sign and that house’s planet. For your chart this description stands out: ${low(signLook, 'en').replace(/\.$/, '')}.${planetLook ? ` The planet that represents your partner adds: ${low(planetLook, 'en')}` : ''}`),
    why: l('Görünüş tarifleri eğilim gösterir; gerçek kişi bunlardan bazılarını taşır, hepsini değil.', 'Appearance descriptions show tendencies; the real person will carry some of these traits, not all.') });

  // 3. Hayatı ve işi
  if (rp.house) out.push({ id: 'life', title: l('Hayatı ve işi', 'Their life and work'),
    text: RULER_HOUSE[rp.house - 1].life,
    why: l(`Partnerini temsil eden gezegen (${name(r7).tr}) haritanın ${rp.house}. evinde duruyor.`, `The planet that represents your partner (${name(r7).en}) sits in house ${rp.house} of your chart.`) });

  // 4. Nerede tanışırsınız
  if (rp.house) out.push({ id: 'meet', title: l('Nerede tanışırsınız?', 'Where will you meet?'),
    text: RULER_HOUSE[rp.house - 1].meet,
    why: l('Tanışma yeri, partnerini temsil eden gezegenin bulunduğu evden okunur.', 'The meeting place is read from the house of the planet that represents your partner.') });

  // 5. Yaş, kültür, ilişkinin rengi
  const extra = [ageHint(ch, r7, s7), foreignHint(ch, r7, s7)].filter(Boolean) as L[];
  const in7t: Partial<Record<BodyId, L>> = {
    sun: l('Partnerin güçlü bir kişiliğe sahip, kendine güvenen ve parlayan biri olur.', 'Your partner has a strong, confident, radiant personality.'),
    moon: l('Partnerinle aranızda derin bir duygusal bağ olur; ilişki ruh hâlini çok etkiler.', 'You share a deep emotional bond; the relationship strongly affects your mood.'),
    mercury: l('Konuşabildiğin, zihnen uyuştuğun biriyle evlenme eğilimin var.', 'You tend to marry someone you can talk to and who matches your mind.'),
    venus: l('Evlilik için çok uyumlu bir işaret: ilişkin sevgi dolu ve uyumlu olur.', 'A very harmonious sign for marriage: your relationship is loving and agreeable.'),
    mars: l('Tutkulu ama zaman zaman tartışmalı bir ilişki; partnerin güçlü ve iddialı biri.', 'A passionate but sometimes argumentative relationship; your partner is strong and assertive.'),
    jupiter: l('Evlilikte şanslı sayılırsın; partnerin cömert, bilge ve hayatını genişleten biri.', 'You are considered lucky in marriage; your partner is generous, wise and broadens your life.'),
    saturn: l('Evlilik geç ama sağlam gelir; zamanla güçlenen, kalıcı bir bağ.', 'Marriage comes later but solidly; a lasting bond that grows stronger with time.'),
    uranus: l('İlişki beklenmedik bir şekilde başlar; özgürlüğüne saygı duyan biri gerekir.', 'The relationship starts unexpectedly; you need someone who respects your freedom.'),
    neptune: l('Ruh eşi gibi hissettiren bir bağ; partnerini idealize etmemeye dikkat et.', 'A soulmate-like bond; be careful not to idealise your partner.'),
    pluto: l('Kader gibi hissettiren, seni derinden dönüştüren yoğun bir ilişki.', 'An intense, fated-feeling relationship that transforms you deeply.'),
  };
  in7.forEach(p => in7t[p] && extra.push(in7t[p]!));
  if (P.juno) extra.push(l(`Uzun süreli bağlılıkta aradığın şeyi gösteren Juno ${SIGNS[P.juno.sign].tr} burcunda: partnerinde ${CHAR[P.juno.sign].tr.split(';')[0]} birini ararsın.`, `Juno, which shows what you seek in commitment, is in ${SIGNS[P.juno.sign].en}: you look for someone ${CHAR[P.juno.sign].en.split(';')[0]}.`));
  if (extra.length) out.push({ id: 'colour', title: l('İlişkinin rengi', 'The colour of the relationship'),
    text: { tr: extra.map(x => x.tr).join(' '), en: extra.map(x => x.en).join(' ') },
    why: l(`Yedinci evdeki gezegenler${in7.length ? ` (${in7.map(p => name(p).tr).join(', ')})` : ''}, Satürn ve Jüpiter bağlantıları ile Juno’nun burcu.`, `Planets in the seventh house${in7.length ? ` (${in7.map(p => name(p).en).join(', ')})` : ''}, Saturn and Jupiter links, and Juno’s sign.`) });

  return out;
}
