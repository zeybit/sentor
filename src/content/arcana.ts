// 22 Büyük Arkana — Kader Matrisi yorumları (özgün metin).
import type { L } from './base';
const l = (tr: string, en: string): L => ({ tr, en });

export interface Arcana { name: L; key: L; plus: L; minus: L; love: L; money: L; karma: L }

export const ARCANA: Record<number, Arcana> = {
  1: { name: l('Büyücü', 'The Magician'), key: l('irade, başlangıç, söz gücü', 'will, beginnings, the power of words'),
    plus: l('Fikirleri hızla hayata geçirir, insanları sözleriyle etkilersin; yeni bir işe başlamak sana enerji verir.', 'You turn ideas into reality fast and move people with your words; starting something new energises you.'),
    minus: l('Enerjin dağıldığında yarım kalan işler, manipülasyon ya da kendini kanıtlama telaşı görülebilir.', 'When your energy scatters you may leave things unfinished, manipulate, or rush to prove yourself.'),
    love: l('İlişkide zihinsel kıvılcım ve sohbet ararsın; sıkıldığında hızla uzaklaşabilirsin.', 'In love you look for mental spark and conversation; boredom can make you drift away quickly.'),
    money: l('Para; iletişim, satış, eğitim ve kendi işini kurmakla gelir.', 'Money comes through communication, sales, teaching and starting your own venture.'),
    karma: l('Geçmişten gelen ders: bilgini ve sözünü başkalarını yönlendirmek için değil, yaratmak için kullanmak.', 'The lesson carried from the past: use your knowledge and words to create, not to steer others.') },
  2: { name: l('Başrahibe', 'The High Priestess'), key: l('sezgi, sır, sessiz bilgelik', 'intuition, secrets, quiet wisdom'),
    plus: l('Güçlü bir iç sesin var; insanları ve durumları söylenmeden anlarsın.', 'You have a strong inner voice and understand people and situations without being told.'),
    minus: l('Kendini kapattığında içe kapanma, şüphecilik ya da pasif kalma eğilimi artar.', 'When you close off you may withdraw, grow suspicious or stay passive.'),
    love: l('Derin, sessiz ve sadık bir bağ istersin; güven oluşmadan açılmazsın.', 'You want a deep, quiet, loyal bond and only open up once trust exists.'),
    money: l('Danışmanlık, psikoloji, araştırma ve sezgi gerektiren işler kazanç getirir.', 'Counselling, psychology, research and intuitive work bring income.'),
    karma: l('Ders: sezgine güvenmek ve bildiklerini korkmadan paylaşmak.', 'The lesson: trust your intuition and share what you know without fear.') },
  3: { name: l('İmparatoriçe', 'The Empress'), key: l('bereket, kadınsılık, yaratıcılık', 'abundance, femininity, creativity'),
    plus: l('Güzelliği, konforu ve bereketi çevrene yayarsın; dokunduğun şey büyür.', 'You spread beauty, comfort and abundance; what you touch grows.'),
    minus: l('Dengesizlikte aşırı tüketim, kıskançlık ya da kendini ihmal etme görülebilir.', 'Out of balance it can show as overindulgence, jealousy or self-neglect.'),
    love: l('Sevgiyi bakım ve şefkatle gösterirsin; değer gördüğünü hissetmek senin için şart.', 'You show love through care and tenderness; feeling valued is essential.'),
    money: l('Güzellik, moda, tasarım, gıda ve kadınlara yönelik alanlar bereket getirir.', 'Beauty, fashion, design, food and women-focused fields bring abundance.'),
    karma: l('Ders: kendi değerini bilmek ve bereketi hak ettiğine inanmak.', 'The lesson: know your worth and believe you deserve abundance.') },
  4: { name: l('İmparator', 'The Emperor'), key: l('düzen, liderlik, sorumluluk', 'order, leadership, responsibility'),
    plus: l('Yapı kurar, yönetir ve korursun; insanlar sana güvenip yaslanır.', 'You build structures, lead and protect; people lean on you.'),
    minus: l('Gölgede kontrolcülük, katılık ve her şeyi tek başına taşıma yükü belirir.', 'Its shadow is control, rigidity and the weight of carrying everything alone.'),
    love: l('Koruyucu ve sadık bir partnersin; ilişkide söz sahibi olmak istersin.', 'You are a protective, loyal partner and like to have a say in the relationship.'),
    money: l('Yöneticilik, kendi şirketin, devlet ve büyük yapılar içinde yükselmek kazanç getirir.', 'Management, your own company, government and rising in large organisations bring income.'),
    karma: l('Ders: gücü kontrol için değil, korumak ve kurmak için kullanmak.', 'The lesson: use power to protect and build, not to control.') },
  5: { name: l('Başrahip', 'The Hierophant'), key: l('öğretmenlik, gelenek, değerler', 'teaching, tradition, values'),
    plus: l('Bildiklerini aktarmayı seversin; doğal bir öğretmen ve rehbersin.', 'You love passing on what you know; you are a natural teacher and guide.'),
    minus: l('Dengesizlikte dogmatiklik, ukalalık ya da kurallara körü körüne bağlılık görülür.', 'Out of balance it shows as dogmatism, know-it-all behaviour or blind rule-following.'),
    love: l('Ciddi, resmî ve değerleri ortak bir birliktelik ararsın.', 'You seek a serious, formal union with shared values.'),
    money: l('Eğitim, danışmanlık, hukuk ve uzmanlık gerektiren alanlar kazanç getirir.', 'Education, consulting, law and expert fields bring income.'),
    karma: l('Ders: bilgiyi dayatmadan paylaşmak ve kendi doğrunu bulmak.', 'The lesson: share knowledge without imposing it and find your own truth.') },
  6: { name: l('Âşıklar', 'The Lovers'), key: l('sevgi, seçim, uyum', 'love, choice, harmony'),
    plus: l('İnsanlara kalbini açar, ilişkilerde uyum ve güzellik yaratırsın.', 'You open your heart to people and create harmony and beauty in relationships.'),
    minus: l('Gölgede kararsızlık, onaya bağımlılık ya da ilişki uğruna kendini kaybetme olabilir.', 'Its shadow is indecision, dependence on approval, or losing yourself in a relationship.'),
    love: l('Aşk hayatının merkezidir; romantik ve karşılıklı bir bağ seni besler.', 'Love is central to your life; a romantic, mutual bond nourishes you.'),
    money: l('Estetik, iletişim, insan ilişkileri ve ortaklıklar kazanç getirir.', 'Aesthetics, communication, people work and partnerships bring income.'),
    karma: l('Ders: kalbinle seçim yapmak ve seçimlerinin sorumluluğunu almak.', 'The lesson: choose with your heart and own your choices.') },
  7: { name: l('Savaş Arabası', 'The Chariot'), key: l('hareket, hedef, zafer', 'movement, goals, victory'),
    plus: l('Hedefe kilitlenir, engellere rağmen ilerlersin; yolculuk ve hız sana iyi gelir.', 'You lock onto goals and push through obstacles; travel and speed suit you.'),
    minus: l('Dengesizlikte acelecilik, öfke ya da durmayı bilmeme yorgunluk yaratır.', 'Out of balance, haste, anger or not knowing when to stop wear you out.'),
    love: l('Hareketli, birlikte yol alınan bir ilişki istersin; durağanlık seni boğar.', 'You want a dynamic relationship that moves forward together; stagnation stifles you.'),
    money: l('Seyahat, ulaşım, spor, satış ve proje yönetimi kazanç getirir.', 'Travel, transport, sport, sales and project management bring income.'),
    karma: l('Ders: gücünü doğru hedefe yönlendirmek ve dinlenmeyi de bilmek.', 'The lesson: aim your power at the right target and learn to rest.') },
  8: { name: l('Adalet', 'Justice'), key: l('denge, adalet, sorumluluk', 'balance, fairness, accountability'),
    plus: l('Adil, net ve dengelisin; sebep–sonuç ilişkisini iyi görürsün.', 'You are fair, clear and balanced and see cause and effect well.'),
    minus: l('Gölgede yargılayıcılık, katı kurallar ya da kendini sürekli suçlama belirir.', 'Its shadow is judgement, rigid rules or constant self-blame.'),
    love: l('Eşit, dürüst ve karşılıklı emek verilen bir ilişki istersin.', 'You want an equal, honest relationship where effort is mutual.'),
    money: l('Hukuk, finans, denetim, düzen kurma işleri kazanç getirir.', 'Law, finance, auditing and organising work bring income.'),
    karma: l('Ders: başkalarını ve kendini yargılamadan sorumluluk almak.', 'The lesson: take responsibility without judging yourself or others.') },
  9: { name: l('Ermiş', 'The Hermit'), key: l('bilgelik, yalnızlık, derinlik', 'wisdom, solitude, depth'),
    plus: l('Derin düşünür, özü kavrarsın; yalnız kaldığında en iyi fikirlerin gelir.', 'You think deeply and grasp the essence; your best ideas come in solitude.'),
    minus: l('Dengesizlikte insanlardan kopma, aşırı mesafe ya da karamsarlık görülür.', 'Out of balance it shows as cutting off from people, too much distance or pessimism.'),
    love: l('Az ama derin ilişkiler kurarsın; kendi alanına saygı duyulmasını istersin.', 'You form few but deep bonds and want your space respected.'),
    money: l('Araştırma, yazarlık, uzmanlık ve bireysel çalışma kazanç getirir.', 'Research, writing, specialist and independent work bring income.'),
    karma: l('Ders: bilgeliğini saklamadan paylaşmak ve insanlara güvenmek.', 'The lesson: share your wisdom instead of hiding it and trust people.') },
  10: { name: l('Kader Çarkı', 'Wheel of Fortune'), key: l('akış, şans, döngüler', 'flow, luck, cycles'),
    plus: l('Akışa güvendiğinde şans kapıları açılır; değişime hızlı uyum sağlarsın.', 'When you trust the flow, lucky doors open; you adapt to change quickly.'),
    minus: l('Gölgede tembellik, her şeyi şansa bırakma ya da kontrolsüz değişim yorar.', 'Its shadow is passivity, leaving everything to chance or uncontrolled change.'),
    love: l('Kader gibi hissedilen karşılaşmalar yaşarsın; ilişkide akış ve kolaylık ararsın.', 'You have fated-feeling meetings and seek ease and flow in love.'),
    money: l('Ticaret, seyahat, fırsatları değerlendirmek ve şans gerektiren alanlar kazanç getirir.', 'Trade, travel, seizing opportunities and luck-based fields bring income.'),
    karma: l('Ders: hayatın döngülerine direnmek yerine onlarla birlikte hareket etmek.', 'The lesson: move with life’s cycles instead of resisting them.') },
  11: { name: l('Güç', 'Strength'), key: l('güç, dayanıklılık, tutku', 'strength, endurance, passion'),
    plus: l('Büyük bir fiziksel ve içsel enerjin var; zorlukları dayanıklılıkla aşarsın.', 'You have great physical and inner energy and overcome hardship through endurance.'),
    minus: l('Dengesizlikte öfke, aşırı çalışma ya da gücü bastırmak tükenmişlik yaratır.', 'Out of balance anger, overwork or suppressing your power leads to burnout.'),
    love: l('Tutkulu ve güçlü bir partner istersin; zayıflık sana itici gelebilir.', 'You want a passionate, strong partner; weakness may put you off.'),
    money: l('Spor, fiziksel emek, girişimcilik ve büyük projeler kazanç getirir.', 'Sport, physical work, entrepreneurship and big projects bring income.'),
    karma: l('Ders: gücünü sakinlik ve şefkatle yönetmek.', 'The lesson: guide your strength with calm and compassion.') },
  12: { name: l('Asılan Adam', 'The Hanged Man'), key: l('hizmet, farklı bakış, teslimiyet', 'service, a different view, surrender'),
    plus: l('Dünyaya başkalarının görmediği açıdan bakar, yaratıcı ve şefkatli çözümler bulursun.', 'You see the world from angles others miss and find creative, compassionate solutions.'),
    minus: l('Gölgede kurban rolü, fedakârlığın sömürülmesi ya da hareketsiz kalma belirir.', 'Its shadow is the victim role, exploited self-sacrifice or getting stuck.'),
    love: l('Çok verirsin; karşılıklılık olmadığında ilişki seni tüketebilir.', 'You give a lot; without reciprocity the relationship can drain you.'),
    money: l('Sanat, şifa, sosyal hizmet ve yaratıcı alanlar kazanç getirir.', 'Art, healing, social work and creative fields bring income.'),
    karma: l('Ders: fedakârlık ile kendini feda etme arasındaki sınırı çizmek.', 'The lesson: draw the line between generosity and self-sacrifice.') },
  13: { name: l('Dönüşüm', 'Death (Transformation)'), key: l('bitiş, yenilenme, dönüşüm', 'endings, renewal, transformation'),
    plus: l('Eskiyi bırakıp yeniden başlama cesaretin var; krizler seni güçlendirir.', 'You have the courage to let go and start again; crises make you stronger.'),
    minus: l('Dengesizlikte değişimden korkma, geçmişe tutunma ya da ani kopuşlar görülür.', 'Out of balance it shows as fear of change, clinging to the past or abrupt breaks.'),
    love: l('Yoğun ve dönüştürücü ilişkiler yaşarsın; yüzeysellik seni tatmin etmez.', 'You live intense, transforming relationships; superficiality never satisfies you.'),
    money: l('Kriz yönetimi, yenileme, psikoloji ve dönüşüm işleri kazanç getirir.', 'Crisis management, renovation, psychology and transformation work bring income.'),
    karma: l('Ders: bitişleri kabul etmek ve değişimden korkmamak.', 'The lesson: accept endings and stop fearing change.') },
  14: { name: l('Denge', 'Temperance'), key: l('ölçü, uyum, sabır', 'moderation, harmony, patience'),
    plus: l('Uç noktaları dengeler, ortamlara huzur getirirsin; sabırla iyileştirirsin.', 'You balance extremes and bring peace; you heal with patience.'),
    minus: l('Gölgede aşırılıklar, kararsızlık ya da duyguları bastırma belirebilir.', 'Its shadow can be excess, indecision or suppressed feelings.'),
    love: l('Sakin, dengeli ve uzun soluklu bir ilişki seni mutlu eder.', 'A calm, balanced, long-lasting relationship makes you happy.'),
    money: l('Sanat, şifa, arabuluculuk ve sabır isteyen işler kazanç getirir.', 'Art, healing, mediation and patient work bring income.'),
    karma: l('Ders: ölçüyü bulmak ve hayatın ritmine güvenmek.', 'The lesson: find moderation and trust life’s rhythm.') },
  15: { name: l('Şeytan', 'The Devil'), key: l('çekim, tutku, maddi güç', 'magnetism, desire, material power'),
    plus: l('Güçlü bir karizman ve maddi dünyayı yönetme yeteneğin var.', 'You have strong charisma and a talent for handling the material world.'),
    minus: l('Dengesizlikte bağımlılıklar, manipülasyon ya da hırs tuzağı görülür.', 'Out of balance it shows as dependencies, manipulation or the trap of ambition.'),
    love: l('Yoğun çekim ve tutku yaşarsın; kıskançlık ve kontrol konusunda dikkat gerekir.', 'You experience intense attraction and passion; jealousy and control need care.'),
    money: l('Büyük para, ticaret, finans, satış ve etki gücü gerektiren alanlar kazanç getirir.', 'Big money, trade, finance, sales and influence-based fields bring income.'),
    karma: l('Ders: arzularını yönetmek ve gücü dürüstçe kullanmak.', 'The lesson: master your desires and use power honestly.') },
  16: { name: l('Kule', 'The Tower'), key: l('yıkım ve yeniden kurma, uyanış', 'breakdown and rebuilding, awakening'),
    plus: l('Sarsıntılardan sonra daha sağlam yapılar kurarsın; sahte olanı hemen fark edersin.', 'After upheaval you build stronger structures; you spot what is false at once.'),
    minus: l('Gölgede gurur, ani patlamalar ya da kendi kurduğunu yıkma eğilimi belirir.', 'Its shadow is pride, sudden outbursts or tearing down what you built.'),
    love: l('İlişkiler hayatını kökten değiştirir; ego yerine samimiyetle yaklaşmak önemli.', 'Relationships change your life radically; meeting them with sincerity rather than ego matters.'),
    money: l('İnşaat, mühendislik, yeniden yapılandırma ve büyük projeler kazanç getirir.', 'Construction, engineering, restructuring and large projects bring income.'),
    karma: l('Ders: gururu bırakmak ve değişimi bir yıkım değil yenilenme olarak görmek.', 'The lesson: let go of pride and see change as renewal, not ruin.') },
  17: { name: l('Yıldız', 'The Star'), key: l('ilham, umut, yetenek', 'inspiration, hope, talent'),
    plus: l('İnsanlara ilham verirsin; yaratıcı yeteneklerinle görünür olmaya doğdun.', 'You inspire people; you were born to be seen through your creative gifts.'),
    minus: l('Dengesizlikte kendini küçümseme, gösteriş ya da hayallerde kalma görülür.', 'Out of balance it shows as self-doubt, showing off or living in dreams.'),
    love: l('Hayranlık duyduğun ve seni parlatacak bir partner istersin.', 'You want a partner you admire and who lets you shine.'),
    money: l('Sanat, sahne, sosyal medya ve görünürlük isteyen işler kazanç getirir.', 'Art, stage, social media and visible work bring income.'),
    karma: l('Ders: yeteneğini saklamadan ortaya koymak.', 'The lesson: show your talent instead of hiding it.') },
  18: { name: l('Ay', 'The Moon'), key: l('hayal gücü, sezgi, bilinçaltı', 'imagination, intuition, the subconscious'),
    plus: l('Zengin bir hayal gücün ve güçlü sezgilerin var; görünmeyeni hissedersin.', 'You have a rich imagination and strong intuition; you sense the unseen.'),
    minus: l('Gölgede kaygı, kuruntu, belirsizlik ya da kendini kandırma belirebilir.', 'Its shadow can be anxiety, worry, vagueness or self-deception.'),
    love: l('Romantik ve duygusal bir bağ istersin; belirsizlik seni huzursuz eder.', 'You want a romantic, emotional bond; uncertainty unsettles you.'),
    money: l('Sanat, psikoloji, estetik, fotoğraf ve sezgi gerektiren işler kazanç getirir.', 'Art, psychology, aesthetics, photography and intuitive work bring income.'),
    karma: l('Ders: korkularla yüzleşmek ve sezgiyi kaygıdan ayırmak.', 'The lesson: face your fears and tell intuition apart from anxiety.') },
  19: { name: l('Güneş', 'The Sun'), key: l('neşe, başarı, sıcaklık', 'joy, success, warmth'),
    plus: l('Sıcaklığın ve iyimserliğinle insanları ısıtırsın; başarı sana yakışır.', 'Your warmth and optimism lift people; success suits you.'),
    minus: l('Dengesizlikte kibir, dikkat çekme ihtiyacı ya da tükenene kadar parlamak görülür.', 'Out of balance it shows as arrogance, craving attention or shining until burnout.'),
    love: l('Neşeli, açık ve birbirini gururla sahiplenen bir ilişki seni mutlu eder.', 'A joyful, open relationship where you proudly claim each other makes you happy.'),
    money: l('Liderlik, çocuklarla çalışmak, eğlence ve görünür işler kazanç getirir.', 'Leadership, working with children, entertainment and visible work bring income.'),
    karma: l('Ders: ışığını paylaşmak ama başkalarının ışığını gölgelememek.', 'The lesson: share your light without dimming others.') },
  20: { name: l('Mahkeme', 'Judgement'), key: l('aile, köken, uyanış', 'family, roots, awakening'),
    plus: l('Aile bağların güçlü; köklerinden güç alır, başkalarını bir araya getirirsin.', 'Your family ties are strong; you draw strength from your roots and bring people together.'),
    minus: l('Gölgede aile yükleri, eleştiri ya da geçmişle hesaplaşamama belirebilir.', 'Its shadow can be family burdens, criticism or unresolved past.'),
    love: l('Aile kurmak ve kalıcı bir bağ ilişkinin temel amacıdır.', 'Building a family and a lasting bond is the core aim of love for you.'),
    money: l('Aile işi, eğitim, tarih, danışmanlık ve topluluk işleri kazanç getirir.', 'Family business, education, history, counselling and community work bring income.'),
    karma: l('Ders: aileyle barışmak ve köklerin armağanlarını kabul etmek.', 'The lesson: make peace with family and accept the gifts of your roots.') },
  21: { name: l('Dünya', 'The World'), key: l('bütünlük, genişlik, dünya', 'wholeness, breadth, the world'),
    plus: l('Geniş bakarsın; farklı kültürler, diller ve büyük ölçekli işler sana uygun.', 'You see widely; other cultures, languages and large-scale work suit you.'),
    minus: l('Dengesizlikte sınırlanmışlık hissi, kaçış ya da hiçbir yere ait olamama görülür.', 'Out of balance it shows as feeling confined, escapism or not belonging anywhere.'),
    love: l('Özgürlüğüne saygı duyan, birlikte dünyayı keşfedeceğin bir partner ararsın.', 'You seek a partner who respects your freedom and explores the world with you.'),
    money: l('Uluslararası işler, turizm, diplomasi ve büyük kurumlar kazanç getirir.', 'International work, tourism, diplomacy and large organisations bring income.'),
    karma: l('Ders: dünyayı ve kendini sınırlamadan, bütünlük içinde yaşamak.', 'The lesson: live with wholeness, limiting neither the world nor yourself.') },
  22: { name: l('Deli', 'The Fool'), key: l('özgürlük, saflık, macera', 'freedom, innocence, adventure'),
    plus: l('Hafif, yaratıcı ve özgür bir ruhun var; yeni deneyimlere korkusuzca atılırsın.', 'You have a light, creative, free spirit and leap into new experiences fearlessly.'),
    minus: l('Gölgede sorumsuzluk, istikrarsızlık ya da bağlanmaktan kaçış belirebilir.', 'Its shadow can be irresponsibility, instability or avoiding commitment.'),
    love: l('Oyunbaz ve özgür bir ilişki istersin; kısıtlanmak sana iyi gelmez.', 'You want a playful, free relationship; restriction doesn’t suit you.'),
    money: l('Yaratıcı işler, serbest çalışma, seyahat ve çocuklarla ilgili alanlar kazanç getirir.', 'Creative work, freelancing, travel and child-related fields bring income.'),
    karma: l('Ders: özgürlüğü sorumlulukla dengelemek.', 'The lesson: balance freedom with responsibility.') },
};

