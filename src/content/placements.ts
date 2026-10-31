import type { BodyId } from '../engine/astro';
import { L, SIGNS, SIGN_ADVERB, BODY_FUNCTION, BODIES } from './base';

const S = (tr: string, en: string): L => ({ tr, en });

export const SUN: L[] = [
  S('Doğuştan liderlik ruhun var. Hızlı karar verir, ilk adımı atarsın; meydan okumalar seni canlandırır. Sabır ve başladığını bitirmek en büyük dersin.', 'You are a natural pioneer. You decide fast, take the first step and come alive with a challenge. Patience and follow-through are your big lessons.'),
  S('Sağlam, güvenilir ve kararlısın. Güzel şeylerden, konfordan ve kalıcı değerlerden beslenirsin. Değişime direnç gösterebilirsin ama inşa ettiğin şey uzun sürer.', 'Grounded, reliable and determined. You thrive on beauty, comfort and lasting value. You can resist change, but what you build lasts.'),
  S('Zihnin hızlı, merakın sonsuz. Sohbet, bilgi ve çeşitlilik seni besler; birden fazla ilgi alanına sahip olman normal. Odaklanmak en büyük sınavın.', 'Quick mind, endless curiosity. Conversation, information and variety feed you; having many interests is natural. Focus is your main test.'),
  S('Duygusal zekân yüksek; sevdiklerini korur, güvenli bir yuva yaratırsın. Sezgilerin güçlü, hafızan duygusal. Kabuğuna çekilmek yerine ihtiyaçlarını söylemeyi öğrenmelisin.', 'High emotional intelligence; you protect loved ones and create a safe nest. Strong intuition, emotional memory. Learn to voice needs instead of retreating into your shell.'),
  S('Sahne senin; sıcaklığın ve özgüveninle çevreni aydınlatırsın. Yaratıcı, cömert ve sadıksın. Takdir görmek önemli ama kendi değerini başkalarının alkışına bağlamamalısın.', 'The stage is yours; your warmth and confidence light up a room. Creative, generous and loyal. Appreciation matters, but your worth shouldn’t depend on applause.'),
  S('Detaylara hâkimsin; işleri düzene sokmak ve faydalı olmak sana iyi gelir. Analitik ve çalışkansın. Mükemmeliyetçiliği kendine yönelik eleştiriye dönüştürmemeye dikkat et.', 'You master details; organising and being useful feels good. Analytical and hard-working. Don’t let perfectionism turn into self-criticism.'),
  S('Uyum, güzellik ve adalet senin için temel. İnsanları bir araya getirir, ilişkilerde parlarsın. Kararsızlık ve herkesi memnun etme isteği en büyük tuzağın.', 'Harmony, beauty and fairness are essential to you. You bring people together and shine in partnership. Indecision and people-pleasing are your traps.'),
  S('Yoğun, derin ve manyetiksin. Yüzeysellik sana göre değil; gerçeğin peşine düşer, krizlerden güçlenerek çıkarsın. Kontrol ve kıskançlık temalarını dönüştürmek gelişimin.', 'Intense, deep and magnetic. Surface-level isn’t for you; you seek the truth and emerge stronger from crises. Transforming control and jealousy is your growth.'),
  S('Özgürlüğüne düşkün, iyimser ve maceracısın. Seyahat, öğrenme ve anlam arayışı seni büyütür. Dürüstlüğün bazen fazla direkt olabilir; vaatlerini gerçekçi tut.', 'Freedom-loving, optimistic and adventurous. Travel, learning and the search for meaning expand you. Your honesty can be blunt; keep promises realistic.'),
  S('Hedef odaklı, sorumluluk sahibi ve sabırlısın. Zamanla yükselen bir başarı hikâyen var. Kendine dinlenme ve duygularını gösterme izni vermelisin.', 'Goal-driven, responsible and patient. Your success story builds over time. Give yourself permission to rest and show feelings.'),
  S('Özgün düşünür, kalıpları kırarsın. Topluluklar, idealler ve gelecek vizyonu seni harekete geçirir. Mesafeli görünebilirsin; duygusal yakınlık kurmak gelişim alanın.', 'An original thinker who breaks moulds. Communities, ideals and visions of the future drive you. You can seem detached; emotional closeness is your growth area.'),
  S('Empatin ve hayal gücün çok güçlü. Sanat, müzik, maneviyat ve şifa sana iyi gelir. Sınır koymak ve kaçış eğilimlerini fark etmek önemli.', 'Powerful empathy and imagination. Art, music, spirituality and healing nourish you. Setting boundaries and noticing escapist habits is key.'),
];

