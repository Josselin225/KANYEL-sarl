"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "framer-motion";
import { searchSite, type ApiSearchResult, type SearchResultType } from "@/lib/api";

function IconSearch() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function SearchButton() {
  const t = useTranslations("search");
  const locale = useLocale();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ApiSearchResult[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQuery("");
      setResults(null);
    }
  }, [open]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const handle = setTimeout(async () => {
      setResults(await searchSite(query));
    }, 300);
    return () => clearTimeout(handle);
  }, [query]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const typeLabels: Record<SearchResultType, string> = {
    department: t("department"),
    property: t("property"),
    article: t("article"),
    realisation: t("realisation"),
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t("open")}
        className="flex h-10 w-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-navy-soft"
      >
        <IconSearch />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center bg-navy-deep/60 p-4 pt-[12vh]"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-soft-lg"
            >
              <div className="flex items-center gap-3 border-b border-border px-5 py-4">
                <IconSearch />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("placeholder")}
                  className="flex-1 text-sm outline-none"
                />
                <button onClick={() => setOpen(false)} aria-label="Fermer" className="text-ink-dim hover:text-navy">
                  <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                    <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="max-h-[50vh] overflow-y-auto p-2">
                {query.trim().length < 2 && <p className="p-4 text-sm text-ink-dim">{t("typeToSearch")}</p>}
                {query.trim().length >= 2 && results === null && (
                  <p className="p-4 text-sm text-ink-dim">…</p>
                )}
                {results !== null && results.length === 0 && (
                  <p className="p-4 text-sm text-ink-dim">{t("noResults")}</p>
                )}
                {results?.map((r, i) => (
                  <a
                    key={`${r.type}-${i}`}
                    href={`/${locale}${r.url}`}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-3 hover:bg-navy-soft"
                  >
                    <p className="text-xs font-semibold uppercase tracking-wide text-gold-dark">{typeLabels[r.type]}</p>
                    <p className="mt-0.5 text-sm font-semibold text-navy">{r.title}</p>
                    {r.excerpt && <p className="mt-0.5 truncate text-xs text-ink-dim">{r.excerpt}</p>}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
