// William Lilly, Christian Astrology, Kitap I (1647) — Bölüm VIII–XVII'den uyarlanmıştır (kamu malı).
// Görünüm, renk ve meslek tarifleri modern ve nötr bir dille yeniden yazılmıştır.
// Lilly'nin kişi tarif kuralı: evin burcu + o evin yöneticisinin burcu + Ay birlikte değerlendirilir;
// ağır basan tanıklık belirleyicidir.
import type { BodyId, Chart } from '../engine/astro';
import { SIGN_RULERS } from '../engine/astro';
import { L, SIGNS, BODIES } from './base';

const l = (tr: string, en: string): L => ({ tr, en });

/** Lilly: burcun bedene verdiği şekil */
export const LILLY_SIGN_FORM: L[] = [
  l('Orta boyu aşmayan, ince ama güçlü kemikli ve sağlam uzuvlu bir yapı; uzunca yüz, koyu kaşlar, uzun boyun, kalın omuzlar, buğday ya da esmer ten.', 'Not above middle height, lean yet strong-boned with sturdy limbs; a longish face, dark brows, a long neck, thick shoulders, a tanned or olive complexion.'),
  l('Kısa ama dolgun, güçlü ve sağlam yapılı; geniş alın, büyük gözler, dolgun yüz, geniş omuzlar, belirgin ağız ve dolgun dudaklar, gür ve koyu saç.', 'Short but full, strong and well set; a broad forehead, large eyes, a full face, broad shoulders, a generous mouth and full lips, thick dark hair.'),
  l('Dik, uzun ve düz bir beden; koyu tenli, uzun kollu, el ve ayakları kısa ve dolgun, koyu saçlı, keskin ela gözlü, hareketli ve zeki.', 'Upright, tall and straight; a darker complexion, long arms with short, fleshy hands and feet, dark hair, keen hazel eyes, active and sharp-minded.'),
  l('Genellikle kısa ve ufak yapılı, üst beden alt bedenden dolgun; yuvarlak yüz, açık ve solgun ten, kahve saç, küçük gözler.', 'Usually short and small-framed, the upper body fuller than the lower; a round face, pale fair skin, brown hair, small eyes.'),
  l('Büyük ve yuvarlak baş, iri ve parlak gözler, orta boyun üstünde dolgun bir beden, geniş omuzlar, ince bel; sarı ya da koyu sarı, dalgalı saç; canlı, güçlü ve cesur.', 'A large round head, big bright eyes, above-average height with a full body, broad shoulders and a narrow waist; golden or dark-blond, wavy hair; vivid, strong and brave.'),
  l('İnce ve orta boylu, uyumlu yapılı; buğday ten, koyu saç, sevimli; ince bir ses; zeki, ölçülü ve güzel konuşan.', 'Slender, of middle height and neatly composed; a warm brown complexion, dark hair, pleasant looks; a light voice; clever, discreet and well-spoken.'),
  l('Düzgün, uzun ve ince yapılı; yuvarlak, sevimli ve güzel bir yüz, canlı bir ten, uzun, düz ve açık renkli saç.', 'Well-formed, tall and slender; a round, lovely, beautiful face, a fresh complexion, long, smooth, lighter hair.'),
  l('Güçlü ve dolgun yapılı, geniş ya da köşeli yüz, koyu ten, gür, koyu ve kıvırcık saç; kısa boyunlu, kompakt bir duruş.', 'Strong and solidly built, a broad or square face, a darker complexion, thick dark curly hair; a short neck and compact frame.'),
  l('Hoş yüzlü, uzunca ama dolgun ve güneşte yanmış gibi kızıl tenli; açık kestane saç, ortanın biraz üstünde boy, orantılı ve güçlü beden.', 'A pleasant face, longish but full and sun-kissed; light chestnut hair, slightly above-average height, well-proportioned and strong.'),
  l('İnce ve kuru yapılı, uzun boylu değil; uzun ve ince yüz, koyu saç, dar çene, ince uzun boyun.', 'Lean and dry-framed, not tall; a long, slender face, dark hair, a narrow chin, a long thin neck.'),
  l('Orta boylu, sağlam ve iyi yapılı; uzunca yüz, canlı ten; çoğunlukla çok açık, berrak bir cilt ve kumral ya da sarı saç.', 'Middle height, solid and well composed; a longish face, a fresh complexion; often very clear, fair skin and sandy or blond hair.'),
  l('Kısa boylu, dolgun ve yumuşak hatlı; büyükçe yüz, solgun ten, başı hafif öne eğik duran bir duruş.', 'Short, full and soft-lined; a fairly large face, pale complexion, often carrying the head slightly forward.'),
];

