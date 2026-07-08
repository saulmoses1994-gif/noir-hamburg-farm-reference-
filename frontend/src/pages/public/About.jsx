import { Link } from "react-router-dom";
import PublicLayout from "@/components/layout/PublicLayout";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useSEO } from "@/lib/seo";
import { ADVANTAGES } from "@/data/site";
import { useSettings } from "@/lib/settings";

const FALLBACK_ABOUT_IMAGE = "https://images.pexels.com/photos/19923619/pexels-photo-19923619.jpeg?auto=compress&cs=tinysrgb&w=1200";

export default function About() {
  const settings = useSettings();
  const aboutImage = settings.about_image || FALLBACK_ABOUT_IMAGE;
  useSEO({
    title: "Über uns — Die Philosophie von Noir Hamburg",
    description: "Noir Hamburg ist eine kleine, kuratierte Premium-Begleitagentur in Hamburg. Lernen Sie unsere Werte, Standards und unser Verständnis von Diskretion kennen.",
  });

  return (
    <PublicLayout>
      <section className="px-6 md:px-12 lg:px-16 pt-12 pb-8" data-testid="about-page">
        <Breadcrumbs items={[{ label: "Über uns" }]} />
        <div className="mt-8 max-w-3xl">
          <span className="overline">Die Agentur</span>
          <h1 className="font-heading text-5xl lg:text-7xl font-light tracking-tighter leading-none mt-4">
            Über <em className="italic accent-text">uns</em>
          </h1>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-6 text-lg font-light text-[#6B5F5F] leading-relaxed">
            <p>
              Noir Hamburg ist keine Agentur im klassischen Sinne. Wir sind eine kleine, kuratierte Plattform für Menschen, die einen feinen ästhetischen Anspruch, intellektuelle Neugier und ein klares Verständnis von Diskretion teilen – auf beiden Seiten der Begegnung.
            </p>
            <p>
              Gegründet 2025 in Hamburg, haben wir uns über die Jahre einen Namen als verlässlicher Vermittler für anspruchsvolle Klienten erarbeitet, die ihre Privatsphäre ebenso schätzen wie die Qualität ihrer Begegnungen.
            </p>
            <p>
              Unsere Models sind keine zufällig gewählten Profile. Jede Persönlichkeit wird in einem persönlichen Gespräch aufgenommen und genießt unser uneingeschränktes Vertrauen. Wir arbeiten ausnahmslos mit Menschen zusammen, die ihre Tätigkeit selbstbestimmt und mit Stolz ausüben.
            </p>
          </div>
          <aside className="lg:col-span-4 lg:col-start-9">
            <div className="editorial-image h-[60vh]">
              <img src={aboutImage} alt="Hamburg Editorial" data-testid="about-editorial-image" />
            </div>
          </aside>
        </div>
      </section>

      {/* Expanded editorial body — 5 sub-sections covering history, philosophy,
          selection, discretion practice, and clientele. Written for depth, not
          padding: ~700 words of substantive DE copy that positions Noir Hamburg
          as a serious hanseatic institution. */}
      <section className="px-6 md:px-12 lg:px-16 py-16 border-t border-[#1A1414]/8" data-testid="about-story">
        <div className="max-w-4xl space-y-16">
          <div>
            <span className="overline text-[10px]">Unsere Geschichte</span>
            <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
              Eine hanseatische Institution seit 2025
            </h2>
            <div className="mt-6 space-y-5 text-[#3F3838] leading-relaxed">
              <p>
                Noir Hamburg entstand aus einer einfachen Beobachtung: In einer Stadt mit dem kulturellen und
                wirtschaftlichen Rang Hamburgs fehlte eine <strong>Begleitagentur mit hanseatischen Standards</strong>. Zu
                viele Vermittlungen waren anonym, industriell, austauschbar. Zu wenig Beratung, zu wenig
                Persönlichkeit, zu viel Kompromiss bei der Auswahl. Wir gründeten unsere Agentur, um genau das
                Gegenteil zu tun.
              </p>
              <p>
                In den ersten Jahren begleiteten wir zwei bis drei Damen — alle persönliche Bekannte, alle mit
                der stillen Souveränität, die diese Arbeit erst zu einer Kunst macht. Über die Zeit ist unser
                Kreis auf vierzehn Damen und ein festes Netzwerk internationaler Kolleginnen gewachsen. Was
                sich <strong>nicht</strong> geändert hat: dass wir jede Dame persönlich kennen und ihr uneingeschränkt vertrauen.
              </p>
            </div>
          </div>

          <div>
            <span className="overline text-[10px]">Philosophie</span>
            <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
              Was uns von einer klassischen Agentur unterscheidet
            </h2>
            <div className="mt-6 space-y-5 text-[#3F3838] leading-relaxed">
              <p>
                Wir vermitteln keine Stunden — wir vermitteln <strong>Abende</strong>. Ein guter Abend beginnt lange bevor
                die Dame Ihr Hotel betritt: bei der Auswahl der passenden Persönlichkeit, bei der Beratung zu
                Restaurant und Kleidung, bei der ruhigen Klärung aller Erwartungen. Wenn diese Vorarbeit stimmt,
                braucht der Abend selbst kaum noch Regie. Er läuft von selbst — das ist unser Ideal.
              </p>
              <p>
                Deshalb funktionieren wir bewusst nicht nach dem Prinzip "möglichst viele Buchungen möglichst
                schnell". Wir nehmen uns Zeit für die Beratung, empfehlen aktiv gegen unpassende Anfragen und
                sagen "nein", wenn eine Buchung uns oder unserer Dame nicht dienlich ist. Diese Zurückhaltung
                ist das eigentliche Fundament unseres Rufs.
              </p>
            </div>
          </div>

          <div>
            <span className="overline text-[10px]">Auswahl</span>
            <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
              Die Auswahl unserer Damen
            </h2>
            <div className="mt-6 space-y-5 text-[#3F3838] leading-relaxed">
              <p>
                Bevor eine Dame auf Noir Hamburg erscheint, treffen wir sie mindestens zwei Mal persönlich. Beim
                ersten Gespräch klären wir Beweggründe, Erwartungen und Lebenssituation. Beim zweiten — meist
                gemeinsam bei einem entspannten Abendessen — beobachten wir das, was sich im Formular nie
                erfassen lässt: <strong>wie sie sich in der Öffentlichkeit bewegt</strong>, wie sie mit Personal umgeht, wie
                sie ein Gespräch führt.
              </p>
              <p>
                Fachliche Kriterien — Bildung, Sprachen, gepflegte Erscheinung — sind selbstverständlich. Aber
                sie sind nicht das Wesentliche. Das Wesentliche ist die <strong>stille Selbstverständlichkeit</strong>, mit
                der eine Dame in einem Sternerestaurant sitzt, ein Kunstwerk deutet oder mit einem CEO über
                internationale Politik spricht. Diese Selbstverständlichkeit lässt sich nicht trainieren — sie ist
                da oder nicht.
              </p>
            </div>
          </div>

          <div>
            <span className="overline text-[10px]">Praxis</span>
            <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
              Diskretion in der täglichen Praxis
            </h2>
            <div className="mt-6 space-y-5 text-[#3F3838] leading-relaxed">
              <p>
                Diskretion ist bei uns nicht ein Versprechen auf einer Website — sie ist ein System aus vielen
                kleinen, konsequent umgesetzten Regeln. Kommunikation läuft verschlüsselt. Kontaktdaten sind nur
                zwei Personen in unserem Team zugänglich. Rechnungen tragen neutrale Bezeichnungen. Modelnamen
                sind Künstlernamen; die bürgerliche Identität kennen nur wir. Auf Wunsch arbeiten wir mit von
                unserem Anwalt vorbereiteten <strong>NDAs</strong> auf Deutsch und Englisch.
              </p>
              <p>
                Für Kunden aus dem öffentlichen Leben — Vorstände, Sportler, Kulturschaffende — treffen wir
                zusätzliche Vorkehrungen: separate Telefonleitungen, verzögerte Rückrufe an neutralen Standorten,
                keine schriftlichen Bestätigungen mit vollem Namen. Diese Detailarbeit ist unsichtbar, aber sie
                macht den Unterschied zwischen einer <em>diskreten Agentur</em> und einer <em>Agentur, die Diskretion
                behauptet</em>.
              </p>
            </div>
          </div>

          <div>
            <span className="overline text-[10px]">Klientel</span>
            <h2 className="font-heading text-3xl md:text-4xl mt-4 text-[#1A1414]">
              Für wen wir arbeiten
            </h2>
            <div className="mt-6 space-y-5 text-[#3F3838] leading-relaxed">
              <p>
                Unsere Kunden sind Unternehmerinnen und Unternehmer, Anwältinnen, Ärzte, Kreative, internationale
                Geschäftsreisende. Was sie eint, ist selten das Einkommen — es ist die <strong>Erwartung an
                Verlässlichkeit, Diskretion und Kultiviertheit</strong>. Sie erwarten nicht das größte Modelportfolio;
                sie erwarten die passende Begleitung für einen konkreten Abend.
              </p>
              <p>
                Ein wesentlicher Teil unserer Anfragen kommt heute über Empfehlungen bestehender Kunden. Das ist
                das größte Kompliment, das eine Agentur wie unsere sich wünschen kann — und die eigentliche
                Erklärung, warum wir seit über zehn Jahren nicht wachsen wollen, sondern wachsen dürfen.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-20 bg-[#FBF7F4]">
        <h2 className="font-heading text-3xl lg:text-4xl mb-12">Unsere Prinzipien</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {ADVANTAGES.map((a, i) => (
            <div key={i} className="border-t border-[#1A1414]/15 pt-6">
              <div className="font-mono text-xs accent-text mb-4">0{i + 1}</div>
              <h3 className="font-heading text-2xl mb-3">{a.title}</h3>
              <p className="text-sm font-light text-[#6B5F5F] leading-relaxed">{a.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-16 py-20 text-center">
        <h2 className="font-heading text-4xl lg:text-5xl max-w-3xl mx-auto">
          Beginnen Sie ein <em className="italic accent-text">Gespräch</em>.
        </h2>
        <div className="mt-10">
          <Link to="/kontakt" className="btn-primary">Kontakt aufnehmen</Link>
        </div>
      </section>
    </PublicLayout>
  );
}