// ---------------- Konumlar ----------------
export type MxPos = 'A' | 'B' | 'C' | 'D' | 'E' | 'talent' | 'tail' | 'love' | 'money' | 'X' | 'sky' | 'earth' | 'personal' | 'male' | 'female' | 'social' | 'spiritual' | 'planetary' | 'ancestry';
export const POS: Record<MxPos, { title: L; what: L }> = {
  A: { title: l('Kişilik ve ilk izlenim', 'Personality and first impression'), what: l('Doğduğun günün enerjisi; insanların seni ilk gördüğünde fark ettiği karakterin.', 'The energy of your birth day: the character people notice first.') },
  B: { title: l('Yetenekler ve ilham kaynağı', 'Talents and inspiration'), what: l('Doğduğun ayın enerjisi; doğuştan gelen yetenek ve seni ruhen besleyen alan.', 'The energy of your birth month: innate gifts and what feeds your spirit.') },
  C: { title: l('Maddi dünya ve kazanç', 'Material world and income'), what: l('Doğum yılının enerjisi; parayla ve dünyayla ilişkin, kazanmanın yolu.', 'The energy of your birth year: your relationship with money and the world.') },
  D: { title: l('Karmik görev', 'Karmic task'), what: l('Alt köşe; bu hayatta tamamlanması beklenen ders ve gölgede kalan taraf.', 'The bottom corner: the lesson to complete in this life and your shadow side.') },
  E: { title: l('Konfor alanı (merkez)', 'Comfort zone (centre)'), what: l('Matrisin kalbi; kendini en rahat hissettiğin, enerjini topladığın hâl.', 'The heart of the matrix: where you feel most at ease and recharge.') },
  talent: { title: l('Yetenek kanalı', 'Talent channel'), what: l('Üst kol boyunca dizilen yetenekler; doğuştan getirdiğin armağanlar.', 'The gifts along the upper arm, the talents you were born with.') },
  tail: { title: l('Karmik kuyruk', 'Karmic tail'), what: l('Geçmişten getirildiği kabul edilen tekrar eden tema; çözüldüğünde güce dönüşür.', 'The recurring theme said to come from the past; once resolved, it becomes strength.') },
  love: { title: l('Aşk ve ilişkiler', 'Love and relationships'), what: l('Partnerinde aradığın enerji ve ilişkilerde tekrar eden tema.', 'The energy you seek in a partner and the recurring theme in relationships.') },
  money: { title: l('Para kanalı', 'Money channel'), what: l('Paranın sana en kolay aktığı faaliyet ve iş alanı.', 'The activities and work through which money flows to you most easily.') },
  X: { title: l('Kalbin arzusu', 'Heart’s desire'), what: l('Aşk ve para kanallarının kesiştiği nokta; içten içe en çok istediğin şey.', 'Where love and money meet: what you want most deep down.') },
  sky: { title: l('Gök çizgisi', 'Sky line'), what: l('Ruhsal yön ve kişisel değerler.', 'Spiritual direction and personal values.') },
  earth: { title: l('Yer çizgisi', 'Earth line'), what: l('Maddi beceriler ve somut dünya.', 'Material skills and the concrete world.') },
  personal: { title: l('Kişisel amaç (20–40 yaş)', 'Personal purpose (age 20–40)'), what: l('Kendini bulma, yeteneklerini somut hayata dökme dönemi.', 'The period of finding yourself and bringing talents into real life.') },
  male: { title: l('Baba soyu çizgisi', 'Paternal line'), what: l('Erkek soyundan gelen görevler ve güçler.', 'Tasks and strengths inherited from the paternal line.') },
  female: { title: l('Anne soyu çizgisi', 'Maternal line'), what: l('Kadın soyundan gelen görevler ve güçler.', 'Tasks and strengths inherited from the maternal line.') },
  social: { title: l('Toplumsal amaç (40–60 yaş)', 'Social purpose (age 40–60)'), what: l('Toplumda iz bırakma, aile ve çevre için üretme dönemi.', 'The period of leaving a mark in society and creating for family and community.') },
  spiritual: { title: l('Ruhsal amaç (60 yaş ve sonrası)', 'Spiritual purpose (age 60+)'), what: l('Hayatın bütününe anlam veren, yaşla derinleşen görev.', 'The task that gives meaning to life as a whole and deepens with age.') },
  planetary: { title: l('Gezegensel amaç', 'Planetary purpose'), what: l('Dünyaya bırakacağın en geniş ölçekli katkı.', 'Your widest contribution to the world.') },
  ancestry: { title: l('Soy gücü', 'Ancestral strength'), what: l('Soyundan gelen kaynak ve yükler.', 'Resources and burdens from your lineage.') },
};

