import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Contact from "@/components/Contact";
import MinimalHome from "@/components/concept3/MinimalHome";
import { getSiteData, type Locale } from "@/lib/api";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const data = await getSiteData();

  return (
    <>
      <Header settings={data.settings} departments={data.departments} />
      <MinimalHome
        settings={data.settings}
        departments={data.departments}
        credentials={data.credentials}
        stats={data.stats}
        partners={data.partners}
        properties={data.properties}
        realisations={data.realisations}
        locale={locale as Locale}
      />
      <Contact settings={data.settings} />
      <Footer settings={data.settings} departments={data.departments} locale={locale as Locale} />
    </>
  );
}
