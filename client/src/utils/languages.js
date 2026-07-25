/**
 * Supported Languages for AI Mock Interviews & Real-Time Translation
 */
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", nativeName: "English", flag: "🇺🇸", locale: "en-US" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸", locale: "es-ES" },
  { code: "zh", name: "Mandarin Chinese", nativeName: "中文 (简体)", flag: "🇨🇳", locale: "zh-CN" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", flag: "🇮🇳", locale: "hi-IN" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷", locale: "fr-FR" },
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪", locale: "de-DE" },
  { code: "ja", name: "Japanese", nativeName: "日本語", flag: "🇯🇵", locale: "ja-JP" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇧🇷", locale: "pt-BR" },
  { code: "ar", name: "Arabic", nativeName: "العربية", flag: "🇸🇦", locale: "ar-SA" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺", locale: "ru-RU" },
];

export const getLanguageObj = (codeOrName = "English") => {
  const normalized = String(codeOrName).toLowerCase();
  return (
    SUPPORTED_LANGUAGES.find(
      (l) =>
        l.code.toLowerCase() === normalized ||
        l.name.toLowerCase() === normalized
    ) || SUPPORTED_LANGUAGES[0]
  );
};
