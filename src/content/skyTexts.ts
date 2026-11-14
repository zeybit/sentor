// Hayat takvimindeki tek tek gökyüzü olaylarının somut yansımaları.
import type { L } from './base';
import type { Rel } from './lifeEvents';

const l = (tr: string, en: string): L => ({ tr, en });
export type Cls = 'up' | 'test' | 'shake' | 'fog' | 'deep' | 'node';
export type Pt = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'asc' | 'mc' | 'dsc' | 'ic';

/** Etkilenen nokta × gelen gezegenin türü: hayatta somut olarak ne olabilir */
export const CONCRETE: Record<Pt, Record<Cls, L>> = {
  sun: {
    up: l('Özgüven ve görünürlük artar; terfi, ödül, yeni bir proje ya da sağlıkta toparlanma.', 'Confidence and visibility grow: a promotion, award, new project or better health.'),
    test: l('Yorgunluk ve sorumluluk artar; bir otorite ya da babayla ilgili konu, “ben kimim?” sorgusu. Emeğin ileride karşılık verir.', 'More fatigue and responsibility; issues with an authority or father, a “who am I?” review. The effort pays off later.'),
    shake: l('Ani değişiklik: işten ayrılma, taşınma, imaj değiştirme ya da hiç beklemediğin bir fırsat.', 'Sudden change: leaving a job, moving, a new image, or an unexpected opening.'),
    fog: l('Yön kaybı ve enerji düşüklüğü; sanata ya da maneviyata yönelme. Büyük kararları netleşene kadar ertele.', 'Feeling directionless and low on energy; turning to art or spirituality. Postpone big decisions until things clear.'),
    deep: l('Hayatında kalıcı bir güç değişimi: bir kriz, bir kayıp ya da bir yükseliş seni yeniden şekillendirir.', 'A lasting shift in power: a crisis, a loss or a rise reshapes you.'),
    node: l('Kaderle buluşma hissi; seni hayat yönüne iten bir kişi ya da karar.', 'A fated feeling; a person or decision that pushes you toward your path.'),
  },
  moon: {
    up: l('İçin rahatlar; ev, aile ya da duygusal hayatta güzel bir gelişme, belki yeni bir ev ya da aileye katılım.', 'You feel at ease; good news at home or in family, perhaps a new home or a new family member.'),
    test: l('Duygusal yük ve yalnızlık hissi; anne, ev ya da aile içinde sorumluluk. Kendine bakmayı ihmal etme.', 'Emotional weight and loneliness; responsibility for mother, home or family. Don’t neglect self-care.'),
    shake: l('Ev ya da aile düzeninde ani değişiklik, taşınma; duygusal olarak kendini özgürleştirme.', 'A sudden change at home or in family, a move; freeing yourself emotionally.'),
    fog: l('Duygusal olarak hassaslaşırsın; sınırların bulanıklaşır, aile içinde belirsizlik ya da bir sır.', 'You become emotionally sensitive; boundaries blur, uncertainty or a secret in the family.'),
    deep: l('Duygusal dünyanda köklü dönüşüm; aile içinde güç dengelerinin değişmesi, eski bir yaranın yüzeye çıkması.', 'A deep emotional transformation; family power shifts, an old wound surfaces.'),
    node: l('Aile ya da yuva konusunda hayat yönünü belirleyen bir karar.', 'A path-defining decision about family or home.'),
  },
  mercury: {
    up: l('Okul, sınav, yazma, satış ya da imza işlerinde şans; iyi haberler ve faydalı görüşmeler.', 'Luck in school, exams, writing, sales or signing; good news and useful talks.'),
    test: l('Ciddi bir eğitim, sınav ya da evrak süreci; yoğun zihinsel çalışma. Sözleşmeleri dikkatle oku.', 'A serious course, exam or paperwork process; heavy mental work. Read contracts carefully.'),
    shake: l('Ani bir haber, beklenmedik bir yolculuk ya da fikrini kökten değiştiren bir bilgi.', 'Sudden news, an unexpected trip or information that changes your mind completely.'),
    fog: l('Unutkanlık ve yanlış anlaşılmalar; imza öncesi iki kez kontrol et. Yaratıcı yazı için ise ilham dolu.', 'Forgetfulness and misunderstandings; double-check before signing. Inspiring for creative writing though.'),
    deep: l('Düşünce biçimin dönüşür; derin bir araştırma, terapi ya da sırrı çözen bir konuşma.', 'Your thinking transforms: deep research, therapy or a conversation that uncovers a secret.'),
    node: l('Seni yönlendiren bir öğretmen, kitap ya da konuşma.', 'A teacher, book or conversation that steers you.'),
  },
  venus: {
    up: l('Aşkta ve parada şans; çekiciliğin artar, güzel bir ilişki, hediye ya da kazanç.', 'Luck in love and money; your charm rises: a lovely relationship, a gift or a gain.'),
    test: l('İlişkide gerçeklik sınavı ya da maddi kısıtlama; kalıcı olan güçlenir, geçici olan biter.', 'A reality test in love or a money squeeze; what’s lasting grows stronger, what’s temporary ends.'),
    shake: l('Aşkta ani gelişme: bir anda başlayan ya da biten ilişki, beklenmedik harcama veya kazanç.', 'Sudden developments in love: a relationship that starts or ends overnight, unexpected spending or income.'),
    fog: l('Aşkta idealize etme ve hayal kırıklığı riski; romantizm yüksek ama gözünü aç.', 'Risk of idealising and disappointment in love; high romance, but keep your eyes open.'),
    deep: l('Tutkulu ve dönüştürücü bir aşk ya da ilişkide güç mücadelesi; değerlerin kökten değişir.', 'A passionate, transforming love or a power struggle; your values change at the root.'),
    node: l('Kader gibi hissettiren bir aşk ya da önemli bir karşılaşma.', 'A love that feels fated, or an important meeting.'),
  },
  mars: {
    up: l('Enerji ve cesaret artar; spor, girişim ya da yeni bir işe atılmak için güçlü dönem.', 'More energy and courage; a strong time for sport, ventures or starting something new.'),
    test: l('Engellenmiş hissedersin; sabır gerektiren mücadeleler, yorgunluk. Öfkeni yönet, sakatlıklara dikkat et.', 'You feel blocked; struggles that need patience, fatigue. Manage anger, watch for injuries.'),
    shake: l('Ani hareketler ve riskler; kazalara dikkat, ama cesur bir adım da atabilirsin.', 'Sudden moves and risks; watch for accidents, but you may also take a bold step.'),
    fog: l('Motivasyon düşer, ne istediğini bilemezsin; enerjini dinlenmeye ve sezgisel işlere ver.', 'Motivation drops and you’re unsure what you want; put energy into rest and intuitive work.'),
    deep: l('Çok güçlü bir irade ve hırs; büyük bir mücadeleyi kazanma ya da güç çatışması.', 'Powerful will and ambition; winning a big struggle, or a power clash.'),
    node: l('Seni harekete geçiren bir fırsat ya da kişi.', 'An opportunity or person that spurs you to act.'),
  },
  jupiter: {
    up: l('Jüpiter döngüsünde büyüme; yeni bir inanç, eğitim ya da genişleme fırsatı.', 'Growth in your Jupiter cycle; a new belief, study or expansion.'),
    test: l('Büyüme planları gerçeklik sınavına girer; abartılan şey küçülür, sağlam olan kalır.', 'Growth plans face a reality check; what was inflated shrinks, what’s solid stays.'),
    shake: l('Beklenmedik bir şans ya da inançlarında ani değişim.', 'Unexpected luck or a sudden shift in beliefs.'),
    fog: l('Fazla iyimserlik; gerçek dışı vaatlere karşı dikkatli ol.', 'Too much optimism; be careful with unrealistic promises.'),
    deep: l('İnançların ve hayat felsefen derinden dönüşür; güçlü bir fırsat ya da büyük bir risk.', 'Your beliefs transform deeply; a powerful opportunity or a big risk.'),
    node: l('Hayat yönünü genişleten bir fırsat.', 'An opportunity that widens your path.'),
  },
  saturn: {
    up: l('Uzun vadeli planlarına destek; emeğin karşılığını görmeye başlarsın.', 'Support for long-term plans; you start seeing returns on your effort.'),
    test: l('Satürn döngüsünün sınav noktası: sorumluluk, olgunlaşma, “ne inşa ediyorum?” sorusu.', 'A test point in your Saturn cycle: responsibility, maturing, “what am I building?”'),
    shake: l('Eski yapılar sarsılır; kurallar, iş düzeni ya da sorumluluklarda beklenmedik değişim.', 'Old structures shake; unexpected changes in rules, work or duties.'),
    fog: l('Hedeflerin bulanıklaşır; yapıların erir, yeniden tanımlaman gerekir.', 'Your goals blur; structures dissolve and need redefining.'),
    deep: l('Hayatının temelleri köklü biçimde yeniden kurulur.', 'Your life’s foundations are rebuilt from the ground up.'),
    node: l('Kaderle ilgili ciddi bir sorumluluk ya da karar.', 'A serious, fated responsibility or decision.'),
  },
  asc: {
    up: l('Kendini iyi hissedersin; görünüşünde, sağlığında ve çevrende olumlu gelişme, yeni insanlar.', 'You feel good; positive changes in your looks, health and circle, new people.'),
    test: l('Ciddileşir, yaşından büyük hissedersin; sağlığına ve sınırlarına özen göster.', 'You become serious, feel older; take care of health and boundaries.'),
    shake: l('Kendini yeniden icat edersin: imaj, saç, stil, şehir ya da çevre değişikliği.', 'You reinvent yourself: image, hair, style, city or circle.'),
    fog: l('Kim olduğunu sorgularsın; başkalarının beklentisiyle kendi isteğini ayırt etmeye çalış.', 'You question who you are; try to separate others’ expectations from your own wishes.'),
    deep: l('Görünüşünde ve kişiliğinde köklü dönüşüm; “eski ben” geride kalır.', 'A deep transformation in looks and personality; the “old you” is left behind.'),
    node: l('Hayatına yön veren önemli bir karşılaşma.', 'An important meeting that gives your life direction.'),
  },
  dsc: {
    up: l('İlişkilerde ve ortaklıklarda bereket; önemli biri hayatına girebilir.', 'Abundance in relationships and partnerships; someone important may enter your life.'),
    test: l('İlişkiler ciddileşir: söz verme ya da ayrılık; ortaklıkta sorumluluk.', 'Relationships get serious: commitment or separation; responsibility in partnerships.'),
    shake: l('İlişkilerde ani değişim: beklenmedik bir tanışma ya da kopuş.', 'Sudden change in relationships: an unexpected meeting or a break.'),
    fog: l('Partnerini idealize etme ya da belirsiz bir ilişki; netlik iste.', 'Idealising a partner or an undefined relationship; ask for clarity.'),
    deep: l('Yoğun, dönüştürücü bir ilişki; partnerle güç dengeleri değişir.', 'An intense, transforming relationship; power balances with a partner shift.'),
    node: l('Kader gibi hissedilen bir ilişki ya da ortaklık.', 'A relationship or partnership that feels fated.'),
  },
  mc: {
    up: l('Kariyerde yükseliş: terfi, tanınma, iyi bir iş teklifi.', 'A career rise: promotion, recognition, a good offer.'),
    test: l('Kariyerde sorumluluk zirvesi; emeğin karşılığı ya da ağır bir sınav.', 'A peak of career responsibility; reward for effort or a heavy test.'),
    shake: l('Ani iş değişikliği, istifa ya da serbest çalışmaya geçme.', 'A sudden job change, resignation or going freelance.'),
    fog: l('Kariyer yönünde belirsizlik; ne istediğini netleştirmek için zaman tanı.', 'Uncertainty about career direction; give yourself time to clarify.'),
    deep: l('Kariyerde köklü dönüşüm; güç ve otorite konularında büyük değişim.', 'A deep career transformation; big changes around power and authority.'),
    node: l('Mesleki yönünü belirleyen bir karar.', 'A decision that sets your professional direction.'),
  },
  ic: {
    up: l('Ev ve ailede bereket: ev alma, taşınma ya da aileye katılım.', 'Abundance at home: buying, moving or a new family member.'),
    test: l('Ev ve ailede sorumluluk; ebeveynlerle ilgili kararlar, evde yük.', 'Responsibility at home; decisions about parents, heavier loads.'),
    shake: l('Ani taşınma ya da aile düzeninde beklenmedik değişim.', 'A sudden move or unexpected change in family life.'),
    fog: l('Evle ya da aileyle ilgili belirsizlik; köklerini sorgularsın.', 'Uncertainty around home or family; you question your roots.'),
    deep: l('Aile ve köklerde derin dönüşüm; eski aile kalıplarıyla yüzleşme.', 'A deep transformation in family and roots; facing old family patterns.'),
    node: l('Yuva ya da aile konusunda yönünü belirleyen bir karar.', 'A path-setting decision about home or family.'),
  },
};

