import { HORIZONTAL_PADDING_REM } from "../../../constants";
import CartButton from "./CartButton";
import PageSelector from "./PageSelector";
import SearchBar from "./SearchBar";
import WishlistButton from "./WishlistButton";
import { Link } from "react-router-dom";
import { useState } from "react";
import MenuIcon from "../../../icons/MenuIcon";
import CloseIcon from "../../../icons/CloseIcon";
import SmartSearchBar from "../../search/SmartSearchBar";

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    return (
        <>
            <div
                className="w-full flex flex-row py-3 md:py-4 justify-between items-center px-4 sm:px-6 md:px-8 lg:px-[var(--horizontal-padding)]"
                style={
                    {
                        "--horizontal-padding": `${HORIZONTAL_PADDING_REM}rem`,
                    } as React.CSSProperties
                }
            >
                {/* Hamburger Menu Button - Mobile Only */}
                <button
                    type="button"
                    className="lg:hidden p-2 -ml-2"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                    aria-expanded={mobileMenuOpen}
                >
                    {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>

                {/* Logo */}
                <Link
                    to="/"
                    className="flex flex-row gap-1 items-center hover:cursor-pointer"
                    aria-label="Go to home"
                >
                    <img src="/icon.jpg" alt="Apex logo" className="h-8 md:h-10" />
                    <span className="text-lg md:text-2xl text-black font-bold">Apex</span>
                </Link>

                {/* Desktop Navigation */}
                <nav aria-label="Primary" className="hidden lg:contents">
                    <PageSelector />
                </nav>

                {/* Right Side Actions */}
                <div className="justify-center items-center flex flex-row gap-2 md:gap-0">
                    {/* Search Bar - Hidden on mobile */}
                    <div className="hidden md:block">
                        <SmartSearchBar />
                    </div>
                    <WishlistButton />
                    <CartButton />
                </div>
            </div>

            {/* Mobile Menu */}
            <div
                className={`lg:hidden border-t border-gray-200 bg-white overflow-hidden transition-all duration-300 ease-in-out ${
                    mobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                }`}
            >
                <nav className="px-4 py-4" aria-label="Mobile navigation">
                    <div className="flex flex-col gap-4">
                        {/* Mobile Search */}
                        <SmartSearchBar />
                        {/* Mobile Page Links */}
                        <PageSelector mobile />
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Header;
