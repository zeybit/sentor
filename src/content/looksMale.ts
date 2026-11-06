// Erkek kullanıcılar için stil önerileri: kıyafet, saç, bakım (makyaj yerine) ve aksesuar; burç sırasıyla.
import { L } from './base';
import type { Piece } from './looks';
const l = (tr: string, en: string): L => ({ tr, en });

export const STYLE_M: { clothes: L; hair: L; grooming: L; accessories: L }[] = [
  { clothes: l('Deri ceket, düz tişört, koyu kot, sneaker; hareket etmeni kısıtlamayan, sportif ama keskin parçalar.', 'Leather jacket, plain tee, dark jeans, sneakers; sporty but sharp pieces that never slow you down.'),
    hair: l('Kısa, dokulu kesimler: crop, kısa yanlar, hızlı şekillenen saç. Sabah beş dakikada hazır olmalı.', 'Short textured cuts: crops, short sides, hair that styles fast. Ready in five minutes.'),
    grooming: l('Kısa, düzgün sakal ya da hafif kirli sakal; keskin bir çene hattı. Bakım hızlı ama düzenli.', 'Short neat beard or light stubble; a sharp jawline. Quick but regular grooming.'),
    accessories: l('Metal saat, ince zincir, sırt çantası; işlevsel ve sağlam.', 'Metal watch, thin chain, backpack; functional and tough.') },
  { clothes: l('Kaşmir triko, keten gömlek, kaliteli kumaş pantolon, trençkot; az ama çok kaliteli, dokunulası parçalar.', 'Cashmere knits, linen shirts, quality trousers, a trench; few but very good pieces you want to touch.'),
    hair: l('Doğal dalgalı, orta uzunlukta, bakımlı saç; doğal kahve tonları.', 'Natural wavy medium-length hair, well kept; natural brown tones.'),
    grooming: l('Temiz tıraş ya da çok bakımlı kısa sakal; iyi bir cilt bakımı ve imza bir parfüm.', 'Clean shave or a very tidy short beard; good skincare and a signature fragrance.'),
    accessories: l('Deri kayışlı klasik saat, kaliteli deri çanta, ince altın yüzük.', 'Classic leather-strap watch, quality leather bag, a thin gold ring.') },
  { clothes: l('Desenli gömlek, katmanlı kombinler, renkli sneaker, grafik tişört; her gün farklı bir hava.', 'Patterned shirts, layering, colourful sneakers, graphic tees; a different mood every day.'),
    hair: l('Perdeli (orta ayrık) saç, hareketli ve genç kesimler; sık değişiklik.', 'Curtain (middle-part) hair, lively youthful cuts; frequent changes.'),
    grooming: l('Temiz yüz ya da çok hafif kirli sakal; genç ve dinamik bir görünüm.', 'Clean face or very light stubble; a young, dynamic look.'),
    accessories: l('Güneş gözlüğü, renkli çanta, birkaç ince yüzük; ellerin dikkat çeker.', 'Sunglasses, a colourful bag, a few thin rings; your hands draw attention.') },
  { clothes: l('Yumuşak hırka, örgü kazak, rahat pantolon, vintage dokunuşlar; sarıp sarmalayan, rahat kumaşlar.', 'Soft cardigans, knit sweaters, relaxed trousers, vintage touches; comforting, cosy fabrics.'),
    hair: l('Yumuşak, hafif dalgalı, orta uzunlukta saç; doğal ve dokunulası.', 'Soft, slightly wavy medium hair; natural and touchable.'),
    grooming: l('Yumuşak hatlı, bakımlı tam sakal ya da kısa sakal; yüzüne sıcaklık katar.', 'A soft, well-kept full or short beard; it adds warmth to your face.'),
    accessories: l('Gümüş yüzük, anlamı olan bir aile yadigârı, atkı.', 'A silver ring, a meaningful heirloom, a scarf.') },
  { clothes: l('Göz alan gömlekler, iyi kesim ceket, tek bir iddialı parça; sahneye çıkar gibi giyin.', 'Eye-catching shirts, a well-cut jacket, one bold statement piece; dress as if stepping on stage.'),
    hair: l('Hacimli, uzunca ve geriye akan saç; Aslan için saç imzadır.', 'Voluminous, longer hair that flows back; hair is the Leo signature.'),
    grooming: l('Bakımlı, şekilli sakal ya da kirli sakal; parlak, sağlıklı bir cilt.', 'A groomed, shaped beard or stubble; glowing, healthy skin.'),
    accessories: l('Altın zincir, güneş gözlüğü, dikkat çekici saat.', 'Gold chain, sunglasses, a striking watch.') },
  { clothes: l('Ütülü gömlek, düz pantolon, sade triko, kapsül gardırop; temiz, düzenli ve işlevsel.', 'Crisp shirts, straight trousers, simple knits, a capsule wardrobe; clean, tidy and functional.'),
    hair: l('Klasik yandan ayrık, düzenli kesim; her ay tazelenen bakımlı saç.', 'Classic side part, a tidy cut refreshed every month.'),
    grooming: l('Temiz tıraş ya da milimetrik bakımlı kısa sakal; düzenli cilt bakımı rutini.', 'Clean shave or a precisely kept short beard; a regular skincare routine.'),
    accessories: l('Minimal saat, kaliteli tote ya da evrak çantası; az ve işlevsel.', 'Minimal watch, a quality tote or briefcase; few and functional.') },
  { clothes: l('Uyumlu renklerde smart casual, blazer + triko, açık tonlar; orantı ve uyum her şey.', 'Smart casual in harmonious colours, blazer + knit, light tones; proportion and balance are everything.'),
    hair: l('Bakımlı, yumuşak hatlı, yandan ya da ortadan ayrık saç.', 'Groomed, soft-lined hair with a side or middle part.'),
    grooming: l('Çok bakımlı kısa sakal ya da temiz yüz; kaşlar ve cilt özenli.', 'A very tidy short beard or clean face; brows and skin cared for.'),
    accessories: l('İnce saat, şık kemer, zarif bir koku.', 'A slim watch, an elegant belt, a refined scent.') },
  { clothes: l('Baştan aşağı siyah, deri, oturan kesimler; az gösterip çok etkileyen.', 'Head-to-toe black, leather, fitted cuts; showing little, impressing a lot.'),
    hair: l('Geriye taranmış ya da kenarları kısa, koyu ve parlak saç.', 'Slicked-back or short-sided, dark glossy hair.'),
    grooming: l('Koyu, keskin hatlı sakal ya da gölgeli kirli sakal; bakışlarını öne çıkaran bir görünüm.', 'A dark, sharp-lined beard or shadowy stubble; a look that brings out your gaze.'),
    accessories: l('Gümüş ya da oksitli takı, siyah taşlı yüzük, koyu gözlük.', 'Silver or oxidised jewellery, a black stone ring, dark sunglasses.') },
  { clothes: l('Rahat gömlek, kot, bot, desenli parçalar; seyahatten getirilmiş gibi duran, rahat ve renkli.', 'Relaxed shirts, denim, boots, printed pieces; easy and colourful, as if brought back from travels.'),
    hair: l('Doğal kıvırcık ya da dalgalı saç, kenarları kısa; güneşte açılmış uçlar.', 'Natural curls or waves, shorter sides; sun-lightened ends.'),
    grooming: l('Doğal, biraz dağınık kirli sakal; rahat ve maceracı.', 'Natural, slightly messy stubble; relaxed and adventurous.'),
    accessories: l('Bileklik, deri kordon kolye, sırt çantası, şapka.', 'Bracelets, a leather cord necklace, a backpack, a hat.') },
  { clothes: l('Terzi işi takım, uzun palto, loafer, kaliteli temel parçalar; logosuz ve zamansız.', 'Tailored suits, long coats, loafers, quality basics; logo-free and timeless.'),
    hair: l('Kısa, keskin ve düzenli kesim; fade ya da klasik kısa saç.', 'Short, sharp, tidy cuts; a fade or classic short hair.'),
    grooming: l('Temiz tıraş ya da çok düzgün kısa sakal; olgun ve profesyonel.', 'Clean shave or a very neat short beard; mature and professional.'),
    accessories: l('Klasik saat, deri kemer, evrak çantası.', 'Classic watch, leather belt, a briefcase.') },
  { clothes: l('Sokak stili, teknik kumaşlar, asimetrik ya da unisex parçalar; geleceğe ait gibi.', 'Streetwear, technical fabrics, asymmetric or unisex pieces; as if from the future.'),
    hair: l('Renkli ya da açık tonlu saç, kuralsız kesimler; gümüş, platin denemeye açık.', 'Coloured or bleached hair, rule-free cuts; open to silver or platinum.'),
    grooming: l('Kısa, sıra dışı şekillendirilmiş sakal ya da temiz yüz; deneysel.', 'A short, unusually shaped beard or clean face; experimental.'),
    accessories: l('Akıllı saat, ilginç gözlük, geometrik takı.', 'Smartwatch, unusual glasses, geometric jewellery.') },
  { clothes: l('Keten, yumuşak triko, bol kesimler, açık ve uçuk tonlar; rahat ve akışkan.', 'Linen, soft knits, loose cuts, light washed-out tones; easy and flowing.'),
    hair: l('Uzunca, dalgalı, akışkan saç; doğal ve hafif dağınık.', 'Longer, wavy, flowing hair; natural and slightly messy.'),
    grooming: l('Yumuşak, doğal bırakılmış sakal; nemli ve dinlenmiş bir cilt.', 'A soft, naturally grown beard; hydrated, rested skin.'),
    accessories: l('Gümüş yüzük, deniz kabuğu ya da taş kolye, rahat ayakkabı.', 'A silver ring, a shell or stone necklace, comfortable shoes.') },
];

