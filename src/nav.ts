import { createContext, useContext } from 'react';
/** Ekranların başka bir sekmeye geçebilmesi için */
export const NavCtx = createContext<(tab: string) => void>(() => {});
export const useNav = () => useContext(NavCtx);