/** Lilly: gezegenin kişiye verdiği görünüm */
export const LILLY_PLANET_FORM: Partial<Record<BodyId, L>> = {
  saturn: l('Satürn: orta boy, solgun ya da esmer ten, küçük ve koyu gözler, geniş alın, koyu ve sert saç, geniş omuzlar; ağırbaşlı ve ciddi bir ifade.', 'Saturn: middle height, pale or olive skin, small dark eyes, a broad forehead, dark coarse hair, broad shoulders; a grave, serious expression.'),
  jupiter: l('Jüpiter: dik, düzgün ve uzun boy; pembe-kızıl, sevimli bir ten, oval ve dolgun yüz, yüksek alın, iri gözler, yumuşak kumral saç; ağırbaşlı ve güzel konuşan.', 'Jupiter: upright, straight and tall; a rosy, pleasant complexion, an oval, full face, high forehead, large eyes, soft auburn hair; dignified and well-spoken.'),
  mars: l('Mars: orta boy, güçlü ve iri kemikli, kilolu olmaktan çok zayıf; güneşte yanmış ten, kızıl ya da açık kumral ve dalgalı saç, keskin ve delici ela gözler; cesur ve atak.', 'Mars: middle height, strong and big-boned, lean rather than heavy; a sun-flushed complexion, reddish or light, wavy hair, sharp piercing hazel eyes; bold and fearless.'),
  sun: l('Güneş: iri, güçlü ve uyumlu bir beden; yuvarlak ve geniş alın, iri ve parlak gözler, sarımsı saç, canlı ve sağlıklı bir ten; cömert, onurlu ve az ama kendinden emin konuşan.', 'Sun: a large, strong, well-built body; a round, broad forehead, large bright eyes, golden hair, a healthy glowing complexion; generous, honourable, speaks little but with confidence.'),
  venus: l('Venüs: uzun değil ama güzel yapılı; açık tenli, çok güzel ve koyu gözler, yuvarlak yüz, bol, yumuşak ve açık kahve saç, güzel bir ağız ve kiraz dudaklar, yanakta gamze; bakımına ve kıyafetine özen gösteren.', 'Venus: not tall but beautifully formed; fair skin, very lovely dark eyes, a round face, plentiful soft light-brown hair, a lovely mouth and cherry lips, a dimple in the cheek; careful about grooming and clothes.'),
  mercury: l('Merkür: uzun, düz ve ince yapılı; yüksek alın, dar ve uzun yüz, uzun ve ince burun, ince dudaklar, koyu kahve saç, uzun kollar ve parmaklar, zeytin tonlu ten; çevik ve hareketli.', 'Mercury: tall, straight and slim; a high forehead, a narrow long face, a long thin nose, thin lips, dark-brown hair, long arms and fingers, an olive complexion; nimble and busy.'),
  moon: l('Ay: orta-uzun boy, açık ve solgun ten, yuvarlak yüz, gri gözler, gür saç, dolgun ve yumuşak bir beden.', 'Moon: fair stature, pale fair skin, a round face, grey eyes, abundant hair, a full, soft body.'),
};

/** klasik renkleri */
export const LILLY_SIGN_COLOUR: L[] = [
  l('beyaz ile karışık kırmızı', 'white mixed with red'), l('beyaz ve limon sarısı', 'white with citrine'), l('beyaz ile karışık kırmızı', 'white mixed with red'),
  l('yeşil ya da kızıl kahve', 'green or russet'), l('kırmızı ya da yeşil', 'red or green'), l('mavi benekli siyah', 'black speckled with blue'),
  l('siyah, koyu kırmızı ya da taba', 'black, dark crimson or tawny'), l('kahverengi', 'brown'), l('sarı ya da canlı yeşil', 'yellow or a ruddy green'),
  l('siyah, kızıl kahve ya da koyu kahve', 'black, russet or swarthy brown'), l('gök mavisi', 'sky blue'), l('beyaz ve ışıltılı', 'glittering white'),
];
export const LILLY_PLANET_COLOUR: Partial<Record<BodyId, L>> = {
  saturn: l('siyah', 'black'), jupiter: l('kırmızı ile yeşil karışımı', 'red mixed with green'), mars: l('kırmızı, demir rengi', 'red, iron colour'),
  sun: l('sarı, altın ve mor', 'yellow, gold and purple'), venus: l('beyaz ve mor; süt mavisi', 'white and purple; milky sky-blue'),
  mercury: l('gök mavisi ve karışık renkler', 'sky blue and mixed colours'), moon: l('beyaz, gümüş ve soluk tonlar', 'white, silver and pale tones'),
};

