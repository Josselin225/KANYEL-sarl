"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { pick, submitQuoteRequest, type ApiDepartment, type Locale } from "@/lib/api";

const BUDGET_KEYS = ["unknown", "lt_5m", "5m_20m", "20m_100m", "gt_100m"] as const;
const TIMELINE_KEYS = ["flexible", "urgent", "1_3_months", "3_6_months", "6_plus_months"] as const;

export default function QuoteForm({ departments, locale }: { departments: ApiDepartment[]; locale: Locale }) {
  const t = useTranslations("quote");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const website = String(form.get("website") ?? "");
    const department = String(form.get("department") ?? "");

    setStatus("sending");
    try {
      await submitQuoteRequest({
        full_name: String(form.get("full_name") ?? ""),
        email: String(form.get("email") ?? ""),
        phone: String(form.get("phone") ?? ""),
        department: department || null,
        budget: String(form.get("budget") ?? "unknown"),
        timeline: String(form.get("timeline") ?? "flexible"),
        description: String(form.get("description") ?? ""),
        website,
      });
      setStatus("sent");
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erreur");
    }
  }

  if (status === "sent") {
    return (
      <p className="rounded-2xl bg-gold-soft px-5 py-4 text-sm font-semibold text-gold-dark">
        ✓ {t("success")}
      </p>
    );
  }

  const inputClass =
    "w-full rounded-xl border border-border bg-bg px-4 py-2.5 text-sm text-ink outline-none focus:border-navy";
  const labelClass = "mb-1.5 block text-xs font-medium uppercase tracking-wide text-ink-dim";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl bg-white p-6 shadow-soft sm:p-8">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>
            {t("formPhone")}
            <span className="text-gold-dark"> *</span>
          </label>
          <input name="phone" type="tel" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{t("formDepartment")}</label>
          <select name="department" defaultValue="" className={inputClass}>
            <option value="">{t("formDepartmentGeneral")}</option>
            {departments.map((d) => (
              <option key={d.slug} value={d.slug}>
                {pick(d, "title", locale)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>{t("formBudget")}</label>
          <select name="budget" defaultValue="unknown" className={inputClass}>
            {BUDGET_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`budget.${key}`)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>{t("formTimeline")}</label>
          <select name="timeline" defaultValue="flexible" className={inputClass}>
            {TIMELINE_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`timeline.${key}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>
          {t("formDescription")}
          <span className="text-gold-dark"> *</span>
        </label>
        <textarea name="description" required rows={5} className={inputClass} />
      </div>

      <p className="text-xs text-ink-dim">
        <span className="text-gold-dark">*</span> {t("requiredLegend")}
      </p>

      {status === "error" && <p className="text-xs text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-soft transition-shadow hover:shadow-soft-lg disabled:opacity-60 sm:w-auto"
      >
        {status === "sending" ? t("formSending") : t("formSubmit")}
      </button>
    </form>
  );
}
