// "Hayat, Stil & Gelecekteki Partner Portföyü" — kural tabanlı sentez.
// Yöntem: Gezegen = NE (enerji) | Burç = NASIL (tarz) | Ev = NEREDE (hayat alanı).
// Fiziksel betimlemeler geleneksel astrolojideki burç-görünüm eşleştirmelerine dayanır; kesinlik iddia etmez.
import type { BodyId, Chart, AspectType } from '../engine/astro';
import { SIGN_RULERS } from '../engine/astro';
import { L, SIGNS, BODIES, HOUSES } from './base';
import { STYLE, buildStyleReport } from './style';
import { PARTNER, MC_CAREER, MONEY_STYLE, PLANET_IN_7, PLANET_IN_10, WORK_STYLE, planetInHouse, ord } from './life';
import { MERCURY, JUNO_SIGN, JUPITER, SATURN } from './placements';
import { describePerson, lillyCareer, LILLY_SIGN_COLOUR, LILLY_PLANET_COLOUR } from './lilly';

const l = (tr: string, en: string): L => ({ tr, en });
type Sw = { name: L; hex: string };
const sw = (tr: string, en: string, hex: string): Sw => ({ name: { tr, en }, hex });

// ---------------- 1. AURA & GARDIROP ----------------
export const TREND_AESTHETIC: L[] = [
  l('Sporty Chic & Edgy Athleisure', 'Sporty Chic & Edgy Athleisure'),
  l('Quiet Luxury & Old Money', 'Quiet Luxury & Old Money'),
  l('Eclectic & Indie Sleaze', 'Eclectic & Indie Sleaze'),
  l('Coquette & Soft Romantic', 'Coquette & Soft Romantic'),
  l('Glamour & Mob Wife', 'Glamour & Mob Wife'),
  l('Clean Girl & Minimal', 'Clean Girl & Minimal'),
  l('Balletcore & Soft Glam', 'Balletcore & Soft Glam'),
  l('Dark Feminine', 'Dark Feminine'),
  l('Boho Chic', 'Boho Chic'),
  l('Quiet Luxury & Power Dressing', 'Quiet Luxury & Power Dressing'),
  l('Edgy Chic & Y2K Futurism', 'Edgy Chic & Y2K Futurism'),
  l('Ethereal & Fairycore', 'Ethereal & Fairycore'),
];

/** Yükselen burcuna atfedilen geleneksel beden/duruş betimlemeleri */
export const ASC_BODY: L[] = [
  l('Atletik ve dinamik bir yapı, hızlı ve kararlı adımlar; alın, kaşlar ve yüzün üst kısmı belirgin.', 'An athletic, dynamic frame with quick, decisive steps; forehead, brows and upper face stand out.'),
  l('Sağlam ve dengeli bir yapı, zarif boyun ve omuz hattı; sakin, güven veren bir duruş.', 'A solid, balanced frame, graceful neck and shoulders; a calm, reassuring posture.'),
  l('İnce ve hareketli bir yapı, uzun kollar/eller, canlı mimikler; yaşından genç görünme eğilimi.', 'A slim, lively frame, expressive arms and hands, animated features; tends to look younger.'),
  l('Yumuşak hatlı ve yuvarlak çizgiler, ifadeli gözler; korunaklı ama sıcak bir duruş.', 'Soft, rounded lines and expressive eyes; a guarded yet warm posture.'),
  l('Dik ve gururlu bir duruş, gür saçlar, karizmatik bir varlık; dikkat çekici bir giriş.', 'An upright, proud posture, abundant hair, a charismatic presence; a noticeable entrance.'),
  l('Narin ve düzenli bir görünüm, temiz cilt ve bakımlı detaylar; mütevazı bir zarafet.', 'A neat, refined look, clear skin and well-kept details; modest elegance.'),
  l('Orantılı ve simetrik hatlar, hoş bir gülümseme; yumuşak ve davetkâr bir duruş.', 'Proportionate, symmetrical features and a lovely smile; a soft, inviting posture.'),
  l('Yoğun bakışlar, manyetik ve kontrollü bir duruş; gizemli bir aura.', 'An intense gaze, a magnetic and controlled posture; a mysterious aura.'),
  l('Uzun bacaklı, sportif ve rahat bir yapı, geniş gülümseme; açık ve enerjik duruş.', 'Long-limbed, sporty and relaxed frame, a wide smile; an open, energetic posture.'),
  l('Belirgin kemik yapısı (elmacık kemikleri, çene), ciddi ve olgun bir duruş.', 'Defined bone structure (cheekbones, jaw), a serious, mature posture.'),
  l('Kendine özgü, sıra dışı bir görünüm; genellikle uzun boylu ya da farklı bir oran algısı.', 'A distinctive, unconventional look; often tall or with unusual proportions.'),
  l('Yumuşak, akışkan hatlar ve rüya gibi gözler; hassas ve büyüleyici bir duruş.', 'Soft, flowing lines and dreamy eyes; a sensitive, enchanting posture.'),
];

// ---------------- 2. GÜZELLİK ----------------
/** Element → ten bitişi */
const SKIN_FINISH: L[] = [
  l('Bronz, güneş öpmüş ışıltı (sun-kissed glow)', 'Bronzed, sun-kissed glow'),
  l('Doğal saten / yarı mat bitiş', 'Natural satin / soft-matte finish'),
  l('Hafif ve taze ışıltı (fresh glow), ince katmanlar', 'Light, fresh glow with sheer layers'),
  l('Nemli, cam cilt (dewy / glass skin)', 'Dewy glass skin'),
];

