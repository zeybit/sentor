import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle } from 'react-native';
import { C, serif } from '../theme';

export const H1 = ({ children }: { children: React.ReactNode }) => <Text style={st.h1}>{children}</Text>;
export const H2 = ({ children }: { children: React.ReactNode }) => <Text style={st.h2}>{children}</Text>;
export const Sub = ({ children, style }: { children: React.ReactNode; style?: any }) => <Text style={[st.sub, style]}>{children}</Text>;
export const P = ({ children, style }: { children: React.ReactNode; style?: any }) => <Text style={[st.p, style]}>{children}</Text>;

export function Section({ title, sub, children, style }: { title?: string; sub?: string; children: React.ReactNode; style?: ViewStyle }) {
  return (
    <View style={[st.section, style]}>
      {title ? <H2>{title}</H2> : null}
      {sub ? <Sub style={{ marginBottom: 10 }}>{sub}</Sub> : null}
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

export function Btn({ title, onPress, kind = 'primary', disabled }: { title: string; onPress: () => void; kind?: 'primary' | 'ghost'; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      style={({ pressed }) => [st.btn, kind === 'ghost' && st.btnGhost, (pressed || disabled) && { opacity: 0.6 }]}>
      <Text style={[st.btnText, kind === 'ghost' && { color: C.rose }]}>{title}</Text>
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label: string }) {
  const { label, style, ...rest } = props;
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={st.label}>{label}</Text>
      <TextInput placeholderTextColor={C.sub} style={[st.input, style]} {...rest} />
    </View>
  );
}

export function Chips<T extends string>({ items, value, onChange }: { items: { key: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <View style={st.chips}>
      {items.map(i => (
        <Pressable key={i.key} onPress={() => onChange(i.key)} accessibilityRole="button" accessibilityState={{ selected: i.key === value }}
          style={[st.chip, i.key === value && st.chipOn]}>
          <Text style={[st.chipText, i.key === value && { color: '#fff' }]}>{i.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}

export function Meter({ label, value, max = 5 }: { label: string; value: number; max?: number }) {
  return (
    <View style={{ flex: 1, minWidth: 130, marginBottom: 10 }}>
      <Text style={st.label}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
        {Array.from({ length: max }).map((_, i) => (
          <View key={i} style={{ flex: 1, height: 8, borderRadius: 4, backgroundColor: i < value ? C.rose : C.line }} />
        ))}
      </View>
    </View>
  );
}

export function Bar({ label, pct }: { label: string; pct: number }) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text style={st.p}>{label}</Text><Text style={[st.p, { fontWeight: '700' }]}>%{pct}</Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: C.line, marginTop: 4 }}>
        <View style={{ width: `${pct}%`, height: 8, borderRadius: 4, backgroundColor: C.rose }} />
      </View>
    </View>
  );
}

export function Expand({ items, initial = 4, more, less }: { items: React.ReactNode[]; initial?: number; more: string; less: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View>
      {(open ? items : items.slice(0, initial))}
      {items.length > initial ? <Btn kind="ghost" title={open ? less : more} onPress={() => setOpen(!open)} /> : null}
    </View>
  );
}

export const st = StyleSheet.create({
  h1: { fontFamily: serif, fontSize: 30, lineHeight: 36, color: C.ink, marginBottom: 6 },
  h2: { fontFamily: serif, fontSize: 21, lineHeight: 27, color: C.ink, marginBottom: 4 },
  sub: { fontSize: 14, lineHeight: 20, color: C.sub },
  p: { fontSize: 15, lineHeight: 22, color: C.ink },
  section: { backgroundColor: C.card, borderRadius: 18, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: C.line },
  row: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: C.line },
  rowLabel: { fontSize: 13, fontWeight: '700', color: C.rose, marginBottom: 3 },
  btn: { backgroundColor: C.rose, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  btnGhost: { backgroundColor: 'transparent' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  label: { fontSize: 13, color: C.sub, marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16, color: C.ink, backgroundColor: '#fff' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: C.line, paddingHorizontal: 12, paddingVertical: 7, backgroundColor: C.card },
  chipOn: { backgroundColor: C.ink, borderColor: C.ink },
  chipText: { fontSize: 14, color: C.ink },
});
