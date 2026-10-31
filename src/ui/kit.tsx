import React, { useState } from 'react';
import { Pressable, Text, TextInput, TextInputProps, useWindowDimensions, View, ViewStyle } from 'react-native';
import { C, F, onThemeChange } from '../theme';

/** Ekran genişliğine göre düzen: telefon / tablet / masaüstü */
export function useLayout() {
  const { width } = useWindowDimensions();
  const wide = width >= 960, tablet = width >= 700;
  /** İçerik sütununun gerçek genişliği (kenar çubuğu ve boşluklar düşülür) */
  const pad = wide ? 96 : tablet ? 64 : 32;
  const inner = (max = 760) => Math.min(max, width - (wide ? 248 : 0)) - pad;
  return { width, wide, tablet, twoCol: width >= 1180, inner };
}

export const H1 = ({ children, style }: { children: React.ReactNode; style?: any }) => <Text accessibilityRole="header" style={[st.h1, style]}>{children}</Text>;
export const H2 = ({ children, style }: { children: React.ReactNode; style?: any }) => <Text accessibilityRole="header" style={[st.h2, style]}>{children}</Text>;
export const H3 = ({ children, style }: { children: React.ReactNode; style?: any }) => <Text style={[st.h3, style]}>{children}</Text>;
export const Sub = ({ children, style }: { children: React.ReactNode; style?: any }) => <Text style={[st.sub, style]}>{children}</Text>;
export const P = ({ children, style }: { children: React.ReactNode; style?: any }) => <Text style={[st.p, style]}>{children}</Text>;

/** Bölüm: kutu yok; başlık, isteğe bağlı açıklama ve içerik. `panel` vurgulu zemin verir. */
export function Section({ title, sub, children, style, panel }: { title?: string; sub?: string; children: React.ReactNode; style?: ViewStyle; panel?: boolean }) {
  return (
    <View style={[st.section, panel && st.panel, style]}>
      {title ? <H2>{title}</H2> : null}
      {sub ? <Sub style={{ marginBottom: 12, maxWidth: 620 }}>{sub}</Sub> : null}
      {children}
    </View>
  );
}

export function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={st.row}>
      <Text style={st.rowLabel}>{label}</Text>
      <Text style={st.p}>{children}</Text>
    </View>
  );
}

export function Btn({ title, onPress, kind = 'primary', disabled, small }: { title: string; onPress: () => void; kind?: 'primary' | 'ghost' | 'outline'; disabled?: boolean; small?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed, hovered }: any) => [st.btn, small && st.btnSmall, kind === 'ghost' && st.btnGhost, kind === 'outline' && st.btnOutline,
        hovered && !disabled && { opacity: 0.88 }, (pressed || disabled) && { opacity: 0.55 }]}>
      <Text style={[st.btnText, small && { fontSize: 14 }, kind !== 'primary' && { color: C.rose }]}>{title}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string; hint?: string; error?: string }) {
  const { label, style, hint, error, ...rest } = props;
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label ? <Text style={st.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={C.sub} accessibilityLabel={label || props.placeholder}
        onFocus={e => { setFocus(true); props.onFocus?.(e); }} onBlur={e => { setFocus(false); props.onBlur?.(e); }}
        style={[st.input, focus && { borderColor: C.rose }, !!error && { borderColor: C.danger }, style]} {...rest} />
      {error ? <Text accessibilityRole="alert" style={{ color: C.danger, fontSize: 13, marginTop: 4, fontFamily: F.sansMed }}>{error}</Text>
        : hint ? <Text style={[st.sub, { fontSize: 13, marginTop: 4 }]}>{hint}</Text> : null}
    </View>
  );
}

