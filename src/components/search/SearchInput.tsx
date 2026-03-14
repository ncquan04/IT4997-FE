import { useI18n } from "../../contexts/I18nContext";

interface Props {
    value: string;
    onChange: (v: string) => void;
    onSearch: () => void;
}

const SearchInput = ({ value, onChange, onSearch }: Props) => {
    const i18n = useI18n();
    return (
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200">
            <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none">
                <path
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M10 18a8 8 0 100-16 8 8 0 000 16z"
                />
            </svg>

            <input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
                placeholder={i18n.t("What are you looking for?")}
                className="w-full text-sm outline-none placeholder:text-gray-400"
            />
        </div>
    );
};

export default SearchInput;
