"use client";

import { FormEvent, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { submitPropertyVisitRequest } from "@/lib/api";

export default function PropertyVisitModal({
  propertyId,
  propertyTitle,
  onClose,
}: {
  propertyId: number;
  propertyTitle: string;
  onClose: () => void;
}) {
  const t = useTranslations("propertyVisit");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const website = String(form.get("website") ?? "");

    setStatus("sending");
    try {
      await submitPropertyVisitRequest({
        property: propertyId,
        full_name: String(form.get("full_name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        preferred_date: String(form.get("preferred_date") ?? "") || null,
        message: String(form.get("message") ?? ""),
        website,
      });
      setStatus("sent");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erreur");
    }
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-navy";
  const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-dim";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-deep/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-soft-lg sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-semibold text-navy">{t("title")}</h3>
            <p className="mt-1 text-sm text-ink-dim">{propertyTitle}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t("close")}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-dim transition-colors hover:bg-bg-alt hover:text-ink"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
              <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {status === "sent" ? (
          <p className="mt-6 rounded-2xl bg-gold-soft px-5 py-4 text-sm font-semibold text-gold-dark">
            ✓ {t("success")}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <p className="text-sm text-ink-dim">{t("subtitle")}</p>

            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
            />

            <div>
              <label className={labelClass}>
                {t("formName")}
                <span className="text-gold-dark"> *</span>
              </label>
              <input name="full_name" type="text" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                {t("formEmail")}
                <span className="text-gold-dark"> *</span>
              </label>
              <input name="email" type="email" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>
                {t("formPhone")}
                <span className="text-gold-dark"> *</span>
              </label>
              <input name="phone" type="tel" required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("formDate")}</label>
              <input name="preferred_date" type="date" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>{t("formMessage")}</label>
              <textarea name="message" rows={3} className={inputClass} />
            </div>

            <p className="text-xs text-ink-dim">
              <span className="text-gold-dark">*</span> {t("requiredLegend")}
            </p>

            {status === "error" && <p className="text-xs text-red-600">{errorMessage}</p>}

            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-shadow hover:shadow-soft-lg disabled:opacity-60"
            >
              {status === "sending" ? t("formSending") : t("formSubmit")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
