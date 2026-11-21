// Kiron: uygulamanın astroloğu. Sorudan konuyu çıkarır, ilgili teknikleri (profeksiyon, Güneş dönüşü, progresyon,
// solar arc, primer direksiyon, transit, tutulma, horary) uygulamanın kendi hesaplarından okuyup tek bir cevapta birleştirir.
// Cevap her zaman hesaplanan verilere dayanır; uydurma tarih ya da konum yoktur.
import type { Chart } from './astro';
import { computeChart } from './astro';
import { lifeTimeline, skyEvents, Window, Topic } from './timeline';
import { personCtx } from './person';
import { primaryDirections } from './primary';
import { castHorary } from './horary';
import { bestDays, personalLunarPhase } from './extras';
import { yearReport } from '../content/lillyYear';
import { computeDaily } from '../content/forecast';
import { mirrorLines } from '../content/mirror';
import { marriageWindows, spouseProfile } from '../content/spouse';
import { placementText } from '../content/placements';
import { EVENTS } from '../content/lifeEvents';
import { QUESTIONS, VERDICT_TEXT, Q_LINE } from '../content/horaryText';
import { ANGLE_NAME } from '../content/progTexts';
import { SIGNS, BODIES } from '../content/base';
import type { Profile } from '../store';

type Lang = 'tr' | 'en';
export type Intent = 'year' | 'month' | 'today' | 'love' | 'marriage' | 'career' | 'money' | 'home' | 'travel' | 'change' | 'self' | 'yesno' | 'help';
export interface Action { label: string; to: string }
export interface Answer { intent: Intent; paras: string[]; actions: Action[]; facts: string }

const has = (q: string, ...w: string[]) => w.some(x => q.includes(x));
/** Sorudan konu çıkarımı (Türkçe ve İngilizce anahtar kelimeler) */
export function detectIntent(raw: string): Intent {
  const q = raw.toLocaleLowerCase('tr').normalize('NFC');
  const yesno = /(^|\s)(mı|mi|mu|mü|mıyım|miyim|muyum|müyüm|mısın|misin|mıdır|midir)\s*\??\s*$/.test(q) || /\b(will|should|is it|am i)\b/.test(q);
  if (has(q, 'evlen', 'evlilik', 'nikah', 'nişan', 'marry', 'marriage', 'wedding')) return yesno && !has(q, 'ne zaman', 'when') ? 'yesno' : 'marriage';
  if (yesno && !has(q, 'ne zaman', 'when', 'nasıl', 'how')) return 'yesno';
  if (has(q, 'bugün', 'today', 'günüm')) return 'today';
  if (has(q, 'bu ay', 'ay ', 'this month', 'aylık')) return 'month';
  if (has(q, 'aşk', 'sevgili', 'ilişki', 'flört', 'partner', 'love', 'relationship', 'dating', 'kalp')) return 'love';
  if (has(q, 'kariyer', 'iş ', 'işim', 'meslek', 'terfi', 'çalış', 'career', 'job', 'work', 'promotion')) return 'career';
  if (has(q, 'para', 'maaş', 'kazanç', 'borç', 'money', 'finance', 'income')) return 'money';
  if (has(q, 'ev ', 'taşın', 'aile', 'home', 'move', 'family')) return 'home';
  if (has(q, 'yolculuk', 'seyahat', 'yurt dışı', 'yurtdışı', 'eğitim', 'okul', 'travel', 'abroad', 'study')) return 'travel';
  if (has(q, 'değişim', 'dönüm', 'kriz', 'change', 'turning')) return 'change';
  if (has(q, 'ben kimim', 'kişilik', 'karakter', 'beni anlat', 'kendimi', 'who am i', 'personality', 'about me')) return 'self';
  if (has(q, 'yıl', 'sene', 'gelecek', 'year', 'future', '2027', '2028')) return 'year';
  return 'help';
}

