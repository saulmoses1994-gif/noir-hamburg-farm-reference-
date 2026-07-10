// Server component: emits one or more JSON-LD schema blocks inside <body>.
// Escapes </script and </SCRIPT to be safe against document injection.
export default function JsonLd({ data }) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.filter(Boolean).map((obj, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(obj).replace(/</g, '\\u003c'),
          }}
        />
      ))}
    </>
  )
}
