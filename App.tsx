import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider, useStore } from './src/store';
import BirthForm from './src/ui/BirthForm';
import { H1, P, Sub, useLayout } from './src/ui/kit';
import Icon, { IconName } from './src/ui/Icon';
import { C, F, onThemeChange } from './src/theme';
import { useAppFonts } from './src/fonts';
import TodayScreen from './src/screens/TodayScreen';
import ChartScreen from './src/screens/ChartScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import HoraryScreen from './src/screens/HoraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import MatrixScreen from './src/screens/MatrixScreen';
import HelpScreen from './src/screens/HelpScreen';
import { NavCtx, setPendingKind } from './src/nav';

type Main = 'today' | 'chart' | 'portfolio' | 'matrix' | 'ask' | 'trends';
type Tab = Main | 'settings' | 'help';
const MAIN: { key: Main; icon: IconName }[] = [
  { key: 'today', icon: 'today' }, { key: 'chart', icon: 'chart' }, { key: 'portfolio', icon: 'portfolio' },
  { key: 'matrix', icon: 'matrix' }, { key: 'ask', icon: 'ask' }, { key: 'trends', icon: 'trends' },
];
const LABEL: Record<Tab, { tr: string; en: string }> = {
  today: { tr: 'Bugün', en: 'Today' }, chart: { tr: 'Harita', en: 'Chart' }, portfolio: { tr: 'Portföy', en: 'Portfolio' },
  matrix: { tr: 'Matris', en: 'Matrix' }, ask: { tr: 'Soru sor', en: 'Ask' }, trends: { tr: 'Trendler', en: 'Trends' },
  settings: { tr: 'Ayarlar', en: 'Settings' }, help: { tr: 'Terimler', en: 'Glossary' },
};
const WIDE_SCREENS: Tab[] = ['chart', 'matrix'];