const TOPIC_NAME: Record<Topic, [string, string]> = { love: ['Aşk ve evlilik', 'Love & marriage'], career: ['Kariyer', 'Career'], home: ['Ev ve aile', 'Home & family'], travel: ['Yolculuk ve eğitim', 'Travel & study'], change: ['Büyük değişim', 'Major change'] };
const TECH_TR: Record<string, [string, string]> = { transit: ['transit', 'transits'], progression: ['progresyon', 'progressions'], solarArc: ['solar arc', 'solar arc'], primary: ['primer direksiyon', 'primary directions'], profection: ['yıllık profeksiyon', 'profection'], eclipse: ['tutulma', 'eclipses'], solarReturn: ['Güneş dönüşü', 'solar return'] };
const firstSentences = (t: string, n: number) => (t.match(/[^.!?]+[.!?]+/g) ?? [t]).slice(0, n).map(x => x.trim()).join(' ');

export function answer(intent: Intent, chart: Chart, profile: Profile, lang: Lang, question = ''): Answer {
  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const li = lang === 'tr' ? 0 : 1;
  const fmtM = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long', year: 'numeric' }).format(d);
  const fmtD = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long' }).format(d);
  const range = (w: { start: Date; end: Date }) => { const a = w.start < new Date() ? L('şu an', 'now') : fmtM(w.start), b = fmtM(new Date(w.end.getTime() - 15 * 864e5)); return a === b ? a : `${a} – ${b}`; };
  const timed = chart.asc !== null && chart.cusps.length === 12;
  const now = new Date();
  const person = personCtx(profile);
  const all = () => lifeTimeline(chart, { fromAge: 16, toAge: 80, ...person });
  const name = profile.name?.split(' ')[0] || '';
  const paras: string[] = [];
  const actions: Action[] = [];

  const rel = profile.rel ?? 'none';
  const winLine = (w: Window) => {
    const head = w.reasons.map(r => EVENTS[r.id]?.head?.[lang]).find(Boolean);
    const sc = w.reasons.map(r => { const e = EVENTS[r.id] as any; return e?.[rel === 'married' ? 'm' : rel === 'partner' ? 'p' : 's']?.[lang] ?? e?.all?.[lang]; }).find(Boolean);
    const techs = w.techs.map(t => TECH_TR[t]?.[li] ?? t).join(', ');
    return `• ${range(w)} · ${TOPIC_NAME[w.topic][li]}${w.gen ? L(' (kuşak etkisi)', ' (generational)') : ''}: ${head ?? w.reasons[0]?.text[lang] ?? ''}${sc ? `. ${sc}` : ''} ${L(`[${w.techs.length} teknik: ${techs}]`, `[${w.techs.length} techniques: ${techs}]`)}`;
  };
  const upcoming = (topics: Topic[] | null, months: number, n: number) => {
    const until = now.getTime() + months * 30.44 * 864e5;
    return all().filter(w => (!topics || topics.includes(w.topic)) && w.end > now && w.start.getTime() < until).sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, n);
  };
  const untimedNote = () => {
    if (timed) return;
    // Saat bilinmiyorsa: üç olası saat için yükselen burç senaryoları
    const sc = [6, 12, 18].map(h => {
      const c = computeChart({ ...chart.input, hour: h, minute: 0, timeKnown: true });
      return `${L(`saat ${h}:00 civarı`, `around ${h}:00`)} → ${L('yükselen', 'rising')} ${SIGNS[Math.floor(c.asc! / 30)][lang]}`;
    });
    paras.push(L(`Not: Doğum saatin girilmediği için ev, yükselen, profeksiyon, Güneş dönüşü ve primer direksiyon hesapları devre dışı; tarihler yalnızca saat gerektirmeyen tekniklerden çıktı. Saate göre tablo değişir: ${sc.join('; ')}. Saatini biliyorsan ekle, bilmiyorsan Saat düzeltme ile yaklaşık saatini bulabiliriz.`,
      `Note: no birth time, so houses, rising sign, profections, solar returns and primary directions are off; dates come only from time-independent techniques. The picture shifts with time: ${sc.join('; ')}. Add your time, or estimate it with Rectification.`));
    actions.push({ label: L('Saat düzeltme', 'Rectification'), to: 'chart:rectify' });
  };
  const pdsSoon = (years: number, angles?: string[]) => primaryDirections(chart).filter(d => d.date > new Date(now.getTime() - 0.5 * 365.25 * 864e5) && d.date.getTime() < now.getTime() + years * 365.25 * 864e5 && (!angles || angles.includes(d.angle)));
  const pdLine = (d: ReturnType<typeof primaryDirections>[number]) => `• ${fmtM(d.date)} (±1 ${L('yıl', 'yr')}): ${BODIES[d.prom].name[lang]} → ${ANGLE_NAME[d.angle][lang]}`;

  switch (intent) {
    case 'year': {
      const yr = timed ? yearReport(chart, now) : null;
      if (yr) {
        paras.push(L(`${name ? name + ', ' : ''}${yr.age}. yaşının ana çerçevesi şöyle:`, `${name ? name + ', ' : ''}here is the frame of your age ${yr.age}:`));
        yr.lines.slice(0, 4).forEach(x => paras.push(`${x.label[lang]}: ${x.text[lang]}`));
      }
      const ws = upcoming(null, 13, 6);
      paras.push(ws.length ? L('Önümüzdeki 12 ayın kırılma noktaları (birden çok tekniğin buluştuğu dönemler):', 'Turning points of the next 12 months (where several techniques converge):') + '\n' + ws.map(winLine).join('\n')
        : L('Önümüzdeki 12 ayda eşiği aşan belirgin bir dönem yok; sakin, inşa etmeye uygun bir yıl.', 'No period crosses the threshold in the next 12 months; a calm year for building.'));
      const pds = pdsSoon(1.5);
      if (pds.length) paras.push(L('Primer direksiyonlar (en eski zamanlama tekniği) bu aralığa şunları koyuyor:', 'Primary directions place these in this range:') + '\n' + pds.map(pdLine).join('\n'));
      const ecl = skyEvents(chart).filter(e => e.kind === 'eclipse' && e.peak > now && e.peak.getTime() < now.getTime() + 365 * 864e5).slice(0, 2);
      if (ecl.length) paras.push(L('Haritana değen tutulmalar: ', 'Eclipses touching your chart: ') + ecl.map(e => fmtD(e.peak) + ' ' + e.peak.getFullYear()).join(', ') + L('. Tutulmalar başlattıklarını genelde 6 ay içinde gösterir.', '. Eclipses usually show what they start within six months.'));
      actions.push({ label: L('Önemli dönemler', 'Key periods'), to: 'chart:timeline' }, { label: L('Güneş dönüşü', 'Solar return'), to: 'chart:solarReturn' });
      untimedNote();
      break;
    }
    case 'month': {
      const yr = timed ? yearReport(chart, now) : null;
      if (yr) paras.push(`${yr.lines[1].label[lang]}: ${yr.lines[1].text[lang]}`);
      const ws = upcoming(null, 2, 4);
      paras.push(ws.length ? L('Bu ay ve gelecek ay etkin dönemler:', 'Active periods this month and next:') + '\n' + ws.map(winLine).join('\n') : L('Bu ay belirgin bir dönem yok; günlük akışa odaklan.', 'No marked period this month; focus on the daily flow.'));
      const bl = bestDays(chart, 'love', 30).slice(0, 2), bc = bestDays(chart, 'career', 30).slice(0, 2);
      if (bc.length) paras.push(L('İş için en iyi günlerin: ', 'Best days for work: ') + bc.map(d => fmtD(d.date)).join(', '));
      if (bl.length) paras.push(L('Aşk ve buluşma için: ', 'For love and dates: ') + bl.map(d => fmtD(d.date)).join(', '));
      actions.push({ label: L('Ay dönüşü', 'Lunar return'), to: 'chart:lunarReturn' });
      break;
    }
    case 'today': {
      const d = computeDaily(chart, now);
      const pm = personalLunarPhase(chart, now);
      paras.push(L(`Ay bugün ${SIGNS[d.moonSign].tr} burcunda${timed && d.moonHouse ? `, haritanın ${d.moonHouse}. evinde` : ''}. Kişisel Ay döngünde: ${pm.phase.name.tr}. ${pm.phase.text.tr}`, `The Moon is in ${SIGNS[d.moonSign].en}${timed && d.moonHouse ? `, in your ${d.moonHouse}th house` : ''}. Your personal lunar phase: ${pm.phase.name.en}. ${pm.phase.text.en}`));
      if (d.hits.length) paras.push(L('Bugün haritana değen en güçlü etkiler:', 'Strongest influences on your chart today:') + '\n' + d.hits.slice(0, 3).map(h => '• ' + h.text[lang]).join('\n'));
      if (d.retrogrades.length) paras.push(L('Geri giden gezegenler: ', 'Retrograde: ') + d.retrogrades.map(p => BODIES[p].name[lang]).join(', '));
      actions.push({ label: L('Bugün', 'Today'), to: 'today' });
      break;
    }
    case 'love': case 'marriage': {
      paras.push(L('Aşk haritanın temeli: ', 'The base of your love chart: ') + firstSentences(placementText('venus', chart.positions.venus.sign)[lang], 2));
      const sp = spouseProfile(chart, lang);
      if (sp) sp.slice(0, 2).forEach(s => paras.push(`${s.title[lang]}: ${firstSentences(s.text[lang], 2)}`));
      const mw = intent === 'marriage' ? marriageWindows(chart, now, 3, undefined, person) : upcoming(['love'], 36, 4);
      paras.push(mw.length ? (intent === 'marriage' ? L('Evlilik ve ciddi bağlılık için en güçlü pencereler (teknik sayısına göre seçildi):', 'Strongest windows for marriage and commitment (ranked by techniques):') : L('Aşk hayatında öne çıkan dönemler:', 'Highlighted love periods:')) + '\n' + mw.map(winLine).join('\n')
        : L('Yakın vadede eşiği aşan bir aşk dönemi görünmüyor.', 'No love period crosses the threshold soon.'));
      const pds = pdsSoon(5, ['dsc']);
      if (pds.length) paras.push(L('Primer direksiyon, ilişki noktana şunu getiriyor: ', 'A primary direction to your partnership point: ') + pds.map(pdLine).join(' '));
      const bd = bestDays(chart, 'love', 30).slice(0, 3);
      if (bd.length) paras.push(L('Önümüzdeki 30 günde buluşma ve önemli konuşmalar için: ', 'Next 30 days for dates and important talks: ') + bd.map(d => fmtD(d.date)).join(', '));
      if (!(profile.events ?? []).some(e => e.type === 'love')) paras.push(L('İpucu: Geçmişte bir ilişkinin başladığı tarihi Saat düzeltme bölümüne eklersen, senin haritanda hangi işaretlerin tuttuğunu öğrenip tahminleri ona göre ayarlarım.', 'Tip: add a past relationship date under Rectification and I will learn which signs work in your chart.'));
      actions.push({ label: L('Gelecekteki eşin', 'Future spouse'), to: 'love:spouse' }, { label: L('Biriyle uyum', 'Compatibility'), to: 'love:compat' });
      untimedNote();
      break;
    }
    case 'career': case 'money': {
      if (timed && chart.mc !== null) paras.push(L(`MC (kariyer noktan) ${SIGNS[Math.floor(chart.mc / 30)].tr} burcunda; Güneş’in ${chart.positions.sun.house}. evde.`, `Your MC is in ${SIGNS[Math.floor(chart.mc / 30)].en}; your Sun is in house ${chart.positions.sun.house}.`));
      paras.push(firstSentences(placementText(intent === 'money' ? 'jupiter' : 'saturn', chart.positions[intent === 'money' ? 'jupiter' : 'saturn'].sign)[lang], 2));
      const ws = upcoming(['career'], 36, 4);
      paras.push(ws.length ? L('Kariyerde öne çıkan dönemler:', 'Highlighted career periods:') + '\n' + ws.map(winLine).join('\n') : L('Yakın vadede eşiği aşan bir kariyer dönemi yok.', 'No career period crosses the threshold soon.'));
      const pds = pdsSoon(5, ['mc']);
      if (pds.length) paras.push(L('Primer direksiyon, kariyer noktana şunları getiriyor:', 'Primary directions to your career point:') + '\n' + pds.map(pdLine).join('\n'));
      const bd = bestDays(chart, 'career', 30).slice(0, 3);
      if (bd.length) paras.push(L('Görüşme, imza ve başvuru için en iyi günlerin: ', 'Best days for interviews, signing and applying: ') + bd.map(d => fmtD(d.date)).join(', '));
      actions.push({ label: L('Portföy', 'Portfolio'), to: 'portfolio' });
      untimedNote();
      break;
    }
    case 'home': case 'travel': case 'change': {
      const t: Topic = intent;
      const ws = upcoming([t], 36, 4);
      paras.push(ws.length ? L(`${TOPIC_NAME[t][0]} konusunda öne çıkan dönemler:`, `Highlighted ${TOPIC_NAME[t][1].toLowerCase()} periods:`) + '\n' + ws.map(winLine).join('\n') : L('Yakın vadede eşiği aşan bir dönem görünmüyor.', 'No period crosses the threshold soon.'));
      const pds = pdsSoon(5, t === 'home' ? ['ic'] : t === 'change' ? ['asc'] : undefined);
      if (pds.length && t !== 'travel') paras.push(L('Primer direksiyonlar:', 'Primary directions:') + '\n' + pds.map(pdLine).join('\n'));
      actions.push({ label: L('Önemli dönemler', 'Key periods'), to: 'chart:timeline' });
      untimedNote();
      break;
    }
    case 'self': {
      paras.push(L('Haritandan seni en iyi anlatan birkaç cümle:', 'A few lines from your chart that describe you best:'));
      mirrorLines(chart).slice(0, 4).forEach(m => paras.push(`• ${m.text[lang]} (${m.why[lang]})`));
      paras.push(firstSentences(placementText('sun', chart.positions.sun.sign)[lang], 2) + ' ' + firstSentences(placementText('moon', chart.positions.moon.sign)[lang], 1));
      actions.push({ label: L('Kendini bul', 'Find yourself'), to: 'explore:mirror' });
      break;
    }
    case 'yesno': {
      const key = /evlen|evlilik|nikah|nişan|ilişki|sevgili|aşk|marr|love/i.test(question) ? 'love' : /yaz|dön|ara|mesaj|text|call|back/i.test(question) ? 'contact' : /iş|terfi|kariyer|job|promot/i.test(question) ? 'career' : /para|maaş|money/i.test(question) ? 'money' : /ev|taşın|home|move/i.test(question) ? 'home' : /yolculuk|seyahat|yurt|travel|abroad/i.test(question) ? 'travel' : /okul|sınav|kabul|study|exam/i.test(question) ? 'study' : 'wish';
      const qq = QUESTIONS.find(x => x.key === key) ?? QUESTIONS[QUESTIONS.length - 1];
      const r = castHorary(now, chart.input.lat, chart.input.lon, qq.house);
      const v = VERDICT_TEXT[r.verdict];
      paras.push(L(`Bu evet/hayır sorusu için şu anın haritasını kurdum (horary). Soru ${qq.house}. evden okunuyor.`, `For this yes/no question I cast the chart of this moment (horary), read from house ${qq.house}.`));
      paras.push(`${v.title[lang]}: ${Q_LINE[key]?.[v.tone]?.[lang] ?? ''} ${firstSentences(v.body[lang], 2)}`);
      if (r.timing) { const d = new Date(now.getTime() + r.timing.days * 864e5); paras.push(L(`Zamanlama ipucu: göstergeler ${fmtD(d)} civarında buluşuyor.`, `Timing hint: the significators meet around ${fmtD(d)}.`)); }
      paras.push(L('Horary, sorunun içtenlikle sorulduğu ana göre okunur; aynı soruyu tekrar tekrar sormak yeni bir cevap vermez.', 'Horary is read for the moment a question is sincerely asked; asking again gives no new answer.'));
      actions.push({ label: L('Soru sor ekranı', 'Ask screen'), to: 'ask' });
      break;
    }
    default: {
      paras.push(L(`Merhaba${name ? ' ' + name : ''}! Ben Kiron, Sentor’un astroloğuyum. Doğum haritana; profeksiyon, Güneş dönüşü, progresyon, solar arc, primer direksiyon, transit ve tutulmaları birlikte okuyarak bakıyorum. Bana bu yılı, aşk hayatını, kariyerini, ne zaman evleneceğini, bugünü ya da evet/hayır sorularını sorabilirsin.`,
        `Hi${name ? ' ' + name : ''}! I’m Kiron, Sentor’s astrologer. I read your chart by combining profections, solar returns, progressions, solar arcs, primary directions, transits and eclipses. Ask me about this year, love, career, when you’ll marry, today, or a yes/no question.`));
    }
  }

  // Yapay zekâ katmanı için özet veri (yalnızca hesaplanmış bilgiler)
  const P = chart.positions;
  const base = `${L('Kişi', 'Person')}: ${profile.name || '-'}; ${L('doğum', 'born')} ${chart.input.day}.${chart.input.month}.${chart.input.year} ${chart.input.timeKnown ? `${chart.input.hour}:${String(chart.input.minute).padStart(2, '0')}` : L('(saat bilinmiyor)', '(time unknown)')}, ${profile.place}; ${L('cinsiyet', 'gender')} ${profile.gender ?? '-'}; ${L('ilişki durumu', 'relationship')} ${profile.rel ?? '-'}. ${L('Güneş', 'Sun')} ${SIGNS[P.sun.sign][lang]}, ${L('Ay', 'Moon')} ${SIGNS[P.moon.sign][lang]}${timed ? `, ${L('Yükselen', 'Rising')} ${SIGNS[Math.floor(chart.asc! / 30)][lang]}, MC ${SIGNS[Math.floor(chart.mc! / 30)][lang]}` : ''}, ${L('Venüs', 'Venus')} ${SIGNS[P.venus.sign][lang]}${timed ? ` (${P.venus.house}. ${L('ev', 'house')})` : ''}, Mars ${SIGNS[P.mars.sign][lang]}. ${L('Bugün', 'Today')}: ${now.toISOString().slice(0, 10)}.`;
  return { intent, paras, actions, facts: `${base}\n${paras.join('\n')}` };
}

