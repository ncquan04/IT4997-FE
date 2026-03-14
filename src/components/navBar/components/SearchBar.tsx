import { useState } from "react";
import { useI18n } from "../../../contexts/I18nContext";
import SearchIcon from "../../../icons/SearchIcon";
import { useNavigate } from "react-router";

const SearchBar = () => {
    const i18n = useI18n();
    const navigate = useNavigate();
    const [userInput, setUserInput] = useState<string>("");

    const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserInput(e.target.value);
    };

    const handleSearch = () => {
        if (!userInput) return;
        navigate({
            pathname: "/search",
            search: `?q=${encodeURIComponent(userInput)}`,
        });
        setUserInput("");
    };

    return (
        <form
            role="search"
            className="h-9 md:h-[38px] bg-gray-100 rounded-lg flex flex-row items-center pl-3 md:pl-4 pr-3 md:pr-4 relative w-full md:w-auto"
            onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
            }}
        >
            <label htmlFor="navbar-search" className="sr-only">
                {i18n.t("Search")}
            </label>
            <input
                id="navbar-search"
                type="search"
                placeholder={i18n.t("What are you looking for?")}
                className="text-sm md:text-base text-gray-600 bg-transparent outline-0 w-full h-full truncate pr-10 md:pr-12 placeholder:text-xs md:placeholder:text-sm"
                value={userInput}
                onChange={handleChangeText}
            />
            <button
                type="submit"
                aria-label={i18n.t("Search") as string}
                className="absolute top-2 md:top-[10px] right-2"
            >
                <SearchIcon />
            </button>
        </form>
    );
};

export default SearchBar;