export const MAKEUP_TREND: L[] = [
  l('Bold kırmızı dudak + net kaş', 'Bold red lip + defined brows'),
  l('Soft glam nude', 'Soft-glam nude'),
  l('Oyuncu grafik eyeliner', 'Playful graphic liner'),
  l('Douyin-soft / “ağlamış gibi” makyaj', 'Douyin-soft / “crying” makeup'),
  l('Bronz glamour', 'Bronzed glam'),
  l('No-makeup makeup', 'No-makeup makeup'),
  l('Soft glam & kirpik odaklı', 'Soft glam with lash focus'),
  l('Siren eyes & koyu dudak', 'Siren eyes & vampy lip'),
  l('Çilli, güneş öpmüş makyaj', 'Sun-kissed freckle look'),
  l('Mat ve heykelsi (sculpted) makyaj', 'Matte sculpted makeup'),
  l('Editoryal & deneysel makyaj', 'Editorial & experimental makeup'),
  l('Glass skin & holografik ışıltı', 'Glass skin & holographic shimmer'),
];

/** Yükselen burcuna göre öne çıkarılacak yüz/beden bölgesi (geleneksel burç–beden eşleştirmesi + popüler yorum) */
export const FEATURE: L[] = [
  l('Kaşlar ve alın — Koç baş bölgesini yönetir; dolgun, taranmış kaşlar yüzünü çerçeveler.', 'Brows and forehead — Aries rules the head; full, brushed-up brows frame your face.'),
  l('Dudaklar ve boyun — Boğa boğaz ve boynu yönetir; dudak ve boyun hattını vurgula.', 'Lips and neck — Taurus rules the throat; emphasise lips and neckline.'),
  l('Gözler ve eller — canlı mimiklerin ve ellerin; kirpik ve oje detaylarını öne çıkar.', 'Eyes and hands — your expressions and hands; play up lashes and nails.'),
  l('Gözler ve yanaklar — yumuşak, ışıltılı yanaklar ve nemli gözler.', 'Eyes and cheeks — soft, glowing cheeks and dewy eyes.'),
  l('Saç ve gülümseme — Aslan’ın imzası saçtır; hacim ve parlaklık.', 'Hair and smile — hair is Leo’s signature; volume and shine.'),
  l('Cilt ve kaşlar — temiz, kusursuz cilt ve düzenli kaşlar.', 'Skin and brows — clean, flawless skin and neat brows.'),
  l('Gülümseme ve cilt ışıltısı — simetri ve yumuşak ışık noktaları.', 'Smile and skin glow — symmetry and soft highlight points.'),
  l('Gözler — yoğun bakışlarını smokey veya siren eyeliner ile güçlendir.', 'Eyes — intensify your gaze with smokey or siren liner.'),
  l('Gülümseme ve ten — doğal ışıltı ve çiller.', 'Smile and complexion — natural glow and freckles.'),
  l('Elmacık kemikleri ve çene hattı — kontür ve highlighter ile heykelsi yapı.', 'Cheekbones and jawline — sculpt with contour and highlighter.'),
  l('Gözler ve sıra dışı bir detay — grafik çizgi, yüz taşı veya renkli maskara.', 'Eyes plus one unusual detail — graphic line, face gems or coloured mascara.'),
  l('Gözler — rüya gibi, ışıltılı göz makyajı ve uzun kirpikler.', 'Eyes — dreamy, shimmering eye makeup and long lashes.'),
];

/** Venüs burcuna göre dudak ve allık tonları */
export const LIP_BLUSH: { lip: Sw[]; blush: Sw[] }[] = [
  { lip: [sw('Ateş kırmızısı', 'Fire red', '#C1121F'), sw('Mercan', 'Coral', '#F25C54')], blush: [sw('Sıcak mercan', 'Warm coral', '#F28482')] },
  { lip: [sw('Gül kurusu', 'Dusty rose', '#C08081'), sw('Karamel nude', 'Caramel nude', '#B5838D')], blush: [sw('Şeftali', 'Peach', '#F7B79E')] },
  { lip: [sw('Şeker pembe', 'Candy pink', '#F49AC2'), sw('Şeffaf parlatıcı', 'Clear gloss', '#F6D6DA')], blush: [sw('Bebek pembe', 'Baby pink', '#F8C8DC')] },
  { lip: [sw('Süt pembe', 'Milky pink', '#E8A5B5'), sw('Pudra nude', 'Powder nude', '#D8A7A0')], blush: [sw('Toz pembe', 'Soft pink', '#F4B6C2')] },
  { lip: [sw('Altın-bronz nude', 'Bronze nude', '#A0522D'), sw('Turuncu-kırmızı', 'Orange red', '#E4572E')], blush: [sw('Bronz şeftali', 'Bronze peach', '#E29578')] },
  { lip: [sw('MLBB nude', 'MLBB nude', '#B07D7B'), sw('Şeffaf balm', 'Tinted balm', '#D9A5A0')], blush: [sw('Doğal gül', 'Natural rose', '#E5A4A8')] },
  { lip: [sw('Pembe gül', 'Rose pink', '#E07A93'), sw('Şeftali pembe', 'Peach pink', '#F4A6A0')], blush: [sw('Pastel pembe', 'Pastel pink', '#F7C5CC')] },
  { lip: [sw('Vişne', 'Black cherry', '#5B0E2D'), sw('Bordo', 'Oxblood', '#6A0F1F')], blush: [sw('Erik', 'Plum', '#9E4A5F')] },
  { lip: [sw('Kiremit', 'Terracotta', '#C8553D'), sw('Tarçın', 'Cinnamon', '#A0522D')], blush: [sw('Kayısı', 'Apricot', '#F3A683')] },
  { lip: [sw('Mat kahve-gül', 'Matte mauve brown', '#8E5B5B'), sw('Klasik kırmızı', 'Classic red', '#9B111E')], blush: [sw('Mat gül', 'Matte rose', '#C48B8B')] },
  { lip: [sw('Metalik mor', 'Metallic violet', '#7B4B94'), sw('Soğuk pembe', 'Icy pink', '#E5B3D3')], blush: [sw('Lila', 'Lilac', '#D3A4D9')] },
  { lip: [sw('Lavanta pembe', 'Lavender pink', '#D8A1C4'), sw('Işıltılı parlatıcı', 'Shimmer gloss', '#F2D0E0')], blush: [sw('Opal pembe', 'Opal pink', '#F3C4D3')] },
];

