// İlerletilmiş (progresyon) harita olaylarının sade metinleri
import type { L } from './base';

const l = (tr: string, en: string): L => ({ tr, en });

/** Hareket eden ilerletilmiş noktanın temsil ettiği alan */
export const P_AREA: Record<string, L> = {
  moon: l('duyguların', 'your emotions'),
  sun: l('kimliğin ve hayat yönün', 'your identity and life direction'),
  mercury: l('düşünce biçimin, iletişimin ve kararların', 'your thinking, communication and decisions'),
  venus: l('aşk, ilişkiler ve para', 'love, relationships and money'),
  mars: l('enerjin, cesaretin ve hırsın', 'your energy, courage and drive'),
  jupiter: l('inancın, şansın ve büyüme isteğin', 'your faith, luck and wish to grow'),
  saturn: l('sorumlulukların, hedeflerin ve sınırların', 'your responsibilities, goals and limits'),
  uranus: l('özgürlük ve değişim ihtiyacın', 'your need for freedom and change'),
  neptune: l('hayallerin ve sezgilerin', 'your dreams and intuition'),
  pluto: l('gücün ve dönüşüm isteğin', 'your power and drive to transform'),
  pasc: l('kendini gösterme biçimin ve bedenin', 'the way you present yourself and your body'),
  pmc: l('kariyerin ve toplumdaki yerin', 'your career and public standing'),
};

/** Doğum haritasındaki noktanın temsil ettiği alan */
export const N_AREA: Record<string, L> = {
  sun: l('kimliğin', 'your identity'),
  moon: l('duyguların, evin ve ailen', 'your emotions, home and family'),
  mercury: l('zihnin ve iletişimin', 'your mind and communication'),
  venus: l('aşk hayatın ve zevklerin', 'your love life and tastes'),
  mars: l('isteklerin ve enerjin', 'your desires and energy'),
  jupiter: l('şansın ve büyüme isteğin', 'your luck and wish to grow'),
  saturn: l('sorumlulukların ve sınırların', 'your responsibilities and limits'),
  asc: l('kişiliğin ve görünüşün', 'your personality and appearance'),
  mc: l('kariyerin ve hedeflerin', 'your career and goals'),
  dsc: l('ilişkilerin ve ortaklıkların', 'your relationships and partnerships'),
  ic: l('evin, ailen ve köklerin', 'your home, family and roots'),
  uranus: l('özgürlük ve değişim ihtiyacın', 'your need for freedom and change'),
  neptune: l('hayallerin ve sezgilerin', 'your dreams and intuition'),
  pluto: l('gücün ve dönüşüm isteğin', 'your power and drive to transform'),
};

export const PASPECT: Record<'conjunction' | 'opposition' | 'square' | 'trine', { sub: L; line: L }> = {
  conjunction: { sub: l('İki alan birleşiyor', 'Two areas merge'), line: l('Bu konuda yeni bir başlangıç ve yoğun bir dönem.', 'A new start and an intense period in this area.') },
  trine: { sub: l('Uyumlu, akışkan bir dönem', 'A smooth, flowing period'), line: l('İşler kendiliğinden akar; gelen fırsatları değerlendir.', 'Things flow on their own; make use of the chances that come.') },
  square: { sub: l('Zorlayıcı ama ileri iten bir dönem', 'A testing period that pushes you forward'), line: l('Gerilim seni harekete geçirir; bir karar vermen gerekebilir.', 'Tension gets you moving; you may need to make a decision.') },
  opposition: { sub: l('Denge kurma dönemi', 'A time to find balance'), line: l('Başkalarıyla ya da iki ihtiyacın arasında denge kurman gerekir; bir şey tamamlanabilir.', 'You need to balance others with yourself, or two needs; something may come to completion.') },
};

export const PROG_NOTE = l('İlerletilmiş harita çok yavaş ilerler; bu etki tarihin çevresinde yaklaşık 1–2 yıl hissedilir.', 'The progressed chart moves very slowly; this influence is felt for about 1–2 years around the date.');

const cap = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

export const progBond = (p: string, n: string): L => l(
  `Birbirine bağlanan iki alan: ${P_AREA[p].tr} ve doğum haritandaki ${N_AREA[n].tr}.`,
  `Two areas connect: ${P_AREA[p].en} and ${N_AREA[n].en} in your birth chart.`,
);

export const progSignText = (p: string, adverb: L, keywords: L): L => l(
  `${cap(P_AREA[p].tr)} birkaç yıl boyunca ${adverb.tr} bir tarza bürünüyor. Öne çıkan temalar: ${keywords.tr.toLocaleLowerCase('tr')}.`,
  `For a few years ${P_AREA[p].en} take on a new style: ${adverb.en}. Key themes: ${keywords.en.toLowerCase()}.`,
);

export const progStationText = (p: string, retro: boolean): L => retro
  ? l(`${cap(P_AREA[p].tr)} içe dönüyor: önümüzdeki yıllarda bu konularda dışarıya değil kendine bakar, eskiyi gözden geçirir, kendi yolunu bulursun.`,
      `${cap(P_AREA[p].en)} turn inward: in the coming years you look within on these matters, review the past and find your own way.`)
  : l(`Uzun süre içe dönük kalan ${P_AREA[p].tr} dışarı açılıyor: ertelediğin adımları atmak ve bu konularda görünür olmak için iyi bir zaman.`,
      `${cap(P_AREA[p].en)}, long turned inward, open up: a good time to take postponed steps and be seen in these matters.`);

