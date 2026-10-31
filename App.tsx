import React, { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { ScrollViewInstance } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StoreProvider, useStore } from './src/store';
import BirthForm from './src/ui/BirthForm';
import { H1, Sub } from './src/ui/kit';
import { C, serif } from './src/theme';
import TodayScreen from './src/screens/TodayScreen';
import ChartScreen from './src/screens/ChartScreen';
import StyleScreen from './src/screens/StyleScreen';
import LoveScreen from './src/screens/LoveScreen';
import TrendsScreen from './src/screens/TrendsScreen';
import PortfolioScreen from './src/screens/PortfolioScreen';
import HoraryScreen from './src/screens/HoraryScreen';
import SettingsScreen from './src/screens/SettingsScreen';

type Tab = 'today' | 'portfolio' | 'ask' | 'chart' | 'style' | 'love' | 'trends' | 'settings';
const ICONS: Record<Exclude<Tab, 'settings'>, string> = { today: '☽', portfolio: '✧', ask: '?', chart: '◎', style: '♀', love: '♡', trends: '✦' };

function Shell() {
  const { ready, profile, chart, s, setProfile } = useStore();
  const [tab, setTab] = useState<Tab>('today');
  const scroll = useRef<ScrollViewInstance>(null);
  const go = (t: Tab) => { setTab(t); scroll.current?.scrollTo({ y: 0, animated: false }); };

  if (!ready) return <View style={styles.center}><ActivityIndicator color={C.rose} /></View>;

  if (!profile || !chart) {
    return (
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>✦ {s.appName}</Text>
          <H1>{s.welcome}</H1>
          <Sub style={{ marginBottom: 20 }}>{s.welcomeSub}</Sub>
          <BirthForm submitLabel={s.create} onSubmit={v => setProfile(v)} />
          <Sub style={{ marginTop: 18, textAlign: 'center' }}>{s.disclaimer}</Sub>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  const Screen = { today: TodayScreen, portfolio: PortfolioScreen, ask: HoraryScreen, chart: ChartScreen, style: StyleScreen, love: LoveScreen, trends: TrendsScreen }[tab as Exclude<Tab, 'settings'>];

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.header}>
        <Text style={styles.brand}>✦ {s.appName}</Text>
        <Pressable onPress={() => go(tab === 'settings' ? 'today' : 'settings')} accessibilityRole="button" accessibilityLabel={s.settings} hitSlop={12}>
          <Text style={{ fontSize: 22, color: C.ink }}>{tab === 'settings' ? '✕' : '⚙︎'}</Text>
        </Pressable>
      </View>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView ref={scroll} contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
          {tab === 'settings' ? <SettingsScreen onDone={() => go('chart')} /> : <Screen />}
        </ScrollView>
      </KeyboardAvoidingView>
      <View style={styles.tabbar}>
        {(Object.keys(ICONS) as Exclude<Tab, 'settings'>[]).map(k => (
          <Pressable key={k} onPress={() => go(k)} style={styles.tab} accessibilityRole="tab" accessibilityState={{ selected: tab === k }}>
            <Text style={[styles.tabIcon, tab === k && { color: C.rose }]}>{ICONS[k]}</Text>
            <Text style={[styles.tabText, tab === k && { color: C.rose, fontWeight: '700' }]} numberOfLines={1}>{k === 'portfolio' ? s.pf.tab : k === 'ask' ? s.hq.tab : s.tabs[k]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={['top', 'bottom']}>
          <StatusBar style="dark" />
          <Shell />
        </SafeAreaView>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  page: { padding: 16, paddingBottom: 40, maxWidth: 640, width: '100%', alignSelf: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  brand: { fontFamily: serif, fontSize: 17, color: C.rose, marginBottom: 4 },
  tabbar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: C.line, backgroundColor: C.card, paddingTop: 6, paddingBottom: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 4 },
  tabIcon: { fontSize: 20, color: C.sub },
  tabText: { fontSize: 10, color: C.sub, marginTop: 2 },
});
