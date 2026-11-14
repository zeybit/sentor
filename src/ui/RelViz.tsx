// Aşk ve uyum görselleri: uyum radarı, bağ haritası, ev çemberi, ilişkinin kimlik kartı,
// ilişkinin yaşadığı alanlar, Davison ilişki takvimi ve paylaşılabilir ilişki kartı.
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import Svg, { Circle, G, Line, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import type { BodyId, Chart } from '../engine/astro';
import type { CrossAspect } from '../engine/techniques';
import { skyEvents, SkyEvent } from '../engine/timeline';
import { ASPECT_INFO, BODIES, HOUSES, SIGNS, SIGN_GLYPHS, L } from '../content/base';
import { relName, synTitle, synWhy, SIGN_REL } from '../content/relationship';
import { AreaResult, AreaId, score } from '../content/synastryAreas';
import type { OverlayRow } from '../content/overlays';
import { Sub, st } from './kit';
import { ShareSvg, safeName } from './ShareImage';
import { C, F, ELEMENT_COLOR } from '../theme';

type Lang = 'tr' | 'en';
type K = BodyId | 'asc' | 'mc';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const l = (tr: string, en: string): L => ({ tr, en });
const D2R = Math.PI / 180;
const pol = (cx: number, cy: number, r: number, deg: number) => [cx + r * Math.cos(deg * D2R), cy - r * Math.sin(deg * D2R)] as const;
const glyphOf = (k: K) => (k === 'asc' ? 'AC' : k === 'mc' ? 'MC' : BODIES[k].glyph);

// ===================== Uyum radarı =====================
const RADAR: { id: AreaId; label: L }[] = [
  { id: 'emotion', label: l('Duygusal bağ', 'Emotional bond') },
  { id: 'comm', label: l('Zihinsel uyum', 'Mental rapport') },
  { id: 'attraction', label: l('Çekim ve tutku', 'Attraction') },
  { id: 'pleasure', label: l('Keyif ve değerler', 'Pleasures & values') },
  { id: 'longevity', label: l('Sadakat, uzun vade', 'Loyalty, long term') },
  { id: 'goals', label: l('Birlikte büyüme', 'Growing together') },
];
export type RadarOverride = Partial<Record<AreaId, number>>;
export function radarValues(ar: AreaResult[], ov: RadarOverride = {}) {
  return RADAR.map(r => {
    if (ov[r.id] !== undefined) return Math.round(ov[r.id]!);
    const a = ar.find(x => x.def.id === r.id);
    if (!a || a.mag <= 0) return 50;
    const v = 50 + (a.ratio - 0.5) * 100 * Math.min(1, a.mag / 6);
    return Math.round(Math.max(8, Math.min(96, v)));
  });
}
export function RadarChart({ ar, lang, size = 320, ov }: { ar: AreaResult[]; lang: Lang; size?: number; ov?: RadarOverride }) {
  const vals = radarValues(ar, ov);
  const padX = 84, padY = 26, cx = size / 2 + padX, cy = size / 2 + padY, R = size * 0.36;
  const ang = (i: number) => 90 - i * 60;
  const pts = vals.map((v, i) => pol(cx, cy, (R * v) / 100, ang(i)));
  const best = vals.indexOf(Math.max(...vals)), worst = vals.indexOf(Math.min(...vals));
  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size + padX * 2} height={size + padY * 2} accessibilityLabel={tx('Uyum radarı', 'Compatibility radar', lang)}>
        {[0.25, 0.5, 0.75, 1].map(f => <Polygon key={f} points={RADAR.map((_, i) => pol(cx, cy, R * f, ang(i)).join(',')).join(' ')} fill="none" stroke={C.line} strokeWidth={1} />)}
        {RADAR.map((_, i) => { const [x, y] = pol(cx, cy, R, ang(i)); return <Line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={C.line} strokeWidth={1} />; })}
        <Polygon points={pts.map(p => p.join(',')).join(' ')} fill={C.second} fillOpacity={0.22} stroke={C.second} strokeWidth={2.5} />
        {pts.map(([x, y], i) => <Circle key={i} cx={x} cy={y} r={4} fill={C.second} />)}
        {RADAR.map((r, i) => {
          const [x, y] = pol(cx, cy, R + 22, ang(i));
          const anchor = Math.abs(x - cx) < 4 ? 'middle' : x > cx ? 'start' : 'end';
          return (
            <G key={r.id}>
              <SvgText x={x} y={y - 2} fontSize={12} fill={C.ink} fontWeight="600" textAnchor={anchor}>{r.label[lang]}</SvgText>
              <SvgText x={x} y={y + 13} fontSize={12} fill={i === best ? C.earth : i === worst ? C.fire : C.sub} fontWeight="700" textAnchor={anchor}>%{vals[i]}</SvgText>
            </G>
          );
        })}
      </Svg>
      <Text style={[st.p, { textAlign: 'center', maxWidth: 520 }]}>
        <Text style={{ color: C.earth, fontWeight: '700' }}>{tx('En güçlü yanınız', 'Your strongest side', lang)}: </Text>{RADAR[best].label[lang].toLocaleLowerCase(lang)}.{'  '}
        <Text style={{ color: C.fire, fontWeight: '700' }}>{tx('En çok emek isteyen', 'Needs most care', lang)}: </Text>{RADAR[worst].label[lang].toLocaleLowerCase(lang)}.
      </Text>
    </View>
  );
}