export const MOON: L[] = [
  S('Duyguların hızlı yükselir, hızlı söner. Rahatlamak için harekete, spora, aksiyona ihtiyaç duyarsın. Bağımsızlığına saygı duyulduğunda güvende hissedersin.', 'Emotions flare and fade fast. You decompress through movement and action. You feel safe when your independence is respected.'),
  S('Ay burada yücelimde: duygusal olarak istikrarlı ve sakinsin. Güzel yemek, doğa, dokunma ve rutin seni besler. Ani değişimler seni zorlar.', 'Exalted Moon: emotionally steady and calm. Good food, nature, touch and routine nurture you. Sudden changes unsettle you.'),
  S('Duygularını konuşarak, yazarak işlersin. Zihinsel uyarım ve sohbet sana iyi gelir. Hissetmek yerine düşünmeye kaçabilirsin.', 'You process feelings by talking and writing. Mental stimulation and conversation soothe you. You may think instead of feel.'),
  S('Ay kendi evinde: duygusal derinliğin ve şefkatin çok güçlü. Yuva, aile ve geçmiş anılar seni besler. Kırılganlığını korumak için kabuk örebilirsin.', 'Moon at home: deep emotions and strong nurturing. Home, family and memories feed you. You may build a shell to protect sensitivity.'),
  S('Sevgi ve takdir gördüğünde parlarsın. Duygularını dramatik ve sıcak ifade edersin. Yaratıcı ifade ve oyun sana iyi gelir.', 'You glow when loved and appreciated. You express emotion warmly and dramatically. Creative play recharges you.'),
  S('Düzen ve faydalı olmak seni sakinleştirir. Sevgini hizmet ederek, ilgilenerek gösterirsin. Endişe ve aşırı analiz duygusal tuzağın.', 'Order and being useful calm you. You show love through acts of service. Worry and overanalysis are your emotional traps.'),
  S('Uyumlu ortamlarda ve ilişki içinde kendini güvende hissedersin. Çatışmadan kaçınırsın; estetik ve nezaket sana iyi gelir.', 'You feel safe in harmony and partnership. You avoid conflict; beauty and kindness soothe you.'),
  S('Ay burada düşüşte: duyguların çok yoğun ve derindir. Güvenmeden açılmazsın; sadakat ve dürüstlük senin için her şey. Duygusal dönüşümler seni güçlendirir.', 'Moon in fall: feelings run very deep and intense. You open up only with trust; loyalty and honesty are everything. Emotional transformations strengthen you.'),
  S('Özgürlük ve anlam seni besler. Seyahat, öğrenme ve kahkaha duygusal ilacın. Sıkışmış hissettiğinde kaçmak isteyebilirsin.', 'Freedom and meaning feed you. Travel, learning and laughter are your medicine. Feeling trapped makes you want to flee.'),
  S('Ay burada zararda: duygularını kontrol altında tutar, güçlü görünürsün. Başarı ve yapı sana güven verir. Kendine şefkat göstermeyi öğrenmek önemli.', 'Moon in detriment: you keep feelings controlled and appear strong. Achievement and structure give security. Learning self-compassion is important.'),
  S('Duygularına mantıkla yaklaşır, alan ihtiyacı duyarsın. Arkadaşlık ve topluluk seni besler. Mesafeli görünmen, aslında kendini koruma biçimin.', 'You approach feelings rationally and need space. Friendship and community nourish you. Seeming detached is how you protect yourself.'),
  S('Son derece empatik ve sezgiselsin; başkalarının duygularını sünger gibi çekersin. Müzik, su, sanat ve yalnız zaman sana iyi gelir.', 'Deeply empathic and intuitive; you absorb others’ feelings like a sponge. Music, water, art and alone time restore you.'),
];