export const pMoonOpp = (n: string): L => l(
  `İlerletilmiş Ay doğum haritandaki bu noktanın tam karşısına geliyor. Konu: ${N_AREA[n].tr}. Duyguların bu alanda bir denge arıyor; bir şey tamamlanır ya da yön değiştirir.`,
  `The progressed Moon reaches the point opposite this one in your birth chart. Theme: ${N_AREA[n].en}. Your emotions seek balance here; something completes or changes direction.`,
);

// ---------------- Primer direksiyonlar ----------------
export const ANGLE_NAME: Record<string, L> = {
  asc: l('Yükselen', 'Ascendant'), mc: l('MC (tepe noktası)', 'MC (Midheaven)'), dsc: l('Alçalan', 'Descendant'), ic: l('IC (dip noktası)', 'IC (Imum Coeli)'),
};
const ANGLE_THEME: Record<string, L> = {
  asc: l('kişiliğin, bedenin ve hayatına verdiğin yön', 'your personality, body and the direction of your life'),
  mc: l('kariyerin, statün ve toplumdaki yerin', 'your career, status and public standing'),
  dsc: l('ilişkilerin, evlilik ve ortaklıkların', 'your relationships, marriage and partnerships'),
  ic: l('evin, ailen ve köklerin', 'your home, family and roots'),
};
const PD_EFFECT: Record<string, L> = {
  sun: l('görünürlük, onur ve hayatında önemli bir adım', 'visibility, honour and an important step in life'),
  moon: l('duygusal bir değişim; aile, ev ya da halkla ilgili bir gelişme', 'an emotional change; a development involving family, home or the public'),
  mercury: l('önemli bir haber, sözleşme, eğitim ya da yolculuk', 'important news, a contract, study or a journey'),
  venus: l('aşk, uyum, kutlama ya da mutlu bir olay', 'love, harmony, a celebration or a happy event'),
  mars: l('hızlı bir başlangıç, mücadele ve cesaret; aceleye ve tartışmaya dikkat', 'a fast start, struggle and courage; beware of haste and arguments'),
  jupiter: l('büyüme, şans, terfi ya da genişleme', 'growth, luck, promotion or expansion'),
  saturn: l('sorumluluk, sınav ve ağır ama kalıcı bir adım', 'responsibility, a test and a heavy but lasting step'),
  uranus: l('ani bir değişim, beklenmedik bir özgürleşme', 'a sudden change, an unexpected liberation'),
  neptune: l('belirsizlik ya da ilham; bir hayalin peşine düşmek', 'uncertainty or inspiration; chasing a dream'),
  pluto: l('derin bir dönüşüm, güç meseleleri ve bir dönemin kapanışı', 'deep transformation, power issues and the end of a chapter'),
};
export const pdText = (prom: string, angle: string): L => l(
  `Doğduğun günün gökyüzü dönmeye devam ettikçe gezegenler sırayla haritanın köşelerine ulaşır. Bu yaşta ${ANGLE_THEME[angle].tr} alanında ${PD_EFFECT[prom].tr} öne çıkar.`,
  `As the sky of your birth day keeps turning, planets reach the angles of your chart one by one. At this age, ${PD_EFFECT[prom].en} comes forward in ${ANGLE_THEME[angle].en}.`,
);
export const PD_NOTE = l('Primer direksiyonlar doğum saatine çok duyarlıdır: saat 4 dakika kayarsa tarih yaklaşık 1 yıl kayar. Tarihler bu yüzden ±1 yıl hassasiyetle okunmalı.', 'Primary directions are very sensitive to birth time: a 4-minute error shifts the date by about a year. Read the dates with ±1 year precision.');

// ---------------- Drakonik harita ----------------
export const DRACONIC_CORE: Record<string, L> = {
  sun: l('Ruhunun özü', 'Your soul’s core'), moon: l('Ruhunun duygusal hafızası', 'Your soul’s emotional memory'), asc: l('Ruhunun dünyaya bakışı', 'How your soul meets the world'),
};
export const draconicContactText = (a: string, b: string): L => l(
  `Drakonik noktan doğum haritanda ${N_AREA[b]?.tr ?? ''} ile birleşiyor. Ruhunun getirdiği tema (${P_AREA[a]?.tr ?? (a === 'asc' ? 'kimliğin' : 'hedeflerin')}) ile bu hayattaki ${N_AREA[b]?.tr ?? ''} iç içe; bu alan sana “tanıdık”, kaderle ilgili ve tamamlanması gereken bir şey gibi gelir.`,
  `Your draconic point meets ${N_AREA[b]?.en ?? ''} in your birth chart. The theme your soul brings (${P_AREA[a]?.en ?? (a === 'asc' ? 'identity' : 'purpose')}) and ${N_AREA[b]?.en ?? ''} in this life are intertwined; this area feels “familiar”, fated, something to complete.`,
);
