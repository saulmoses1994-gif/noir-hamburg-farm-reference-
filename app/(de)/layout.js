import '../globals.css'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.de'),
  title: {
    default: 'Noir Hamburg — Premium Escort Agency',
    template: '%s | Noir Hamburg',
  },
  description: 'Premium Escort Hamburg — Diskrete Begleitagentur für anspruchsvolle Kunden.',
}

export default function DeRootLayout({ children }) {
  return (
    <html lang="de">
      <body className="font-body bg-white text-[#1A1414] antialiased">
        {children}
      </body>
    </html>
  )
}
