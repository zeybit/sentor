import React, { useMemo } from 'react';
import { Linking, Text, View } from 'react-native';
import { useStore } from '../store';
import { STYLE, buildStyleReport } from '../content/style';
import { SIGNS } from '../content/base';
import { Btn, H2, P, Row, Section, Sub, useLayout } from '../ui/kit';
import { HAIR, MAKEUP, OUTFIT, OUTFIT_Q, PIECE_NAME, pinterest } from '../content/looks';
import { FaceArt, PieceArt } from '../ui/LookArt';
import { C, serif } from '../theme';

export default function StyleScreen() {
  const { chart, s, lang } = useStore();
  const narrow = useLayout().inner(760) < 560;
  const r = useMemo(() => chart && buildStyleReport(chart), [chart]);
  if (!chart || !r) return null;
  const v = STYLE[r.venus];
  const a = r.asc !== null ? STYLE[r.asc] : null;

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
        sub={lang === 'tr' ? 'Önerileri aramana gerek kalmadan çizdik. Daha fazla örnek için butona dokun, Pinterest hazır aramayla açılır.' : 'We drew the suggestions so you don\'t have to search. Tap a button to open Pinterest with the search ready.'}>
        <View style={{ flexDirection: narrow ? 'column' : 'row', gap: 18 }}>
          {[{ k: r.venus, t: lang === 'tr' ? 'İmza görünümün' : 'Your signature look', why: lang === 'tr' ? `Venüs ${SIGNS[r.venus].tr}: kendini en güzel hissettiğin hâl` : `Venus in ${SIGNS[r.venus].en}: when you feel most beautiful` },
            ...(r.asc !== null && r.asc !== r.venus ? [{ k: r.asc, t: lang === 'tr' ? 'İlk izlenim görünümün' : 'Your first-impression look', why: lang === 'tr' ? `Yükselen ${SIGNS[r.asc].tr}: insanların seni ilk gördüğü hâl` : `${SIGNS[r.asc].en} Rising: how people first see you` }] : [])]
            .map(x => (
              <View key={x.t} style={{ flex: 1, alignItems: 'center', borderWidth: 1, borderColor: C.line, borderRadius: 14, padding: 14 }}>
                <Text style={{ fontFamily: serif, fontSize: 19, color: C.ink, alignSelf: 'flex-start' }}>{x.t}</Text>
                <Sub style={{ alignSelf: 'flex-start', marginBottom: 8 }}>{x.why}</Sub>
                <FaceArt m={MAKEUP[x.k]} h={HAIR[x.k]} size={190} bg={C.bg} />
                <View style={{ alignSelf: 'stretch', marginTop: 10, gap: 6 }}>
                  {[
                    [lang === 'tr' ? 'Makyaj' : 'Makeup', MAKEUP[x.k].name[lang], [MAKEUP[x.k].shadow, MAKEUP[x.k].lip, MAKEUP[x.k].blush]],
                    [lang === 'tr' ? 'Saç' : 'Hair', HAIR[x.k].name[lang], [HAIR[x.k].color]],
                  ].map(([lab, val, sw]) => (
                    <View key={lab as string} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <Text style={{ fontSize: 12, color: C.sub, width: 56 }}>{lab as string}</Text>
                      <Text style={{ flex: 1, fontSize: 14, color: C.ink }}>{val as string}</Text>
                      {(sw as string[]).map(c => <View key={c} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: c, borderWidth: 1, borderColor: C.line }} />)}
                    </View>
                  ))}
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12, alignSelf: 'stretch' }}>
                  <Btn small kind="outline" title={lang === 'tr' ? 'Makyaj örnekleri' : 'Makeup ideas'} onPress={() => Linking.openURL(pinterest(MAKEUP[x.k].q))} />
                  <Btn small kind="outline" title={lang === 'tr' ? 'Saç örnekleri' : 'Hair ideas'} onPress={() => Linking.openURL(pinterest(HAIR[x.k].q))} />
                </View>
              </View>
            ))}
        </View>
      </Section>

      <Section title={lang === 'tr' ? 'Kombin panon' : 'Your outfit board'}
        sub={lang === 'tr' ? `${v.aesthetic.tr} tarzı, kendi renk paletinle` : `${v.aesthetic.en} style, in your own palette`}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {OUTFIT[r.venus].map(({ piece, c }) => {
            const col = typeof c === 'number' ? (STYLE[r.venus].colors[c]?.hex ?? '#999') : c;
            return (
              <View key={piece} style={{ width: narrow ? '30%' : 100, alignItems: 'center', backgroundColor: C.bg, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 10 }}>
                <PieceArt piece={piece} color={col} ink={C.ink} size={60} />
                <Text style={{ fontSize: 12, color: C.ink, marginTop: 4, textAlign: 'center' }}>{PIECE_NAME[piece][lang]}</Text>
              </View>
            );
          })}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
          <Btn small kind="outline" title={lang === 'tr' ? 'Bu tarzda kombinler' : 'Outfits in this style'} onPress={() => Linking.openURL(pinterest(OUTFIT_Q[r.venus]))} />
          {a && r.asc !== r.venus ? <Btn small kind="ghost" title={lang === 'tr' ? `${SIGNS[r.asc!].tr} yükselen tarzı` : `${SIGNS[r.asc!].en} rising style`} onPress={() => Linking.openURL(pinterest(OUTFIT_Q[r.asc!]))} /> : null}
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
