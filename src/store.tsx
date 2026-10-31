import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BirthInput, Chart, computeChart, HouseSystem, Zodiac, ChartOptions } from './engine/astro';
import type { Lang } from './content/base';
import { STRINGS, Strings } from './i18n';
import { applyTheme, ThemeMode } from './theme';

export interface Profile { id: string; name: string; place: string; birth: BirthInput }
export interface Place { label: string; lat: number; lon: number; tz: string }

interface State {
  ready: boolean;
  lang: Lang; setLang: (l: Lang) => void;
  hs: HouseSystem; setHs: (h: HouseSystem) => void;
  zodiac: Zodiac; setZodiac: (z: Zodiac) => void;
  theme: ThemeMode; setTheme: (t: ThemeMode) => void;
  showAsteroids: boolean; setShowAsteroids: (b: boolean) => void;
  here: Place | null; setHere: (p: Place | null) => void;
  people: Profile[];
  activeId: string | null; setActiveId: (id: string) => void;
  profile: Profile | null;
  /** Etkin kişiyi günceller; kimliği yoksa yeni kişi olarak ekler ve etkinleştirir */
  setProfile: (p: Omit<Profile, 'id'> & { id?: string } | null) => void;
  addPerson: (p: Omit<Profile, 'id'>) => Profile;
  removePerson: (id: string) => void;
  chart: Chart | null;
  opts: Required<ChartOptions>;
  chartOf: (p: Profile) => Chart | null;
  /** Şu an bulunulan yer (ayarlanmadıysa etkin kişinin doğum yeri) */
  location: Place | null;
  s: Strings;
}

const Ctx = createContext<State>(null as any);
const KEY = 'astro.v1';
const newId = () => Math.random().toString(36).slice(2, 10);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState<Lang>('tr');
  const [hs, setHs] = useState<HouseSystem>('placidus');
  const [zodiac, setZodiac] = useState<Zodiac>('tropical');
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [showAsteroids, setShowAsteroids] = useState(true);
  const [here, setHere] = useState<Place | null>(null);
  const [people, setPeople] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  const setTheme = (t: ThemeMode) => { applyTheme(t); setThemeState(t); };

  useEffect(() => {
    AsyncStorage.getItem(KEY).then(raw => {
      if (!raw) return;
      try {
        const d = JSON.parse(raw);
        if (d.lang) setLang(d.lang);
        if (d.hs) setHs(d.hs);
        if (d.zodiac) setZodiac(d.zodiac);
        if (d.theme) setTheme(d.theme);
        if (typeof d.showAsteroids === 'boolean') setShowAsteroids(d.showAsteroids);
        if (d.here) setHere(d.here);
        let ps: Profile[] = d.people ?? [];
        if (!ps.length && d.profile) ps = [{ id: newId(), ...d.profile }]; // eski sürümden geçiş
        setPeople(ps);
        setActiveId(d.activeId && ps.some(p => p.id === d.activeId) ? d.activeId : ps[0]?.id ?? null);
      } catch { /* bozuk veri: yok say */ }
    }).finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify({ lang, hs, zodiac, theme, showAsteroids, here, people, activeId })).catch(() => {});
  }, [ready, lang, hs, zodiac, theme, showAsteroids, here, people, activeId]);

  const opts = useMemo(() => ({ houseSystem: hs, zodiac }), [hs, zodiac]);
  const profile = people.find(p => p.id === activeId) ?? null;

  const addPerson = (p: Omit<Profile, 'id'>) => {
    const np = { ...p, id: newId() };
    setPeople(ps => [...ps, np]);
    return np;
  };
  const setProfile: State['setProfile'] = p => {
    if (p === null) { setPeople([]); setActiveId(null); return; }
    if (p.id && people.some(x => x.id === p.id)) { setPeople(ps => ps.map(x => (x.id === p.id ? { ...x, ...p, id: x.id } : x))); return; }
    if (!p.id && profile) { setPeople(ps => ps.map(x => (x.id === profile.id ? { ...x, ...p, id: x.id } : x))); return; }
    const np = addPerson(p); setActiveId(np.id);
  };
  const removePerson = (id: string) => {
    setPeople(ps => {
      const rest = ps.filter(p => p.id !== id);
      if (id === activeId) setActiveId(rest[0]?.id ?? null);
      return rest;
    });
  };

  const chartOf = (p: Profile) => { try { return computeChart(p.birth, opts); } catch { return null; } };
  const chart = useMemo(() => (profile ? chartOf(profile) : null), [profile, opts]);
  const location = here ?? (profile ? { label: profile.place, lat: profile.birth.lat, lon: profile.birth.lon, tz: profile.birth.tz } : null);

  return (
    <Ctx.Provider value={{
      ready, lang, setLang, hs, setHs, zodiac, setZodiac, theme, setTheme, showAsteroids, setShowAsteroids, here, setHere,
      people, activeId, setActiveId: (id: string) => setActiveId(id), profile, setProfile, addPerson, removePerson,
      chart, opts, chartOf, location, s: STRINGS[lang],
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useStore = () => useContext(Ctx);
