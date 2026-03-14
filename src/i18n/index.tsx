import en from "./locales/en.json";
import vi_vn from "./locales/vi_vn.json";

export const i18n = {
  en: en,
  vi_vn: vi_vn,
} as {
  [k: string]: {
    [k: string]: string;
  };
};

export const listLanguageCode = ["en", "vi_vn"];

export const languageNames: { [key: string]: string } = {
  en: "English",
  vi_vn: "Tiếng Việt",
};

export const flagEmojis: { [key: string]: string } = {
  en: "🇺🇸",
  vi_vn: "🇻🇳",
};