export const ASC: L[] = [
  S('Enerjik, sportif ve doğrudan bir ilk izlenim bırakırsın. Hızlı adımlar, keskin bakışlar ve “hemen başlayalım” tavrı. İnsanlar seni cesur ve rekabetçi algılar.', 'You come across energetic, sporty and direct — quick steps, a sharp gaze and a “let’s go” attitude. People see you as bold and competitive.'),
  S('Sakin, güven veren ve zarif bir aura taşırsın. Çoğu zaman güzel bir ses, belirgin boyun ve yüz hatları ile ilişkilendirilir. Yavaş ama etkileyici bir varlığın var.', 'You radiate calm, trustworthy elegance — often linked to a lovely voice and defined neck and features. Slow but impressive presence.'),
  S('Genç, meraklı ve konuşkan görünürsün; mimiklerin ve ellerin canlıdır. İnsanlar seni esprili ve kolay yaklaşılabilir bulur.', 'You look youthful, curious and chatty with lively expressions and hands. People find you witty and approachable.'),
  S('Yumuşak, koruyucu ve sıcak bir enerji yayarsın. Yuvarlak, sevimli hatlar ve duygusal gözler bu yükselenle sık anılır. Önce korunaklı, sonra çok sıcaksın.', 'You give off soft, protective warmth — often associated with round, sweet features and expressive eyes. Guarded at first, then very warm.'),
  S('Girdiğin yerde fark edilirsin. Saçlar, duruş ve karizma ön plandadır. İnsanlar seni özgüvenli ve sıcak bulur.', 'You get noticed when you walk in. Hair, posture and charisma stand out. People find you confident and warm.'),
  S('Temiz, düzenli ve zarif bir görünümün var. Detaycı, mütevazı ve zeki algılanırsın. Sade ama kusursuz bir tarz sana yakışır.', 'You look neat, polished and refined. You’re seen as detail-oriented, modest and smart. Simple but flawless suits you.'),
  S('Çekici, uyumlu ve nazik bir ilk izlenim bırakırsın. Simetrik hatlar ve hoş bir gülümseme bu yükselenle sık anılır. İnsanlar seni sevimli ve diplomatik bulur.', 'Charming, balanced and kind first impression — often linked to symmetrical features and a lovely smile. People find you likeable and diplomatic.'),
  S('Manyetik ve gizemli bir auran var; yoğun bakışlar bu yükselenin imzasıdır. İnsanlar seni çözmesi zor ve etkileyici bulur.', 'Magnetic and mysterious; an intense gaze is this rising’s signature. People find you hard to read and compelling.'),
  S('Neşeli, açık ve maceracı bir ilk izlenim. Rahat, sportif bir duruş ve geniş gülümseme. İnsanlar seni eğlenceli ve dürüst bulur.', 'Cheerful, open and adventurous first impression. Relaxed, athletic posture and a big smile. People find you fun and honest.'),
  S('Ciddi, olgun ve otoriter görünürsün; belirgin kemik yapısı bu yükselenle anılır. Yaşla birlikte daha da çekici hale geldiğine inanılır.', 'You appear serious, mature and authoritative — often linked to strong bone structure. It’s said to grow more attractive with age.'),
  S('Farklı, özgün ve biraz sıra dışı bir aura taşırsın. Arkadaş canlısı ama mesafeli algılanırsın; tarzın akımları takip etmez, belirler.', 'You give off a unique, slightly unconventional vibe. Friendly yet distant; your style doesn’t follow trends, it sets them.'),
  S('Rüya gibi, yumuşak ve büyüleyici bir enerjin var. Etkileyici, nemli bakan gözler bu yükselenle anılır. İnsanlar seni nazik ve gizemli bulur.', 'Dreamy, soft and enchanting energy — often linked to captivating, dewy eyes. People find you gentle and mysterious.'),
];

