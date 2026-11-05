import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  images: {remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}]},
  async redirects() {
    // vecchi URL WordPress -> nuovi percorsi
    return [
      {source: '/layerloop-next', destination: '/stampanti/next', permanent: true},
      {source: '/layerloop-extend', destination: '/stampanti/extend', permanent: true},
      {source: '/layerloop-xe', destination: '/stampanti/xe', permanent: true},
      {source: '/materiali-stampa-3d-2', destination: '/materiali', permanent: true},
      {source: '/layerloop-next-stampante-3d-industriale', destination: '/stampanti/next', permanent: true},
      {source: '/rivenditori-copy', destination: '/rivenditori', permanent: true},
      {source: '/medical_division', destination: '/medical-division', permanent: true},
      {source: '/layerloopacademy', destination: '/layerloop-academy', permanent: true},
      {source: '/settore-automotive', destination: '/settori/automotive', permanent: true},
      {source: '/settore-medico-podologia', destination: '/settori/medical', permanent: true},
      {source: '/settore-nautico', destination: '/settori/nautical', permanent: true},
      {source: '/manufacturing-sector-automation', destination: '/settori/manufacturing', permanent: true},
      {source: '/whitepaper', destination: '/case-study', permanent: true},
      {source: '/whitepaper/:slug', destination: '/case-study/:slug', permanent: true},
    ]
  },
}
export default nextConfig
