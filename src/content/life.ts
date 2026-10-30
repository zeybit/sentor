import type { BodyId, Chart } from '../engine/astro';
import { SIGN_RULERS } from '../engine/astro';
import { L, SIGNS, HOUSES, BODIES, BODY_FUNCTION } from './base';

const l = (tr: string, en: string): L => ({ tr, en });

// ---------------- AŞK ----------------

export const MARS_DESIRE: L[] = [
  l('Seni cesur, girişken ve meydan okuyan insanlar çeker.', 'Bold, assertive people who challenge you attract you.'),
  l('Seni sakin, güven veren ve duyusal insanlar çeker.', 'Calm, reassuring, sensual people attract you.'),
  l('Seni esprili ve zihnini uyaran insanlar çeker.', 'Witty, mentally stimulating people attract you.'),
  l('Seni şefkatli ve duygusal olarak güvenli insanlar çeker.', 'Nurturing, emotionally safe people attract you.'),
  l('Seni özgüvenli ve göz alıcı insanlar çeker.', 'Confident, eye-catching people attract you.'),
  l('Seni zeki, düzenli ve özenli insanlar çeker.', 'Smart, tidy, attentive people attract you.'),
  l('Seni zarif, kibar ve estetik insanlar çeker.', 'Elegant, polite, stylish people attract you.'),
  l('Seni gizemli, yoğun ve tutkulu insanlar çeker.', 'Mysterious, intense, passionate people attract you.'),
  l('Seni maceracı, komik ve özgür ruhlu insanlar çeker.', 'Adventurous, funny, free spirits attract you.'),
  l('Seni hırslı, olgun ve başarılı insanlar çeker.', 'Ambitious, mature, accomplished people attract you.'),
  l('Seni sıra dışı, bağımsız ve vizyoner insanlar çeker.', 'Unconventional, independent visionaries attract you.'),
  l('Seni romantik, sanatsal ve hassas insanlar çeker.', 'Romantic, artistic, sensitive people attract you.'),
];

/** 7. ev başlangıcı (Alçalan) — partner profili */
export const PARTNER: L[] = [
  l('Partnerin enerjik, girişken ve bağımsız biri olabilir. İlişkide heyecan ve dürüstlük arıyorsun.', 'Your partner may be energetic, assertive and independent. You seek excitement and honesty.'),
  l('Partnerin sadık, sakin ve güven veren biri olabilir; maddi istikrar ilişkinde önemli.', 'Your partner may be loyal, calm and steady; material stability matters.'),
  l('Partnerin konuşkan, genç ruhlu ve zeki biri olabilir; ilişkide en çok iletişim önemli.', 'Your partner may be chatty, youthful and clever; communication is key.'),
  l('Partnerin aile odaklı, şefkatli ve korumacı biri olabilir; yuva kurmak ilişkinin merkezinde.', 'Your partner may be family-oriented, caring and protective; building a home is central.'),
  l('Partnerin karizmatik, cömert ve dikkat çeken biri olabilir; romantik jestler önemli.', 'Your partner may be charismatic, generous and noticeable; romance matters.'),
  l('Partnerin pratik, yardımsever ve detaycı biri olabilir; günlük hayatın uyumu belirleyici.', 'Your partner may be practical, helpful and detail-minded; daily harmony decides.'),
  l('Partnerin zarif, uyumlu ve diplomatik biri olabilir; eşitlik ve denge önemli.', 'Your partner may be graceful, harmonious and diplomatic; equality matters.'),
  l('Partnerin yoğun, tutkulu ve derin biri olabilir; ilişkiler seni dönüştürür.', 'Your partner may be intense, passionate and deep; relationships transform you.'),
  l('Partnerin farklı bir kültürden, maceracı ya da öğretici biri olabilir; birlikte büyümek önemli.', 'Your partner may be from another culture, adventurous or a teacher-type; growing together matters.'),
  l('Partnerin olgun, hırslı ya da yaşça büyük biri olabilir; ciddi ve kalıcı bağlar ararsın.', 'Your partner may be mature, ambitious or older; you seek serious, lasting bonds.'),
  l('Partnerin arkadaş gibi, özgün ve bağımsız biri olabilir; alan tanımak şart.', 'Your partner may be friend-like, unique and independent; space is essential.'),
  l('Partnerin hassas, sanatsal ya da ruhani biri olabilir; ruh eşi bağı ararsın.', 'Your partner may be sensitive, artistic or spiritual; you seek a soulmate bond.'),
];

