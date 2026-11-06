import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { useStore } from '../store';
import { destinyMatrix, compatMatrix, healthMap, ageMap, Matrix } from '../engine/matrix';
import { COUPLE, COUPLE_INTRO, COUPLE_POS, buildCouple } from '../content/coupleArcana';
import { ARCANA, POS, CHAKRA, MxPos, mxStory, SECTION_INTRO, ADVICE } from '../content/arcana';
import { Chips, Expand, H1, H3, P, Section, Segmented, Sub, st, useLayout } from '../ui/kit';
import { C, F } from '../theme';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const lowFirstTr = (s: string) => (s[0] === 'İ' ? 'i' : s[0] === 'I' ? 'ı' : s[0].toLocaleLowerCase('tr')) + s.slice(1);

// ---------------- Diyagram ----------------
function MatrixChart({ m, size, lang }: { m: Matrix; size: number; lang: Lang }) {
  const k = size / 400;
  const P_ = (x: number, y: number) => [x * k, y * k] as const;
  const corners: [number, number][] = [[40, 200], [87, 87], [200, 40], [313, 87], [360, 200], [313, 313], [200, 360], [87, 313]];
  const ages = ageMap(m);
  type Dot = { x: number; y: number; n: number; r: number; fill: string; ink: string; stroke?: string; label?: string };
  const dot = (x: number, y: number, n: number, r: number, fill: string, ink: string, stroke?: string): Dot => ({ x, y, n, r, fill, ink, stroke });
  const dots: Dot[] = [
    // ata karesi
    dot(87, 87, m.F, 17, C.card, C.ink, C.ink), dot(313, 87, m.G, 17, C.card, C.ink, C.ink), dot(313, 313, m.H, 17, C.card, C.ink, C.ink), dot(87, 313, m.I, 17, C.card, C.ink, C.ink),
    dot(113, 113, m.F1, 11, C.bg, C.ink, C.line), dot(287, 113, m.G1, 11, C.bg, C.ink, C.line), dot(287, 287, m.H1, 11, C.bg, C.ink, C.line), dot(113, 287, m.I1, 11, C.bg, C.ink, C.line),
    dot(140, 140, m.F2, 11, C.bg, C.ink, C.line), dot(260, 140, m.G2, 11, C.bg, C.ink, C.line), dot(260, 260, m.H2, 11, C.bg, C.ink, C.line), dot(140, 260, m.I2, 11, C.bg, C.ink, C.line),
    // kişisel kare kolları
    dot(84, 200, m.A2, 13, C.bg, C.ink, C.rose), dot(122, 200, m.A1, 13, C.bg, C.ink, C.rose), dot(160, 200, m.AH, 11, C.bg, C.ink, C.line),
    dot(200, 84, m.B2, 13, C.bg, C.ink, C.rose), dot(200, 122, m.B1, 13, C.bg, C.ink, C.rose), dot(200, 160, m.BH, 11, C.bg, C.ink, C.line),
    dot(316, 200, m.C2, 13, C.bg, C.ink, C.rose), dot(278, 200, m.C1, 13, C.bg, C.ink, C.rose),
    dot(200, 316, m.D2, 13, C.bg, C.danger, C.danger), dot(200, 278, m.D1, 13, C.bg, C.danger, C.danger),
    // aşk – para
    dot(239, 239, m.X, 12, C.bg, C.ink, C.gold), dot(259, 219, m.money, 12, C.earth, C.bg), dot(219, 259, m.love, 12, C.second, C.bg),
    // köşeler
    dot(40, 200, m.A, 21, C.rose, C.onAccent), dot(200, 40, m.B, 21, C.rose, C.onAccent), dot(360, 200, m.C, 21, C.rose, C.onAccent), dot(200, 360, m.D, 21, C.danger, C.bg),
    dot(200, 200, m.E, 25, C.gold, C.bg),
  ];
  // yaş noktaları: köşeler arasında 7 ara nokta
  const ageDots: { x: number; y: number; n: number; age: number }[] = [];
  for (let e = 0; e < 8; e++) {
    const [x1, y1] = corners[e], [x2, y2] = corners[(e + 1) % 8];
    for (let j = 1; j < 8; j++) {
      const t = j / 8; const px = x1 + (x2 - x1) * t, py = y1 + (y2 - y1) * t;
      const dx = px - 200, dy = py - 200, d = Math.hypot(dx, dy);
      ageDots.push({ x: px + (dx / d) * 13, y: py + (dy / d) * 13, n: ages[e * 8 + j].arcana, age: ages[e * 8 + j].age });
    }
  }
  const cornerAges = corners.map(([x, y], i) => { const dx = x - 200, dy = y - 200, d = Math.hypot(dx, dy); return { x: x + (dx / d) * 34, y: y + (dy / d) * 34, label: `${i * 10}` }; });
  return (
    <Svg width={size} height={size} viewBox={`-30 -30 460 460`} accessibilityLabel={tx('Kader matrisi diyagramı', 'Destiny matrix diagram', lang)}>
      <G>
        <Polygon points="87,87 313,87 313,313 87,313" fill="none" stroke={C.line} strokeWidth={1.5} />
        <Polygon points="40,200 200,40 360,200 200,360" fill="none" stroke={C.sub} strokeWidth={1.5} />
        <Circle cx={200} cy={200} r={160} fill="none" stroke={C.line} strokeWidth={1} strokeDasharray="2 5" />
        <Line x1={40} y1={200} x2={360} y2={200} stroke={C.line} strokeWidth={1} />
        <Line x1={200} y1={40} x2={200} y2={360} stroke={C.line} strokeWidth={1} />
        <Line x1={87} y1={87} x2={313} y2={313} stroke={C.line} strokeWidth={1} />
        <Line x1={313} y1={87} x2={87} y2={313} stroke={C.line} strokeWidth={1} />
        <Line x1={278} y1={200} x2={200} y2={278} stroke={C.gold} strokeWidth={1.5} />
        {ageDots.map((a, i) => <SvgText key={i} x={a.x} y={a.y + 3} fontSize={9} fill={C.sub} textAnchor="middle">{a.n}</SvgText>)}
        {cornerAges.map((a, i) => <SvgText key={'c' + i} x={a.x} y={a.y + 4} fontSize={10} fill={C.gold} fontWeight="700" textAnchor="middle">{a.label}</SvgText>)}
        {dots.map((d, i) => (
          <G key={i}>
            <Circle cx={d.x} cy={d.y} r={d.r} fill={d.fill} stroke={d.stroke ?? 'none'} strokeWidth={1.5} />
            <SvgText x={d.x} y={d.y + (d.r > 18 ? 6 : 4)} fontSize={d.r > 18 ? 17 : d.r > 12 ? 12 : 11} fontWeight="700" fill={d.ink} textAnchor="middle">{d.n}</SvgText>
          </G>
        ))}
        <SvgText x={259} y={196} fontSize={10} fill={C.earth} textAnchor="middle">$</SvgText>
        <SvgText x={196} y={262} fontSize={11} fill={C.second} textAnchor="end">♥</SvgText>
      </G>
    </Svg>
  );
}

