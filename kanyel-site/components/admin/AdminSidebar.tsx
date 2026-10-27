"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { getRole } from "@/lib/adminApi";
import { ADMIN_DASHBOARD_ITEM, visibleNavGroups, type AdminNavItem } from "@/lib/adminNav";
import Logo from "../Logo";
import NavIcon from "./NavIcon";

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
    >
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconPanelToggle({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9.5 4.5v15" stroke="currentColor" strokeWidth="1.6" />
      <path d="m7 10.5-1.8 1.5L7 13.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const COLLAPSE_KEY = "kanyel_admin_sidebar_collapsed";

function isItemActive(pathname: string, item: AdminNavItem) {
  return item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
}

export default function AdminSidebar() {
  const pathname = usePathname();
  const groups = visibleNavGroups(getRole());
  const [openGroup, setOpenGroup] = useState<string | null>(() => {
    const active = groups.find((g) => g.items.some((item) => isItemActive(pathname, item)));
    return active?.key ?? null;
  });
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
    } catch {
      // Ignore — defaults to expanded.
    }
  }, []);

  useEffect(() => {
    const active = groups.find((g) => g.items.some((item) => isItemActive(pathname, item)));
    if (active) setOpenGroup(active.key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  function toggleGroup(key: string) {
    setOpenGroup((prev) => (prev === key ? null : key));
  }

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        // Ignore — collapse state just won't persist.
      }
      return next;
    });
  }

  function openGroupExpanded(key: string) {
    if (collapsed) toggleCollapsed();
    setOpenGroup(key);
  }

  const dashboardActive = isItemActive(pathname, ADMIN_DASHBOARD_ITEM);

  return (
    <aside
      className={`flex h-full shrink-0 flex-col border-r border-admin-border bg-admin-surface transition-[width] duration-200 ${
        collapsed ? "w-[4.5rem]" : "w-64"
      }`}
    >
      <div
        className={`flex shrink-0 items-center border-b border-admin-border py-5 ${
          collapsed ? "justify-center px-2" : "justify-between px-5"
        }`}
      >
        {collapsed ? (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy font-display text-base font-semibold text-gold-light">
            K
          </div>
        ) : (
          <Logo />
        )}
        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapsed}
            aria-label="Réduire le menu"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-text-dim transition-colors hover:bg-admin-surface-hover hover:text-admin-text"
          >
            <IconPanelToggle collapsed={false} />
          </button>
        )}
      </div>

      {collapsed && (
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label="Agrandir le menu"
          className="mx-auto mt-3 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-admin-text-dim transition-colors hover:bg-admin-surface-hover hover:text-admin-text"
        >
          <IconPanelToggle collapsed={true} />
        </button>
      )}

      <nav className={`flex-1 space-y-1 overflow-y-auto py-4 ${collapsed ? "px-2" : "px-3"}`}>
        <Link
          href={ADMIN_DASHBOARD_ITEM.href}
          title={collapsed ? ADMIN_DASHBOARD_ITEM.label : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
            collapsed ? "justify-center" : ""
          } ${dashboardActive ? "bg-admin-accent text-admin-accent-text" : "text-admin-text-dim hover:bg-admin-surface-hover hover:text-admin-text"}`}
        >
          <NavIcon name={ADMIN_DASHBOARD_ITEM.icon} />
          {!collapsed && ADMIN_DASHBOARD_ITEM.label}
        </Link>

        <div className="pt-2" />

        {groups.map((group) => {
          const open = openGroup === group.key && !collapsed;
          const groupActive = group.items.some((item) => isItemActive(pathname, item));
          return (
            <div key={group.key}>
              <button
                type="button"
                onClick={() => (collapsed ? openGroupExpanded(group.key) : toggleGroup(group.key))}
                aria-expanded={open}
                title={collapsed ? group.label : undefined}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  collapsed ? "justify-center" : ""
                } ${groupActive && !open ? "text-admin-text" : "text-admin-text-dim"} hover:bg-admin-surface-hover hover:text-admin-text`}
              >
                <NavIcon name={group.icon} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{group.label}</span>
                    <IconChevron open={open} />
                  </>
                )}
              </button>

              {open && (
                <div className="ml-4 mt-1 space-y-1 border-l border-admin-border pl-3">
                  {group.items.map((item) => {
                    const active = isItemActive(pathname, item);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                          active ? "bg-admin-accent text-admin-accent-text" : "text-admin-text-dim hover:bg-admin-surface-hover hover:text-admin-text"
                        }`}
                      >
                        <NavIcon name={item.icon} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