/** 5. ev başlangıcı — flört tarzı */
export const DATING: L[] = [
  l('Flörtte hızlı ve cesursun; spontane ve heyecanlı buluşmalar seni çeker.', 'You date fast and bold; spontaneous, exciting dates win you.'),
  l('Flörtte yavaş ve duyusalsın; güzel bir akşam yemeği en iyi ilk buluşma.', 'You date slowly and sensually; a great dinner is the ideal first date.'),
  l('Flörtte esprili ve oyunbazsın; mesajlaşma ve uzun sohbetler kalbini açar.', 'Witty and playful; texting and long talks open your heart.'),
  l('Flörtte korunaklısın; evde film gecesi gibi samimi buluşmalar tercihin.', 'Guarded when dating; cosy nights in feel best.'),
  l('Flörtte romantik ve gösterişlisin; özel hissettiren jestler seni kazanır.', 'Romantic and dramatic; gestures that make you feel special win you.'),
  l('Flörtte seçicisin; ilgi gösteren ve detayları hatırlayan biri seni etkiler.', 'Selective; someone who remembers details impresses you.'),
  l('Flörtte zarif ve romantiksin; sanat, müzik ve şık mekânlar.', 'Elegant and romantic; art, music and stylish venues.'),
  l('Flörtte yoğun ve seçicisin; derin sohbetler ve gizem seni çeker.', 'Intense and selective; deep talks and mystery attract you.'),
  l('Flörtte özgür ve maceracısın; seyahat ve yeni deneyimler.', 'Free and adventurous; travel and new experiences.'),
  l('Flörtte ciddisin; geleceği olan ilişkilere zaman ayırırsın.', 'Serious; you invest time only where there is a future.'),
  l('Flörtte sıra dışısın; arkadaşlıktan doğan aşklar sana daha uygun.', 'Unconventional; love that grows from friendship suits you.'),
  l('Flörtte rüya gibisin; masalsı, romantik anlar ararsın.', 'Dreamy; you seek fairytale, romantic moments.'),
];

/** Venüs'ün bulunduğu ev — aşkı nerede bulursun */
export const VENUS_HOUSE_MEET: L[] = [
  l('Çekiciliğin doğal; insanlar sana kendiliğinden yaklaşır.', 'Your charm is effortless; people approach you.'),
  l('Ortak değerler ve maddi uyum önemli; alışveriş, sanat ve gastronomi ortamları.', 'Shared values matter; shopping, art and food scenes.'),
  l('Yakın çevre, okul, sosyal medya veya kısa yolculuklarda tanışma ihtimali yüksek.', 'Likely to meet via your neighbourhood, school, social media or short trips.'),
  l('Aile çevresi ya da ev ortamı aracılığıyla; yuva odaklı aşk.', 'Through family circles or home settings; home-centred love.'),
  l('Partiler, etkinlikler, hobiler ve yaratıcı ortamlar; klasik romantik yerleşim.', 'Parties, events, hobbies and creative scenes; a classic romantic placement.'),
  l('İş yeri, spor salonu veya günlük rutin içinde.', 'At work, the gym or in your daily routine.'),
  l('Venüs 7. evde: ilişki ve evlilik için çok desteklenen bir yerleşim olarak bilinir.', 'Venus in the 7th: widely considered a supportive placement for marriage.'),
  l('Yoğun, dönüştürücü ve tutkulu ilişkiler; ortak kaynaklar önemli.', 'Intense, transformative, passionate relationships; shared resources matter.'),
  l('Yurt dışı, eğitim ortamları veya farklı kültürlerden insanlar.', 'Abroad, educational settings or people from other cultures.'),
  l('İş ve kariyer çevresi; güzellik veya sanatla ilgili kariyer de anlamına gelebilir.', 'Through career circles; may also point to a beauty or art career.'),
  l('Arkadaş grupları, topluluklar ve online ağlar; arkadaştan sevgiliye.', 'Friend groups, communities and online networks; friends-to-lovers.'),
  l('Gizli aşklar, ruhsal bağlar ya da uzun süre içinde sakladığın duygular.', 'Secret loves, spiritual bonds or long-hidden feelings.'),
];

