import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobOffers from "@/components/JobOffers";
import { getDepartments, getJobOffers, getSettings, type Locale } from "@/lib/api";

export default async function JobOffersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments, jobs] = await Promise.all([
    getSettings(),
    getDepartments(),
    getJobOffers(),
  ]);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <JobOffers jobs={jobs} locale={locale as Locale} />
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
