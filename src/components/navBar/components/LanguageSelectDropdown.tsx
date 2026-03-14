import { useI18n } from "../../../contexts/I18nContext";
import { languageNames, flagEmojis } from "../../../i18n";

type LanguageSelectDropdownProps = {
  open: boolean;
  onSelect?: (code: string) => void;
};

const LanguageSelectDropdown = ({
  open,
  onSelect,
}: LanguageSelectDropdownProps) => {
  const { locale, currentLocale } = useI18n();

  return (
    <div
      className={`absolute top-8 right-0 origin-top-right p-2 bg-white rounded-lg shadow-lg z-10 flex flex-col gap-1 min-w-[160px]
         transition-all duration-200 ease-out
         ${
           open
             ? "opacity-100 scale-100 translate-y-0 pointer-events-auto visible"
             : "opacity-0 scale-95 -translate-y-1 pointer-events-none invisible"
         }`}
      role="listbox"
      aria-label="Language selector"
      aria-hidden={!open}
    >
      {Object.entries(languageNames).map(([code, name]) => {
        const selected = currentLocale === code;
        return (
          <button
            key={code}
            type="button"
            role="option"
            aria-selected={selected}
            disabled={!open}
            onClick={() => {
              locale(code);
              onSelect?.(code);
            }}
            className={`flex flex-row items-center gap-2 rounded px-2 py-1 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
              selected ? "bg-gray-100" : ""
            }`}
          >
            <span className="text-base">{flagEmojis[code]}</span>
            <span className="text-sm text-black">{name}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSelectDropdown;
