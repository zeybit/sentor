import React, { useMemo, useState } from 'react';
import { Linking, Text, View } from 'react-native';
import { useStore } from '../store';
import { STYLE, buildStyleReport } from '../content/style';
import { SIGNS } from '../content/base';
import { Btn, Chips, H2, P, Row, Section, Sub, useLayout } from '../ui/kit';
import { HAIR, MAKEUP, OUTFIT, OUTFIT_PINS, OUTFIT_Q, MAKEUP_PINS, HAIR_PINS, PIECE_NAME, pinterest } from '../content/looks';
import { PieceArt } from '../ui/LookArt';
import { PinStrip } from '../ui/PinStrip';
import { C, serif } from '../theme';

export default function StyleScreen() {
  const { chart, s, lang } = useStore();
  const narrow = useLayout().inner(760) < 560;
  const r = useMemo(() => chart && buildStyleReport(chart), [chart]);
  const [side, setSide] = useState<'venus' | 'asc'>('venus');
  if (!chart || !r) return null;
  const v = STYLE[r.venus];
  const a = r.asc !== null ? STYLE[r.asc] : null;
  const hasAsc = r.asc !== null && r.asc !== r.venus;
  const os = side === 'asc' && hasAsc ? r.asc! : r.venus;

  return (
    <View>
      <H2 style={{ fontSize: 30, lineHeight: 36 }}>{v.aesthetic[lang]}{a ? ` × ${a.aesthetic[lang]}` : ''}</H2>
      <Sub style={{ marginBottom: 14 }}>{lang === 'tr'
        ? `Venüs ${SIGNS[r.venus].tr}${r.asc !== null ? `, Yükselen ${SIGNS[r.asc].tr}` : ''}, Ay ${SIGNS[r.moon].tr}`
        : `Venus in ${SIGNS[r.venus].en}${r.asc !== null ? `, ${SIGNS[r.asc].en} Rising` : ''}, Moon in ${SIGNS[r.moon].en}`}</Sub>

      <Section title={s.palette}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {r.palette.map((c, i) => (
            <View key={i} style={{ width: 92 }}>
              <View style={{ height: 64, borderRadius: 14, backgroundColor: c.hex, borderWidth: 1, borderColor: C.line }} />
              <Text style={{ fontSize: 13, color: C.ink, marginTop: 4, fontWeight: '600' }}>{c.name[lang]}</Text>
              <Text style={{ fontSize: 11, color: C.sub }}>{c.from[lang]}</Text>
            </View>
          ))}
        </View>
        <P style={{ marginTop: 12 }}>{r.elementTip[lang]}</P>
      </Section>


      <Section title={lang === 'tr' ? 'Sana yakışan görünüm' : 'The look that suits you'}
        sub={lang === 'tr' ? 'Makyaj ve saç önerilerine en uyan örnekleri Pinterest\'ten seçtik. Kaydırarak gez, beğendiğini Pinterest\'te aç.' : 'We picked the Pinterest examples closest to your makeup and hair suggestions. Swipe through and open the one you like.'}>
        {[{ k: r.venus, t: lang === 'tr' ? 'İmza görünümün' : 'Your signature look', why: lang === 'tr' ? `Venüs ${SIGNS[r.venus].tr}: kendini en güzel hissettiğin hâl` : `Venus in ${SIGNS[r.venus].en}: when you feel most beautiful` },
          ...(r.asc !== null && r.asc !== r.venus ? [{ k: r.asc, t: lang === 'tr' ? 'İlk izlenim görünümün' : 'Your first-impression look', why: lang === 'tr' ? `Yükselen ${SIGNS[r.asc].tr}: insanların seni ilk gördüğü hâl` : `${SIGNS[r.asc].en} Rising: how people first see you` }] : [])]
          .map((x, xi) => (
            <View key={x.t} style={{ marginTop: xi ? 26 : 4 }}>
              <Text style={{ fontFamily: serif, fontSize: 21, color: C.ink }}>{x.t}</Text>
              <Sub style={{ marginBottom: 12 }}>{x.why}</Sub>
              {([
                ['m', lang === 'tr' ? 'Makyaj' : 'Makeup', MAKEUP[x.k].name[lang], [MAKEUP[x.k].shadow, MAKEUP[x.k].lip, MAKEUP[x.k].blush], MAKEUP_PINS[x.k], MAKEUP[x.k].q],
                ['h', lang === 'tr' ? 'Saç' : 'Hair', HAIR[x.k].name[lang], [HAIR[x.k].color], HAIR_PINS[x.k], HAIR[x.k].q],
              ] as const).map(([key, lab, val, sw, pins, q]) => (
                <View key={key} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                    <Text style={{ fontSize: 12, color: C.sub, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 }}>{lab}</Text>
                    <Text style={{ fontSize: 16, color: C.ink, fontWeight: '600' }}>{val}</Text>
                    {sw.map(c => <View key={c} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c, borderWidth: 1, borderColor: C.line }} />)}
                    <View style={{ flex: 1 }} />
                    <Btn small kind="ghost" title={lang === 'tr' ? 'Daha fazla' : 'More'} onPress={() => Linking.openURL(pinterest(q))} />
                  </View>
                  <PinStrip pins={pins.map(id => ({ id, t: val }))} lang={lang} />
                </View>
              ))}
            </View>
          ))}
      </Section>

      <Section title={lang === 'tr' ? 'Kombin panon' : 'Your outfit board'}
        sub={lang === 'tr' ? 'Hangi tarafını öne çıkarmak istediğini seç; parçalar ve örnekler ona göre değişir.' : 'Choose which side of you to dress; the pieces and examples change with it.'}>
        {hasAsc ? <View style={{ marginBottom: 14 }}><Chips items={[
          { key: 'venus', label: lang === 'tr' ? `${SIGNS[r.venus].tr} (Venüs): ${STYLE[r.venus].aesthetic.tr}` : `${SIGNS[r.venus].en} (Venus): ${STYLE[r.venus].aesthetic.en}` },
          { key: 'asc', label: lang === 'tr' ? `${SIGNS[r.asc!].tr} (Yükselen): ${STYLE[r.asc!].aesthetic.tr}` : `${SIGNS[r.asc!].en} (Rising): ${STYLE[r.asc!].aesthetic.en}` },
        ]} value={side} onChange={setSide} /></View> : null}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {OUTFIT[os].map(({ piece, c }) => {
            const col = typeof c === 'number' ? (STYLE[os].colors[c]?.hex ?? '#999') : c;
            return (
              <View key={piece} style={{ width: narrow ? '30%' : 100, alignItems: 'center', backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 10 }}>
                <PieceArt piece={piece} color={col} ink={C.ink} size={60} />
                <Text style={{ fontSize: 12, color: C.ink, marginTop: 4, textAlign: 'center' }}>{PIECE_NAME[piece][lang]}</Text>
              </View>
            );
          })}
        </View>
        <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink, marginTop: 18, marginBottom: 2 }}>{lang === 'tr' ? `${STYLE[os].aesthetic.tr}: Pinterest'ten 5 kombin` : `${STYLE[os].aesthetic.en}: 5 outfits from Pinterest`}</Text>
        <Sub style={{ marginBottom: 10 }}>{STYLE[os].clothes[lang]}</Sub>
        <PinStrip key={os} pins={OUTFIT_PINS[os]} lang={lang} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <Btn small kind="outline" title={lang === 'tr' ? "Pinterest'te daha fazlası" : 'More on Pinterest'} onPress={() => Linking.openURL(pinterest(OUTFIT_Q[os]))} />
        </View>
      </Section>

      <Section title={s.styleSig} sub={`${s.styleSigSub} (${SIGNS[r.venus][lang]})`}>
        <Row label={s.clothes}>{v.clothes[lang]}</Row>
        <Row label={s.makeup}>{v.makeup[lang]}</Row>
        <Row label={s.accessories}>{v.accessories[lang]}</Row>
        <Row label={s.scent}>{v.scent[lang]}</Row>
        <Row label={s.avoid}>{v.avoid[lang]}</Row>
      </Section>

      {a ? (
        <Section title={s.firstImpression} sub={`${s.firstImpressionSub}, ${SIGNS[r.asc!][lang]}`}>
          <Row label={s.clothes}>{a.clothes[lang]}</Row>
          <Row label={s.hair}>{a.hair[lang]}</Row>
          <Row label={s.makeup}>{a.makeup[lang]}</Row>
        </Section>
      ) : (
        <Section title={s.firstImpression}>
          <P>{s.needsTime}</P>
          <Row label={s.hair}>{v.hair[lang]}</Row>
        </Section>
      )}

      {r.firstHouse.length ? (
        <Section title={s.firstHouse}>
          {r.firstHouse.map((f, i) => <P key={i} style={{ marginBottom: 8 }}>{f[lang]}</P>)}
        </Section>
      ) : null}

      <Section>
        <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink }}>{s.comfort}</Text>
        <P style={{ marginBottom: 10 }}>{STYLE[r.moon].comfort[lang]}</P>
        <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink }}>{s.power}</Text>
        <P style={{ marginBottom: 10 }}>{STYLE[r.mars].power[lang]}</P>
        {r.mc !== null ? <>
          <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink }}>{s.work}</Text>
          <P>{STYLE[r.mc].work[lang]}</P>
        </> : null}
      </Section>
    </View>
  );
}
