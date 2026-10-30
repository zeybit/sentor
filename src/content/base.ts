import type { BodyId, AspectType } from '../engine/astro';

export type Lang = 'tr' | 'en';
export type L = { tr: string; en: string };
export const t = (l: L, lang: Lang) => l[lang];

// \uFE0E: emoji yerine metin glifi olarak çizilsin
export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'].map(g => g + '\uFE0E');

export const SIGNS: L[] = [
  { tr: 'Koç', en: 'Aries' }, { tr: 'Boğa', en: 'Taurus' }, { tr: 'İkizler', en: 'Gemini' },
  { tr: 'Yengeç', en: 'Cancer' }, { tr: 'Aslan', en: 'Leo' }, { tr: 'Başak', en: 'Virgo' },
  { tr: 'Terazi', en: 'Libra' }, { tr: 'Akrep', en: 'Scorpio' }, { tr: 'Yay', en: 'Sagittarius' },
  { tr: 'Oğlak', en: 'Capricorn' }, { tr: 'Kova', en: 'Aquarius' }, { tr: 'Balık', en: 'Pisces' },
];

export type Element = 'fire' | 'earth' | 'air' | 'water';
export const SIGN_ELEMENT: Element[] = ['fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water', 'fire', 'earth', 'air', 'water'];
export type Modality = 'cardinal' | 'fixed' | 'mutable';
export const SIGN_MODALITY: Modality[] = ['cardinal', 'fixed', 'mutable', 'cardinal', 'fixed', 'mutable', 'cardinal', 'fixed', 'mutable', 'cardinal', 'fixed', 'mutable'];

export const ELEMENTS: Record<Element, L> = {
  fire: { tr: 'Ateş', en: 'Fire' }, earth: { tr: 'Toprak', en: 'Earth' },
  air: { tr: 'Hava', en: 'Air' }, water: { tr: 'Su', en: 'Water' },
};
export const MODALITIES: Record<Modality, L> = {
  cardinal: { tr: 'Öncü', en: 'Cardinal' }, fixed: { tr: 'Sabit', en: 'Fixed' }, mutable: { tr: 'Değişken', en: 'Mutable' },
};

/** Burç anahtar nitelikleri (cümle içinde "… bir şekilde" kalıbıyla kullanılır) */
export const SIGN_ADVERB: L[] = [
  { tr: 'cesur, hızlı ve doğrudan', en: 'boldly, quickly and directly' },
  { tr: 'sakin, istikrarlı ve duyusal', en: 'calmly, steadily and sensually' },
  { tr: 'meraklı, konuşkan ve çok yönlü', en: 'curiously, talkatively and versatilely' },
  { tr: 'şefkatli, koruyucu ve sezgisel', en: 'nurturingly, protectively and intuitively' },
  { tr: 'gösterişli, cömert ve yaratıcı', en: 'radiantly, generously and creatively' },
  { tr: 'özenli, analitik ve faydalı', en: 'carefully, analytically and helpfully' },
  { tr: 'zarif, uyumlu ve diplomatik', en: 'gracefully, harmoniously and diplomatically' },
  { tr: 'yoğun, derin ve tutkulu', en: 'intensely, deeply and passionately' },
  { tr: 'özgür, iyimser ve maceracı', en: 'freely, optimistically and adventurously' },
  { tr: 'disiplinli, hırslı ve planlı', en: 'with discipline, ambition and planning' },
  { tr: 'özgün, bağımsız ve yenilikçi', en: 'originally, independently and innovatively' },
  { tr: 'hayalperest, empatik ve akışkan', en: 'dreamily, empathetically and fluidly' },
];

export const SIGN_KEYWORDS: L[] = [
  { tr: 'Girişim, cesaret, liderlik, rekabet', en: 'Initiative, courage, leadership, competition' },
  { tr: 'Güven, konfor, sadakat, estetik', en: 'Security, comfort, loyalty, aesthetics' },
  { tr: 'İletişim, merak, zekâ, hareketlilik', en: 'Communication, curiosity, wit, movement' },
  { tr: 'Duygu, aile, yuva, koruma', en: 'Emotion, family, home, protection' },
  { tr: 'Özgüven, yaratıcılık, sahne, cömertlik', en: 'Confidence, creativity, stage, generosity' },
  { tr: 'Düzen, detay, hizmet, sağlık', en: 'Order, detail, service, health' },
  { tr: 'Denge, ilişkiler, güzellik, adalet', en: 'Balance, relationships, beauty, justice' },
  { tr: 'Dönüşüm, tutku, gizem, güç', en: 'Transformation, passion, mystery, power' },
  { tr: 'Özgürlük, inanç, seyahat, felsefe', en: 'Freedom, belief, travel, philosophy' },
  { tr: 'Hedef, statü, sorumluluk, yapı', en: 'Goals, status, responsibility, structure' },
  { tr: 'Bağımsızlık, topluluk, gelecek, yenilik', en: 'Independence, community, future, innovation' },
  { tr: 'Hayal gücü, şefkat, maneviyat, sanat', en: 'Imagination, compassion, spirituality, art' },
];

