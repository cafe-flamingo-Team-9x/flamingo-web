"use client";

import * as React from "react";

const ADMIN_SIDEBAR_STORAGE_KEY = "admin-sidebar-collapsed";
const ADMIN_SIDEBAR_EXPANDED_WIDTH = "240px";
const ADMIN_SIDEBAR_COLLAPSED_WIDTH = "64px";

type AdminSidebarContextValue = {
  collapsed: boolean;
  setCollapsed: (value: boolean | ((prev: boolean) => boolean)) => void;
  toggleCollapsed: () => void;
};

const AdminSidebarContext = React.createContext<AdminSidebarContextValue | null>(null);

function useAdminSidebar() {
  const context = React.useContext(AdminSidebarContext);
  if (!context) {
    throw new Error("useAdminSidebar must be used within an AdminSidebarProvider.");
  }

  return context;
}

interface AdminSidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
}

function AdminSidebarProvider({ children, defaultCollapsed = false }: AdminSidebarProviderProps) {
  const [collapsed, setCollapsedState] = React.useState(defaultCollapsed);

  React.useEffect(() => {
    const storedValue =
      typeof window !== "undefined" ? window.localStorage.getItem(ADMIN_SIDEBAR_STORAGE_KEY) : null;
    if (storedValue !== null) {
      setCollapsedState(storedValue === "true");
    }
  }, []);

  const setCollapsed = React.useCallback((value: boolean | ((prev: boolean) => boolean)) => {
    setCollapsedState((prev) => {
      const nextValue = typeof value === "function" ? value(prev) : value;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(ADMIN_SIDEBAR_STORAGE_KEY, String(nextValue));
      }
      return nextValue;
    });
  }, []);

  const toggleCollapsed = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, [setCollapsed]);

  const contextValue = React.useMemo(
    () => ({
      collapsed,
      setCollapsed,
      toggleCollapsed,
    }),
    [collapsed, setCollapsed, toggleCollapsed],
  );

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const root = document.documentElement;
    let frame = 0;

    const applyWidths = () => {
      root.style.setProperty("--admin-sidebar-expanded-width", ADMIN_SIDEBAR_EXPANDED_WIDTH);
      root.style.setProperty("--admin-sidebar-collapsed-width", ADMIN_SIDEBAR_COLLAPSED_WIDTH);
      root.style.setProperty(
        "--admin-sidebar-current-width",
        collapsed ? ADMIN_SIDEBAR_COLLAPSED_WIDTH : ADMIN_SIDEBAR_EXPANDED_WIDTH,
      );
    };

    const handleResize = () => {
      if (typeof window === "undefined") {
        return;
      }

      cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(applyWidths);
    };

    applyWidths();
    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", handleResize);
      root.style.removeProperty("--admin-sidebar-current-width");
      root.style.removeProperty("--admin-sidebar-expanded-width");
      root.style.removeProperty("--admin-sidebar-collapsed-width");
    };
  }, [collapsed]);

  return (
    <AdminSidebarContext.Provider value={contextValue}>{children}</AdminSidebarContext.Provider>
  );
}

export { AdminSidebarProvider, useAdminSidebar };
