import React, { useMemo } from 'react';
import { ScrollView, Text, View } from 'react-native';
import type { BodyId, Chart } from '../engine/astro';
import { PLANETS, fmtDeg } from '../engine/astro';
import type { CrossAspect } from '../engine/techniques';
import { ASPECT_INFO, BODIES, SIGNS, SIGN_GLYPHS, L } from '../content/base';
import { synPair } from '../content/techniqueTexts';
import { relPlacementTitle, relPlacementText, relAscText, relAspectTitle, relAspectText, relName, synTitle, synLongText, synWhy } from '../content/relationship';
import { score, areas, summary, questions, intimacy, topAspects, BAND, INTIMACY, Intimacy, Scored, synOrb } from '../content/synastryAreas';
import { Expand, P, Section, Sub, st } from './kit';
import { C, F, serif } from '../theme';

type Lang = 'tr' | 'en';
type K = BodyId | 'asc' | 'mc';
const tx = (tr: string, en: string, lang: Lang) => (lang === 'tr' ? tr : en);
const ASTS: BodyId[] = ['ceres', 'pallas', 'vesta'];

function Head({ children }: { children: React.ReactNode }) {
  return <Text style={{ fontFamily: F.serifBold, fontSize: 19, color: C.ink, fontWeight: '700' }}>{children}</Text>;
}
function Item({ title, body, meta }: { title: string; body: string; meta?: string }) {
  return (
    <View style={st.row}>
      <Head>{title}</Head>
      {meta ? <Text style={st.sub}>{meta}</Text> : null}
      <P style={{ marginTop: 4 }}>{body}</P>
    </View>
  );
}
const orbStr = (o: number) => `(Orb: ${o.toFixed(2)})`;
const deg = (lon: number) => `${SIGN_GLYPHS[Math.floor(lon / 30)]} ${fmtDeg(lon)}`;
const lonOf = (c: Chart, k: K) => (k === 'asc' ? c.asc : k === 'mc' ? c.mc : c.positions[k]?.lon ?? null);

/** Sinastri çapraz açılarını tüm göstergelerle hesaplar ve orba göre süzer */
export function synAspects(list: CrossAspect[]) {
  return list.filter(x => x.orb <= synOrb(x.a, x.b));
}