// ===================== Bağ haritası =====================
const BOND_IDS: K[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc'];
const natColor = (t: CrossAspect['type']) => { const n = ASPECT_INFO[t].nature; return n === 'harmonious' ? C.air : n === 'challenging' ? C.fire : C.gold; };
export function BondMap({ cross, me, them, myName, theirName, lang, width }: { cross: CrossAspect[]; me: Chart; them: Chart; myName: string; theirName: string; lang: Lang; width: number }) {
  const has = (c: Chart, k: K) => (k === 'asc' ? c.asc !== null : !!c.positions[k as BodyId]);
  const left = BOND_IDS.filter(k => has(me, k)), right = BOND_IDS.filter(k => has(them, k));
  const lines = useMemo(() => score(cross.filter(x => BOND_IDS.includes(x.a) && BOND_IDS.includes(x.b) && x.type !== 'quincunx'))
    .sort((p, q) => q.strength - p.strength).slice(0, 16), [cross]);
  const [sel, setSel] = useState(0);
  const W = Math.min(width, 560), rowH = 30, H = Math.max(left.length, right.length) * rowH + 30;
  const lx = 104, rx = W - 104;
  const y = (i: number) => 34 + i * rowH;
  const maxS = Math.max(0.01, ...lines.map(s => s.strength));
  const cur = lines[sel];
  return (
    <View>
      <Svg width={W} height={H}>
        <SvgText x={lx - 14} y={14} fontSize={12} fill={C.sub} fontWeight="700" textAnchor="end">{myName || tx('Sen', 'You', lang)}</SvgText>
        <SvgText x={rx + 14} y={14} fontSize={12} fill={C.second} fontWeight="700" textAnchor="start">{theirName || 'Partner'}</SvgText>
        {lines.map((s, i) => {
          const y1 = y(left.indexOf(s.x.b)), y2 = y(right.indexOf(s.x.a));
          const on = i === sel;
          const col = natColor(s.x.type);
          return (
            <G key={i} onPress={() => setSel(i)}>
              <Line x1={lx} y1={y1} x2={rx} y2={y2} stroke="transparent" strokeWidth={14} />
              <Line x1={lx} y1={y1} x2={rx} y2={y2} stroke={col} strokeOpacity={on ? 1 : 0.4} strokeWidth={1 + (s.strength / maxS) * 5 + (on ? 1.5 : 0)} strokeDasharray={ASPECT_INFO[s.x.type].nature === 'challenging' ? '6 4' : undefined} />
            </G>
          );
        })}
        {left.map((k, i) => (
          <G key={'l' + k}>
            <Circle cx={lx} cy={y(i)} r={5} fill={C.ink} />
            <SvgText x={lx - 12} y={y(i) + 4} fontSize={13} fill={C.ink} textAnchor="end">{relName(k)[lang]} {glyphOf(k)}</SvgText>
          </G>
        ))}
        {right.map((k, i) => (
          <G key={'r' + k}>
            <Circle cx={rx} cy={y(i)} r={5} fill={C.second} />
            <SvgText x={rx + 12} y={y(i) + 4} fontSize={13} fill={C.ink} textAnchor="start">{glyphOf(k)} {relName(k)[lang]}</SvgText>
          </G>
        ))}
      </Svg>
      <Sub style={{ marginTop: 2 }}>{tx('Mavi düz çizgi: kolaylaştırıcı, kırmızı kesikli: zorlayıcı, altın: kaynaşma. Kalın çizgi güçlü bağdır; bir çizgiye dokun.', 'Solid blue: supportive, dashed red: challenging, gold: fusion. Thicker lines are stronger bonds; tap a line.', lang)}</Sub>
      {cur ? (
        <View style={[st.panel, { marginTop: 10, borderLeftWidth: 3, borderLeftColor: natColor(cur.x.type) }]}>
          <Text style={{ fontFamily: F.serif, fontSize: 18, color: C.ink }}>{synTitle(cur.x.b, cur.x.a, cur.x.type, theirName)[lang]}</Text>
          <Text style={[st.p, { marginTop: 4 }]}>{synWhy(cur.x.b, cur.x.a, cur.x.type)[lang]}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ===================== Ev çemberi =====================
function slicePath(cx: number, cy: number, r0: number, r1: number, a0: number, a1: number) {
  const [x0, y0] = pol(cx, cy, r1, a0), [x1, y1] = pol(cx, cy, r1, a1), [x2, y2] = pol(cx, cy, r0, a1), [x3, y3] = pol(cx, cy, r0, a0);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M${x0},${y0} A${r1},${r1} 0 ${large} 0 ${x1},${y1} L${x2},${y2} A${r0},${r0} 0 ${large} 1 ${x3},${y3} Z`;
}
export function HouseRing({ rows, title, lang, size = 300 }: { rows: OverlayRow[]; title: string; lang: Lang; size?: number }) {
  const cx = size / 2, cy = size / 2, R1 = size / 2 - 6, R0 = R1 * 0.42;
  const byHouse = Array.from({ length: 12 }, (_, h) => rows.filter(r => r.house === h + 1));
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: C.ink, marginBottom: 6, textAlign: 'center' }}>{title}</Text>
      <Svg width={size} height={size}>
        {byHouse.map((list, h) => {
          const a0 = 180 + h * 30, a1 = a0 + 30, mid = a0 + 15;
          const hot = [5, 7, 8].includes(h + 1);
          const [nx, ny] = pol(cx, cy, R0 + 12, mid);
          return (
            <G key={h}>
              <Path d={slicePath(cx, cy, R0, R1, a0, a1)} fill={hot ? C.goldSoft : list.length ? C.roseSoft : C.card} stroke={C.line} strokeWidth={1} />
              <SvgText x={nx} y={ny + 4} fontSize={10} fill={hot ? C.gold : C.sub} fontWeight="700" textAnchor="middle">{h + 1}</SvgText>
              {list.map((r, j) => {
                const rr = R0 + 32 + j * 18;
                const [gx, gy] = pol(cx, cy, Math.min(rr, R1 - 10), mid);
                return <SvgText key={r.body} x={gx} y={gy + 5} fontSize={15} fill={C.second} textAnchor="middle">{BODIES[r.body].glyph}</SvgText>;
              })}
            </G>
          );
        })}
        <Circle cx={cx} cy={cy} r={R0} fill={C.bg} stroke={C.line} />
        <SvgText x={cx} y={cy - 4} fontSize={11} fill={C.sub} textAnchor="middle">{tx('sarı dilimler', 'gold slices', lang)}</SvgText>
        <SvgText x={cx} y={cy + 10} fontSize={11} fill={C.sub} textAnchor="middle">{tx('aşk · evlilik · tutku', 'love · marriage · intimacy', lang)}</SvgText>
      </Svg>
    </View>
  );
}

// ===================== İlişkinin kimlik kartı =====================
const ID_TILES: { id: BodyId; label: L }[] = [
  { id: 'sun', label: l('İlişkinin kimliği', 'Identity of the bond') },
  { id: 'moon', label: l('Duygusal ihtiyacı', 'Emotional need') },
  { id: 'venus', label: l('Sevgi dili', 'Love language') },
  { id: 'mars', label: l('Tutku ve tartışma tarzı', 'Passion and conflict style') },
];
export function IdentityCard({ chart, lang }: { chart: Chart; lang: Lang }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {ID_TILES.map(t => {
        const s = chart.positions[t.id].sign;
        const col = ELEMENT_COLOR[s % 4];
        return (
          <View key={t.id} style={{ flexGrow: 1, flexBasis: 150, borderRadius: 14, borderWidth: 1, borderColor: col, backgroundColor: C.card, padding: 12 }}>
            <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub }}>{BODIES[t.id].glyph} {t.label[lang]}</Text>
            <Text style={{ fontFamily: F.serif, fontSize: 22, color: col, marginTop: 2 }}>{SIGN_GLYPHS[s]} {SIGNS[s][lang]}</Text>
            <Text style={{ fontFamily: F.sans, fontSize: 14, lineHeight: 20, color: C.ink, marginTop: 2 }}>{SIGN_REL[s].mood[lang]}</Text>
          </View>
        );
      })}
    </View>
  );
}

// ===================== İlişkinin yaşadığı alanlar =====================
const HW: Partial<Record<BodyId, number>> = { sun: 2, moon: 2, venus: 2, mars: 2, mercury: 1.5, jupiter: 1.5, saturn: 1.5, uranus: 1, neptune: 1, pluto: 1, juno: 1 };
const HOUSE_COL = (h: number) => (h <= 4 ? C.earth : h <= 8 ? C.second : C.water);
export function HouseDonut({ chart, lang, size = 260 }: { chart: Chart; lang: Lang; size?: number }) {
  const w = Array(12).fill(0) as number[];
  for (const [id, v] of Object.entries(HW) as [BodyId, number][]) { const h = chart.positions[id]?.house; if (h) w[h - 1] += v; }
  const total = w.reduce((a, b) => a + b, 0);
  if (!total) return <Sub>{tx('Doğum saatlerinden biri bilinmediği için evler hesaplanamıyor.', 'Houses can’t be calculated because a birth time is unknown.', lang)}</Sub>;
  const cx = size / 2, cy = size / 2, R1 = size / 2 - 4, R0 = R1 * 0.58;
  let a = 90;
  const segs = w.map((v, i) => ({ h: i + 1, v })).filter(s => s.v > 0).map(s => { const span = (s.v / total) * 360; const seg = { ...s, a0: a - span, a1: a }; a -= span; return seg; });
  const top = [...segs].sort((p, q) => q.v - p.v).slice(0, 3);
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
      <Svg width={size} height={size}>
        {segs.map(s => <Path key={s.h} d={slicePath(cx, cy, R0, R1, s.a0, s.a1 - 0.6)} fill={HOUSE_COL(s.h)} fillOpacity={top.some(t => t.h === s.h) ? 0.95 : 0.4} />)}
        {segs.map(s => { const [x, y] = pol(cx, cy, (R0 + R1) / 2, (s.a0 + s.a1) / 2); return s.a1 - s.a0 > 16 ? <SvgText key={'t' + s.h} x={x} y={y + 4} fontSize={11} fill="#fff" fontWeight="700" textAnchor="middle">{s.h}</SvgText> : null; })}
        <SvgText x={cx} y={cy - 6} fontSize={11} fill={C.sub} textAnchor="middle">{tx('İlişkinin merkezi', 'Heart of the bond', lang)}</SvgText>
        {HOUSES[top[0].h - 1].short[lang].split(' & ').map((t, i, arr) => <SvgText key={i} x={cx} y={cy + 12 + i * 16} fontSize={13} fill={C.ink} fontWeight="700" textAnchor="middle">{t}{i < arr.length - 1 ? ' &' : ''}</SvgText>)}
      </Svg>
      <View style={{ flex: 1, minWidth: 200 }}>
        {top.map((t, i) => (
          <View key={t.h} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: HOUSE_COL(t.h) }} />
            <Text style={[st.p, { flex: 1 }]}><Text style={{ fontWeight: '700' }}>{i + 1}. {HOUSES[t.h - 1].short[lang]}</Text> · %{Math.round((t.v / total) * 100)}</Text>
          </View>
        ))}
        <Sub>{tx('Dilimler gezegenlerin toplandığı evleri gösterir. Yeşil: kişisel hayat ve yuva, kırmızı: aşk ve ortaklık, mor: dış dünya ve hedefler.', 'Slices show where planets gather. Green: personal life and home, red: love and partnership, purple: the outer world and goals.', lang)}</Sub>
      </View>
    </View>
  );
}

// ===================== Davison ilişki takvimi =====================
type Lane = 'up' | 'test' | 'turn';
const laneOf = (e: SkyEvent): Lane => (e.kind === 'eclipse' || e.t === 'uranus' || e.t === 'pluto' || e.t === 'node' ? 'turn' : e.t === 'jupiter' || e.type === 'trine' ? 'up' : 'test');
const LANE: Record<Lane, { name: L; col: () => string }> = {
  up: { name: l('Destekli', 'Supported'), col: () => C.earth },
  test: { name: l('Sınanan', 'Tested'), col: () => C.gold },
  turn: { name: l('Dönüm noktası', 'Turning point'), col: () => C.water },
};
const REL_PT: Record<string, L> = {
  sun: l('ilişkinin kimliği', 'the identity of the bond'), moon: l('duygusal bağınız', 'your emotional bond'), mercury: l('iletişiminiz', 'your communication'),
  venus: l('sevginiz ve keyifleriniz', 'your love and pleasures'), mars: l('tutkunuz ve tartışmalarınız', 'your passion and arguments'), jupiter: l('birlikte büyümeniz', 'how you grow together'),
  saturn: l('ilişkinin yapısı ve sorumlulukları', 'the bond’s structure and duties'), asc: l('ilişkinin dışarıdan görünüşü', 'how the bond looks to others'), mc: l('ortak hedefleriniz', 'your shared goals'),
  dsc: l('bağlılık ve ortaklık', 'commitment and partnership'), ic: l('ortak yuvanız', 'your shared home'),
};
const REL_EFF: Record<string, L> = {
  jupiter: l('Büyüme ve şans: birlikte yeni bir adım (taşınma, nişan, evlilik, ortak yatırım) için uygun bir dönem.', 'Growth and luck: a good time for a new step together (moving in, engagement, marriage, a joint investment).'),
  saturn: l('İlişki sınanır: sorumluluk, mesafe ya da ciddi kararlar. Sağlam bağlar bu dönemde kalıcılaşır.', 'The bond is tested: responsibility, distance or serious decisions. Strong bonds become lasting now.'),
  uranus: l('Beklenmedik değişim: ilişkinin düzeni sarsılır; yenilik ve alan tanımak iyi gelir.', 'Unexpected change: the bond’s routine is shaken; novelty and giving space help.'),
  neptune: l('Belirsizlik ya da idealize etme: romantizm yüksek ama açık konuşmak şart.', 'Vagueness or idealising: romance is high, but open talk is essential.'),
  pluto: l('Derin dönüşüm: ilişki ya çok güçlenir ya da kökten sorgulanır.', 'Deep transformation: the bond either grows much stronger or is questioned at its roots.'),
  node: l('Kader gibi hissedilen bir dönüm noktası: ilişkinin yönü belirlenir.', 'A turning point that feels fated: the direction of the bond is set.'),
  eclN: l('Kuzey düğüm tutulması: ilişkide yeni bir kapı, yeni bir başlangıç.', 'North-node eclipse: a new door and a fresh start for the bond.'),
  eclS: l('Güney düğüm tutulması: bir şey tamamlanır; eski bir kalıbı bırakma zamanı.', 'South-node eclipse: something completes; time to drop an old pattern.'),
};
const fmtM = (d: Date, lang: Lang) => new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-GB', { month: 'short', year: 'numeric' }).format(d);
export function RelTimeline({ chart, lang, width }: { chart: Chart; lang: Lang; width: number }) {
  const now = Date.now(), YEAR = 365.2422 * 864e5, end = now + 6 * YEAR;
  const evs = useMemo(() => skyEvents(chart).filter(e => (e.kind === 'transit' || e.kind === 'eclipse') && e.end.getTime() > now && e.start.getTime() < end), [chart]);
  const [sel, setSel] = useState<number>(0);
  const pxY = Math.max(110, (Math.min(width, 900) - 110) / 6);
  const W = 110 + pxY * 6;
  const x = (t: number) => 110 + ((Math.max(now, Math.min(end, t)) - now) / YEAR) * pxY;
  const lanes: Lane[] = ['up', 'test', 'turn'];
  // Üst üste binen olaylar aynı şeridin alt satırlarına dağıtılır
  const pack = useMemo(() => {
    const rowOf = new Map<string, number>(); const rows: Record<Lane, number[]> = { up: [], test: [], turn: [] };
    for (const e of [...evs].sort((a, b) => a.start.getTime() - b.start.getTime())) {
      const ln = laneOf(e), ends = rows[ln];
      let r = ends.findIndex(t => t + 20 * 864e5 < e.start.getTime());
      if (r < 0) { r = ends.length; ends.push(0); }
      ends[r] = e.end.getTime(); rowOf.set(e.id, r);
    }
    return { rowOf, n: { up: Math.max(1, rows.up.length), test: Math.max(1, rows.test.length), turn: Math.max(1, rows.turn.length) } };
  }, [evs]);
  const RH = 13, laneTop: Record<Lane, number> = { up: 8, test: 0, turn: 0 };
  laneTop.test = laneTop.up + pack.n.up * RH + 16; laneTop.turn = laneTop.test + pack.n.test * RH + 16;
  const H = laneTop.turn + pack.n.turn * RH + 30;
  const y0 = new Date(now).getFullYear();
  const cur = evs[sel];
  const desc = (e: SkyEvent) => {
    const eff = e.kind === 'eclipse' ? REL_EFF[e.north ? 'eclN' : 'eclS'] : REL_EFF[e.t as string];
    return `${tx('Etkilenen alan', 'Area', lang)}: ${REL_PT[e.n as string]?.[lang] ?? ''}. ${eff?.[lang] ?? ''}`;
  };
  const titleOf = (e: SkyEvent) => e.kind === 'eclipse' ? `${e.north ? tx('Kuzey düğüm tutulması', 'North-node eclipse', lang) : tx('Güney düğüm tutulması', 'South-node eclipse', lang)} → ${REL_PT[e.n as string]?.[lang]}`
    : `${e.t === 'node' ? tx('Kuzey Ay Düğümü', 'North Node', lang) : BODIES[e.t as BodyId].name[lang]} · ${ASPECT_INFO[e.type!].name[lang].toLocaleLowerCase(lang)} → ${REL_PT[e.n as string]?.[lang]}`;
  if (!evs.length) return <Sub>{tx('Önümüzdeki altı yılda ilişki haritasına dokunan belirgin bir geçiş yok; sakin bir akış.', 'No notable passages touch the relationship chart in the next six years; a calm flow.', lang)}</Sub>;
  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator>
        <Svg width={W} height={H}>
          {Array.from({ length: 7 }).map((_, i) => {
            const t = new Date(y0 + i, 0, 1).getTime(); const px = x(t);
            return t >= now && t <= end ? <G key={i}><Line x1={px} y1={0} x2={px} y2={H - 18} stroke={C.line} /><SvgText x={px} y={H - 4} fontSize={10} fill={C.sub} textAnchor="middle">{y0 + i}</SvgText></G> : null;
          })}
          {lanes.map(ln => <SvgText key={ln} x={0} y={laneTop[ln] + 11} fontSize={12} fill={LANE[ln].col()} fontWeight="700">{LANE[ln].name[lang]}</SvgText>)}
          {evs.map((e, i) => {
            const ln = laneOf(e), on = i === sel;
            const x1 = x(e.start.getTime()), x2 = Math.max(x1 + 6, x(e.end.getTime()));
            const yy = laneTop[ln] + (pack.rowOf.get(e.id) ?? 0) * RH;
            return (
              <G key={e.id} onPress={() => setSel(i)}>
                <Rect x={x1} y={yy} width={x2 - x1} height={RH - 3} rx={4} fill={LANE[ln].col()} fillOpacity={on ? 1 : 0.55} stroke={on ? C.ink : 'none'} strokeWidth={1.5} />
              </G>
            );
          })}
        </Svg>
      </ScrollView>
      <Sub style={{ marginTop: 2 }}>{tx('Bir şeride dokun; o dönemde ilişkinizde ne olabileceği aşağıda açılır.', 'Tap a bar to see what the period may bring to your relationship.', lang)}</Sub>
      {cur ? (
        <View style={[st.panel, { marginTop: 10, borderLeftWidth: 3, borderLeftColor: LANE[laneOf(cur)].col() }]}>
          <Text style={{ fontFamily: F.sans, fontSize: 13, color: C.sub }}>{fmtM(cur.start, lang)} – {fmtM(cur.end, lang)}</Text>
          <Text style={{ fontFamily: F.serif, fontSize: 18, color: C.ink }}>{titleOf(cur)}</Text>
          <Text style={[st.p, { marginTop: 4 }]}>{desc(cur)}</Text>
        </View>
      ) : null}
    </View>
  );
}

// ===================== Paylaşılabilir ilişki kartı =====================
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function cardSvg(ar: AreaResult[], a: string, b: string, status: string, theme: string, lang: Lang, ov?: RadarOverride) {
  const vals = radarValues(ar, ov);
  const W = 1080, H = 1920, cx = 540, cy = 980, R = 270;
  const ang = (i: number) => 90 - i * 60;
  const P = (r: number, i: number) => pol(cx, cy, r, ang(i)).map(n => n.toFixed(1)).join(',');
  const grid = [0.25, 0.5, 0.75, 1].map(f => `<polygon points="${RADAR.map((_, i) => P(R * f, i)).join(' ')}" fill="none" stroke="#3A5878" stroke-width="2"/>`).join('');
  const poly = `<polygon points="${vals.map((v, i) => P((R * v) / 100, i)).join(' ')}" fill="#F08F6F" fill-opacity="0.35" stroke="#F08F6F" stroke-width="6"/>`;
  const labels = RADAR.map((r, i) => { const [x, y] = pol(cx, cy, R + 46, ang(i)); const an = Math.abs(x - cx) < 5 ? 'middle' : x > cx ? 'start' : 'end'; return `<text x="${x.toFixed(0)}" y="${y.toFixed(0)}" font-size="32" fill="#E3ECF3" text-anchor="${an}" font-family="Georgia,serif">${esc(r.label[lang])}</text><text x="${x.toFixed(0)}" y="${(y + 44).toFixed(0)}" font-size="36" font-weight="700" fill="#F2B84B" text-anchor="${an}" font-family="Helvetica,Arial,sans-serif">%${vals[i]}</text>`; }).join('');
  const wrap = (t: string, n: number) => { const w = t.split(' '); const out: string[] = []; let cur = ''; for (const x of w) { if ((cur + ' ' + x).trim().length > n) { out.push(cur.trim()); cur = x; } else cur += ' ' + x; } if (cur.trim()) out.push(cur.trim()); return out; };
  const themeLines = wrap(theme, 40).slice(0, 3).map((t, i) => `<text x="540" y="${1530 + i * 52}" font-size="38" fill="#E3ECF3" text-anchor="middle" font-family="Helvetica,Arial,sans-serif">${esc(t)}</text>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1A2B"/><stop offset="1" stop-color="#1E3A5F"/></linearGradient></defs>
<rect width="${W}" height="${H}" fill="url(#g)"/>
${Array.from({ length: 60 }).map((_, i) => `<circle cx="${(i * 197) % W}" cy="${(i * 331) % 560 + 40}" r="${i % 3 === 0 ? 3 : 1.6}" fill="#fff" fill-opacity="0.6"/>`).join('')}
<text x="540" y="250" font-size="44" fill="#93A9BB" text-anchor="middle" font-family="Helvetica,Arial,sans-serif" letter-spacing="6">${esc(tx('İLİŞKİ KARTI', 'RELATIONSHIP CARD', lang))}</text>
<text x="540" y="360" font-size="92" fill="#E3ECF3" text-anchor="middle" font-family="Georgia,serif">${esc(a)} &amp; ${esc(b)}</text>
<text x="540" y="460" font-size="58" fill="#F2B84B" text-anchor="middle" font-family="Georgia,serif" font-style="italic">${esc(status)}</text>
${grid}${RADAR.map((_, i) => `<line x1="${cx}" y1="${cy}" x2="${P(R, i).split(',')[0]}" y2="${P(R, i).split(',')[1]}" stroke="#3A5878" stroke-width="2"/>`).join('')}${poly}${labels}
${themeLines}
<text x="540" y="1830" font-size="34" fill="#93A9BB" text-anchor="middle" font-family="Georgia,serif">Gökyüzü Haritam</text>
</svg>`;
}
export function ShareCard({ ar, myName, theirName, status, theme, lang, ov }: { ar: AreaResult[]; myName: string; theirName: string; status: string; theme: string; lang: Lang; ov?: RadarOverride }) {
  const svg = useMemo(() => cardSvg(ar, myName || tx('Sen', 'You', lang), theirName || 'Partner', status, theme, lang, ov), [ar, myName, theirName, status, theme, lang, ov]);
  return <ShareSvg svg={svg} filename={`iliski-karti-${safeName(myName || 'sen')}-${safeName(theirName || 'partner')}.png`} lang={lang} />;
}
