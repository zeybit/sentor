import React, { useState } from 'react';
import { View } from 'react-native';
import { useStore } from '../store';
import type { HouseSystem } from '../engine/astro';
import BirthForm from '../ui/BirthForm';
import { Btn, Chips, H1, P, Section, Sub } from '../ui/kit';

export default function SettingsScreen({ onDone }: { onDone: () => void }) {
  const { s, lang, setLang, hs, setHs, profile, setProfile } = useStore();
  const [edit, setEdit] = useState(false);
  return (
    <View>
      <H1>{s.settings}</H1>
      <Section title={s.language}>
        <Chips items={[{ key: 'tr', label: 'Türkçe' }, { key: 'en', label: 'English' }]} value={lang} onChange={setLang} />
      </Section>
      <Section title={s.houseSystem}>
        <Chips<HouseSystem> items={(['placidus', 'wholeSign', 'equal', 'porphyry'] as HouseSystem[]).map(k => ({ key: k, label: s.hsNames[k] }))} value={hs} onChange={setHs} />
      </Section>
      <Section title={s.editProfile}>
        {edit ? (
          <BirthForm initial={profile} submitLabel={s.save} onSubmit={v => { setProfile(v); setEdit(false); onDone(); }} />
        ) : (
          <>
            <Sub>{profile?.name} · {profile?.place}</Sub>
            <Btn kind="ghost" title={s.editProfile} onPress={() => setEdit(true)} />
          </>
        )}
      </Section>
      <Section title={s.about}>
        <P>{s.aboutText}</P>
      </Section>
      <Btn kind="ghost" title={s.resetAll} onPress={() => setProfile(null)} />
    </View>
  );
}
