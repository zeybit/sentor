// Mobil: yazı tipleri uygulama paketinden yüklenir.
import { useFonts } from 'expo-font';
import { EBGaramond_400Regular_Italic, EBGaramond_500Medium, EBGaramond_700Bold } from '@expo-google-fonts/eb-garamond';
import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk';

export function useAppFonts(): boolean {
  const [ok, err] = useFonts({ EBGaramond_400Regular_Italic, EBGaramond_500Medium, EBGaramond_700Bold, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_700Bold });
  return ok || !!err;
}
