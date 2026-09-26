import { useCallback, useEffect, useState } from "react";
import { getDefaultSection } from "./roleNavigation";
import {
  readNavigationLocation,
  writeNavigationLocation,
} from "./navigationUrl";

export function useRoleNavigationState(
  role: string,
  getInitialPage: (section: string) => string | undefined,
) {
  const [activeSection, setActiveSection] = useState(() => {
    if (typeof window === "undefined") return getDefaultSection(role);
    return readNavigationLocation(role, getInitialPage).section;
  });
  const [activePage, setActivePage] = useState<string | undefined>(() => {
    if (typeof window === "undefined") return getInitialPage(getDefaultSection(role));
    return readNavigationLocation(role, getInitialPage).page;
  });

  useEffect(() => {
    const syncFromUrl = () => {
      const next = readNavigationLocation(role, getInitialPage);
      setActiveSection(next.section);
      setActivePage(next.page);
      writeNavigationLocation(next.section, next.page, "replace");
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, [getInitialPage, role]);

  const selectPage = useCallback(
    (section: string, page: string) => {
      setActiveSection(section);
      setActivePage(page);
      writeNavigationLocation(section, page, "push");
    },
    [],
  );

  return { activePage, activeSection, selectPage };
}