/** Etkin kişiyi gösterir ve kişiler arasında hızlı geçiş sağlar */
function PersonSwitch({ onManage, compact }: { onManage: () => void; compact?: boolean }) {
  const { people, activeId, setActiveId, lang, profile } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <View style={{ position: 'relative', zIndex: 60 }}>
      <Pressable onPress={() => setOpen(!open)} accessibilityRole="button" accessibilityLabel={lang === 'tr' ? 'Kişi değiştir' : 'Switch person'} accessibilityState={{ expanded: open }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderColor: C.line, borderRadius: 10, paddingHorizontal: 10, minHeight: 38, maxWidth: compact ? 150 : undefined }}>
        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: C.bg, fontSize: 12, fontFamily: F.sansBold, fontWeight: '700' }}>{(profile?.name || '?').slice(0, 1).toLocaleUpperCase('tr')}</Text>
        </View>
        <Text numberOfLines={1} style={{ flexShrink: 1, fontFamily: F.sansMed, fontSize: 14, color: C.ink }}>{profile?.name || (lang === 'tr' ? 'İsimsiz' : 'Unnamed')}</Text>
        <Icon name="chevron" size={16} color={C.sub} />
      </Pressable>
      {open ? (
        <Pressable onPress={() => setOpen(false)} accessibilityLabel={lang === 'tr' ? 'Menüyü kapat' : 'Close menu'}
          style={{ position: (Platform.OS === 'web' ? 'fixed' : 'absolute') as any, top: -2000, left: -2000, width: 6000, height: 6000, zIndex: 1, cursor: 'default' as any }} />
      ) : null}
      {open ? (
        <View style={{ zIndex: 2, position: 'absolute', top: 44, right: compact ? 0 : undefined, left: compact ? undefined : 0, minWidth: 230, backgroundColor: C.card, borderWidth: 1, borderColor: C.line, borderRadius: 12, paddingVertical: 6, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 6 }}>
          {people.map(p => (
            <Pressable key={p.id} onPress={() => { setActiveId(p.id); setOpen(false); }} accessibilityRole="menuitem" accessibilityState={{ selected: p.id === activeId }}
              style={({ hovered }: any) => [{ paddingVertical: 9, paddingHorizontal: 14 }, hovered && { backgroundColor: C.roseSoft }]}>
              <Text style={{ fontFamily: p.id === activeId ? F.sansBold : F.sans, fontWeight: p.id === activeId ? '700' : '400', fontSize: 15, color: C.ink }}>{p.name || '—'}{p.id === activeId ? '  ✓' : ''}</Text>
              <Text style={{ fontFamily: F.sans, fontSize: 12, color: C.sub }}>{String(p.birth.day).padStart(2, '0')}.{String(p.birth.month).padStart(2, '0')}.{p.birth.year}, {p.place}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => { setOpen(false); onManage(); }} accessibilityRole="menuitem" style={{ paddingVertical: 10, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: C.line, marginTop: 4 }}>
            <Text style={{ fontFamily: F.sansMed, color: C.rose, fontSize: 14 }}>{lang === 'tr' ? 'Kişi ekle veya düzenle' : 'Add or edit people'}</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

function Wordmark({ size = 21 }: { size?: number }) {
  const { s } = useStore();
  return <Text style={{ fontFamily: F.serif, fontSize: size, color: C.ink, letterSpacing: -0.2 }}>{s.appName}</Text>;
}

function Shell() {
  const { ready, profile, chart, s, setProfile, lang } = useStore();
  // Tarayıcı çevirisinin Türkçe metni bozmasını önle: sayfa dilini uygulama diliyle eşle
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;
    const html = document.documentElement;
    html.lang = lang; html.setAttribute('translate', 'no'); html.classList.add('notranslate');
    if (!document.querySelector('meta[name="google"]')) {
      const m = document.createElement('meta'); m.name = 'google'; m.content = 'notranslate'; document.head.appendChild(m);
    }
  }, [lang]);
  const { wide, tablet } = useLayout();
  const [tab, setTab] = useState<Tab>('today');
  const scroll = useRef<ScrollViewInstance>(null);
  const go = (t: Tab) => { setTab(t); scroll.current?.scrollTo({ y: 0, animated: false }); };
  const label = (t: Tab) => LABEL[t][lang];

  if (!ready) return <View style={styles.center}><ActivityIndicator color={C.rose} /></View>;

  if (!profile || !chart) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={[styles.page, { maxWidth: wide ? 1040 : 560, paddingTop: wide ? 64 : 24 }]} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: wide ? 64 : 8 }}>
            <View style={{ flex: wide ? 1 : undefined }}>
              <Wordmark size={18} />
              <H1 style={{ fontSize: wide ? 52 : 38, lineHeight: wide ? 58 : 44, marginTop: 28 }}>{s.welcome}</H1>
              <P style={{ color: C.sub, marginTop: 8, maxWidth: 440 }}>{s.welcomeSub}</P>
              {wide ? <Sub style={{ marginTop: 32, maxWidth: 400 }}>{s.disclaimer}</Sub> : null}
            </View>
            <View style={{ flex: wide ? 1 : undefined, marginTop: wide ? 0 : 20 }}>
              <BirthForm submitLabel={s.create} onSubmit={v => setProfile(v)} />
              {!wide ? <Sub style={{ marginTop: 18 }}>{s.disclaimer}</Sub> : null}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const Screen = { today: TodayScreen, portfolio: PortfolioScreen, ask: HoraryScreen, chart: ChartScreen, matrix: MatrixScreen, trends: TrendsScreen, help: HelpScreen, settings: null }[tab];
  const maxW = wide && WIDE_SCREENS.includes(tab) ? 1180 : 760;
  const content = (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView ref={scroll} contentContainerStyle={[styles.page, { maxWidth: maxW, paddingHorizontal: wide ? 48 : tablet ? 32 : 16, paddingTop: wide ? 40 : 12 }]} keyboardShouldPersistTaps="handled">
        <NavCtx.Provider value={t => { const [tb, k] = t.split(':'); setPendingKind(k ?? null); go(tb as Tab); }}>
          {tab === 'settings' ? <SettingsScreen onDone={() => go('chart')} /> : Screen ? <Screen /> : null}
        </NavCtx.Provider>
      </ScrollView>
    </KeyboardAvoidingView>
  );

  if (wide) {
    const NavItem = ({ k, icon }: { k: Tab; icon: IconName }) => {
      const on = tab === k;
      return (
        <Pressable onPress={() => go(k)} accessibilityRole="link" accessibilityState={{ selected: on }}
          style={({ hovered }: any) => [styles.railItem, on && { backgroundColor: C.card }, hovered && !on && { backgroundColor: C.roseSoft }]}>
          <View style={{ width: 3, alignSelf: 'stretch', borderRadius: 2, backgroundColor: on ? C.gold : 'transparent', marginRight: 10 }} />
          <Icon name={icon} size={20} color={on ? C.ink : C.sub} filled={on} />
          <Text style={{ marginLeft: 12, fontFamily: on ? F.sansBold : F.sansMed, fontWeight: on ? '700' : '500', fontSize: 15, color: on ? C.ink : C.sub }}>{label(k)}</Text>
        </Pressable>
      );
    };
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <View style={styles.rail} accessibilityRole="navigation">
          <View style={{ paddingHorizontal: 16, marginBottom: 22 }}><Wordmark size={24} /></View>
          <View style={{ paddingHorizontal: 12, marginBottom: 22, zIndex: 50, position: 'relative' }}><PersonSwitch onManage={() => go('settings')} /></View>
          {MAIN.map(m => <NavItem key={m.key} k={m.key} icon={m.icon} />)}
          <View style={{ flex: 1 }} />
          <NavItem k="help" icon="help" />
          <NavItem k="settings" icon="settings" />
        </View>
        <View style={{ flex: 1 }}>{content}</View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Wordmark />
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <PersonSwitch compact onManage={() => go('settings')} />
          <Pressable onPress={() => go(tab === 'help' ? 'today' : 'help')} accessibilityRole="button" accessibilityLabel={label('help')} style={styles.iconBtn}>
            <Icon name={tab === 'help' ? 'close' : 'help'} color={C.ink} />
          </Pressable>
          <Pressable onPress={() => go(tab === 'settings' ? 'today' : 'settings')} accessibilityRole="button" accessibilityLabel={label('settings')} style={styles.iconBtn}>
            <Icon name={tab === 'settings' ? 'close' : 'settings'} color={C.ink} />
          </Pressable>
        </View>
      </View>
      {content}
      <View style={styles.tabbar} accessibilityRole="tablist">
        {MAIN.map(({ key, icon }) => {
          const on = tab === key;
          return (
            <Pressable key={key} onPress={() => go(key)} style={styles.tab} accessibilityRole="tab" accessibilityLabel={label(key)} accessibilityState={{ selected: on }}>
              <View style={{ width: 18, height: 2, borderRadius: 1, backgroundColor: on ? C.gold : 'transparent', marginBottom: 6 }} />
              <Icon name={icon} size={22} color={on ? C.ink : C.sub} filled={on} />
              <Text style={[styles.tabText, on && { color: C.ink, fontFamily: F.sansBold, fontWeight: '700' }]} numberOfLines={1}>{label(key)}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Themed() {
  const { theme } = useStore();
  const fonts = useAppFonts();
  if (!fonts) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  return (
    <SafeAreaView key={theme} style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Shell />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <Themed />
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const makeStyles = () => ({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  page: { paddingHorizontal: 16, paddingBottom: 64, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingLeft: 16, paddingRight: 8, paddingVertical: 8, zIndex: 10 },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  tabbar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.bg, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', paddingBottom: 4, minHeight: 56 },
  tabText: { fontFamily: F.sansMed, fontSize: 11, color: C.sub, marginTop: 3 },
  rail: { width: 248, paddingTop: 28, paddingBottom: 20, paddingRight: 12, borderRightWidth: 1, borderRightColor: C.line, zIndex: 10 },
  railItem: { flexDirection: 'row', alignItems: 'center', minHeight: 44, borderTopRightRadius: 10, borderBottomRightRadius: 10, paddingRight: 12, marginBottom: 2 },
}) as const;
const styles: ReturnType<typeof makeStyles> = makeStyles();
onThemeChange(() => Object.assign(styles, makeStyles()));