/** Seçim çipleri: seçili olan mürekkeple dolar */
export function Chips<T extends string>({ items, value, onChange, wrap = true }: { items: { key: T; label: string }[]; value: T; onChange: (v: T) => void; wrap?: boolean }) {
  return (
    <View style={[st.chips, !wrap && { flexWrap: 'nowrap' }]} accessibilityRole="radiogroup">
      {items.map(i => {
        const on = i.key === value;
        return (
          <Pressable key={i.key} onPress={() => onChange(i.key)} accessibilityRole="radio" accessibilityState={{ selected: on, checked: on }}
            style={({ hovered }: any) => [st.chip, on && st.chipOn, hovered && !on && { borderColor: C.sub }]}>
            <Text style={[st.chipText, on && { color: C.bg, fontFamily: F.sansMed }]}>{i.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** İki-üç görünüm arasında geçiş (Yorumlar / Tablolar gibi) */
export function Segmented<T extends string>({ items, value, onChange }: { items: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={st.seg} accessibilityRole="tablist">
      {items.map(i => {
        const on = i.key === value;
        return (
          <Pressable key={i.key} onPress={() => onChange(i.key)} accessibilityRole="tab" accessibilityState={{ selected: on }} style={[st.segItem, on && st.segOn]}>
            <Text style={[st.segText, on && { color: C.ink, fontFamily: F.sansBold, fontWeight: '700' }]}>{i.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Meter({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <View style={{ flex: 1, minWidth: 130, marginBottom: 12 }} accessibilityLabel={`${label}: ${value}/${max}`}>
      <Text style={st.label}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
        {Array.from({ length: max }).map((_, i) => (
          <View key={i} style={{ flex: 1, height: 6, borderRadius: 1, backgroundColor: i < value ? C.rose : C.line }} />
        ))}
      </View>
    </View>
  );
}

export function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <View style={{ marginBottom: 12 }} accessibilityLabel={`${label}: %${pct}`}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={st.p}>{label}</Text><Text style={[st.p, { fontFamily: F.sansBold, fontWeight: '700', fontVariant: ['tabular-nums'] }]}>%{pct}</Text>
      </View>
      <View style={{ height: 6, borderRadius: 1, backgroundColor: C.line, marginTop: 5 }}>
        <View style={{ width: `${pct}%`, height: 6, borderRadius: 1, backgroundColor: C.rose }} />
      </View>
    </View>
  );
}

/** Uzun listeleri kısaltır; kaç öğe gizli olduğunu söyler */
export function Expand({ items, initial = 4, more, less }: { items: React.ReactNode[]; initial?: number; more: string; less: string }) {
  const [open, setOpen] = useState(false);
  const hidden = items.length - initial;
  return (
    <View>
      {(open ? items : items.slice(0, initial))}
      {hidden > 0 ? <Btn kind="ghost" small title={open ? less : `${more} (${hidden})`} onPress={() => setOpen(!open)} /> : null}
    </View>
  );
}

/** Bilgi şeridi (durum, geri alma) */
export function Notice({ text, action, onAction, tone = 'info' }: { text: string; action?: string; onAction?: () => void; tone?: 'info' | 'warn' }) {
  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tone === 'warn' ? C.goldSoft : C.ink, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 14 }}>
      <Text style={{ flex: 1, color: tone === 'warn' ? C.ink : C.bg, fontSize: 14, fontFamily: F.sans }}>{text}</Text>
      {action ? <Pressable onPress={onAction} accessibilityRole="button" hitSlop={8}><Text style={{ color: tone === 'warn' ? C.rose : C.gold, fontFamily: F.sansBold, fontWeight: '700' }}>{action}</Text></Pressable> : null}
    </View>
  );
}

const makeSt = () => ({
  h1: { fontFamily: F.serif, fontSize: 36, lineHeight: 42, color: C.ink, marginBottom: 6, letterSpacing: -0.4, fontWeight: '500' },
  h2: { fontFamily: F.serif, fontSize: 25, lineHeight: 31, color: C.ink, marginBottom: 6, fontWeight: '500' },
  h3: { fontFamily: F.serifBold, fontSize: 19, lineHeight: 25, color: C.ink, fontWeight: '700' },
  sub: { fontFamily: F.sans, fontSize: 14, lineHeight: 21, color: C.sub },
  p: { fontFamily: F.sans, fontSize: 16, lineHeight: 25, color: C.ink },
  section: { marginBottom: 36 },
  panel: { backgroundColor: C.card, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: C.line },
  row: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: C.line },
  rowLabel: { fontFamily: F.sansBold, fontSize: 13, fontWeight: '700', color: C.rose, marginBottom: 4, letterSpacing: 0.2 },
  btn: { backgroundColor: C.rose, borderRadius: 12, minHeight: 48, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnSmall: { minHeight: 38, paddingHorizontal: 12 },
  btnGhost: { backgroundColor: 'transparent', alignSelf: 'flex-start', paddingHorizontal: 0 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.rose },
  btnText: { color: C.onAccent, fontFamily: F.sansBold, fontWeight: '700', fontSize: 16 },
  label: { fontFamily: F.sansMed, fontSize: 14, color: C.ink, marginBottom: 6, fontWeight: '500' },
  input: { fontFamily: F.sans, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink, backgroundColor: C.card, minHeight: 48 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { borderRadius: 10, borderWidth: 1, borderColor: C.line, paddingHorizontal: 14, minHeight: 38, justifyContent: 'center', backgroundColor: 'transparent' },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontFamily: F.sans, fontSize: 14, color: C.ink },
  seg: { flexDirection: 'row', gap: 22, borderBottomWidth: 1, borderBottomColor: C.line, marginBottom: 20 },
  segItem: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  segOn: { borderBottomColor: C.gold },
  segText: { fontFamily: F.sansMed, fontSize: 15, color: C.sub },
}) as const;
/** Stil nesnesi: tema değişince yerinde yenilenir */
export const st: ReturnType<typeof makeSt> = makeSt();
onThemeChange(() => Object.assign(st, makeSt()));