/** Venüs burcuna göre saç rengi seçenekleri */
export const HAIR_COLOR: L[] = [
  l('Bakır, kızıl ve sıcak kestane', 'Copper, red and warm chestnut'),
  l('Bal köpüğü, çikolata ve doğal kahve', 'Honey, chocolate and natural brunette'),
  l('Bebek ışıltıları, renkli tutamlar', 'Baby lights and colour streaks'),
  l('Yumuşak kahve, kül sarısı uçlar', 'Soft brown with ash-blonde ends'),
  l('Altın sarısı, bal ve karamel balyaj', 'Golden blonde, honey and caramel balayage'),
  l('Doğal tonda parlak ve sağlıklı saç', 'Natural, glossy, healthy shade'),
  l('Şampanya sarısı ve kakao', 'Champagne blonde and cocoa'),
  l('Siyah, koyu çikolata ve bordo yansımalar', 'Black, dark chocolate and burgundy reflects'),
  l('Güneşte açılmış uçlar, sıcak bronz', 'Sun-lightened ends, warm bronze'),
  l('Espresso, soğuk kahve ve klasik koyu tonlar', 'Espresso, cool brown and classic darks'),
  l('Gümüş, pastel veya beklenmedik renkler', 'Silver, pastels or unexpected colours'),
  l('Pastel uçlar, deniz kızı tonları', 'Pastel ends and mermaid tones'),
];

/** Venüs’e açı yapan gezegenlerin güzellik/aşk etkisi */
export const VENUS_ASPECT: Partial<Record<BodyId, L>> = {
  mars: l('Venüs–Mars açısı: Çekiciliğine tutku ve cesaret katar; kırmızı tonlar ve iddialı detaylar sana yakışır.', 'Venus–Mars aspect: adds passion and boldness to your charm; red tones and daring details suit you.'),
  jupiter: l('Venüs–Jüpiter açısı: Cömert, ışıltılı bir güzellik; parlak dokular ve bol ışık.', 'Venus–Jupiter aspect: generous, radiant beauty; shiny textures and lots of glow.'),
  saturn: l('Venüs–Satürn açısı: Zamansız, klasik bir zarafet; kaliteli az parça ve yapılandırılmış görünüm.', 'Venus–Saturn aspect: timeless, classic elegance; fewer quality pieces and structured looks.'),
  uranus: l('Venüs–Uranüs açısı: Sıra dışı ve şaşırtan bir stil; beklenmedik renk ve kesimler.', 'Venus–Uranus aspect: unusual, surprising style; unexpected colours and cuts.'),
  neptune: l('Venüs–Neptün açısı: Rüya gibi, eterik bir çekicilik; ışıltı ve akışkan dokular.', 'Venus–Neptune aspect: dreamy, ethereal allure; shimmer and fluid textures.'),
  pluto: l('Venüs–Plüton açısı: Manyetik ve yoğun bir çekim; koyu tonlar ve güçlü bakışlar.', 'Venus–Pluto aspect: magnetic, intense attraction; dark tones and powerful eyes.'),
};

// ---------------- 3. GELECEKTEKİ EŞ ----------------
/** Alçalan (7. ev başlangıcı) burcuna göre geleneksel partner görünümü */
export const SPOUSE_LOOK: L[] = [
  l('Orta-uzun boy, atletik ve dinç bir yapı; keskin, direkt bakışlar. Sportif ve pratik giyinir.', 'Medium-tall, athletic and vigorous; sharp, direct gaze. Dresses sporty and practical.'),
  l('Sağlam, dengeli bir beden; sakin ve sıcak bakışlar, güzel bir ses. Kaliteli ve klasik giyinir.', 'Solid, balanced build; calm, warm eyes and a pleasant voice. Dresses in quality classics.'),
  l('İnce ve hareketli, genç görünümlü; meraklı, parlak bakışlar. Rahat ve trendi takip eden bir stil.', 'Slim, lively and youthful; curious, bright eyes. Casual, trend-aware style.'),
  l('Yumuşak hatlı, sıcak yüzlü; şefkatli ve korumacı bakışlar. Rahat, ev sıcaklığında bir stil.', 'Soft features and a warm face; caring, protective eyes. Comfortable, homey style.'),
  l('Dik duruşlu, karizmatik; gür saçlar ve parlak bir gülümseme. Gösterişli ve özenli giyinir.', 'Upright and charismatic; full hair and a bright smile. Dresses with flair and care.'),
  l('Narin ve bakımlı; dikkatli, analitik bakışlar. Temiz, sade ve düzenli bir stil.', 'Neat and well-groomed; attentive, analytical eyes. Clean, simple, tidy style.'),
  l('Orantılı, zarif ve çekici; nazik bakışlar, hoş bir gülümseme. Şık ve uyumlu giyinir.', 'Well-proportioned, graceful and attractive; kind eyes, a lovely smile. Stylish and coordinated.'),
  l('Yoğun ve manyetik; derin, delici bakışlar. Koyu tonlar ve minimal, güçlü bir stil.', 'Intense and magnetic; deep, piercing eyes. Dark tones and minimal, powerful style.'),
  l('Uzun boylu ya da uzun bacaklı, sportif; neşeli bakışlar. Rahat, gezgin ruhlu bir stil.', 'Tall or long-legged, sporty; cheerful eyes. Relaxed, traveller style.'),
  l('Belirgin kemik yapısı, olgun görünüm; ciddi ve odaklı bakışlar. Klasik, profesyonel giyim.', 'Defined bone structure, mature look; serious, focused eyes. Classic, professional wear.'),
  l('Uzun boylu ya da sıra dışı görünümlü; zeki, mesafeli bakışlar. Farklı ve özgün bir stil.', 'Tall or unusual-looking; clever, cool gaze. Different, original style.'),
  l('Yumuşak, rüya gibi; nemli, hassas bakışlar. Akışkan, sanatsal bir stil.', 'Soft and dreamy; tender, liquid eyes. Flowing, artistic style.'),
];

