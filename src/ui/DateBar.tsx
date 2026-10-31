import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { C } from '../theme';
import { st } from './kit';
import type { T2 } from '../i18n2';

export type Step = 'hour' | 'day' | 'week' | 'month' | 'year';
const pad = (n: number) => String(n).padStart(2, '0');

export function addStep(d: Date, step: Step, k: number): Date {
  const x = new Date(d.getTime());
  if (step === 'hour') x.setUTCHours(x.getUTCHours() + k);
  else if (step === 'day') x.setUTCDate(x.getUTCDate() + k);
  else if (step === 'week') x.setUTCDate(x.getUTCDate() + 7 * k);
  else if (step === 'month') x.setUTCMonth(x.getUTCMonth() + k);
  else x.setUTCFullYear(x.getUTCFullYear() + k);
  return x;
}

/** Tarih seçici: ileri/geri adım, elle giriş ve oynatma (transit animasyonu) */
export default function DateBar({ date, onChange, t, lang, tzOffsetMin = 0, playable = true }: { date: Date; onChange: (d: Date) => void; t: T2; lang: 'tr' | 'en'; tzOffsetMin?: number; playable?: boolean }) {
  const [step, setStep] = useState<Step>('day');
  const [playing, setPlaying] = useState(false);
  const [edit, setEdit] = useState<string | null>(null);
  const ref = useRef(date);
  ref.current = date;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => onChange(addStep(ref.current, step, 1)), 450);
    return () => clearInterval(id);
  }, [playing, step]);

  const local = new Date(date.getTime() + tzOffsetMin * 60000);
  const label = `${pad(local.getUTCDate())}.${pad(local.getUTCMonth() + 1)}.${local.getUTCFullYear()} ${pad(local.getUTCHours())}:${pad(local.getUTCMinutes())}`;
  const commit = (v: string) => {
    const m = v.trim().match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})(?:\s+(\d{1,2})[:.](\d{2}))?$/);
    if (m) onChange(new Date(Date.UTC(+m[3], +m[2] - 1, +m[1], m[4] ? +m[4] : 12, m[5] ? +m[5] : 0) - tzOffsetMin * 60000));
    setEdit(null);
  };
  const Btn = ({ title, onPress, on }: { title: string; onPress: () => void; on?: boolean }) => (
    <Pressable onPress={onPress} accessibilityRole="button" style={({ pressed }) => [{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: on ? C.rose : C.line, backgroundColor: on ? C.rose : C.card }, pressed && { opacity: 0.6 }]}>
      <Text style={{ color: on ? '#fff' : C.ink, fontSize: 14, fontWeight: '600' }}>{title}</Text>
    </Pressable>
  );
  return (
    <View style={[st.section, { paddingVertical: 12 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Btn title="‹" onPress={() => onChange(addStep(date, step, -1))} />
        {edit === null ? (
          <Pressable onPress={() => setEdit(label)} style={{ flex: 1, alignItems: 'center' }} accessibilityRole="button" accessibilityLabel={t.date}>
            <Text style={{ fontSize: 17, color: C.ink, fontVariant: ['tabular-nums'], fontWeight: '600' }}>{label}</Text>
          </Pressable>
        ) : (
          <TextInput autoFocus value={edit} onChangeText={setEdit} onSubmitEditing={() => commit(edit)} onBlur={() => commit(edit)} placeholder={t.dateHint} placeholderTextColor={C.sub}
            style={[st.input, { flex: 1, paddingVertical: 6, textAlign: 'center' }]} />
        )}
        <Btn title="›" onPress={() => onChange(addStep(date, step, 1))} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, alignItems: 'center' }}>
        {(['hour', 'day', 'week', 'month', 'year'] as Step[]).map(k => <Btn key={k} title={t.steps[k]} on={step === k} onPress={() => setStep(k)} />)}
        <Btn title={t.today} onPress={() => { setPlaying(false); onChange(new Date()); }} />
        {playable ? <Btn title={playing ? `❚❚ ${t.pause}` : `▶ ${t.play}`} on={playing} onPress={() => setPlaying(!playing)} /> : null}
      </View>
      {void lang}
    </View>
  );
}
