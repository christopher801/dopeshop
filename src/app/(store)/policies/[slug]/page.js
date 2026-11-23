import { notFound } from 'next/navigation';
import { policies } from '@/data/policies';
import { buildMetadata } from '@/lib/seo';

export const dynamicParams = false;
export const generateStaticParams = () => Object.keys(policies).map((slug) => ({ slug }));

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = policies[slug];
  if (!p) return {};
  return buildMetadata({ title: p.title, description: p.intro, path: `/policies/${slug}` });
}

export default async function PolicyPage({ params }) {
  const { slug } = await params;
  const p = policies[slug];
  if (!p) notFound();
  return (
    <div className="container-page max-w-3xl py-8 md:py-12">
      <h1 className="text-3xl">{p.title}</h1>
      <p className="mt-3 rounded-control bg-amber-50 p-3 text-xs text-amber-900 ring-1 ring-amber-200">
        Plantilla de referencia: el propietario debe revisarla y completar los campos entre [CORCHETES]. No constituye asesoría legal.
      </p>
      <p className="prose-copy mt-5">{p.intro}</p>
      <div className="mt-6 space-y-6">
        {p.sections.map(([h, text]) => (
          <section key={h}>
            <h2 className="text-lg">{h}</h2>
            <p className="prose-copy mt-2">{text}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
