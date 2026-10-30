import type { Chart, BodyId } from '../engine/astro';
import { L, SIGNS } from './base';

export interface StyleProfile {
  aesthetic: L;            // estetik adı
  colors: { name: L; hex: string }[];
  clothes: L;              // kesimler, kumaşlar, parçalar
  hair: L;
  makeup: L;
  accessories: L;
  scent: L;
  avoid: L;
  comfort: L;              // Ay burcu → rahat günler
  power: L;                // Mars burcu → spor / güç kombini
  work: L;                 // MC burcu → profesyonel imaj
}

const P = (o: { [K in keyof StyleProfile]: StyleProfile[K] }) => o;
const c = (tr: string, en: string, hex: string) => ({ name: { tr, en }, hex });
const l = (tr: string, en: string): L => ({ tr, en });

export const STYLE: StyleProfile[] = [
  P({ // Koç
    aesthetic: l('Sportif-şık & cesur', 'Sporty-chic & bold'),
    colors: [c('Ateş kırmızısı', 'Fire red', '#D7263D'), c('Mercan', 'Coral', '#FF6F59'), c('Siyah', 'Black', '#111111'), c('Beyaz', 'White', '#FAFAFA')],
    clothes: l('Biker ceket, keskin kesimli blazer, deri detaylar, sneaker, rahat hareket eden net çizgiler. Abartısız ama iddialı tek parça.', 'Biker jackets, sharp blazers, leather accents, sneakers, clean lines you can move in. One bold statement piece.'),
    hair: l('Hızlı şekillenen kesimler: kısa bob, pixie, yüksek at kuyruğu, katlı kesimler. Kızıl ve bakır tonlar Koç enerjisiyle özdeşleşir.', 'Low-effort cuts: short bob, pixie, high ponytail, layered shags. Red and copper tones are classic Aries.'),
    makeup: l('Kırmızı ruj, cilt bitişi doğal, belirgin kaş. 5 dakikada biten ama etkili bir görünüm.', 'Red lip, natural skin, defined brows. A five-minute look with impact.'),
    accessories: l('Metal saat, kalın zincir, minimal yüzük; fonksiyonel çanta.', 'Metal watch, chunky chain, minimal rings; functional bag.'),
    scent: l('Baharatlı, biberli ve ferah notalar (pembe biber, zencefil).', 'Spicy, peppery, fresh notes (pink pepper, ginger).'),
    avoid: l('Hareketini kısıtlayan, çok narin ve bakım isteyen parçalar.', 'Fussy, fragile, high-maintenance pieces that restrict movement.'),
    comfort: l('Eşofman takımı, hoodie ve sneaker — her an harekete hazır.', 'Matching tracksuit, hoodie and sneakers — ready to move.'),
    power: l('Kırmızı detaylı spor kıyafet, koşu ayakkabısı; rekabetçi görünüm.', 'Sportswear with red accents, running shoes; a competitive look.'),
    work: l('Keskin blazer + düz pantolon; lider gibi görünen net silüetler.', 'Sharp blazer + straight trousers; crisp leader silhouettes.'),
  }),
  P({ // Boğa
    aesthetic: l('Lüks doğal & “old money”', 'Luxe natural & old money'),
    colors: [c('Toprak yeşili', 'Sage green', '#8A9A5B'), c('Krem', 'Cream', '#F3E9D2'), c('Pudra pembe', 'Blush pink', '#E8B4B8'), c('Camel', 'Camel', '#C19A6B')],
    clothes: l('Kaşmir, ipek, keten, yün gibi kaliteli dokular; zamansız trençkot, triko, bol paça pantolon. Az ama çok kaliteli parça.', 'Cashmere, silk, linen and wool; timeless trench, knitwear, wide-leg trousers. Few but high-quality pieces.'),
    hair: l('Uzun, parlak ve bakımlı saç; yumuşak dalgalar. Doğal kahve ve bal tonları; saç bakımına yatırım.', 'Long, glossy, well-kept hair; soft waves. Natural brown and honey tones; invest in hair care.'),
    makeup: l('Işıltılı cilt, nude ve pembe dudak, yumuşak bronz. Lüks cilt bakımı makyajdan önce gelir.', 'Glowy skin, nude-pink lips, soft bronze. Luxe skincare comes before makeup.'),
    accessories: l('Altın takı, inci, deri çanta; boyun bölgesini öne çıkaran kolye ve fular (Boğa boynu yönetir).', 'Gold jewellery, pearls, leather bags; necklaces and scarves that highlight the neck (Taurus rules the throat).'),
    scent: l('Gül, vanilya, sandal ağacı — sıcak ve duyusal.', 'Rose, vanilla, sandalwood — warm and sensual.'),
    avoid: l('Ucuz kumaş, rahatsız ayakkabı ve sezonluk hızlı moda.', 'Cheap fabrics, uncomfortable shoes and fast fashion.'),
    comfort: l('Yumuşak triko eşofman, kaşmir hırka, peluş terlik.', 'Soft knit lounge sets, cashmere cardigan, plush slippers.'),
    power: l('Pilates/yoga seti, nötr tonlarda konforlu spor giyim.', 'Pilates/yoga set in neutral tones.'),
    work: l('Kaliteli ceket, ipek gömlek, deri çanta; güven veren klasik.', 'Quality blazer, silk blouse, leather tote; trustworthy classic.'),
  }),
  P({ // İkizler
    aesthetic: l('Eklektik & oyuncu', 'Eclectic & playful'),
    colors: [c('Limon sarısı', 'Lemon yellow', '#F7D44C'), c('Açık mavi', 'Sky blue', '#87CEEB'), c('Lila', 'Lilac', '#C8A2C8'), c('Nane', 'Mint', '#98E2C6')],
    clothes: l('Desen karıştırma, katmanlı kombinler, grafik tişört, mini etek + blazer, çok yönlü parçalar. Her gün farklı bir sen.', 'Mixed prints, layering, graphic tees, mini skirt + blazer, versatile pieces. A different you every day.'),
    hair: l('Perçem, tokalar, örgüler; sık stil değişimi. Renkli tutam veya geçici renkler denemekten çekinme.', 'Bangs, clips, braids; frequent changes. Try colour streaks or temporary colour.'),
    makeup: l('Renkli eyeliner, glitter, trend denemeleri; eğlenceli ve değişken.', 'Coloured liner, glitter, trend experiments; fun and changeable.'),
    accessories: l('Çoklu küpe, renkli çanta, yüzük kombinasyonu; elleri öne çıkaran oje (İkizler elleri yönetir).', 'Ear stacks, colourful bags, ring mixes; nail art for your hands (Gemini rules the hands).'),
    scent: l('Narenciye, nane, yeşil çay — ferah ve hafif.', 'Citrus, mint, green tea — light and fresh.'),
    avoid: l('Tek tip, ağır ve sıkıcı kombinler.', 'Monotone, heavy, boring outfits.'),
    comfort: l('Oversize tişört + biker şort, renkli çorap.', 'Oversized tee + bike shorts, fun socks.'),
    power: l('Renkli sneaker, dans/aerobik kıyafeti.', 'Colourful sneakers, dance/aerobics wear.'),
    work: l('Yaratıcı blazer + desenli gömlek; zeki ve modern.', 'Creative blazer + printed shirt; smart and modern.'),
  }),
  P({ // Yengeç
    aesthetic: l('Romantik vintage & yumuşak', 'Soft romantic vintage'),
    colors: [c('İnci beyazı', 'Pearl white', '#F0EEE9'), c('Gümüş', 'Silver', '#C0C0C0'), c('Pudra mavi', 'Powder blue', '#B0C4DE'), c('Lavanta', 'Lavender', '#C9B8E8')],
    clothes: l('Vintage elbiseler, dantel, fırfır, oversize hırka, anneanne yakası; koruyucu, sarıp sarmalayan dokular.', 'Vintage dresses, lace, ruffles, oversized cardigans, Peter Pan collars; cocooning textures.'),
    hair: l('Yumuşak dalgalar, yarım toplu saç, kurdele. Doğal ve yumuşak tonlar.', 'Soft waves, half-up styles, ribbons. Natural, gentle tones.'),
    makeup: l('Pembe allık, nemli cilt, gümüş/inci ışıltı; “ağlamış gibi” yumuşak göz makyajı.', 'Pink blush, dewy skin, silver/pearl shimmer; soft “just cried” eyes.'),
    accessories: l('İnci, gümüş takı, madalyon kolye, aile yadigârı parçalar.', 'Pearls, silver, lockets, heirloom pieces.'),
    scent: l('Pudralı, sabunsu, süt ve çiçek notaları.', 'Powdery, soapy, milky floral notes.'),
    avoid: l('Sert, köşeli ve çok agresif parçalar.', 'Harsh, angular, aggressive pieces.'),
    comfort: l('Pijama takımı, kalın çorap, battaniye gibi hırka.', 'Pyjama sets, thick socks, blanket-like cardigan.'),
    power: l('Yüzme kıyafeti, yumuşak tonlarda yoga seti.', 'Swimwear, soft-toned yoga set.'),
    work: l('Yumuşak triko + kumaş pantolon; güven veren ve sıcak.', 'Soft knit + tailored trousers; warm and reassuring.'),
  }),
  P({ // Aslan
    aesthetic: l('Glamour & ışıltılı', 'Glamorous & radiant'),
    colors: [c('Altın', 'Gold', '#D4AF37'), c('Turuncu', 'Orange', '#F28C28'), c('Bordo', 'Burgundy', '#800020'), c('Leopar tonları', 'Leopard tones', '#C68E3F')],
    clothes: l('Statement parçalar, saten, payet, leopar desen, vatkalı ceketler; göz alıcı ve kendinden emin.', 'Statement pieces, satin, sequins, leopard print, power shoulders; eye-catching and confident.'),
    hair: l('Hacim! Büyük bukleler, aslan yelesi gibi gür saç, bal ve altın sarısı tonlar. Aslan’ın imzası saçtır.', 'Volume! Big curls, a lion’s-mane blowout, honey and golden tones. Hair is Leo’s signature.'),
    makeup: l('Bronz ve altın ışıltı, kedi gözü eyeliner, highlighter; “güneş öpmüş” cilt.', 'Bronze and gold glow, cat-eye liner, highlighter; sun-kissed skin.'),
    accessories: l('Büyük altın takılar, güneş gözlüğü, kemer; dikkat çekici çanta.', 'Big gold jewellery, sunglasses, statement belts and bags.'),
    scent: l('Amber, portakal çiçeği, yasemin — sıcak ve ışıltılı.', 'Amber, orange blossom, jasmine — warm and radiant.'),
    avoid: l('Seni kalabalıkta kaybettiren sönük, gri kombinler.', 'Dull grey outfits that make you blend in.'),
    comfort: l('Saten pijama, şık ev elbisesi — evde bile yıldız.', 'Satin pyjamas, chic loungewear — a star even at home.'),
    power: l('Altın detaylı spor seti, dans kıyafetleri.', 'Sports set with gold accents, dancewear.'),
    work: l('Renkli takım elbise, belirgin omuzlar; sahneye çıkan lider.', 'Coloured suit, strong shoulders; a leader on stage.'),
  }),
  P({ // Başak
    aesthetic: l('Minimal & “clean girl”', 'Minimal “clean girl”'),
    colors: [c('Bej', 'Beige', '#D9C8A9'), c('Zeytin yeşili', 'Olive', '#708238'), c('Lacivert', 'Navy', '#1F2A44'), c('Kırık beyaz', 'Off-white', '#F5F2EA')],
    clothes: l('Kapsül gardırop, ütülü gömlek, düz pantolon, kaliteli temel parçalar; temiz ve fonksiyonel.', 'Capsule wardrobe, crisp shirts, straight trousers, quality basics; clean and functional.'),
    hair: l('Sleek topuz, düz ve bakımlı saç, düzenli uç kesimi; doğal tonlar.', 'Sleek bun, smooth healthy hair, regular trims; natural tones.'),
    makeup: l('“No-makeup makeup”, cilt bakımı odaklı, taranmış kaşlar, nude dudak.', 'No-makeup makeup, skincare-first, brushed-up brows, nude lip.'),
    accessories: l('İnce zincir, minimal saat, kaliteli tote çanta; az ve işlevsel.', 'Fine chains, minimal watch, quality tote; few and functional.'),
    scent: l('Lavanta, beyaz misk, temiz pamuk.', 'Lavender, white musk, clean cotton.'),
    avoid: l('Dağınık, abartılı, logo dolu kombinler.', 'Messy, overdone, logo-heavy looks.'),
    comfort: l('Pamuklu, nefes alan, düzenli ev kıyafeti.', 'Breathable cotton, tidy loungewear.'),
    power: l('Fonksiyonel tenis/pilates kıyafeti.', 'Functional tennis/pilates outfit.'),
    work: l('Mükemmel ütülü gömlek + kumaş pantolon; kusursuz detay.', 'Perfectly pressed shirt + tailored trousers; flawless detail.'),
  }),
  P({ // Terazi
    aesthetic: l('Zarif feminen & estetik', 'Elegant & aesthetic'),
    colors: [c('Pastel pembe', 'Pastel pink', '#F4C2C2'), c('Bebek mavisi', 'Baby blue', '#A7C7E7'), c('Şampanya', 'Champagne', '#F7E7CE'), c('Lavanta', 'Lavender', '#E6E6FA')],
    clothes: l('Uyumlu renk paletleri, akışkan elbiseler, tüvit ceket, kuşaklı kesimler; simetri ve oran önemli.', 'Coordinated palettes, flowy dresses, tweed jackets, belted waists; symmetry and proportion matter.'),
    hair: l('Yumuşak bukleler, bakımlı katlar, curtain bang; şampanya sarısı ve kakao tonları.', 'Soft curls, polished layers, curtain bangs; champagne blonde and cocoa tones.'),
    makeup: l('Dengeli, romantik makyaj: pembe dudak, şeftali allık, kirpiğe odak.', 'Balanced romantic makeup: pink lips, peachy blush, lash focus.'),
    accessories: l('Narin altın/gül altın takılar, kurdeleler, şık mini çanta.', 'Delicate gold/rose gold, ribbons, chic mini bags.'),
    scent: l('Şakayık, gül, armut — zarif çiçeksi.', 'Peony, rose, pear — elegant floral.'),
    avoid: l('Uyumsuz renk karmaşası ve kaba kesimler.', 'Clashing chaos and crude cuts.'),
    comfort: l('Pastel ev takımı, saten göz bandı.', 'Pastel lounge set, satin eye mask.'),
    power: l('Tenis eteği + polo, renk uyumlu bale/pilates seti.', 'Tennis skirt + polo, matching ballet/pilates set.'),
    work: l('Kombin ceket-etek takım, uyumlu renkler; diplomatik zarafet.', 'Coordinated suit sets; diplomatic elegance.'),
  }),
  P({ // Akrep
    aesthetic: l('Karanlık lüks & gizemli', 'Dark luxe & mysterious'),
    colors: [c('Siyah', 'Black', '#0B0B0B'), c('Bordo', 'Oxblood', '#4A0404'), c('Koyu mor', 'Deep plum', '#4B0F3A'), c('Antrasit', 'Charcoal', '#36454F')],
    clothes: l('Monokrom siyah, deri, dantel, vücuda oturan kesimler, korse detayları; az gösterip çok etkileyen.', 'Monochrome black, leather, lace, body-skimming cuts, corset details; reveals little, impacts much.'),
    hair: l('Koyu ve parlak tonlar (siyah, koyu kahve, bordo), wet look, keskin kesimler.', 'Dark glossy tones (black, espresso, burgundy), wet look, sharp cuts.'),
    makeup: l('Smokey eye, koyu dudak (vişne, bordo), keskin kontür; bakışlara odak.', 'Smokey eye, dark vampy lips, sharp contour; all about the gaze.'),
    accessories: l('Gümüş/oksitli takı, siyah taşlar, gizemli tek parça yüzük.', 'Silver/oxidised jewellery, black stones, one mysterious ring.'),
    scent: l('Oud, tütsü, siyah gül, misk — yoğun ve kalıcı.', 'Oud, incense, black rose, musk — intense and lasting.'),
    avoid: l('Fazla tatlı, çocuksu ve “ne kadar açık o kadar iyi” stiller.', 'Overly sweet, childish, overexposed looks.'),
    comfort: l('Siyah oversize set, ipek bornoz.', 'Black oversized set, silk robe.'),
    power: l('Tamamen siyah spor kıyafet; boks/HIIT tarzı.', 'All-black activewear; boxing/HIIT vibe.'),
    work: l('Siyah takım, keskin çizgiler; otorite ve gizem.', 'Black suit, sharp lines; authority and mystique.'),
  }),
  P({ // Yay
    aesthetic: l('Bohem gezgin', 'Boho traveller'),
    colors: [c('Mor', 'Purple', '#6A0DAD'), c('Kiremit', 'Terracotta', '#E2725B'), c('Hardal', 'Mustard', '#E1AD01'), c('Turkuaz', 'Turquoise', '#30B5B2')],
    clothes: l('Etnik desenler, bol paça, kargo, uzun etek, rahat ama renkli; seyahatten getirilmiş parçalar.', 'Ethnic prints, wide legs, cargo, maxi skirts; relaxed but colourful, souvenirs from travels.'),
    hair: l('Doğal dalgalar, saç bandı, dağınık örgüler; güneşte açılmış uçlar.', 'Natural waves, headbands, messy braids; sun-lightened ends.'),
    makeup: l('Bronz cilt, çiller, renkli maskara; hızlı ve neşeli.', 'Bronzed skin, freckles, coloured mascara; quick and joyful.'),
    accessories: l('Turkuaz, katmanlı kolyeler, şapka, sırt çantası.', 'Turquoise, layered necklaces, hats, backpacks.'),
    scent: l('Tütsü, sandal ağacı, baharat, egzotik meyveler.', 'Incense, sandalwood, spice, exotic fruits.'),
    avoid: l('Kısıtlayıcı, çok resmi ve hareketi zorlaştıran kıyafetler.', 'Restrictive, overly formal outfits.'),
    comfort: l('Şalvar, kaftan, oversize kazak.', 'Harem pants, kaftans, oversized sweaters.'),
    power: l('Outdoor/hiking giyim, at binme kıyafetleri.', 'Hiking/outdoor wear, equestrian style.'),
    work: l('Renkli ceket + rahat pantolon; özgür ruhlu profesyonel.', 'Colourful blazer + relaxed trousers; free-spirited professional.'),
  }),
  P({ // Oğlak
    aesthetic: l('Klasik güç & sessiz lüks', 'Classic power & quiet luxury'),
    colors: [c('Kömür grisi', 'Charcoal', '#333333'), c('Kahverengi', 'Chocolate', '#5C4033'), c('Orman yeşili', 'Forest green', '#22392B'), c('Lacivert', 'Navy', '#1B1F3B')],
    clothes: l('Terzi işi takımlar, uzun palto, loafer, yapılandırılmış çanta; logosuz kalite, uzun ömürlü parça.', 'Tailored suits, long coats, loafers, structured bags; logo-free quality built to last.'),
    hair: l('Sleek düz saç, düşük topuz, klasik bob; koyu doğal tonlar.', 'Sleek straight hair, low bun, classic bob; deep natural tones.'),
    makeup: l('Mat cilt, belirgin elmacık kemiği, kahve tonları; profesyonel ve zamansız.', 'Matte skin, sculpted cheekbones, brown tones; professional and timeless.'),
    accessories: l('Klasik saat, deri kemer, minimal altın; kemik yapısını öne çıkaran yaka (Oğlak kemikleri yönetir).', 'Classic watch, leather belt, minimal gold; collars that frame bone structure (Capricorn rules the bones).'),
    scent: l('Vetiver, deri, sedir — olgun ve otoriter.', 'Vetiver, leather, cedar — mature and authoritative.'),
    avoid: l('Gelip geçici trendler ve kalitesiz parçalar.', 'Passing trends and poor quality.'),
    comfort: l('Kaliteli koyu renk triko set.', 'Quality dark knit set.'),
    power: l('Siyah/gri disiplinli antrenman kıyafeti; tırmanış ve koşu.', 'Black/grey disciplined training wear; climbing and running.'),
    work: l('Koyu renk takım, loafer, saat; CEO enerjisi.', 'Dark suit, loafers, watch; CEO energy.'),
  }),
  P({ // Kova
    aesthetic: l('Fütüristik & avangart', 'Futuristic & avant-garde'),
    colors: [c('Elektrik mavisi', 'Electric blue', '#0F52BA'), c('Gümüş metalik', 'Metallic silver', '#AAA9AD'), c('Neon yeşil', 'Neon green', '#39FF14'), c('Beyaz', 'White', '#FFFFFF')],
    clothes: l('Asimetrik kesimler, metalik kumaşlar, unisex parçalar, sokak stili, vintage + teknoloji karışımı.', 'Asymmetric cuts, metallics, unisex pieces, streetwear, vintage meets tech.'),
    hair: l('Renkli saç (mavi, gümüş, pastel), undercut, asimetrik kesim; kuralsız.', 'Coloured hair (blue, silver, pastel), undercuts, asymmetric cuts; rule-free.'),
    makeup: l('Grafik eyeliner, metalik far, yüz taşları; deneysel.', 'Graphic liner, metallic shadow, face gems; experimental.'),
    accessories: l('Akıllı saat, geometrik takı, ilginç gözlük.', 'Smartwatch, geometric jewellery, unusual eyewear.'),
    scent: l('Ozon, metalik, beklenmedik nişler.', 'Ozonic, metallic, unexpected niche scents.'),
    avoid: l('Herkesin giydiği “güvenli” kombinler.', 'Safe looks everyone wears.'),
    comfort: l('Teknik kumaşlı oversize set.', 'Technical-fabric oversized set.'),
    power: l('Neon detaylı spor kıyafeti, futuristik sneaker.', 'Neon-accented activewear, futuristic sneakers.'),
    work: l('Yaratıcı, kural dışı ama düzgün; inovasyon lideri.', 'Creative, unconventional yet polished; innovation leader.'),
  }),
  P({ // Balık
    aesthetic: l('Rüya gibi & eterik', 'Dreamy & ethereal'),
    colors: [c('Deniz yeşili', 'Seafoam', '#9FE2BF'), c('Lavanta', 'Lavender', '#B57EDC'), c('Opal', 'Opal', '#A8C3BC'), c('Gümüş', 'Silver', '#D8D8D8')],
    clothes: l('Şifon, tül, akışkan maksi elbiseler, transparan katmanlar, deniz kızı detayları; yumuşak ve uçuşan.', 'Chiffon, tulle, flowing maxis, sheer layers, mermaid details; soft and floaty.'),
    hair: l('Uzun dalgalı “deniz kızı” saç, pastel uçlar, yumuşak dokular.', 'Long wavy mermaid hair, pastel ends, soft textures.'),
    makeup: l('Nemli/ıslak cilt, holografik ışıltı, yumuşak far; gözlere odak.', 'Dewy glass skin, holographic shimmer, soft shadow; focus on the eyes.'),
    accessories: l('Deniz kabukları, opal, inci; ayakları öne çıkaran ayakkabı/halhal (Balık ayakları yönetir).', 'Shells, opal, pearls; shoes and anklets that highlight the feet (Pisces rules the feet).'),
    scent: l('Deniz notaları, lotus, nergis, misk.', 'Aquatic notes, lotus, narcissus, musk.'),
    avoid: l('Sert, köşeli ve aşırı yapılandırılmış parçalar.', 'Harsh, rigid, overly structured pieces.'),
    comfort: l('İpek ve tül ev elbisesi, bol pamuklu set.', 'Silk and tulle loungewear, loose cotton set.'),
    power: l('Yüzme, dans ve yoga kıyafetleri.', 'Swim, dance and yoga wear.'),
    work: l('Yumuşak tonlu akışkan bluz + kumaş pantolon; sanatsal profesyonel.', 'Soft flowing blouse + trousers; artistic professional.'),
  }),
];

