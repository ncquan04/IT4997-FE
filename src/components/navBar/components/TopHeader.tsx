import { HORIZONTAL_PADDING_REM } from "../../../constants";
import { useI18n } from "../../../contexts/I18nContext";
import { languageNames } from "../../../i18n";
import ArrowDownIcon from "../../../icons/ArrowDownIcon";
import LanguageSelectDropdown from "./LanguageSelectDropdown";
import { useEffect, useRef, useState } from "react";

const TopHeader = () => {
  const i18n = useI18n();
  const { currentLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <aside
      className="w-full h-10 sm:h-12 bg-black items-center flex flex-row px-2 sm:px-4 md:px-6 lg:px-8 xl:px-[var(--horizontal-padding)]"
      style={
        {
          "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
        } as React.CSSProperties
      }
      aria-label="Promotions and language selector"
    >
      <div className="hidden lg:block flex-1" aria-hidden="true" />
      <div className="flex flex-row gap-1 sm:gap-2 items-center lg:flex-1 justify-center overflow-hidden">
        <p className="text-white text-[10px] sm:text-xs md:text-sm m-0 truncate text-center sm:text-left">
          {i18n.t(
            "Summer Sale For All Swim Suits And Free Express Delivery - OFF 50%!"
          )}
        </p>
        <a
          href="#"
          className="text-[10px] sm:text-xs md:text-sm text-white underline whitespace-nowrap flex-shrink-0"
        >
          {i18n.t("Shop now")}
        </a>
      </div>
      <div
        className="relative flex-shrink-0 lg:flex-1 lg:flex lg:justify-end"
        ref={containerRef}
      >
        <button
          type="button"
          className="p-1 sm:p-2 justify-center items-center gap-1 sm:gap-2 flex flex-row select-none bg-transparent border-0 hover:cursor-pointer"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="listbox"
          aria-expanded={open}
        >
          <span className="text-[10px] sm:text-xs md:text-sm text-white whitespace-nowrap">
            {languageNames[currentLocale]}
          </span>
          <span
            className={`transition-transform duration-200 ${
              open ? "rotate-180" : "rotate-0"
            }`}
          >
            <ArrowDownIcon
              width={10}
              height={10}
              fill="white"
              aria-hidden="true"
              className="sm:w-3 sm:h-3"
            />
          </span>
        </button>
        <LanguageSelectDropdown
          open={open}
          onSelect={() => {
            setOpen(false);
          }}
        />
      </div>
    </aside>
  );
};

export default TopHeader;