/** Yapay zekâ için talimat: kullanıcının istediği danışman üslubu, yalnızca verilen hesaplara dayanarak */
export function advisorPrompt(lang: Lang, facts: string, history: { role: 'user' | 'assistant'; content: string }[], question: string): { role: 'user' | 'assistant'; content: string }[] {
  const instr = lang === 'tr'
    ? `Sen Kiron'sun: Sentor astroloji uygulamasının Batı astrolojisine ve öngörü tekniklerine derinlemesine hâkim yorumcusu. Doğum haritası, ikincil ilerletmeler, solar arc, primer direksiyonlar, Güneş ve Ay dönüşü, transitler ve tutulmalar, yıllık profeksiyonlar, drakonik harita ve horary mantığına hâkimsin.
Kurallar:
- YALNIZCA aşağıdaki HESAPLANMIŞ VERİLER bölümündeki tarihleri, konumları ve teknikleri kullan. Veride olmayan bir tarih, derece ya da yerleşim uydurma. Eksikse bunu açıkça söyle.
- Doğum saati bilinmiyorsa bunu belirt; saate bağlı teknikleri kullanma ve veride saat senaryosu varsa "şu koşulda X, şu koşulda Y" diye ayır.
- Teknikleri tek tek sıralamak yerine soruya en çok ışık tutanları birbirine bağlayarak sentez kur: büyük döngüler (profeksiyon, progresyon, solar arc, primer direksiyon) temayı, transitler ve tutulmalar tetikleyiciyi verir.
- Olası kırılma, açılım ya da yoğunlaşma dönemlerini ay ve yıl olarak belirt.
- Net, doğrudan, ağırbaşlı ve sezgisel bir dil kullan; boş dolgu cümle kurma; her paragraf yeni bir katman açsın. Sade Türkçe yaz, terimleri kısaca açıkla.
- En fazla 5 kısa paragraf. Sonunda tek cümlelik somut bir öneri ver.
- Astrolojinin bilimsel olarak kanıtlanmış bir yöntem olmadığını bil; kesin kader dili kullanma, eğilim ve olasılık dili kullan. Sağlık, hukuk ve para kararlarında profesyonele yönlendir.`
    : `You are Kiron, Sentor's astrologer, expert in Western predictive astrology (natal, secondary progressions, solar arc, primary directions, solar and lunar returns, transits and eclipses, profections, draconic, horary).
Rules: use ONLY the dates, placements and techniques in COMPUTED DATA; never invent. If birth time is unknown, say so and split scenarios. Synthesize the techniques that best answer the question: big cycles give the theme, transits and eclipses the trigger. Name months and years. Be direct, grave and intuitive, no filler, max 5 short paragraphs, end with one concrete suggestion. Speak in tendencies, not fate; refer health, legal and money decisions to professionals.`;
  const first = `${instr}\n\n${lang === 'tr' ? 'HESAPLANMIŞ VERİLER' : 'COMPUTED DATA'}:\n${facts}\n\n${lang === 'tr' ? 'SORU' : 'QUESTION'}: ${question}`;
  const prev = history.slice(-4);
  while (prev.length && prev[0].role !== 'user') prev.shift();
  return [...prev, { role: 'user', content: first }];
}