/** Aşk noktalarına (Venüs, partner noktası) gelen gezegenin ilişki durumuna göre yansıması */
export const REL_LINE: Record<Cls, Record<Rel, L>> = {
  up: { single: l('Tanışma için şanslı bir zaman.', 'A lucky time to meet someone.'), partner: l('İlişkiyi büyütmek, nişan ya da birlikte yaşamak için uygun.', 'Good for growing the relationship, engagement or moving in.'), married: l('Evlilikte keyif ve bereket; birlikte büyük bir adım.', 'Joy and abundance in marriage; a big step together.') },
  test: { single: l('Ciddi biri ya da “artık ciddi bir şey istiyorum” kararı.', 'Someone serious, or deciding you want something serious.'), partner: l('İlişki sınanır: ya söz ya ayrılık.', 'The relationship is tested: commitment or parting.'), married: l('Evlilikte sorumluluk ve mesafe hissi; birlikte çalışmak bağı güçlendirir.', 'Responsibility and distance in marriage; working together strengthens the bond.') },
  shake: { single: l('Beklenmedik, sıra dışı birine çekilebilirsin.', 'You may be drawn to someone unexpected and unusual.'), partner: l('İlişkide ani karar ya da özgürlük ihtiyacı.', 'Sudden decisions or a need for freedom in the relationship.'), married: l('Evlilikte rutin kırılır; birlikte yenilik yapmak iyi gelir.', 'The marriage routine breaks; trying new things together helps.') },
  fog: { single: l('Ulaşılmaz ya da belirsiz birine kapılma riski.', 'Risk of falling for someone unavailable or vague.'), partner: l('İlişkide netlik kaybı; açıkça konuşun.', 'Loss of clarity; talk openly.'), married: l('Evlilikte yanlış anlaşılmalar; romantizm ve şefkatle besleyin.', 'Misunderstandings in marriage; nourish it with romance and tenderness.') },
  deep: { single: l('Seni derinden etkileyecek yoğun bir aşk.', 'An intense love that will move you deeply.'), partner: l('İlişki ya derinleşir ya da kökten sorgulanır.', 'The relationship either deepens or is questioned at its roots.'), married: l('Evlilikte güç dengeleri ve kıskançlık konuları; derin bir yenilenme fırsatı.', 'Power and jealousy issues in marriage; a chance for deep renewal.') },
  node: { single: l('Kader gibi hissedilen bir tanışma.', 'A meeting that feels fated.'), partner: l('İlişkinin yönü belirlenir.', 'The relationship’s direction is set.'), married: l('Evlilikte yeni bir dönem başlar.', 'A new phase begins in your marriage.') },
};

