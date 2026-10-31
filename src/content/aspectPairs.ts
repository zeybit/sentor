// Doğum haritası açı yorumları — her gezegen çifti için: kavuşum (c), uyumlu (s: altmışlık/üçgen), zorlayıcı (h: kare/karşıt).
// Özgün metinlerdir. Yarım altmışlık (quincunx) zorlayıcı metne "ince ayar" notu eklenerek okunur.
import type { BodyId, AspectType } from '../engine/astro';
import { L, BODIES, ASPECT_INFO } from './base';

type K = BodyId | 'asc' | 'mc';
type E = { c: L; s: L; h: L };
const e = (ctr: string, cen: string, str: string, sen: string, htr: string, hen: string): E => ({ c: { tr: ctr, en: cen }, s: { tr: str, en: sen }, h: { tr: htr, en: hen } });

const P: Record<string, E> = {
  // ---------- Güneş ----------
  'sun-moon': e(
    'İradenle duyguların aynı burçta buluşuyor: ne istediğinle neye ihtiyaç duyduğun çoğu zaman aynı şey. Kendinle barışık, tek yönlü ve kararlı bir enerjin var; tek dezavantajı başka bakış açılarını görmekte zorlanabilmen.',
    'Your will and emotions meet in one sign: what you want and what you need usually coincide. You have a self-consistent, focused energy; the only drawback is that other viewpoints can be hard to see.',
    'Bilinçli hedeflerinle iç ihtiyaçların uyum içinde çalışıyor. Duygusal dengen sağlam; ailende ve ilişkilerinde huzur kurmak sana doğal geliyor.',
    'Your conscious goals and inner needs cooperate. Your emotional balance is solid; creating peace at home and in relationships comes naturally.',
    'İstediklerinle ihtiyaç duydukların zaman zaman çekişiyor. İçinde iki ayrı ses var gibi; bu gerilim seni kendini tanımaya ve iki tarafı da dinlemeyi öğrenmeye zorlar.',
    'What you want and what you need sometimes pull apart. It can feel like two voices inside; this tension pushes you to know yourself and learn to listen to both sides.'),
  'sun-mercury': e(
    'Düşüncelerin kimliğinle iç içe: fikirlerini kendinin bir parçası gibi savunursun. Zihnin parlak ve hızlı; eleştiriyi kişisel algılamamak öğrenme alanın.',
    'Your thoughts are fused with your identity: you defend ideas as part of yourself. Your mind is bright and quick; not taking criticism personally is your learning edge.',
    'Kendini ifade etmekte rahatsın; düşüncelerin ile hedeflerin aynı yönde.', 'You express yourself easily; your thinking and goals point the same way.',
    'Zihnin ile iraden farklı yönlere çekebilir.', 'Your mind and will may pull in different directions.'),
  'sun-venus': e(
    'Çekiciliğin ve zarafetin kimliğinin merkezinde. İnsanlar sende sıcaklık ve estetik görür; sevilme isteğin güçlü, sanat ve güzellik sana iyi gelir.',
    'Charm and grace sit at the core of your identity. People see warmth and taste in you; you strongly wish to be liked, and art and beauty nourish you.',
    'Sevgiyi ve keyfi hayatına kolayca katarsın; sosyal ilişkilerde doğal bir uyumun var.', 'You bring love and pleasure into life easily; you have natural social grace.',
    'Kendin olmakla sevilmek arasında denge kurmayı öğrenirsin.', 'You learn to balance being yourself with being liked.'),
  'sun-mars': e(
    'Enerjin, cesaretin ve rekabet duygun güçlü. Harekete geçmeden duramazsın; liderlik ve spor sana iyi gelir. Öfkeyi hızlı yaşayıp hızlı bırakmak dengen için önemli.',
    'Your energy, courage and competitiveness are strong. You can’t sit still; leadership and sport suit you. Feeling anger quickly and releasing it quickly keeps you balanced.',
    'İraden ile eylem gücün uyumlu: istediğini yapmak için gereken enerjiyi kolayca bulursun. Girişimci ve dayanıklısın.',
    'Your will and drive cooperate: you easily find the energy to do what you want. You are enterprising and resilient.',
    'Enerjin yüksek ama sabırsız; çatışmaya ve aceleye yatkın olabilirsin. Bu gücü spora, işe ve net hedeflere yönlendirdiğinde kimse seni durduramaz.',
    'Your energy is high but impatient; you may lean toward conflict and haste. Channel it into sport, work and clear goals and nothing can stop you.'),
  'sun-jupiter': e(
    'İyimserlik, cömertlik ve şans duygusu kimliğine işlenmiş. Büyük düşünür, insanlara ilham verirsin; aşırı söz verme ve aşırılık eğilimine dikkat.',
    'Optimism, generosity and a sense of luck are woven into your identity. You think big and inspire others; watch for overpromising and excess.',
    'Hayata güvenle bakarsın; fırsatlar ve destekçiler kolayca yoluna çıkar. Eğitim, seyahat ve öğretmek seni büyütür.',
    'You trust life; opportunities and supporters come your way easily. Learning, travel and teaching help you grow.',
    'Büyük hedefler koyarsın ama bazen gerçekçilikten uzaklaşırsın. Ölçülü olmayı öğrendiğinde şansın kalıcı başarıya dönüşür.',
    'You set big goals but sometimes lose realism. When you learn moderation, luck becomes lasting success.'),
  'sun-saturn': e(
    'Ciddi, sorumluluk sahibi ve olgun bir kişiliğin var; erken yaşta büyümüş olabilirsin. Başarın yavaş ama kalıcı gelir; kendine fazla yüklenmemeyi öğrenmelisin.',
    'You have a serious, responsible, mature character; you may have grown up early. Success comes slowly but lasts; learn not to be too hard on yourself.',
    'Disiplin ve sabır doğal güçlerin; uzun vadeli planlar yapar ve onları gerçekleştirirsin. Güvenilirliğin seni otorite konumuna taşır.',
    'Discipline and patience are natural strengths; you make long-term plans and carry them out. Your reliability brings you authority.',
    'Kendine karşı eleştirel olabilir ve sınırlanmış hissedebilirsin; baba ya da otorite figürleriyle ilgili dersler öne çıkar. Zorluklar seni zamanla çok güçlü kılar.',
    'You can be self-critical and feel restricted; lessons with father or authority figures stand out. Difficulties make you very strong over time.'),
  'sun-uranus': e(
    'Özgün, bağımsız ve sıra dışı bir kimliğin var. Kalıplara uymak sana göre değil; yenilik, teknoloji ve özgürlük seni tanımlar.',
    'You have an original, independent, unconventional identity. Fitting moulds isn’t for you; innovation, technology and freedom define you.',
    'Farklı olmaktan çekinmezsin ve bunu doğal bir şekilde yaşarsın; yeni fikirleri kolayca hayata geçirirsin.',
    'You aren’t afraid to be different and live it naturally; you put new ideas into practice easily.',
    'Ani değişimler ve özgürlük ihtiyacın hayatına sürprizler getirir; isyan ile bağlılık arasında denge kurmayı öğrenirsin.',
    'Sudden changes and a need for freedom bring surprises; you learn to balance rebellion and commitment.'),
  'sun-neptune': e(
    'Hayal gücün, sezgin ve şefkatin çok güçlü; sanat, müzik ve maneviyat kimliğinin parçası. Sınır koymak ve gerçekçi kalmak en önemli dersin.',
    'Your imagination, intuition and compassion are very strong; art, music and spirituality are part of you. Setting boundaries and staying grounded is your key lesson.',
    'İlham ve yaratıcılık sana kolayca akar; empatin insanlara iyi gelir.', 'Inspiration and creativity flow easily; your empathy helps others.',
    'Kimliğin bazen bulanıklaşabilir; başkalarının beklentilerinde kaybolma ya da kaçış eğilimi olabilir. Net hedefler seni korur.',
    'Your sense of self can blur; you may lose yourself in others’ expectations or seek escape. Clear goals protect you.'),
  'sun-pluto': e(
    'Yoğun, kararlı ve dönüştürücü bir kişiliğin var. Krizlerden güçlenerek çıkarsın; güç ve kontrol konuları hayatında önemli bir yer tutar.',
    'You have an intense, determined, transformative personality. You emerge stronger from crises; power and control are central themes.',
    'Derin bir iç gücün ve yenilenme yeteneğin var; zor durumları çözmede ustasın.', 'You have deep inner power and the ability to regenerate; you excel at resolving hard situations.',
    'Güç mücadeleleri ve kontrol isteği zorlayabilir; bırakmayı öğrendiğinde gerçek gücüne kavuşursun.', 'Power struggles and the urge to control can be challenging; you find true power when you learn to let go.'),
  'sun-asc': e('Güneş yükselenle birleşiyor: kim olduğun dışarıdan açıkça görünür. Parlak, kendinden emin ve fark edilen bir varlığın var.', 'The Sun joins the Ascendant: who you are is plainly visible. You have a bright, confident, noticeable presence.',
    'İç benliğin ile dışa yansıttığın imaj uyumlu; insanlar seni doğru tanır.', 'Your inner self and outward image agree; people read you accurately.',
    'İç benliğin ile ilk izlenimin farklı olabilir; insanlar seni zamanla tanır.', 'Your inner self and first impression may differ; people get to know you over time.'),
  'sun-mc': e('Güneş MC ile birleşiyor: kariyer ve toplumsal görünürlük kimliğinin merkezinde. Tanınmak ve iz bırakmak için doğmuşsun.', 'The Sun joins the Midheaven: career and public visibility are central to your identity. You were born to be recognised and leave a mark.',
    'Hedeflerin ile kariyerin aynı yönde; başarıya giden yolun açık.', 'Your aims and career point the same way; your path to success is clear.',
    'Kariyer ile kişisel hayat arasında denge kurmak önemli bir tema.', 'Balancing career and personal life is an important theme.'),
  // ---------- Ay ----------
  'moon-mercury': e('Duygularınla düşüncelerin iç içe; hislerini kelimelere dökmekte iyisin. Hafızan güçlü ama duygusal; konuşarak rahatlarsın.', 'Feelings and thoughts are intertwined; you put emotions into words well. Your memory is strong but emotional; talking relaxes you.',
    'Duygusal zekân yüksek; hem hissedip hem anlatabilirsin. İnsanlar seni anlayışlı bulur.', 'High emotional intelligence; you can both feel and explain. People find you understanding.',
    'Mantık ile duygu bazen çatışır; aşırı düşünmek huzursuzluk yaratabilir. Yazmak ve konuşmak sana iyi gelir.', 'Logic and feeling sometimes clash; overthinking can unsettle you. Writing and talking help.'),
  'moon-venus': e('Şefkatli, sevimli ve uyumlu bir duygusal doğan var. Güzellik, konfor ve sevgi dolu ilişkiler seni besler.', 'You have a tender, sweet, harmonious emotional nature. Beauty, comfort and loving bonds nourish you.',
    'Sevgi vermek ve almak sana kolay gelir; çevrende huzur yaratırsın. Estetik bir ev ve güzel ilişkiler senin için önemli.', 'Giving and receiving love is easy; you create peace around you. A beautiful home and harmonious relationships matter to you.',
    'Duygusal ihtiyaçlarınla aşk beklentilerin farklı olabilir; kendini şımartma ya da onay arama eğilimine dikkat.', 'Emotional needs and romantic expectations may differ; watch for overindulgence or approval-seeking.'),
  'moon-mars': e('Duyguların hızlı ve yoğun; tepkilerin anlık. Sevdiklerini korurken çok güçlüsün; öfkeyi bastırmak yerine sağlıklı ifade etmek önemli.', 'Your emotions are fast and intense; reactions are immediate. You are fierce when protecting loved ones; expressing anger healthily rather than suppressing it matters.',
    'Duygularını eyleme dökmekte cesursun; içgüdülerin güçlü ve koruyucu.', 'You turn feelings into action bravely; your instincts are strong and protective.',
    'Alınganlık ve ani öfke çıkışları olabilir; spor ve fiziksel aktivite duygusal dengeni korur.', 'Touchiness and sudden anger may arise; sport and physical activity keep you balanced.'),
  'moon-jupiter': e('Cömert, iyimser ve sıcak bir kalbin var. Ailene ve yakınlarına bolca destek verirsin; duygusal şansın yüksek.', 'You have a generous, optimistic, warm heart. You give plenty of support to family and close ones; your emotional luck is high.',
    'Duygusal olarak güvende ve neşelisin; insanlar sana kolayca açılır.', 'You feel emotionally secure and cheerful; people open up to you easily.',
    'Duygusal aşırılıklar (fazla yemek, fazla harcama, fazla söz) olabilir; ölçü bulmak dengen için önemli.', 'Emotional excess (overeating, overspending, overpromising) may occur; moderation keeps you balanced.'),
  'moon-saturn': e('Duygularını kontrol eder, güçlü görünmeye çalışırsın; erken yaşta sorumluluk almış olabilirsin. Kendine şefkat göstermek en büyük şifan.', 'You control your feelings and try to appear strong; you may have taken on responsibility early. Self-compassion is your greatest healing.',
    'Duygusal olarak olgun ve güvenilirsin; zor zamanlarda insanlar sana dayanır.', 'You are emotionally mature and dependable; people lean on you in hard times.',
    'Duygusal yalnızlık hissi ya da duyguları göstermekte zorluk olabilir; güvendiğin insanlarla açılmak seni hafifletir.', 'You may feel emotionally isolated or find it hard to show feelings; opening up to trusted people lightens you.'),
  'moon-uranus': e('Duyguların değişken ve özgürlüğe düşkün; kalıplaşmış ilişkiler seni boğar. Sezgilerin ani ve parlak.', 'Your emotions are changeable and freedom-loving; conventional relationships stifle you. Your intuitions are sudden and brilliant.',
    'Duygusal bağımsızlığın ile yakınlık ihtiyacın uyumlu; arkadaş gibi ilişkiler sana iyi gelir.', 'Your emotional independence and need for closeness cooperate; friend-like bonds suit you.',
    'Duygusal iniş çıkışlar ve huzursuzluk olabilir; ani kararlar yerine nefes almak sana iyi gelir.', 'Emotional ups and downs and restlessness may occur; pausing instead of sudden decisions helps.'),
  'moon-neptune': e('Son derece duyarlı, empatik ve hayal gücü geniş birisin; başkalarının duygularını sünger gibi çekersin. Enerjik sınırlar şart.', 'You are extremely sensitive, empathic and imaginative; you absorb others’ feelings like a sponge. Energetic boundaries are essential.',
    'Sezgilerin güçlü; sanat, müzik ve şifa sana iyi gelir.', 'Your intuition is strong; art, music and healing nourish you.',
    'İdealizm ve gerçekler arasında kafa karışıklığı olabilir; kaçış eğilimlerini fark etmek önemli.', 'Confusion between ideals and reality may arise; noticing escapist tendencies matters.'),
  'moon-pluto': e('Duyguların derin ve yoğun; yüzeysel ilişkiler seni tatmin etmez. Duygusal krizlerden güçlenerek çıkarsın.', 'Your feelings are deep and intense; shallow bonds don’t satisfy you. You emerge stronger from emotional crises.',
    'Duygusal gücün ve psikolojik derinliğin şifa verici; insanların gizli duygularını sezersin.', 'Your emotional power and psychological depth heal; you sense others’ hidden feelings.',
    'Kıskançlık, kontrol ya da duygusal yoğunluk zorlayabilir; güveni inşa etmek ve bırakmayı öğrenmek dönüşümünü sağlar.', 'Jealousy, control or emotional intensity can be hard; building trust and learning to let go transforms you.'),
  'moon-asc': e('Ay yükselenle birleşiyor: duyguların yüzüne yansır, çok sezgisel ve şefkatli görünürsün.', 'The Moon joins the Ascendant: feelings show on your face; you appear very intuitive and caring.',
    'İç dünyan ile dış görünüşün uyumlu; insanlar sana kolayca güvenir.', 'Your inner world and appearance agree; people trust you easily.',
    'Ruh halin çevrene hemen yansıyabilir; duygusal dalgalanmaları fark etmek önemli.', 'Your moods may show immediately; noticing emotional waves matters.'),
  'moon-mc': e('Ay MC ile birleşiyor: halkla iç içe, insanlara dokunan bir kariyer ve kamuoyunun nabzını tutma yeteneği.', 'The Moon joins the Midheaven: a public-facing career that touches people, and a gift for reading the public mood.',
    'Duygusal tatmin ile kariyer hedeflerin uyumlu; bakım veren işler sana iyi gelir.', 'Emotional fulfilment and career goals align; caring work suits you.',
    'Aile ile kariyer arasında seçim yapmak zorunda hissedebilirsin; ikisini dengelemek önemli.', 'You may feel forced to choose between family and career; balancing both matters.'),
  // ---------- Merkür ----------
  'mercury-venus': e('Zarif, hoş ve diplomatik bir konuşma tarzın var; sanat, yazı ve estetikte yeteneklisin.', 'You have a graceful, pleasant, diplomatic way of speaking; you are gifted in art, writing and aesthetics.',
    'Sözlerin insanları rahatlatır; ikna ve uzlaştırma yeteneğin yüksek.', 'Your words put people at ease; you are skilled at persuasion and mediation.',
    'Hoş görünmek için gerçeği yumuşatma eğilimine dikkat.', 'Watch for softening the truth to seem pleasant.'),
  'mercury-mars': e('Keskin, hızlı ve tartışmacı bir zihnin var; fikirlerini cesurca savunursun. Sözlerin zaman zaman sert olabilir.', 'You have a sharp, fast, debating mind; you defend ideas boldly. Your words can sometimes be harsh.',
    'Hızlı karar verir, düşündüğünü uygularsın; tartışma ve problem çözmede güçlüsün.', 'You decide quickly and act on your thoughts; you are strong in debate and problem-solving.',
    'Tartışmalar kolayca kızışabilir; dinlemeye zaman ayırmak sözlerinin etkisini artırır.', 'Arguments can heat up easily; taking time to listen strengthens your words.'),
  'mercury-jupiter': e('Geniş düşünen, öğrenmeyi ve öğretmeyi seven bir zihin; büyük resmi görürsün.', 'A broad mind that loves learning and teaching; you see the big picture.',
    'Fikirlerin ilham verici; yazı, eğitim, yayıncılık ve hukuk sana uygun.', 'Your ideas inspire; writing, education, publishing and law suit you.',
    'Detayları gözden kaçırma ya da aşırı söz verme eğilimine dikkat.', 'Watch for missing details or overpromising.'),
  'mercury-saturn': e('Ciddi, derin ve yapılandırılmış düşünürsün; az ama öz konuşursun.', 'You think seriously, deeply and in a structured way; you speak little but meaningfully.',
    'Analitik, sabırlı ve kalıcı bilgi üreten bir zihin; uzmanlık sana uygun.', 'An analytical, patient mind that builds lasting knowledge; expertise suits you.',
    'Kendi fikirlerinden şüphe etme ya da karamsar düşünme olabilir; özgüven çalışması iyi gelir.', 'Self-doubt or pessimistic thinking may arise; building confidence helps.'),
  'mercury-uranus': e('Parlak, yenilikçi ve ani fikirlerle dolu bir zihin; teknoloji ve bilim sana yakın.', 'A brilliant, innovative mind full of sudden ideas; technology and science are close to you.',
    'Özgün fikirlerin hızla hayata geçer; dahiyane sezgilerin var.', 'Original ideas come to life quickly; you have flashes of genius.',
    'Düşüncelerin dağınık ya da sabırsız olabilir; odaklanmak verimliliğini artırır.', 'Your thoughts may scatter or be impatient; focus raises your productivity.'),
  'mercury-neptune': e('Hayal gücüyle düşünen, şiirsel ve sezgisel bir zihin; sanat ve anlatım yeteneğin yüksek.', 'A poetic, intuitive mind that thinks in images; you are gifted in art and storytelling.',
    'Yaratıcı yazı, müzik, film ve sezgisel iletişimde güçlüsün.', 'You are strong in creative writing, music, film and intuitive communication.',
    'Dikkat dağınıklığı ya da yanlış anlaşılmalar olabilir; önemli konuları yazılı netleştir.', 'Distraction or misunderstandings may happen; clarify important matters in writing.'),
  'mercury-pluto': e('Derin, araştırmacı ve ikna edici bir zihin; satır aralarını okursun.', 'A deep, investigative, persuasive mind; you read between the lines.',
    'Psikoloji, araştırma ve strateji alanında güçlüsün; sözlerin dönüştürücü.', 'You are strong in psychology, research and strategy; your words transform.',
    'Takıntılı düşünceler ya da sert sözler olabilir; esneklik iletişimini kolaylaştırır.', 'Obsessive thoughts or harsh words may arise; flexibility eases communication.'),
  'mercury-asc': e('Merkür yükselenle birleşiyor: konuşkan, meraklı ve zeki görünürsün; ilk izlenimin sözlerinle oluşur.', 'Mercury joins the Ascendant: you come across talkative, curious and clever; first impressions form through your words.',
    'Kendini rahatça ifade edersin.', 'You express yourself easily.', 'Düşündüğün ile gösterdiğin farklı olabilir.', 'What you think and what you show may differ.'),
  'mercury-mc': e('Merkür MC ile birleşiyor: iletişim, yazı ya da ticaret kariyerin merkezinde.', 'Mercury joins the Midheaven: communication, writing or trade is central to your career.',
    'Fikirlerin kariyerinde sana kapı açar.', 'Your ideas open doors in your career.', 'İşte iletişim karmaşalarına dikkat.', 'Watch for communication mix-ups at work.'),
  // ---------- Venüs ----------
  'venus-mars': e('Sevgi ile arzu iç içe: tutkulu, çekici ve canlı bir aşk tarzın var. Yaratıcı enerjin de çok güçlü.', 'Love and desire are fused: you have a passionate, magnetic, lively way of loving. Your creative energy is also very strong.',
    'Romantizm ve tutku kolayca birleşir; ilişkilerde hem şefkatli hem cesursun.', 'Romance and passion blend easily; you are both tender and bold in relationships.',
    'Aşkta istediğin ile seni çeken farklı olabilir; ilişkilerde tutku ve gerilim bir arada. Bu kıvılcım doğru kanalda çok yaratıcı.', 'What you want in love and what attracts you may differ; passion and tension coexist. Channelled well, this spark is very creative.'),
  'venus-jupiter': e('Sevgi dolu, cömert ve şanslı bir yapı; sosyal ilişkilerde ve maddi konularda bolluk.', 'A loving, generous, fortunate nature; abundance in social life and finances.',
    'İlişkiler ve para kolayca gelir; insanlar sana yardım etmeye isteklidir.', 'Relationships and money come easily; people are eager to help you.',
    'Aşırı harcama ya da fazla iyimser beklentiler olabilir; ölçü bereketini korur.', 'Overspending or overly rosy expectations may occur; moderation protects your abundance.'),
  'venus-saturn': e('Aşkta ciddi, sadık ve temkinlisin; zamanla derinleşen kalıcı bağlar ararsın.', 'In love you are serious, loyal and cautious; you seek lasting bonds that deepen with time.',
    'Sorumluluk ve sadakat ilişkilerinin temeli; olgun partnerler sana uygun.', 'Responsibility and loyalty are your relationships’ foundation; mature partners suit you.',
    'Sevilmeye değer olmadığın hissi ya da ilişkilerde gecikmeler olabilir; kendine değer vermek kapıları açar.', 'A feeling of not being lovable or delays in love may arise; valuing yourself opens doors.'),
  'venus-uranus': e('Aşkta özgür, sıra dışı ve heyecan arayan birisin; beklenmedik çekimler yaşarsın.', 'In love you are free, unconventional and thrill-seeking; you experience unexpected attractions.',
    'Arkadaşlıkla harmanlanmış, alan tanıyan ilişkiler sana iyi gelir; estetiğin özgün.', 'Friendship-based relationships with space suit you; your taste is original.',
    'Ani başlayıp biten ilişkiler ya da bağlılık kaygısı olabilir; özgürlük ile yakınlığı birlikte yaşamayı öğrenirsin.', 'Relationships that start and end suddenly, or fear of commitment, may occur; you learn to combine freedom and closeness.'),
  'venus-neptune': e('Romantik, idealist ve ruhani bir aşk anlayışın var; sanat ve müzik yeteneğin yüksek.', 'You have a romantic, idealistic, spiritual view of love; you are gifted in art and music.',
    'Koşulsuz sevgi ve yaratıcı ilham kolayca akar.', 'Unconditional love and creative inspiration flow easily.',
    'Partnerini idealize etme ya da hayal kırıklığı riski var; gerçekçi gözlerle bakmak seni korur.', 'There is a risk of idealising partners or disappointment; seeing realistically protects you.'),
  'venus-pluto': e('Aşkta yoğun, tutkulu ve tüm ya da hiç tavrındasın; ilişkiler seni derinden dönüştürür.', 'In love you are intense, passionate and all-or-nothing; relationships transform you deeply.',
    'Derin bağlılık ve manyetik çekim sende doğal; ilişkilerin seni güçlendirir.', 'Deep commitment and magnetic attraction come naturally; relationships empower you.',
    'Kıskançlık, sahiplenme ya da güç dengesizlikleri olabilir; güven ve eşitlik ilişkilerini sağlıklı tutar.', 'Jealousy, possessiveness or power imbalances may arise; trust and equality keep bonds healthy.'),
  'venus-asc': e('Venüs yükselenle birleşiyor: doğal çekiciliğin ve zarafetin ilk anda fark edilir.', 'Venus joins the Ascendant: your natural charm and grace are noticed at once.',
    'Sevimli ve uyumlu bir izlenim bırakırsın.', 'You leave a likeable, harmonious impression.', 'Görünüşe fazla önem verme eğilimine dikkat.', 'Watch for overvaluing appearances.'),
  'venus-mc': e('Venüs MC ile birleşiyor: sanat, güzellik, moda ya da diplomasi kariyerinde öne çıkar; kamu imajın sevimli.', 'Venus joins the Midheaven: art, beauty, fashion or diplomacy stands out in your career; your public image is likeable.',
    'Kariyerinde ilişkiler ve estetik sana kapı açar.', 'Relationships and aesthetics open doors in your career.', 'İş ile aşkı karıştırmamaya dikkat.', 'Take care not to mix work and romance.'),
  // ---------- Mars ----------
  'mars-jupiter': e('Büyük bir enerji, cesaret ve girişim ruhu; büyük hedefleri kovalarsın.', 'Great energy, courage and enterprise; you chase big goals.',
    'Eylemlerin şansla desteklenir; spor, liderlik ve girişimcilik sana uygun.', 'Your actions are backed by luck; sport, leadership and entrepreneurship suit you.',
    'Aşırı risk alma ya da sabırsızlık olabilir; planlı hareket şansını kalıcı kılar.', 'Excessive risk-taking or impatience may occur; planning makes luck last.'),
  'mars-saturn': e('Disiplinli, dayanıklı ve stratejik bir enerji; zor işleri sabırla başarırsın.', 'Disciplined, enduring, strategic energy; you accomplish hard tasks patiently.',
    'Çalışkan ve sebatlısın; uzun soluklu projelerde ustasın.', 'You are hard-working and persistent; you master long-term projects.',
    'Engellenmiş hissetme ya da bastırılmış öfke olabilir; adım adım ilerlemek frenleri gaz pedalına çevirir.', 'You may feel blocked or hold suppressed anger; step-by-step progress turns brakes into fuel.'),
  'mars-uranus': e('Ani, cesur ve yenilikçi bir enerji; özgürlük için savaşırsın.', 'Sudden, bold, innovative energy; you fight for freedom.',
    'Hızlı tepki ve yaratıcı çözümlerde ustasın.', 'You excel at quick reactions and creative solutions.',
    'Ani öfke, sabırsızlık ya da kazalara dikkat; enerjini kontrollü kullanmak önemli.', 'Watch for sudden anger, impatience or accidents; using energy with control matters.'),
  'mars-neptune': e('Enerjin ilham ve ideallerle hareket eder; sanat, dans ve şifa işlerinde güçlüsün.', 'Your energy is driven by inspiration and ideals; you are strong in art, dance and healing.',
    'İdealler için harekete geçmek sana kolay gelir.', 'Acting for ideals comes easily.',
    'Motivasyon dalgalanmaları ya da belirsiz hedefler olabilir; net planlar enerjini toplar.', 'Motivation may fluctuate or goals blur; clear plans gather your energy.'),
  'mars-pluto': e('Muazzam bir irade ve dayanıklılık; hedefe kilitlendiğinde vazgeçmezsin.', 'Enormous willpower and stamina; once locked on a goal you never quit.',
    'Krizlerde soğukkanlı ve güçlüsün; dönüştürücü işler sana uygun.', 'You are cool and strong in crises; transformative work suits you.',
    'Güç mücadeleleri ve yoğun öfke olabilir; bu gücü yapıcı hedeflere yönlendirmek şart.', 'Power struggles and intense anger may arise; channelling this power constructively is essential.'),
  'mars-asc': e('Mars yükselenle birleşiyor: enerjik, cesur ve sportif bir duruş; doğrudan ve hızlısın.', 'Mars joins the Ascendant: an energetic, brave, sporty presence; you are direct and quick.',
    'Kendini cesurca ortaya koyarsın.', 'You put yourself forward bravely.', 'Saldırgan algılanmamaya dikkat.', 'Take care not to come across as aggressive.'),
  'mars-mc': e('Mars MC ile birleşiyor: hırslı, rekabetçi ve girişimci bir kariyer.', 'Mars joins the Midheaven: an ambitious, competitive, entrepreneurial career.',
    'Kariyerde liderlik ve cesaret sana kapı açar.', 'Leadership and courage open doors in your career.', 'Otoriteyle çatışmalara dikkat.', 'Watch for conflicts with authority.'),
  // ---------- Jüpiter ----------
  'jupiter-saturn': e('Büyüme ile yapı arasında denge: hem vizyonun hem disiplinin var.', 'Balance between growth and structure: you have both vision and discipline.',
    'Hedeflerini gerçekçi planlarla büyütürsün; sağlam bir başarı yolu.', 'You grow your goals with realistic plans; a solid path to success.',
    'İyimserlik ile temkin arasında gidip gelebilirsin; doğru zamanı seçmek önemli.', 'You may swing between optimism and caution; choosing the right moment matters.'),
  'jupiter-uranus': e('Ani fırsatlar ve özgürleştirici şans; yenilikçi fikirlerle büyürsün.', 'Sudden opportunities and liberating luck; you grow through innovative ideas.',
    'Beklenmedik kapılar kolayca açılır.', 'Unexpected doors open easily.', 'Ani kararlar ve aşırı risk alma eğilimine dikkat.', 'Watch for sudden decisions and excessive risk.'),
  'jupiter-neptune': e('Maneviyat, şefkat ve ilham dolu bir vizyon; idealist ve hayırseversin.', 'A vision full of spirituality, compassion and inspiration; you are idealistic and charitable.',
    'Sezgin ve inancın seni korur.', 'Your intuition and faith protect you.', 'Aşırı idealizm ya da gerçek dışı beklentilere dikkat.', 'Watch for excessive idealism or unrealistic expectations.'),
  'jupiter-pluto': e('Büyük güç ve etki potansiyeli; büyük dönüşümleri yönetebilirsin.', 'Great potential for power and influence; you can manage big transformations.',
    'Kaynakları ve insanları etkili biçimde yönetirsin.', 'You manage resources and people effectively.', 'Güç hırsını dengelemek önemli.', 'Balancing ambition for power matters.'),
  'jupiter-asc': e('Jüpiter yükselenle birleşiyor: sıcak, cömert ve iyimser bir aura; insanlar sana güvenir.', 'Jupiter joins the Ascendant: a warm, generous, optimistic aura; people trust you.',
    'Şans ve destek kolayca gelir.', 'Luck and support come easily.', 'Aşırılık ve kilo eğilimine dikkat.', 'Watch for excess and weight gain.'),
  'jupiter-mc': e('Jüpiter MC ile birleşiyor: kariyer şansı ve yükselme; saygın bir kamu imajı.', 'Jupiter joins the Midheaven: career luck and advancement; a respected public image.',
    'Kariyerinde fırsatlar ve destekçiler bol.', 'Plenty of opportunities and supporters in your career.', 'Kariyerde aşırı söz vermeye dikkat.', 'Watch for overpromising at work.'),
  // ---------- Satürn ----------
  'saturn-uranus': e('Eski ile yeni arasında köprü kurarsın; yapı ile özgürlüğü birleştirirsin.', 'You bridge old and new; you combine structure and freedom.',
    'Yenilikleri kalıcı yapılara dönüştürürsün.', 'You turn innovations into lasting structures.', 'Kurallar ile özgürlük arasında gerilim; ikisine de yer açmak önemli.', 'Tension between rules and freedom; making room for both matters.'),
  'saturn-neptune': e('Hayalleri gerçeğe dönüştürme yeteneği; ruhani disiplin.', 'The ability to make dreams real; spiritual discipline.',
    'İdeallerine somut bir yapı verirsin.', 'You give concrete structure to your ideals.', 'Hayal kırıklığı ya da belirsizlik kaygısı olabilir.', 'Disappointment or anxiety about uncertainty may arise.'),
  'saturn-pluto': e('Muazzam dayanıklılık ve köklü dönüşüm gücü.', 'Immense endurance and power for deep transformation.',
    'Zor koşullarda sabırla yeniden inşa edersin.', 'You rebuild patiently in hard conditions.', 'Ağır sorumluluklar ve kontrol ihtiyacı zorlayabilir.', 'Heavy responsibilities and a need for control can weigh on you.'),
  'saturn-asc': e('Satürn yükselenle birleşiyor: ciddi, olgun ve güvenilir bir izlenim; yaşla açılan bir çekicilik.', 'Saturn joins the Ascendant: a serious, mature, reliable impression; attractiveness that grows with age.',
    'Güven veren, ağırbaşlı bir duruş.', 'A reassuring, dignified presence.', 'Mesafeli ya da soğuk algılanabilirsin.', 'You may be seen as distant or cold.'),
  'saturn-mc': e('Satürn MC ile birleşiyor: geç ama kalıcı başarı; otorite zamanla gelir.', 'Saturn joins the Midheaven: late but lasting success; authority comes with time.',
    'Kariyerde disiplin ve sabır seni zirveye taşır.', 'Discipline and patience carry you to the top.', 'Kariyerde gecikmeler ve sınavlar; sabır şart.', 'Delays and tests in your career; patience is essential.'),
  // ---------- Dış gezegenler ve açılar ----------
  'uranus-asc': e('Uranüs yükselenle birleşiyor: sıra dışı, özgün ve sürprizli bir aura.', 'Uranus joins the Ascendant: an unconventional, original, surprising aura.', 'Farklılığın çekici bulunur.', 'Your uniqueness is attractive.', 'Ani imaj değişiklikleri ve huzursuzluk.', 'Sudden image changes and restlessness.'),
  'uranus-mc': e('Uranüs MC ile birleşiyor: sıra dışı ve sürprizli bir kariyer yolu.', 'Uranus joins the Midheaven: an unconventional, surprising career path.', 'Yenilikçi kariyer fırsatları.', 'Innovative career opportunities.', 'Ani kariyer değişimleri.', 'Sudden career changes.'),
  'neptune-asc': e('Neptün yükselenle birleşiyor: rüya gibi, gizemli ve büyüleyici bir aura.', 'Neptune joins the Ascendant: a dreamy, mysterious, enchanting aura.', 'Empatik ve ilham veren bir izlenim.', 'An empathic, inspiring impression.', 'Başkalarının yansıttıklarında kaybolmaya dikkat.', 'Watch for losing yourself in others’ projections.'),
  'neptune-mc': e('Neptün MC ile birleşiyor: sanatsal, ruhani ya da şifa odaklı bir kariyer.', 'Neptune joins the Midheaven: an artistic, spiritual or healing career.', 'İlham veren bir kamu imajı.', 'An inspiring public image.', 'Kariyer yönünde belirsizlik.', 'Uncertainty about career direction.'),
  'pluto-asc': e('Plüton yükselenle birleşiyor: yoğun, manyetik ve güçlü bir aura.', 'Pluto joins the Ascendant: an intense, magnetic, powerful aura.', 'Etkileyici ve dönüştürücü bir varlık.', 'A compelling, transformative presence.', 'Korkutucu ya da kontrolcü algılanmaya dikkat.', 'Watch for being seen as intimidating or controlling.'),
  'pluto-mc': e('Plüton MC ile birleşiyor: güç ve etki pozisyonları; kariyerde köklü dönüşümler.', 'Pluto joins the Midheaven: positions of power and influence; deep career transformations.', 'Etkili ve dönüştürücü bir kariyer.', 'An influential, transformative career.', 'Otoriteyle güç mücadelesi.', 'Power struggles with authority.'),
  // ---------- Chiron ----------
  'chiron-sun': e('Kimliğinle ilgili derin bir yara ve bu yaradan doğan şifa verme gücü; başkalarının kendini bulmasına yardım edersin.', 'A deep wound around identity and the healing gift born from it; you help others find themselves.', 'Yaranı şifaya dönüştürmek sana doğal gelir.', 'Turning your wound into healing comes naturally.', 'Kendini yetersiz hissetme anları olabilir; bu his senin öğretmenin.', 'Moments of feeling inadequate may arise; this feeling is your teacher.'),
  'chiron-moon': e('Duygusal bir yara ve derin bir şefkat; başkalarının acısını anlarsın.', 'An emotional wound and deep compassion; you understand others’ pain.', 'Duygusal şifacılık yeteneğin güçlü.', 'Your gift for emotional healing is strong.', 'Eski duygusal yaralar zaman zaman canlanabilir; kendine şefkat iyileştirir.', 'Old emotional wounds may resurface; self-compassion heals.'),
  'chiron-venus': e('Sevgi ve öz değerle ilgili bir yara; ilişkilerde şefkatli bir şifacısın.', 'A wound around love and self-worth; you are a compassionate healer in relationships.', 'Sevgiyle iyileştirirsin.', 'You heal through love.', 'Sevilmeye değer olmadığın hissi; öz değer çalışması anahtar.', 'A feeling of being unlovable; self-worth work is key.'),
  'chiron-mars': e('İrade ve cesaretle ilgili bir yara; başkalarını güçlendiren bir savaşçısın.', 'A wound around will and courage; you are a warrior who empowers others.', 'Mücadelende başkalarına da güç verirsin.', 'In your struggle you empower others too.', 'Kendini savunmakta zorlanma; sınır koymak iyileştirir.', 'Difficulty standing up for yourself; setting boundaries heals.'),
  'chiron-asc': e('Chiron yükselenle birleşiyor: yaralı şifacı arketipini taşırsın; insanlar sana dertlerini açar.', 'Chiron joins the Ascendant: you carry the wounded-healer archetype; people confide in you.', 'Hassasiyetin şifa verir.', 'Your sensitivity heals.', 'Kendini savunmasız hissetme anları.', 'Moments of feeling vulnerable.'),
  // ---------- Ay Düğümü ----------
  'node-sun': e('Kimliğin ve kaderin aynı yönde: bu hayattaki amacına doğru parlarsın.', 'Identity and destiny align: you shine toward your life purpose.', 'Kendin oldukça büyürsün.', 'You grow by being yourself.', 'Ego ile ruhsal yön arasında denge kurmayı öğrenirsin.', 'You learn to balance ego and soul direction.'),
  'node-moon': e('Duyguların ve sezgilerin kaderine rehberlik eder; aile ve geçmiş önemli.', 'Feelings and intuition guide your destiny; family and the past matter.', 'Sezgine güvendiğinde doğru yoldasın.', 'Trusting intuition keeps you on track.', 'Geçmişe bağlı kalmak ile ilerlemek arasında gerilim.', 'Tension between clinging to the past and moving on.'),
  'node-venus': e('Aşk, sanat ve ilişkiler ruhsal yolunun parçası; kader bağlantıları yaşarsın.', 'Love, art and relationships are part of your soul path; you experience fated connections.', 'İlişkiler seni amacına taşır.', 'Relationships carry you to your purpose.', 'Konfor ile büyüme arasında seçim anları.', 'Moments of choosing between comfort and growth.'),
  'node-mars': e('Cesaret ve eylem ruhsal yolunun anahtarı.', 'Courage and action are keys to your soul path.', 'Harekete geçtiğinde kader kapıları açılır.', 'When you act, destiny opens doors.', 'Acelecilik ile doğru zamanlama arasında denge.', 'Balance between haste and right timing.'),
  'node-saturn': e('Sorumluluk ve olgunluk ruhsal büyümenin merkezinde.', 'Responsibility and maturity are central to your soul growth.', 'Disiplin seni amacına götürür.', 'Discipline leads you to your purpose.', 'Ağır dersler ve gecikmeler; sabır olgunlaştırır.', 'Heavy lessons and delays; patience matures you.'),
  'node-asc': e('Kuzey Düğüm yükselenle birleşiyor: kendini ifade etmek kaderin.', 'The North Node joins the Ascendant: self-expression is your destiny.', 'Kendin oldukça ilerlersin.', 'You progress by being yourself.', 'Kendin ile ilişkilerin arasında denge.', 'Balance between yourself and relationships.'),
};