export const MERCURY: L[] = [
  S('Hızlı düşünür, direkt konuşursun. Fikirlerini savunmaktan çekinmezsin; sabırsızlık iletişimde sınavın.', 'You think fast and speak directly. You defend ideas fearlessly; impatience is your communication test.'),
  S('Yavaş ama sağlam düşünürsün. Pratik, net ve ikna edicisin; bir kez karar verdin mi zor değişirsin.', 'You think slowly but solidly. Practical, clear and persuasive; once decided, hard to sway.'),
  S('Merkür kendi evinde: zekân çevik, dilin güçlü. Yazma, konuşma, sosyal medya ve öğrenmede yeteneklisin.', 'Mercury at home: agile mind, gifted tongue. Talent for writing, speaking, social media and learning.'),
  S('Duygusal hafızan çok güçlü; sezgilerinle düşünürsün. Konuşurken ton ve hislere dikkat edersin.', 'Strong emotional memory; you think with intuition. You notice tone and feelings when speaking.'),
  S('Etkileyici ve dramatik konuşursun; hikâye anlatıcılığın güçlü. Fikirlerin yaratıcı ve özgüvenli.', 'You speak expressively and dramatically; a strong storyteller. Creative, confident ideas.'),
  S('Merkür kendi evinde ve yücelimde: analitik, titiz ve problem çözücüsün. Detayları kimse senin kadar görmez.', 'Mercury at home and exalted: analytical, precise problem-solver. Nobody catches details like you.'),
  S('Diplomatik ve dengeli iletişim kurarsın. Her iki tarafı görürsün; karar vermek bazen zaman alır.', 'Diplomatic, balanced communicator. You see both sides; deciding can take time.'),
  S('Araştırmacı ve sezgisel bir zihnin var. Satır aralarını okur, sırları çözersin; sözlerin keskin olabilir.', 'Investigative, intuitive mind. You read between the lines and uncover secrets; your words can cut.'),
  S('Büyük resmi görür, felsefi düşünürsün. Dürüst ve esprilisin; detaylar bazen gözünden kaçar.', 'You see the big picture and think philosophically. Honest and funny; details can slip.'),
  S('Stratejik, ciddi ve yapılandırılmış düşünürsün. Az ama öz konuşur, uzun vadeli planlarda ustasın.', 'Strategic, serious and structured. You speak little but meaningfully; a master of long-term plans.'),
  S('Yenilikçi ve sıra dışı fikirlerin var. Teknoloji, bilim ve gelecek odaklı düşünürsün; inatçı olabilirsin.', 'Innovative, unconventional ideas. You think in tech, science and future terms; can be stubborn.'),
  S('Hayal gücüyle düşünürsün; şiirsel, sezgisel ve sanatsal bir zihin. Somut detaylarda zorlanabilirsin.', 'You think in images; poetic, intuitive and artistic. Concrete details can be challenging.'),
];

export const VENUS: L[] = [
  S('Aşkta avcısın: ilk adımı atmayı, heyecanı ve kovalamayı seversin. Hızlı aşık olursun; sıkıcılık ilişkinin düşmanı.', 'You’re the hunter in love — you like making the first move and the thrill of the chase. You fall fast; boredom kills romance.'),
  S('Venüs kendi evinde: sadık, duyusal ve romantiksin. Dokunma, güzel yemek ve hediyeler aşk dilin. Güven duymak istersin.', 'Venus at home: loyal, sensual and romantic. Touch, good food and gifts are your love language. You need security.'),
  S('Zihinsel bağ olmadan çekim olmaz. Esprili mesajlaşma, sohbet ve çeşitlilik seni cezbeder.', 'No mental connection, no attraction. Witty texting, conversation and variety win you over.'),
  S('Koruyucu ve bağlı bir aşık; yuva kurmak, ilgilenmek istersin. Duygusal güvenlik her şeyden önce gelir.', 'Protective, devoted lover; you want to build a home and nurture. Emotional security comes first.'),
  S('Büyük romantik jestleri, iltifatları ve gösterişli aşkı seversin. Sadık ve cömertsin; takdir edilmek istersin.', 'You love grand gestures, compliments and a showy romance. Loyal and generous; you need to feel adored.'),
  S('Venüs burada düşüşte: sevgini hizmetle, ince detaylarla gösterirsin. Seçicisin; kusurları fark etmek seni bazen geri tutar.', 'Venus in fall: you show love through service and small details. Selective; noticing flaws can hold you back.'),
  S('Venüs kendi evinde: romantik, zarif ve ilişki odaklısın. Uyum, nezaket ve estetik partner seçiminde belirleyici.', 'Venus at home: romantic, elegant, partnership-oriented. Harmony, courtesy and aesthetics guide your choice of partner.'),
  S('Venüs burada zararda: ya hep ya hiç sevgisi. Derin, tutkulu, sadık ve yoğun; güvenin kırılması kolay affedilmez.', 'Venus in detriment: all-or-nothing love. Deep, passionate, loyal and intense; broken trust is hard to forgive.'),
  S('Özgür, eğlenceli ve maceracı bir aşk istersin. Seyahat, öğrenme ve kahkaha paylaşabildiğin biri seni yakalar.', 'You want free, fun, adventurous love. Someone you can travel, learn and laugh with captures you.'),
  S('Ciddi ve kalıcı ilişkiler ararsın; zaman içinde açılırsın. Statü, güvenilirlik ve olgunluk seni cezbeder.', 'You look for serious, lasting love and open up over time. Status, reliability and maturity attract you.'),
  S('Önce arkadaşlık, sonra aşk. Alan ve özgürlük tanıyan, farklı ve zeki birini istersin.', 'Friends first, then lovers. You want someone unique and clever who gives you space.'),
  S('Venüs burada yücelimde: koşulsuz, romantik ve fedakâr seversin. Ruh eşi arayışı; partneri idealize etmeye dikkat.', 'Venus exalted: unconditional, romantic, self-sacrificing love. Soulmate seeker — watch out for idealising partners.'),
];