export const GROOM_NAME: L[] = [
  l('Kısa sakal, keskin çene', 'Short beard, sharp jaw'), l('Temiz ve bakımlı', 'Clean and well kept'), l('Genç ve temiz', 'Young and clean'), l('Yumuşak sakal', 'Soft beard'),
  l('Şekilli sakal', 'Shaped beard'), l('Milimetrik bakım', 'Precision grooming'), l('Özenli ve zarif', 'Polished and refined'), l('Koyu ve keskin', 'Dark and sharp'),
  l('Doğal kirli sakal', 'Natural stubble'), l('Olgun ve profesyonel', 'Mature and professional'), l('Deneysel', 'Experimental'), l('Doğal sakal', 'Natural beard'),
];
export const HAIR_M: { name: L; color: string; q: string }[] = [
  { name: l('Dokulu kısa kesim', 'Textured crop'), color: '#3A2618', q: 'men textured crop haircut' },
  { name: l('Doğal dalgalı orta saç', 'Natural medium waves'), color: '#5A3A22', q: 'men medium wavy hair' },
  { name: l('Perdeli orta ayrık', 'Curtain middle part'), color: '#6B4A2E', q: 'men curtain hairstyle middle part' },
  { name: l('Yumuşak katlı saç', 'Soft layered hair'), color: '#4A3426', q: 'men soft layered medium hair' },
  { name: l('Uzun, akan saç', 'Long flow'), color: '#8A6034', q: 'men flow hairstyle long' },
  { name: l('Klasik yandan ayrık', 'Classic side part'), color: '#3A2A20', q: 'men classic side part haircut' },
  { name: l('Bakımlı yan ayrık', 'Groomed side part'), color: '#5A4030', q: 'men side part long classic' },
  { name: l('Geriye taranmış', 'Slicked back'), color: '#141414', q: 'men slick back undercut' },
  { name: l('Kıvırcık, kenarları kısa', 'Curly taper'), color: '#6A4428', q: 'men curly taper fade' },
  { name: l('Kısa fade', 'Short fade'), color: '#241A14', q: 'men buzz cut fade' },
  { name: l('Açık renk, platin', 'Bleached, platinum'), color: '#CFCBC4', q: 'men bleached silver hair' },
  { name: l('Dalgalı, uzunca', 'Long waves'), color: '#7A5A3A', q: 'men long wavy flow hair' },
];
export const GROOM_Q: string[] = ['men short stubble beard', 'men clean shaven skincare', 'men short stubble beard', 'men full beard style'];