export const PLANET_IN_7: Partial<Record<BodyId, L>> = {
  sun: l('Güneş 7. evde: İlişkiler kimliğinin merkezinde; parlak ve güçlü partnerler çekersin.', 'Sun in the 7th: relationships are central to your identity; you attract strong, shining partners.'),
  moon: l('Ay 7. evde: Partnerinde duygusal güven ve şefkat ararsın; ilişkiler ruh halini çok etkiler.', 'Moon in the 7th: you seek emotional safety and care in a partner; relationships shape your mood.'),
  mercury: l('Merkür 7. evde: Zihinsel uyum şart; konuşabildiğin biriyle evlenme eğilimi.', 'Mercury in the 7th: mental compatibility is a must; you marry someone you can talk with.'),
  venus: l('Venüs 7. evde: Uyumlu, romantik ve evliliğe yatkın bir yerleşim.', 'Venus in the 7th: harmonious, romantic, marriage-friendly placement.'),
  mars: l('Mars 7. evde: Tutkulu ama tartışmalı ilişkiler; güçlü ve iddialı partnerler.', 'Mars in the 7th: passionate but argumentative relationships; strong, assertive partners.'),
  jupiter: l('Jüpiter 7. evde: Evlilik ve ortaklık şansı olarak bilinir; cömert ve bilge partnerler.', 'Jupiter in the 7th: known as relationship luck; generous, wise partners.'),
  saturn: l('Satürn 7. evde: Geç ya da çok ciddi evlilik teması; zamanla güçlenen kalıcı bağ.', 'Saturn in the 7th: late or very serious commitment; bonds that strengthen over time.'),
  uranus: l('Uranüs 7. evde: Sıra dışı ilişkiler, ani başlangıçlar; özgürlük şart.', 'Uranus in the 7th: unusual relationships, sudden starts; freedom is essential.'),
  neptune: l('Neptün 7. evde: Ruh eşi idealizmi; partneri idealize etmemek için gerçekçi ol.', 'Neptune in the 7th: soulmate idealism; stay realistic about partners.'),
  pluto: l('Plüton 7. evde: Kader gibi hissettiren, dönüştürücü ve yoğun ilişkiler.', 'Pluto in the 7th: fated-feeling, transformative, intense relationships.'),
  node: l('Kuzey Düğüm 7. evde: Ruhsal gelişimin ilişkiler ve ortaklıklar yoluyla gelir.', 'North Node in the 7th: your growth comes through partnership.'),
  lilith: l('Lilith 7. evde: İlişkilerde güç dengesi ve tabular teması; eşit olmayan bağlara dikkat.', 'Lilith in the 7th: power dynamics and taboos in relationships; watch for unequal bonds.'),
};

// ---------------- KARİYER ----------------