export const BODIES: Record<BodyId, { glyph: string; name: L }> = {
  sun: { glyph: '☉', name: { tr: 'Güneş', en: 'Sun' } },
  moon: { glyph: '☽', name: { tr: 'Ay', en: 'Moon' } },
  mercury: { glyph: '☿', name: { tr: 'Merkür', en: 'Mercury' } },
  venus: { glyph: '♀', name: { tr: 'Venüs', en: 'Venus' } },
  mars: { glyph: '♂', name: { tr: 'Mars', en: 'Mars' } },
  jupiter: { glyph: '♃', name: { tr: 'Jüpiter', en: 'Jupiter' } },
  saturn: { glyph: '♄', name: { tr: 'Satürn', en: 'Saturn' } },
  uranus: { glyph: '♅', name: { tr: 'Uranüs', en: 'Uranus' } },
  neptune: { glyph: '♆', name: { tr: 'Neptün', en: 'Neptune' } },
  pluto: { glyph: '♇', name: { tr: 'Plüton', en: 'Pluto' } },
  node: { glyph: '☊', name: { tr: 'Kuzey Ay Düğümü', en: 'North Node' } },
  southNode: { glyph: '☋', name: { tr: 'Güney Ay Düğümü', en: 'South Node' } },
  lilith: { glyph: '⚸', name: { tr: 'Lilith (Kara Ay)', en: 'Lilith (Black Moon)' } },
  fortune: { glyph: '⊗', name: { tr: 'Şans Noktası', en: 'Part of Fortune' } },
};

/** Gezegenin temsil ettiği işlev — "… temanı" kalıbıyla */
export const BODY_FUNCTION: Record<BodyId, L> = {
  sun: { tr: 'kimliğin, özün ve parlamak istediğin alan', en: 'your core identity and where you want to shine' },
  moon: { tr: 'duyguların, iç dünyan ve güvende hissetme ihtiyacın', en: 'your emotions, inner world and need for safety' },
  mercury: { tr: 'düşünme biçimin, iletişimin ve öğrenme tarzın', en: 'how you think, communicate and learn' },
  venus: { tr: 'aşk dilin, zevklerin, estetiğin ve değer verdiklerin', en: 'your love language, taste, aesthetics and values' },
  mars: { tr: 'enerjin, arzuların, cesaretin ve mücadele biçimin', en: 'your drive, desire, courage and way of fighting' },
  jupiter: { tr: 'şansın, büyüme alanın ve iyimserliğin', en: 'your luck, growth and optimism' },
  saturn: { tr: 'sınavların, sorumlulukların ve zamanla ustalaştığın alan', en: 'your lessons, responsibilities and slow-built mastery' },
  uranus: { tr: 'özgürleşme, ani değişim ve sıra dışılık ihtiyacın', en: 'your need for freedom, sudden change and originality' },
  neptune: { tr: 'hayallerin, sezgilerin, ilham ve idealize ettiklerin', en: 'your dreams, intuition, inspiration and ideals' },
  pluto: { tr: 'güç, dönüşüm ve derin yeniden doğuş temaların', en: 'your themes of power, transformation and rebirth' },
  node: { tr: 'ruhsal büyüme yönün ve bu hayattaki hedefin', en: 'your direction of growth and soul purpose' },
  southNode: { tr: 'doğuştan getirdiğin yetenekler ve konfor alanın', en: 'your innate gifts and comfort zone' },
  lilith: { tr: 'bastırılmış arzuların, isyanın ve vahşi gücün', en: 'your suppressed desires, rebellion and raw power' },
  fortune: { tr: 'kendini en doğal ve bereketli hissettiğin alan', en: 'where you feel most naturally abundant' },
};

