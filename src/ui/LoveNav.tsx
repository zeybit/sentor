// Aşk ekranının iki ayrı gezinme tasarımı:
// telefon: her bölüm bir kart, dokununca içine girilir ("‹ Aşk" ile geri dönülür);
// web: solda yapışkan bölüm menüsü, sağda içerik.
import React from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { C, F } from '../theme';

export type LovePart = 'spouse' | 'compat' | 'group' | 'story';
export interface LoveItem { key: LovePart; title: string; desc: string; teaser?: string }

/** Her bölümün küçük çizgi işareti */
export function LoveGlyph({ k, size = 40, color }: { k: LovePart; size?: number; color: string }) {
  const p = { stroke: color, strokeWidth: 1.4, fill: 'none', strokeLinecap: 'round' as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      {k === 'spouse' && (<>
        <Circle cx={16} cy={22} r={9} {...p} /><Circle cx={24} cy={22} r={9} {...p} />
        <Path d="M20 6 l2 3 -2 3 -2 -3 Z" {...p} fill={color} fillOpacity={0.35} />
      </>)}
      {k === 'compat' && (<>
        <Circle cx={14} cy={20} r={8} {...p} /><Circle cx={26} cy={20} r={8} {...p} />
        <Path d="M20 14.2 a8 8 0 0 1 0 11.6 a8 8 0 0 1 0 -11.6 Z" fill={color} fillOpacity={0.35} />
      </>)}
      {k === 'group' && (<>
        <Circle cx={20} cy={13} r={6} {...p} /><Circle cx={13} cy={25} r={6} {...p} /><Circle cx={27} cy={25} r={6} {...p} />
      </>)}
      {k === 'story' && (<>
        <Line x1={6} y1={20} x2={34} y2={20} {...p} />
        <Circle cx={9} cy={20} r={2.6} fill={color} /><Circle cx={18} cy={20} r={2.6} {...p} />
        <Circle cx={26} cy={20} r={2.6} fill={color} fillOpacity={0.4} stroke={color} strokeWidth={1.4} /><Circle cx={33} cy={20} r={2.6} {...p} />
        <Path d="M18 15 q4 -8 8 0" {...p} />
      </>)}
    </Svg>
  );
}

/** Telefon: bölüm kartları */
export function LoveHub({ items, onOpen }: { items: LoveItem[]; onOpen: (k: LovePart) => void }) {
  return (
    <View style={{ gap: 12, marginBottom: 24 }}>
      {items.map((it, i) => (
        <Pressable key={it.key} onPress={() => onOpen(it.key)} accessibilityRole="button" accessibilityLabel={it.title}
          style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: C.glass, borderWidth: 1, borderColor: C.line, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 16 }, pressed && { opacity: 0.75, transform: [{ scale: 0.99 }] }]}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: C.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
            <LoveGlyph k={it.key} size={34} color={C.gold} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: F.sansMed, fontSize: 11, letterSpacing: 1.6, color: C.gold }}>{String(i + 1).padStart(2, '0')}</Text>
            <Text style={{ fontFamily: F.serif, fontSize: 21, lineHeight: 26, color: C.ink, marginTop: 1 }}>{it.title}</Text>
            <Text style={{ fontFamily: F.sans, fontSize: 14, lineHeight: 20, color: C.sub, marginTop: 2 }}>{it.desc}</Text>
            {it.teaser ? <Text numberOfLines={1} style={{ fontFamily: F.sansMed, fontSize: 13, color: C.rose, marginTop: 6 }}>{it.teaser}</Text> : null}
          </View>
          <Text style={{ fontSize: 26, color: C.sub, marginLeft: 2 }}>›</Text>
        </Pressable>
      ))}
    </View>
  );
}

/** Telefon: bölümün içindeyken üst çubuk */
export function LoveBack({ back, onBack }: { back: string; onBack: () => void }) {
  return (
    <View style={{ marginBottom: 6 }}>
      <Pressable onPress={onBack} accessibilityRole="button" accessibilityLabel={back} hitSlop={10} style={({ pressed }) => [{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 4, paddingRight: 10 }, pressed && { opacity: 0.6 }]}>
        <Text style={{ fontSize: 24, color: C.rose, marginRight: 4, marginTop: -2 }}>‹</Text>
        <Text style={{ fontFamily: F.sansMed, fontSize: 15, color: C.rose }}>{back}</Text>
      </Pressable>
    </View>
  );
}

/** Web: solda yapışkan bölüm menüsü */
export function LoveRail({ items, value, onChange }: { items: LoveItem[]; value: LovePart; onChange: (k: LovePart) => void }) {
  return (
    <View style={[{ width: 250, gap: 4 }, Platform.OS === 'web' ? ({ position: 'sticky', top: 24, alignSelf: 'flex-start' } as any) : null]}>
      {items.map(it => {
        const on = it.key === value;
        return (
          <Pressable key={it.key} onPress={() => onChange(it.key)} accessibilityRole="tab" accessibilityState={{ selected: on }}
            style={({ hovered, pressed }: any) => [{ flexDirection: 'row', gap: 12, paddingVertical: 12, paddingHorizontal: 12, borderRadius: 10, borderLeftWidth: 2, borderLeftColor: on ? C.gold : 'transparent', backgroundColor: on ? C.goldSoft : hovered ? C.glass : 'transparent' }, pressed && { opacity: 0.7 }]}>
            <LoveGlyph k={it.key} size={30} color={on ? C.gold : C.sub} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: on ? F.sansBold : F.sansMed, fontWeight: on ? '700' : '500', fontSize: 15, color: C.ink }}>{it.title}</Text>
              <Text style={{ fontFamily: F.sans, fontSize: 13, lineHeight: 18, color: C.sub, marginTop: 2 }}>{it.desc}</Text>
              {it.teaser ? <Text numberOfLines={1} style={{ fontFamily: F.sansMed, fontSize: 12, color: C.rose, marginTop: 4 }}>{it.teaser}</Text> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
