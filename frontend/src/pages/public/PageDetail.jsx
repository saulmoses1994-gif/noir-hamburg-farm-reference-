import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO, breadcrumbSchema } from "@/lib/seo";
import { api } from "@/lib/api";
import { SERVICES, LOCATIONS } from "@/data/site";

export default function PageDetail() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    setPage(null);
    api.get(`/pages/${slug}`).then((r) => setPage(r.data)).catch(() => setPage(false));
  }, [slug]);

  useSEO({
    title: page?.meta_title || (page ? `${page.title} | Noir Hamburg` : ""),
    description: page?.meta_description || page?.intro,
    image: page?.hero_image,
    jsonLd: page ? breadcrumbSchema([{ label: page.title }]) : null,
  });

  if (page === false) {
    return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">Seite nicht gefunden.</div></PublicLayout>;
  }
  if (!page) {
    return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">Lädt…</div></PublicLayout>;
  }

  const relatedServices = SERVICES.filter((s) => page.related_services?.includes(s.slug));
  const relatedLocations = LOCATIONS.filter((l) => page.related_locations?.includes(l.slug));

  return (
    <PublicLayout>
      {page.hero_image ? (
        <section className="relative h-[55vh] flex items-end">
          <div className="absolute inset-0">
            <img src={page.hero_image} alt={page.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A1414] via-[#1A1414]/55 to-transparent" />
          </div>
          <div className="relative z-10 px-6 md:px-12 lg:px-16 pb-12 max-w-4xl text-white">
            <Breadcrumbs items={[{ label: page.title }]} dark />
            <h1 className="font-heading text-5xl lg:text-7xl font-semibold mt-6 text-white">{page.h1 || page.title}</h1>
            {page.intro && <p className="font-heading italic text-xl text-white/80 mt-4 max-w-3xl">{page.intro}</p>}
          </div>
        </section>
      ) : (
        <section className="px-6 md:px-12 lg:px-16 pt-12 pb-4">
          <Breadcrumbs items={[{ label: page.title }]} />
          <h1 className="font-heading text-4xl lg:text-6xl font-semibold mt-6">{page.h1 || page.title}</h1>
          {page.intro && <p className="text-[#6B5F5F] mt-4 max-w-3xl text-lg">{page.intro}</p>}
        </section>
      )}

      <article className="px-6 md:px-12 lg:px-16 py-16">
        <div className="prose-noir max-w-3xl" dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>

      {(relatedServices.length > 0 || relatedLocations.length > 0) && (
        <section className="px-6 md:px-12 lg:px-16 py-12 bg-[#FBF7F4]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl">
            {relatedServices.length > 0 && (
              <div>
                <span className="overline">Passende Services</span>
                <ul className="mt-4 space-y-2">
                  {relatedServices.map((s) => (
                    <li key={s.slug}>
                      <Link to={`/services/${s.slug}`} className="font-heading text-xl link-underline hover:accent-text inline-flex items-center gap-2">
                        <ArrowRight size={14} className="accent-text" /> {s.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {relatedLocations.length > 0 && (
              <div>
                <span className="overline">Verwandte Orte</span>
                <ul className="mt-4 space-y-2">
                  {relatedLocations.map((l) => (
                    <li key={l.slug}>
                      <Link to={`/escort/${l.slug}`} className="font-heading text-xl link-underline hover:accent-text inline-flex items-center gap-2">
                        <ArrowRight size={14} className="accent-text" /> {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}
    </PublicLayout>
  );
}
