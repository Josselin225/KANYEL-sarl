"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { submitJobApplication } from "@/lib/api";

export default function JobApplicationForm({ jobId }: { jobId: number | null }) {
  const t = useTranslations("jobs");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (jobId) fd.set("job", String(jobId));

    setStatus("sending");
    try {
      await submitJobApplication(fd);
      setStatus("sent");
      form.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erreur");
    }
  }

  if (status === "sent") {
    return (
      <p className="mt-4 rounded-2xl bg-gold-soft px-4 py-3 text-sm font-semibold text-gold-dark">
        ✓ {t("applicationSent")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-dim">
            {t("formName")}
            <span className="text-gold-dark"> *</span>
          </label>
          <input
            name="full_name"
            type="text"
            required
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-dim">
            {t("formEmail")}
            <span className="text-gold-dark"> *</span>
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
          />
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-dim">
          {t("formPhone")}
          <span className="text-gold-dark"> *</span>
        </label>
        <input
          name="phone"
          type="tel"
          required
          className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-dim">
          {t("formMessage")}
        </label>
        <textarea
          name="message"
          rows={3}
          className="w-full rounded-xl border border-border bg-bg px-3.5 py-2.5 text-sm text-ink outline-none focus:border-navy"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-dim">
            {t("formCv")}
            <span className="text-gold-dark"> *</span>
          </label>
          <input
            name="cv"
            type="file"
            required
            accept=".pdf,.doc,.docx"
            className="block w-full text-xs text-ink-dim file:mr-3 file:rounded-full file:border-0 file:bg-navy-soft file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-navy hover:file:bg-navy/10"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-ink-dim">
            {t("formCoverLetter")}
          </label>
          <input
            name="cover_letter"
            type="file"
            accept=".pdf,.doc,.docx"
            className="block w-full text-xs text-ink-dim file:mr-3 file:rounded-full file:border-0 file:bg-navy-soft file:px-3.5 file:py-2 file:text-xs file:font-semibold file:text-navy hover:file:bg-navy/10"
          />
        </div>
      </div>

      <p className="text-xs text-ink-dim">
        <span className="text-gold-dark">*</span> {t("requiredLegend")}
      </p>

      {status === "error" && <p className="text-xs text-red-600">{errorMessage}</p>}

      <button
        type="submit"
        disabled={status === "sending"}
        className="inline-flex items-center gap-2 rounded-full bg-navy px-6 py-2.5 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === "sending" ? t("sending") : t("submitApplication")}
      </button>
    </form>
  );
}
