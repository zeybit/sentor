import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Svg, { Line, Rect, Text as SvgText } from 'react-native-svg';
import type { BodyId, Chart } from '../engine/astro';
import { PLANETS, positionsAt, fmtDeg, houseOf } from '../engine/astro';
import { BODIES, SIGNS, SIGN_GLYPHS, SIGN_ELEMENT } from '../content/base';
import { C, F } from '../theme';

type Lang = 'tr' | 'en';
const EL = { fire: 'fire', earth: 'earth', air: 'air', water: 'water' } as const;

/**
 * Gökyüzü şeridi: zodyak kuşağı düz bir cetvel gibi açılır.
 * Üstte şu anki gezegenler, altta doğum haritandaki yerleri. Bir gezegene dokununca konumu yazılır.
 */
export default function SkyBand({ natal, width, lang }: { natal: Chart; width: number; lang: Lang }) {
  const now = useMemo(() => new Date(), []);
  const sky = useMemo(() => positionsAt(now, [...PLANETS, 'node']), [now]);
  const [sel, setSel] = useState<BodyId>('moon');
  const W = Math.max(280, width), bandY = 46, bandH = 30, H = 128;
  const x = (lon: number) => (((lon - natal.ayanamsa) % 360 + 360) % 360) / 360 * W;
  const lonOf = (id: BodyId) => (sky[id].lon - natal.ayanamsa + 360) % 360;

  // Çakışmayı önlemek için yakın gezegenleri dikey kaydır
  const place = (ids: BodyId[], getX: (id: BodyId) => number) => {
    const sorted = [...ids].sort((a, b) => getX(a) - getX(b));
    const lvl: Record<string, number> = {};
    let lastX = -99, l = 0;
    for (const id of sorted) { const px = getX(id); l = px - lastX < 15 ? (l + 1) % 3 : 0; lvl[id] = l; lastX = px; }
    return lvl;
  };
  const ids = [...PLANETS] as BodyId[];
  const top = place(ids, id => x(sky[id].lon));
  const bot = place(ids, id => x(natal.positions[id].lon + natal.ayanamsa));
  const selLon = lonOf(sel);
  const selHouse = natal.cusps.length ? houseOf(selLon, natal.cusps) : 0;
  const nat = natal.positions[sel];

  return (
    <View accessibilityLabel={lang === 'tr' ? 'Gökyüzü şeridi: gezegenlerin şu anki ve doğum anındaki yerleri' : 'Sky band: planets now and at birth'}>
      <View style={{ width: W, height: H }}>
        <Svg width={W} height={H}>
          {SIGNS.map((_, i) => {
            const el = EL[SIGN_ELEMENT[i]];
            return (
              <React.Fragment key={i}>
                <Rect x={(i * W) / 12} y={bandY} width={W / 12} height={bandH} fill={(C as any)[el]} opacity={i % 2 ? 0.1 : 0.17} />
                <SvgText x={(i * W) / 12 + W / 24} y={bandY + 20} fontSize={13} fill={(C as any)[el]} textAnchor="middle">{SIGN_GLYPHS[i]}</SvgText>
                <Line x1={(i * W) / 12} y1={bandY} x2={(i * W) / 12} y2={bandY + bandH} stroke={C.line} strokeWidth={1} />
              </React.Fragment>
            );
          })}
          <Line x1={0} y1={bandY} x2={W} y2={bandY} stroke={C.ink} strokeWidth={1} />
          <Line x1={0} y1={bandY + bandH} x2={W} y2={bandY + bandH} stroke={C.ink} strokeWidth={1} />
          {ids.map(id => {
            const px = x(sky[id].lon), on = id === sel;
            return (
              <React.Fragment key={'t' + id}>
                <Line x1={px} y1={bandY - 2} x2={px} y2={bandY + 6} stroke={on ? C.gold : C.ink} strokeWidth={on ? 2 : 1.2} />
                <SvgText x={px} y={bandY - 8 - top[id] * 13} fontSize={on ? 16 : 14} fontWeight={on ? '700' : '400'} fill={on ? C.gold : C.ink} textAnchor="middle">{BODIES[id].glyph}</SvgText>
              </React.Fragment>
            );
          })}
          {ids.map(id => {
            const px = x(natal.positions[id].lon + natal.ayanamsa);
            return (
              <React.Fragment key={'n' + id}>
                <Line x1={px} y1={bandY + bandH - 6} x2={px} y2={bandY + bandH + 2} stroke={C.sub} strokeWidth={1} />
                <SvgText x={px} y={bandY + bandH + 16 + bot[id] * 12} fontSize={11} fill={C.sub} textAnchor="middle">{BODIES[id].glyph}</SvgText>
              </React.Fragment>
            );
          })}
        </Svg>
        {/* Dokunma alanları */}
        {ids.map(id => (
          <Pressable key={'p' + id} onPress={() => setSel(id)} accessibilityRole="button" accessibilityLabel={BODIES[id].name[lang]}
            style={{ position: 'absolute', left: x(sky[id].lon) - 12, top: bandY - 26 - top[id] * 13, width: 24, height: 26 }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 }}>
        <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.ink }}>{lang === 'tr' ? 'Üstte: şu an' : 'Above: now'}</Text>
        <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub }}>{lang === 'tr' ? 'Altta: doğduğun an' : 'Below: your birth'}</Text>
      </View>
      <Text style={{ fontFamily: F.sans, fontSize: 15, lineHeight: 22, color: C.ink, marginTop: 10 }}>
        <Text style={{ color: C.gold, fontFamily: F.sansBold, fontWeight: '700' }}>{BODIES[sel].glyph} {BODIES[sel].name[lang]}</Text>
        {lang === 'tr'
          ? ` şu an ${SIGNS[Math.floor(selLon / 30)].tr} ${fmtDeg(selLon)}${sky[sel].retro ? ', geri harekette' : ''}${selHouse ? `, senin ${selHouse}. evinde` : ''}. Doğduğunda ${SIGNS[nat.sign].tr} ${fmtDeg(nat.lon)} konumundaydı.`
          : ` is now at ${fmtDeg(selLon)} ${SIGNS[Math.floor(selLon / 30)].en}${sky[sel].retro ? ', retrograde' : ''}${selHouse ? `, in your ${selHouse}th house` : ''}. At your birth it was at ${fmtDeg(nat.lon)} ${SIGNS[nat.sign].en}.`}
      </Text>
    </View>
  );
}