export const SPOUSE_CAREER: L[] = [
  l('Spor, girişimcilik, askeri/güvenlik, mühendislik, acil sağlık', 'Sport, entrepreneurship, defence/security, engineering, emergency care'),
  l('Finans, bankacılık, gayrimenkul, gastronomi, müzik, tasarım', 'Finance, banking, real estate, food, music, design'),
  l('Medya, yazarlık, pazarlama, eğitim, ticaret, teknoloji', 'Media, writing, marketing, teaching, trade, tech'),
  l('Sağlık, psikoloji, gıda, aile işletmesi, iç mimarlık', 'Healthcare, psychology, food, family business, interiors'),
  l('Sanat, eğlence, yöneticilik, moda, sahne işleri', 'Arts, entertainment, management, fashion, stage work'),
  l('Sağlık, analiz, muhasebe, araştırma, editörlük', 'Health, analysis, accounting, research, editing'),
  l('Hukuk, diplomasi, moda, güzellik, danışmanlık', 'Law, diplomacy, fashion, beauty, consulting'),
  l('Psikoloji, cerrahi, finans/yatırım, araştırma, güvenlik', 'Psychology, surgery, finance/investment, research, security'),
  l('Akademi, turizm, hukuk, yayıncılık, uluslararası işler', 'Academia, tourism, law, publishing, international work'),
  l('Yöneticilik, devlet, mimarlık, mühendislik, finans', 'Management, government, architecture, engineering, finance'),
  l('Yazılım, bilim, teknoloji, sosyal girişim, havacılık', 'Software, science, tech, social enterprise, aviation'),
  l('Sanat, müzik, film, şifa meslekleri, sivil toplum', 'Art, music, film, healing professions, non-profits'),
];

/** 7. ev yöneticisinin bulunduğu eve göre tanışma ortamı */
export const MEET_BY_RULER_HOUSE: L[] = [
  l('Kendi girişiminle — sen harekete geçtiğinde; kişisel projeler ve spor ortamları.', 'Through your own initiative — personal projects and sports settings.'),
  l('İş/para ortamları, alışveriş, sanat ve gastronomi mekânları.', 'Work or money settings, shopping, art and food venues.'),
  l('Okul, kurslar, sosyal medya, mahalle veya kardeşler aracılığıyla.', 'School, courses, social media, the neighbourhood or siblings.'),
  l('Aile çevresi, ev ortamı veya memleket bağlantıları.', 'Family circles, home settings or hometown ties.'),
  l('Partiler, etkinlikler, hobiler, konserler ve yaratıcı ortamlar.', 'Parties, events, hobbies, concerts and creative scenes.'),
  l('İş yeri, spor salonu, sağlık ortamı veya günlük rutin.', 'The workplace, gym, health settings or daily routine.'),
  l('Resmî tanıştırmalar, ortaklıklar, düğünler ve iş birlikleri.', 'Formal introductions, partnerships, weddings and collaborations.'),
  l('Kriz/dönüşüm dönemleri, ortak finans işleri veya derin araştırma ortamları.', 'During transformative times, shared-finance matters or research settings.'),
  l('Yurt dışı, üniversite, seyahat, yabancı kültürler ve inanç toplulukları.', 'Abroad, university, travel, foreign cultures and faith communities.'),
  l('Kariyer ortamı, iş etkinlikleri veya otorite figürleri aracılığıyla.', 'Career settings, professional events or through authority figures.'),
  l('Arkadaş grupları, topluluklar, dernekler ve online ağlar.', 'Friend groups, communities, associations and online networks.'),
  l('Gizli/sessiz ortamlar: hastane, inziva, sanat atölyeleri veya uzun süre gizli kalan duygular.', 'Quiet settings: hospitals, retreats, art studios or long-hidden feelings.'),
];