export const MARS: L[] = [
  S('Mars kendi evinde: enerjin yüksek, rekabetçi ve cesursun. Spor ve hızlı aksiyon seni besler; öfken çabuk gelir, çabuk geçer.', 'Mars at home: high energy, competitive and brave. Sport and quick action feed you; anger flares and fades fast.'),
  S('Mars burada zararda: yavaş başlar ama durdurulamazsın. Sabırlı, inatçı ve dayanıklısın; arzuların duyusal.', 'Mars in detriment: slow to start but unstoppable. Patient, stubborn and enduring; sensual desires.'),
  S('Zihinsel enerjin yüksek; tartışma ve birden çok proje seni canlı tutar. Enerjin dağılabilir.', 'High mental energy; debate and multiple projects keep you alive. Energy can scatter.'),
  S('Mars burada düşüşte: duygusal motivasyonla hareket edersin. Sevdiklerini korurken çok güçlüsün; pasif-agresiflikten kaçın.', 'Mars in fall: driven by emotion. Fierce when protecting loved ones; avoid passive-aggression.'),
  S('Gösterişli, cömert ve yaratıcı bir enerji. Liderlik etmek ve takdir edilmek seni motive eder.', 'Dramatic, generous, creative drive. Leading and being admired motivates you.'),
  S('Verimli, metodik ve çalışkan. Enerjin detaylı işlerde ve beceri geliştirmede parlar.', 'Efficient, methodical and hard-working. Your drive shines in detailed work and skill-building.'),
  S('Mars burada zararda: çatışmadan kaçınır, ortaklık içinde harekete geçersin. Adalet seni ateşler.', 'Mars in detriment: you avoid open conflict and act through partnership. Injustice fires you up.'),
  S('Mars kendi evinde (geleneksel): stratejik, kararlı ve tutkulu. Hedefe kilitlenince vazgeçmezsin.', 'Mars at home (traditional): strategic, determined and passionate. Once locked on, you never quit.'),
  S('Maceracı ve iyimser bir enerji; seyahat, spor ve özgürlük seni harekete geçirir.', 'Adventurous, optimistic drive; travel, sport and freedom move you.'),
  S('Mars burada yücelimde: disiplinli, hırslı ve stratejik. Uzun vadeli hedeflerde ustasın.', 'Mars exalted: disciplined, ambitious and strategic. A master of long-term goals.'),
  S('Özgün ve isyankâr bir enerji; davalar, topluluklar ve yenilik için savaşırsın.', 'Original, rebellious drive; you fight for causes, communities and innovation.'),
  S('Sezgisel ve akışkan bir enerji; ilhamla hareket edersin. Sanat ve şifa işlerinde güçlüsün.', 'Intuitive, fluid drive; you act on inspiration. Strong in art and healing work.'),
];