// ---------------- Ekran ----------------
type View_ = 'reading' | 'health' | 'ages';
export default function MatrixScreen() {
  const { lang, people, profile } = useStore();
  const { inner, twoCol } = useLayout();
  const [pid, setPid] = useState(profile?.id ?? '');
  const [pair, setPair] = useState<string>('none');
  const [view, setView] = useState<View_>('reading');
  const person = people.find(p => p.id === pid) ?? profile!;
  const partner = people.find(p => p.id === pair) ?? null;
  const m = useMemo(() => {
    const a = destinyMatrix(person.birth.day, person.birth.month, person.birth.year);
    if (!partner) return a;
    return compatMatrix(a, destinyMatrix(partner.birth.day, partner.birth.month, partner.birth.year));
  }, [person, partner]);
  const hm = useMemo(() => healthMap(m), [m]);
  const ages = useMemo(() => ageMap(m), [m]);
  const now = new Date();
  const age = (now.getTime() - Date.UTC(person.birth.year, person.birth.month - 1, person.birth.day)) / (365.2425 * 864e5);
  const curIdx = Math.max(0, Math.min(ages.length - 1, ages.findIndex((a, i) => age >= a.age && (i === ages.length - 1 || age < ages[i + 1].age))));
  const an = (n: number) => `${n} ${ARCANA[n].name[lang]}`;
  const date = `${String(person.birth.day).padStart(2, '0')}.${String(person.birth.month).padStart(2, '0')}.${person.birth.year}`;

  const Item = ({ pos, n, label, explain }: { pos: MxPos; n: number; label?: string; explain?: boolean }) => (
    <View style={{ marginBottom: 22 }}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold, marginBottom: 2 }}>{label ?? POS[pos].title[lang]}</Text>
      <H3 style={{ fontSize: 22, lineHeight: 28 }}>{an(n)}</H3>
      <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 6, maxWidth: 660 }}>{mxStory(pos, n, { explain })[lang]}</Text>
    </View>
  );
  const Intro = ({ k }: { k: keyof typeof SECTION_INTRO }) => (
    <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 18, lineHeight: 27, color: C.sub, marginBottom: 18, maxWidth: 640 }}>{SECTION_INTRO[k][lang]}</Text>
  );

  const diagramSize = twoCol ? 480 : Math.min(inner(760), 520);
  const diagram = (
    <View style={{ alignItems: 'center', marginBottom: 20 }}>
      <MatrixChart m={m} size={diagramSize} lang={lang} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', marginTop: 4 }}>
        {[[C.rose, tx('Kişisel kare', 'Personal square', lang)], [C.gold, tx('Merkez', 'Centre', lang)], [C.danger, tx('Karmik kuyruk', 'Karmic tail', lang)], [C.second, tx('Aşk', 'Love', lang)], [C.earth, tx('Para', 'Money', lang)]].map(([c, t]) => (
          <View key={t} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: c }} /><Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub }}>{t}</Text>
          </View>
        ))}
      </View>
      {partner ? null : <Sub style={{ marginTop: 6, textAlign: 'center' }}>{tx('Dış çemberdeki küçük sayılar yaş haritasıdır; altın sayılar yaşı gösterir.', 'Small numbers on the outer ring are the age map; gold numbers mark the age.', lang)}</Sub>}
    </View>
  );

  const reading = (
    <View>
      <Section title={tx('Ana enerjilerin', 'Your core energies', lang)}>
        <Intro k="core" />
        <Item pos="A" n={m.A} /><Item pos="B" n={m.B} /><Item pos="C" n={m.C} /><Item pos="D" n={m.D} label={tx('Bu hayattaki görevin', 'Your task in this life', lang)} /><Item pos="E" n={m.E} />
      </Section>
      <Section title={tx('Karmik kuyruğun', 'Your karmic tail', lang)}>
        <Intro k="tail" />
        <Text style={{ fontFamily: F.serif, fontSize: 34, color: C.danger, marginBottom: 8 }}>{m.tail[2]}-{m.tail[1]}-{m.tail[0]}</Text>
        <P style={{ marginBottom: 18, maxWidth: 640 }}>{lang === 'tr'
          ? `Kuyruk üç sayıdan oluşur ve merkezden dışa doğru okunur: ${m.tail[2]} geçmişten getirdiğin temayı, ${m.tail[1]} bu temayı bugün nasıl yaşadığını, ${m.tail[0]} ise dersi çözdüğünde varacağın yeri anlatır.`
          : `The tail has three numbers read from the centre outward: ${m.tail[2]} is the theme you carry from the past, ${m.tail[1]} how you live it today, and ${m.tail[0]} where you arrive once the lesson is resolved.`}</P>
        <Item pos="tail" n={m.D1} explain={false} label={tx('Geçmişten getirdiğin tema', 'The theme you carry from the past', lang)} />
        <Item pos="tail" n={m.D2} explain={false} label={tx('Bugün nasıl yaşıyorsun', 'How you live it today', lang)} />
        <Item pos="D" n={m.D} explain={false} label={tx('Çözüldüğünde varacağın yer', 'Where you arrive once resolved', lang)} />
      </Section>
      <Section title={tx('Yeteneklerin', 'Your talents', lang)}>
        <Intro k="talent" />
        <Item pos="talent" n={m.B2} explain={false} label={tx('Doğuştan getirdiğin yetenek', 'The gift you were born with', lang)} />
        <Item pos="talent" n={m.B1} explain={false} label={tx('Geliştirdikçe açılan yetenek', 'The gift that opens as you develop it', lang)} />
      </Section>
      <Section title={tx('Aşk ve para', 'Love and money', lang)}>
        <Intro k="lovemoney" />
        <Item pos="love" n={m.love} /><Item pos="money" n={m.money} /><Item pos="X" n={m.X} />
      </Section>
      <Section title={tx('Hayat amaçların', 'Your life purposes', lang)}>
        <Intro k="purpose" />
        {(['personal', 'social', 'spiritual', 'planetary'] as MxPos[]).map(k => {
          const n = (m as any)[k] as number;
          return (
            <View key={k} style={{ marginBottom: 22 }}>
              <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold, marginBottom: 2 }}>{POS[k].title[lang]}</Text>
              <H3 style={{ fontSize: 22, lineHeight: 28 }}>{an(n)}</H3>
              <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 6, maxWidth: 660 }}>
                {POS[k].what[lang]} {lang === 'tr' ? `Bu dönemin enerjisi ${ARCANA[n].name.tr}: ${ARCANA[n].key.tr}.` : `This period’s energy is ${ARCANA[n].name.en}: ${ARCANA[n].key.en}.`} {ARCANA[n].plus[lang]} {ADVICE[n][lang]}
              </Text>
            </View>
          );
        })}
        <Sub style={{ maxWidth: 640 }}>{lang === 'tr'
          ? `Kişisel amacın iki çizgiden doğar: gök çizgisi (${an(m.sky)}) ruhsal değerlerini, yer çizgisi (${an(m.earth)}) ise maddi becerilerini anlatır.`
          : `Your personal purpose comes from two lines: the sky line (${an(m.sky)}) for spiritual values and the earth line (${an(m.earth)}) for practical skills.`}</Sub>
      </Section>
      <Section title={tx('Ailenden gelen enerjiler', 'Energies from your family', lang)}>
        <Intro k="ancestry" />
        {([[m.F, m.H, tx('Baba tarafın', 'Your father’s side', lang), m.male], [m.G, m.I, tx('Anne tarafın', 'Your mother’s side', lang), m.female]] as [number, number, string, number][]).map(([x, y, label, line]) => (
          <View key={label} style={{ marginBottom: 22 }}>
            <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold, marginBottom: 2 }}>{label}</Text>
            <H3 style={{ fontSize: 22, lineHeight: 28 }}>{an(x)} {lang === 'tr' ? 've' : 'and'} {an(y)}</H3>
            <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 6, maxWidth: 660 }}>
              {lang === 'tr'
                ? `Bu taraftan sana iki güç geçmiş. ${ARCANA[x].name.tr}: ${lowFirstTr(ARCANA[x].plus.tr)} ${ARCANA[y].name.tr} ise şunu getirir: ${lowFirstTr(ARCANA[y].plus.tr)} Bu soyun sana bıraktığı ders ise ${ARCANA[line].name.tr} enerjisiyle ilgili: ${lowFirstTr(ARCANA[line].karma.tr.replace(/^Ders: /, ''))}`
                : `Two strengths come to you from this side. ${ARCANA[x].name.en}: ${ARCANA[x].plus.en} ${ARCANA[y].name.en} adds this: ${ARCANA[y].plus.en} The lesson this line leaves you relates to ${ARCANA[line].name.en}: ${ARCANA[line].karma.en.replace(/^The lesson: /, '')}`}
            </Text>
          </View>
        ))}
      </Section>
    </View>
  );

  const cr = partner ? buildCouple(m as any) : null;
  const coupleReading = cr ? (
    <View>
      <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 18, lineHeight: 27, color: C.sub, marginBottom: 18, maxWidth: 640 }}>{COUPLE_INTRO[lang]}</Text>
      {cr.summary ? (
        <View style={[st.panel, { marginBottom: 24, backgroundColor: C.goldSoft, borderColor: C.goldSoft }]}>
          <Text style={{ fontFamily: F.serif, fontSize: 22, color: C.ink, marginBottom: 6 }}>{tx('İlişkinizin ana teması', 'The main theme of your relationship', lang)}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, maxWidth: 660 }}>{cr.summary[lang]}</Text>
        </View>
      ) : null}
      {cr.sections.map(sec => (
        <Section key={sec.title.tr} title={sec.title[lang]}>
          {sec.title.tr === 'İlişkinin karmik düğümü' ? <Text style={{ fontFamily: F.serif, fontSize: 34, color: C.danger, marginBottom: 8 }}>{m.tail[2]}-{m.tail[1]}-{m.tail[0]}</Text> : null}
          {sec.items.map(it => (
            <View key={it.pos} style={{ marginBottom: 22 }}>
              <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.gold, marginBottom: 2 }}>{COUPLE_POS[it.pos].title[lang]}</Text>
              <H3 style={{ fontSize: 22, lineHeight: 28 }}>{an(it.n)}{it.repeat ? <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub }}>{tx('  · tekrar eden enerji', '  · repeated energy', lang)}</Text> : null}</H3>
              <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 6, maxWidth: 660 }}>{it.text[lang]}</Text>
            </View>
          ))}
        </Section>
      ))}
      <Section title={tx('Ailelerinizin ilişkiye etkisi', 'Your families’ influence on the relationship', lang)}>
        <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, maxWidth: 660 }}>{cr.families[lang]}</Text>
      </Section>
    </View>
  ) : null;

  const health = (
    <Section title={tx('Enerji haritası', 'Energy map', lang)}>
      <Intro k="health" />
      <View style={{ flexDirection: 'row', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.ink }}>
        <Text style={[st.sub, { flex: 1 }]}>{tx('Çakra', 'Chakra', lang)}</Text>
        {[tx('Fizik', 'Body', lang), tx('Enerji', 'Energy', lang), tx('Duygu', 'Emotion', lang)].map(h => <Text key={h} style={[st.sub, { width: 64, textAlign: 'center' }]}>{h}</Text>)}
      </View>
      {hm.rows.map(r => (
        <View key={r.chakra} style={{ flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.line, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: F.sansMed, fontSize: 15, color: C.ink }}>{CHAKRA[r.chakra].name[lang]}</Text>
            <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub }}>{CHAKRA[r.chakra].area[lang]}</Text>
          </View>
          {[r.physics, r.energy, r.emotions].map((n, i) => <Text key={i} style={{ width: 64, textAlign: 'center', fontFamily: F.serifBold, fontWeight: '700', fontSize: 18, color: C.ink }}>{n}</Text>)}
        </View>
      ))}
      <View style={{ flexDirection: 'row', paddingVertical: 10, alignItems: 'center' }}>
        <Text style={{ flex: 1, fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, color: C.ink }}>{tx('Toplam', 'Total', lang)}</Text>
        {[hm.total.physics, hm.total.energy, hm.total.emotions].map((n, i) => <Text key={i} style={{ width: 64, textAlign: 'center', fontFamily: F.serifBold, fontWeight: '700', fontSize: 18, color: C.gold }}>{n}</Text>)}
      </View>
      <Text style={{ fontFamily: F.sans, fontSize: 17, lineHeight: 28, color: C.ink, marginTop: 14, maxWidth: 660 }}>{lang === 'tr'
        ? (partner ? `En alttaki toplam satırı ilişkinizin genel duygusal dengesini gösterir: ${an(hm.total.emotions)}. ${COUPLE[hm.total.emotions].bond.tr} ${COUPLE[hm.total.emotions].tip.tr}` : `En alttaki toplam satırı, bütün enerji merkezlerinin ortak dengesini gösterir. Senin duygu toplamın ${an(hm.total.emotions)}. ${ARCANA[hm.total.emotions].plus.tr} ${ADVICE[hm.total.emotions].tr}`)
        : (partner ? `The total row shows the overall emotional balance of your relationship: ${an(hm.total.emotions)}. ${COUPLE[hm.total.emotions].bond.en} ${COUPLE[hm.total.emotions].tip.en}` : `The total row at the bottom shows the overall balance of all energy centres. Your emotion total is ${an(hm.total.emotions)}. ${ARCANA[hm.total.emotions].plus.en} ${ADVICE[hm.total.emotions].en}`)}</Text>
    </Section>
  );

  const fmtAge = (a: number) => (Number.isInteger(a) ? `${a}` : a.toFixed(a % 1 === 0.5 ? 1 : 2).replace('.', lang === 'tr' ? ',' : '.'));
  const agesView = (
    <Section title={tx('Yaş haritası', 'Age map', lang)}>
      <Intro k="ages" />
      <View style={[st.panel, { marginBottom: 16, backgroundColor: C.goldSoft, borderColor: C.goldSoft }]}>
        <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.ink }}>{tx(`Şu an (${Math.floor(age)} yaş)`, `Now (age ${Math.floor(age)})`, lang)}</Text>
        <H3>{an(ages[curIdx].arcana)}</H3>
        <P>{lang === 'tr' ? `Hayatının bu döneminde ${ARCANA[ages[curIdx].arcana].name.tr} enerjisi öne çıkıyor: ${ARCANA[ages[curIdx].arcana].key.tr}.` : `In this period of your life the energy of ${ARCANA[ages[curIdx].arcana].name.en} stands out: ${ARCANA[ages[curIdx].arcana].key.en}.`} {ARCANA[ages[curIdx].arcana].plus[lang]} {ADVICE[ages[curIdx].arcana][lang]}</P>
        {ages[curIdx + 1] ? <Sub style={{ marginTop: 6 }}>{tx(`Sonraki dönem ${fmtAge(ages[curIdx + 1].age)} yaşında: ${an(ages[curIdx + 1].arcana)}`, `Next period at age ${fmtAge(ages[curIdx + 1].age)}: ${an(ages[curIdx + 1].arcana)}`, lang)}</Sub> : null}
      </View>
      <Expand more={tx('Tüm yaşları göster', 'Show all ages', lang)} less={tx('Daha az', 'Less', lang)} initial={16} items={ages.map((a, i) => (
        <View key={i} style={{ flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: C.line, backgroundColor: i === curIdx ? C.goldSoft : 'transparent' }}>
          <Text style={{ width: 90, fontFamily: F.sans, fontSize: 14, color: C.sub, fontVariant: ['tabular-nums'] }}>{fmtAge(a.age)}–{fmtAge(ages[i + 1]?.age ?? 80)}</Text>
          <Text style={{ flex: 1, fontFamily: F.sansMed, fontSize: 15, color: C.ink }}>{an(a.arcana)}</Text>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub, flexShrink: 1, textAlign: 'right' }}>{ARCANA[a.arcana].key[lang]}</Text>
        </View>
      ))} />
    </Section>
  );

  const others = people.filter(p => p.id !== person.id);
  return (
    <View>
      <H1>{tx('Kader matrisi', 'Destiny matrix', lang)}</H1>
      <Sub style={{ marginBottom: 16, maxWidth: 620 }}>{partner
        ? tx(`${person.name || 'Sen'} ve ${partner.name || 'partner'} için uyum matrisi: iki matrisin her noktası toplanır.`, `Compatibility matrix for ${person.name || 'you'} and ${partner.name || 'partner'}: each point of the two matrices is added.`, lang)
        : tx(`${person.name || 'Sen'}, ${date}. Doğum tarihindeki sayılar 22 Büyük Arkana’ya indirgenir; saat ve yer gerekmez.`, `${person.name || 'You'}, ${date}. Your birth date is reduced to the 22 Major Arcana; no time or place needed.`, lang)}</Sub>
      <View style={[st.panel, { marginBottom: 24 }]}>
        <Text style={{ fontFamily: F.serif, fontSize: 22, color: C.ink, marginBottom: 6 }}>{tx('Kader matrisi nedir?', 'What is a destiny matrix?', lang)}</Text>
        <P style={{ maxWidth: 640 }}>{tx(
          'Kader matrisi, doğum tarihindeki sayılardan kurulan bir kendini tanıma haritasıdır. Gün, ay ve yıl toplanarak 1 ile 22 arasında sayılara indirgenir. Her sayı, tarot destesindeki 22 Büyük Arkana kartından birine karşılık gelir ve bir enerjiyi, bir karakter özelliğini anlatır. Astrolojiden farklı olarak doğum saati veya yeri gerekmez.',
          'The destiny matrix is a self-discovery map built from the numbers in your birth date. The day, month and year are reduced to numbers between 1 and 22. Each number matches one of the 22 Major Arcana cards of the tarot and describes an energy or character trait. Unlike astrology, it needs no birth time or place.', lang)}</P>
        <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, color: C.ink, marginTop: 12, marginBottom: 4 }}>{tx('Nasıl okunur?', 'How to read it', lang)}</Text>
        {[
          tx('Diyagramdaki her daire bir sayıdır. Köşeler kişiliğinin temelini, ortadaki altın daire ise özünü gösterir.', 'Each circle in the diagram is a number. The corners show the base of your personality; the gold circle in the middle is your core.', lang),
          tx('Aşağıdaki “Yorum” bölümü her sayıyı sırayla, sade bir dille açıklar. Önce noktanın ne anlama geldiğini, sonra sendeki sayının ne söylediğini okursun.', 'The “Reading” section below explains each number in turn, in plain words: first what the point means, then what your number says.', lang),
          tx('“Enerji” ve “Yaşlar” sekmeleri aynı sayıları beden enerjisine ve hayatının yıllarına yerleştirir.', 'The “Energy” and “Ages” tabs place the same numbers on your body’s energy and the years of your life.', lang),
        ].map((t, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
            <Text style={{ fontFamily: F.serifBold, fontWeight: '700', fontSize: 16, color: C.gold, width: 16 }}>{i + 1}</Text>
            <P style={{ flex: 1 }}>{t}</P>
          </View>
        ))}
        <Sub style={{ marginTop: 10 }}>{tx('Matris bilimsel bir yöntem değildir; kendini düşünmek için bir araç olarak kullan.', 'The matrix is not a scientific method; use it as a tool for reflection.', lang)}</Sub>
      </View>
      {people.length > 1 ? (
        <>
          <Text style={st.label}>{tx('Kimin matrisi?', 'Whose matrix?', lang)}</Text>
          <Chips items={people.map(p => ({ key: p.id, label: p.name || p.place }))} value={person.id} onChange={v => { setPid(v); if (v === pair) setPair('none'); }} />
          <Text style={st.label}>{tx('Uyum için ikinci kişi', 'Second person for compatibility', lang)}</Text>
          <Chips items={[{ key: 'none', label: tx('Yok', 'None', lang) }, ...others.map(p => ({ key: p.id, label: p.name || p.place }))]} value={pair} onChange={v => { setPair(v); if (v !== 'none' && view === 'ages') setView('reading'); }} />
        </>
      ) : null}
      {twoCol ? (
        <View style={{ flexDirection: 'row', gap: 48, alignItems: 'flex-start' }}>
          <View style={{ width: 480, position: 'sticky' as any, top: 0 }}>{diagram}</View>
          <View style={{ flex: 1, maxWidth: 640 }}>
            <Segmented items={[{ key: 'reading', label: tx('Yorum', 'Reading', lang) }, { key: 'health', label: tx('Enerji haritası', 'Energy map', lang) }, ...(partner ? [] : [{ key: 'ages' as View_, label: tx('Yaş haritası', 'Age map', lang) }])]} value={view} onChange={setView} />
            {view === 'reading' ? (partner ? coupleReading : reading) : view === 'health' ? health : agesView}
          </View>
        </View>
      ) : (
        <>
          {diagram}
          <Segmented items={[{ key: 'reading', label: tx('Yorum', 'Reading', lang) }, { key: 'health', label: tx('Enerji', 'Energy', lang) }, ...(partner ? [] : [{ key: 'ages' as View_, label: tx('Yaşlar', 'Ages', lang) }])]} value={view} onChange={setView} />
          {view === 'reading' ? (partner ? coupleReading : reading) : view === 'health' ? health : agesView}
        </>
      )}
    </View>
  );
}
