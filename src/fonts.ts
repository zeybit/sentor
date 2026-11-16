// Mobil: yazı tipleri uygulama paketinden yüklenir.
import { useFonts } from 'expo-font';
import { Fraunces_400Regular, Fraunces_400Regular_Italic, Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_700Bold } from '@expo-google-fonts/hanken-grotesk';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';

export function useAppFonts(): boolean {
  const [ok, err] = useFonts({ Fraunces_400Regular, Fraunces_400Regular_Italic, Fraunces_600SemiBold, HankenGrotesk_400Regular, HankenGrotesk_500Medium, HankenGrotesk_700Bold, IBMPlexMono_400Regular, IBMPlexMono_500Medium });
  return ok || !!err;
}
