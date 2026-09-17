import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TestimonialsGrid from "@/components/TestimonialsGrid";
import { getDepartments, getSettings, getTestimonials, type Locale } from "@/lib/api";

export default async function TestimonialsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [settings, departments, testimonials] = await Promise.all([
    getSettings(),
    getDepartments(),
    getTestimonials(),
  ]);

  return (
    <>
      <Header settings={settings} departments={departments} />
      <TestimonialsGrid testimonials={testimonials} locale={locale as Locale} />
      <Footer settings={settings} departments={departments} locale={locale as Locale} />
    </>
  );
}
