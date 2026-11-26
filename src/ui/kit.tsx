import React, { useState } from 'react';
import { Platform } from 'react-native';
import { Modal, Pressable, Text, TextInput, TextInputProps, useWindowDimensions, View, ViewStyle } from 'react-native';
import { C, F, onThemeChange } from '../theme';
import { useStore } from '../store';

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
/** Düz metne çevrilebiliyorsa metni döndürür (uzunluk ölçmek için) */
const plain = (n: React.ReactNode): string | null => typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) && n.every(x => typeof x === 'string' || typeof x === 'number' || x == null || x === false) ? n.filter(x => x != null && x !== false).join('') : null;
const LONG = 300;

/** "Devamını oku / Daha az" bağlantısı */
export function MoreLink({ open, onPress, count }: { open: boolean; onPress: () => void; count?: number }) {
  const { lang } = useStore();
  const label = open ? (lang === 'tr' ? 'Daha az göster' : 'Show less') : `${lang === 'tr' ? 'Devamını oku' : 'Read more'}${count ? ` (${count})` : ''}`;
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={onPress} hitSlop={6} style={{ alignSelf: 'flex-start', paddingVertical: 6 }}>
      <Text style={{ fontFamily: F.sansBold, fontWeight: '700', fontSize: 14, color: C.rose }}>{label} {open ? '↑' : '↓'}</Text>
    </Pressable>
  );
}

/**
 * Paragraf. Uzun düz metinler (yorumlar) önce birkaç satır gösterilir, "Devamını oku" ile açılır.
 * `full` kısaltmayı kapatır, `lines` görünen satır sayısını değiştirir.
 */
export function P({ children, style, full, lines = 4 }: { children: React.ReactNode; style?: any; full?: boolean; lines?: number }) {
  const [open, setOpen] = useState(false);
  const [fits, setFits] = useState(false); // webde metin zaten sığıyorsa bağlantı gösterilmez
  const ref = React.useRef<any>(null);
  const txt = full ? null : plain(children);
  if (!txt || txt.length < LONG) return <Text style={[st.p, style]}>{children}</Text>;
  const measure = () => {
    if (Platform.OS !== 'web' || open) return;
    const el = ref.current as HTMLElement | null;
    if (el && typeof el.scrollHeight === 'number') setFits(el.scrollHeight <= el.clientHeight + 2);
  };
  return (
    <View>
      {/* key: React Native Web, satır sınırı kalkınca eski line-clamp stilini bırakıyor; açılıp kapanınca yeniden çizilir */}
      <Text ref={ref} onLayout={measure} key={open ? 'open' : 'closed'} style={[st.p, style]} numberOfLines={open ? undefined : lines}>{children}</Text>
      {fits && !open ? null : <MoreLink open={open} onPress={() => setOpen(!open)} />}
    </View>
  );
}

/** İlk içerik her zaman görünür; geri kalanı "Devamını oku" ile açılır */
export function More({ preview, children, count }: { preview?: React.ReactNode; children: React.ReactNode; count?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      {preview}
      {open ? children : null}
      <MoreLink open={open} onPress={() => setOpen(!open)} count={count} />
    </View>
  );
}

