// Kiron: Sentor'un sohbet botu. Yapay zekâ değildir: uygulamanın zaten hesapladığı her şeyi (hayat takvimi, profeksiyon,
// Güneş dönüşü, primer direksiyon, transitler, horary, "Kendini bul" cümleleri, ünlü ikizler, şehirler, matris, uyum…)
// sorulan soruya göre seçer ve kısa, sohbet diliyle özetler. Her cevabın altında ayrıntısının bulunduğu ekrana bağlantı vardır.
import type { Chart } from './astro';
import { computeChart } from './astro';
import { lifeTimeline, Window, Topic } from './timeline';
import { personCtx } from './person';
import { primaryDirections } from './primary';
import { castHorary } from './horary';
import { bestDays, personalLunarPhase } from './extras';
import { destinyMatrix } from './matrix';
import { yearReport } from '../content/lillyYear';
import { computeDaily, synastry } from '../content/forecast';
import { mirrorLines } from '../content/mirror';
import { marriageWindows, spouseProfile } from '../content/spouse';
import { celebTwins, cityPicks } from '../content/explore';
import { ARCANA } from '../content/arcana';
import { EVENTS } from '../content/lifeEvents';
import { QUESTIONS, VERDICT_TEXT, Q_LINE } from '../content/horaryText';
import { SIGNS, BODIES, HOUSES, SIGN_KEYWORDS } from '../content/base';
import { bigCities } from '../content/cities';
import type { Profile } from '../store';

type Lang = 'tr' | 'en';
export type Intent = 'year' | 'month' | 'today' | 'love' | 'marriage' | 'spouse' | 'career' | 'money' | 'home' | 'travel' | 'change'
  | 'self' | 'bigthree' | 'retro' | 'celeb' | 'city' | 'matrix' | 'compat' | 'bestday' | 'yesno' | 'thanks' | 'help';
export interface Action { label: string; to: string }
export interface Answer { intent: Intent; paras: string[]; actions: Action[]; suggest: string[] }

const has = (q: string, ...w: string[]) => w.some(x => q.includes(x));
export function detectIntent(raw: string): Intent {
  const q = ' ' + raw.toLocaleLowerCase('tr').normalize('NFC') + ' ';
  const yesno = /(^|\s)(mı|mi|mu|mü|mıyım|miyim|muyum|müyüm|mısın|misin|mıdır|midir)\s*\??\s*$/.test(q) || /\b(will i|should i|is it|am i)\b/.test(q);
  const when = has(q, 'ne zaman', 'when');
  if (has(q, 'teşekkür', 'sağol', 'sağ ol', 'eyvallah', 'thank')) return 'thanks';
  if (has(q, 'ünlü', 'celeb', 'ikiz')) return 'celeb';
  if (has(q, 'şehir', 'nerede yaşa', 'hangi ülke', 'city', 'where should i live')) return 'city';
  if (has(q, 'matris', 'arkana', 'matrix', 'tarot')) return 'matrix';
  if (has(q, 'retro', 'geri gid')) return 'retro';
  if (has(q, 'uyum', 'uyuşur', 'anlaşır', 'compat', 'match')) return 'compat';
  if (has(q, 'eşim', 'partnerim nasıl', 'nasıl biriyle', 'kiminle evlen', 'future spouse', 'who will i marry', 'my spouse')) return 'spouse';
  if (has(q, 'evlen', 'evlilik', 'nikah', 'nişan', 'marry', 'marriage', 'wedding')) return yesno && !when ? 'yesno' : 'marriage';
  if (has(q, 'hangi gün', 'iyi gün', 'en iyi gün', 'best day')) return 'bestday';
  if (yesno && !when && !has(q, 'nasıl', 'how', 'ne bekli')) return 'yesno';
  if (has(q, 'burcum', 'yükselen', 'ay burcu', 'büyük üçlü', 'my sign', 'rising', 'big three')) return 'bigthree';
  if (has(q, 'bugün', 'today', 'günüm')) return 'today';
  if (has(q, 'bu ay', 'aylık', 'this month')) return 'month';
  if (has(q, 'aşk', 'sevgili', 'ilişki', 'flört', 'love', 'relationship', 'dating')) return 'love';
  if (has(q, 'para', 'maaş', 'kazanç', 'borç', 'money', 'finance', 'income')) return 'money';
  if (has(q, 'kariyer', ' iş', 'işim', 'meslek', 'terfi', 'çalış', 'career', 'job', 'work', 'promotion')) return 'career';
  if (has(q, ' ev ', 'evim', 'taşın', 'aile', 'home', 'move', 'family')) return 'home';
  if (has(q, 'yolculuk', 'seyahat', 'yurt dışı', 'yurtdışı', 'eğitim', 'okul', 'travel', 'abroad', 'study')) return 'travel';
  if (has(q, 'değişim', 'dönüm', 'kriz', 'change', 'turning')) return 'change';
  if (has(q, 'ben kimim', 'kişilik', 'karakter', 'beni anlat', 'kendimi', 'nasıl biriyim', 'who am i', 'personality', 'describe me')) return 'self';
  if (has(q, 'yıl', 'sene', 'gelecek', 'ne bekli', 'year', 'future', '2027', '2028')) return 'year';
  return 'help';
}