/** İlerletilmiş Ay doğum noktalarına kavuşurken */
export const PMOON: Record<Pt, L> = {
  sun: l('İç dünyan kimliğinle buluşuyor: kendini yeniden tanımladığın, hedef koyduğun birkaç ay.', 'Your inner life meets your identity: a few months of redefining yourself and setting goals.'),
  moon: l('Progres Ay doğum Ay’ına dönüyor (yaklaşık 27 yılda bir): duygusal bir yeniden doğuş, ev ve aile gündemde.', 'The progressed Moon returns to its birth place (about every 27 years): an emotional rebirth, home and family in focus.'),
  mercury: l('Zihnin canlanır: öğrenme, yazma, önemli konuşmalar ve kararlar.', 'Your mind livens up: learning, writing, key conversations and decisions.'),
  venus: l('Kalbin açılır: aşk, güzellik ve ilişkiler için en tatlı aylardan biri.', 'Your heart opens: one of the sweetest stretches for love and relationships.'),
  mars: l('Enerji ve istek yükselir: harekete geçme, mücadele ya da tutku.', 'Energy and desire rise: action, struggle or passion.'),
  jupiter: l('İyimserlik ve fırsat: büyüme, yolculuk ya da şanslı bir gelişme.', 'Optimism and opportunity: growth, travel or a lucky turn.'),
  saturn: l('Ciddiyet ve sorumluluk: duygusal olarak olgunlaştığın, yük taşıdığın bir dönem.', 'Seriousness and responsibility: a time of emotional maturing and carrying weight.'),
  asc: l('Yeni bir kişisel döngü başlar: görünüş, çevre ve kendine bakışın tazelenir.', 'A new personal cycle begins: your look, circle and self-image refresh.'),
  dsc: l('İlişkiler duygusal olarak merkeze gelir: bağlanma isteği artar.', 'Relationships move to the emotional centre: the wish to bond grows.'),
  mc: l('Kariyerde görünür olma: emeklerin fark edilir, yeni bir rol.', 'Being seen at work: your efforts are noticed, a new role.'),
  ic: l('Yuva ve aile öncelik olur: taşınma, ev düzenleme ya da aileye dönüş.', 'Home and family become the priority: moving, nesting or returning to family.'),
};
