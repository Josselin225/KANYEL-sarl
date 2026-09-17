"use client";

import { useEffect } from "react";
import { incrementVisit } from "@/lib/api";

const STORAGE_KEY = "kanyel_last_visit";

export default function VisitTracker() {
  useEffect(() => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const last = window.localStorage.getItem(STORAGE_KEY);
      if (last === today) return;
      window.localStorage.setItem(STORAGE_KEY, today);
      incrementVisit();
    } catch {
      // Ignore storage access errors (private browsing, etc.).
    }
  }, []);

  return null;
}