/** 1. evdeki gezegenlerin görünüme etkisi (geleneksel/yaygın astroloji yorumu) */
export const FIRST_HOUSE_MOD: Partial<Record<BodyId, L>> = {
  sun: l('Güneş 1. evde: Doğal bir parlaklık ve özgüven; altın ve sıcak tonlar seni aydınlatır.', 'Sun in the 1st: natural radiance and confidence; gold and warm tones light you up.'),
  moon: l('Ay 1. evde: Yumuşak, sevimli hatlar ve ruh haline göre değişen bir tarz; konfor senin için şart.', 'Moon in the 1st: soft, sweet features and a mood-driven style; comfort is essential.'),
  venus: l('Venüs 1. evde: Sosyal medyada “güzellik yerleşimi” olarak bilinir; doğal çekicilik ve estetik bir duruş. Az makyaj bile fark yaratır.', 'Venus in the 1st: known online as the “beauty placement” — natural charm and aesthetic poise. Even minimal makeup works.'),
  mars: l('Mars 1. evde: Atletik, enerjik görünüm; sportif kesimler ve cesur renkler sana yakışır.', 'Mars in the 1st: athletic, energetic look; sporty cuts and bold colours suit you.'),
  jupiter: l('Jüpiter 1. evde: Geniş gülümseme, cömert bir aura; abartılı aksesuarları taşıyabilirsin.', 'Jupiter in the 1st: big smile, generous aura; you can carry statement accessories.'),
  saturn: l('Satürn 1. evde: Olgun ve klasik bir görünüm; yaşla birlikte daha çekici hâle gelirsin. Terzi işi parçalar senin imzan.', 'Saturn in the 1st: mature, classic look that ages beautifully. Tailored pieces are your signature.'),
  uranus: l('Uranüs 1. evde: Benzersiz, sıra dışı stil; ani imaj değişiklikleri ve renkli saçlar sana çok yakışır.', 'Uranus in the 1st: one-of-a-kind style; sudden image changes and coloured hair suit you.'),
  neptune: l('Neptün 1. evde: Eterik, “filtreli gibi” bir görünüm; ışıltılı ve akışkan parçalar büyüyü artırır.', 'Neptune in the 1st: ethereal, “looks filtered” vibe; shimmer and flowing fabrics enhance the magic.'),
  pluto: l('Plüton 1. evde: Yoğun ve manyetik bakışlar; koyu tonlar ve minimal ama güçlü stil.', 'Pluto in the 1st: intense, magnetic gaze; dark tones and minimal but powerful style.'),
  lilith: l('Lilith 1. evde: Kural tanımayan, cesur ve baştan çıkarıcı bir aura; sınırları zorlayan stiller.', 'Lilith in the 1st: rule-breaking, seductive aura; boundary-pushing style.'),
};