/** Bölüm: kutu yok; başlık, isteğe bağlı açıklama ve içerik. `panel` vurgulu zemin verir. */
export function Section({ title, sub, children, style, panel }: { title?: string; sub?: string; children: React.ReactNode; style?: ViewStyle; panel?: boolean }) {
  return (
    <View style={[st.section, panel && st.panel, style]} {...(panel ? ({ dataSet: { lift: '1' } } as any) : {})}>
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
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: !!disabled }} disabled={disabled} onPress={onPress} {...({ dataSet: { btn: kind } } as any)}
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
            <Text style={[st.chipText, on && { color: C.onAccent, fontFamily: F.sansBold, fontWeight: '700' }]}>{i.label}</Text>
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
  h1: { fontFamily: F.serif, fontSize: 42, lineHeight: 48, color: C.ink, marginBottom: 6, letterSpacing: -0.8, fontWeight: '400' },
  h2: { fontFamily: F.serif, fontSize: 26, lineHeight: 32, color: C.ink, marginBottom: 6, fontWeight: '400', letterSpacing: -0.3 },
  h3: { fontFamily: F.serifBold, fontSize: 19, lineHeight: 25, color: C.ink, fontWeight: '700' },
  sub: { fontFamily: F.sans, fontSize: 14, lineHeight: 21, color: C.sub },
  p: { fontFamily: F.sans, fontSize: 16, lineHeight: 25, color: C.ink },
  section: { marginBottom: 36 },
  panel: { backgroundColor: C.glass, borderRadius: 22, padding: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.07)', ...(Platform.OS === 'web' ? { backdropFilter: 'blur(22px)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 20px 50px -30px rgba(0,0,0,0.6)' } : {}) } as any,
  row: { paddingVertical: 14, borderTopWidth: 1, borderTopColor: C.line },
  rowLabel: { fontFamily: F.mono, fontSize: 11.5, fontWeight: '500', color: C.gold, marginBottom: 5, letterSpacing: 1.4, textTransform: 'uppercase' },
  btn: { backgroundColor: C.gold, borderRadius: 4, minHeight: 48, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  btnSmall: { minHeight: 38, paddingHorizontal: 12 },
  btnGhost: { backgroundColor: 'transparent', alignSelf: 'flex-start', paddingHorizontal: 0 },
  btnOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: C.rose },
  btnText: { color: C.onAccent, fontFamily: F.sansBold, fontWeight: '700', fontSize: 16 },
  label: { fontFamily: F.sansMed, fontSize: 14, color: C.ink, marginBottom: 6, fontWeight: '500' },
  input: { fontFamily: F.sans, borderWidth: 1, borderColor: C.line, borderRadius: 4, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink, backgroundColor: C.glass, minHeight: 48 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  chip: { borderRadius: 4, borderWidth: 1, borderColor: C.line, paddingHorizontal: 16, minHeight: 38, justifyContent: 'center', backgroundColor: C.glass },
  chipOn: { backgroundColor: C.rose, borderColor: C.rose },
  chipText: { fontFamily: F.sans, fontSize: 14, color: C.ink },
  seg: { flexDirection: 'row', gap: 22, borderBottomWidth: 1, borderBottomColor: C.line, marginBottom: 20 },
  segItem: { paddingVertical: 10, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  segOn: { borderBottomColor: C.gold },
  segText: { fontFamily: F.sansMed, fontSize: 15, color: C.sub },
}) as const;
/** Stil nesnesi: tema değişince yerinde yenilenir */
export const st: ReturnType<typeof makeSt> = makeSt();
onThemeChange(() => Object.assign(st, makeSt()));

/**
 * Açıklaması gizli başlık. Geniş ekranda fareyle (hover) üstüne gelince küçük bir kutu açılır;
 * dar ekranda ve dokunmatikte başlığa dokununca ortada bir pencere açılır.
 */
export function InfoTitle({ title, info, style }: { title: string; info: string; style?: any }) {
  const { wide } = useLayout();
  const canHover = Platform.OS === 'web' && typeof window !== 'undefined' && !!window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hoverMode = wide && canHover;
  const [tip, setTip] = useState(false);
  const [modal, setModal] = useState(false);
  return (
    <View style={{ position: 'relative', zIndex: tip ? 20 : 1, alignSelf: 'flex-start', maxWidth: '100%' }}>
      <Pressable
        onPress={() => (hoverMode ? setTip(t => !t) : setModal(true))}
        {...({ onHoverIn: () => hoverMode && setTip(true), onHoverOut: () => hoverMode && setTip(false) } as any)}
        accessibilityRole="button" accessibilityHint={info} accessibilityLabel={title}
        style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, ...(Platform.OS === 'web' ? { cursor: 'help' } : {}) } as any}>
        <Text accessibilityRole="header" style={style}>{title}</Text>
        <View style={{ marginTop: 6, width: 20, height: 20, borderRadius: 10, borderWidth: 1, borderColor: C.line, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 13, lineHeight: 15, color: C.sub }}>i</Text>
        </View>
      </Pressable>
      {hoverMode && tip ? (
        <View pointerEvents="none" style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, width: 440, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 10, padding: 14, ...(Platform.OS === 'web' ? { boxShadow: '0 10px 30px rgba(0,0,0,0.25)' } : {}) } as any}>
          <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 16, lineHeight: 24, color: C.ink }}>{info}</Text>
        </View>
      ) : null}
      {!hoverMode ? (
        <Modal visible={modal} transparent animationType="fade" onRequestClose={() => setModal(false)}>
          <Pressable onPress={() => setModal(false)} accessibilityLabel="Kapat" style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            <Pressable onPress={() => {}} style={{ width: '100%', maxWidth: 440, backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 22 }}>
              <Text style={{ fontFamily: F.serif, fontSize: 24, lineHeight: 30, color: C.ink, marginBottom: 8 }}>{title}</Text>
              <Text style={{ fontFamily: F.serifItalic, fontStyle: 'italic', fontSize: 17, lineHeight: 26, color: C.ink }}>{info}</Text>
              <Pressable onPress={() => setModal(false)} accessibilityRole="button" style={({ pressed }) => [{ alignSelf: 'flex-end', marginTop: 16, paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: C.line }, pressed && { opacity: 0.6 }]}>
                <Text style={{ fontFamily: F.sansMed, fontSize: 14, color: C.rose }}>Tamam</Text>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}
