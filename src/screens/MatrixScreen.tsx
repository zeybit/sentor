import React, { useMemo, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G, Line, Polygon, Text as SvgText } from 'react-native-svg';
import { useStore } from '../store';
import { destinyMatrix, compatMatrix, healthMap, ageMap, Matrix } from '../engine/matrix';
import { ARCANA, POS, CHAKRA, mxText, MxPos } from '../content/arcana';
import { Chips, Expand, H1, H3, P, Section, Segmented, Sub, st, useLayout } from '../ui/kit';
import { C, F } from '../theme';

type Lang = 'tr' | 'en';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);

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

  const Item = ({ pos, n, label }: { pos: MxPos; n: number; label?: string }) => (
    <View style={st.row}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.sub, marginBottom: 2 }}>{label ?? POS[pos].title[lang]}</Text>
      <H3>{an(n)}</H3>
      <P style={{ marginTop: 4 }}>{mxText(pos, n)[lang]}</P>
    </View>
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
      <Sub style={{ marginTop: 6, textAlign: 'center' }}>{tx('Dış çemberdeki küçük sayılar yaş haritasıdır; altın sayılar yaşı gösterir.', 'Small numbers on the outer ring are the age map; gold numbers mark the age.', lang)}</Sub>
    </View>
  );

  const reading = (
    <View>
      <Section title={tx('Ana enerjiler', 'Core energies', lang)}>
        <Item pos="A" n={m.A} /><Item pos="B" n={m.B} /><Item pos="C" n={m.C} /><Item pos="E" n={m.E} />
      </Section>
      <Section title={tx('Karmik kuyruk', 'Karmic tail', lang)} sub={`${tx('Kuyruk', 'Tail', lang)} ${m.tail[2]}-${m.tail[1]}-${m.tail[0]}. ${POS.tail.what[lang]}`}>
        <Item pos="D" n={m.D} label={tx('Karmik görev (alt köşe)', 'Karmic task (bottom corner)', lang)} />
        <Item pos="tail" n={m.D2} label={tx('Kuyruğun ortası', 'Middle of the tail', lang)} />
        <Item pos="tail" n={m.D1} label={tx('Kuyruğun merkeze yakın ucu', 'Inner end of the tail', lang)} />
      </Section>
      <Section title={tx('Yetenekler', 'Talents', lang)} sub={POS.talent.what[lang]}>
        <Item pos="talent" n={m.B2} label={tx('Doğuştan yetenek', 'Innate talent', lang)} />
        <Item pos="talent" n={m.B1} label={tx('Geliştirilecek yetenek', 'Talent to develop', lang)} />
      </Section>
      <Section title={tx('Aşk ve para', 'Love and money', lang)}>
        <Item pos="love" n={m.love} /><Item pos="money" n={m.money} /><Item pos="X" n={m.X} />
      </Section>
      <Section title={tx('Amaçlar', 'Purposes', lang)} sub={tx('Hayatın farklı dönemlerinde öne çıkan görevler.', 'Tasks that stand out in different stages of life.', lang)}>
        {(['sky', 'earth', 'personal', 'male', 'female', 'social', 'spiritual', 'planetary'] as MxPos[]).map(k => (
          <View key={k} style={st.row}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
              <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 15, color: C.ink, flex: 1 }}>{POS[k].title[lang]}</Text>
              <Text style={{ fontFamily: F.serifBold, fontWeight: '700', fontSize: 18, color: C.rose }}>{an((m as any)[k])}</Text>
            </View>
            <Sub>{POS[k].what[lang]} {ARCANA[(m as any)[k]].plus[lang]}</Sub>
          </View>
        ))}
      </Section>
      <Section title={tx('Soy enerjileri', 'Ancestral energies', lang)} sub={tx('Çapraz karenin köşeleri: sol üst ve sağ alt baba soyu, sağ üst ve sol alt anne soyu.', 'Corners of the diagonal square: top-left and bottom-right are the paternal line, top-right and bottom-left the maternal line.', lang)}>
        {([[m.F, tx('Baba soyu (sol üst)', 'Paternal (top-left)', lang)], [m.H, tx('Baba soyu (sağ alt)', 'Paternal (bottom-right)', lang)], [m.G, tx('Anne soyu (sağ üst)', 'Maternal (top-right)', lang)], [m.I, tx('Anne soyu (sol alt)', 'Maternal (bottom-left)', lang)]] as [number, string][]).map(([n, label]) => (
          <View key={label} style={st.row}>
            <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.sub }}>{label}</Text>
            <H3>{an(n)}</H3>
            <P style={{ marginTop: 2 }}>{ARCANA[n].plus[lang]} {ARCANA[n].karma[lang]}</P>
          </View>
        ))}
      </Section>
    </View>
  );

  const health = (
    <Section title={tx('Enerji haritası (çakralar)', 'Energy map (chakras)', lang)} sub={tx('Geleneksel çakra tablosu. Tıbbi bilgi değildir; sağlık konularında bir hekime danış.', 'The traditional chakra table. Not medical information; consult a doctor about health.', lang)}>
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
      <P style={{ marginTop: 8 }}>{tx(`Duygu toplamındaki ${an(hm.total.emotions)}: `, `Emotion total ${an(hm.total.emotions)}: `, lang)}{ARCANA[hm.total.emotions].plus[lang]}</P>
    </Section>
  );

  const fmtAge = (a: number) => (Number.isInteger(a) ? `${a}` : a.toFixed(a % 1 === 0.5 ? 1 : 2).replace('.', lang === 'tr' ? ',' : '.'));
  const agesView = (
    <Section title={tx('Yaş haritası', 'Age map', lang)} sub={tx('Her 10 yıllık dönem 8 alt döneme bölünür; her alt dönemin bir arkanası vardır.', 'Each 10-year span is split into 8 sub-periods, each with its own arcana.', lang)}>
      <View style={[st.panel, { marginBottom: 16, backgroundColor: C.goldSoft, borderColor: C.goldSoft }]}>
        <Text style={{ fontFamily: F.sansMed, fontSize: 13, color: C.ink }}>{tx(`Şu an (${Math.floor(age)} yaş)`, `Now (age ${Math.floor(age)})`, lang)}</Text>
        <H3>{an(ages[curIdx].arcana)}</H3>
        <P>{ARCANA[ages[curIdx].arcana].plus[lang]} {ARCANA[ages[curIdx].arcana].minus[lang]}</P>
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
      {people.length > 1 ? (
        <>
          <Text style={st.label}>{tx('Kimin matrisi?', 'Whose matrix?', lang)}</Text>
          <Chips items={people.map(p => ({ key: p.id, label: p.name || p.place }))} value={person.id} onChange={v => { setPid(v); if (v === pair) setPair('none'); }} />
          <Text style={st.label}>{tx('Uyum için ikinci kişi', 'Second person for compatibility', lang)}</Text>
          <Chips items={[{ key: 'none', label: tx('Yok', 'None', lang) }, ...others.map(p => ({ key: p.id, label: p.name || p.place }))]} value={pair} onChange={setPair} />
        </>
      ) : null}
      {twoCol ? (
        <View style={{ flexDirection: 'row', gap: 48, alignItems: 'flex-start' }}>
          <View style={{ width: 480, position: 'sticky' as any, top: 0 }}>{diagram}</View>
          <View style={{ flex: 1, maxWidth: 640 }}>
            <Segmented items={[{ key: 'reading', label: tx('Yorum', 'Reading', lang) }, { key: 'health', label: tx('Enerji haritası', 'Energy map', lang) }, { key: 'ages', label: tx('Yaş haritası', 'Age map', lang) }]} value={view} onChange={setView} />
            {view === 'reading' ? reading : view === 'health' ? health : agesView}
          </View>
        </View>
      ) : (
        <>
          {diagram}
          <Segmented items={[{ key: 'reading', label: tx('Yorum', 'Reading', lang) }, { key: 'health', label: tx('Enerji', 'Energy', lang) }, { key: 'ages', label: tx('Yaşlar', 'Ages', lang) }]} value={view} onChange={setView} />
          {view === 'reading' ? reading : view === 'health' ? health : agesView}
        </>
      )}
    </View>
  );
}