export const OUTFIT_M: { piece: Piece; c: number | string }[][] = [
  [{ piece: 'jacket', c: 2 }, { piece: 'tee', c: 3 }, { piece: 'jeans', c: '#2F4A73' }, { piece: 'sneakers', c: 3 }, { piece: 'watch', c: '#B8B8B8' }, { piece: 'chain', c: '#B8B8B8' }],
  [{ piece: 'trench', c: 3 }, { piece: 'knit', c: 1 }, { piece: 'trousers', c: 0 }, { piece: 'loafers', c: '#5A3A22' }, { piece: 'watch', c: '#C0A060' }, { piece: 'bag', c: 3 }],
  [{ piece: 'shirt', c: 0 }, { piece: 'tee', c: 1 }, { piece: 'jeans', c: '#5B7FA6' }, { piece: 'sneakers', c: 3 }, { piece: 'sunglasses', c: '#222222' }, { piece: 'bag', c: 2 }],
  [{ piece: 'knit', c: 2 }, { piece: 'shirt', c: 0 }, { piece: 'trousers', c: 1 }, { piece: 'loafers', c: '#5A3A22' }, { piece: 'scarf', c: 3 }, { piece: 'watch', c: '#C0C0C0' }],
  [{ piece: 'shirt', c: 1 }, { piece: 'blazer', c: 2 }, { piece: 'trousers', c: '#1A1A1A' }, { piece: 'loafers', c: '#1A1A1A' }, { piece: 'chain', c: '#D4AF37' }, { piece: 'sunglasses', c: '#3A2A1A' }],
  [{ piece: 'shirt', c: 3 }, { piece: 'trousers', c: 0 }, { piece: 'blazer', c: 2 }, { piece: 'loafers', c: '#3A2A20' }, { piece: 'watch', c: '#C0A060' }, { piece: 'bag', c: 1 }],
  [{ piece: 'blazer', c: 1 }, { piece: 'knit', c: 2 }, { piece: 'trousers', c: 3 }, { piece: 'loafers', c: '#6B4A2E' }, { piece: 'watch', c: '#C0A060' }, { piece: 'scarf', c: 0 }],
  [{ piece: 'jacket', c: 0 }, { piece: 'tee', c: 0 }, { piece: 'jeans', c: '#1A1A1A' }, { piece: 'boots', c: 0 }, { piece: 'chain', c: '#B8B8B8' }, { piece: 'sunglasses', c: 0 }],
  [{ piece: 'shirt', c: 1 }, { piece: 'jeans', c: '#5B7FA6' }, { piece: 'boots', c: '#6B4A2E' }, { piece: 'scarf', c: 3 }, { piece: 'tee', c: 2 }, { piece: 'bag', c: '#6B4A2E' }],
  [{ piece: 'blazer', c: 0 }, { piece: 'shirt', c: '#FAFAFA' }, { piece: 'trousers', c: 3 }, { piece: 'trench', c: 1 }, { piece: 'loafers', c: 1 }, { piece: 'watch', c: '#C0A060' }],
  [{ piece: 'jacket', c: 1 }, { piece: 'tee', c: 3 }, { piece: 'jeans', c: 0 }, { piece: 'sneakers', c: 2 }, { piece: 'sunglasses', c: 0 }, { piece: 'chain', c: 1 }],
  [{ piece: 'shirt', c: 0 }, { piece: 'knit', c: 1 }, { piece: 'trousers', c: 3 }, { piece: 'sneakers', c: '#F5F5F5' }, { piece: 'scarf', c: 1 }, { piece: 'watch', c: 3 }],
];
export const OUTFIT_Q_M: string[] = [
  'men leather jacket outfit', 'men old money outfit', 'men colorful outfit', 'men vintage cardigan outfit', 'men statement shirt outfit', 'men minimalist outfit',
  'men smart casual outfit', 'men all black outfit', 'men boho outfit', 'men quiet luxury outfit', 'men techwear outfit', 'men linen outfit',
];