const DYNAMIC_BY_ASPECT: Record<AspectType, L> = {
  conjunction: l('Venüs ve Mars kavuşuk: sevgi ve tutku iç içe; ilişkilerde yoğun ve hızlı bir kimya.', 'Venus and Mars conjunct: love and passion intertwine; intense, fast chemistry.'),
  trine: l('Venüs–Mars üçgeni: romantizm ve arzu doğal akar; uyumlu ve keyifli bir ilişki tarzı.', 'Venus–Mars trine: romance and desire flow easily; a harmonious, enjoyable relationship style.'),
  sextile: l('Venüs–Mars altmışlığı: flört ve iş birliği kolay; çaba gösterdikçe büyüyen bir bağ.', 'Venus–Mars sextile: easy flirting and teamwork; a bond that grows with effort.'),
  square: l('Venüs–Mars karesi: güçlü çekim ama zaman zaman sürtüşme; tartışmaları büyümeye çevirmek anahtar.', 'Venus–Mars square: strong attraction with some friction; turning arguments into growth is key.'),
  opposition: l('Venüs–Mars karşıtı: zıtlar birbirini çeker; denge kurulduğunda çok güçlü bir ortaklık.', 'Venus–Mars opposition: opposites attract; a very strong partnership once balanced.'),
  quincunx: l('Venüs–Mars quincunx: istekler ve sevgi dili farklı; açık iletişim ilişkiyi besler.', 'Venus–Mars quincunx: desires and love language differ; open communication nourishes the bond.'),
};

// ---------------- 4. HAYAT ALANLARI ----------------
export const RULER_HOUSE_FOCUS: L[] = [
  l('kendini keşfetmek ve kendi yolunu çizmek', 'self-discovery and carving your own path'),
  l('kaynak, para ve öz değer inşa etmek', 'building resources, money and self-worth'),
  l('iletişim, yazı, öğrenme ve yakın çevre', 'communication, writing, learning and your close circle'),
  l('aile, yuva ve köklerle bağ kurmak', 'family, home and roots'),
  l('yaratıcılık, aşk ve kendini ifade etmek', 'creativity, romance and self-expression'),
  l('iş, sağlık, rutin ve hizmet', 'work, health, routine and service'),
  l('ilişkiler, ortaklıklar ve evlilik', 'relationships, partnerships and marriage'),
  l('dönüşüm, derinlik ve ortak kaynaklar', 'transformation, depth and shared resources'),
  l('eğitim, seyahat, felsefe ve yurt dışı', 'education, travel, philosophy and abroad'),
  l('kariyer, statü ve toplumsal başarı', 'career, status and public achievement'),
  l('topluluklar, arkadaşlar ve gelecek vizyonu', 'communities, friends and future vision'),
  l('iç dünya, maneviyat ve yaratıcı/şifa çalışmaları', 'inner life, spirituality and creative/healing work'),
];

export const EIGHTH_STYLE: L[] = [
  l('Ortak kaynaklarda hızlı ve cesur kararlar; risk almaktan çekinmezsin.', 'Fast, bold decisions with shared resources; you don’t shy from risk.'),
  l('Miras, birikim ve kalıcı yatırımlar; ortak para konusunda sabırlı ve güvenilir.', 'Inheritance, savings and lasting investments; patient and reliable with joint money.'),
  l('Ortaklık gelirleri iletişim ve anlaşmalarla gelir; sözleşmeleri dikkatle oku.', 'Joint income comes through deals and communication; read contracts carefully.'),
  l('Aile kaynakları ve gayrimenkul; duygusal güven ile para iç içe.', 'Family resources and property; emotional security and money intertwine.'),
  l('Yaratıcı ortaklıklar ve partnerin cömertliği; ortak kaynaklarda cömertsin.', 'Creative partnerships and a generous partner; generous with shared resources.'),
  l('Detaylı finansal planlama, vergi ve bütçe yönetiminde yeteneklisin.', 'Talent for detailed financial planning, taxes and budgeting.'),
  l('Partnerin finansal katkısı ve adil paylaşım; evlilik maddi dengeyi etkiler.', 'A partner’s financial input and fair sharing; marriage shapes finances.'),
  l('Stratejik yatırım, araştırma ve derin finansal sezgi; güçlü bir yerleşim.', 'Strategic investing, research and deep financial instinct; a strong placement.'),
  l('Yurt dışı veya eğitim kaynaklı ortak kazançlar; iyimser yatırımcı.', 'Shared gains via abroad or education; an optimistic investor.'),
  l('Uzun vadeli, disiplinli birikim; ortak finanslarda temkinli ve kurumsal.', 'Long-term, disciplined savings; cautious and structured with joint money.'),
  l('Teknoloji, kripto/yenilikçi yatırımlar; ani kazanç ve kayıplara dikkat.', 'Tech and innovative investments; watch sudden gains and losses.'),
  l('Sezgisel ama sınırları belirsiz; ortak parada net anlaşmalar yap.', 'Intuitive but boundaries blur; make clear agreements on joint money.'),
];

export const NINTH_STYLE: L[] = [
  l('İnançlarını cesurca savunur, hızlı öğrenirsin.', 'You defend beliefs boldly and learn fast.'),
  l('Somut ve pratik bilgiye değer verirsin; yavaş ama derin öğrenirsin.', 'You value practical knowledge; you learn slowly but deeply.'),
  l('Çok yönlü bir öğrencisin; dil öğrenmek ve yazmak sana iyi gelir.', 'A versatile learner; languages and writing suit you.'),
  l('İnançların aile ve geleneklerle bağlantılı; duygusal öğrenirsin.', 'Beliefs tie to family and tradition; you learn emotionally.'),
  l('Öğrettiğinde parlarsın; yaratıcı eğitim alanları sana göre.', 'You shine as a teacher; creative education suits you.'),
  l('Analitik ve araştırmacı bir zihin; uzmanlık eğitimi sana uygun.', 'An analytical, research-minded intellect; specialist training suits you.'),
  l('Adalet ve estetik felsefesi; hukuk, sanat ve diplomasi ilgini çeker.', 'A philosophy of justice and beauty; law, art and diplomacy draw you.'),
  l('Gizli bilgiler ve psikoloji; derin dönüşümlü bir inanç yolculuğu.', 'Hidden knowledge and psychology; a transformative belief journey.'),
  l('Özgür ruhlu bir filozof; seyahat ve yabancı kültürler seni büyütür.', 'A free-spirited philosopher; travel and cultures expand you.'),
  l('Disiplinli öğrenme, akademik başarı ve kurumsal eğitim.', 'Disciplined study, academic achievement and formal education.'),
  l('Bilim, teknoloji ve ilerici fikirler; kalıpları sorgularsın.', 'Science, tech and progressive ideas; you question norms.'),
  l('Maneviyat, sanat ve sezgi temelli bir inanç dünyası.', 'A belief world grounded in spirituality, art and intuition.'),
];

