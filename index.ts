import { registerRootComponent } from 'expo';

import App from './App';
import KitDemo from './components/KitDemo';

// DENEME DALI: ?kit adresinde (ya da window.__KIT__ ile) UI kit önizlemesi açılır
const kit = typeof window !== 'undefined' && ((window as any).__KIT__ || /[?&]kit\b/.test(window.location?.search ?? ''));
registerRootComponent(kit ? KitDemo : App);
