// Web: yazı tipleri Google Fonts'tan yüklenir (tek dosyalık sürümde de çalışır).
let done = false;
export function useAppFonts(): boolean {
  if (!done && typeof document !== 'undefined') {
    done = true;
    const pre = document.createElement('link');
    pre.rel = 'preconnect'; pre.href = 'https://fonts.gstatic.com'; pre.crossOrigin = '';
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300..700;1,9..144,300..600&family=Hanken+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap';
    const style = document.createElement('style');
    // Yazı tipi verilmemiş tüm metinler Hanken Grotesk ile çizilir; satır içi stiller önceliğini korur.
    style.textContent = `#root [dir="auto"], #root input, #root textarea { font-family: "Hanken Grotesk", system-ui, -apple-system, "Segoe UI", sans-serif; }
#root :focus-visible { outline: 2px solid #DBB668; outline-offset: 2px; border-radius: 6px; }
#root * { font-variant-ligatures: no-common-ligatures; }
@media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }`;
    document.head.append(pre, link, style);
  }
  return true;
}