export function mxText(pos: MxPos, n: number): L {
  const a = ARCANA[n]; const p = POS[pos];
  if (!a) return l('', '');
  const body = (x: L) => ({ tr: `${p.what.tr} Burada ${n}. arkana ${a.name.tr} var: ${a.key.tr}. ${x.tr}`, en: `${p.what.en} Here is arcana ${n}, ${a.name.en}: ${a.key.en}. ${x.en}` });
  const both = l(`${a.plus.tr} ${a.minus.tr}`, `${a.plus.en} ${a.minus.en}`);
  switch (pos) {
    case 'love': return body(l(`${a.love.tr} ${a.minus.tr}`, `${a.love.en} ${a.minus.en}`));
    case 'money': return body(l(`${a.money.tr} ${a.minus.tr}`, `${a.money.en} ${a.minus.en}`));
    case 'tail': case 'D': return body(l(`${a.karma.tr} ${a.minus.tr}`, `${a.karma.en} ${a.minus.en}`));
    default: return body(both);
  }
}

export const CHAKRA: Record<string, { name: L; area: L }> = {
  sahasrara: { name: l('Sahasrara (taç)', 'Sahasrara (crown)'), area: l('anlam, inanç, bağlantı hissi', 'meaning, faith, sense of connection') },
  ajna: { name: l('Ajna (üçüncü göz)', 'Ajna (third eye)'), area: l('sezgi, hayal gücü, dünyayı algılama', 'intuition, imagination, perception') },
  vishuddha: { name: l('Vishuddha (boğaz)', 'Vishuddha (throat)'), area: l('kendini ifade, iletişim, yaratıcılık', 'self-expression, communication, creativity') },
  anahata: { name: l('Anahata (kalp)', 'Anahata (heart)'), area: l('sevgi, kabul, ilişkiler', 'love, acceptance, relationships') },
  manipura: { name: l('Manipura (güneş sinir ağı)', 'Manipura (solar plexus)'), area: l('irade, özgüven, kişisel güç', 'will, confidence, personal power') },
  svadhisthana: { name: l('Svadhisthana (sakral)', 'Svadhisthana (sacral)'), area: l('keyif, duygular, yaratıcı enerji', 'pleasure, emotions, creative energy') },
  muladhara: { name: l('Muladhara (kök)', 'Muladhara (root)'), area: l('güven, beden, maddi zemin', 'safety, body, material ground') },
};