export const OUTFIT_PINS_M: string[][] = [
  ['923378729841455979', '741897738618226417', '999306604813616399', '393642823695523118', '68257750597951285'],
  ['196047390024958751', '12947917675485678', '951104015039959209', '491947959316189796', '253820128993616359'],
  ['205828645466822247', '13792342604845079', '501588477239867982', '109212359709743242', '333547916164368716'],
  ['416723771794382741', '421438477654608408', '510525307762252594', '838936236846895262', '744712488386803181'],
  ['631066966584815849', '379991287323005622', '377669118748117283', '595249275775725864', '13792342604845079'],
  ['266627240435240608', '688417493077735966', '113575221848805758', '570268371590908073', '931541504169865078'],
  ['525865694000069180', '361343570126807944', '1125968702393922', '389561436539464921', '1053560906575581198'],
  ['210684088796110105', '788904059760095199', '1060175568508507088', '644296290466175279', '589971619971571955'],
  ['98023729384644594', '476044623126372847', '10485011626880614', '604045368799995006', '202662051976891828'],
  ['45669383718633028', '1121114900983168032', '57280226505456091', '109634572173323705', '43769427621875188'],
  ['351912464159444', '40532465391219434', '409686897376005021', '858146903994790232', '559009372510697250'],
  ['602215781459055066', '1008947122750753454', '460282024435885157', '216383957092131157', '328129522869151957'],
];
export const HAIR_PINS_M: string[][] = [
  ['596304806948843865', '1337074889755063', '9218374232687424', '659214464238481053', '221661612905722255'],
  ['424042121181137433', '422281210840132', '439171401187422320', '821766263302086958', '172614598206653036'],
  ['159948224253777474', '1120270476034127309', '633387440444001', '7740630603734000', '488851734562613243'],
  ['656470083207932209', '1900024835686907', '580190364530076578', '68748727250', '821766263302086958'],
  ['10062799162961961', '1095289571861609747', '539869074102405048', '826762444078829718', '68187381849564382'],
  ['536209899363984017', '588423507593709930', '574842339955712820', '996914067516585925', '534380312032909062'],
  ['475692779409963009', '654640495820162282', '290130400989135487', '808466570623478567', '6051780744334890'],
  ['790804015852149555', '614108099213038398', '633952085069255506', '930978554237164928', '42221315253798593'],
  ['164311086399965825', '646548090279277423', '531565562288311600', '465278205275706594', '70437488029283'],
  ['307933693294231847', '597993656780252222', '635077984989592150', '608126755981349391', '966796244996629603'],
  ['353391902003044105', '828451293933398972', '626633735672805431', '806214770790657657', '353391902003044106'],
  ['1089519334823716747', '1131881318914256844', '56506170343090518', '439171401187422320', '656470083207932209'],
];
/** Bakım (sakal/cilt) pinleri elemente göre: ateş, toprak, hava, su */
export const GROOM_PINS_M: string[][] = [
  ['589619776263257479', '307933693270544145', '2533343536790979', '324681454386692951', '432486370480054017'],
  ['343399540332206348', '818036719827700716', '996351117550129724', '842102830356436185', '178032991507930134'],
  ['192247477833539819', '192247477835616958', '660621839064052728', '561824122258567253', '307933693270544145'],
  ['467459636341683238', '1123577807026957662', '641833384411337835', '187110559504068428', '462181980509969356'],
];
