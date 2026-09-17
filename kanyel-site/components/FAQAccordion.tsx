"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { pick, type ApiFAQ, type Locale } from "@/lib/api";

function IconChevron() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 shrink-0">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FAQAccordion({ items, locale }: { items: ApiFAQ[]; locale: Locale }) {
  const [openId, setOpenId] = useState<number | null>(items[0]?.id ?? null);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
            <button
              type="button"
              onClick={() => setOpenId(open ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 p-5 text-left"
            >
              <span className="font-display text-base font-semibold text-navy">{pick(item, "question", locale)}</span>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="text-navy"
              >
                <IconChevron />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <p className="whitespace-pre-line px-5 pb-5 text-sm leading-relaxed text-ink-dim">
                    {pick(item, "answer", locale)}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