/** Kuzey Düğüm’ün bulunduğu ev (eksen: N ev ↔ N+6 ev) */
export const NODE_AXIS: { grow: L; release: L }[] = [
  { grow: l('Kendi kimliğini ve bağımsızlığını öne koymak', 'Putting your own identity and independence first'), release: l('Kendini sürekli başkalarına göre tanımlamak', 'Defining yourself through others') },
  { grow: l('Kendi değerini ve kaynaklarını inşa etmek', 'Building your own worth and resources'), release: l('Başkalarının kaynaklarına ve krizlere bağımlılık', 'Dependence on others’ resources and crises') },
  { grow: l('Merak, iletişim ve şimdiki ana odaklanmak', 'Curiosity, conversation and the present moment'), release: l('Her şeyi bildiğini düşünmek, dogmatizm', 'Assuming you know it all; dogmatism') },
  { grow: l('Yuva, aile ve duygusal kökler', 'Home, family and emotional roots'), release: l('Sadece kariyer ve statü üzerinden var olmak', 'Existing only through career and status') },
  { grow: l('Yaratıcılık, oyun, aşk ve kalbinden yaşamak', 'Creativity, play, romance and living from the heart'), release: l('Kalabalığın onayına bağımlılık', 'Needing the crowd’s approval') },
  { grow: l('Düzen, sağlık ve pratik hizmet', 'Order, health and practical service'), release: l('Kaçış, belirsizlik ve kurban rolü', 'Escapism, vagueness and victim roles') },
  { grow: l('Ortaklık, iş birliği ve “biz” olmak', 'Partnership, collaboration and becoming “we”'), release: l('Her şeyi tek başına yapma ısrarı', 'Insisting on doing everything alone') },
  { grow: l('Derin bağ, paylaşım ve dönüşüm', 'Deep bonds, sharing and transformation'), release: l('Sahip olmaya ve konfora takılı kalmak', 'Clinging to possessions and comfort') },
  { grow: l('Anlam, eğitim, seyahat ve büyük resim', 'Meaning, education, travel and the big picture'), release: l('Dedikodu ve yüzeysel bilgi kalabalığı', 'Gossip and surface-level noise') },
  { grow: l('Kariyer, sorumluluk ve toplumsal rol', 'Career, responsibility and a public role'), release: l('Sadece güvenli alanda kalmak', 'Hiding in the safe zone') },
  { grow: l('Topluluk, arkadaşlık ve kolektif hayaller', 'Community, friendship and shared dreams'), release: l('Yalnızca kendi sahnende parlamak', 'Shining only on your own stage') },
  { grow: l('Teslimiyet, maneviyat ve sezgi', 'Surrender, spirituality and intuition'), release: l('Aşırı kontrol ve mükemmeliyetçilik', 'Over-control and perfectionism') },
];

export const ADVICE_NODE: L[] = NODE_AXIS.map(n => ({
  tr: `Ruhsal yönün için: ${n.grow.tr.toLocaleLowerCase('tr')} konusunda bu ay somut bir adım at; ${n.release.tr.toLocaleLowerCase('tr')} eğilimini fark ettiğinde dur.`,
  en: `For your soul path: take one concrete step this month toward ${n.grow.en.toLowerCase()}; pause when you notice ${n.release.en.toLowerCase()}.`,
}));

const ADVICE_ELEMENT: L[] = [
  l('Eksik element Ateş: Haftada en az üç kez hareket et ve bir karar ver, bekleme.', 'Missing Fire: move your body three times a week and make one decision without waiting.'),
  l('Eksik element Toprak: Bir bütçe ve sabit bir günlük rutin oluştur.', 'Missing Earth: create a budget and one fixed daily routine.'),
  l('Eksik element Hava: Fikirlerini yazıya dök ve yeni insanlarla tanış.', 'Missing Air: write down your ideas and meet new people.'),
  l('Eksik element Su: Duygu günlüğü tut ve sezgilerine alan aç.', 'Missing Water: keep a feelings journal and make room for intuition.'),
];

// ---------------- RAPOR ----------------
export interface Portfolio {
  aura: { aesthetic: L; body: L; lilly: L[]; classicColours: L | null; wardrobe: L[]; palette: { name: L; hex: string; from: L }[]; firstHouse: L[] };
  beauty: { trend: L; finish: L; makeup: L; feature: L | null; lip: Sw[]; blush: Sw[]; hairCut: L | null; hairColor: L; venusMods: L[] };
  spouse: { desc: number | null; look: L | null; lilly: L[]; personality: L | null; career: L | null; meet: L | null; dynamic: L; juno: L | null; junoHouse: number; in7: L[]; ruler: L | null };
  core: { chartRuler: L | null; career: L | null; careerFields: L | null; lillyCareer: L[]; work6: L | null; luck: L; lesson: L; in10: L[]; money2: L | null; money8: L | null; mind: L; ninth: L | null; node: { grow: L; release: L; sign: number; house: number }; advice: L[] };
}

