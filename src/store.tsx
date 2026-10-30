import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BirthInput, Chart, computeChart, HouseSystem } from './engine/astro';
import type { Lang } from './content/base';
import { STRINGS, Strings } from './i18n';

export interface Profile { name: string; place: string; birth: BirthInput }

interface State {
  ready: boolean;
  lang: Lang; setLang: (l: Lang) => void;
  hs: HouseSystem; setHs: (h: HouseSystem) => void;
  profile: Profile | null; setProfile: (p: Profile | null) => void;
  chart: Chart | null;
  s: Strings;
}

const Ctx = createContext<State>(null as any);
const KEY = 'astro.v1';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>('tr');
  const [hs, setHs] = useState<HouseSystem>('placidus');
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (raw) {
        try {
          const d = JSON.parse(raw);
          if (d.lang) setLang(d.lang);
          if (d.hs) setHs(d.hs);
          if (d.profile) setProfile(d.profile);
        } catch { /* bozuk veri: yok say */ }
      }
    }).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify({ lang, hs, profile })).catch(() => {});
  }, [ready, lang, hs, profile]);

  const chart = useMemo(() => {
    if (!profile) return null;
    try { return computeChart(profile.birth, hs); } catch { return null; }
  }, [profile, hs]);

  return (
    <Ctx.Provider value={{ ready, lang, setLang, hs, setHs, profile, setProfile, chart, s: STRINGS[lang] }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
