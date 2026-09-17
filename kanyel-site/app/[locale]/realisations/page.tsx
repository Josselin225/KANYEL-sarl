import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RealisationsGrid from "@/components/RealisationsGrid";
import { getDepartments, getRealisations, getSettings, type Locale } from "@/lib/api";

export default async function RealisationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments, realisations] = await Promise.all([
    getSettings(),
    getDepartments(),
    getRealisations(),
  ]);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <RealisationsGrid realisations={realisations} locale={locale as Locale} />
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