// ---------------- Yeni başlayanlar için: öneri ve sade açıklamalar ----------------
export const ADVICE: Record<number, L> = {
  1: l('Bir fikri başlatıp yarım bırakmak yerine küçük ama bitmiş işler üretmek bu enerjiyi en iyi kullanmanın yolu.', 'Finishing small things instead of starting many is the best way to use this energy.'),
  2: l('Sessiz kalıp gözlemlemek senin gücün; yine de hissettiklerini güvendiğin birine söylemeyi ihmal etme.', 'Quiet observation is your strength; still, share what you sense with someone you trust.'),
  3: l('Kendine güzellik ve konfor sunmak bencillik değil; dolu bir kap olduğunda çevrene de bereket taşırsın.', 'Treating yourself to beauty and comfort isn’t selfish; when your cup is full, you overflow to others.'),
  4: l('Her şeyi kontrol etmek yerine güvendiğin insanlara sorumluluk vermek seni hafifletir.', 'Handing responsibility to people you trust lightens you more than controlling everything.'),
  5: l('Bildiklerini paylaşırken karşındakinin kendi yolunu bulmasına da alan bırak.', 'When you share what you know, leave room for others to find their own way.'),
  6: l('Karar verirken başkalarının onayını değil, kendi kalbinin sesini ölçü al.', 'When you choose, let your own heart be the measure, not other people’s approval.'),
  7: l('Hedefine giderken dinlenmeyi de planına koy; durmak da yolun bir parçası.', 'Put rest into your plan on the way to your goal; pausing is part of the road.'),
  8: l('Adil olmak önce kendine karşı başlar; hatalarını yargılamadan düzeltmeyi dene.', 'Fairness starts with yourself; try correcting mistakes without judging yourself.'),
  9: l('Yalnızlık seni besler ama kapını tamamen kapatma; bilgeliğin paylaşıldıkça değer kazanır.', 'Solitude feeds you, but don’t close the door entirely; wisdom grows when shared.'),
  10: l('Değişim geldiğinde direnmek yerine ondan ne öğrenebileceğini sor; akış seni doğru yere taşır.', 'When change comes, ask what it can teach you instead of resisting; the flow carries you right.'),
  11: l('Gücünü düzenli hareketle ve sakinleştirici alışkanlıklarla dengelemek tükenmeni önler.', 'Balancing your strength with regular movement and calming habits keeps you from burning out.'),
  12: l('Vermeyi seviyorsun; karşılık beklemeyi ve hayır demeyi öğrenmek seni korur.', 'You love to give; learning to expect something back and to say no protects you.'),
  13: l('Bitmesi gerekeni bırakmak sana yer açar; yeni başlangıçlar hep bir vedanın ardından gelir.', 'Letting go of what must end makes room; new beginnings always follow a goodbye.'),
  14: l('Uç noktalara savrulduğunda kendine sor: bunun ortası neresi?', 'When you swing to extremes, ask yourself: where is the middle?'),
  15: l('Çekiciliğin ve hırsın büyük bir güç; onu dürüstçe ve kimseyi bağımlı kılmadan kullan.', 'Your magnetism and ambition are great powers; use them honestly, without making anyone dependent.'),
  16: l('Bir şey yıkıldığında suçlu aramak yerine daha sağlamını nasıl kuracağını düşün.', 'When something falls apart, think about building something sounder instead of finding blame.'),
  17: l('Yeteneğini saklama; görünür olmak sana ve başkalarına ilham verir.', 'Don’t hide your gift; being seen inspires you and others.'),
  18: l('Kaygı ile sezgiyi ayırmak için hislerini yazmak ve bir süre beklemek işe yarar.', 'Writing down your feelings and waiting a little helps you tell anxiety from intuition.'),
  19: l('Işığını paylaşırken dinlenmeyi unutma; sürekli parlamak da yorar.', 'While you share your light, remember to rest; shining all the time is tiring too.'),
  20: l('Aileyle barışık olmak senin için güç kaynağı; geçmişi yargılamadan kabul etmeye çalış.', 'Being at peace with family is a source of strength; try accepting the past without judging it.'),
  21: l('Kendini tek bir yere ya da role sıkıştırma; dünyayı keşfetmek seni tamamlar.', 'Don’t squeeze yourself into one place or role; exploring the world completes you.'),
  22: l('Özgürlüğünü korurken verdiğin sözleri tutmak sana hem hafiflik hem güven kazandırır.', 'Keeping your word while protecting your freedom brings you both lightness and trust.'),
};

