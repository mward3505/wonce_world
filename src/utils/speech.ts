import * as Speech from 'expo-speech';
import { Language } from '../i18n/translations';

const LANG_CODE: Record<Language, string> = {
  en: 'en-US',
  es: 'es-ES',
};

let lastSpeakTime = 0;
const DEBOUNCE_MS = 800;

export function speakText(text: string, language: Language) {
  const now = Date.now();
  if (now - lastSpeakTime < DEBOUNCE_MS) return;
  lastSpeakTime = now;
  Speech.stop();
  Speech.speak(text, { language: LANG_CODE[language], rate: 0.85 });
}

export function speakCard(
  moduleType: string,
  primaryText: string,
  secondaryText: string | undefined,
  language: Language,
) {
  let phrase = primaryText;
  if (moduleType === 'letters' && secondaryText) {
    phrase = `${primaryText}... ${secondaryText}`;
  }
  speakText(phrase, language);
}
