import { createContext, useContext } from 'react';
/** Ekranların başka bir sekmeye geçebilmesi için. "chart:timeline" gibi bir değer Harita'yı o türle açar. */
export const NavCtx = createContext<(tab: string) => void>(() => {});
export const useNav = () => useContext(NavCtx);
let pendingKind: string | null = null;
export const setPendingKind = (k: string | null) => { pendingKind = k; };
export const takePendingKind = () => { const k = pendingKind; pendingKind = null; return k; };
