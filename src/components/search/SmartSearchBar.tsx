import { useEffect, useState } from "react";
import type { ICategory } from "../../shared/models/category-model";
import SearchInput from "./SearchInput";
import CategoryShortcuts from "./CategoryShortcuts";
import { useAppDispatch, useAppSelector, type RootState } from "../../redux/store";
import categoriesAync from "../../redux/async-thunk/categories.thunk";
import { useI18n } from "../../contexts/I18nContext";
import SearchIcon from "../../icons/SearchIcon";
import { useNavigate } from "react-router";
import RecentItem from "./FilterRow";
import AppStorage from "../../storage";

const SmartSearchBar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const categories = useAppSelector((state: RootState) => state.categories.categories);
    const i18n = useI18n();

    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [category, setCategory] = useState<ICategory | null>(null);
    const [recentSearch, setRecenSearch] = useState<{ id: number; label: string }[] | null>();

    useEffect(() => {
        if (open) {
            //fetch data
            if (categories.length === 0) dispatch(categoriesAync.fectchCategories());
            const recent = AppStorage.get("recent-search");
            setRecenSearch(recent);
        }
    }, [open]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setOpen(true);
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (category) params.append("categoryId", category._id);
        if (query) {
            const prev = recentSearch ?? [];
            const filtered = prev.filter((item) => item.label !== query);
            const updated = [{ id: Date.now(), label: query }, ...filtered];

            AppStorage.set("recent-search", updated);
        }
        navigate({
            pathname: "/search",
            search: params.toString(),
        });

        setOpen(false);
        setQuery("");
        setCategory(null);
    };

    const handleRecentSearch = (recent: { id: number; label: string }) => {
        const params = new URLSearchParams();
        params.append("q", recent.label);
        navigate({
            pathname: "/search",
            search: params.toString(),
        });
        setOpen(false);
    };

    const handleRemoveRecent = (recent: { id: number; label: string }) => {
        const newRecent = recentSearch?.filter((e) => e.id !== recent.id);
        AppStorage.set("recent-search", newRecent);
        setRecenSearch(newRecent);
    };
    return (
        <>
            {/* SEARCH TRIGGER */}
            <button
                onClick={() => setOpen(true)}
                className="mx-auto flex items-center gap-3 w-full max-w-xl px-4 py-3 rounded-xl border-0 text-sm bg-gray-100 text-gray-400 hover:shadow"
            >
                <span className="flex-1 text-left text-gray-400 truncate whitespace-nowrap overflow-hidden">
                    {i18n.t("What are you looking for?")}
                </span>
                <kbd className="text-xs bg-gray-100 px-2 py-0.5 rounded">⌘K</kbd>
                <SearchIcon />
            </button>

            {/* OVERLAY */}
            {open && (
                <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
            )}

            {/* SEARCH PANEL */}
            {open && (
                <div
                    className="fixed inset-0 z-40 bg-black/30 flex items-start justify-center pt-24"
                    onClick={() => setOpen(false)}
                >
                    <div
                        className="w-full px-2 max-w-xl bg-white rounded-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <SearchInput value={query} onChange={setQuery} onSearch={handleSearch} />

                        <CategoryShortcuts
                            categories={categories}
                            selected={category}
                            onSelect={setCategory}
                        />
                        <div className="px-4 py-3">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase mb-2">
                                Recent search
                            </p>
                            {recentSearch &&
                                recentSearch.map((recent) => (
                                    <RecentItem
                                        key={recent.id}
                                        label={recent.label}
                                        onRemove={() => {
                                            handleRemoveRecent(recent);
                                        }}
                                        onClick={() => handleRecentSearch(recent)}
                                    />
                                ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default SmartSearchBar;