export const HOUSES: { name: L; area: L; short: L }[] = [
  { name: { tr: '1. Ev — Benlik', en: '1st House — Self' }, short: { tr: 'Benlik & görünüm', en: 'Self & appearance' }, area: { tr: 'kimlik, dış görünüş, ilk izlenim ve beden', en: 'identity, appearance, first impressions and body' } },
  { name: { tr: '2. Ev — Kaynaklar', en: '2nd House — Resources' }, short: { tr: 'Para & değerler', en: 'Money & values' }, area: { tr: 'para, kazanç, sahip olunanlar ve öz değer', en: 'money, income, possessions and self-worth' } },
  { name: { tr: '3. Ev — İletişim', en: '3rd House — Communication' }, short: { tr: 'İletişim & kardeşler', en: 'Communication & siblings' }, area: { tr: 'iletişim, kardeşler, yakın çevre, kısa yolculuklar ve sosyal medya', en: 'communication, siblings, neighbours, short trips and social media' } },
  { name: { tr: '4. Ev — Yuva', en: '4th House — Home' }, short: { tr: 'Ev & aile', en: 'Home & family' }, area: { tr: 'ev, aile, kökler ve duygusal temel', en: 'home, family, roots and emotional foundation' } },
  { name: { tr: '5. Ev — Yaratıcılık', en: '5th House — Creativity' }, short: { tr: 'Aşk & eğlence', en: 'Romance & fun' }, area: { tr: 'flört, aşk, eğlence, çocuklar ve yaratıcılık', en: 'dating, romance, fun, children and creativity' } },
  { name: { tr: '6. Ev — Günlük Yaşam', en: '6th House — Daily Life' }, short: { tr: 'İş & sağlık', en: 'Work & health' }, area: { tr: 'günlük rutin, iş ortamı, sağlık ve evcil hayvanlar', en: 'daily routine, workplace, health and pets' } },
  { name: { tr: '7. Ev — İlişkiler', en: '7th House — Partnership' }, short: { tr: 'Evlilik & ortaklık', en: 'Marriage & partners' }, area: { tr: 'evlilik, ciddi ilişkiler, ortaklıklar ve açık rakipler', en: 'marriage, committed partnerships and open rivals' } },
  { name: { tr: '8. Ev — Dönüşüm', en: '8th House — Transformation' }, short: { tr: 'Tutku & ortak para', en: 'Intimacy & shared money' }, area: { tr: 'yakınlık, tutku, ortak kaynaklar, miras, krizler ve dönüşüm', en: 'intimacy, shared resources, inheritance, crises and transformation' } },
  { name: { tr: '9. Ev — Ufuklar', en: '9th House — Horizons' }, short: { tr: 'Seyahat & eğitim', en: 'Travel & study' }, area: { tr: 'yüksek eğitim, yurt dışı, uzun seyahat, inanç ve felsefe', en: 'higher education, abroad, long travel, belief and philosophy' } },
  { name: { tr: '10. Ev — Kariyer', en: '10th House — Career' }, short: { tr: 'Kariyer & ün', en: 'Career & reputation' }, area: { tr: 'kariyer, toplumsal statü, ün ve hayat amacı', en: 'career, public status, reputation and life direction' } },
  { name: { tr: '11. Ev — Topluluk', en: '11th House — Community' }, short: { tr: 'Arkadaşlar & hayaller', en: 'Friends & wishes' }, area: { tr: 'arkadaşlar, gruplar, takipçiler, sosyal ağlar ve gelecek hayalleri', en: 'friends, groups, followers, networks and future wishes' } },
  { name: { tr: '12. Ev — Bilinçaltı', en: '12th House — Subconscious' }, short: { tr: 'Gizli dünya & maneviyat', en: 'Hidden life & spirituality' }, area: { tr: 'bilinçaltı, yalnızlık, gizli konular, rüyalar ve maneviyat', en: 'the subconscious, solitude, secrets, dreams and spirituality' } },
];

