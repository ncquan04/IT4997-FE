import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { logEvent } from "../utils/analytics";

/**
 * Fires a `page_view` event on every route change.
 * Place once in the router (inside BrowserRouter).
 */
export function usePageView() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;

    logEvent("page_view", {
      page: location.pathname,
      search: location.search,
      title: document.title,
    });
  }, [location.pathname, location.search]);
}
