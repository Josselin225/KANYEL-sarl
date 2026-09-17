"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { getToken } from "@/lib/adminApi";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const locale = useLocale();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      window.location.href = `/${locale}/admin/login`;
      return;
    }
    setChecked(true);
  }, [locale]);

  if (!checked) return null;

  return <>{children}</>;
}