// ===================== Sinastri raporu =====================
export function SynastryReport({ me, them, cross, myName, theirName, lang, asteroids }: { me: Chart; them: Chart; cross: CrossAspect[]; myName: string; theirName: string; lang: Lang; asteroids: boolean }) {
  const data = useMemo(() => {
    const sc = score(cross);
    const ar = areas(sc);
    return { sc, ar, sum: summary(sc, ar), qs: questions(sc), int: intimacy(me, them, sc), top: topAspects(sc) };
  }, [cross, me, them]);
  const name = (k: K) => relName(k)[lang];
  const line = (s: Scored) => `${name(s.x.b)} ${ASPECT_INFO[s.x.type].name[lang]} ${name(s.x.a)} (${s.x.orb.toFixed(2)}°)`;
  const shown = cross.filter(x => asteroids || (!ASTS.includes(x.a as BodyId) && !ASTS.includes(x.b as BodyId)));

  return (
    <View>
      <Section title={tx('Kısa Uyum Özeti', 'Quick Compatibility Summary', lang)} sub={tx('Yerleşimler ve açılara göre ilk değerlendirme; ayrıntılar aşağıda.', 'A first assessment from placements and aspects; details below.', lang)}>
        <View style={{ flexDirection: 'row', gap: 10, marginBottom: 10 }}>
          {[
            [tx('Genel durum', 'Overall', lang), data.sum.status[lang], C.rose],
            [tx('Destekleyici', 'Supportive', lang), String(data.sum.support), C.air],
            [tx('Zorlayıcı', 'Challenging', lang), String(data.sum.challenge), C.fire],
          ].map(([k, v, col]) => (
            <View key={k} style={{ flex: 1, borderWidth: 1, borderColor: C.line, borderRadius: 12, padding: 10, alignItems: 'center' }}>
              <Text style={st.sub}>{k}</Text>
              <Text style={{ fontFamily: serif, fontSize: 20, color: col, marginTop: 2, textAlign: 'center' }}>{v}</Text>
            </View>
          ))}
        </View>
        {data.sum.easy.length ? <><Text style={st.rowLabel}>{tx('Kolay akan alanlar', 'Easy-flowing areas', lang)}</Text>{data.sum.easy.map((e, i) => <P key={i}>• {e[lang]}</P>)}</> : null}
        {data.sum.watch.length ? <><Text style={[st.rowLabel, { marginTop: 8 }]}>{tx('Dikkat edilmesi gerekenler', 'Points to watch', lang)}</Text>{data.sum.watch.map((e, i) => <P key={i}>• {e[lang]}</P>)}</> : null}
      </Section>

      <Section title={tx('İlişkiye Dair Temel Sorular', 'Key Questions About the Relationship', lang)}>
        {data.qs.map((q, i) => (
          <View key={i} style={st.row}>
            <Head>{q.q[lang]}</Head>
            <P style={{ marginTop: 4 }}>{q.text[lang]}</P>
            <Text style={[st.sub, { marginTop: 2 }]}><Text style={{ color: C.air }}>{tx('Destek', 'Support', lang)}: {q.sup}</Text>. <Text style={{ color: C.fire }}>{tx('Dikkat', 'Caution', lang)}: {q.cau}</Text></Text>
          </View>
        ))}
      </Section>

      <Section title={tx('Alanlara Göre Uyum Analizi', 'Compatibility by Area', lang)} sub={tx('Puan tek başına kesin hüküm değildir; hangi konularda akış, hangi konularda emek olduğunu gösterir.', 'A score is not a verdict; it shows where things flow and where effort is needed.', lang)}>
        {data.ar.map(a => (
          <View key={a.def.id} style={st.row}>
            <Head>{a.def.title[lang]}</Head>
            <Text style={[st.sub, { marginTop: 2 }]}><Text style={{ color: a.band === 'veryGood' || a.band === 'good' ? C.air : a.band === 'balanced' ? C.gold : C.fire, fontWeight: '700' }}>{BAND[a.band].name[lang]}</Text>, {tx('Puan', 'Score', lang)}: {a.score}</Text>
            <P style={{ marginTop: 4 }}>{BAND[a.band].text[lang]}</P>
            {a.sup.length ? <><Text style={[st.rowLabel, { marginTop: 6 }]}>{tx('Destekleyen göstergeler', 'Supporting indicators', lang)}</Text>{a.sup.map((s, i) => <P key={i}>• <Text style={{ fontWeight: '600' }}>{line(s)}</Text>: {a.def.sup[lang]}.</P>)}</> : null}
            {a.cha.length ? <><Text style={[st.rowLabel, { marginTop: 6 }]}>{tx('Dikkat isteyen göstergeler', 'Indicators needing care', lang)}</Text>{a.cha.map((s, i) => <P key={i}>• <Text style={{ fontWeight: '600' }}>{line(s)}</Text>: {a.def.cha[lang]}.</P>)}</> : null}
          </View>
        ))}
      </Section>

      <Section title={tx('Yakınlık Dili ve İlişki Ritmi', 'Intimacy Language and Rhythm', lang)}>
        <P>{INTIMACY[data.int.lead].lead[lang]}</P>
        <View style={{ marginTop: 8 }}>
          {(Object.keys(INTIMACY) as Intimacy[]).map(k => (
            <View key={k} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <Text style={[st.p, { width: 130 }]}>{INTIMACY[k].name[lang]}</Text>
              <View style={{ flex: 1, height: 10, borderRadius: 5, backgroundColor: C.line }}>
                <View style={{ width: `${data.int.pct[k]}%`, height: 10, borderRadius: 5, backgroundColor: k === data.int.lead ? C.rose : C.gold }} />
              </View>
              <Text style={[st.sub, { width: 40, textAlign: 'right' }]}>%{data.int.pct[k]}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title={tx('En Kolaylaştırıcı Açılar', 'Most Supportive Aspects', lang)}>
        {data.top.easy.map((s, i) => <Item key={i} title={synTitle(s.x.b, s.x.a, s.x.type, theirName)[lang]} meta={`Orb ${s.x.orb.toFixed(2)}°, ${tx('Neden önemli?', 'Why it matters', lang)}`} body={synWhy(s.x.b, s.x.a, s.x.type)[lang]} />)}
      </Section>
      <Section title={tx('En Çok Dikkat İsteyen Açılar', 'Aspects Needing Most Care', lang)}>
        {data.top.hard.map((s, i) => <Item key={i} title={synTitle(s.x.b, s.x.a, s.x.type, theirName)[lang]} meta={`Orb ${s.x.orb.toFixed(2)}°, ${tx('Neden dikkat ister?', 'Why it needs care', lang)}`} body={synWhy(s.x.b, s.x.a, s.x.type)[lang]} />)}
        <Sub style={{ marginTop: 6 }}>{tx('Zorlayıcı açılar ilişkiyi bitirmek zorunda değildir; doğru farkındalıkla tarafların birbirini daha iyi anlamasına yardım eder.', 'Challenging aspects need not end a relationship; with awareness they help you understand each other better.', lang)}</Sub>
      </Section>

      <Section title={tx('Sinastri Açıları', 'Synastry Aspects', lang)}>
        <Expand more={tx('Tümünü göster', 'Show all', lang)} less={tx('Daha az', 'Less', lang)} initial={12} items={shown.map((x, i) => (
          <Item key={i} title={`${synTitle(x.b, x.a, x.type, theirName)[lang]} - ${orbStr(x.orb)}`} body={synLongText(x.b, x.a, x.type, theirName, synPair(x.b, x.a, x.type))[lang]} />
        ))} />
      </Section>
    </View>
  );
}

// ===================== Sinastri tabloları =====================
const GRID_IDS: K[] = [...PLANETS, 'node', 'lilith', 'chiron', 'juno', 'asc', 'mc'];
export function SynastryTables({ me, them, cross, myName, theirName, lang }: { me: Chart; them: Chart; cross: CrossAspect[]; myName: string; theirName: string; lang: Lang }) {
  const rows = GRID_IDS.filter(k => lonOf(me, k) !== null);
  const cols = GRID_IDS.filter(k => lonOf(them, k) !== null);
  const glyph = (k: K) => (k === 'asc' ? 'AC' : k === 'mc' ? 'MC' : BODIES[k].glyph);
  const find = (r: K, c: K) => cross.find(x => x.b === r && x.a === c);
  const cellW = 34;
  const cell = { fontSize: 12, color: C.ink, fontVariant: ['tabular-nums'] as any };
  const ids: K[] = [...PLANETS, 'node', 'chiron', 'juno', 'ceres', 'pallas', 'vesta', 'lilith', 'fortune', 'asc', 'mc'];
  const Placements = ({ c, title }: { c: Chart; title: string }) => (
    <Section title={title}>
      {ids.filter(k => lonOf(c, k) !== null).map(k => {
        const lon = lonOf(c, k)!;
        const h = k === 'asc' ? 1 : k === 'mc' ? 10 : c.positions[k as BodyId].house;
        return (
          <View key={k} style={{ flexDirection: 'row', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={[cell, { flex: 2 }]}>{k === 'asc' || k === 'mc' ? glyph(k) : BODIES[k].glyph} {relName(k)[lang]}</Text>
            <Text style={[cell, { flex: 2 }]}>{fmtDeg(lon)} {SIGNS[Math.floor(lon / 30)][lang]}</Text>
            <Text style={[cell, { width: 50, textAlign: 'right' }]}>{h ? `${h}. ${tx('Ev', 'H', lang)}` : '–'}</Text>
          </View>
        );
      })}
    </Section>
  );
  return (
    <View>
      <Section title={tx('Sinastri Açı Tablosu', 'Synastry Aspect Grid', lang)} sub={tx(`Satırlar: ${myName || 'sen'}, Sütunlar: ${theirName || 'partner'}`, `Rows: ${myName || 'you'}, Columns: ${theirName || 'partner'}`, lang)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ width: 70, height: 44 }} />
              {cols.map(c => (
                <View key={c} style={{ width: cellW, height: 44, alignItems: 'center', justifyContent: 'center', borderWidth: 0.5, borderColor: C.line, backgroundColor: C.roseSoft }}>
                  <Text style={{ fontSize: 13, color: C.second }}>{glyph(c)}</Text>
                  <Text style={{ fontSize: 8, color: C.sub }}>{SIGN_GLYPHS[Math.floor(lonOf(them, c)! / 30)]}{Math.floor(lonOf(them, c)! % 30)}°</Text>
                </View>
              ))}
            </View>
            {rows.map(r => (
              <View key={r} style={{ flexDirection: 'row' }}>
                <View style={{ width: 70, height: cellW, flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 0.5, borderColor: C.line, paddingHorizontal: 4, backgroundColor: C.bg }}>
                  <Text style={{ fontSize: 13, color: C.ink }}>{glyph(r)}</Text>
                  <Text style={{ fontSize: 9, color: C.sub }}>{SIGN_GLYPHS[Math.floor(lonOf(me, r)! / 30)]}{Math.floor(lonOf(me, r)! % 30)}°</Text>
                </View>
                {cols.map(c => {
                  const x = find(r, c);
                  const n = x ? ASPECT_INFO[x.type].nature : null;
                  return (
                    <View key={c} style={{ width: cellW, height: cellW, alignItems: 'center', justifyContent: 'center', borderWidth: x && x.orb < 1 ? 1.5 : 0.5, borderColor: x && x.orb < 1 ? C.ink : C.line }}>
                      {x ? <Text style={{ fontSize: 14, color: n === 'harmonious' ? C.air : n === 'challenging' ? C.fire : C.gold }}>{ASPECT_INFO[x.type].glyph}</Text> : null}
                      {x ? <Text style={{ fontSize: 7, color: C.sub }}>{x.orb.toFixed(1)}</Text> : null}
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ScrollView>
        <Sub style={{ marginTop: 6 }}>{tx('Kalın çerçeve: 1°’den dar orb. Mavi: uyumlu, Kırmızı: zorlayıcı, Altın: kavuşum.', 'Bold frame: orb under 1°. Blue: harmonious, Red: challenging, Gold: conjunction.', lang)}</Sub>
      </Section>

      <Section title={tx('Tüm Sinastri Açıları', 'All Synastry Aspects', lang)}>
        <View style={{ flexDirection: 'row', paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.line }}>
          <Text style={[st.sub, { flex: 1 }]}>{myName || tx('Sen', 'You', lang)}</Text>
          <Text style={[st.sub, { width: 40, textAlign: 'center' }]}>{tx('Açı', 'Asp', lang)}</Text>
          <Text style={[st.sub, { flex: 1 }]}>{theirName || 'Partner'}</Text>
          <Text style={[st.sub, { width: 52, textAlign: 'right' }]}>Orb</Text>
        </View>
        <Expand more={tx('Tümünü göster', 'Show all', lang)} less={tx('Daha az', 'Less', lang)} initial={20} items={cross.map((x, i) => (
          <View key={i} style={{ flexDirection: 'row', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={[cell, { flex: 1 }]}>{relName(x.b)[lang]}</Text>
            <Text style={[cell, { width: 40, textAlign: 'center' }]}>{ASPECT_INFO[x.type].glyph}</Text>
            <Text style={[cell, { flex: 1 }]}>{relName(x.a)[lang]}</Text>
            <Text style={[cell, { width: 52, textAlign: 'right' }]}>{Math.floor(x.orb)}°{String(Math.round((x.orb % 1) * 60)).padStart(2, '0')}′</Text>
          </View>
        ))} />
      </Section>

      <Placements c={me} title={tx(`${myName || 'Senin'} yerleşimlerin`, `${myName || 'Your'} placements`, lang)} />
      <Placements c={them} title={tx(`${theirName || 'Partner'} yerleşimleri`, `${theirName || 'Partner'} placements`, lang)} />
    </View>
  );
}

// ===================== Kompozit / Davison (Astrology Master tarzı) =====================
export function RelChartReport({ chart, kind, lang, asteroids, desc }: { chart: Chart; kind: 'composite' | 'davison'; lang: Lang; asteroids: boolean; desc: string }) {
  const ids: BodyId[] = [...PLANETS, 'juno', 'lilith', 'chiron', 'node', ...(asteroids ? (['ceres', 'pallas', 'vesta'] as BodyId[]) : [])];
  const aspIds = new Set<BodyId>([...PLANETS, 'juno', 'chiron', ...(asteroids ? (['ceres', 'pallas', 'vesta'] as BodyId[]) : [])]);
  const asps = chart.aspects.filter(a => aspIds.has(a.a) && aspIds.has(a.b));
  const H = (t: string) => <Text style={{ fontSize: 20, fontWeight: '800', color: C.ink, letterSpacing: 0.3, marginBottom: 2, marginTop: 4 }}>{t}</Text>;
  return (
    <View>
      <Section>
        <Sub style={{ marginBottom: 8 }}>{desc}</Sub>
        {chart.asc !== null ? <Item title={tx(`Yükselen ${SIGNS[Math.floor(chart.asc / 30)].tr} Burcunda`, `Ascendant in ${SIGNS[Math.floor(chart.asc / 30)].en}`, lang)} body={relAscText(Math.floor(chart.asc / 30), kind)[lang]} /> : null}
      </Section>
      <Section>
        {H(tx('GEZEGENLERİN EV VE BURÇ KONUMLARI', 'PLANETS IN SIGNS AND HOUSES', lang))}
        {ids.filter(id => chart.positions[id]).map(id => {
          const p = chart.positions[id];
          return <Item key={id} title={relPlacementTitle(id, p.sign, p.house)[lang]} body={relPlacementText(id, p.sign, p.house, kind)[lang]} />;
        })}
      </Section>
      <Section>
        {H(tx('GEZEGENLERİN AÇILARI', 'PLANETARY ASPECTS', lang))}
        {asps.length ? asps.map((a, i) => (
          <Item key={i} title={`${relAspectTitle(a.a, a.b, a.type)[lang]} - ${orbStr(a.orb)}`} body={relAspectText(a.a, a.b, a.type, synPair(a.a, a.b, a.type))[lang]} />
        )) : <P>—</P>}
      </Section>
    </View>
  );
}
