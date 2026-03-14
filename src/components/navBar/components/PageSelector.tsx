import { useMemo } from "react";
import { useI18n } from "../../../contexts/I18nContext";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";

interface PageSelectorProps {
  mobile?: boolean;
}

const PageSelector = ({ mobile = false }: PageSelectorProps) => {
  const i18n = useI18n();
  const { pathname } = useLocation();
  const { isAuthenticated, logout } = useAuth();

  const pages = useMemo(() => {
    type PageItem =
      | { name: string; path: string; action?: undefined }
      | { name: string; action: () => Promise<void>; path?: undefined };

    const items: (PageItem | undefined)[] = [
      { name: "Home", path: "/" },
      { name: "Contact", path: "/contact" },
      { name: "About", path: "/about" },
      isAuthenticated
        ? { name: "Log Out", action: logout }
        : { name: "Log In", path: "/login" },
    ];

    return items.filter((page): page is PageItem => page !== undefined);
  }, [isAuthenticated, logout]);

  if (mobile) {
    return (
      <ul className="flex flex-col gap-4 list-none m-0 p-0">
        {pages.map((page) => (
          <li key={page.name}>
            {page.path ? (
              <Link
                to={page.path}
                className={`text-base text-gray-600 hover:cursor-pointer block py-2 ${
                  pathname === page.path ? "underline font-semibold" : ""
                }`}
                aria-current={pathname === page.path ? "page" : undefined}
              >
                {i18n.t(page.name)}
              </Link>
            ) : (
              <span
                onClick={page.action}
                className="text-base text-gray-600 hover:cursor-pointer block py-2"
              >
                {i18n.t(page.name)}
              </span>
            )}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex flex-row gap-6 justify-center items-center list-none m-0 p-0">
      {pages.map((page) => (
        <li key={page.name}>
          {page.path ? (
            <Link
              to={page.path}
              className={`text-sm text-gray-600 hover:cursor-pointer ${
                pathname === page.path ? "underline" : ""
              }`}
              aria-current={pathname === page.path ? "page" : undefined}
            >
              {i18n.t(page.name)}
            </Link>
          ) : (
            <span
              onClick={page.action}
              className="text-sm text-gray-600 hover:cursor-pointer"
            >
              {i18n.t(page.name)}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
};

export default PageSelector;
