import React, { useEffect, useRef, useState } from 'react';
import { Pressable, Switch, Text, View } from 'react-native';
import { useStore } from '../store';
import { HOUSE_SYSTEMS, HouseSystem, Zodiac } from '../engine/astro';
import BirthForm, { searchPlaces, Place } from '../ui/BirthForm';
import { Btn, Chips, Field, H1, Notice, P, Section, Sub, st } from '../ui/kit';
import { C, ThemeMode } from '../theme';
import { T2S } from '../i18n2';

export default function SettingsScreen({ onDone }: { onDone: () => void }) {
  const { s, lang, setLang, hs, setHs, zodiac, setZodiac, theme, setTheme, showAsteroids, setShowAsteroids, here, setHere,
    people, activeId, setActiveId, setProfile, addPerson, removePerson } = useStore();
  const t = T2S[lang];
  const [editId, setEditId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [removed, setRemoved] = useState<{ p: typeof people[number]; wasActive: boolean } | null>(null);
  useEffect(() => { if (!removed) return; const id = setTimeout(() => setRemoved(null), 8000); return () => clearTimeout(id); }, [removed]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Place[]>([]);
  const timer = useRef<any>(null);
  useEffect(() => {
    if (q.trim().length < 2) { setResults([]); return; }
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => setResults(await searchPlaces(q.trim(), lang)), 400);
    return () => clearTimeout(timer.current);
  }, [q]);
  const editing = people.find(p => p.id === editId) ?? null;

  return (
    <View>
      <H1>{s.settings}</H1>

      <Section title={t.people}>
        {removed ? <Notice text={lang === 'tr' ? `${removed.p.name || 'Kişi'} silindi.` : `${removed.p.name || 'Person'} removed.`} action={lang === 'tr' ? 'Geri al' : 'Undo'}
          onAction={() => { const { id, ...rest } = removed.p; const np = addPerson(rest); if (removed.wasActive) setActiveId(np.id); setRemoved(null); }} /> : null}
        {people.map(p => (
          <View key={p.id} style={[st.row, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
            <Pressable style={{ flex: 1 }} onPress={() => setActiveId(p.id)} accessibilityRole="button">
              <Text style={[st.p, { fontWeight: p.id === activeId ? '700' : '400' }]}>{p.name || '—'}{p.id === activeId ? `, ${t.active}` : ''}</Text>
              <Text style={st.sub}>{String(p.birth.day).padStart(2, '0')}.{String(p.birth.month).padStart(2, '0')}.{p.birth.year}, {p.place}</Text>
            </Pressable>
            <Pressable onPress={() => setEditId(editId === p.id ? null : p.id)} hitSlop={8}><Text style={{ color: C.rose }}>{t.edit}</Text></Pressable>
            {people.length > 1 ? <Pressable onPress={() => { setRemoved({ p, wasActive: p.id === activeId }); removePerson(p.id); }} hitSlop={8} accessibilityRole="button" accessibilityLabel={`${t.remove}: ${p.name}`}><Text style={{ color: C.danger }}>{t.remove}</Text></Pressable> : null}
          </View>
        ))}
        {editing ? <BirthForm initial={editing} submitLabel={t.save} onSubmit={v => { setProfile({ ...v, id: editing.id }); setEditId(null); onDone(); }} /> : null}
        {adding ? <BirthForm submitLabel={t.save} onSubmit={v => { const np = addPerson(v); setActiveId(np.id); setAdding(false); }} /> : <Btn kind="ghost" title={t.addPerson} onPress={() => setAdding(true)} />}
      </Section>

      <Section title={s.language}>
        <Chips items={[{ key: 'tr', label: 'Türkçe' }, { key: 'en', label: 'English' }]} value={lang} onChange={setLang} />
      </Section>
      <Section title={t.theme}>
        <Chips<ThemeMode> items={[{ key: 'light', label: t.light }, { key: 'dark', label: t.dark }]} value={theme} onChange={setTheme} />
      </Section>
      <Section title={s.houseSystem}>
        <Chips<HouseSystem> items={HOUSE_SYSTEMS.map(k => ({ key: k, label: s.hsNames[k] }))} value={hs} onChange={setHs} />
      </Section>
      <Section title={t.zodiac}>
        <Chips<Zodiac> items={[{ key: 'tropical', label: t.tropical }, { key: 'sidereal', label: t.sidereal }]} value={zodiac} onChange={setZodiac} />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Switch value={showAsteroids} onValueChange={setShowAsteroids} trackColor={{ true: C.rose, false: C.line }} />
          <P style={{ flex: 1 }}>{t.asteroids}</P>
        </View>
      </Section>
      <Section title={t.location}>
        <Sub style={{ marginBottom: 8 }}>{here ? here.label : `${t.useBirth}`}</Sub>
        <Field label="" value={q} onChangeText={setQ} placeholder={s.searchCity} />
        {results.map((r, i) => (
          <Pressable key={i} onPress={() => { setHere(r); setQ(''); setResults([]); }} style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: C.line }}>
            <Text style={st.p}>{r.label}</Text><Text style={st.sub}>{r.tz}</Text>
          </Pressable>
        ))}
        {here ? <Btn kind="ghost" title={t.useBirth} onPress={() => setHere(null)} /> : null}
      </Section>

      <Section title={s.about}>
        <P>{s.aboutText}</P>
      </Section>
      {confirmReset ? (
        <Section>
          <P>{lang === 'tr' ? 'Kayıtlı tüm kişiler ve ayarlar silinecek. Emin misin?' : 'All saved people and settings will be deleted. Are you sure?'}</P>
          <Btn title={s.resetAll} onPress={() => { setProfile(null); setConfirmReset(false); }} />
          <Btn kind="ghost" title={lang === 'tr' ? 'Vazgeç' : 'Cancel'} onPress={() => setConfirmReset(false)} />
        </Section>
      ) : <Btn kind="ghost" title={s.resetAll} onPress={() => setConfirmReset(true)} />}
    </View>
  );
}