export interface StyleReport {
  venus: number; asc: number | null; moon: number; mars: number; mc: number | null;
  palette: { name: L; hex: string; from: L }[];
  firstHouse: L[];
  elementTip: L;
}

const ELEMENT_TIPS: L[] = [
  l('Ateş baskın: Parlak renkler, net kontrastlar ve hareket özgürlüğü veren parçalar sana enerji verir.', 'Fire-dominant: bright colours, crisp contrast and pieces that let you move energise you.'),
  l('Toprak baskın: Doğal dokular, kaliteli temel parçalar ve nötr tonlar seni güçlü gösterir.', 'Earth-dominant: natural textures, quality basics and neutrals make you look strongest.'),
  l('Hava baskın: Hafif kumaşlar, pastel tonlar ve eğlenceli kombin denemeleri sana iyi gelir.', 'Air-dominant: light fabrics, pastels and playful combinations suit you.'),
  l('Su baskın: Akışkan kumaşlar, deniz tonları ve duygusal anlamı olan aksesuarlar sana yakışır.', 'Water-dominant: fluid fabrics, ocean tones and sentimental accessories suit you.'),
];

export function buildStyleReport(ch: Chart): StyleReport {
  const venus = ch.positions.venus.sign;
  const moon = ch.positions.moon.sign;
  const mars = ch.positions.mars.sign;
  const asc = ch.asc !== null ? Math.floor(ch.asc / 30) : null;
  const mc = ch.mc !== null ? Math.floor(ch.mc / 30) : null;
  const palette = [
    ...STYLE[venus].colors.slice(0, 3).map(c => ({ ...c, from: { tr: `Venüs ${SIGNS[venus].tr}`, en: `Venus in ${SIGNS[venus].en}` } })),
    ...(asc !== null ? STYLE[asc].colors.slice(0, 2).map(c => ({ ...c, from: { tr: `Yükselen ${SIGNS[asc].tr}`, en: `${SIGNS[asc].en} Rising` } })) : []),
    ...STYLE[moon].colors.slice(0, 1).map(c => ({ ...c, from: { tr: `Ay ${SIGNS[moon].tr}`, en: `Moon in ${SIGNS[moon].en}` } })),
  ];
  const firstHouse: L[] = [];
  if (ch.cusps.length) {
    for (const id of Object.keys(FIRST_HOUSE_MOD) as BodyId[]) {
      if (ch.positions[id]?.house === 1) firstHouse.push(FIRST_HOUSE_MOD[id]!);
    }
  }
  // Element ağırlığı: kişisel gezegenler + yükselen (Güneş, Ay, Venüs, Yükselen 2 puan)
  const w = [0, 0, 0, 0];
  const add = (sign: number, p: number) => { w[sign % 4] += p; };
  add(ch.positions.sun.sign, 2); add(moon, 2); add(venus, 2); add(ch.positions.mercury.sign, 1); add(mars, 1);
  if (asc !== null) add(asc, 2);
  const el = w.indexOf(Math.max(...w));
  return { venus, asc, moon, mars, mc, palette, firstHouse, elementTip: ELEMENT_TIPS[el] };
}
