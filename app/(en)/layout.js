// Route-group layout for the English shell.
// IMPORTANT: Only the root `app/layout.js` may emit `<html>` and `<body>` —
// nesting a second `<html>` here caused SEMrush "language mismatch" and
// hreflang warnings because the rendered document contained two <html lang>
// declarations. This layout must therefore only forward children and set
// route-group-scoped metadata defaults.

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://noir-hamburg.com'),
  title: {
    default: 'Noir Hamburg — Premium Escort Agency Hamburg',
    template: '%s | Noir Hamburg',
  },
  description: 'Premium Escort Hamburg — discreet companion agency for discerning gentlemen.',
}

export default function EnRootLayout({ children }) {
  return children
}
