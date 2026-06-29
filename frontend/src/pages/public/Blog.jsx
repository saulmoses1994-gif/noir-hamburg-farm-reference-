import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { api } from "@/lib/api";
import { BLOG_CATEGORIES, SERVICES, LOCATIONS } from "@/data/site";

export function BlogList() {
  const [posts, setPosts] = useState([]);
  const [cat, setCat] = useState("");

  useEffect(() => {
    const url = cat ? `/blog?category=${encodeURIComponent(cat)}` : "/blog";
    api.get(url).then((r) => setPosts(r.data)).catch(() => {});
  }, [cat]);

  useSEO({
    title: "Magazin — Noir Hamburg | Lifestyle, Hamburg Guide & Reiseempfehlungen",
    description: "Das Noir Hamburg Magazin: Restaurants, Hotels, Reisen, Lifestyle und Hamburg-Insider-Wissen für anspruchsvolle Genießer.",
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="blog-list">
        <Breadcrumbs items={[{ label: "Blog" }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">Journal</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Noir <em className="italic accent-text">Magazin</em>
          </h1>
          <p className="mt-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
            Geschichten, Empfehlungen und Insider-Wissen aus dem Hamburger Premium-Lifestyle.
          </p>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-6 border-y border-[#1A1414]/8 sticky top-[68px] z-30 backdrop-blur-xl bg-[#FFFFFF]/85">
        <div className="flex flex-wrap items-center gap-3">
          <span className="overline mr-2">Kategorien</span>
          <button onClick={() => setCat("")} className={`text-xs uppercase tracking-[0.15em] py-1 px-3 border ${!cat ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F] hover:text-[#1A1414]"}`}>Alle</button>
          {BLOG_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`text-xs uppercase tracking-[0.15em] py-1 px-3 border ${cat === c ? "border-[#8B1538] text-[#8B1538]" : "border-[#1A1414]/15 text-[#6B5F5F] hover:text-[#1A1414]"}`}
              data-testid={`blog-cat-${c}`}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-16">
          {posts.map((p) => (
            <Link key={p.id} to={`/blog/${p.slug}`} className="group block" data-testid={`blog-card-${p.slug}`}>
              <div className="editorial-image h-[420px]">
                <img src={p.cover_image} alt={p.title} loading="lazy" />
              </div>
              <span className="overline mt-5 block accent-text">{p.category}</span>
              <h2 className="font-heading text-2xl lg:text-3xl mt-3 group-hover:accent-text transition-colors leading-tight">{p.title}</h2>
              <p className="mt-3 text-sm font-light text-[#6B5F5F] leading-relaxed line-clamp-3">{p.excerpt}</p>
            </Link>
          ))}
          {posts.length === 0 && (
            <div className="md:col-span-3 text-center py-20 text-[#6B5F5F]">
              <p className="font-heading text-2xl">Keine Beiträge in dieser Kategorie.</p>
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}

export function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    api.get(`/blog/${slug}`).then((r) => setPost(r.data)).catch(() => setPost(false));
  }, [slug]);

  useSEO({
    title: post?.meta_title || (post ? `${post.title} | Noir Hamburg` : ""),
    description: post?.meta_description || post?.excerpt,
    image: post?.cover_image,
    jsonLd: post ? {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": post.title,
      "image": post.cover_image,
      "datePublished": post.created_at,
      "author": { "@type": "Organization", "name": "Noir Hamburg" },
    } : null,
  });

  if (post === false) return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">Artikel nicht gefunden.</div></PublicLayout>;
  if (!post) return <PublicLayout><div className="px-6 py-32 text-center text-[#6B5F5F]">Lädt…</div></PublicLayout>;

  const relatedServices = SERVICES.filter((s) => post.related_services?.includes(s.slug));
  const relatedLocations = LOCATIONS.filter((l) => post.related_locations?.includes(l.slug));

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-8 pb-4">
        <Breadcrumbs items={[{ label: "Blog", to: "/blog" }, { label: post.title }]} />
      </section>

      <article className="px-6 md:px-12 lg:px-16 pb-20">
        <header className="max-w-4xl mx-auto text-center py-12 md:py-20">
          <span className="overline accent-text">{post.category}</span>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-light tracking-tighter leading-tight mt-6">
            {post.title}
          </h1>
          {post.created_at && (
            <div className="overline mt-8">{new Date(post.created_at).toLocaleDateString("de-DE", { year: "numeric", month: "long", day: "numeric" })}</div>
          )}
        </header>

        {post.cover_image && (
          <div className="editorial-image h-[60vh] mb-16 max-w-6xl mx-auto">
            <img src={post.cover_image} alt={post.title} />
          </div>
        )}

        <div
          className="prose-noir max-w-3xl mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
          data-testid="blog-content"
        />

        <div className="max-w-3xl mx-auto mt-20 thin-divider" />

        {(relatedServices.length > 0 || relatedLocations.length > 0) && (
          <div className="max-w-3xl mx-auto mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
            {relatedServices.length > 0 && (
              <div>
                <span className="overline mb-4 block">Verwandte Services</span>
                <ul className="space-y-3">
                  {relatedServices.map((s) => (
                    <li key={s.slug}>
                      <Link to={`/services/${s.slug}`} className="font-heading text-xl link-underline hover:accent-text">{s.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {relatedLocations.length > 0 && (
              <div>
                <span className="overline mb-4 block">Verwandte Orte</span>
                <ul className="space-y-3">
                  {relatedLocations.map((l) => (
                    <li key={l.slug}>
                      <Link to={`/escort/${l.slug}`} className="font-heading text-xl link-underline hover:accent-text">{l.name}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="max-w-3xl mx-auto mt-16 text-center">
          <Link to="/blog" className="btn-ghost">← Zurück zum Magazin</Link>
        </div>
      </article>
    </PublicLayout>
  );
}
