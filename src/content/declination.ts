// Deklinasyon yorumu: sınır dışı (out-of-bounds) gezegenler, sınıra yakın gezegenler ve paraleller.
// Kaynak gelenek: Kt Boehrer'in "Declination: The Other Dimension" çalışması ve modern deklinasyon astrolojisi.
// Deklinasyon, gezegenin gök ekvatorunun kuzeyinde (+) ya da güneyinde (−) kaç derece olduğudur.
import type { BodyId, Chart } from '../engine/astro';
import { parallels } from '../engine/techniques';
import { BODIES, L } from './base';

const l = (tr: string, en: string): L => ({ tr, en });

/** Doğum anındaki ekliptik eğimi (Güneş'in ulaşabildiği en büyük deklinasyon) */
export const obliquityAt = (d: Date) => 23.43929 - 0.0130042 * ((d.getTime() - Date.UTC(2000, 0, 1, 12)) / 864e5 / 36525);

const OOB: Partial<Record<BodyId, L>> = {
  moon: l('Duyguların kurallara sığmaz: çok yoğun hisseder, beklenmedik tepkiler verirsin. Yuva, annelik ya da aidiyet konusunda alışılmışın dışında bir yolun olabilir. Doğru kanalda bu, güçlü bir empati ve sezgi yeteneğidir.', 'Your feelings don’t follow the rules: you feel intensely and react unexpectedly. You may take an unusual path around home, mothering or belonging. Channelled well, it is strong empathy and intuition.'),
  mercury: l('Düşünme biçimin sıra dışı: kalıpların dışında, özgün, bazen dağınık bir zihin. Herkesin baktığı yere değil, kimsenin bakmadığı yere bakarsın; yazı, buluş ve farklı fikirlerde parlarsın.', 'Your mind is unconventional: original, outside the box, sometimes scattered. You look where nobody else looks; you shine in writing, invention and unusual ideas.'),
  venus: l('Aşkta ve zevklerde kuralları sen koyarsın: alışılmadık ilişkiler ya da kendine özgü bir estetik. Sevgini ifade biçimin çevrene “fazla” ya da “farklı” gelebilir; sanatta ve tasarımda bu bir imzadır.', 'You set your own rules in love and taste: unusual relationships or a signature aesthetic. The way you love may seem “too much” or “different” to others; in art and design it is a signature.'),
  mars: l('Enerjin ve öfken sınır tanımaz: cesur, atak, bazen kontrolsüz. Kimsenin göze alamadığını yaparsın. Spor, girişim ya da bir dava gibi doğru alanda büyük işler çıkarırsın; yanlış alanda tükenmişlik ve çatışma getirir.', 'Your drive and anger know no limits: brave, bold, sometimes uncontrolled. You do what others won’t dare. In the right arena (sport, enterprise, a cause) you achieve a lot; in the wrong one it brings burnout and conflict.'),
  jupiter: l('İnançlarında ve hayallerinde sınır yok: büyük düşünür, büyük risk alırsın. Bu cesaret seni uzağa götürür; ama aşırı iyimserlik ve “her şey olur” duygusu dikkat ister.', 'Your beliefs and dreams have no limits: you think big and take big risks. That courage takes you far, but over-optimism needs watching.'),
  saturn: l('Sorumluluk ve otoriteyle ilişkin sıra dışı: başkalarının kurallarını değil, kendi kurduğun disiplini dinlersin. Geleneksel yollar sana dar gelir; kendi yapını kendin inşa edersin.', 'Your relationship with duty and authority is unusual: you follow a discipline you built yourself rather than others’ rules. Traditional paths feel narrow; you build your own structure.'),
  uranus: l('Özgürlük ve değişim ihtiyacın çok güçlü; zamanının ötesinde fikirlerin olur. Sıradan bir hayat seni boğar.', 'Your need for freedom and change is very strong; your ideas are ahead of their time. An ordinary life suffocates you.'),
  neptune: l('Sezgi ve hayal gücün sınırsız: sanatta, müzikte ve maneviyatta güçlü bir kanal. Gerçeklikle bağını koruman, sınır çizmeyi öğrenmen gerekir.', 'Your intuition and imagination are boundless: a strong channel for art, music and spirituality. You need to stay grounded and learn to set boundaries.'),
  pluto: l('Güç, kriz ve dönüşüm temaları hayatında yoğun; zor dönemlerden derin bir değişimle çıkarsın. (Plüton bazı on yıllarda sık sık sınır dışına çıkar; bu yüzden kuşağınla paylaştığın bir etki de taşır.)', 'Power, crisis and transformation are intense themes; you emerge from hard times deeply changed. (Pluto goes out of bounds often in some decades, so this is partly a generational influence.)'),
};
const KEY: Partial<Record<BodyId, L>> = {
  sun: l('kimliğin', 'your identity'), moon: l('duyguların', 'your feelings'), mercury: l('zihnin', 'your mind'), venus: l('sevgin', 'your love'), mars: l('isteklerin', 'your drive'),
  jupiter: l('umudun', 'your hope'), saturn: l('sorumlulukların', 'your duties'), uranus: l('özgürlük ihtiyacın', 'your need for freedom'), neptune: l('hayallerin', 'your dreams'), pluto: l('gücün', 'your power'),
};
const MAIN: BodyId[] = ['moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto'];

export interface DecItem { tech: L; text: L; oob?: boolean }
export function isOOB(chart: Chart, id: BodyId) { const p = chart.positions[id]; return !!p && Math.abs(p.dec) > obliquityAt(chart.utc); }

