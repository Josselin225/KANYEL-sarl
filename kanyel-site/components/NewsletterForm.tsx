"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { subscribeToNewsletter } from "@/lib/api";

export default function NewsletterForm() {
  const t = useTranslations("newsletter");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const website = String(form.get("website") ?? "");
    if (website) return;

    const email = String(form.get("email") ?? "");
    setStatus("sending");
    try {
      await subscribeToNewsletter(email);
      setStatus("sent");
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Erreur");
    }
  }

  if (status === "sent") {
    return (
      <p className="mx-auto max-w-lg rounded-2xl bg-gold-soft px-5 py-4 text-center text-sm font-semibold text-gold-dark">
        ✓ {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0"
      />
      <input
        type="email"
        name="email"
        required
        placeholder={t("placeholder")}
        className="flex-1 rounded-full border border-border bg-white px-5 py-3 text-sm text-ink outline-none focus:border-navy"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded-full bg-navy px-6 py-3 text-sm font-semibold text-white shadow-soft transition-shadow hover:shadow-soft-lg disabled:opacity-60"
      >
        {status === "sending" ? t("sending") : t("submit")}
      </button>
      {status === "error" && <p className="text-xs text-red-600 sm:basis-full">{errorMessage}</p>}
    </form>
  );
}