/** Her noktanın hiç bilmeyen biri için açıklaması */
export const EXPLAIN: Partial<Record<MxPos, L>> = {
  A: l('Matrisin sol köşesi doğduğun günden hesaplanır. Bu sayı, insanların seni ilk tanıdığında gördüğü hâli, yani kişiliğinin en görünür yüzünü anlatır.', 'The left corner of the matrix comes from the day you were born. It describes how people see you when they first meet you, the most visible side of your personality.'),
  B: l('Üst köşe doğduğun aydan gelir. Seni ruhen besleyen, doğuştan getirdiğin yetenekleri ve ilham kaynağını gösterir.', 'The top corner comes from your birth month. It shows the gifts you were born with and what inspires you.'),
  C: l('Sağ köşe doğduğun yılın rakamlarından hesaplanır. Para, iş ve maddi dünyayla ilişkini, nasıl kazandığını anlatır.', 'The right corner is calculated from the digits of your birth year. It describes your relationship with money, work and the material world.'),
  D: l('Alt köşe ilk üç sayının toplamıdır. Bu hayatta üzerinde çalışman beklenen konuyu ve zorlandığında ortaya çıkan gölge tarafını gösterir.', 'The bottom corner is the sum of the first three numbers. It shows the topic you are meant to work on in this life and the shadow side that appears under stress.'),
  E: l('Merkez, matrisin kalbidir ve dört köşenin toplamından gelir. Kendini en rahat, en “sen” hissettiğin hâli anlatır. Yorulduğunda bu enerjiye dönmek seni toparlar.', 'The centre is the heart of the matrix, made from all four corners. It describes the state in which you feel most at ease and most yourself. Returning to this energy when tired restores you.'),
  love: l('Aşk noktası, alt köşe ile merkez arasındaki çizgide durur. Partnerinde aradığın enerjiyi ve ilişkilerinde tekrar eden temayı gösterir.', 'The love point sits on the line between the bottom corner and the centre. It shows the energy you look for in a partner and the theme that repeats in your relationships.'),
  money: l('Para noktası, sağ köşe ile merkez arasındaki çizgide durur. Paranın sana en kolay hangi tür işlerden aktığını gösterir.', 'The money point sits between the right corner and the centre. It shows the kind of work through which money flows to you most easily.'),
  X: l('Aşk ve para çizgilerinin kesiştiği nokta, içten içe en çok neyi istediğini anlatır. Bu arzuyu tanımak hem aşkta hem işte doğru seçimler yapmanı kolaylaştırır.', 'Where the love and money lines cross describes what you want most deep down. Knowing this desire makes the right choices easier in both love and work.'),
};
export const SECTION_INTRO: Record<'core' | 'tail' | 'talent' | 'lovemoney' | 'purpose' | 'ancestry' | 'health' | 'ages', L> = {
  core: l('Önce matrisin dört köşesine ve merkezine bakıyoruz. Bunlar kişiliğinin temel taşlarıdır: dışarıdan nasıl göründüğün, neyle beslendiğin, nasıl kazandığın ve nerede kendini evinde hissettiğin.', 'First we look at the four corners and the centre. These are the cornerstones of your personality: how you appear, what feeds you, how you earn and where you feel at home.'),
  tail: l('Karmik kuyruk, matrisin alt ucundaki üç sayıdır. Sistemi kuranlara göre geçmişten taşıdığın ve bu hayatta çözmen beklenen bir tema anlatır. Bunu bir ceza gibi değil, tekrar tekrar karşına çıkan ve çözüldüğünde seni güçlendiren bir ders gibi düşün.', 'The karmic tail is the three numbers at the bottom of the matrix. Its founders describe it as a theme carried from the past, to be resolved in this life. Think of it not as a punishment but as a lesson that keeps returning and makes you stronger once resolved.'),
  talent: l('Matrisin üst kolu, doğuştan getirdiğin yetenekleri gösterir. Bu alanlarda çok çaba harcamadan iyi olursun; onları fark edip geliştirdiğinde hayatın daha kolay akar.', 'The upper arm of the matrix shows the gifts you were born with. You are good in these areas without much effort; noticing and developing them makes life flow more easily.'),
  lovemoney: l('Sağ alttaki küçük üçgen, aşk ve para kanalıdır. Burada iki soruya cevap ararız: kiminle mutlu olursun ve paran nereden gelir?', 'The small triangle at the lower right is the love and money channel. It answers two questions: who makes you happy, and where does your money come from?'),
  purpose: l('Amaçlar, hayatının farklı dönemlerinde öne çıkan görevlerdir. Gençlikte kendini bulmak, orta yaşta topluma bir şey vermek, ileri yaşta ise hayatına anlam katmak gibi düşünebilirsin.', 'Purposes are the tasks that stand out at different stages of life: finding yourself when young, giving to society in mid-life, and giving meaning to your life later on.'),
  ancestry: l('Çapraz karenin köşeleri ailenden gelen enerjileri anlatır. Sol üst ve sağ alt baba tarafını, sağ üst ve sol alt anne tarafını temsil eder. Bunlar hem soyundan aldığın güçleri hem de taşıdığın yükleri gösterir.', 'The corners of the diagonal square describe the energies from your family. Top-left and bottom-right represent your father’s side, top-right and bottom-left your mother’s. They show both the strengths you inherited and the burdens you carry.'),
  health: l('Enerji haritası, matristeki sayıları yedi çakraya, yani geleneksel olarak bedenin enerji merkezleri sayılan yedi noktaya yerleştirir. Her satırda üç sayı vardır: “beden” fiziksel tarafı, “enerji” zihinsel ve ruhsal tarafı, “duygu” ise ikisinin toplamını gösterir. Bu tablo kendini tanımak içindir, tıbbi bilgi değildir; sağlıkla ilgili her konuda bir hekime danış.', 'The energy map places the matrix numbers on the seven chakras, traditionally the body’s energy centres. Each row has three numbers: “body” for the physical side, “energy” for the mental and spiritual side, and “emotion” for the two combined. This table is for self-reflection, not medical information; consult a doctor about any health matter.'),
  ages: l('Matrisin dış çemberi bir saat gibi okunur: sol köşe doğduğun yıl, saat yönünde her köşe 10 yıl ileridir. Her 10 yıllık dönem sekiz küçük döneme bölünür ve her birinin kendi enerjisi vardır. Böylece hayatının hangi yaşında hangi temanın öne çıktığını görebilirsin.', 'The outer ring of the matrix is read like a clock: the left corner is the year you were born, and each corner clockwise is 10 years later. Each decade splits into eight smaller periods, each with its own energy, so you can see which theme stands out at which age.'),
};

