import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { i18n, listLanguageCode } from "../i18n";

const I18nContext = createContext<{
  t: (k: string, ...args: any[]) => string;
  locale: (v: string) => void;
  currentLocale: string;
}>({
  t: (k: string, ...args: any[]) => "",
  locale: (v: string) => undefined,
  currentLocale: "en",
});

const I18nContextProvider = ({ children }: { children: ReactNode }) => {
  const [locale, setLocale] = useState("en");
  const localeRef = useRef<string>(locale);

  const translate = (k: string, ...args: any[]) => {
    const texts = i18n[localeRef.current] || i18n["en"];

    let text = texts[k] ? texts[k] : i18n["en"]?.[k] ? i18n["en"]?.[k] : k;

    if (args && args.length > 0) {
      for (let v of args) {
        text = text.replace("'{}'", v);
      }
    }
    return text;
  };

  const onChangeLocale = (v: string) => {
    setLocale(v);
    localeRef.current = v;
  };

  const extractLocale = () => {
    if (locale !== "none") {
      localeRef.current = locale;
    } else {
      let value = "en";
      const l = Intl?.DateTimeFormat?.()?.resolvedOptions?.()?.locale;
      if (listLanguageCode.includes(l)) {
        value = l;
      } else if (l) {
        try {
          const _l = l.split("-")[0];
          for (const item of listLanguageCode) {
            if (_l === item.split("_")[0]) {
              value = item;
              break;
            }
          }
        } catch {}
      }

      setLocale(value);
      localeRef.current = value;
    }
  };

  useEffect(() => {
    extractLocale();
  }, []);

  return (
    <I18nContext.Provider
      value={{
        t: translate,
        locale: onChangeLocale,
        currentLocale: localeRef.current,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  return useContext(I18nContext);
};

export default I18nContextProvider;