const ORDER: K[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'chiron', 'node', 'asc', 'mc'];
function key(a: K, b: K): string | null {
  for (const [x, y] of [[a, b], [b, a]]) if (P[`${x}-${y}`]) return `${x}-${y}`;
  return null;
}
export function hasPair(a: K, b: K) { return key(a, b) !== null; }

const QUINCUNX: L = { tr: ' Quincunx (150°) açısı bu iki alan arasında sürekli ince ayar gerektirir; esnek kalmak çözümdür.', en: ' The quincunx (150°) asks for constant fine-tuning between these two areas; flexibility is the answer.' };

/** Doğum haritası açı yorumu (yoksa null) */
export function natalAspectText(a: K, b: K, type: AspectType): L | null {
  const k = key(a, b);
  if (!k) return null;
  const p = P[k];
  if (type === 'conjunction') return p.c;
  if (type === 'sextile' || type === 'trine') return p.s;
  if (type === 'quincunx') return { tr: p.h.tr + QUINCUNX.tr, en: p.h.en + QUINCUNX.en };
  return p.h;
}

export const pointName = (k: K): L => k === 'asc' ? { tr: 'Yükselen', en: 'Ascendant' } : k === 'mc' ? { tr: 'MC', en: 'Midheaven' } : BODIES[k].name;
export const aspectTitle = (a: K, b: K, type: AspectType): L => ({
  tr: `${pointName(a).tr} ${ASPECT_INFO[type].name.tr} ${pointName(b).tr}`,
  en: `${pointName(a).en} ${ASPECT_INFO[type].name.en} ${pointName(b).en}`,
});
export { ORDER as ASPECT_POINT_ORDER };