const TOPIC: Record<Topic, [string, string]> = { love: ['aşk', 'love'], career: ['kariyer', 'career'], home: ['ev ve aile', 'home & family'], travel: ['yolculuk ve eğitim', 'travel & study'], change: ['büyük değişim', 'big change'] };
/** İlk anlamlı cümle: tırnak içinde bölünmez, "astrolojide şöyle okunur" gibi genel giriş cümlelerini atlar */
const first = (t: string) => {
  const parts = (t.match(/[^.!?]+[.!?]+["”’]?/g) ?? [t]).map(x => x.trim());
  const joined: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    let cur = parts[i];
    while ((cur.split('“').length - cur.split('”').length) > 0 && i + 1 < parts.length) cur += ' ' + parts[++i];
    joined.push(cur);
  }
  return joined.find(x => !/astrolojide|in astrology|astrolog(y|ers)/i.test(x)) ?? joined[0] ?? '';
};
const lc = (s: string) => s.charAt(0).toLocaleLowerCase('tr') + s.slice(1);
const uc = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1);

export function answer(intent: Intent, chart: Chart, profile: Profile, lang: Lang, question = '', people: Profile[] = []): Answer {
  const L = (tr: string, en: string) => (lang === 'tr' ? tr : en);
  const li = lang === 'tr' ? 0 : 1;
  const fmtM = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'long', year: 'numeric' }).format(d);
  const fmtD = (d: Date) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'long' }).format(d);
  const now = new Date();
  const when = (w: { start: Date; end: Date }) => {
    const a = w.start < now ? L('şu an', 'right now') : fmtM(w.start), b = fmtM(new Date(w.end.getTime() - 15 * 864e5));
    return a === b ? a : `${a} – ${b}`;
  };
  const timed = chart.asc !== null && chart.cusps.length === 12;
  const person = personCtx(profile);
  const all = () => lifeTimeline(chart, { fromAge: 16, toAge: 80, ...person });
  const name = profile.name?.split(' ')[0] || '';
  const rel = profile.rel ?? 'none';
  const paras: string[] = [];
  const actions: Action[] = [];
  let suggest: string[] = [];
  const say = (tr: string, en: string) => paras.push(L(tr, en));
  const go = (tr: string, en: string, to: string) => actions.push({ label: L(tr, en), to });
  const sug = (tr: string, en: string) => { suggest = L(tr, en).split('|'); };

  const power = (w: Window) => w.techs.length >= 4 ? L('çok güçlü', 'very strong') : w.techs.length === 3 ? L('güçlü', 'strong') : L('hafif', 'light');
  const gist = (w: Window) => {
    const k = rel === 'married' ? 'm' : rel === 'partner' ? 'p' : 's';
    const e = w.reasons.map(r => EVENTS[r.id] as any).find(x => x && (x[k] || x.all));
    const t = e?.[k]?.[lang] ?? e?.all?.[lang];
    if (!t) return '';
    const f = first(t);
    if (f.length >= 40) return f;
    const rest = t.slice(t.indexOf(f) + f.length).trim();
    return rest ? `${f} ${first(rest)}` : f;
  };
  const winShort = (w: Window) => `✦ ${uc(when(w))}: ${TOPIC[w.topic][li]} (${power(w)}${w.gen ? L(', yaşıtlarınla ortak', ', shared with your age group') : ''})${gist(w) ? ' — ' + lc(gist(w)) : ''}`;
  const upcoming = (topics: Topic[] | null, months: number, n: number) => {
    const until = now.getTime() + months * 30.44 * 864e5;
    return all().filter(w => (!topics || topics.includes(w.topic)) && w.end > now && w.start.getTime() < until).sort((a, b) => a.start.getTime() - b.start.getTime()).slice(0, n);
  };
  const pdSoon = (years: number, angles: string[]) => primaryDirections(chart).filter(d => d.date > now && d.date.getTime() < now.getTime() + years * 365.25 * 864e5 && angles.includes(d.angle))[0];
  const noTime = () => {
    if (timed) return;
    const sc = [6, 12, 18].map(h => `${h}:00 → ${SIGNS[Math.floor(computeChart({ ...chart.input, hour: h, minute: 0, timeKnown: true }).asc! / 30)][lang]}`);
    say(`Küçük not: doğum saatin yok, o yüzden ev ve yükselen hesaplarını atladım. Saatine göre yükselenin değişiyor: ${sc.join(', ')}.`, `Quick note: no birth time, so I skipped houses and rising. Your rising changes with time: ${sc.join(', ')}.`);
    go('Saat düzeltme', 'Rectification', 'chart:rectify');
  };

  switch (intent) {
    case 'year': {
      const yr = timed ? yearReport(chart, now) : null;
      if (yr) say(`Kısaca: ${yr.age} yaşın “${HOUSES[yr.profHouse - 1].short.tr.toLocaleLowerCase('tr')}” yılı. Bu yılın patronu ${BODIES[yr.lord].name.tr}.`, `In short: age ${yr.age} is your “${HOUSES[yr.profHouse - 1].short.en.toLowerCase()}” year. The year’s boss is ${BODIES[yr.lord].name.en}.`);
      const ws = upcoming(null, 13, 4);
      if (ws.length) { say('Takvimde işaretlediğim tarihler:', 'Dates I’ve marked on your calendar:'); ws.forEach(w => paras.push(winShort(w))); }
      else say('Önümüzdeki 12 ay sakin görünüyor; büyük sarsıntı yok, inşa etme yılı.', 'The next 12 months look calm; no big shake-ups, a year for building.');
      const pd = pdSoon(1.5, ['asc', 'mc', 'dsc', 'ic']);
      if (pd) say(`Bonus: ${fmtM(pd.date)} civarı ${BODIES[pd.prom].name.tr} haritanın bir köşesine oturuyor; hayatında gözle görülür bir adım demek.`, `Bonus: around ${fmtM(pd.date)} ${BODIES[pd.prom].name.en} reaches one of your angles; a visible step in life.`);
      go('Önemli dönemler', 'Key periods', 'chart:timeline');
      sug('Peki aşkta?|Kariyerde ne var?|Bu ay nasıl?', 'And in love?|What about career?|This month?');
      noTime();
      break;
    }
    case 'month': {
      const ws = upcoming(null, 2, 3);
      say(ws.length ? 'Bu ay ve gelecek ay öne çıkanlar:' : 'Bu ay pek bir şey yok, sakin bir akış. Rutinine odaklan.', ws.length ? 'Highlights this month and next:' : 'Not much this month, a calm flow. Focus on your routine.');
      ws.forEach(w => paras.push(winShort(w)));
      const bc = bestDays(chart, 'career', 30)[0], bl = bestDays(chart, 'love', 30)[0];
      if (bc || bl) say(`Takvimine yaz: ${[bc && `iş için ${fmtD(bc.date)}`, bl && `aşk için ${fmtD(bl.date)}`].filter(Boolean).join(', ')}.`, `Save the date: ${[bc && `work on ${fmtD(bc.date)}`, bl && `love on ${fmtD(bl.date)}`].filter(Boolean).join(', ')}.`);
      go('Ay dönüşü', 'Lunar return', 'chart:lunarReturn');
      sug('Bugün nasıl?|En iyi günlerim|Bu yıl', 'How is today?|My best days|This year');
      break;
    }
    case 'today': {
      const d = computeDaily(chart, now), pm = personalLunarPhase(chart, now);
      say(`Bugün Ay ${SIGNS[d.moonSign].tr} burcunda. Senin kişisel döngünde “${lc(pm.phase.name.tr)}” evresindesin: ${lc(first(pm.phase.text.tr))}`, `Today the Moon is in ${SIGNS[d.moonSign].en}. In your personal cycle you’re in the “${pm.phase.name.en.toLowerCase()}” phase: ${lc(first(pm.phase.text.en))}`);
      const sc = d.scores;
      say(`Puanların: aşk ${sc.love}/5, kariyer ${sc.career}/5, enerji ${sc.energy}/5, ruh hâli ${sc.mood}/5.`, `Your scores: love ${sc.love}/5, career ${sc.career}/5, energy ${sc.energy}/5, mood ${sc.mood}/5.`);
      const best = (Object.entries(sc) as [keyof typeof sc, number][]).sort((a, b) => b[1] - a[1])[0][0];
      const tip: Record<string, [string, string]> = { love: ['Bugün kalbe dair bir adım atmak için iyi.', 'A good day for a step of the heart.'], career: ['Bugün işini görünür kılmak için iyi.', 'A good day to make your work visible.'], energy: ['Enerjin yüksek; ertelediğin bir işi bitir.', 'Energy is high; finish something you postponed.'], mood: ['Ruh hâlin iyi; sevdiklerinle vakit geçir.', 'Your mood is good; spend time with loved ones.'] };
      paras.push(tip[best][li]);
      if (d.retrogrades.includes('mercury')) say('Merkür retroda: önemli mesajları göndermeden önce bir kez daha oku.', 'Mercury is retrograde: reread important messages before sending.');
      go('Bugün ekranı', 'Today screen', 'today');
      sug('Bu ay nasıl?|Retro var mı?|Aşk hayatım', 'This month?|Any retrogrades?|My love life');
      break;
    }
    case 'love': {
      const ml = mirrorLines(chart).find(m => m.cat === 'love');
      if (ml) say(`Aşkta sen şöylesin: ${lc(first(ml.text.tr))}`, `In love, you’re like this: ${lc(first(ml.text.en))}`);
      const ws = upcoming(['love'], 36, 2);
      if (ws.length) { say('Sıradaki aşk dönemlerin:', 'Your next love periods:'); ws.forEach(w => paras.push(winShort(w))); }
      else say('Yakında güçlü bir aşk dönemi görünmüyor; bu, kendine yatırım yapma zamanı.', 'No strong love period soon; time to invest in yourself.');
      const bd = bestDays(chart, 'love', 30).slice(0, 2);
      if (bd.length) say(`Buluşma için önümüzdeki iyi günler: ${bd.map(x => fmtD(x.date)).join(' ve ')}.`, `Good days ahead for a date: ${bd.map(x => fmtD(x.date)).join(' and ')}.`);
      go('Gelecekteki eşin', 'Future spouse', 'love:spouse');
      sug('Ne zaman evlenirim?|Eşim nasıl biri?|Uyumumuz nasıl?', 'When will I marry?|What is my spouse like?|Our compatibility');
      noTime();
      break;
    }
    case 'marriage': {
      const mw = marriageWindows(chart, now, 3, undefined, person);
      if (mw.length) {
        const [top, ...rest] = [...mw].sort((a, b) => b.techs.length - a.techs.length || b.score - a.score);
        say(`En güçlü evlilik pencereni ${when(top)} olarak görüyorum (${top.techs.length} teknik aynı yeri gösteriyor).`, `I see your strongest marriage window as ${when(top)} (${top.techs.length} techniques point there).`);
        if (rest.length) say(`Yedekte: ${rest.map(w => when(w)).join(', ')}.`, `Backups: ${rest.map(w => when(w)).join(', ')}.`);
        if (top.calib) say('Bu tarihte, geçmişte senin için tutmuş işaretler de var; güvenim yüksek.', 'This date also carries signs that worked for you before; I’m fairly confident.');
      } else say('Önümüzdeki yıllarda belirgin bir evlilik penceresi çıkmadı.', 'No clear marriage window in the coming years.');
      if (!(profile.events ?? []).some(e => e.type === 'love')) say('İpucu: geçmişte bir ilişkinin başladığı tarihi eklersen tahminimi sana göre ayarlarım.', 'Tip: add a past relationship date and I’ll tune this to you.');
      go('Ayrıntılar', 'Details', 'love:spouse');
      sug('Eşim nasıl biri?|Aşk hayatım|Uyumumuz nasıl?', 'What is my spouse like?|My love life|Our compatibility');
      noTime();
      break;
    }
    case 'spouse': {
      const sp = spouseProfile(chart, lang);
      if (sp) { say('Haritana göre eşin hakkında kısaca:', 'Briefly, about your spouse:'); sp.slice(0, 3).forEach(s => paras.push(`✦ ${s.title[lang].replace(/[?:]\s*$/, '')}: ${first(s.text[lang])}`)); }
      else say('Eşini anlatmam için doğum saatin lazım; 7. evin burcu saate bağlı.', 'I need your birth time to describe your spouse; the 7th house depends on it.');
      go('Gelecekteki eşin', 'Future spouse', 'love:spouse');
      sug('Ne zaman evlenirim?|Aşk hayatım', 'When will I marry?|My love life');
      noTime();
      break;
    }
    case 'career': case 'money': {
      if (timed && chart.mc !== null) { const s = Math.floor(chart.mc / 30); say(`Kariyer noktan ${SIGNS[s].tr}: işinde ${lc(SIGN_KEYWORDS[s].tr)} öne çıkıyor.`, `Your career point is ${SIGNS[s].en}: ${SIGN_KEYWORDS[s].en.toLowerCase()} stand out in your work.`); }
      const ml = mirrorLines(chart).find(m => m.cat === 'work');
      if (ml) paras.push(first(ml.text[lang]));
      const ws = upcoming(['career'], 36, 2);
      if (ws.length) { say('Sıradaki kariyer dönemlerin:', 'Your next career periods:'); ws.forEach(w => paras.push(winShort(w))); }
      const pd = pdSoon(6, ['mc']);
      if (pd) say(`Uzun vadede: ${fmtM(pd.date)} civarı ${BODIES[pd.prom].name.tr} kariyer noktana ulaşıyor.`, `Long term: around ${fmtM(pd.date)} ${BODIES[pd.prom].name.en} reaches your career point.`);
      const bd = bestDays(chart, 'career', 30).slice(0, 2);
      if (bd.length) say(`Görüşme ya da imza için: ${bd.map(x => fmtD(x.date)).join(' ve ')}.`, `For an interview or signing: ${bd.map(x => fmtD(x.date)).join(' and ')}.`);
      go('Portföy', 'Portfolio', 'portfolio');
      sug('Bu yıl|Bu işe girecek miyim?|Hangi şehir bana iyi gelir?', 'This year|Will I get this job?|Which city suits me?');
      noTime();
      break;
    }
    case 'home': case 'travel': case 'change': {
      const t: Topic = intent;
      const ws = upcoming([t], 36, 3);
      if (ws.length) { say(`${uc(TOPIC[t][0])} için işaretlediğim tarihler:`, `Dates I’ve marked for ${TOPIC[t][1]}:`); ws.forEach(w => paras.push(winShort(w))); }
      else say('Yakın vadede bu konuda büyük bir hareket görünmüyor.', 'No big movement on this soon.');
      go('Önemli dönemler', 'Key periods', 'chart:timeline');
      sug('Bu yıl|Hangi şehir bana iyi gelir?', 'This year|Which city suits me?');
      noTime();
      break;
    }
    case 'self': {
      const ms = mirrorLines(chart);
      say('Haritan senin hakkında bana şunları fısıldıyor:', 'Your chart whispers this about you:');
      ms.slice(0, 3).forEach(m => paras.push(`✦ ${first(m.text[lang])}`));
      say(`Kendini bul’da kaydırabileceğin ${ms.length} cümle var.`, `There are ${ms.length} lines to swipe in Find yourself.`);
      go('Kendini bul', 'Find yourself', 'explore:mirror');
      sug('Burcum ne?|Ünlü ikizim kim?|Aşkta nasılım?', 'What are my signs?|Who is my celebrity twin?|How am I in love?');
      break;
    }
    case 'bigthree': {
      const P = chart.positions, a = timed ? Math.floor(chart.asc! / 30) : -1;
      say(`Güneşin ${SIGNS[P.sun.sign].tr}, Ayın ${SIGNS[P.moon.sign].tr}${timed ? `, yükselenin ${SIGNS[a].tr}` : ''}.`, `Your Sun is ${SIGNS[P.sun.sign].en}, Moon ${SIGNS[P.moon.sign].en}${timed ? `, rising ${SIGNS[a].en}` : ''}.`);
      say(`Yani özünde ${lc(SIGN_KEYWORDS[P.sun.sign].tr)}; içinde ${lc(SIGN_KEYWORDS[P.moon.sign].tr)}${timed ? `; dışarıdan ise ${lc(SIGN_KEYWORDS[a].tr)}` : ''}.`, `So at your core: ${SIGN_KEYWORDS[P.sun.sign].en.toLowerCase()}; inside: ${SIGN_KEYWORDS[P.moon.sign].en.toLowerCase()}${timed ? `; on the outside: ${SIGN_KEYWORDS[a].en.toLowerCase()}` : ''}.`);
      go('Doğum haritan', 'Birth chart', 'chart');
      sug('Beni anlat|Ünlü ikizim kim?', 'Describe me|Who is my celebrity twin?');
      noTime();
      break;
    }
    case 'retro': {
      const r = computeDaily(chart, now).retrogrades;
      if (!r.length) say('Şu an geri giden gezegen yok, yollar açık!', 'No planets retrograde right now, the roads are clear!');
      else say(`Şu an geri gidenler: ${r.map(p => BODIES[p].name.tr).join(', ')}.${r.includes('mercury') ? ' Merkür de aralarında: sözleşmeleri ve mesajları iki kez kontrol et.' : r.includes('venus') ? ' Venüs retroda: eski aşklar gündeme gelebilir.' : ' Kişisel gezegenler düz gidiyor, günlük işler rahat.'}`, `Retrograde now: ${r.map(p => BODIES[p].name.en).join(', ')}.${r.includes('mercury') ? ' Mercury too: double-check contracts and messages.' : r.includes('venus') ? ' Venus is retrograde: exes may resurface.' : ' Personal planets are direct, daily life is smooth.'}`);
      go('Şimdiki gökyüzü', 'Sky now', 'chart:now');
      sug('Bugün nasıl?|Bu ay', 'How is today?|This month');
      break;
    }
    case 'celeb': {
      const tw = celebTwins(chart, chart.input).slice(0, 3);
      say(`Ünlü ikizlerin: ${tw.map(t => `${t.name} (%${t.score})`).join(', ')}.`, `Your celebrity twins: ${tw.map(t => `${t.name} (${t.score}%)`).join(', ')}.`);
      if (tw[0]?.reasons.length) say(`${tw[0].name} ile ortak noktanız: ${tw[0].reasons.slice(0, 2).map(r => lc(r.tr)).join(', ')}.`, `What you share with ${tw[0].name}: ${tw[0].reasons.slice(0, 2).map(r => r.en.toLowerCase()).join(', ')}.`);
      go('Ünlü ikizin', 'Celebrity twins', 'explore:twin');
      sug('Beni anlat|Hangi şehir bana iyi gelir?', 'Describe me|Which city suits me?');
      break;
    }
    case 'city': {
      if (!timed) { say('Şehir önerisi için doğum saatin lazım; gezegen çizgileri saate bağlı.', 'I need your birth time for city picks; planet lines depend on it.'); go('Saat düzeltme', 'Rectification', 'chart:rectify'); break; }
      const picks = cityPicks(chart, bigCities()).filter(p => p.good).slice(0, 3);
      say(picks.length ? `Sana iyi gelecek şehirler: ${picks.map(p => `${p.city} (${lc(p.theme.tr)})`).join(', ')}.` : 'Belirgin bir şehir çıkmadı.', picks.length ? `Cities that suit you: ${picks.map(p => `${p.city} (${p.theme.en.toLowerCase()})`).join(', ')}.` : 'No clear city came up.');
      if (picks[0]) paras.push(first(picks[0].why[lang]));
      go('Şehirlerin', 'Your cities', 'explore:cities');
      sug('Kariyerim|Bu yıl', 'My career|This year');
      break;
    }
    case 'matrix': {
      const m = destinyMatrix(chart.input.day, chart.input.month, chart.input.year);
      say(`Kader matrisinde ana kartın ${ARCANA[m.E].name.tr}, kişilik kartın ${ARCANA[m.A].name.tr}.`, `In your destiny matrix your core card is ${ARCANA[m.E].name.en}, personality card ${ARCANA[m.A].name.en}.`);
      go('Matris', 'Matrix', 'matrix');
      sug('Beni anlat|Ünlü ikizim kim?', 'Describe me|Who is my celebrity twin?');
      break;
    }
    case 'compat': {
      const others = people.filter(p => p.id !== profile.id);
      const q = question.toLocaleLowerCase('tr');
      const other = others.find(p => p.name && q.includes(p.name.toLocaleLowerCase('tr').split(' ')[0])) ?? others[0];
      if (!other) { say('Uyuma bakmam için önce birini eklemen lazım. Aşk → Biriyle uyum’dan ekleyebilirsin.', 'Add someone first so I can check compatibility: Love → Compatibility.'); go('Biriyle uyum', 'Compatibility', 'love:compat'); break; }
      let oc: Chart | null = null; try { oc = computeChart(other.birth); } catch { oc = null; }
      if (!oc) break;
      const sy = synastry(chart, oc);
      const PART: Record<string, [string, string]> = { attraction: ['çekim', 'attraction'], emotional: ['duygusal bağ', 'emotional bond'], communication: ['iletişim', 'communication'], longterm: ['uzun vade', 'long term'] };
      const sorted = [...sy.parts].sort((a, b) => b.score - a.score);
      say(`${other.name || 'O'} ile uyumunuz %${sy.total}. En güçlü yanınız ${PART[sorted[0].key][0]}, üzerinde çalışmanız gereken ${PART[sorted[sorted.length - 1].key][0]}.`, `You and ${other.name || 'them'}: ${sy.total}% match. Strongest: ${PART[sorted[0].key][1]}; to work on: ${PART[sorted[sorted.length - 1].key][1]}.`);
      if (sy.aspects[0]) paras.push(first(sy.aspects[0].text[lang]));
      go('Uyum ayrıntısı', 'Compatibility details', `love:compat:${other.id}`);
      sug('Ne zaman evlenirim?|Aşk hayatım', 'When will I marry?|My love life');
      break;
    }
    case 'bestday': {
      const bl = bestDays(chart, 'love', 30).slice(0, 2), bc = bestDays(chart, 'career', 30).slice(0, 2);
      say(`Önümüzdeki 30 gün için takvimin: aşk ve buluşma ${bl.map(x => fmtD(x.date)).join(', ') || '—'}; iş ve imza ${bc.map(x => fmtD(x.date)).join(', ') || '—'}.`, `Your next 30 days: love & dates ${bl.map(x => fmtD(x.date)).join(', ') || '—'}; work & signing ${bc.map(x => fmtD(x.date)).join(', ') || '—'}.`);
      go('Bugün ekranı', 'Today screen', 'today');
      sug('Bugün nasıl?|Bu ay', 'How is today?|This month');
      break;
    }
    case 'yesno': {
      const key = /evlen|evlilik|nikah|nişan|ilişki|sevgili|aşk|marr|love/i.test(question) ? 'love' : /yaz|dön|ara|mesaj|text|call|back/i.test(question) ? 'contact' : /iş|terfi|kariyer|job|promot/i.test(question) ? 'career' : /para|maaş|money/i.test(question) ? 'money' : /ev|taşın|home|move/i.test(question) ? 'home' : /yolculuk|seyahat|yurt|travel|abroad/i.test(question) ? 'travel' : /okul|sınav|kabul|study|exam/i.test(question) ? 'study' : 'wish';
      const qq = QUESTIONS.find(x => x.key === key) ?? QUESTIONS[QUESTIONS.length - 1];
      const r = castHorary(now, chart.input.lat, chart.input.lon, qq.house);
      const v = VERDICT_TEXT[r.verdict];
      say(`Bu anın haritasına baktım. Kısa cevap: ${lc(v.title.tr)}.`, `I looked at the chart of this moment. Short answer: ${v.title.en.toLowerCase()}.`);
      const ql = Q_LINE[key]?.[v.tone]?.[lang];
      if (ql) paras.push(ql);
      if (r.timing) { const d = new Date(now.getTime() + r.timing.days * 864e5); say(`Zamanlama: ${fmtD(d)} civarı.`, `Timing: around ${fmtD(d)}.`); }
      go('Soru sor ekranı', 'Ask screen', 'ask');
      sug('Bu yıl|Aşk hayatım', 'This year|My love life');
      break;
    }
    case 'thanks': say('Rica ederim ✦ Başka ne merak ediyorsun?', 'You’re welcome ✦ What else are you curious about?'); break;
    default:
      say(`${name ? name + ', ' : ''}bunu tam anlayamadım. Bana şunları sorabilirsin: bu yıl, bu ay, bugün, aşk, ne zaman evleneceğin, eşinin nasıl biri olduğu, kariyer, para, burcun, ünlü ikizin, sana iyi gelen şehir, retrolar ya da “… olacak mı?” gibi evet/hayır soruları.`,
        `${name ? name + ', ' : ''}I didn’t quite get that. You can ask me about this year, this month, today, love, when you’ll marry, your spouse, career, money, your signs, celebrity twin, best city, retrogrades, or yes/no questions.`);
  }
  if (!suggest.length) sug('Bu yıl beni ne bekliyor?|Aşk hayatım|Bugün nasıl?', 'What does this year hold?|My love life|How is today?');
  return { intent, paras, actions, suggest };
}