export const JUPITER: L[] = [
  S('Şansın cesaret edip ilk adımı attığında gelir.', 'Luck comes when you dare to go first.'),
  S('Bolluk sabır, istikrar ve somut değerlerle büyür.', 'Abundance grows through patience and tangible value.'),
  S('Şansın iletişim, ağ kurma ve öğrenmede.', 'Your luck lies in communication, networking and learning.'),
  S('Jüpiter yücelimde: aile, yuva ve şefkat bereketin kaynağı.', 'Jupiter exalted: family, home and compassion are your blessing.'),
  S('Yaratıcılık, sahne ve cömertlik kapıları açar.', 'Creativity, the spotlight and generosity open doors.'),
  S('Şansın emek, detay ve hizmetle gelir.', 'Your luck comes through hard work, detail and service.'),
  S('İlişkiler ve ortaklıklar seni büyütür.', 'Relationships and partnerships help you grow.'),
  S('Krizlerden güçlenerek çıkar, derin kaynaklara erişirsin.', 'You grow through crises and access deep resources.'),
  S('Jüpiter kendi evinde: seyahat, eğitim ve inanç şansını katlar.', 'Jupiter at home: travel, education and faith multiply your luck.'),
  S('Jüpiter düşüşte: büyüme planlı ve yavaş ama kalıcıdır.', 'Jupiter in fall: growth is slow and planned but lasting.'),
  S('Topluluklar, teknoloji ve ideallerle büyürsün.', 'You grow through communities, technology and ideals.'),
  S('Jüpiter kendi evinde: sezgin ve şefkatin koruyucu meleğin.', 'Jupiter at home: your intuition and compassion are your guardian angel.'),
];

export const SATURN: L[] = [
  S('Satürn düşüşte: sabır ve öz kontrol en büyük dersin.', 'Saturn in fall: patience and self-control are your lessons.'),
  S('Maddi güvence ve öz değer konusunda zamanla ustalaşırsın.', 'You master material security and self-worth over time.'),
  S('Düşüncelerini disipline etmek ve sesini ciddiye almak dersin.', 'Disciplining your thoughts and trusting your voice is your lesson.'),
  S('Satürn zararda: duygusal güvenliği kendi içinde inşa etmeyi öğrenirsin.', 'Saturn in detriment: you learn to build emotional security within.'),
  S('Satürn zararda: kendini ifade etme özgüvenini zamanla kazanırsın.', 'Saturn in detriment: confidence in self-expression comes with time.'),
  S('Mükemmeliyetçilik ve iş disiplini temel sınavın.', 'Perfectionism and work discipline are your core tests.'),
  S('Satürn yücelimde: adil, olgun ve sorumlu ilişkiler kurarsın.', 'Saturn exalted: you build fair, mature, committed relationships.'),
  S('Güven, kontrol ve paylaşım konularında derin dersler.', 'Deep lessons around trust, control and sharing.'),
  S('İnançlarını sınayarak kendi felsefeni inşa edersin.', 'You build your own philosophy by testing beliefs.'),
  S('Satürn kendi evinde: doğuştan stratejist ve yapı kurucu.', 'Saturn at home: a born strategist and builder.'),
  S('Satürn kendi evinde (geleneksel): topluluk içinde lider olmayı öğrenirsin.', 'Saturn at home (traditional): you learn to lead within groups.'),
  S('Hayallerine sınır ve yapı vermek dersin.', 'Giving structure to your dreams is your lesson.'),
];

export const JUNO_SIGN: L[] = [
  S('Juno Koç: Eşinde cesaret, bağımsızlık ve heyecan ararsın; eşit ve dinamik bir evlilik.', 'Juno in Aries: you seek courage, independence and excitement in a spouse; an equal, dynamic marriage.'),
  S('Juno Boğa: Sadakat, güven ve maddi istikrar bağlılığının temeli.', 'Juno in Taurus: loyalty, security and stability are the foundation of commitment.'),
  S('Juno İkizler: Zihinsel uyum ve sürekli iletişim; en iyi arkadaşın olan bir eş.', 'Juno in Gemini: mental rapport and constant conversation; a best-friend spouse.'),
  S('Juno Yengeç: Duygusal güven, aile ve yuva; şefkatli ve korumacı bir eş.', 'Juno in Cancer: emotional safety, family and home; a caring, protective spouse.'),
  S('Juno Aslan: Hayranlık, sadakat ve romantizm; seni gururlandıran bir eş.', 'Juno in Leo: admiration, loyalty and romance; a spouse who makes you proud.'),
  S('Juno Başak: Günlük hayatı paylaşan, güvenilir ve yardımsever bir eş.', 'Juno in Virgo: a reliable, helpful spouse who shares daily life.'),
  S('Juno Terazi: Eşitlik, uyum ve estetik; klasik anlamda “ideal evlilik” arayışı.', 'Juno in Libra: equality, harmony and beauty; the classic “ideal marriage”.'),
  S('Juno Akrep: Derin, tutkulu ve tam bağlılık; güven her şeydir.', 'Juno in Scorpio: deep, passionate, total commitment; trust is everything.'),
  S('Juno Yay: Özgürlük tanıyan, birlikte büyüyen ve keşfeden bir eş.', 'Juno in Sagittarius: a spouse who gives freedom and grows and explores with you.'),
  S('Juno Oğlak: Ciddi, sorumluluk sahibi ve uzun vadeli hedefleri olan bir eş.', 'Juno in Capricorn: a serious, responsible spouse with long-term goals.'),
  S('Juno Kova: Alan tanıyan, arkadaş gibi ve sıra dışı bir evlilik.', 'Juno in Aquarius: a spacious, friend-like, unconventional marriage.'),
  S('Juno Balık: Ruhsal bağ, şefkat ve romantizm; ruh eşi beklentisi.', 'Juno in Pisces: spiritual bond, compassion and romance; a soulmate expectation.'),
];