export const MC_CAREER: { text: L; fields: L }[] = [
  { text: l('Kariyerde öncü ve liderlik pozisyonları sana uygun; kendi işini kurma potansiyelin yüksek.', 'Pioneering, leadership roles suit you; strong entrepreneurial potential.'), fields: l('Girişimcilik, spor, askeri/güvenlik, acil tıp, mühendislik, satış', 'Entrepreneurship, sport, defence/security, emergency medicine, engineering, sales') },
  { text: l('İstikrarlı, somut değer üreten ve estetik işler; finansal güvence hedefin.', 'Stable work that creates tangible value and beauty; financial security is the goal.'), fields: l('Finans, bankacılık, gayrimenkul, gastronomi, güzellik, tasarım, müzik', 'Finance, banking, real estate, food, beauty, design, music') },
  { text: l('İletişim ve bilgiyle çalışan, çeşitlilik sunan işler; birden fazla kariyer de olası.', 'Work involving communication and variety; multiple careers are possible.'), fields: l('Medya, gazetecilik, sosyal medya, pazarlama, yazarlık, öğretmenlik, çeviri', 'Media, journalism, social media, marketing, writing, teaching, translation') },
  { text: l('Bakım veren, koruyan ve topluma yuva sağlayan işler.', 'Caring, protective, home-making work.'), fields: l('Psikoloji, hemşirelik, eğitim, gıda, iç mimarlık, insan kaynakları', 'Psychology, nursing, education, food, interior design, HR') },
  { text: l('Sahnede olmak ve yaratıcılığını göstermek için doğdun; görünürlük önemli.', 'Born to be seen and create; visibility matters.'), fields: l('Sanat, oyunculuk, yönetim, influencer, moda, eğlence sektörü', 'Arts, acting, management, influencing, fashion, entertainment') },
  { text: l('Uzmanlık, analiz ve hizmet gerektiren işler; kalite kontrolde ustasın.', 'Expert, analytical, service work; a master of quality.'), fields: l('Sağlık, eczacılık, veri analizi, editörlük, muhasebe, beslenme, araştırma', 'Healthcare, pharmacy, data analysis, editing, accounting, nutrition, research') },
  { text: l('Estetik, denge ve insan ilişkileri gerektiren işler; iş birliğinde parlarsın.', 'Aesthetic, balancing, people-centred work; you shine in collaboration.'), fields: l('Hukuk, diplomasi, moda, tasarım, halkla ilişkiler, güzellik, danışmanlık', 'Law, diplomacy, fashion, design, PR, beauty, consulting') },
  { text: l('Derinlik, araştırma ve dönüşüm gerektiren güçlü pozisyonlar.', 'Deep, investigative, transformative positions of power.'), fields: l('Psikoloji, cerrahi, kriminoloji, yatırım, siber güvenlik, araştırma', 'Psychology, surgery, criminology, investment, cybersecurity, research') },
  { text: l('Öğreten, seyahat eden ve ufuk açan işler; özgürlük şart.', 'Teaching, travelling, horizon-expanding work; freedom is essential.'), fields: l('Akademi, yayıncılık, turizm, hukuk, uluslararası ilişkiler, koçluk', 'Academia, publishing, tourism, law, international relations, coaching') },
  { text: l('MC kendi evinde: otorite, yapı ve uzun vadeli başarı; zirveye adım adım tırmanırsın.', 'MC at home: authority, structure and long-term success; you climb step by step.'), fields: l('Yöneticilik, devlet, mimarlık, finans, hukuk, mühendislik', 'Management, government, architecture, finance, law, engineering') },
  { text: l('Yenilikçi, teknolojik ve topluma hizmet eden kariyerler.', 'Innovative, tech-driven, humanitarian careers.'), fields: l('Yazılım, yapay zekâ, bilim, sosyal girişim, astroloji, havacılık', 'Software, AI, science, social enterprise, astrology, aviation') },
  { text: l('İlham, şifa ve sanatla çalışan kariyerler.', 'Careers working with inspiration, healing and art.'), fields: l('Sanat, müzik, film, psikoloji, sağlık, fotoğraf, sivil toplum', 'Art, music, film, psychology, healthcare, photography, non-profits') },
];

