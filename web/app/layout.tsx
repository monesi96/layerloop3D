import type {Metadata} from 'next'

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.layerloop3d.com'),
  title: {default: 'Layerloop – Stampanti 3D industriali a nastro', template: '%s – Layerloop'},
  description: 'Stampanti 3D industriali a nastro con asse inclinato di 30°. Progettate e costruite in Italia.',
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="it">
      <head>
        <link rel="stylesheet" href="https://use.typekit.net/ahu1nab.css" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600&display=swap" />
        <script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" />
      </head>
      <body>
        <div className="bg" aria-hidden="true">
          <i className="blob b1" /><i className="blob b2" /><i className="blob b3" /><i className="blob b4" /><i className="blob b5" /><i className="blob dodge d1" />
        </div>
        {children}
      </body>
    </html>
  )
}