const HANDWRITTEN: Partial<Record<BodyId, L[]>> = { sun: SUN, moon: MOON, mercury: MERCURY, venus: VENUS, mars: MARS, jupiter: JUPITER, saturn: SATURN, juno: JUNO_SIGN };

/** Bir gezegenin burç yerleşimi için yorum */
export function placementText(id: BodyId, sign: number): L {
  const hw = HANDWRITTEN[id];
  if (hw) return hw[sign];
  const s = SIGNS[sign], adv = SIGN_ADVERB[sign], fn = BODY_FUNCTION[id];
  if (id === 'uranus' || id === 'neptune' || id === 'pluto') {
    return {
      tr: `Kuşak yerleşimi: ${s.tr} burcundaki bu gezegen, akranlarınla paylaştığın ortak bir temayı anlatır — ${fn.tr} ${adv.tr} bir şekilde ifade bulur. Kişisel etkisi için bulunduğu eve bak.`,
      en: `Generational placement: in ${s.en}, this planet describes a theme shared with your peers — ${fn.en} expressed ${adv.en}. Look at its house for the personal effect.`,
    };
  }
  if (id === 'node') return {
    tr: `Kuzey Düğüm ${s.tr}: Bu hayatta ${s.tr} niteliklerini — ${SIGN_ADVERB[sign].tr} olmayı — geliştirmeye çağrılıyorsun. Bu yönde attığın adımlar ilk başta yabancı gelse de en çok tatmini getirir.`,
    en: `North Node in ${s.en}: You’re called to develop ${s.en} qualities — acting ${SIGN_ADVERB[sign].en}. Steps in this direction feel unfamiliar at first but bring the deepest fulfilment.`,
  };
  if (id === 'southNode') return {
    tr: `Güney Düğüm ${s.tr}: ${s.tr} nitelikleri sana doğuştan tanıdık ve kolay. Bu yetenekleri kullan ama sığınak hâline getirme.`,
    en: `South Node in ${s.en}: ${s.en} traits come naturally. Use these gifts, but don’t hide in them.`,
  };
  if (id === 'lilith') return {
    tr: `Lilith ${s.tr}: ${s.tr} enerjisi senin “yasaklı” ya da bastırılmış gücün. ${SIGN_ADVERB[sign].tr.charAt(0).toLocaleUpperCase('tr') + SIGN_ADVERB[sign].tr.slice(1)} olma isteğin yargılanmış olabilir; bunu sahiplendiğinde karizman artar.`,
    en: `Lilith in ${s.en}: ${s.en} energy is your “forbidden” or suppressed power. Your urge to act ${SIGN_ADVERB[sign].en} may have been judged; owning it amplifies your magnetism.`,
  };
  if (id === 'fortune') return {
    tr: `Şans Noktası ${s.tr}: ${s.tr} temalarıyla (${SIGN_ADVERB[sign].tr}) hareket ettiğinde bolluk ve keyif kendiliğinden gelir.`,
    en: `Part of Fortune in ${s.en}: abundance and joy flow when you act ${SIGN_ADVERB[sign].en}.`,
  };
  return {
    tr: `${BODIES[id].name.tr} ${s.tr} burcunda: ${fn.tr} ${adv.tr} bir şekilde ifade bulur.`,
    en: `${BODIES[id].name.en} in ${s.en}: ${fn.en} find expression ${adv.en}.`,
  };
}