export const WORK_STYLE: L[] = [
  l('Hızlı tempolu, rekabetçi ortamlarda verimlisin; mikro yönetimden hoşlanmazsın.', 'You thrive in fast, competitive settings; you dislike micromanagement.'),
  l('Sakin, düzenli ve konforlu çalışma ortamı istersin; istikrar seni verimli kılar.', 'You want a calm, steady, comfortable workplace; stability makes you productive.'),
  l('Çeşitlilik ve iletişim lazım; tek düze rutin seni sıkar.', 'You need variety and communication; monotony bores you.'),
  l('Aile gibi bir ekip ve güvenli ortam istersin; evden çalışma sana iyi gelebilir.', 'You want a family-like team and safety; remote work may suit you.'),
  l('Takdir edildiğin ve yaratıcı olabildiğin işlerde parlarsın.', 'You shine where you’re appreciated and creative.'),
  l('Net görev tanımları, düzen ve sistem; detaylarda ustasın.', 'Clear tasks, order and systems; you master details.'),
  l('Uyumlu bir ekip ve estetik ortam; çatışma verimini düşürür.', 'A harmonious team and pleasant space; conflict drains you.'),
  l('Derinlemesine odaklanabileceğin, gizlilik içeren işler.', 'Deep-focus work with privacy.'),
  l('Esneklik, seyahat ve anlam; masa başı rutin seni kısıtlar.', 'Flexibility, travel and meaning; desk routine confines you.'),
  l('Disiplinli, hedef odaklı ve hiyerarşiyi bilen bir çalışan.', 'Disciplined, goal-driven and hierarchy-savvy.'),
  l('Bağımsızlık ve yenilik alanı; sıra dışı çalışma saatleri sana uygun olabilir.', 'Independence and room to innovate; unusual hours may suit you.'),
  l('Sezgiyle çalışırsın; yaratıcı ve şefkat gerektiren ortamlarda gelişirsin.', 'You work intuitively; you flourish in creative, compassionate settings.'),
];

export const MONEY_STYLE: L[] = [
  l('Hızlı kazanır, hızlı harcarsın; kendi girişimlerinle para kazanma potansiyelin yüksek.', 'Earn fast, spend fast; strong potential to earn through your own ventures.'),
  l('Para yönetiminde doğal yeteneğin var; birikim ve kalıcı yatırımlar sana uygun.', 'Natural money manager; savings and lasting investments suit you.'),
  l('Birden fazla gelir kaynağı; iletişim ve satışla kazanırsın.', 'Multiple income streams; you earn via communication and sales.'),
  l('Güvenlik için birikim yaparsın; ev ve gayrimenkul değerli.', 'You save for security; home and property matter.'),
  l('Yaratıcılığınla kazanırsın; harcarken cömertsin.', 'You earn via creativity; you spend generously.'),
  l('Dikkatli bütçeci; hizmet ve uzmanlıkla kazanırsın.', 'Careful budgeter; you earn through service and expertise.'),
  l('Ortaklıklar ve estetik işler gelir getirir; güzel şeylere harcarsın.', 'Partnerships and aesthetic work bring income; you spend on beauty.'),
  l('Ortak kaynaklar, yatırım ve stratejik finans; para konusunda gizlisin.', 'Shared resources, investment and strategy; private about money.'),
  l('İyimser yatırımcı; eğitim ve seyahat harcamaların yüksek olabilir.', 'Optimistic investor; may spend on education and travel.'),
  l('Disiplinli ve uzun vadeli; zamanla güçlü bir finansal yapı kurarsın.', 'Disciplined and long-term; you build strong finances over time.'),
  l('Teknoloji ve sıra dışı yollarla kazanç; dalgalı gelir olabilir.', 'Income via tech and unusual paths; may fluctuate.'),
  l('Sezgisel ama dağınık; bütçe yapmak en büyük dersin.', 'Intuitive but scattered; budgeting is your lesson.'),
];