export const ASPECT_INFO: Record<AspectType, { name: L; glyph: string; nature: 'harmonious' | 'challenging' | 'fusion' | 'adjust'; desc: L }> = {
  conjunction: { glyph: '☌', nature: 'fusion', name: { tr: 'Kavuşum', en: 'Conjunction' }, desc: { tr: 'iki enerji birleşir ve birbirini güçlendirir', en: 'the two energies merge and amplify each other' } },
  sextile: { glyph: '⚹', nature: 'harmonious', name: { tr: 'Altmışlık', en: 'Sextile' }, desc: { tr: 'çaba gösterdiğinde açılan fırsatlar sunar', en: 'opens opportunities when you take action' } },
  square: { glyph: '□', nature: 'challenging', name: { tr: 'Kare', en: 'Square' }, desc: { tr: 'iç gerilim yaratır; bu sürtünme seni harekete geçiren itici güçtür', en: 'creates inner tension; that friction is your motivator' } },
  trine: { glyph: '△', nature: 'harmonious', name: { tr: 'Üçgen', en: 'Trine' }, desc: { tr: 'doğal bir akış ve kolaylıkla gelen yetenek demektir', en: 'means natural flow and effortless talent' } },
  quincunx: { glyph: '⚻', nature: 'adjust', name: { tr: 'Quincunx (150°)', en: 'Quincunx' }, desc: { tr: 'sürekli ince ayar gerektiren uyumsuz bir ikili', en: 'an awkward pair that needs constant adjustment' } },
  opposition: { glyph: '☍', nature: 'challenging', name: { tr: 'Karşıt', en: 'Opposition' }, desc: { tr: 'iki uç arasında denge kurma ihtiyacı; çoğu zaman ilişkilerde yansır', en: 'a need to balance two extremes, often mirrored in relationships' } },
};

export const MOON_PHASES: L[] = [
  { tr: 'Yeni Ay', en: 'New Moon' }, { tr: 'Hilal (Büyüyen)', en: 'Waxing Crescent' },
  { tr: 'İlk Dördün', en: 'First Quarter' }, { tr: 'Şişkin Ay (Büyüyen)', en: 'Waxing Gibbous' },
  { tr: 'Dolunay', en: 'Full Moon' }, { tr: 'Şişkin Ay (Küçülen)', en: 'Waning Gibbous' },
  { tr: 'Son Dördün', en: 'Last Quarter' }, { tr: 'Balsamik Ay', en: 'Waning Crescent' },
];

export const MOON_PHASE_TIP: L[] = [
  { tr: 'Niyet koyma ve yeni başlangıçlar için ideal.', en: 'Ideal for setting intentions and fresh starts.' },
  { tr: 'Planlarını küçük adımlarla harekete geçir.', en: 'Put plans into motion with small steps.' },
  { tr: 'Engellerle yüzleş, karar ver ve aksiyon al.', en: 'Face obstacles, decide and act.' },
  { tr: 'İnce ayar yap, detayları mükemmelleştir.', en: 'Refine and polish the details.' },
  { tr: 'Sonuçlar görünür olur; duygular yükselir, kutla ve bırak.', en: 'Results show; emotions peak — celebrate and release.' },
  { tr: 'Öğrendiklerini paylaş, minnettarlık zamanı.', en: 'Share what you learned; time for gratitude.' },
  { tr: 'Sana hizmet etmeyeni bırak, sadeleş.', en: 'Release what no longer serves you; declutter.' },
  { tr: 'Dinlen, içe dön ve yeni döngüye hazırlan.', en: 'Rest, turn inward and prepare for the next cycle.' },
];

export const DIGNITY: Partial<Record<BodyId, { domicile: number[]; exalt: number[]; detriment: number[]; fall: number[] }>> = {
  sun: { domicile: [4], exalt: [0], detriment: [10], fall: [6] },
  moon: { domicile: [3], exalt: [1], detriment: [9], fall: [7] },
  mercury: { domicile: [2, 5], exalt: [5], detriment: [8, 11], fall: [11] },
  venus: { domicile: [1, 6], exalt: [11], detriment: [7, 0], fall: [5] },
  mars: { domicile: [0, 7], exalt: [9], detriment: [6, 1], fall: [3] },
  jupiter: { domicile: [8, 11], exalt: [3], detriment: [2, 5], fall: [9] },
  saturn: { domicile: [9, 10], exalt: [6], detriment: [3, 4], fall: [0] },
};

export function dignityOf(id: BodyId, sign: number): L | null {
  const d = DIGNITY[id];
  if (!d) return null;
  if (d.domicile.includes(sign)) return { tr: 'Kendi evinde (yönetici) — güçlü', en: 'Domicile — strong' };
  if (d.exalt.includes(sign)) return { tr: 'Yücelimde — çok güçlü', en: 'Exalted — very strong' };
  if (d.detriment.includes(sign)) return { tr: 'Zararda — zorlanır, bilinçli çaba ister', en: 'Detriment — works harder' };
  if (d.fall.includes(sign)) return { tr: 'Düşüşte — kendini ifade etmekte zorlanır', en: 'Fall — struggles to express' };
  return null;
}
