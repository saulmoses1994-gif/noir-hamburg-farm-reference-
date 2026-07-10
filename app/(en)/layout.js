import '../globals.css'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.de'),
  title: {
    default: 'Noir Hamburg — Premium Escort Agency Hamburg',
    template: '%s | Noir Hamburg',
  },
  description: 'Premium Escort Hamburg — discreet companion agency for discerning gentlemen.',
}

export default function EnRootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-body bg-white text-[#1A1414] antialiased">
        {children}
      </body>
    </html>
  )
}