export const PLANET_IN_10: Partial<Record<BodyId, L>> = {
  sun: l('Güneş 10. evde: Kariyer ve tanınırlık için güçlü bir yerleşim; liderlik ve görünürlük sende.', 'Sun in the 10th: strong placement for career and recognition; leadership and visibility.'),
  moon: l('Ay 10. evde: Halkla ve insanlarla iç içe kariyer; kamuoyu duygularını iyi okursun.', 'Moon in the 10th: public-facing career; you read the public mood well.'),
  mercury: l('Merkür 10. evde: İletişim, yazı veya ticaretle tanınma.', 'Mercury in the 10th: known for communication, writing or trade.'),
  venus: l('Venüs 10. evde: Güzellik, sanat veya diplomasiyle kariyer; sevilen bir kamu imajı.', 'Venus in the 10th: career in beauty, art or diplomacy; well-liked public image.'),
  mars: l('Mars 10. evde: Hırslı, rekabetçi ve girişimci; zirve için savaşırsın.', 'Mars in the 10th: ambitious, competitive, entrepreneurial; you fight for the top.'),
  jupiter: l('Jüpiter 10. evde: Kariyer şansı ve yükselme olarak bilinen en olumlu yerleşimlerden.', 'Jupiter in the 10th: one of the most fortunate career placements.'),
  saturn: l('Satürn 10. evde: Geç ama kalıcı başarı; otorite ve ustalık zamanla gelir.', 'Saturn in the 10th: late but lasting success; authority comes with time.'),
  uranus: l('Uranüs 10. evde: Sıra dışı kariyer, ani değişimler; teknolojide yenilikçi.', 'Uranus in the 10th: unconventional career, sudden shifts; innovative in tech.'),
  neptune: l('Neptün 10. evde: Sanatsal veya şifa odaklı kariyer; ilham veren imaj.', 'Neptune in the 10th: artistic or healing career; inspiring image.'),
  pluto: l('Plüton 10. evde: Güçlü kariyer dönüşümleri; etki ve güç pozisyonları.', 'Pluto in the 10th: powerful career transformations; positions of influence.'),
  node: l('Kuzey Düğüm 10. evde: Kader yönün kariyer ve toplumsal rol; görünür ol.', 'North Node in the 10th: your destiny points to career and public role.'),
  lilith: l('Lilith 10. evde: Kuralları yıkan, tartışılan ama unutulmayan bir kamu imajı.', 'Lilith in the 10th: rule-breaking, controversial, unforgettable public image.'),
};

/** Genel gezegen-ev yorumu */
export function planetInHouse(id: BodyId, house: number): L {
  const h = HOUSES[house - 1];
  return {
    tr: `${BODIES[id].name.tr} ${house}. evde: ${cap(BODY_FUNCTION[id].tr)}, hayatının ${h.area.tr} alanında öne çıkar.`,
    en: `${BODIES[id].name.en} in the ${ord(house)} house: ${cap(BODY_FUNCTION[id].en)} play out mainly through ${h.area.en}.`,
  };
}

/** Bir evin yöneticisinin nerede olduğu (“ev yöneticisi” yorumu) */
export function houseRulerText(ch: Chart, house: number): L | null {
  if (!ch.cusps.length) return null;
  const sign = Math.floor(ch.cusps[house - 1] / 30);
  const ruler = SIGN_RULERS[sign];
  const rp = ch.positions[ruler];
  if (!rp.house) return null;
  const from = HOUSES[house - 1], to = HOUSES[rp.house - 1];
  return {
    tr: `${house}. ev ${SIGNS[sign].tr} ile başlıyor; yöneticisi ${BODIES[ruler].name.tr} ${rp.house}. evde. Yani ${from.short.tr.toLocaleLowerCase('tr')} konuları, ${to.short.tr.toLocaleLowerCase('tr')} alanıyla bağlantılı ilerler.`,
    en: `Your ${ord(house)} house begins in ${SIGNS[sign].en}; its ruler ${BODIES[ruler].name.en} sits in the ${ord(rp.house)}. So ${from.short.en.toLowerCase()} matters are linked to ${to.short.en.toLowerCase()}.`,
  };
}

export const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);
export const ord = (n: number) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');

export function signOfCusp(ch: Chart, house: number): number | null {
  return ch.cusps.length ? Math.floor(ch.cusps[house - 1] / 30) : null;
}