export function declinationReading(chart: Chart): { intro: L; items: DecItem[]; eps: number } {
  const eps = obliquityAt(chart.utc);
  const items: DecItem[] = [];
  const nm = (b: BodyId) => BODIES[b].name;
  const sgn = (d: number) => `${d >= 0 ? '+' : '−'}${Math.abs(d).toFixed(1)}°`;
  for (const b of MAIN) {
    const p = chart.positions[b]; if (!p) continue;
    const a = Math.abs(p.dec);
    if (a > eps) items.push({ oob: true, tech: l(`${nm(b).tr} sınır dışı: ${sgn(p.dec)} (sınır ±${eps.toFixed(2)}°, ${(a - eps).toFixed(1)}° dışarıda)`, `${nm(b).en} out of bounds: ${sgn(p.dec)} (limit ±${eps.toFixed(2)}°, ${(a - eps).toFixed(1)}° beyond)`), text: OOB[b]! });
  }
  for (const b of ['sun', ...MAIN] as BodyId[]) {
    const p = chart.positions[b]; if (!p) continue;
    const a = Math.abs(p.dec);
    if (a <= eps && a >= eps - 1) items.push({ tech: l(`${nm(b).tr} sınırda: ${sgn(p.dec)}`, `${nm(b).en} at the edge: ${sgn(p.dec)}`), text: l(`${nm(b).tr} gök ekvatorundan neredeyse en uzak noktada. ${KEY[b]!.tr.charAt(0).toLocaleUpperCase('tr') + KEY[b]!.tr.slice(1)} belirgin ve güçlü; zorlandığında aşırıya kaçabilir. Haritanın “gün dönümü” noktalarına yakın bir gezegen sayılır.`, `${nm(b).en} is near its furthest point from the celestial equator. ${KEY[b]!.en.charAt(0).toUpperCase() + KEY[b]!.en.slice(1)} is marked and strong, and can go to extremes under pressure.`) });
  }
  const SLOW = ['uranus', 'neptune', 'pluto'];
  let saidP = false, saidC = false, pi = 0;
  const TAILS = ['birbirinden ayrılmaz; biri harekete geçince diğeri de devreye girer.', 'hep birlikte çalışır; birini düşünmeden diğerini anlayamazsın.', 'aynı anda güçlenir, aynı anda zorlanır.', 'birbirini besler; biri tetiklenince diğeri de sesini yükseltir.'];
  for (const x of parallels(chart).filter(x => KEY[x.a] && KEY[x.b] && !(SLOW.includes(x.a) && SLOW.includes(x.b))).slice(0, 4)) {
    const par = x.type === 'parallel';
    const first = par ? !saidP : !saidC; if (par) saidP = true; else saidC = true;
    const A = KEY[x.a]!.tr.charAt(0).toLocaleUpperCase('tr') + KEY[x.a]!.tr.slice(1);
    items.push({
      tech: l(`${nm(x.a).tr} ${par ? 'paralel' : 'kontra-paralel'} ${nm(x.b).tr} (${x.orb.toFixed(2)}°)`, `${nm(x.a).en} ${par ? 'parallel' : 'contra-parallel'} ${nm(x.b).en} (${x.orb.toFixed(2)}°)`),
      text: par
        ? l(`${first ? 'İki gezegen ekvatordan aynı uzaklıkta ve aynı yarımkürede: gizli bir kavuşum gibi birlikte çalışırlar. Burç çemberinde görünmediği için çoğu yorumda atlanır. ' : ''}${A} ile ${KEY[x.b]!.tr} ${TAILS[pi++ % TAILS.length]}`, `Same distance from the equator, same hemisphere: they work together like a hidden conjunction. ${KEY[x.a]!.en.charAt(0).toUpperCase() + KEY[x.a]!.en.slice(1)} and ${KEY[x.b]!.en} are bound together. It doesn’t show on the zodiac wheel, so most readings miss it.`)
        : l(`${first ? 'İki gezegen ekvatordan aynı uzaklıkta ama zıt yarımkürelerde: gizli bir karşıtlık gibi çalışırlar. ' : ''}${A} ile ${KEY[x.b]!.tr} arasında bir çekme-itme var; birini dengelemeden diğeri rahat etmez.`, `Same distance from the equator, opposite hemispheres: a hidden opposition. ${KEY[x.a]!.en.charAt(0).toUpperCase() + KEY[x.a]!.en.slice(1)} and ${KEY[x.b]!.en} pull against each other; one needs balancing for the other to settle.`),
    });
  }
  const intro = l(`Deklinasyon, bir gezegenin gök ekvatorunun ne kadar kuzeyinde (+) ya da güneyinde (−) olduğunu gösterir. Güneş yıl boyunca en fazla ±${eps.toFixed(2)}°’ye ulaşır. Bu sınırı aşan gezegenlere “sınır dışı” denir: Güneş’in düzeninin dışına çıkmış gibi davranırlar, o gezegenin konusunda kendi kurallarını koyarsın. Bu hem sıra dışı bir yetenek hem de aşırılık eğilimi getirir.`,
    `Declination shows how far north (+) or south (−) of the celestial equator a planet is. The Sun reaches at most ±${eps.toFixed(2)}° in a year. Planets beyond this are “out of bounds”: they act outside the Sun’s order, and you make your own rules in that planet’s area. It brings unusual talent and a tendency to extremes.`);
  return { intro, items, eps };
}