function personLines(ch: Chart, house: number): L[] {
  const d = describePerson(ch, house);
  return d ? [d.cusp, d.ruler, ...d.planets, d.moon] : [];
}

const elemName = (i: number): L => [l('Ateş', 'Fire'), l('Toprak', 'Earth'), l('Hava', 'Air'), l('Su', 'Water')][i];

export function buildPortfolio(ch: Chart): Portfolio {
  const P = ch.positions;
  const style = buildStyleReport(ch);
  const asc = style.asc, venus = P.venus.sign;
  const cuspSign = (h: number) => (ch.cusps.length ? Math.floor(ch.cusps[h - 1] / 30) : null);

  // 1. Aura
  const aStyle = asc !== null ? STYLE[asc] : STYLE[venus];
  const aura = {
    aesthetic: asc !== null
      ? { tr: `${TREND_AESTHETIC[asc].tr} (Yükselen ${SIGNS[asc].tr}) × ${TREND_AESTHETIC[venus].tr} (Venüs ${SIGNS[venus].tr})`, en: `${TREND_AESTHETIC[asc].en} (${SIGNS[asc].en} Rising) × ${TREND_AESTHETIC[venus].en} (Venus in ${SIGNS[venus].en})` }
      : { tr: `${TREND_AESTHETIC[venus].tr} (Venüs ${SIGNS[venus].tr})`, en: `${TREND_AESTHETIC[venus].en} (Venus in ${SIGNS[venus].en})` },
    body: asc !== null ? ASC_BODY[asc] : l('Yükselen burç için doğum saati gerekli.', 'Your birth time is needed for the Ascendant.'),
    lilly: personLines(ch, 1),
    classicColours: asc !== null ? {
      tr: `Lilly'nin klasik renkleri: Yükselen ${SIGNS[asc].tr} → ${LILLY_SIGN_COLOUR[asc].tr}; harita yöneticisi ${BODIES[SIGN_RULERS[asc]].name.tr} → ${LILLY_PLANET_COLOUR[SIGN_RULERS[asc]]!.tr}.`,
      en: `Lilly's classic colours: ${SIGNS[asc].en} Rising → ${LILLY_SIGN_COLOUR[asc].en}; chart ruler ${BODIES[SIGN_RULERS[asc]].name.en} → ${LILLY_PLANET_COLOUR[SIGN_RULERS[asc]]!.en}.`,
    } : null,
    wardrobe: [aStyle.clothes, ...(asc !== null && asc !== venus ? [STYLE[venus].clothes] : []), STYLE[venus].accessories],
    palette: style.palette,
    firstHouse: style.firstHouse,
  };

  // 2. Güzellik
  const venusMods: L[] = [];
  for (const a of ch.aspects) {
    const other = a.a === 'venus' ? a.b : a.b === 'venus' ? a.a : null;
    if (other && VENUS_ASPECT[other] && a.type !== 'quincunx') venusMods.push(VENUS_ASPECT[other]!);
  }
  const vEl = venus % 4, aEl = asc !== null ? asc % 4 : vEl;
  const finish: L = vEl === aEl ? SKIN_FINISH[vEl] : { tr: `${SKIN_FINISH[vEl].tr}; ${SKIN_FINISH[aEl].tr.toLocaleLowerCase('tr')} ile dengele`, en: `${SKIN_FINISH[vEl].en}, balanced with ${SKIN_FINISH[aEl].en.toLowerCase()}` };
  const beauty = {
    trend: MAKEUP_TREND[venus],
    finish,
    makeup: STYLE[venus].makeup,
    feature: asc !== null ? FEATURE[asc] : null,
    lip: LIP_BLUSH[venus].lip,
    blush: LIP_BLUSH[venus].blush,
    hairCut: asc !== null ? STYLE[asc].hair : null,
    hairColor: HAIR_COLOR[venus],
    venusMods: [...new Set(venusMods)],
  };

  // 3. Eş
  const desc = cuspSign(7);
  const ruler7 = desc !== null ? SIGN_RULERS[desc] : null;
  const vm = ch.aspects.find(a => (a.a === 'venus' && a.b === 'mars') || (a.a === 'mars' && a.b === 'venus'));
  const dynamic: L = vm ? DYNAMIC_BY_ASPECT[vm.type] : {
    tr: `Venüs (${SIGNS[venus].tr}, ${elemName(venus % 4).tr}) ve Mars (${SIGNS[P.mars.sign].tr}, ${elemName(P.mars.sign % 4).tr}) birbirinden bağımsız çalışır: sevgi dilin ile arzuların farklı kanallardan akar; ilişkide ikisine de ayrı alan açmak dengeyi sağlar.`,
    en: `Venus (${SIGNS[venus].en}, ${elemName(venus % 4).en}) and Mars (${SIGNS[P.mars.sign].en}, ${elemName(P.mars.sign % 4).en}) work independently: affection and desire flow through different channels; giving each its own space keeps balance.`,
  };
  const in7 = (Object.keys(PLANET_IN_7) as BodyId[]).filter(p => P[p]?.house === 7).map(p => PLANET_IN_7[p]!);
  const spouse = {
    desc,
    look: desc !== null ? SPOUSE_LOOK[desc] : null,
    lilly: personLines(ch, 7),
    personality: desc !== null ? PARTNER[desc] : null,
    career: desc !== null ? SPOUSE_CAREER[desc] : null,
    meet: ruler7 && P[ruler7].house ? MEET_BY_RULER_HOUSE[P[ruler7].house - 1] : null,
    ruler: ruler7 && P[ruler7].house ? {
      tr: `7. evin yöneticisi ${BODIES[ruler7].name.tr}, ${SIGNS[P[ruler7].sign].tr} burcunda ve ${P[ruler7].house}. evde (${HOUSES[P[ruler7].house - 1].short.tr.toLocaleLowerCase('tr')}).`,
      en: `Your 7th-house ruler ${BODIES[ruler7].name.en} is in ${SIGNS[P[ruler7].sign].en}, in the ${ord(P[ruler7].house)} house (${HOUSES[P[ruler7].house - 1].short.en.toLowerCase()}).`,
    } : null,
    dynamic,
    juno: P.juno ? JUNO_SIGN[P.juno.sign] : null,
    junoHouse: P.juno?.house ?? 0,
    in7,
  };

  // 4. Hayat alanları
  const chartRulerId = asc !== null ? SIGN_RULERS[asc] : null;
  const cr = chartRulerId ? P[chartRulerId] : null;
  const mc = ch.mc !== null ? Math.floor(ch.mc / 30) : null;
  const sec = cuspSign(2), eig = cuspSign(8), nin = cuspSign(9);
  const nodeH = P.node.house;
  const node = nodeH ? { ...NODE_AXIS[nodeH - 1], sign: P.node.sign, house: nodeH } : {
    grow: { tr: `${SIGNS[P.node.sign].tr} niteliklerini geliştirmek`, en: `Developing ${SIGNS[P.node.sign].en} qualities` },
    release: { tr: `${SIGNS[(P.node.sign + 6) % 12].tr} alışkanlıklarına sığınmak`, en: `Hiding in ${SIGNS[(P.node.sign + 6) % 12].en} habits` },
    sign: P.node.sign, house: 0,
  };

  // Tavsiyeler: düğüm, harita yöneticisi, eksik element
  const ec = [0, 0, 0, 0];
  (['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'] as BodyId[]).forEach(p => ec[P[p].sign % 4]++);
  if (asc !== null) ec[asc % 4]++;
  const weakest = ec.indexOf(Math.min(...ec));
  const advice: L[] = [
    nodeH ? ADVICE_NODE[nodeH - 1] : { tr: `Ruhsal yönün için: ${node.grow.tr.toLocaleLowerCase('tr')} yönünde bu ay somut bir adım at.`, en: `For your soul path: take one concrete step toward ${node.grow.en.toLowerCase()} this month.` },
    cr && cr.house ? {
      tr: `Harita yöneticin ${BODIES[chartRulerId!].name.tr} ${cr.house}. evde: enerjini öncelikle ${RULER_HOUSE_FOCUS[cr.house - 1].tr} alanına yatır; haftalık planına bu alan için sabit bir zaman koy.`,
      en: `Your chart ruler ${BODIES[chartRulerId!].name.en} is in the ${ord(cr.house)} house: invest first in ${RULER_HOUSE_FOCUS[cr.house - 1].en}; book a fixed weekly slot for it.`,
    } : { tr: 'Doğum saatini öğrenebilirsen harita yöneticin ve evlerin hesaplanır; bu, tavsiyeleri çok daha kişisel yapar.', en: 'If you can find your birth time, your chart ruler and houses can be calculated, making advice far more personal.' },
    ADVICE_ELEMENT[weakest],
  ];

  const in10 = (Object.keys(PLANET_IN_10) as BodyId[]).filter(p => P[p]?.house === 10).map(p => PLANET_IN_10[p]!);
  const core = {
    chartRuler: cr && chartRulerId ? {
      tr: `Yükselen ${SIGNS[asc!].tr} → harita yöneticin ${BODIES[chartRulerId].name.tr}, ${SIGNS[cr.sign].tr} burcunda${cr.house ? ` ve ${cr.house}. evde` : ''}. Hayat temanın merkezinde ${cr.house ? RULER_HOUSE_FOCUS[cr.house - 1].tr : 'bu burcun nitelikleri'} var.`,
      en: `${SIGNS[asc!].en} Rising → your chart ruler is ${BODIES[chartRulerId].name.en} in ${SIGNS[cr.sign].en}${cr.house ? `, in the ${ord(cr.house)} house` : ''}. Your life theme centres on ${cr.house ? RULER_HOUSE_FOCUS[cr.house - 1].en : 'this sign’s qualities'}.`,
    } : null,
    career: mc !== null ? MC_CAREER[mc].text : null,
    careerFields: mc !== null ? MC_CAREER[mc].fields : null,
    lillyCareer: (() => { const c = lillyCareer(ch); return c ? [c.text, ...c.extra] : []; })(),
    work6: cuspSign(6) !== null ? WORK_STYLE[cuspSign(6)!] : null,
    luck: { tr: `${JUPITER[P.jupiter.sign].tr}${P.jupiter.house ? ' ' + planetInHouse('jupiter', P.jupiter.house).tr : ''}`, en: `${JUPITER[P.jupiter.sign].en}${P.jupiter.house ? ' ' + planetInHouse('jupiter', P.jupiter.house).en : ''}` },
    lesson: { tr: `${SATURN[P.saturn.sign].tr}${P.saturn.house ? ' ' + planetInHouse('saturn', P.saturn.house).tr : ''}`, en: `${SATURN[P.saturn.sign].en}${P.saturn.house ? ' ' + planetInHouse('saturn', P.saturn.house).en : ''}` },
    in10,
    money2: sec !== null ? MONEY_STYLE[sec] : null,
    money8: eig !== null ? EIGHTH_STYLE[eig] : null,
    mind: MERCURY[P.mercury.sign],
    ninth: nin !== null ? NINTH_STYLE[nin] : null,
    node, advice,
  };

  return { aura, beauty, spouse, core };
}