const lowFirst = (s: string, lang: 'tr' | 'en') => (lang === 'tr' ? (s[0] === 'İ' ? 'i' : s[0] === 'I' ? 'ı' : s[0].toLocaleLowerCase('tr')) + s.slice(1) : s[0].toLowerCase() + s.slice(1));

/** Bir matris noktasını akıcı bir paragraf olarak anlatır */
export function mxStory(pos: MxPos, n: number, opts: { explain?: boolean } = {}): L {
  const a = ARCANA[n];
  if (!a) return l('', '');
  const intro = opts.explain === false ? null : EXPLAIN[pos] ?? POS[pos]?.what;
  const main = pos === 'love' ? a.love : pos === 'money' ? a.money : pos === 'tail' || pos === 'D' ? a.karma : a.plus;
  const make = (lang: 'tr' | 'en') => [
    intro?.[lang],
    lang === 'tr' ? `Senin bu noktandaki sayı ${n}: ${a.name.tr}. Bu arkana ${a.key.tr} demektir.` : `Your number here is ${n}: ${a.name.en}. This arcana stands for ${a.key.en}.`,
    main[lang],
    pos !== 'love' && pos !== 'money' ? null : a.plus[lang],
    lang === 'tr' ? `Bunun bir de gölge tarafı var: ${lowFirst(a.minus.tr.replace(/^(Gölgede|Dengesizlikte)\s+/, ''), 'tr')}` : `It also has a shadow side: ${lowFirst(a.minus.en.replace(/^(Its shadow (is|can be)|Out of balance,? it (shows as|can show as)|Out of balance,?)\s*/, ''), 'en')}`,
    ADVICE[n][lang],
  ].filter(Boolean).join(' ');
  return { tr: make('tr'), en: make('en') };
}