/** Lilly'nin gezegen meslekleri (modern karşılıklarıyla) */
export const LILLY_PROFESSION: Partial<Record<BodyId, L>> = {
  saturn: l('Toprak, maden, inşaat, gayrimenkul, tarım, arşiv/tarih ve geleneksel zanaatlar; uzun soluklu, sabır isteyen işler.', 'Land, mining, construction, real estate, agriculture, archives/history and traditional crafts; long-haul, patient work.'),
  jupiter: l('Hukuk ve yargı, akademi ve üniversite, din ve etik, danışmanlık, tekstil ve kumaş ticareti.', 'Law and the judiciary, academia and university, religion and ethics, advisory roles, textiles and cloth trade.'),
  mars: l('Askeriye ve güvenlik, cerrahi ve tıp, eczacılık ve kimya, metal ve makine işleri, mutfak/aşçılık, berberlik, marangozluk.', 'Military and security, surgery and medicine, pharmacy and chemistry, metal and machinery, cooking, barbering, carpentry.'),
  sun: l('Liderlik ve yöneticilik, kamu yönetimi, temsil makamları, kuyumculuk ve altın, para ve finans kurumları.', 'Leadership and management, public administration, representative offices, goldsmithing, money and finance institutions.'),
  venus: l('Müzik ve şarkı, moda ve tekstil (ipek, kumaş), resim ve tasarım, mücevher, sahne ve oyunculuk, parfüm ve kozmetik, güzellik.', 'Music and singing, fashion and textiles (silk, fabrics), painting and design, jewellery, stage and acting, perfume and cosmetics, beauty.'),
  mercury: l('Yazarlık ve şiir, öğretmenlik, matematik ve felsefe, astroloji, ticaret, sekreterlik ve muhasebe, yayıncılık, diplomasi, hukuk ve hitabet.', 'Writing and poetry, teaching, mathematics and philosophy, astrology, trade, secretarial work and accounting, publishing, diplomacy, law and oratory.'),
  moon: l('Halkla iç içe işler, seyahat ve denizcilik, yiyecek-içecek, ulaşım ve kurye, hemşirelik, ebelik ve çocuk bakımı.', 'Public-facing work, travel and seafaring, food and drink, transport and delivery, nursing, midwifery and childcare.'),
};

const SEVEN: BodyId[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];

/** Lilly'nin kuralı: bir evin temsil ettiği kişinin tarifi (evin burcu + yöneticinin burcu + Ay + evdeki gezegenler) */
export function describePerson(ch: Chart, house: number): { cusp: L; ruler: L; moon: L; planets: L[]; rulerId: BodyId; cuspSign: number } | null {
  if (!ch.cusps.length) return null;
  const cuspSign = Math.floor(ch.cusps[house - 1] / 30);
  const rulerId = SIGN_RULERS[cuspSign];
  const rp = ch.positions[rulerId];
  const planets = SEVEN.filter(p => p !== rulerId && ch.positions[p].house === house && LILLY_PLANET_FORM[p]).map(p => LILLY_PLANET_FORM[p]!);
  return {
    cuspSign, rulerId,
    cusp: { tr: `${SIGNS[cuspSign].tr} (ev başlangıcı): ${LILLY_SIGN_FORM[cuspSign].tr}`, en: `${SIGNS[cuspSign].en} (house cusp): ${LILLY_SIGN_FORM[cuspSign].en}` },
    ruler: {
      tr: `Yönetici ${BODIES[rulerId].name.tr}, ${SIGNS[rp.sign].tr} burcunda: ${LILLY_SIGN_FORM[rp.sign].tr.charAt(0).toLocaleLowerCase('tr') + LILLY_SIGN_FORM[rp.sign].tr.slice(1)} ${LILLY_PLANET_FORM[rulerId] ? '\n' + LILLY_PLANET_FORM[rulerId]!.tr : ''}`,
      en: `Ruler ${BODIES[rulerId].name.en} in ${SIGNS[rp.sign].en}: ${LILLY_SIGN_FORM[rp.sign].en.charAt(0).toLowerCase() + LILLY_SIGN_FORM[rp.sign].en.slice(1)} ${LILLY_PLANET_FORM[rulerId] ? '\n' + LILLY_PLANET_FORM[rulerId]!.en : ''}`,
    },
    moon: { tr: `Ay ${SIGNS[ch.positions.moon.sign].tr} burcunda: tarife ${SIGNS[ch.positions.moon.sign].tr} nitelikleri karışır.`, en: `Moon in ${SIGNS[ch.positions.moon.sign].en}: ${SIGNS[ch.positions.moon.sign].en} qualities blend into the description.` },
    planets,
  };
}

/** Kariyer: 10. evin yöneticisi + 10. evdeki gezegenler (Lilly’nin meslek göstergeleri) */
export function lillyCareer(ch: Chart): { ruler: BodyId; text: L; extra: L[] } | null {
  if (ch.mc === null) return null;
  const ruler = SIGN_RULERS[Math.floor(ch.mc / 30)];
  const extra = SEVEN.filter(p => p !== ruler && ch.positions[p].house === 10).map(p => ({
    tr: `${BODIES[p].name.tr} 10. evde: ${LILLY_PROFESSION[p]!.tr}`, en: `${BODIES[p].name.en} in the 10th: ${LILLY_PROFESSION[p]!.en}`,
  }));
  return { ruler, text: { tr: `MC yöneticin ${BODIES[ruler].name.tr}: ${LILLY_PROFESSION[ruler]!.tr}`, en: `Your MC ruler ${BODIES[ruler].name.en}: ${LILLY_PROFESSION[ruler]!.en}` }, extra };
}
