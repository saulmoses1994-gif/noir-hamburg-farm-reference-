export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <span className="overline">404</span>
      <h1 className="font-heading text-5xl mt-4">Seite nicht gefunden</h1>
      <p className="mt-4 text-[#6B5F5F]">Die angeforderte Seite existiert nicht.</p>
      <a href="/" className="btn-primary mt-8">Zurück zur Startseite</a>
    </div>
  )
}
