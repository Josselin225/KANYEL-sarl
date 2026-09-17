"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal } from "./Reveal";
import JobApplicationForm from "./JobApplicationForm";
import { pick, type ApiJobOffer, type ContractType, type Locale } from "@/lib/api";

const CONTRACT_LABELS: Record<ContractType, string> = {
  cdi: "CDI",
  cdd: "CDD",
  stage: "Stage",
  freelance: "Freelance",
};

function IconChevronDown() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconPin() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
      <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="12" cy="9.5" r="2.3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function formatDate(dateStr: string, locale: Locale) {
  return new Date(dateStr).toLocaleDateString(locale === "en" ? "en-US" : "fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function JobCard({ job, locale, open, onToggle }: { job: ApiJobOffer; locale: Locale; open: boolean; onToggle: () => void }) {
  const t = useTranslations("jobs");
  const title = pick(job, "title", locale);
  const description = pick(job, "description", locale);
  const requirements = pick(job, "requirements", locale);

  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-soft">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 p-6 text-left sm:p-7"
      >
        <div>
          <h3 className="font-display text-xl font-semibold text-navy">{title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-ink-dim">
            <span className="rounded-full bg-gold-soft px-3 py-1 font-semibold uppercase tracking-wide text-gold-dark">
              {CONTRACT_LABELS[job.contract_type]}
            </span>
            {job.location && (
              <span className="flex items-center gap-1.5">
                <IconPin />
                {job.location}
              </span>
            )}
          </div>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-soft text-navy"
        >
          <IconChevronDown />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-6 pb-6 pt-5 sm:px-7 sm:pb-7">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-dim">{description}</p>

              {requirements && (
                <div className="mt-5">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                    {t("requirementsLabel")}
                  </h4>
                  <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink-dim">{requirements}</p>
                </div>
              )}

              {job.deadline && (
                <p className="mt-4 text-xs font-medium text-ink-dim">
                  {t("deadlineLabel")}: {formatDate(job.deadline, locale)}
                </p>
              )}

              <div className="mt-6 border-t border-border pt-5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gold-dark">
                  {t("applyButton")}
                </h4>
                <JobApplicationForm jobId={job.id} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function JobOffers({ jobs, locale }: { jobs: ApiJobOffer[]; locale: Locale }) {
  const t = useTranslations("jobs");
  const [openId, setOpenId] = useState<number | null>(jobs[0]?.id ?? null);
  const [spontOpen, setSpontOpen] = useState(false);

  return (
    <>
      <section className="bg-navy-deep py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold-light">
              {t("kicker")}
            </span>
            <h1 className="mt-6 font-display text-4xl font-semibold text-white sm:text-5xl">{t("title")}</h1>
            <p className="mx-auto mt-4 max-w-xl text-base text-white/70">{t("subtitle")}</p>
          </Reveal>
        </div>
      </section>

      <section className="bg-bg-alt py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          {jobs.length === 0 ? (
            <Reveal className="rounded-3xl bg-white p-8 text-center shadow-soft">
              <p className="text-sm text-ink-dim">{t("empty")}</p>
            </Reveal>
          ) : (
            <div className="space-y-5">
              {jobs.map((job) => (
                <Reveal key={job.id}>
                  <JobCard
                    job={job}
                    locale={locale}
                    open={openId === job.id}
                    onToggle={() => setOpenId(openId === job.id ? null : job.id)}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-bg-alt pb-16 sm:pb-20">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <Reveal className="rounded-3xl bg-white p-8 shadow-soft sm:p-10">
            <h2 className="font-display text-2xl font-semibold text-navy">{t("spontTitle")}</h2>
            <p className="mt-3 text-sm text-ink-dim">{t("spontSubtitle")}</p>

            {!spontOpen ? (
              <motion.button
                type="button"
                onClick={() => setSpontOpen(true)}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="mt-6 rounded-full bg-navy px-7 py-3.5 text-sm font-semibold text-white shadow-soft"
              >
                {t("spontButton")}
              </motion.button>
            ) : (
              <div className="mt-6 text-left">
                <JobApplicationForm jobId={null} />
              </div>
            )}
          </Reveal>
        </div>
      </section>
    </>
  );
}
